import { Cotizacion } from "../../../interfaces/cotizacion";
 // Función para devolver string dependiento el booleano
export function getYesNo(value: boolean,yes: string,no: string): string {
  return value === true ? yes : no;
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


    //cargar Anios en el formulario
    export function loadYears() {
      const anioActual = new Date().getFullYear();
      return Array.from({ length: anioActual - 1989 }, (_, i) => anioActual - i);
    }


    //devuelve el tipo de vehiculo
  export function getTipo(id: number): string {

    const idNumber =Number(id);
    let vehiculo='';

    switch (idNumber) {
      case 1:
      case 2:
      case 3:
      vehiculo='VEHICULO';
      break;
      case 4:
      case 5:
      case 6:
      vehiculo='CAMION';
        break;
      case 7:
      case 8:
      vehiculo='MOTOVEHICULO';
        break;
      case 25:
      vehiculo='MOTORHOME';
        break;
      case 26:
      vehiculo='OMNIBUS';
       break;

      default:
        break;
    }
    return vehiculo;
  }


  //devuelve tabla hardcodeada cotizaciones
export function getCotizacionesTabla(): Cotizacion[]{
  const cotizaciones: Cotizacion[] = [
    {
      compania: 'Mercantil Andina',
      rc: 10200,
      mb: 13800,
      mplus: 14950,
      tr1: 21000,
      tr2: 24500
    },
    {
      compania: 'Federación Patronal',
      rc: 11000,
      mb: 14200,
      mplus: 15100,
      tr1: 22300,
      tr2: 26000
    },
    {
      compania: 'Río Uruguay',
      rc: 10500,
      mb: 13900,
      mplus: 14800,
      tr1: 20800,
      tr2: 23900
    },
    {
      compania: 'Rivadavia',
      rc: 9950,
      mb: 13500,
      mplus: 14200,
      tr1: 19700,
      tr2: 22400
    },
    {
      compania: 'ATM',
      rc: 3250,
      mb: 11300,
      mplus: 13210,
      tr1: 2700,
      tr2: 2240
    }
  ];

  return cotizaciones;
}