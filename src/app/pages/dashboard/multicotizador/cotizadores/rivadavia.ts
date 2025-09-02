import { CompaniaCotizada } from "../../../../interfaces/companiaCotizada";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CondicionIB, CondicionIVA, DatosCotizacionRivadavia, EstadoGNC, FormaPago } from "../../../../interfaces/cotizacionRivadavia";
import { Productor } from "../../../../models/productor.model";
import { CodigosPersoneria, getRandomNumber } from "../../../../utils/utils";

export function buildRivadaviaRequest(form:CotizacionFormValue,codigoInfoAuto:number,productor:Productor){
    //formatDateSinceYear
    const gnc= form.tieneGnc ? EstadoGNC.POSEE_GNC_ASEGURA : EstadoGNC.NO_POSEE_GNC;

    const valorGnc= form.gnc? form.gnc : 0;

    //const formaPago= form.medioPago.codigo === 1 ? FormaPago.CBU : FormaPago.TARJETA_CREDITO;
    const formaPago=FormaPago.CBU;
    const configRiv = productor.companias?.find(c => c.compania === 'RIVADAVIA');
    const ajuste=20; //20 a 50

    console.log("riv",configRiv);
    let cotizacion:DatosCotizacionRivadavia={nroProductor:"",claveProductor:""};
    if(configRiv){
       cotizacion = {
        nroProductor: configRiv.nroProductor,
        claveProductor: configRiv.claveProductor,
        datoAsegurado: {
          tipoDocumento: form.tipoId,
          condicionIVA: CondicionIVA.CONSUMIDOR_FINAL,
          condicionIB: CondicionIB.CONSUMIDOR_FINAL, //lo agrego?
          nroDocumento: form.nroId,
          //cuil: "",
          //cuit: "asd",
          //fechaNacimiento?: string;
          personaJuridica:CodigosPersoneria.Rivadavia.esJuridica,
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
          tipoFacturacion: configRiv.tipoFacturacion, //tiene mas que fedpat.
          provincia: form.provincia.provinciaRiv,
          codigoPostal: form.cpLocalidadGuarda,
          sumaAseguradaAccesorios: valorGnc, //y aca sumamos resto de accesorios(int)
          sumaAseguradaEquipaje: 0,    //omnibus
          gnc: gnc,
            //cantidadAsientos?: string;
            //alarmaSatelital?: AlarmaSatelital;
            //subrogado?: boolean;
            //coeficienteRC?: number;    ESTOS SON DECUENTOS agregarlo con POLIZAS VINCULADAS
            //coeficienteCasco?: number;  ESTOS SON DESCUENTOS agregarlo con POLIZAS VINCULADAS
            //porcentajeBonificacion?: number;   DESCUENTOS PERO DESCONTANDO COMISION
            //aniosSinSiniestros?: AniosSinSiniestros;
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


    console.log("enviar a rivadavia",cotizacion);
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
  const norm = (s?: string) => (s ?? "").toUpperCase().trim();

  // ✅ Normalizador numérico (mantiene punto decimal, cambia coma por punto si no hay punto).
  const toNumber = (v: any): number | undefined => {
    if (v == null) return undefined;
    let s = String(v).trim().replace(/\$/g, "");
    if (s.includes(",") && !s.includes(".")) s = s.replace(",", ".");
    const n = parseFloat(s.replace(/\s/g, ""));
    return Number.isFinite(n) ? n : undefined;
  };

  // Index por nombre de plan
  const byPlan = new Map<string, any>();
  for (const p of planes) byPlan.set(norm(p.plan), p);

  const pickPlan = (...nombresPlanes: string[]): string | undefined => {
    for (const plan of nombresPlanes) {
      if (byPlan.has(norm(plan))) return plan;
    }
    return undefined;
  };

  const buscarPremio = (...nombresPlanes: string[]): number | undefined => {
    for (const plan of nombresPlanes) {
      const hit = byPlan.get(norm(plan));
      if (hit) return toNumber(hit.premioTotal);
    }
    return undefined;
  };

  // Detección dinámica DF → D1/D2/D3 (conservo tu lógica; ahora también guardo el nombre bruto del plan para tooltip)
  const dfPlanes = planes
    .map(p => {
      const nameNorm = norm(p.plan);
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

  // 🔧 Selección de C y C1 según tipo de vehículo (conservo tu lógica)
  const tipo = norm(vehiculo);
  let cPlans: string[] = [];
  let c1Plans: string[] = [];

  if (tipo === "VEHICULO") {
    cPlans = ["P"];     // C → P
    c1Plans = ["MX"];   // C1 → MX
  } else if (tipo === "MOTOVEHICULO") {
    cPlans = ["F"];     // C → F
    c1Plans = ["B"];    // C1 → B
  } else {
    // Fallback por si llega algo inesperado
    cPlans = ["P", "F"];
    c1Plans = ["MX", "B"];
  }

  const rcPlan = pickPlan("A");
  const cPlan  = pickPlan(...cPlans);
  const c1Plan = pickPlan(...c1Plans);

  const rc = buscarPremio("A");
  const c  = buscarPremio(...cPlans);
  const c1 = buscarPremio(...c1Plans);

  // === Resultado base (SIN romper nada de lo que tenías) ===
  const fila: CompaniaCotizada = {
    compania: "Rivadavia",
    rc,
    c,
    c1,
    d1,
    d2,
    d3,
  };

  // === Tooltips por plan (solo “Plan: XXX”) ===
  // Usamos rol2tooltip para que tu tabla lo priorice.
  const rol2tooltip: NonNullable<CompaniaCotizada['rol2tooltip']> = {};
  if (rc !== undefined && rcPlan)  rol2tooltip.rc  = `Plan ${rcPlan}: `;
  if (c  !== undefined && cPlan)   rol2tooltip.c   = `Plan ${cPlan}: `;
  if (c1 !== undefined && c1Plan)  rol2tooltip.c1  = `Plan ${c1Plan}: `;
  if (d1 !== undefined && planD1)  rol2tooltip.d1  = `Plan ${planD1}: `;
  if (d2 !== undefined && planD2)  rol2tooltip.d2  = `Plan ${planD2}: `;
  if (d3 !== undefined && planD3)  rol2tooltip.d3  = `Plan ${planD3}: `;

  if (Object.keys(rol2tooltip).length) {
    (fila as any).rol2tooltip = rol2tooltip;
  }

  return fila;
}
