
import { Cotizacion } from "../../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CondicionIB, CondicionIVA, DatosCotizacionRivadavia, EstadoGNC, FormaPago } from "../../../../interfaces/cotizacionRivadavia";
import { Productor } from "../../../../models/productor.model";
import { CodigosPersoneria, getRandomNumber } from "../utils/utils";

export function buildRivadaviaRequest(form:CotizacionFormValue,codigoInfoAuto:number,codigoRivadavia:string,sumaRivadavia:string,productor:Productor){
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
          codigoVehiculo: String(codigoRivadavia),
          modeloAnio: String(form.anio),
          sumaAsegurada: Number(sumaRivadavia),
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



export function construirCotizacionRivadavia(planes: any[]): Cotizacion {
  if (!Array.isArray(planes)) {
    console.error('❌ El parámetro "planes" no es un array:', planes);
    return { compania: 'Rivadavia' };
  }

  const buscarPremio = (...nombresPlanes: string[]): number | undefined => {
    for (const plan of nombresPlanes) {
      const item = planes.find(p => p.plan === plan);
      if (item) return parseFloat(item.premioTotal);
    }
    return undefined;
  };

  return {
    nroCotizacion: getRandomNumber(),
    compania: 'Rivadavia',
    rc: buscarPremio('A'),
    c: buscarPremio('P'),
    c1: buscarPremio('MX'),
    d1: buscarPremio('D F1', 'D F2'),  // intenta con D F1, si no está usa D F2
    d2: buscarPremio('D F3'),
    d3: buscarPremio('D F5'),
  };
}

