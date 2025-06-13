export interface CotizacionMercantil {
  localidad: CotizacionLocalidad;
  vehiculo: CotizacionVehiculo | CotizacionVehiculoMoto| null;
  productor: ProductorMercantil;
  tipo?:string;
  canal?: number;
  periodo?:number;
  cuotas?:number;
  comision?:number;
  bonificacion?:number;
  ajuste_suma?:number;
  iva?:number;
  desglose?:boolean;

}

export interface VehiculoMarcaMercantil{
  codigo:number;
  desc:string;
}

export interface CotizacionLocalidad {
  codigo_postal: number;
  id?: number;
  nombre?: string;
  provincia?: string;
}

//COTIZACION PAGO?
/*

  id:number; //false Código de vehículo. Debe ingresarse id o infoauto para identificar el vehículo
  infoauto:number; //true Código de infoauto
  nombre:string;  //false Nombre de vehículo
  anio:number;//false Año de fabricación
  uso:number; //false  particular 1 Uso del vehículo.
  gnc:boolean;//false Si cuenta o no con equipo gnc
  valor:number;//false Valor del vehículo
  rastreo:number; //false   codigo de rastreador
*/

export interface CotizacionVehiculo {
  infoauto: number;
  id?: number;
  nombre?: string;
  anio?: number;
  anioFab?: number;
  valor?: number;
  uso?: number;
  gnc?: boolean;
  rastreo?: number;
}


export interface CotizacionVehiculoMoto {
  infoauto: number;
  id?: number;
  nombre?: string;
  aniofab?: number;
  valor?: number;
  uso?: number;
  gnc?: boolean;
  rastreo?: number;
}

export interface ProductorMercantil {
  id: number;
  nombre?: string;
}



//RESPUESTA
export interface MercantilCotizado {
  id: number;
  rama: number;
  localidad: CotizacionLocalidad;
  vehiculo: CotizacionVehiculo;
  suma_asegurada: number;
  iva: number;
  ajuste_suma: number;
  desglose: boolean;
  periodo: number;
  cuotas: number;
  comision: number;
  bonificacion: number;
  bonificacion_extraordinaria: number;
  productor: ProductorMercantil;
  cantidad: number;
  resultado: Resultado[];
}

export interface Resultado {
  numero: number;
  puntaje: number;
  producto: string;
  texto: string;
  titulo: string;
  descripcion: string;
  costo: number;
  cantidad_cuotas: number;
  desglose: DesgloseTotal;
  error: string;
  franquicia: number;
  codigo_producto: number;
  adicional: {
    granizo: boolean;
  };
  inspeccion: {
    opciones: {
      id: number | null;
      descripcion: string | null;
    }[];
  };
}
export interface DesgloseCuota {
  prima: number;
  iva: number;
  sellados: number;
  premio: number;
  gasto_produccion: number;
  gasto_explotacion: number;
  recargo_financiero: number;
  impuestos_internos: number;
  tasa_ssn: number;
  servicios_sociales: number;
  percepcion_iibb: number;
  percepcion_iva: number;
  acrecimiento_iva: number;
  otros_impuestos: number;
  cuota: number;
}

export interface DesgloseTotal {
  total: DesgloseCuota;
  cuotas: DesgloseCuota[];
}




