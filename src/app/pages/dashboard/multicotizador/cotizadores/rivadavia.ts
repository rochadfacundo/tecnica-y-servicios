import { CompaniaCotizada } from "../../../../interfaces/companiaCotizada";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CondicionIB, CondicionIVA, DatosCotizacionRivadavia, EstadoGNC, FormaPago } from "../../../../interfaces/cotizacionRivadavia";
import { Productor } from "../../../../models/productor.model";
import { CodigosPersoneria } from "../../../../utils/utils";

import PLANES_RIV from '../../../../../assets/planesRivadavia.json';

type PlanRiv = { codigo: string; descripcion: string };
const norm = (s?: string) => (s ?? '').toUpperCase().trim();

// Mapa código → descripción normalizado (A, P, MX, DFx, etc.)
const DESC_RIV: Record<string, string> = {};
for (const it of (PLANES_RIV as PlanRiv[])) {
  DESC_RIV[norm(it.codigo)] = (it.descripcion ?? '').trim();
}

// Helper para obtener la descripción por código/plan
const descPlan = (code?: string) => {
  if (!code) return undefined;
  return DESC_RIV[norm(code)];
}

export function buildRivadaviaRequest(
  form: CotizacionFormValue,
  codigoInfoAuto: number,
  productor: Productor
) {
  const gnc = form.tieneGnc ? EstadoGNC.POSEE_GNC_ASEGURA : EstadoGNC.NO_POSEE_GNC;
  const valorGnc = form.gnc ? form.gnc : 0;

  const formaPago = FormaPago.CBU;
  const configRiv = productor.companias?.find(c => c.compania === 'RIVADAVIA');
  const ajuste = 20; // 20 a 50

  console.log("riv", configRiv);
  let cotizacion: DatosCotizacionRivadavia = { nroProductor: "", claveProductor: "" };

  if (configRiv) {
    cotizacion = {
      nroProductor: configRiv.nroProductor,
      claveProductor: configRiv.claveProductor,
      datoAsegurado: {
        tipoDocumento: form.tipoId,
        condicionIVA: CondicionIVA.CONSUMIDOR_FINAL,
        condicionIB: CondicionIB.CONSUMIDOR_FINAL,
        nroDocumento: form.nroId,
        personaJuridica: CodigosPersoneria.Rivadavia.esJuridica,
        formaPago: formaPago
      },
      datoVehiculo: {
        codigoInfoAuto: String(codigoInfoAuto),
        codigoVehiculo: "",
        modeloAnio: String(form.anio),
        sumaAsegurada: 0,
        porcentajeAjuste: ajuste,
      },
      datoPoliza: {
        nroPoliza: "12322",
        fechaVigenciaDesde: form.vigenciaDesde,
        fechaVigenciaHasta: calcularFechaHastaPorTipoFacturacion(form.vigenciaDesde, configRiv.tipoFacturacion),
        cantidadCuotas: configRiv.cantidadCuotas,
        tipoFacturacion: configRiv.tipoFacturacion,
        provincia: form.provincia.provinciaRiv,
        codigoPostal: form.cpLocalidadGuarda,
        sumaAseguradaAccesorios: valorGnc,
        sumaAseguradaEquipaje: 0,
        gnc: gnc,
      },
      polizasVinculadas: {
        accidentePasajeros: "n",
        accidentePersonales: "n",
        combinadoFamiliar: "n",
        incendio: "n",
        vidaIndividual: "n"
      }
    };
  }

  console.log("enviar a rivadavia", cotizacion);
  return cotizacion;
}

