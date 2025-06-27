import { formatDate } from "@angular/common";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CondicionesIvaFederacionPatronal, CotizacionFederacion } from "../../../../interfaces/cotizacionfederacion";
import { Cotizacion } from "../../../../interfaces/cotizacion";
import { CodigosPersoneria, getRandomNumber } from "../utils/utils";
import { Productor } from "../../../../models/productor.model";


// Armar el request para cotizar federacion
export function buildFederacionRequest(
  form: CotizacionFormValue,
  infoauto:number,
  tipoVehiculo:any,
  codPostal:any,
  productor:Productor)
: CotizacionFederacion{
  const configFedPat = productor.companias?.find(c => c.compania === 'FEDERACION PATRONAL');
      let rastreador= form.rastreador? Number(form.rastreador?.codigo): 99;
      let comision= form.descuentoComision? Number(form.descuentoComision.codigo):0;
      const fechaOriginal = form.vigenciaDesde;
      const fechaFormateada = formatDate(fechaOriginal, 'dd/MM/yyyy', 'en-AR');
      const AJUSTE=10;
      const todasLasCoberturas="null";

      const cotizacionFederacion: CotizacionFederacion = {
        //numero_cotizacion: 129445013,
        fecha_desde: fechaFormateada,
        descuento_comision: comision,
        medio_pago: Number(form.medioPago.codigo),
        pago_contado: false,
        razon_social: CodigosPersoneria.Federacion.personaFisica,
        //cliente_nuevo: false,
        refacturaciones: configFedPat?.refacturaciones,
        contratante: {
          id: Number(form.nroId),
          tipo_id: form.tipoId,
         // cuit: '20352928587',
          nombre: form.nombre,
          apellido: form.apellido,
          condicion_iva: CondicionesIvaFederacionPatronal.CONSUMIDOR_FINAL,
          //localidad: 0,
          //matricula: '1125554'
        },
        vehiculo: {
          infoauto: String(infoauto),
          anio: String(form.anio),
          tipo_vehiculo: tipoVehiculo,
          alarma: Boolean(form.alarma),
          rastreador:rastreador,
          gnc: Boolean(form.tieneGnc),
          //volcador: false,
          //suma_asegurada: 1200000,
          localidad_de_guarda: Number(codPostal)
        },
        coberturas: {
          ajuste_automatico: AJUSTE, //en mensuales hasta 10,
          rc_ampliada: 99, //diferencia entre ajuste automatico y esto
          interasegurado: true, //siempre true
          rc_conosur:1,
          grua:Boolean(form.grua),
          taller_exclusivo:Boolean(form.tallerExclusivo),
          casco_conosur:true,
          plan: todasLasCoberturas,
          franquicia: 1, //cambiar dsp
        },/*
        producto_modular: {
          cant_modulos: 0,
          codigo_producto: '190001',
          fecha_nacimiento: '13/07/1998'
        },*/
      };

      return cotizacionFederacion;

}

export function construirCotizacionFederacion(coberturas: any[]): Cotizacion {
  const buscarPremio = (codigo: string): number | undefined => {
    const cobertura = coberturas.find(c => c.codigo === codigo);
    return cobertura ? cobertura.premio_total : undefined;
  };

  const cotizacion: Cotizacion = {
    nroCotizacion: getRandomNumber(),
    compania: 'Federación Patronal',
    rc: buscarPremio('A4'),
    c: buscarPremio('LB1'),
    c1: buscarPremio('LB'),
    d1: buscarPremio('TD3'),
    d2: buscarPremio('TD1'),
  };

  return cotizacion;
}
