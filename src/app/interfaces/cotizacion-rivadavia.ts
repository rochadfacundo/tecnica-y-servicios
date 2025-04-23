
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
  condicionIVA: CondicionIVA;
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
}

export enum CondicionIVA {
  CONSUMIDOR_FINAL = 'CONSUMIDOR_FINAL',
  RESPONSABLE_INSCRIPTO= 'RESPONSABLE_INSCRIPTO',
  EXCENTO= 'EXCENTO',
  RESPONSABLE_INSCRIPTO_AGENTE_PERCEPCION= 'RESPONSABLE_INSCRIPTO_AGENTE_PERCEPCION',
  MONOTRIBUTISTA= 'MONOTRIBUTISTA',
  NO_CATEGORIZADO= 'NO_CATEGORIZADO'
}

export enum CondicionIB {
  CONSUMIDOR_FINAL = 'CONSUMIDOR_FINAL',
  CONVENIO_LOCAL= 'CONVENIO_LOCAL',
  CONVENIO_MULTILATERAL= 'CONVENIO_MULTILATERAL',
  EXCENTO='EXCENTO'
}

export enum TipoFacturacion {
  CUATRIMESTRAL = 'CUATRIMESTRAL',
  ANUAL= 'ANUAL',
  SEMESTRAL= 'SEMESTRAL',
  MENSUAL= 'MENSUAL',
  TRIMESTRAL= 'TRIMESTRAL'
}

export enum Provincia {
  BUENOS_AIRES = "BUENOS_AIRES",
  CAPITAL_FEDERAL = "CAPITAL_FEDERAL",
  CATAMARCA = "CATAMARCA",
  CORDOBA = "CORDOBA",
  CORRIENTES = "CORRIENTES",
  CHACO = "CHACO",
  CHUBUT = "CHUBUT",
  ENTRE_RIOS = "ENTRE_RIOS",
  FORMOSA = "FORMOSA",
  TIERRA_DEL_FUEGO = "TIERRA_DEL_FUEGO",
  JUJUY = "JUJUY",
  LA_PAMPA = "LA_PAMPA",
  LA_RIOJA = "LA_RIOJA",
  MENDOZA = "MENDOZA",
  MISIONES = "MISIONES",
  NEUQUEN = "NEUQUEN",
  RIO_NEGRO = "RIO_NEGRO",
  SALTA = "SALTA",
  SAN_JUAN = "SAN_JUAN",
  SAN_LUIS = "SAN_LUIS",
  SANTA_CRUZ = "SANTA_CRUZ",
  SANTA_FE = "SANTA_FE",
  SANTIAGO_DEL_ESTERO = "SANTIAGO_DEL_ESTERO",
  TUCUMAN = "TUCUMAN"
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
