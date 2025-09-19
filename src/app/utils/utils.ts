
import { firstValueFrom } from 'rxjs';
import { Brand } from '../classes/infoauto';
import { Role } from '../enums/role';
import { HttpClient } from '@angular/common/http';
import { ECobertura } from '../enums/Ecobertura';


export async function filterCars(http: HttpClient, marcasOriginales: Brand[]): Promise<Brand[]> {
  const [palabrasClave, marcasExcluidas] = await Promise.all([
    firstValueFrom(http.get<string[]>('/assets/palabrasClaveCamiones.json')),
    firstValueFrom(http.get<string[]>('/assets/marcasCamiones.json')),
  ]);

  return marcasOriginales.filter(marca => {
    const nombreMayus = marca.name.toUpperCase();
    const contieneClave = palabrasClave.some(p => nombreMayus.includes(p));
    const estaExcluida = marcasExcluidas.includes(nombreMayus);
    return !contieneClave && !estaExcluida;
  });
}

// Para string[]
export function ordenarStrings(arr: string[]): string[] {
  return arr.slice().sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  );
}

// Para objetos con { nombre }
export function ordenarPorNombre<T extends { nombre: string }>(arr: T[]): T[] {
  return arr.slice().sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
  );
}


export const opcionesDeCobertura = [
  { id: ECobertura.RC, label: 'Responsabilidad Civil' },
  { id: ECobertura.ROBO, label: 'Robo' },
  { id: ECobertura.TERCEROS, label: 'Terceros' },
  { id: ECobertura.TODO_RIESGO, label: 'Todo Riesgo' },
];

export const configCompanias: Record<string, any> = {
  'RIVADAVIA': {
    tiposFacturacion: ['CUATRIMESTRAL', 'ANUAL', 'SEMESTRAL', 'TRIMESTRAL', 'MENSUAL'],
    cantidadCuotas: "",  //cantidad de cuotas se debe rellenar dependiendo lo que se eligio en facturacion
            //si es cuatri 4, si es semestral 5, trimestral 3, mensual 1, anual 12,
  },
  'MERCANTIL ANDINA': {
    periodos: {MENSUAL: 1,BIMESTRAL:2,CUATRIMESTRAL:4},
     cuotas: 1, //se actualice con la eleccion de periodo
  },
  'FEDERACION PATRONAL': {
    refacturaciones: {SEMESTRAL:2,MENSUAL: 12}  // 2 = Semestral, 12 = Mensual
  },
  'RIO URUGUAY': {
    vigencias: [], // Se llenará desde servicio
  },
  'ATM': {
    planes: [
      { descripcion: 'ANUAL/REFA MENSUAL CON DÉBITO AUTOMÁTICO', formaPago: 'TARJETA', plan: '02' },
      { descripcion: 'ANUAL/REFA MENSUAL CON DÉBITO AUTOMÁTICO', formaPago: 'CBU', plan: '11' },
      { descripcion: 'ANUAL/REFA BIMESTRAL', formaPago: 'TARJETA', plan: '04' },
      { descripcion: 'ANUAL/REFA BIMESTRAL', formaPago: 'EFVO', plan: '03' },
      { descripcion: 'ANUAL REFA. TRIMESTRAL CON CUPONES', formaPago: 'EFVO', plan: '01' },
    ]
  }
};



export function getRoles():Role[]{

  const roles:Role[]=[];

  roles.push(Role.Productor);
  roles.push(Role.Supervisor);
  roles.push(Role.Administrador);

  return roles;
}

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

// Genera numero random
export function getRandomNumber(): number {
  return Math.floor(Math.random() * 1_000_000_000) + 1;
}

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