function calcularFechaHastaPorTipoFacturacion(desde: string, tipoFacturacion?: string): string {
  const mapa: Record<string, number> = {
    CUATRIMESTRAL: 4,
    ANUAL: 12,
    SEMESTRAL: 6,
    MENSUAL: 1,
    TRIMESTRAL: 3,
  };

  const meses = tipoFacturacion ? mapa[tipoFacturacion] || 0 : 0;
  const fecha = new Date(desde);

  fecha.setMonth(fecha.getMonth() + meses);

  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

export function construirCotizacionRivadavia(planes: any[], vehiculo: string): CompaniaCotizada {
  const normLocal = (s?: string) => (s ?? "").toUpperCase().trim();

  const toNumber = (v: any): number | undefined => {
    if (v == null) return undefined;
    let s = String(v).trim().replace(/\$/g, "");
    if (s.includes(",") && !s.includes(".")) s = s.replace(",", ".");
    const n = parseFloat(s.replace(/\s/g, ""));
    return Number.isFinite(n) ? n : undefined;
  };

  const byPlan = new Map<string, any>();
  for (const p of planes) byPlan.set(normLocal(p.plan), p);

  const pickPlan = (...nombresPlanes: string[]): string | undefined => {
    for (const plan of nombresPlanes) {
      if (byPlan.has(normLocal(plan))) return plan;
    }
    return undefined;
  };

  const buscarPremio = (...nombresPlanes: string[]): number | undefined => {
    for (const plan of nombresPlanes) {
      const hit = byPlan.get(normLocal(plan));
      if (hit) return toNumber(hit.premioTotal);
    }
    return undefined;
  };

  // Detección DFx → D1/D2/D3
  const dfPlanes = planes
    .map(p => {
      const nameNorm = normLocal(p.plan);
      const m = /^D\s*F\s*(\d+)\b/.exec(nameNorm) || /^DF\s*(\d+)\b/.exec(nameNorm);
      return m ? { num: parseInt(m[1], 10), premio: toNumber(p.premioTotal), planRaw: String(p.plan) } : null;
    })
    .filter((x): x is { num: number; premio: number | undefined; planRaw: string } => !!x && x.premio !== undefined)
    .sort((a, b) => a.num - b.num);

  let d1: number | undefined, d2: number | undefined, d3: number | undefined;
  let planD1: string | undefined, planD2: string | undefined, planD3: string | undefined;

  const n = dfPlanes.length;
  if (n === 1) {
    d3 = dfPlanes[0].premio; planD3 = dfPlanes[0].planRaw;
  } else if (n === 2) {
    d2 = dfPlanes[0].premio; planD2 = dfPlanes[0].planRaw;
    d3 = dfPlanes[1].premio; planD3 = dfPlanes[1].planRaw;
  } else if (n >= 3) {
    d1 = dfPlanes[0].premio;                       planD1 = dfPlanes[0].planRaw;
    d2 = dfPlanes[Math.floor(n / 2)].premio;       planD2 = dfPlanes[Math.floor(n / 2)].planRaw;
    d3 = dfPlanes[n - 1].premio;                   planD3 = dfPlanes[n - 1].planRaw;
  }

  // Planes específicos
  const rcPlan = pickPlan("A");
  const b1Plan = pickPlan("F");
  const b2Plan = pickPlan("B");
  const cPlan  = pickPlan("C");
  const c1Plan = pickPlan("M");
  const c2Plan = pickPlan("P");
  const c3Plan = pickPlan("MX");

  const rc  = buscarPremio("A");
  const b1  = buscarPremio("F");
  const b2  = buscarPremio("B");
  const c   = buscarPremio("C");
  const c1  = buscarPremio("M");
  const c2  = buscarPremio("P");
  const c3  = buscarPremio("MX");

  // Resultado base
  const fila: CompaniaCotizada = {
    compania: "Rivadavia",
    rc,
    b1,
    b2,
    c,
    c1,
    c2,
    c3,
    d1,
    d2,
    d3,
  };

  // rol2codigo
  const rol2codigo: Record<string, string> = {};
  if (rc !== undefined && rcPlan) rol2codigo["rc"] = rcPlan;
  if (b1 !== undefined && b1Plan) rol2codigo["b1"] = b1Plan;
  if (b2 !== undefined && b2Plan) rol2codigo["b2"] = b2Plan;
  if (c  !== undefined && cPlan)  rol2codigo["c"]  = cPlan;
  if (c1 !== undefined && c1Plan) rol2codigo["c1"] = c1Plan;
  if (c2 !== undefined && c2Plan) rol2codigo["c2"] = c2Plan;
  if (c3 !== undefined && c3Plan) rol2codigo["c3"] = c3Plan;
  if (d1 !== undefined && planD1) rol2codigo["d1"] = planD1;
  if (d2 !== undefined && planD2) rol2codigo["d2"] = planD2;
  if (d3 !== undefined && planD3) rol2codigo["d3"] = planD3;
  if (Object.keys(rol2codigo).length) (fila as any).rol2codigo = rol2codigo;

  // detallesPorCodigo
  const detallesPorCodigo: Record<string, { descripcion: string }> = {};
  for (const code of Object.values(rol2codigo)) {
    const desc = descPlan(code);
    if (desc) detallesPorCodigo[code] = { descripcion: desc };
  }
  if (Object.keys(detallesPorCodigo).length) (fila as any).detallesPorCodigo = detallesPorCodigo;

  // tooltips
  const withDesc = (plan?: string) => {
    if (!plan) return '';
    const d = descPlan(plan);
    return d ? `Plan ${d}` : `Plan ${plan}`;
  };

  const rol2tooltip: NonNullable<CompaniaCotizada['rol2tooltip']> = {};
  if (rc !== undefined && rcPlan)  rol2tooltip.rc  = withDesc(rcPlan);
  if (b1 !== undefined && b1Plan) rol2tooltip.b1  = withDesc(b1Plan);
  if (b2 !== undefined && b2Plan) rol2tooltip.b2  = withDesc(b2Plan);
  if (c  !== undefined && cPlan)  rol2tooltip.c   = withDesc(cPlan);
  if (c1 !== undefined && c1Plan) rol2tooltip.c1  = withDesc(c1Plan);
  if (c2 !== undefined && c2Plan) rol2tooltip.c2  = withDesc(c2Plan);
  if (c3 !== undefined && c3Plan) rol2tooltip.c3  = withDesc(c3Plan);
  if (d1 !== undefined && planD1) rol2tooltip.d1  = withDesc(planD1);
  if (d2 !== undefined && planD2) rol2tooltip.d2  = withDesc(planD2);
  if (d3 !== undefined && planD3) rol2tooltip.d3  = withDesc(planD3);

  if (Object.keys(rol2tooltip).length) (fila as any).rol2tooltip = rol2tooltip;

  return fila;
}
