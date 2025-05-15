import { CondicionFiscalCodigo } from "../enums/condicion";

export interface CondicionFiscal
{
  id:number;
  descripcion:string;
  cfFedRus:CondicionFiscalCodigo;
  cfMercantil?:number;
  cfRivadavia?:string;

}
