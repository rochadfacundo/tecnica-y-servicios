
export interface Compania{
  compania:ECompania;
  nroProductor:string;
  claveProductor:string;
  ajuste?:string;
  vigencia?:string;
  // fedpat
  refacturaciones?:number;
  // MA
  periodo?:number;
  cuotas?:number; // tambien rus
  // rus
  vigenciaPolizaId?:string;
  // Riv
  cantidadCuotas?:string;
  tipoFacturacion?:string;
  // ATM
  plan?:string;
  codigoVendedor?:string;
}

export enum ECompania{

  RIO_URUGUAY="RIO URUGUAY",
  RIVADAVIA="RIVADAVIA",
  MERCANTIL_ANDINA="MERCANTIL ANDINA",
  FEDERACION_PATRONAL="FEDERACION PATRONAL",
  ATM="ATM",
  HDI="HDI",
  DIGNA="DIGNA"
}
