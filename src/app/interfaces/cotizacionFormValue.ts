import { CondicionFiscal } from "./condicionFiscal";

export interface CotizacionFormValue {
  codigoTipoInteres: any;
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