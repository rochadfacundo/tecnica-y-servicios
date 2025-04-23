
// Interfaces

export interface DatosCotizacion {
  nroProductor: string;
  claveProductor: string;
  datoAsegurado: DatoAsegurado;
  datoVehiculo: DatoVehiculo;
  datoPoliza: DatoPoliza;
  polizasVinculadas: PolizasVinculadas;
}

export interface DatoAsegurado {
  nroMatricula: string;
  tipoDocumento: TipoDocumento;
  nroDocumento: string;
  cuil: string;
  cuit: string;
  fechaNacimiento: string;
  personaJuridica: boolean;
  formaPago: FormaPago;
  condicionIVA: CondicionIVA;
  condicionIB: CondicionIB;
}

export interface DatoVehiculo {
  codigoInfoAuto: string;
  codigoVehiculo: string;
  modeloAnio: string;
  sumaAsegurada: number;
  porcentajeAjuste: string;
}

export interface DatoPoliza {
  nroPoliza: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string;
  cantidadCuotas: string;
  tipoFacturacion: TipoFacturacion;
  provincia: Provincia;
  codigoPostal: string;
  gnc: EstadoGNC;
  sumaAseguradaAccesorios: number;
  sumaAseguradaEquipaje: number;
  cantidadAsientos: string;
  alarmaSatelital: AlarmaSatelital;
  subrogado: boolean;
  coeficienteRC: number;
  coeficienteCasco: number;
  porcentajeBonificacion: number;
  aniosSinSiniestros: AniosSinSiniestros;
}

export interface PolizasVinculadas {
  accidentePasajeros: string;
  accidentePersonales: string;
  combinadoFamiliar: string;
  incendio: string;
  vidaIndividual: string;
}

// Enums
export enum TipoDocumento {
  LIBRETA_ENROLAMIENTO = 'LIBRETA_ENROLAMIENTO',
}

export enum FormaPago {
  EN_ASEGURADORA = 'EN_ASEGURADORA',
}

export enum CondicionIVA {
  CONSUMIDOR_FINAL = 'CONSUMIDOR_FINAL',
}

export enum CondicionIB {
  CONSUMIDOR_FINAL = 'CONSUMIDOR_FINAL',
}

export enum TipoFacturacion {
  CUATRIMESTRAL = 'CUATRIMESTRAL',
}

export enum Provincia {
  BUENOS_AIRES = 'BUENOS_AIRES',
}

export enum EstadoGNC {
  NO_POSEE_GNC = 'NO_POSEE_GNC',
}

export enum AlarmaSatelital {
  SIN_ALARMA = 'SIN_ALARMA',
}

export enum AniosSinSiniestros {
  SIN_SINIESTRO_UN_ANIO = 'SIN_SINIESTRO_UN_ANIO',
}
