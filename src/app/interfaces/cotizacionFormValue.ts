import { FormControl } from "@angular/forms";
import { CondicionFiscal } from "./condicionFiscal";
import { Tipo, TipoPersoneria } from "./tipoPersoneria";

export interface CotizacionFormValue {
  codigoTipoInteres: any;
  //federacion
  tipoPersoneria:TipoPersoneria |any;
  nombre?: any
  apellido?:any;
  nroId?:any;
  tipoId?:any;
  alarma?:any;
  rastreador?:any;
  tipoRefacturacion?:Tipo|any;
  tipoPago?:Tipo|any;
  pagoContado?:boolean;
  descuentoComision?:Tipo;

  tipoVehiculo: any;
  marca: any;
  anio: any;
  modelo: any;
  version: any;
  uso: any;
  codigoUso: any;
  tipoVigencia: any;
  cuotas: any;
  clausulaAjuste: any;
  condicionFiscal: CondicionFiscal | any;
  cpLocalidadGuarda: any;
  controlSatelital: any;
  gnc: any;
  vigenciaDesde: any;
  vigenciaHasta: any;
}
