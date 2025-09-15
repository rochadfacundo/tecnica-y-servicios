import { Cotizacion } from "../../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import {
  CondicionIB,
  CondicionIVA,
  DatosCotizacionRivadavia,
  EstadoGNC,
  FormaPago,
} from "../../../../interfaces/cotizacionRivadavia";
import { Productor } from "../../../../models/productor.model";
import { CodigosPersoneria } from "../../../../utils/utils";
import { CompaniaCotizada } from "../../../../interfaces/companiaCotizada";
import { ETipoVehiculo } from "../../../../enums/tipoVehiculos";

/** Cache en memoria de códigos->descripción de planes Rivadavia (assets/planesRivadavia.json) */
let __planesRivadaviaCache: Record<string, string> | null = null;

type PlanJson = { codigo: string; descripcion: string };

const norm = (s?: string) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase().trim();

/** Carga y cachea el mapa { CODIGO_NORMALIZADO -> descripcion } desde assets */
async function loadPlanesRivadaviaMap(): Promise<Record<string, string>> {
  if (__planesRivadaviaCache) return __planesRivadaviaCache;

  const resp = await fetch("assets/planesRivadavia.json", { cache: "no-store" });
  if (!resp.ok) throw new Error("No se pudo leer assets/planesRivadavia.json");
  const arr = (await resp.json()) as PlanJson[];

  const map: Record<string, string> = {};
  for (const it of arr) {
    map[norm(it.codigo)] = (it.descripcion ?? "").trim();
  }
  __planesRivadaviaCache = map;
  return map;
}

/** ====== REQUEST A RIVADAVIA ====== */
export function buildRivadaviaRequest(
  form: CotizacionFormValue,
  codigoInfoAuto: number,
  productor: Productor
) {
  const gnc = form.tieneGnc ? EstadoGNC.POSEE_GNC_ASEGURA : EstadoGNC.NO_POSEE_GNC;
  const valorGnc = form.gnc ? form.gnc : 0;

  const formaPago = FormaPago.CBU;
  const configRiv = productor.companias?.find((c) => c.compania === "RIVADAVIA");
  const ajuste = 20;

  let cotizacion: DatosCotizacionRivadavia = {
    nroProductor: "",
    claveProductor: "",
  };

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
        formaPago: formaPago,
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
        fechaVigenciaHasta: calcularFechaHastaPorTipoFacturacion(
          form.vigenciaDesde,
          configRiv.tipoFacturacion
        ),
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
        vidaIndividual: "n",
      },
    };
  }

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
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** ====== PARSEO/CONSTRUCCIÓN DE COTIZACIÓN RIVADAVIA ======
 * Lee planes devueltos por el WS y arma la fila normalizada para tu tabla.
 * Carga descripciones desde assets/planesRivadavia.json para los tooltips.
 */
