import { Compania } from "./compania";

export interface Productor {
  uid?: string;
  password?:string;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
  companias:Compania[];
}
