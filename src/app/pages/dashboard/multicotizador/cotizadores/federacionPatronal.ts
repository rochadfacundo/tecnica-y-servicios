import { formatDate } from "@angular/common";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CondicionesIvaFederacionPatronal, CotizacionFederacion } from "../../../../interfaces/cotizacionfederacion";
import { CodigosPersoneria } from "../../../../utils/utils";
import { Productor } from "../../../../models/productor.model";
import { ETipoVehiculo } from "../../../../enums/tipoVehiculos";
import { CoberturaDet, CoberturaKey, CompaniaCotizada } from "../../../../interfaces/companiaCotizada";

const AJUSTE = 10;
const TODAS_LAS_COBERTURAS = "null";
const SIN_VALOR = 99;
const SIN_DESCUENTO = 0;

export const sinFranquicia=99;
export const franquiciaDosPorCiento = 102;  // TR 2%
export const franquiciaCuatroPorCiento = 104; // TR 4%
export const franquiciaSeisPorCiento = 106;  // TR 6%
export const franquiciaUnPorCiento = 101;  // TR 1%

type Plan = {
  codigo: string;
  descripcion?: string;
  premio_total?: number;
  monto_cuota_total?: number;
};

export function buildFederacionRequest(
  form: CotizacionFormValue,
  infoauto: number,
  productor: Productor,
  tipoVehiculo: string,
  franquicia: number
): CotizacionFederacion {
  const configFedPat = productor.companias?.find(c => c.compania === 'FEDERACION PATRONAL');
  const rastreador = form.rastreador ? Number((form.rastreador as any)?.codigo) : SIN_VALOR;

  const fechaOriginal = form.vigenciaDesde;
  const fechaFormateada = formatDate(fechaOriginal, 'dd/MM/yyyy', 'en-AR');

  let cotizacionFederacion: CotizacionFederacion = {
    fecha_desde: fechaFormateada,
    medio_pago: Number((form.medioPago as any).codigo),
    descuento_comision: SIN_DESCUENTO,
    pago_contado: false,
    razon_social: CodigosPersoneria.Federacion.personaFisica,
    refacturaciones: Number(configFedPat?.refacturaciones),
    contratante: {
      id: Number(form.nroId),
      tipo_id: form.tipoId,
      nombre: form.nombre,
      apellido: form.apellido,
      condicion_iva: CondicionesIvaFederacionPatronal.CONSUMIDOR_FINAL,
    },
    vehiculo: {
      infoauto: String(infoauto),
      anio: String(form.anio),
      tipo_vehiculo: SIN_VALOR,
      rastreador,
      gnc: Boolean(form.tieneGnc),
      localidad_de_guarda: SIN_VALOR,
    },
    coberturas: {
      ajuste_automatico: AJUSTE,
      rc_ampliada: SIN_VALOR,
      interasegurado: true,
      grua: Boolean(form.grua),
      taller_exclusivo: Boolean(form.tallerExclusivo),
      plan: TODAS_LAS_COBERTURAS,
      franquicia: franquicia,
    },
  };

  if (tipoVehiculo === ETipoVehiculo.VEHICULO && cotizacionFederacion.coberturas) {
    cotizacionFederacion.descuento_comision = SIN_DESCUENTO;
    (cotizacionFederacion.vehiculo as any).alarma = Boolean(form.alarma);
    cotizacionFederacion.coberturas.casco_conosur = true as any;
    cotizacionFederacion.coberturas.rc_conosur = 1 as any;
  } else if (tipoVehiculo === ETipoVehiculo.MOTOVEHICULO) {
    delete (cotizacionFederacion as any).asegura2;
  }

  console.log("Enviar a federacion:", cotizacionFederacion);
  return cotizacionFederacion;
}

