import { CompaniaCotizada, Cotizacion } from "../../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CondicionFiscalRus, CotizacionRioUruguay, TipoVehiculoRUS, VehiculosRus } from "../../../../interfaces/cotizacionRioUruguay";
import { TipoDeUso } from "../../../../enums/tiposDeUso";
import { getRandomNumber, getYesNo } from "../../../../utils/utils";
import { Productor } from "../../../../models/productor.model";
import { Compania } from "../../../../interfaces/compania";
import rawData from '../../../../../assets/vigenciasRUS.json';

type Vigencia = { id: number; descripcion: string; meses: number };
type VigenciasPorRamo = { [ramo: string]: Vigencia[] };


const vigenciasPorRamo: VigenciasPorRamo = rawData;

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
          sumaAseguradaGnc:Number(form.gnc),
          sumaAseguradaAccesorios:0,
          controlSatelital: getYesNo(form.controlSatelital,yes,no),
          excluirVida: 'NO',
          aumentoRCPaisesLimitrofes: 'NO',
          vigenciaPolizaId: calcularVigencia(codigoTipoInteres,productor) ,
        };


          return cotizacionData;

  }

  const ramoPorTipoInteres: Record<string, number> = {
    VEHICULO: 4,
    MOTOVEHICULO: 20,
    CAMION: 7 // ejemplo
  };

  export function calcularVigencia(codigoTipoInteres: string, productor: Productor): number  {
    const ramo = ramoPorTipoInteres[codigoTipoInteres];
    if (!ramo) return 0;

    const companiaRUS = productor.companias?.find(c => c.compania === 'RIO URUGUAY');
    if (!companiaRUS || !companiaRUS.cuotas) return 0;

    const cuotas = Number(companiaRUS.cuotas);
    const vigencias = vigenciasPorRamo[ramo.toString()];
    if (!vigencias) return 0;

    const match = vigencias.find(v => v.meses === cuotas);
    return match?.id || 0;
  }


 export function construirCotizacionRus(coberturas: any[]): CompaniaCotizada {
    const buscarPremio = (codigoCasco: string): number | undefined => {
      const cobertura = coberturas.find(c => c.codigoCasco === codigoCasco);
      return cobertura ? cobertura.premio : undefined;
    };

    const companiaCotizada: CompaniaCotizada = {
      compania: 'Río Uruguay',
      rc: buscarPremio('T34'),
      c: buscarPremio('B-80'),
      c1: buscarPremio('S0'),
      d1:buscarPremio(''),
      d2:buscarPremio(''),
      d3:buscarPremio(''),
      //no definidos por ahora
    };

    return companiaCotizada;
  }
