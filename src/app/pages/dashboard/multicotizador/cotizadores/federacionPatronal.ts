import { formatDate } from "@angular/common";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CondicionesIvaFederacionPatronal, CotizacionFederacion } from "../../../../interfaces/cotizacionfederacion";
import { CompaniaCotizada } from "../../../../interfaces/cotizacion";
import { CodigosPersoneria }from "../../../../utils/utils";
import { Productor } from "../../../../models/productor.model";


const AJUSTE=10;
const SIN_FRANQUICIA=99;
const TODAS_LAS_COBERTURAS="null";
const SIN_RC=99;

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


      const cotizacionFederacion: CotizacionFederacion = {
        //numero_cotizacion: 129445013,
        fecha_desde: fechaFormateada,
        descuento_comision: comision,
        medio_pago: Number(form.medioPago.codigo),
        pago_contado: false,
        razon_social: CodigosPersoneria.Federacion.personaFisica,
        //cliente_nuevo: false,
        refacturaciones: Number(configFedPat?.refacturaciones),
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
          ajuste_automatico: AJUSTE,
          rc_ampliada: SIN_RC, //diferencia entre ajuste automatico y esto
          interasegurado: true,
          rc_conosur:1,
          grua:Boolean(form.grua),
          taller_exclusivo:Boolean(form.tallerExclusivo),
          casco_conosur:true,
          plan: TODAS_LAS_COBERTURAS,
          franquicia: SIN_FRANQUICIA,
        },/*
        producto_modular: {
          cant_modulos: 0,
          codigo_producto: '190001',
          fecha_nacimiento: '13/07/1998'
        },*/
      };

      return cotizacionFederacion;

}

export function construirCotizacionFederacion(coberturas: any[]): CompaniaCotizada {
  const buscarPremio = (...codigos: string[]): number | undefined => {
    for (const codigo of codigos) {
      const cobertura = coberturas.find(c => c.codigo === codigo);
      if (cobertura?.premio_total) {
        return cobertura.premio_total;
      }
    }
    return undefined;
  };

  const companiaCotizada: CompaniaCotizada = {
    compania: 'Federación Patronal',
    rc: buscarPremio('A4'),
    c: buscarPremio('LB1', 'LB1-A'),
    c1: buscarPremio('LB', 'LB-A'),
    d1: buscarPremio('TD3'),
    d2: buscarPremio('TD1'),
    d3: buscarPremio('TD5'),
  };

  return companiaCotizada;
}