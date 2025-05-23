import { ECompania } from "../enums/Ecompania";

export interface Compania{
   compania:ECompania;
   nroProductor:string;
   claveProductor:string;
   ajuste?:string;
   vigencia?:string;
   refacturacion?:string;
}
