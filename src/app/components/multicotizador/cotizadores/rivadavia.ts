import { Cotizacion } from "../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../interfaces/cotizacionFormValue";
import { CondicionIB, DatosCotizacionRivadavia, EstadoGNC, FormaPago } from "../../../interfaces/cotizacionRivadavia";
import { CodigosPersoneria } from "../utils/utils";

export function buildRivadaviaRequest(form:CotizacionFormValue,codigoInfoAuto:number,codigoRivadavia:string,sumaRivadavia:string){
    //formatDateSinceYear
    const gnc= form.tieneGnc ? EstadoGNC.POSEE_GNC_ASEGURA : EstadoGNC.NO_POSEE_GNC;

    const valorGnc= form.gnc? form.gnc : 0;

    const formaPago= form.medioPago.codigo === 1 ? FormaPago.CBU : FormaPago.TARJETA_CREDITO;

    console.log("forma pago rivadavia",formaPago);
    const cotizacion: DatosCotizacionRivadavia = {
      nroProductor: "18922",
      claveProductor: "THLV2582",
      datoAsegurado: {
        tipoDocumento: form.tipoId,
        condicionIVA: form.condicionFiscal.cfRivadavia,
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
        porcentajeAjuste: Number(form.clausulaAjuste.codigo),
      },
      datoPoliza: {
        nroPoliza: "12322",
        fechaVigenciaDesde: form.vigenciaDesde,
        fechaVigenciaHasta: form.vigenciaHasta,
        cantidadCuotas: String(form.cuotas),
        tipoFacturacion: form.tipoRefacturacion.descripcion, //tiene mas que fedpat.
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

    return cotizacion;

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
    compania: 'Rivadavia',
    rc: buscarPremio('A'),
    c: buscarPremio('P'),
    c1: buscarPremio('MX'),
    d1: buscarPremio('D F1', 'D F2'),  // intenta con D F1, si no está usa D F2
    d2: buscarPremio('D F3'),
    d3: buscarPremio('D F5'),
  };
}

