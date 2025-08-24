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

  export function construirCotizacionRus(coberturas: any[], tipoVehiculo: string): CompaniaCotizada {
    const norm = (s?: string) => (s ?? '').toUpperCase().trim();

    const getPremioPorCodigoCasco = (...codigos: string[]): number | undefined => {
      const set = new Set(codigos.map(norm));
      const found = coberturas.find(c => set.has(norm(c.codigoCasco)));
      return found ? Number(found.premio) : undefined;
    };

    const getPremioPorCodigoRC = (...codigos: string[]): number | undefined => {
      const set = new Set(codigos.map(norm));
      const found = coberturas.find(c => !c.codigoCasco && set.has(norm(c.codigoRC)));
      return found ? Number(found.premio) : undefined;
    };

    // --- TR ordenado por % de franquicia (menor→mayor) ---
    // Lista de códigos típicos de TR en RUS (podés ampliar si aparecen nuevos)
    const TR_CODES = new Set(['T31','T37','T44','T39','T32','T34','T24','T25']);

    const trOrdenadas = coberturas
      .filter(c => c?.codigoCasco && TR_CODES.has(norm(c.codigoCasco)))
      .map(c => {
        const suma = Number(c?.sumaAsegurada) || 0;
        const franq = Number(c?.franquicia) || 0;

        // porcentaje por cálculo; si no se puede, intentar parsear del texto
        let perc = suma > 0 ? (franq / suma) * 100 : undefined;
        if (!perc || !isFinite(perc)) {
          const txt = String(c?.descripcionComercial ?? c?.descripcionCasco ?? '');
          const m = txt.match(/(\d+(?:[.,]\d+)?)\s*%/);
          if (m) perc = parseFloat(m[1].replace(',', '.'));
        }

        return {
          code: norm(c.codigoCasco),
          premio: Number(c?.premio) || undefined,
          perc
        };
      })
      .filter(x => x.premio != null && x.perc != null)
      .sort((a, b) => (a.perc as number) - (b.perc as number));

    const d1 = trOrdenadas[0]?.premio; // menor %
    const d2 = trOrdenadas[1]?.premio; // medio %
    const d3 = trOrdenadas[2]?.premio; // mayor %

    // Otras coberturas
    const rc = getPremioPorCodigoRC('RCA', 'RCA C/GRUA', 'RCA S/GRUA', 'RCM');

    // C / C1 según vehículo
    let c  = getPremioPorCodigoCasco('C-80');               // autos
    let c1 = getPremioPorCodigoCasco('S', 'S0', 'SIGMA IMPORTADOS');

    if (tipoVehiculo === 'MOTOVEHICULO') {
      c  = getPremioPorCodigoCasco('B1-80 - MOTO');
      c1 = getPremioPorCodigoCasco('B-80 - MOTO');
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




