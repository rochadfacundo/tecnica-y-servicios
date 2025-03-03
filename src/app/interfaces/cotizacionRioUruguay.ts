export interface CotizacionRioUruguay{
  codigoProductor:number;
  codigoSolicitante: number;
  codigoTipoInteres:string,
  cuotas:number;
  ajusteAutomatico:number;
  condicionFiscal:string;
  tipoVigencia:string;
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

export interface RusCotizado {
  id: number | null;
  responsabilidadCivil: string | null;
  descripcionComercial: string;
  numeroSolicitud: string | null;
  codigoRC: string;
  descripcionRC: string;
  detalleCoberturaRC: string;
  codigoCasco: string;
  descripcionCasco: string;
  detalleCoberturaCasco: string;
  prima: number;
  premio: number;
  iva: number;
  sumaAsegurada: number;
  ajusteAutomatico: string;
  ajustesAutomaticosPosibles: string[];
  franquicia: number;
  auxilioMecanico: string;
  paisesLimitrofes: string;
  coberturaVida: string;
}
