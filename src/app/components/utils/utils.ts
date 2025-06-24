
import { Role } from '../../enums/role';

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