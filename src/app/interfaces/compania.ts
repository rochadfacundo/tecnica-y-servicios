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
   cuotas?:number; //tambien rus
   //rus
   vigenciaPolizaIdAuto?:string;
   vigenciaPolizaIdMoto?:string;
   //Riv
   cantidadCuotas?:string;
   tipoFacturacion?:string;

   //ATM
   plan?:string;
   codigoVendedor?:string;

}