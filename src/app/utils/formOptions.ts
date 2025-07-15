import { Model } from "../classes/infoauto";
import { TipoVehiculo } from "../interfaces/tipos";

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


/**
 * Carga anios formateados
 * @returns Array de anios formateados.
 */
export function loadYears() {
  const anioActual = new Date().getFullYear();
  return Array.from({ length: anioActual - 1989 }, (_, i) => anioActual - i);
}

export const OPCIONES_SI_NO = [
  { id: 1, opcion: 'SI' },
  { id: 2, opcion: 'NO' }
];



