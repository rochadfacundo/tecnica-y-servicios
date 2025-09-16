
//cambiemos rio uruguay chat. mira la captura.


// cobertura B1 se guarda en interface CompaniaCotizada b1
// cobertura B se guarda en interface CompaniaCotizada b2
// buscar las siguientes todo riesgo: (4)
// T34 es 2%
// T32 es 3%
// T31 es 5%
// T37 es 7%



// b1 en companiaCotizada debe ser: 'B1-80'
// b2 en companiaCotizada debe ser: 'B-80'
//c1 en companiaCotizada debe ser: 'S0' o 'S' o 'SIGMA IMPORTADOS'

// C NO SE USA C1-80 ni C2-80.. C se carga con cobertura 'C3-80'
// como esta y Rc como esta
// T44 es 10%: NO LA VAMOS A USAR!!!!!!!!!!!!!!!!!!!!!!!!!!!!





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

    const premio = (item?: any): number | undefined => {
      const n = Number(item?.premio);
      return Number.isFinite(n) ? n : undefined;
    };

    const humanDesc = (item: any): string => {
      if (!item) return '';
      let raw = stripHtml(item?.descripcionComercial ?? item?.descripcionCasco ?? item?.detalleCoberturaRC ?? '');

      // 🧹 eliminar repeticiones tipo "(T31)" o "(T32)" que ya están en el código
      raw = raw.replace(/\([A-Z0-9\-]+\)$/i, '').trim();

      return raw;
    };


    const tipFor = (item?: any) => item ? `${humanDesc(item)} - Ajuste ${item?.ajusteAutomatico || 'N/D'}` : '';

    // --- índices por código ---
    const byCode: Record<string, any> = {};
    const rcItems: any[] = [];
    for (const it of coberturas ?? []) {
      const codeCasco = norm(it?.codigoCasco);
      const codeRC    = norm(it?.codigoRC);
      if (codeCasco) byCode[codeCasco] = it;
      if (!codeCasco && codeRC) rcItems.push(it);
    }

    // helpers
    const getRC = () => {
      // 👉 prioridad a RCA C/GRUA
      const conGrua = rcItems.find(it => norm(it?.codigoRC) === 'RCA C/GRUA');
      if (conGrua) return conGrua;

      // fallback a RCA o RCA S/GRUA
      return rcItems.find(it =>
        ['RCA','RCA S/GRUA','RCM'].includes(norm(it?.codigoRC))
      );
    };

    const get = (code: string) => byCode[norm(code)];

    // === Roles ===
    const rcIt  = getRC();
    const b1It  = get('B1-80');
    const b2It  = get('B-80');
    const cIt   = get('C3-80');
    const c1It  = get('S0') || get('S') || get('SIGMA IMPORTADOS');

    // TR fijos
    const d1It = get('T34'); // 2%
    const d2It = get('T32'); // 3%
    const d3It = get('T31'); // 5%
    const d4It = get('T37'); // 7%
    // T44 ignorado

    // === mapas ===
    const rol2codigo: Record<string, string> = {};
    const rol2tooltip: Record<string, string> = {};

    const setIf = (rol: string, code: string | undefined, item: any) => {
      if (code && item) {
        rol2codigo[rol] = code;
        rol2tooltip[rol] = tipFor(item);
      }
    };

    setIf('rc',  norm(rcIt?.codigoRC), rcIt);
    setIf('b1',  'B1-80', b1It);
    setIf('b2',  'B-80', b2It);
    setIf('c2', 'C3-80', cIt);
    setIf('c3', norm(c1It?.codigoCasco), c1It);
    setIf('d1',  'T34', d1It);
    setIf('d2',  'T32', d2It);
    setIf('d3',  'T31', d3It);
    setIf('d4',  'T37', d4It);

    // === detallesPorCodigo ===
    const detallesPorCodigo: Record<string, CoberturaDet> = {};
    for (const [code, it] of Object.entries(byCode)) {
      detallesPorCodigo[code] = {
        codigo: code,
        descripcion: humanDesc(it),
        premio: premio(it),
        cuota: undefined,
      };
    }

    // === fila final ===
    const fila: CompaniaCotizada = {
      compania: 'Río Uruguay',

      rc:  premio(rcIt),
      b1:  premio(b1It),
      b2:  premio(b2It),
      c2:  premio(cIt),
      c3:  premio(c1It),
      d1:  premio(d1It),
      d2:  premio(d2It),
      d3:  premio(d3It),
      d4:  premio(d4It),

      rol2codigo,
      rol2tooltip,
      detallesPorCodigo,
    };

    return fila;
  }





