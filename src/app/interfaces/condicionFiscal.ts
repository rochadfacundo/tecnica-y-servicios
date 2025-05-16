import { CondicionFiscalCodigo } from "../enums/condicion";

export interface CondicionFiscal
{
  id:number;
  descripcion:string;
  cfFedRusATM:CondicionFiscalCodigo;
  cfMercantil?:number;
  cfRivadavia?:string;

}
