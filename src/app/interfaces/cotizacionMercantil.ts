export interface CotizacionMercantil {
  canal: number;
  localidad: {
    codigo_postal: number;
  };
  vehiculo: CotizacionVehiculo;
  productor: {
    id: number;
  };
}

export interface CotizacionVehiculo{
  id:number; //false Código de vehículo. Debe ingresarse id o infoauto para identificar el vehículo
  infoauto:number; //true Código de infoauto
  nombre:string;  //false Nombre de vehículo
  anio:number;//false Año de fabricación
  uso:number; //false  particular 1 Uso del vehículo.
  gnc:boolean;//false Si cuenta o no con equipo gnc
  valor:number;//false Valor del vehículo
  rastreo:number; //false   codigo de rastreador
}
