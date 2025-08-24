import { formatDate } from "@angular/common";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CondicionesIvaFederacionPatronal, CotizacionFederacion } from "../../../../interfaces/cotizacionfederacion";
import { CompaniaCotizada } from "../../../../interfaces/cotizacion";
import { CodigosPersoneria } from "../../../../utils/utils";
import { Productor } from "../../../../models/productor.model";
import { ETipoVehiculo } from "../../../../enums/tipoVehiculos";

const AJUSTE = 10;
const TODAS_LAS_COBERTURAS = "null";
const SIN_VALOR = 99;
const SIN_DESCUENTO = 0;

export const sinFranquicia=99;
export const franquiciaDosPorCiento = 102;  // TR 2%
export const franquiciaCuatroPorCiento = 104; // TR 4%
export const franquiciaSeisPorCiento = 106;  // TR 6%

type ClaveFranquicia = 'd1' | 'd2' | 'd3';
function mapFranquiciaToKey(f: number): ClaveFranquicia {
  switch (f) {
    case franquiciaDosPorCiento:    return 'd1'; // 2%
    case franquiciaCuatroPorCiento: return 'd2'; // 4%
    case franquiciaSeisPorCiento:   return 'd3'; // 6%
    default:                        return 'd1';
  }
}

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
  coberturas: any[],
  franquicia: number,                          // 102 | 104 | 106 (solo autos)
  tipoVehiculo: string
): Partial<CompaniaCotizada> {
  const buscarPremio = (codigo: string): number | undefined => {
    const cobertura = coberturas?.find(
      (c: any) => String(c.codigo).toUpperCase() === codigo.toUpperCase()
    );
    const v = cobertura?.premio_total;
    return v != null ? Number(v) : undefined;
  };

  // Mapas según tipo de vehículo
  // - Para autos: C y CF (como tenías)
  // - Para motos: B (→C) y B1 (→C1)
  const codigoC  = tipoVehiculo === 'MOTOVEHICULO' ? 'B1'  : 'C1';
  const codigoC1 = tipoVehiculo === 'MOTOVEHICULO' ? 'B' : 'C';

  const parcial: Partial<CompaniaCotizada> = {
    rc: buscarPremio('A4'),
    c:  buscarPremio(codigoC),
    c1: buscarPremio(codigoC1),
  };

  // TR fija: siempre TD3, pero SOLO para autos (no aplicar franquicia en motos)
  if (tipoVehiculo === 'VEHICULO') {
    const premioTR = buscarPremio('TD3');

    // mapa 102→d1, 104→d2, 106→d3
    const key =
      franquicia === 102 ? 'd1' :
      franquicia === 104 ? 'd2' :
      franquicia === 106 ? 'd3' :
      undefined;

    if (key && premioTR !== undefined) {
      (parcial as any)[key] = premioTR;
    }
  }

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
  const inicial: CompaniaCotizada = base ?? {
    compania: 'Federación Patronal',
    rc: undefined,
    c: undefined,
    c1: undefined,
    d1: undefined,
    d2: undefined,
    d3: undefined
  };

  return {
    ...inicial,
    compania: 'Federación Patronal',
    rc: inicial.rc ?? parcial.rc,
    c:  inicial.c  ?? parcial.c,
    c1: inicial.c1 ?? parcial.c1,
    d1: parcial.d1 ?? inicial.d1,
    d2: parcial.d2 ?? inicial.d2,
    d3: parcial.d3 ?? inicial.d3,
  };
}
