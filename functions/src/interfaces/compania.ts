
export interface Compania{
   compania:ECompania;
   nroProductor:string;
   claveProductor:string;
   ajuste?:string;
   vigencia?:string;
   refacturacion?:string;
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
