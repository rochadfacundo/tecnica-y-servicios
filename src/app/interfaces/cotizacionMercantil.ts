export interface CotizacionMercantil {
  canal: number;
  localidad: {
    codigo_postal: number;
  };
  vehiculo: {
    infoauto: number;
    anio: number;
    uso: number;
    gnc: boolean;
    rastreo: number;
  };
  productor: {
    id: number;
  };
}



