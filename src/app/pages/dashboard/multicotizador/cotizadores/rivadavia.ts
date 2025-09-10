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

export function buildRivadaviaRequest(
  form: CotizacionFormValue,
  codigoInfoAuto: number,
  productor: Productor
) {
  const gnc = form.tieneGnc
    ? EstadoGNC.POSEE_GNC_ASEGURA
    : EstadoGNC.NO_POSEE_GNC;

  const valorGnc = form.gnc ? form.gnc : 0;

  const formaPago = FormaPago.CBU;
  const configRiv = productor.companias?.find(
    (c) => c.compania === "RIVADAVIA"
  );
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

function calcularFechaHastaPorTipoFacturacion(
  desde: string,
  tipoFacturacion?: string
): string {
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

export function construirCotizacionRivadavia(
  planes: any[]
): CompaniaCotizada {
  const norm = (s?: string) => (s ?? "").toUpperCase().trim();

  const toNumber = (v: any): number | undefined => {
    if (v == null) return undefined;
    let s = String(v).trim().replace(/\$/g, "");
    if (s.includes(",") && !s.includes(".")) s = s.replace(",", ".");
    const n = parseFloat(s.replace(/\s/g, ""));
    return Number.isFinite(n) ? n : undefined;
  };

  const byPlan = new Map<string, any>();
  for (const p of planes) byPlan.set(norm(p.plan), p);

  const buscarPremio = (...nombresPlanes: string[]): number | undefined => {
    for (const plan of nombresPlanes) {
      const hit = byPlan.get(norm(plan));
      if (hit) return toNumber(hit.premioTotal);
    }
    return undefined;
  };

  // Detección dinámica de DF (ej.: "D F1", "DF2", etc.)
  const dfPlanes = planes
    .map((p) => {
      const name = norm(p.plan);
      const m = /^D\s*F\s*(\d+)\b/.exec(name) || /^DF\s*(\d+)\b/.exec(name);
      return m
        ? { num: parseInt(m[1], 10), premio: toNumber(p.premioTotal) }
        : null;
    })
    .filter(
      (x): x is { num: number; premio: number } =>
        !!x && x.premio !== undefined
    )
    .sort((a, b) => a.num - b.num);

  // Asignación a D1/D2/D3
  let d1: number | undefined;
  let d2: number | undefined;
  let d3: number | undefined;

  const count = dfPlanes.length;
  if (count === 1) {
    d3 = dfPlanes[0].premio;
  } else if (count === 2) {
    d2 = dfPlanes[0].premio;
    d3 = dfPlanes[1].premio;
  } else if (count >= 3) {
    d1 = dfPlanes[0].premio;
    d2 = dfPlanes[Math.floor(count / 2)].premio;
    d3 = dfPlanes[count - 1].premio;
  }

  return {
    compania: "Rivadavia",
    rc: buscarPremio("A"),
    c: buscarPremio("P", "F"),
    c1: buscarPremio("MX", "B"),
    d1,
    d2,
    d3,
  };
}
