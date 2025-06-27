
import { EProvincia, Provincia } from "../../../../interfaces/provincia";
import { Tipo, TipoVehiculo } from "../../../../interfaces/tipos";
import { Model } from '../../../../classes/infoauto';

/**
 * Filtra y ordena modelos por año y posición/descripcion.
 * @param modelos Lista completa de modelos
 * @param anio Año seleccionado
 * @returns Modelos válidos y ordenados
 */
export function filtrarModelosPorAnio(modelos: Model[], anio: number): Model[] {
  return modelos
    .filter(modelo => {
      const desde = modelo.prices_from ?? 0;
      const hasta = modelo.prices_to ?? 9999;
      return anio >= desde && anio <= hasta;
    })
    .sort((a, b) => {

      if (a.position !== b.position) {
        return (a.position ?? 9999) - (b.position ?? 9999);
      }
      return a.description.localeCompare(b.description);
    });
}



  export const TIPOS_VEHICULO:TipoVehiculo[]=[
      { idRus: 7,nombre:'MOTOVEHICULO', descripcion: 'MOTO MENOS 50 CC'},
      { idRus: 8,nombre:'MOTOVEHICULO', descripcion: 'MOTO MAS 50 CC' },
      { idRus: 1,nombre:'VEHICULO', descripcion: 'AUTO' },
      { idRus: 2,nombre:'VEHICULO', descripcion: 'PICK-UP "A"' },
      { idRus: 3,nombre:'VEHICULO', descripcion: 'PICK-UP "B"' },
      { idRus: 4,nombre:'CAMION', descripcion: 'CAMION HASTA 5 TN' },
      { idRus: 5,nombre:'CAMION', descripcion: 'CAMION HASTA 10 TN' },
      { idRus: 6,nombre:'CAMION', descripcion: 'CAMION MAS 10 TN' },

    ];

    //cargar Anios en el formulario
export function loadYears() {
  const anioActual = new Date().getFullYear();
  return Array.from({ length: anioActual - 1989 }, (_, i) => anioActual - i);
}

export const CUOTAS: number[] = [1, 2, 3, 4, 5, 6];

export const CLAUSULAS_AJUSTE: Tipo[] = [
  { codigo: 0, descripcion: '0%' },
  { codigo: 10, descripcion: '10%' },
  { codigo: 20, descripcion: '20%' },
  { codigo: 30, descripcion: '30%' }
];

export const OPCIONES_SI_NO = [
  { id: 1, opcion: 'SI' },
  { id: 2, opcion: 'NO' }
];

export const TIPOS_VIGENCIA = [
  { id: 1, descripcion: 'TRIMESTRAL  (valido solo Rio Uruguay)', opcion: 'TRIMESTRAL' },
  { id: 2, descripcion: 'SEMESTRAL  (valido solo Rio Uruguay)', opcion: 'SEMESTRAL' },
  { id: 3, descripcion: 'ANUAL', opcion: 'ANUAL' }
];

export const TIPOS_ID = [
  { tipo_id: 'DNI' },
  { tipo_id: 'PA (pasaporte)' },
  { tipo_id: 'Libreta Civica' },
  { tipo_id: 'Libreta de enrolamiento' }
];

export const TIPOS_REFACTURACION = [
  { codigo: 2, descripcion: 'SEMESTRAL', mercantilPeriodo: 0 },
  { codigo: 12, descripcion: 'MENSUAL', mercantilPeriodo: 1 },
  { codigo: 0, descripcion: 'CUATRIMESTRAL', mercantilPeriodo: 4 },
  { codigo: 0, descripcion: 'TRIMESTRAL', mercantilPeriodo: 0 },
  { codigo: 0, descripcion: 'BIMESTRAL', mercantilPeriodo: 0 }
];

export const DESCUENTOS_COMISION = [
  { codigo: 1, descripcion: '1%' },
  { codigo: 2, descripcion: '2%' },
  { codigo: 3, descripcion: '3%' },
  { codigo: 4, descripcion: '4%' },
  { codigo: 5, descripcion: '5%' }
];

export const MEDIOS_PAGO = [
  { codigo: 1, descripcion: 'Efectivo' },
  { codigo: 2, descripcion: 'Debito/Credito' }
];

export const PROVINCIAS: Provincia[] = [
  { id: 1, descripcion: 'Buenos Aires', provinciaRiv: EProvincia.BUENOS_AIRES },
  { id: 2, descripcion: 'Capital Federal', provinciaRiv: EProvincia.CAPITAL_FEDERAL },
  { id: 3, descripcion: 'Catamarca', provinciaRiv: EProvincia.CATAMARCA },
  { id: 4, descripcion: 'Chaco', provinciaRiv: EProvincia.CHACO },
  { id: 5, descripcion: 'Chubut', provinciaRiv: EProvincia.CHUBUT },
  { id: 6, descripcion: 'Cordoba', provinciaRiv: EProvincia.CORDOBA },
  { id: 7, descripcion: 'Corrientes', provinciaRiv: EProvincia.CORRIENTES },
  { id: 8, descripcion: 'Entre Rios', provinciaRiv: EProvincia.ENTRE_RIOS },
  { id: 9, descripcion: 'Formosa', provinciaRiv: EProvincia.FORMOSA },
  { id: 10, descripcion: 'Jujuy', provinciaRiv: EProvincia.JUJUY },
  { id: 11, descripcion: 'La Pampa', provinciaRiv: EProvincia.LA_PAMPA },
  { id: 12, descripcion: 'La Rioja', provinciaRiv: EProvincia.LA_RIOJA },
  { id: 13, descripcion: 'Mendoza', provinciaRiv: EProvincia.MENDOZA },
  { id: 14, descripcion: 'Misiones', provinciaRiv: EProvincia.MISIONES },
  { id: 15, descripcion: 'Neuquen', provinciaRiv: EProvincia.NEUQUEN },
  { id: 16, descripcion: 'Rio Negro', provinciaRiv: EProvincia.RIO_NEGRO },
  { id: 17, descripcion: 'Salta', provinciaRiv: EProvincia.SALTA },
  { id: 18, descripcion: 'San Juan', provinciaRiv: EProvincia.SAN_JUAN },
  { id: 19, descripcion: 'San Luis', provinciaRiv: EProvincia.SAN_LUIS },
  { id: 20, descripcion: 'Santa Cruz', provinciaRiv: EProvincia.SANTA_CRUZ },
  { id: 21, descripcion: 'Santa Fe', provinciaRiv: EProvincia.SANTA_FE },
  { id: 22, descripcion: 'Santiago Del Estero', provinciaRiv: EProvincia.SANTIAGO_DEL_ESTERO },
  { id: 23, descripcion: 'Tierra Del Fuego', provinciaRiv: EProvincia.TIERRA_DEL_FUEGO },
  { id: 24, descripcion: 'Tucuman', provinciaRiv: EProvincia.TUCUMAN }
];