export async function construirCotizacionRivadavia(
  planes: any[],
  _tipoVehiculo?: ETipoVehiculo // reservado por si más adelante lo usás
): Promise<CompaniaCotizada> {
  const descMap = await loadPlanesRivadaviaMap();

  const toNumber = (v: any): number | undefined => {
    if (v == null) return undefined;
    let s = String(v).trim().replace(/\$/g, "");
    if (s.includes(",") && !s.includes(".")) s = s.replace(",", ".");
    const n = parseFloat(s.replace(/\s/g, ""));
    return Number.isFinite(n) ? n : undefined;
  };

  // Índice "plan normalizado" -> item
  const byPlan = new Map<string, any>();
  for (const p of planes) byPlan.set(norm(p.plan), p);

  const buscarPremio = (...codigos: string[]): number | undefined => {
    for (const code of codigos) {
      const hit = byPlan.get(norm(code));
      if (hit) return toNumber(hit.premioTotal);
    }
    return undefined;
  };

  const pickPlanCode = (...codigos: string[]): string | undefined => {
    for (const code of codigos) {
      if (byPlan.has(norm(code))) return code;
    }
    return undefined;
  };

  // === DFx → D1/D2/D3 por orden ascendente del número (3/4/5, etc.) ===
  const dfPlanes = planes
    .map((p) => {
      const name = norm(p.plan);
      const m = /^D\s*F\s*(\d+)\b/.exec(name) || /^DF\s*(\d+)\b/.exec(name);
      return m ? { num: parseInt(m[1], 10), premio: toNumber(p.premioTotal), rawPlan: p.plan as string } : null;
    })
    .filter((x): x is { num: number; premio: number; rawPlan: string } => !!x && x.premio !== undefined)
    .sort((a, b) => a.num - b.num);

  let d1: number | undefined;
  let d2: number | undefined;
  let d3: number | undefined;
  let planD1: string | undefined;
  let planD2: string | undefined;
  let planD3: string | undefined;

  const count = dfPlanes.length;
  if (count === 1) {
    d3 = dfPlanes[0].premio; planD3 = dfPlanes[0].rawPlan;
  } else if (count === 2) {
    d2 = dfPlanes[0].premio; planD2 = dfPlanes[0].rawPlan;
    d3 = dfPlanes[1].premio; planD3 = dfPlanes[1].rawPlan;
  } else if (count >= 3) {
    d1 = dfPlanes[0].premio; planD1 = dfPlanes[0].rawPlan;
    d2 = dfPlanes[Math.floor(count / 2)].premio; planD2 = dfPlanes[Math.floor(count / 2)].rawPlan;
    d3 = dfPlanes[count - 1].premio; planD3 = dfPlanes[count - 1].rawPlan;
  }

  // === Planes “clásicos” por código ===
  const rc  = buscarPremio("A");
  const b1  = buscarPremio("F");
  const b2  = buscarPremio("B");
  const c   = buscarPremio("C");
  const c1  = buscarPremio("M");
  const c2  = buscarPremio("P");
  const c3  = buscarPremio("MX");

  const rcPlan  = pickPlanCode("A");
  const b1Plan  = pickPlanCode("F");
  const b2Plan  = pickPlanCode("B");
  const cPlan   = pickPlanCode("C");
  const c1Plan  = pickPlanCode("M");
  const c2Plan  = pickPlanCode("P");
  const c3Plan  = pickPlanCode("MX");

  // === Fila base ===
  const fila: CompaniaCotizada = {
    compania: "Rivadavia",
    rc, b1, b2, c, c1, c2, c3,
    d1, d2, d3,
  };

  // === rol -> código real que devolvió la compañía ===
  const rol2codigo: Record<string, string> = {};
  if (rc  !== undefined && rcPlan)  rol2codigo["rc"]  = rcPlan;
  if (b1  !== undefined && b1Plan)  rol2codigo["b1"]  = b1Plan;
  if (b2  !== undefined && b2Plan)  rol2codigo["b2"]  = b2Plan;
  if (c   !== undefined && cPlan)   rol2codigo["c"]   = cPlan;
  if (c1  !== undefined && c1Plan)  rol2codigo["c1"]  = c1Plan;
  if (c2  !== undefined && c2Plan)  rol2codigo["c2"]  = c2Plan;
  if (c3  !== undefined && c3Plan)  rol2codigo["c3"]  = c3Plan;
  if (d1  !== undefined && planD1)  rol2codigo["d1"]  = planD1;
  if (d2  !== undefined && planD2)  rol2codigo["d2"]  = planD2;
  if (d3  !== undefined && planD3)  rol2codigo["d3"]  = planD3;
  if (Object.keys(rol2codigo).length) (fila as any).rol2codigo = rol2codigo;

  // === detallesPorCodigo: usa el assets para traer la descripción humana ===
  const detallesPorCodigo: Record<string, { descripcion: string }> = {};
  for (const code of Object.values(rol2codigo)) {
    const d = descMap[norm(code)];
    if (d) detallesPorCodigo[code] = { descripcion: d };
  }
  if (Object.keys(detallesPorCodigo).length) (fila as any).detallesPorCodigo = detallesPorCodigo;

  // === tooltips listos por rol (prioridad sobre mapa de códigos) ===
  const withDesc = (code?: string) => {
    if (!code) return "";
    const d = descMap[norm(code)];
    return d ? `Plan ${d}` : `Plan ${code}`;
  };

  const rol2tooltip: NonNullable<CompaniaCotizada["rol2tooltip"]> = {};
  if (rc !== undefined && rcPlan)  rol2tooltip.rc  = withDesc(rcPlan);
  if (b1 !== undefined && b1Plan)  rol2tooltip.b1  = withDesc(b1Plan);
  if (b2 !== undefined && b2Plan)  rol2tooltip.b2  = withDesc(b2Plan);
  if (c  !== undefined && cPlan)   rol2tooltip.c   = withDesc(cPlan);
  if (c1 !== undefined && c1Plan)  rol2tooltip.c1  = withDesc(c1Plan);
  if (c2 !== undefined && c2Plan)  rol2tooltip.c2  = withDesc(c2Plan);
  if (c3 !== undefined && c3Plan)  rol2tooltip.c3  = withDesc(c3Plan);
  if (d1 !== undefined && planD1)  rol2tooltip.d1  = withDesc(planD1);
  if (d2 !== undefined && planD2)  rol2tooltip.d2  = withDesc(planD2);
  if (d3 !== undefined && planD3)  rol2tooltip.d3  = withDesc(planD3);
  if (Object.keys(rol2tooltip).length) (fila as any).rol2tooltip = rol2tooltip;

  return fila;
}
