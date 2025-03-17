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

export interface VehiculoRioUruguay{
  id:number;
  descripcion:string;
}

export interface VehiculosRus
{
  anio:string;
  uso:string;
  controlSatelital?:string;
  cpLocalidadGuarda?: number;
  gnc:string;
  modeloVehiculo?: number; //modelo vehiculo o codia
  codia?:number;
  localidadGuarda?: number;
  sumaAseguradaVehiculo?: number;
  sumaAseguradaGnc?: number;
  sumaAseguradaAccesorios?: number;
  rastreadorSatelital?: string;
  rastreoACargoRUS?: string;
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
