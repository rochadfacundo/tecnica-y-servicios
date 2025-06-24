import { FormControl } from "@angular/forms";
import { Tipo, TipoPersoneria, TipoRefacturacion, TipoVehiculo } from "./tipos";
import { Provincia } from "./provincia";

export interface CotizacionFormValue {
  tipoInteres: Tipo;
  //federacion
  //tipoPersoneria:TipoPersoneria;
  nombre?: any
  apellido?:any;
  nroId?:any;
  tipoId?:any;
  alarma?:any;
  tieneRastreador:boolean;
  rastreador?:Tipo;
  tipoRefacturacion:TipoRefacturacion;
  tipoPago?:Tipo|any;
  pagoContado?:boolean;
  descuentoComision?:Tipo|any;
  medioPago?:Tipo|any;
  franquicia?:Tipo|any;
  cascoConosur?:boolean;
  tallerExclusivo?:boolean;
  grua?:boolean;

  //rivadavia
  provincia:Provincia;
  tipoVehiculo: TipoVehiculo;
  marca: any;
  anio: any;
  modelo: any;
  version: any;
  uso: any;
  codigoUso: any;
  tipoVigencia: any;
  cuotas: any;
  clausulaAjuste: Tipo;
  cpLocalidadGuarda: any;

  //rio uruguay
  controlSatelital: any;
  tieneGnc:boolean;
  gnc?: number;
  vigenciaDesde: any;
  vigenciaHasta: any;
}
