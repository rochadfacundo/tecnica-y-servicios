
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CondicionFiscalRus, CotizacionRioUruguay, TipoVehiculoRUS, VehiculosRus } from "../../../../interfaces/cotizacionRioUruguay";
import { TipoDeUso } from "../../../../enums/tiposDeUso";
import { getRandomNumber, getYesNo } from "../../../../utils/utils";
import { Productor } from "../../../../models/productor.model";
import { Compania } from "../../../../interfaces/compania";
import rawData from '../../../../../assets/vigenciasRUS.json';
import { CoberturaDet, CompaniaCotizada } from "../../../../interfaces/companiaCotizada";


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

    const stripHtml = (s?: string) =>
      String(s ?? '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const parsePerc = (s?: string): number | undefined => {
      if (!s) return undefined;
      const clean = s.replace('.', '').replace(',', '.'); // "20,00" -> "20.00"
      const n = Number(clean);
      return Number.isFinite(n) ? n : undefined;
    };

    const ajusteDe = (item: any): string => {
      const p = parsePerc(item?.ajusteAutomatico);
      return !p || p <= 0 ? 'Sin ajuste' : `Ajuste ${p}%`;
    };

    const humanDescCasco = (item: any): string => {
      // Preferimos descripcionComercial, si no, descripcionCasco
      let raw = 'Plan '+ item?.codigoCasco  +' ' +item?.descripcionCasco;
      raw = stripHtml(raw);
      // Quitar duplicación "(T32)" al final si viene
      raw = raw.replace(/\(([^)]+)\)\s*$/, '').trim();
      // Uniformar "T32 - ..." -> "T32: ..."
      raw = raw.replace(/^([A-Z0-9-]+)\s*-\s*/i, '$1: ');
      return raw;
    };

    const humanDescRC = (item: any): string => {
      const code = norm(item?.codigoRC || 'RCA');
      const txt  = stripHtml(item?.detalleCoberturaRC ?? item?.descripcionRC ?? '');
      const short = txt.split('.').shift()?.trim() || txt;
      return `${code}: ${short}`;
    };

    const tipCasco = (item?: any) => item ? `${humanDescCasco(item)} - ${ajusteDe(item)}` : '';
    const tipRC    = (item?: any) => item ? `${humanDescRC(item)} - ${ajusteDe(item)}` : '';

    const premio = (item?: any): number | undefined => {
      const n = Number(item?.premio);
      return Number.isFinite(n) ? n : undefined;
    };

    // --- índices útiles ---
    const byCasco: Record<string, any> = {};
    const rcItems: any[] = [];
    for (const it of coberturas ?? []) {
      const ccode = norm(it?.codigoCasco);
      const rcode = norm(it?.codigoRC);
      if (ccode) byCasco[ccode] = it;
      if (!ccode && rcode) rcItems.push(it);
    }

    const pickRC = (...cods: string[]) => {
      const set = new Set(cods.map(norm));
      return rcItems.find(it => set.has(norm(it?.codigoRC)));
    };

    const pickCasco = (...cods: string[]) => {
      for (const c of cods) {
        const hit = byCasco[norm(c)];
        if (hit) return hit;
      }
      return undefined;
    };

    // === RC (cualquiera de los más comunes) ===
    const rcIt = pickRC('RCA', 'RCA C/GRUA', 'RCA S/GRUA', 'RCM');

    // === C y C1 ===
    let cIt: any;
    let c1It: any;

    if (norm(tipoVehiculo) === 'MOTOVEHICULO') {
      cIt  = pickCasco('B1-80 - MOTO', 'B-80 - MOTO');
      c1It = undefined;
    } else {
      cIt  = pickCasco('C2-80', 'B1-80', 'B-80');
      c1It = pickCasco('S0', 'C1-80');
      // Fallbacks que ya usabas
      if (!cIt)  cIt  = pickCasco('C-80');
      if (!c1It) c1It = pickCasco('S', 'SIGMA IMPORTADOS');
    }

    // === TR ordenado por % de franquicia (menor → mayor) ===
    const esTR = (code: string) => /^T\d+(\s|$)/i.test(code);
    const trOrdenadas = (coberturas ?? [])
      .filter(it => it?.codigoCasco && esTR(norm(it.codigoCasco)))
      .map(it => {
        const suma = Number(it?.sumaAsegurada) || 0;
        const fran = Number(it?.franquicia) || 0;
        let perc: number | undefined = suma > 0 ? (fran / suma) * 100 : undefined;
        if (!perc || !isFinite(perc)) {
          const txt = `${it?.descripcionComercial ?? it?.descripcionCasco ?? ''}`;
          const m = txt.match(/(\d+(?:[.,]\d+)?)\s*%/);
          if (m) perc = Number(m[1].replace(',', '.'));
        }
        return { it, perc };
      })
      .filter(x => x.perc != null && Number.isFinite(x.perc))
      .sort((a, b) => (a.perc as number) - (b.perc as number));

    const d1It = trOrdenadas[0]?.it; // menor %
    const d2It = trOrdenadas[1]?.it; // medio %
    const d3It = trOrdenadas[2]?.it; // mayor %

    // === mapas tipados sin undefined ===
    const rol2codigo: Record<string, string> = {};
    const rol2tooltip: Record<string, string> = {};
    const setIf = (obj: Record<string, string>, key: string, val?: string) => { if (val) obj[key] = val; };

    setIf(rol2codigo, 'rc',  norm(rcIt?.codigoRC));
    setIf(rol2codigo, 'c',   norm(cIt?.codigoCasco));
    setIf(rol2codigo, 'c1',  norm(c1It?.codigoCasco));
    setIf(rol2codigo, 'd1',  norm(d1It?.codigoCasco));
    setIf(rol2codigo, 'd2',  norm(d2It?.codigoCasco));
    setIf(rol2codigo, 'd3',  norm(d3It?.codigoCasco));

    setIf(rol2tooltip, 'rc', tipRC(rcIt));
    setIf(rol2tooltip, 'c',  tipCasco(cIt));
    setIf(rol2tooltip, 'c1', tipCasco(c1It));
    setIf(rol2tooltip, 'd1', tipCasco(d1It));
    setIf(rol2tooltip, 'd2', tipCasco(d2It));
    setIf(rol2tooltip, 'd3', tipCasco(d3It));

    // === detallesPorCodigo tipado (SIN entradas vacías) ===
    const detallesPorCodigo: Record<string, CoberturaDet> = {};
    for (const it of coberturas ?? []) {
      const rawCode = it?.codigoCasco || it?.codigoRC;
      const code = norm(rawCode);
      if (!code) continue;

      const isRC = !it?.codigoCasco;
      const desc = isRC ? humanDescRC(it) : humanDescCasco(it);

      detallesPorCodigo[code] = {
        codigo: code,
        descripcion: desc,
        premio: premio(it),
        cuota: undefined, // RUS no trae monto por cuota en este payload
      };
    }

    // === armar fila ===
    const fila: CompaniaCotizada = {
      compania: 'Río Uruguay',

      rc:  premio(rcIt),
      c:   premio(cIt),
      c1:  premio(c1It),
      d1:  premio(d1It),
      d2:  premio(d2It),
      d3:  premio(d3It),

      rol2codigo,
      rol2tooltip,
      detallesPorCodigo,
    };

    return fila;
  }




