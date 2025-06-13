import { Compania } from "./compania";
import { Cotizacion } from "./cotizacion";

export interface RegisterUserDTO {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  role: Role;
  companias?:Compania[];
  cotizaciones?:Cotizacion[];
  path?:string;
  creadoEn?:any;

}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserResponseDTO {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: Role;
  token?: string; // si usás JWT
}
