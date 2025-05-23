import { formatDate } from "@angular/common";
import { CotizacionFormValue } from "../../../interfaces/cotizacionFormValue";
import { CotizacionFederacion } from "../../../interfaces/cotizacionfederacion";
import { Cotizacion } from "../../../interfaces/cotizacion";

// Armar el request para cotizar federacion
export function buildFederacionRequest(form: CotizacionFormValue,infoauto:number,tipoVehiculo:any,codPostal:any)
: CotizacionFederacion{

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
        razon_social: Number(form.tipoPersoneria.codigo),
        //cliente_nuevo: false,
        refacturaciones: Number(form.tipoRefacturacion?.codigo),
        contratante: {
          id: Number(form.nroId),
          tipo_id: form.tipoId,
         // cuit: '20352928587',
          nombre: form.nombre,
          apellido: form.apellido,
          condicion_iva: form.condicionFiscal.cfFedRusATM,
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
          ajuste_automatico: 99, //en mensuales hasta 10,
          rc_ampliada: 99, //diferencia entre ajuste automatico y esto
          interasegurado: true, //siempre true
          rc_conosur:1,
          grua:Boolean(form.grua),
          taller_exclusivo:Boolean(form.tallerExclusivo),
          casco_conosur:true,
          plan: "null",
          franquicia: Number(form.franquicia.codigo),
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
    compania: 'Federación Patronal',
    rc: buscarPremio('A4'),
    mb: buscarPremio('LB1'),
    mplus: buscarPremio('LB'),
    tr1: buscarPremio('TD3'),
    tr2: buscarPremio('TD1'),
  };

  return cotizacion;
}
