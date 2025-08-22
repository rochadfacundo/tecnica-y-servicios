
import { CompaniaCotizada, Cotizacion } from "../../../../interfaces/cotizacion";
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

  // ✅ No removemos "." (decimal). Solo sacamos $ y espacios.
  // Si hay coma y no hay punto, asumimos coma decimal y la cambiamos por punto.
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

  // Detección dinámica de DF (D F1, DF2, etc.)
  const dfPlanes = planes
    .map(p => {
      const name = norm(p.plan);
      const m = /^D\s*F\s*(\d+)\b/.exec(name) || /^DF\s*(\d+)\b/.exec(name);
      return m ? { num: parseInt(m[1], 10), premio: toNumber(p.premioTotal) } : null;
    })
    .filter((x): x is { num: number; premio: number | undefined } => !!x && x.premio !== undefined)
    .sort((a, b) => a.num - b.num); // menor → mayor

  // --- Mapeo a D1/D2/D3 sin duplicar cuando hay 2 elementos ---
  let d1: number | undefined;
  let d2: number | undefined;
  let d3: number | undefined;

  const n = dfPlanes.length;
  if (n === 0) {
    // sin DF → d1/d2/d3 quedan undefined
  } else if (n === 1) {
    // solo un DF → va a D3
    d3 = dfPlanes[0].premio;
  } else if (n === 2) {
    // dos DF → D1 vacío, D2 = menor, D3 = mayor
    d2 = dfPlanes[0].premio;
    d3 = dfPlanes[1].premio;
  } else {
    // 3 o más → D1 = menor, D2 = mediana, D3 = mayor
    d1 = dfPlanes[0].premio;
    d2 = dfPlanes[Math.floor(n / 2)].premio;
    d3 = dfPlanes[n - 1].premio;
  }

  const rc = buscarPremio("A");
  const c  = buscarPremio("P", "F");
  const c1 = buscarPremio("MX", "B");

  return {
    compania: "Rivadavia",
    rc,
    c,
    c1,
    d1,
    d2,
    d3,
  };
}


