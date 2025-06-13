import { Cotizacion } from "../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../interfaces/cotizacionFormValue";
import { CondicionFiscalRus, CotizacionRioUruguay, TipoVehiculoRUS, VehiculosRus } from "../../../interfaces/cotizacionRioUruguay";
import { TipoDeUso } from "../../../enums/tiposDeUso";
import { getYesNo } from "../utils/utils";
import { Productor } from "../../../models/productor.model";


  export function buildRusRequest(form: CotizacionFormValue,infoauto:number,productor:Productor):CotizacionRioUruguay{
       //si id es 1 son 6 meses
      // si id es 3 son 3
      // si id es 65 son 3
      // si id es 71 son 1

        const yes = "SI";
        const no = "NO";
        const USO:TipoDeUso = TipoDeUso.PARTICULAR;
        const medioCobro= form.medioPago.codigo === 1 ? 1 : 3;
        const codigoTipoInteres= form.tipoVehiculo.nombre;
        const AJUSTE_RUS=20;
        const configRus = productor.companias?.find(c => c.compania === 'RIO URUGUAY');



        const vehiculo: VehiculosRus[]=[{
            anio: String(form.anio),
            controlSatelital: getYesNo(form.controlSatelital,yes,no),
            cpLocalidadGuarda:Number(form.cpLocalidadGuarda),
            gnc: getYesNo(form.tieneGnc,yes,no),
            codia:infoauto,
            sumaAseguradaGnc:form.gnc,
           // sumaAseguradaAccesorios:"aca monto de la suma de accesorios",
            uso: USO,
            rastreoACargoRUS: getYesNo(form.tieneRastreador,yes,no),
        }];

        const cotizacionData: CotizacionRioUruguay = {
          codigoProductor: Number(configRus?.nroProductor),
          codigoSolicitante: Number(configRus?.claveProductor),
          codigoTipoInteres: String(codigoTipoInteres),
          cuotas: configRus?.cuotas,
          ajusteAutomatico:AJUSTE_RUS,
          condicionFiscal: CondicionFiscalRus.CF,
          //tipoVigencia: form.tipoVigencia.opcion,
          //tipoVigencia: "SEMESTRAL",
          medioCobro:medioCobro,
          vehiculos: vehiculo,
          vigenciaDesde: form.vigenciaDesde,
          vigenciaHasta: calcularVigenciaHasta(form.vigenciaDesde, Number(configRus?.vigenciaPolizaId)),
          sumaAseguradaGnc:Number(form.gnc),
          sumaAseguradaAccesorios:0,
          controlSatelital: getYesNo(form.controlSatelital,yes,no),
          excluirVida: 'NO',
          aumentoRCPaisesLimitrofes: 'NO',
         vigenciaPolizaId: Number(configRus?.vigenciaPolizaId)
        };

          return cotizacionData;

  }

  function calcularVigenciaHasta(desde: string, vigenciaId: number): string {
    const fechaDesde = new Date(desde);
    let meses = 0;

    switch (vigenciaId) {
      case 1:
        meses = 6;
        break;
      case 3:
      case 65:
        meses = 3;
        break;
      case 71:
        meses = 1;
        break;
      default:
        meses = 6;
        break;
    }

    // Sumamos los meses
    const nuevaFecha = new Date(fechaDesde);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);

    // Formato YYYY-MM-DD
    const yyyy = nuevaFecha.getFullYear();
    const mm = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
    const dd = String(nuevaFecha.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }


 export function construirCotizacionRus(coberturas: any[]): Cotizacion {
    const buscarPremio = (codigoCasco: string): number | undefined => {
      const cobertura = coberturas.find(c => c.codigoCasco === codigoCasco);
      return cobertura ? cobertura.premio : undefined;
    };

    const cotizacion: Cotizacion = {
      compania: 'Río Uruguay',
      rc: buscarPremio('T34'),
      c: buscarPremio('B-80'),
      c1: buscarPremio('S0'),
      d1:buscarPremio(''),
      d2:buscarPremio(''),
      d3:buscarPremio(''),
      //no definidos por ahora
    };

    return cotizacion;
  }
