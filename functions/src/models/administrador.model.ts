/* eslint-disable require-jsdoc */
import { Persona } from "./persona.model";


export class Administrador extends Persona {
  private permisosEspeciales: string[] = [];

  constructor(
    id: string,
    nombre: string,
    apellido: string,
    email: string,
    role:Role,
    password: string,
    path:string,
  ) {
    super(id, nombre, apellido, email, role, password, path);
  }

  agregarPermiso(permiso: string) {
    this.permisosEspeciales.push(permiso);
  }

  listarPermisos(): string[] {
    return this.permisosEspeciales;
  }
}
