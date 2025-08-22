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

const grupos = {
  d3: ['T32','T34'],
  d2: ['T31'],
  d1: ['T37','T44'],
} as const;


const vigenciasPorRamo: VigenciasPorRamo = rawData;

  export function buildRusRequest(form: CotizacionFormValue,infoauto:number,productor:Productor,tipo:string):CotizacionRioUruguay{
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

        const esVehiculo=  tipo ==="VEHICULO";

        const vigenciaPolizaId = esVehiculo
        ? configRus?.vigenciaPolizaIdAuto
        : configRus?.vigenciaPolizaIdMoto;

        const cuotas=  esVehiculo
        ? configRus?.cuotasAuto
        : configRus?.cuotasMoto;

      if (!vigenciaPolizaId || !cuotas) {
        throw new Error(`⚠️ No se encontró vigenciaPolizaId o cuota para ${esVehiculo ? 'AUTO' : 'MOTO'} en el productor ${productor.email}`);
      }

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
          cuotas: cuotas,
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
          vigenciaPolizaId: Number(vigenciaPolizaId),
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

  export function construirCotizacionRus(coberturas: any[],tipoVehiculo:string): CompaniaCotizada {
    const norm = (s?: string) => (s ?? "").toUpperCase().trim();

    const getPremioPorCodigoCasco = (...codigos: string[]): number | undefined => {
      const set = new Set(codigos.map(norm));
      const found = coberturas.find(c => set.has(norm(c.codigoCasco)));
      return found?.premio;
    };

    const getPremioPorCodigoRC = (...codigos: string[]): number | undefined => {
      const set = new Set(codigos.map(norm));
      const found = coberturas.find(
        c => !c.codigoCasco && set.has(norm(c.codigoRC))
      );
      return found?.premio;
    };

    const d1 = getPremioPorCodigoCasco('T32', 'T34','T24');
    const d2 = getPremioPorCodigoCasco('T31','T25');
    const d3 = getPremioPorCodigoCasco('T37', 'T44','T39');

    /*
    const d3 = getPremioPorCodigoCasco(...grupos.d3);
    const d2 = getPremioPorCodigoCasco(...grupos.d2);
    const d1 = getPremioPorCodigoCasco(...grupos.d1);*/

    // Otras coberturas
    const rc = getPremioPorCodigoRC('RCA', 'RCA C/GRUA', 'RCA S/GRUA', 'RCM');


    var c  = getPremioPorCodigoCasco('C-80');// B1 80 en C
    var c1 = getPremioPorCodigoCasco('S', 'S0','Sigma Importados'); // B80 en C1

    console.log(tipoVehiculo);

    if(tipoVehiculo=="MOTOVEHICULO"){
       c  = getPremioPorCodigoCasco('B1-80 - MOTO');// B1 80 en C
       c1 = getPremioPorCodigoCasco('B-80 - MOTO'); // B80 en C1

       console.log(c);
    }



    const companiaCotizada: CompaniaCotizada = {
      compania: 'Río Uruguay',
      rc,
      c,
      c1,
      d1,
      d2,
      d3,
    };

    return companiaCotizada;
  }



