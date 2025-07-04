import { ECompania } from "../enums/Ecompania";

export interface Compania{
   compania:ECompania;
   nroProductor:string;
   claveProductor:string;
   ajuste?:string;
   vigencia?:string;
   //fedpat
   refacturaciones?:number;
   //MA
   periodo?:number;
   cuotas?:number;
   //rus
   vigenciaPolizaIdAuto?:string;
   vigenciaPolizaIdMoto?:string;
   cuotasAuto?:number;
   cuotasMoto?:number;
   //Riv
   cantidadCuotas?:string;
   tipoFacturacion?:string;

   //ATM
   plan?:string;
   codigoVendedor?:string;

}