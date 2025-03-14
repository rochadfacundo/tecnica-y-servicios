export interface CotizacionRioUruguay{
  codigoProductor:number;
  vehiculos:VehiculosRus[];
  codigoTipoInteres:string,
  condicionFiscal: string;
  codigoSolicitante?: number;
  codigoCobrador?:string;
  cuotas?: number;
  ajusteAutomatico?: number;
  tipoVigencia?: string;
  vigenciaDesde:string;
  vigenciaHasta?:string;
  vigenciaPolizaId:number;
  numeroSolicitud?: number;

}

export interface VehiculosRus
{
  anio:string;
  uso:string;
  controlSatelital?:string;
  cpLocalidadGuarda?: number;
  gnc:string;
  modeloVehiculo?: number;
  codia?:number;
  localidadGuarda?: number;
  sumaAseguradaVehiculo?: number;
  sumaAseguradaGnc?: number;
  sumaAseguradaAccesorios?: number;
  rastreadorSatelital?: string;
  rastreoACargoRUS?: string;
}
