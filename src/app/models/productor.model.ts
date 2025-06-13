/* eslint-disable require-jsdoc */
/* eslint-disable @typescript-eslint/no-empty-function */
import {Role} from "../enums/role";
import { Compania } from "../interfaces/compania";
import { Cotizacion } from "../interfaces/cotizacion";

export interface Productor  {
  uid?:string;
  nombre?:string;
  apellido?:string;
  email?: string;
  role?:Role;
  password?:string;
  path?:string;
  companias?:Compania[];
  cotizaciones?:Cotizacion[];
}
