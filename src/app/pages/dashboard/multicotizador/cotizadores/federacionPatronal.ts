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
    // por defecto lo incluimos y lo quitamos para moto
    asegura2: [{ ramo: 35, producto: "350001" }]
  };

  if (tipoVehiculo === ETipoVehiculo.VEHICULO && cotizacionFederacion.coberturas) {
    cotizacionFederacion.descuento_comision = SIN_DESCUENTO;
    (cotizacionFederacion.vehiculo as any).alarma = Boolean(form.alarma);
    cotizacionFederacion.coberturas.casco_conosur = true as any;
    cotizacionFederacion.coberturas.rc_conosur = 1 as any;
  } else if (tipoVehiculo === ETipoVehiculo.MOTOVEHICULO) {
    // 🔑 motos: NO debe figurar asegura2
    delete (cotizacionFederacion as any).asegura2;
  }

  console.log("Enviar a federacion:", cotizacionFederacion);
  return cotizacionFederacion;
}


/**
 * Construye un parcial de CompaniaCotizada a partir de coberturas y la franquicia solicitada.
 * - Llena rc, c, c1 si están presentes en la respuesta.
 * - Setea d1/d2/d3 según franquicia (2/4/6%).
 */

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
    if (f === franquiciaDosPorCiento) return '2%';
    if (f === franquiciaCuatroPorCiento) return '4%';
    if (f === franquiciaSeisPorCiento)  return '6%';
    return '';
  })();

  const toSentence = (s?: string) => {
    const t = (s ?? '').trim().toLowerCase();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
  };

  /** Arma "CODE: Descripción [extra1] - AJUSTE X" */
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
    // siempre agregamos el ajuste si hay dato
    if (ajusteStr) parts.push(` - ajuste ${ajusteStr}`)
    else parts.push(` - Sin ajuste`)

    const tail = parts.length ? ` ${parts.join('')}` : '';
    return `Plan ${code}: ${human}${tail}`.trim();
  };



  // 1) Armo detallesPorCodigo con TODO lo que venga
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

  // 2) Defino rol->codigo según tipo y disponibilidad real en la respuesta
  const tiene = (code: string) => !!detallesPorCodigo[norm(code)];
  const pick = (...codes: string[]) => {
    for (const c of codes) if (tiene(c)) return norm(c);
    return undefined;
  };

  const rol2codigo: NonNullable<CompaniaCotizada['rol2codigo']> = {};
  const rol2tooltip: NonNullable<CompaniaCotizada['rol2tooltip']> = {};

  // RC
  rol2codigo.rc = pick('A4'); // Federación usa A4 para RC
  if (rol2codigo.rc) {
    rol2tooltip.rc = tipFor(rol2codigo.rc);
  }

  // C / C1 (auto)  o  B / B1 (moto), con fallback si no vienen B/B1
  if (isMoto) {
    rol2codigo.c  = pick('B', 'C');
    rol2codigo.c1 = pick('B1', 'C1');
  } else {
    rol2codigo.c  = pick('C');
    rol2codigo.c1 = pick('C1');
  }

  if (rol2codigo.c)  rol2tooltip.c  = tipFor(rol2codigo.c);
  if (rol2codigo.c1) rol2tooltip.c1 = tipFor(rol2codigo.c1);

  // TR fija mapeada por franquicia (TD3 es el plan)
  const franq = Number(franquicia || 0);
  const td3 = pick('TD3'); // puede no venir en motos; no pasa nada si falta
  if (td3) {
    if (franquicia === franquiciaDosPorCiento) {
      rol2codigo.d1 = td3;
      rol2tooltip.d1 = tipFor(td3, [pctFromFranq]); // "2%" + " - AJUSTE ..."
    }
    if (franquicia === franquiciaCuatroPorCiento) {
      rol2codigo.d2 = td3;
      rol2tooltip.d2 = tipFor(td3, [pctFromFranq]); // "4%" + " - AJUSTE ..."
    }
    if (franquicia === franquiciaSeisPorCiento) {
      rol2codigo.d3 = td3;
      rol2tooltip.d3 = tipFor(td3, [pctFromFranq]); // "6%" + " - AJUSTE ..."
    }
  }

  // 3) Cargo los importes visibles usando rol2codigo
  const premio = (rol?: keyof typeof rol2codigo): number | undefined => {
    const code = rol ? rol2codigo[rol] : undefined;
    return code ? detallesPorCodigo[code]?.premio : undefined;
  };

  const parcial: Partial<CompaniaCotizada> = {
    compania: 'Federación Patronal',
    // importes “clásicos” de tu fila:
    rc: premio('rc'),
    c:  premio('c'),
    c1: premio('c1'),
    d1: premio('d1'),
    d2: premio('d2'),
    d3: premio('d3'),

    // mapas para tooltips/UI desacoplada
    detallesPorCodigo,
    rol2codigo,
    rol2tooltip,
  };

  // (Opcional) Si todavía usás `detalles` por claves genéricas, lo completamos liviano:
  // Map de códigos propios → claves genéricas tuyas
  const mapCodigoAKey: Record<string, CoberturaKey> = {
    'A4': 'rc',
    'C':  'c',
    'C1': 'c1',
    'B':  'b',
    'B1': 'b1',
    'TD3':'td3',
    'TD': 'td',
    'TD1':'td1',
    'CF': 'cf',
    'E':  'e',
    'E1': 'e1',
    'LB': 'lb',
    'LB1':'lb1',
  };
  const detalles: NonNullable<CompaniaCotizada['detalles']> = {};
  for (const [code, info] of Object.entries(detallesPorCodigo)) {
    const key = mapCodigoAKey[norm(code)];
    if (key) detalles[key] = info;
  }
  if (Object.keys(detalles).length) (parcial as any).detalles = detalles;

  return parcial;
}




/**
 * Fusiona el objeto base (si existe) con un parcial, sin pisar valores ya definidos.
 * Devuelve el objeto CompaniaCotizada final para la fila “Federación Patronal”.
 */
export function mergeCotizacionFederacion(
  base: CompaniaCotizada | undefined,
  parcial: Partial<CompaniaCotizada>
): CompaniaCotizada {
  const inicial: CompaniaCotizada = base ?? { compania: 'Federación Patronal' };

  return {
    ...inicial,
    compania: 'Federación Patronal',

    // montos visibles (no pisar lo que ya esté en base):
    rc: inicial.rc ?? parcial.rc,
    c:  inicial.c  ?? parcial.c,
    c1: inicial.c1 ?? parcial.c1,
    d1: inicial.d1 ?? parcial.d1,
    d2: inicial.d2 ?? parcial.d2,
    d3: inicial.d3 ?? parcial.d3,

    // mapas (merge no destructivo)
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
    // si hay `detalles` genérico:
    detalles: {
      ...(inicial.detalles ?? {}),
      ...(parcial.detalles ?? {}),
    },
  };
}
