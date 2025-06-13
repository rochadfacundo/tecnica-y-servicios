import { Cotizacion } from "../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../interfaces/cotizacionFormValue";
import { CotizacionRioUruguay, TipoVehiculoRUS, VehiculosRus } from "../../../interfaces/cotizacionRioUruguay";
import { TipoDeUso } from "../../../enums/tiposDeUso";
import { getYesNo } from "../utils/utils";


  export function buildRusRequest(form: CotizacionFormValue,infoauto:number):CotizacionRioUruguay{

        const yes = "SI";
        const no = "NO";
        const USO:TipoDeUso = TipoDeUso.PARTICULAR;
        const medioCobro= form.medioPago.codigo === 1 ? 1 : 3;
        const codigoTipoInteres= form.tipoVehiculo.idRus;

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
          codigoProductor: 4504,
          codigoSolicitante: 4504,
          codigoTipoInteres: String(codigoTipoInteres),
          cuotas: Number(form.cuotas),
          ajusteAutomatico:Number(form.clausulaAjuste.codigo),
          condicionFiscal: form.condicionFiscal.cfFedRusATM,
          //tipoVigencia: form.tipoVigencia.opcion,
          tipoVigencia: "SEMESTRAL",
          medioCobro:medioCobro,
          vehiculos: vehiculo,
          vigenciaDesde: form.vigenciaDesde,
          vigenciaHasta: form.vigenciaHasta,
          sumaAseguradaGnc:Number(form.gnc),
          sumaAseguradaAccesorios:0,
          controlSatelital: getYesNo(form.controlSatelital,yes,no),
          excluirVida: 'NO',
          aumentoRCPaisesLimitrofes: 'NO'
         //vigenciaPolizaId: 65 //id de autos
        };

        /*
        if(codigoTipo=='MOTOVEHICULO')
        {
          cotizacionData.vigenciaPolizaId=70; //id para motos
        }*/

          return cotizacionData;

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
