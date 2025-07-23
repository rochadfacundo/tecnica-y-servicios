import { formatDate } from "@angular/common";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CondicionesIvaFederacionPatronal, CotizacionFederacion } from "../../../../interfaces/cotizacionfederacion";
import { CompaniaCotizada } from "../../../../interfaces/cotizacion";
import { CodigosPersoneria }from "../../../../utils/utils";
import { Productor } from "../../../../models/productor.model";
import { TipoVehiculo } from "../../../../enums/tipoVehiculos";


const AJUSTE=10;
const TODAS_LAS_COBERTURAS="null";
const SIN_VALOR=99;
const SIN_DESCUENTO=0;

export function buildFederacionRequest(
  form: CotizacionFormValue,
  infoauto:number,
  productor:Productor,
  tipoVehiculo:string
)
: CotizacionFederacion{
  const configFedPat = productor.companias?.find(c => c.compania === 'FEDERACION PATRONAL');
      let rastreador= form.rastreador? Number(form.rastreador?.codigo): 99;

      const fechaOriginal = form.vigenciaDesde;
      const fechaFormateada = formatDate(fechaOriginal, 'dd/MM/yyyy', 'en-AR');


      let cotizacionFederacion: CotizacionFederacion = {
        //numero_cotizacion: 129445013,
        fecha_desde: fechaFormateada,
        medio_pago: Number(form.medioPago.codigo),
        descuento_comision: SIN_DESCUENTO,
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
          tipo_vehiculo: SIN_VALOR,
          rastreador:rastreador,
          gnc: Boolean(form.tieneGnc),
          //volcador: false,
         // suma_asegurada: 8800000,
          localidad_de_guarda: SIN_VALOR,
        },
        coberturas: {
          ajuste_automatico: AJUSTE,//AJUSTE,
          rc_ampliada: SIN_VALOR, //diferencia entre ajuste automatico y esto
          interasegurado: true,
          grua:Boolean(form.grua),
          taller_exclusivo:Boolean(form.tallerExclusivo),
          plan: TODAS_LAS_COBERTURAS,
          franquicia: SIN_VALOR,
        },/*
        producto_modular: {
          cant_modulos: 0,
          codigo_producto: '190001',
          fecha_nacimiento: '13/07/1998'
        },*/
      };

      if(tipoVehiculo==TipoVehiculo.VEHICULO && cotizacionFederacion.coberturas)
      {
        cotizacionFederacion.descuento_comision= SIN_DESCUENTO;
        cotizacionFederacion.vehiculo.alarma= Boolean(form.alarma);
        cotizacionFederacion.coberturas.casco_conosur= true;
        cotizacionFederacion.coberturas.rc_conosur=1;
      }


      console.log("Enviar a federacion:",cotizacionFederacion);
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
    c: buscarPremio('C'),
    c1: buscarPremio('CF'),
    d1: buscarPremio('TD3'), // aca un porcentaje 2%
    d2: buscarPremio('TD3'), // aca otro 4%
    d3: buscarPremio('TD3'), // 6%
  };

  return companiaCotizada;
}
