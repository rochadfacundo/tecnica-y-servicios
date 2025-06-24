import { Cotizacion } from "../../../interfaces/cotizacion";
import { Tipo } from "../../../interfaces/tipos";
 // Función para devolver string dependiento el booleano
export function getYesNo(value: boolean,yes: string,no: string): string {
  return value === true ? yes : no;
}

//codigos personerias para companias
export const CodigosPersoneria = {
  Federacion: {
    personaFisica: 21,
  },
  Mercantil: {

  },
  Rivadavia: {
    esJuridica: false
  },
  Atm: {
    personaFisica: 'F',
    personaJuridica: 'J',
  },
  RUS: {
    PERSONA_FISICA: 'FISICA',
    PERSONA_JURIDICA: 'JURIDICA',
  },
};

//descarga como json
export function downloadJSON(data: any[], name: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

 // Función para formatear la fecha en 'dd-MM-yyyy'
 export function formatDateSinceDay(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Agrega 0
  const day = date.getDate().toString().padStart(2, '0');
  return `${day}-${month}-${year}`;
}

  // Función para formatear la fecha en 'yyyy-MM-dd'
  export function formatDateSinceYear(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Agrega 0
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
