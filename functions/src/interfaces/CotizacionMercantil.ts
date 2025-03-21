export interface CotizacionMercantil {
  localidad: CotizacionLocalidad;
  vehiculo: CotizacionVehiculo;
  productor: Productor;
  tipo:string;
  canal?: number;
  periodo?:number;
  cuotas?:number;
  comision?:number;
  bonificacion?:number;
  ajuste_suma?:number;
  iva?:number;
  desglose?:boolean;

}

export interface CotizacionVehiculo {
  infoauto: number;
  id?: number;
  nombre?: string;
  anio?: number;
  valor?: number;
  uso?: number;
  gnc?: boolean;
  rastreo?: number;
}

export interface Productor {
  id: number;
  nombre?: string;
}

export interface CotizacionLocalidad {
  codigo_postal: number;
  id?: number;
  nombre?: string;
  provincia?: string;
}
