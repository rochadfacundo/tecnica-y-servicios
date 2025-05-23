import { Compania } from "../interfaces/compania";

export class Persona{

  private id:string;
  private nombre: string;
  private apellido: string;
  private email: string;
  private role: Role;
  private password:string;

  constructor(
    id:string,
    nombre:string,
    apellido:string,
    email: string,
    role: Role,
   password:string){
    this.id=id;
    this.nombre=nombre;
    this.apellido=apellido;
    this.email=email;
    this.role=role;
    this.password=password;
  }

}
