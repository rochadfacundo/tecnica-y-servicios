export interface Zona {
  "Capital Federal": CapitalFederal;
  "Zona Norte": ZonaDetalle;
  "Zona Sur": ZonaDetalle;
  "Zona Oeste": ZonaDetalle;
  "Fuera de AMBA": ZonaDetalle;

  // esto permite acceder con string sin que TypeScript proteste
  [key: string]: any;
}

export interface CapitalFederal {
  Barrios: string[];
}

export interface ZonaDetalle {
  [partido: string]: string[];
}

export interface Localidad {
  cp: string;
  id: number;
  nombre: string;
  provincia?: string;
}