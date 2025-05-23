import { Compania } from "../interfaces/compania";
import { Cotizacion } from "../interfaces/cotizacion";
import { Persona } from "./persona";

export class Productor extends Persona{
  private companias:Compania[];
  private cotizaciones?:Cotizacion[];

  constructor(
    id:string,
    nombre:string,
    apellido:string,
    email: string,
    role:Role,
    password:string
  ){
    super(id,nombre,apellido,email,role,password);
    this.companias=[];
}

addCompania(compania: Compania){
  this.companias.push(compania);
}

prepararCompania(){

}


}