export function construirCotizacionFederacion(
  planes: Plan[],
  franquicia?: number,
  tipoVehiculo?: 'VEHICULO' | 'MOTOVEHICULO' | string,
  ajusteAutomatico?: number
): Partial<CompaniaCotizada> {
  const isMoto = (tipoVehiculo ?? '').toUpperCase() === 'MOTOVEHICULO';

  const norm = (s?: string) => (s ?? '').toUpperCase().trim();
  const toNum = (v: any): number | undefined => {
    if (v == null || v === '') return undefined;
    const str = String(v).replace(',', '.');
    const n = Number(str);
    return Number.isFinite(n) ? n : undefined;
  };

  const ajusteStr = (() => {
    const v = Number(ajusteAutomatico);
    if (!Number.isFinite(v)) return '';
    if (v === SIN_VALOR) return undefined;
    return `${v}%`;
  })();

  const pctFromFranq = (() => {
    const f = Number(franquicia || 0);
    if (f === franquiciaUnPorCiento) return '1%';
    if (f === franquiciaDosPorCiento) return '2%';
    if (f === franquiciaCuatroPorCiento) return '4%';
    if (f === franquiciaSeisPorCiento)  return '6%';
    return '';
  })();

  const toSentence = (s?: string) => {
    const t = (s ?? '').trim().toLowerCase();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
  };

  const tipFor = (code?: string, extras?: string[]) => {
    if (!code) return '';
    const raw = detallesPorCodigo[code]?.descripcion ?? '';
    const human = toSentence(raw || code);

    const parts: string[] = [];
    if (Array.isArray(extras)) {
      for (const e of extras) {
        const s = (e ?? '').trim();
        if (s) parts.push(s);
      }
    }
    if (ajusteStr) parts.push(` - ajuste ${ajusteStr}`);
    else parts.push(` - Sin ajuste`);

    const tail = parts.length ? ` ${parts.join('')}` : '';
    return `Plan ${code}: ${human}${tail}`.trim();
  };

  const detallesPorCodigo: Record<string, CoberturaDet> = {};
  for (const p of planes ?? []) {
    const code = norm(p.codigo);
    if (!code) continue;
    detallesPorCodigo[code] = {
      codigo: code,
      descripcion: p.descripcion,
      premio: toNum(p.premio_total),
      cuota: toNum(p.monto_cuota_total),
    };
  }

  const tiene = (code: string) => !!detallesPorCodigo[norm(code)];
  const pick = (...codes: string[]) => {
    for (const c of codes) if (tiene(c)) return norm(c);
    return undefined;
  };

  const rol2codigo: NonNullable<CompaniaCotizada['rol2codigo']> = {};
  const rol2tooltip: NonNullable<CompaniaCotizada['rol2tooltip']> = {};

  // RC
  rol2codigo.rc = pick('A4');
  if (rol2codigo.rc) {
    rol2tooltip.rc = tipFor(rol2codigo.rc);
  }

  // C / C1 (auto) + B / B1
  if (isMoto) {
    rol2codigo.c  = pick('B', 'C');
    rol2codigo.c1 = pick('B1', 'C1');
  } else {
    rol2codigo.c  = pick('C');
    rol2codigo.c1 = pick('CF');
    rol2codigo.b1 = pick('B1');
    rol2codigo.b2 = pick('B');
  }

  if (rol2codigo.c)   rol2tooltip.c  = tipFor(rol2codigo.c);
  if (rol2codigo.c1)  rol2tooltip.c1 = tipFor(rol2codigo.c1);
  if (rol2codigo.b1)  rol2tooltip.b1 = tipFor(rol2codigo.b1);
  if (rol2codigo.b2)  rol2tooltip.b2 = tipFor(rol2codigo.b2);

  // TR (franquicias)
  const td3 = pick('TD3');
  if (td3) {
    if (franquicia === franquiciaUnPorCiento) {
      rol2codigo.d1 = td3;
      rol2tooltip.d1 = tipFor(td3, [pctFromFranq]);
    }
    if (franquicia === franquiciaDosPorCiento) {
      rol2codigo.d2 = td3;
      rol2tooltip.d2 = tipFor(td3, [pctFromFranq]);
    }
    if (franquicia === franquiciaCuatroPorCiento) {
      rol2codigo.d3 = td3;
      rol2tooltip.d3 = tipFor(td3, [pctFromFranq]);
    }
    if (franquicia === franquiciaSeisPorCiento) {
      rol2codigo.d4 = td3;
      rol2tooltip.d4 = tipFor(td3, [pctFromFranq]);
    }
  }

  // ✅ Corregido: aceptar cualquier rol string, no solo keyof
  const premio = (rol?: string): number | undefined => {
    const code = rol ? (rol2codigo as any)[rol] : undefined;
    return code ? detallesPorCodigo[code]?.premio : undefined;
  };

  const parcial: Partial<CompaniaCotizada> = {
    compania: 'Federación Patronal',
    rc: premio('rc'),
    b1: premio('b1'),
    b2: premio('b2'),
    c:  premio('c'),
    c1: premio('c1'),
    d1: premio('d1'),
    d2: premio('d2'),
    d3: premio('d3'),
    d4: premio('d4'),
    detallesPorCodigo,
    rol2codigo,
    rol2tooltip,
  };

    // 🔍 Log detallado para debug
    console.log("⚡ [Federación Patronal] CompaniaCotizada construida:", {
      rc: parcial.rc,
      b1: parcial.b1,
      b2: parcial.b2,
      c: parcial.c,
      c1: parcial.c1,
      d1: parcial.d1,
      d2: parcial.d2,
      d3: parcial.d3,
      d4: parcial.d4,
      rol2codigo,
      rol2tooltip,
      detallesPorCodigo
    });


  return parcial;
}


export function mergeCotizacionFederacion(
  base: CompaniaCotizada | undefined,
  parcial: Partial<CompaniaCotizada>
): CompaniaCotizada {
  const inicial: CompaniaCotizada = base ?? { compania: 'Federación Patronal' };

  return {
    ...inicial,
    compania: 'Federación Patronal',

    rc: parcial.rc ?? inicial.rc,
    b1: parcial.b1 ?? inicial.b1,
    b2: parcial.b2 ?? inicial.b2,
    c:  parcial.c  ?? inicial.c,
    c1: parcial.c1 ?? inicial.c1,
    d1: parcial.d1 ?? inicial.d1,
    d2: parcial.d2 ?? inicial.d2,
    d3: parcial.d3 ?? inicial.d3,
    d4: parcial.d4 ?? inicial.d4,

    detallesPorCodigo: {
      ...(inicial.detallesPorCodigo ?? {}),
      ...(parcial.detallesPorCodigo ?? {}),
    },
    rol2codigo: {
      ...(inicial.rol2codigo ?? {}),
      ...(parcial.rol2codigo ?? {}),
    },
    rol2tooltip: {
      ...(inicial.rol2tooltip ?? {}),
      ...(parcial.rol2tooltip ?? {}),
    },
    detalles: {
      ...(inicial.detalles ?? {}),
      ...(parcial.detalles ?? {}),
    },
  };
}

