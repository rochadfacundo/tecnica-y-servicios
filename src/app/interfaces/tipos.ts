export interface TipoPersoneria{

  codigo:number;
  descripcion:string;

}

export interface TipoVehiculo{
  idRus:number;
  nombre:string;
  nombreRus:string;
}

export interface Tipo{

  codigo:number;
  descripcion:string;

}

export interface TipoRefacturacion{

  codigo:number;
  descripcion:string;
  mercantilPeriodo?:number;
}

export interface TipoId{

  	id?:number;
    tipo_id:string;

}