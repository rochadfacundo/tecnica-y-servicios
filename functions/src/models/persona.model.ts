/* eslint-disable require-jsdoc */


export class Persona {
  private id:string;
  private nombre: string;
  private apellido: string;
  private email: string;
  private role: Role;
  private password:string;
  private path:string;

  constructor(
    id:string,
    nombre:string,
    apellido:string,
    email: string,
    role: Role,
    password:string,
    path:string
  ) {
    this.id=id;
    this.nombre=nombre;
    this.apellido=apellido;
    this.email=email;
    this.role=role;
    this.password=password;
    this.path=path;
  }

  toString() {
    return this.id + " "+
           this.nombre + " "+
           this.apellido + " "+
           this.email + " "+
           this.role + " "+
           this.password+ " "+
          this.path;
  }
}
