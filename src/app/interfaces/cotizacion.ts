export interface Cotizacion {
  nroCotizacion?:number;
  compania: string;
  rc?: number;
  c?: number;
  c1?: number;
  d1?: number;
  d2?: number;
  d3?: number;
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
