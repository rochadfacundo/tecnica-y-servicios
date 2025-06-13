
// Interfaces

import { EProvincia } from "./provincia";

export interface DatosCotizacionRivadavia {
  nroProductor?: string;
  claveProductor?: string;
  datoAsegurado?: DatoAsegurado;
  datoVehiculo?: DatoVehiculo;
  datoPoliza?: DatoPoliza;
  polizasVinculadas?: PolizasVinculadas;
}

export interface DatoAsegurado {
  condicionIVA: string|undefined;
  condicionIB: CondicionIB;

  nroMatricula?: string;
  tipoDocumento?: TipoDocumento;
  nroDocumento?: string;
  cuil?: string;
  cuit?: string;
  fechaNacimiento?: string;
  personaJuridica?: boolean;
  formaPago?: FormaPago;
}

export interface DatoVehiculo {
  codigoInfoAuto: string;
  codigoVehiculo: string;
  modeloAnio: string;
  sumaAsegurada: number;
  porcentajeAjuste: number;
}

export interface DatoPoliza {
  nroPoliza: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string;
  cantidadCuotas?: string;
  tipoFacturacion?: string;
  provincia: EProvincia;
  codigoPostal: string;
  sumaAseguradaAccesorios: number;
  sumaAseguradaEquipaje: number;

  gnc?: EstadoGNC;
  cantidadAsientos?: string;
  alarmaSatelital?: AlarmaSatelital;
  subrogado?: boolean;
  coeficienteRC?: number;
  coeficienteCasco?: number;
  porcentajeBonificacion?: number;
  aniosSinSiniestros?: AniosSinSiniestros;
}

export interface PolizasVinculadas {
  accidentePasajeros: string;
  accidentePersonales: string;
  combinadoFamiliar: string;
  incendio: string;
  vidaIndividual: string;
}

// Enums

export enum FormaPago{
  EN_ASEGURADORA= 'EN_ASEGURADORA',
  COBRADOR= 'COBRADOR',
  TARJETA_CREDITO= 'TARJETA_CREDITO',
  CBU= 'CBU',
  PAGO_FACIL= 'PAGO_FACIL',
  BAPRO_PAGO= 'BAPRO_PAGO'
}

export enum TipoDocumento {
  LIBRETA_ENROLAMIENTO = 'LIBRETA_ENROLAMIENTO',
  LIBRETA_CIVICA = 'LIBRETA_CIVICA',
  DNI= 'DNI',
  PASAPORTE= 'PASAPORTE'
}


export enum CondicionIB {
  CONSUMIDOR_FINAL = 'CONSUMIDOR_FINAL',
  CONVENIO_LOCAL= 'CONVENIO_LOCAL',
  CONVENIO_MULTILATERAL= 'CONVENIO_MULTILATERAL',
  EXCENTO='EXCENTO'
}

export enum CondicionIVA {
  CONSUMIDOR_FINAL = 'CONSUMIDOR_FINAL',
  RESPONSABLE_INSCRIPTO= 'RESPONSABLE_INSCRIPTO',
  RESPONSABLE_INSCRIPTO_AGENTE_PERCEPCION= 'RESPONSABLE_INSCRIPTO_AGENTE_PERCEPCION',
  MONOTRIBUTISTA= 'MONOTRIBUTISTA',
  CONVENIO_MULTILATERAL= 'CONVENIO_MULTILATERAL',
  EXCENTO='EXCENTO',
  NO_CATEGORIZADO='NO_CATEGORIZADO',
}

export enum TipoFacturacion {
  CUATRIMESTRAL = 'CUATRIMESTRAL',
  ANUAL= 'ANUAL',
  SEMESTRAL= 'SEMESTRAL',
  MENSUAL= 'MENSUAL',
  TRIMESTRAL= 'TRIMESTRAL'
}


export enum EstadoGNC {
  NO_POSEE_GNC = 'NO_POSEE_GNC',
  POSEE_GNC_ASEGURA= 'POSEE_GNC_ASEGURA',
  POSEE_GNC_NO_ASEGURA= 'POSEE_GNC_NO_ASEGURA'
}

export enum AlarmaSatelital {
  SIN_ALARMA = 'SIN_ALARMA',
}

export enum AniosSinSiniestros {
  SIN_SINIESTRO_UN_ANIO = 'SIN_SINIESTRO_UN_ANIO',
}
