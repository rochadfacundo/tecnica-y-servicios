
export interface CotizacionFederacion {
  fecha_desde: string; // formato "dd/MM/yyyy"
  razon_social: number;
  medio_pago: number;   //1 efectivo - 2 debito automatico
  contratante: ContratanteFederacion;
  vehiculo: VehiculoFederacion;
  numero_cotizacion?: number;
  coberturas?: CoberturasFederacion;
  descuento_comision?: number;
  pago_contado?: boolean;
  cliente_nuevo?: boolean;
  refacturaciones?: number;
  producto_modular?: ProductoModularFederacion;
  asegura2?: Asegura2Federacion[]; // maximo 4 objetos
}

export enum CondicionesIvaFederacionPatronal {
  INSCRIPTO = "IN",
  CONSUMIDOR_FINAL = "CF",
  EXENTO = "EA",
  INSCRIPTO_REDUCIDO = "IR",
  EXENTO_DTO = "ED",
  MONOTRIBUTISTA = "MO",
  NO_CATEGORIZADO = "NC",
  NO_DEFINIDO = "0",
  NO_APLICA = "NA"
}


export interface ContratanteFederacion {
  condicion_iva: CondicionesIvaFederacionPatronal;
  id?: number;
  tipo_id?: string;
  cuit?: string;
  nombre?: string;
  apellido?: string;
  razon_social?: string;
  localidad?: number;
  matricula?: string;
}

export interface VehiculoFederacion {
  infoauto: string;
  localidad_de_guarda: number; //localidades
  anio: string;
  tipo_vehiculo: number;
  alarma?: boolean;
  rastreador?: number;
  gnc?: boolean;
  volcador?: boolean;
  suma_asegurada?: number;
}

export interface CoberturasFederacion {
  rc_conosur?: number;
  casco_conosur?: boolean;
  petroliferos_aeropuertos?: number;
  grua?: boolean;
  taller_exclusivo?: boolean;
  interasegurado?: boolean;
  servicio_petrolero?: boolean;
  gastos_remediacion?: number;
  ajuste_automatico?: number;
  rc_ampliada?: number;
  plan?: string|null;
  franquicia?: number;
}

export interface ProductoModularFederacion {
  cant_modulos: number;
  codigo_producto: string;
  fecha_nacimiento: string; // formato "dd/MM/yyyy"
}

export interface Asegura2Federacion {
  ramo: number;
  producto: string;
}


export interface LocalidadesFederacion {
  codigo: string;
  nombre: string;
  codigoPostal: number;
  codigoZona: number;
  codigoZonaCotizOR: number;
  codigoProvincia: number;
  nombreProvincia: string;
}


