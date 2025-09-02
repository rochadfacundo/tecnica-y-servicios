import { CompaniaCotizada } from "./companiaCotizada";

export interface Cotizacion {
  nroCotizacion?:number;
  companiasCotizadas: CompaniaCotizada[];
}



export interface CotizacionATM {
  codigo: string;
  descripcion: string;
  prima: number;
  premio: number;
  cuotas: number;
  impcuotas: number;
  ajuste: string;
  formapago: string;
  plan_cot: string;
  solicitud_glm: string;
  comision?: number;
}
