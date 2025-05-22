export interface Cotizacion {
  compania: string;
  rc?: number;
  mb?: number;
  mplus?: number;
  tr1?: number;
  tr2?: number;
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
}
