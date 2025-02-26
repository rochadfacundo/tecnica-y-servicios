export interface CotizacionRioUruguay{
  codigoProductor:number;
  codigoSolicitante: number;
  codigoTipoInteres:string,
  cuotas:number;
  condicionFiscal:string;
  vehiculos:VehiculosRus[];
  vigenciaDesde:string;
  vigenciaHasta:string;
  vigenciaPolizaId:number;

}

export interface VehiculosRus
{
  anio:string;
  controlSatelital:string;
  cpLocalidadGuarda:number;
  gnc:string;
  modeloVehiculo:number;
  uso:string;
  codia?:number;
}
