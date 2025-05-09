import { CondicionFiscalCodigo, CondicionIVA } from "../enums/condicion";

export interface CondicionFiscal
{
  id:number;
  condicion:CondicionFiscalCodigo;
  descripcion:string;
  ivaMercantil?:number;
  condicionIVARivadavia?:CondicionIVA;

}
