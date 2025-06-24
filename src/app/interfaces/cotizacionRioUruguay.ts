export interface CotizacionRioUruguay{
  codigoProductor:number;
  vehiculos:VehiculosRus[];
  codigoTipoInteres:string,
  condicionFiscal: string;
  codigoSolicitante?: number;
  codigoCobrador?:string;
  medioCobro?:number;
  cuotas?: number;
  ajusteAutomatico?: number;
  tipoVigencia?: string;
  vigenciaDesde:string;
  vigenciaHasta?:string;
  vigenciaPolizaId?:number;
  numeroSolicitud?: number;
  sumaAseguradaGnc?:number;
  sumaAseguradaAccesorios?:number;
  controlSatelital?:string;
  excluirVida?:string;
  aumentoRCPaisesLimitrofes?:string;

}

export enum CondicionFiscalRus{
  CF="CF",
  EX="EX",
  FM="FM",
  GC="GC",
  RI='RI',
  RMT='RMT',
  RNI='RNI',
  SSF='SSF',
  CDE='CDE'
}

export interface VigenciaRus {
  id: number;
  descripcion: string;
  cantidadDias: number | null;
  cantidadMeses: number | null;
  toleranciaInferior: number;
  toleranciaSuperior: number;
  descripcionPeriodoFacturacion: string;
  cantidadMesesFacturacion: number;
}

export interface VehiculoRioUruguay{
  id:number;
  descripcion:string;
}

export interface TipoVehiculoRUS{
  id:number;
  nombre:string;
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
