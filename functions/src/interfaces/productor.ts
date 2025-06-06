/* eslint-disable @typescript-eslint/no-explicit-any */
import { Compania } from "./compania";

export interface Productor {
  uid?: string;
  nombre: string;
  apellido: string;
  email: string;
  password?:string;
  role: string;
  companias?:Compania[];
  creadoEn?: any;
  actualizadoEn?: any;
}
