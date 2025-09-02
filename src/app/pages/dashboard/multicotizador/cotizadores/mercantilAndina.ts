import { CompaniaCotizada } from "../../../../interfaces/companiaCotizada";
import { Cotizacion } from "../../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CotizacionLocalidad, CotizacionMercantil, CotizacionVehiculo, CotizacionVehiculoMoto, ProductorMercantil } from "../../../../interfaces/cotizacionMercantil";
import { Productor } from "../../../../models/productor.model";
import { getRandomNumber } from "../../../../utils/utils";

export function buildMercantilRequest(form:CotizacionFormValue,infoauto:number,productor:Productor):CotizacionMercantil{
      const TIPO_VEHICULO = form.tipoVehiculo.nombre;
      const ANIO = Number(form.anio);
      const codigoParticular=1;
      const configMA = productor.companias?.find(c => c.compania === 'MERCANTIL ANDINA');
      const LOCALIDAD:CotizacionLocalidad=
      { codigo_postal: Number(form.cpLocalidadGuarda),
        provincia: form.provincia.descripcion
      };
      const RASTREADOR=form.rastreador ? 1 : 0;
      const AJUSTE=0;
      const COMISION=20;

      const prod: ProductorMercantil={id:Number(configMA?.nroProductor)};
      const iva ={consumidorFinal:5};
      const CANAL_AUTOS=78;
      const CANAL_MOTOS=81;

      let cotizacionData: CotizacionMercantil = {
        canal: CANAL_AUTOS,
        localidad: LOCALIDAD,
        vehiculo:null,
        productor: prod,
        cuotas:configMA?.cuotas,
        tipo: TIPO_VEHICULO,//este lo agregue yo para validar en el backend el endpoint
        periodo: configMA?.periodo,
        iva: iva.consumidorFinal,
        comision: COMISION,

        //   bonificacion: nose,
        ajuste_suma:AJUSTE, //10,25,50 clausula ajuste?
        desglose:true     //desglose de montos totales y cuotas
      };

      if(cotizacionData.tipo=="MOTOVEHICULO"){

        const MOTOVEHICULO:CotizacionVehiculoMoto=  {
          infoauto: infoauto,
          aniofab: ANIO,
          uso: codigoParticular,
          gnc: form.tieneGnc,
          rastreo: RASTREADOR };

         cotizacionData.vehiculo=MOTOVEHICULO;
         cotizacionData.canal=CANAL_MOTOS;

      }else
      {
        const VEHICULO:CotizacionVehiculo=  {
          infoauto: infoauto,
          anio: ANIO,
          uso: codigoParticular,
          gnc: form.tieneGnc,
          rastreo: RASTREADOR };

          cotizacionData.vehiculo=VEHICULO;
      }

      return cotizacionData;
}

export function construirCotizacionMercantil(input: any): CompaniaCotizada {
  // ✅ Soporta dos formas de invocación:
  // 1) construirCotizacionMercantil(respuestaCompletaMercantil)  -> usa respuesta.resultado + respuesta.ajuste_suma
  // 2) construirCotizacionMercantil(respuesta.resultado)         -> usa array directo; ajuste = 0 (SIN AJUSTE)
  const coberturas: any[] = Array.isArray(input) ? input : (input?.resultado ?? []);
  const ajusteSuma: number = Array.isArray(input) ? 0 : Number(input?.ajuste_suma ?? 0);

  const toNum = (v: any): number | undefined => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const buscar = (...productos: string[]) => {
    for (const p of productos) {
      const hit = coberturas.find(c => String(c.producto).toUpperCase() === p.toUpperCase());
      if (hit) return hit;
    }
    return undefined;
  };

  const premioDe = (cob?: any): number | undefined =>
    cob?.desglose?.total?.premio != null ? toNum(cob.desglose.total.premio) : undefined;

  const humanDesc = (cob?: any): string => {
    // Ej: "D2 - TODO RIESGO..." -> "D2: TODO RIESGO..."
    const raw = String(cob?.descripcion ?? cob?.texto ?? '').trim();
    return "Plan "+raw.replace(/\s-\s/, ': ');
  };

  const ajusteStr = ajusteSuma === 0 ? 'Sin ajuste' : `Ajuste ${ajusteSuma}%`;
  const tip = (cob?: any) => (cob ? `${humanDesc(cob)} - ${ajusteStr}` : '');

  // === Picks por rol (mantengo tus reglas) ===
  const rcCob = buscar('A');

  // C y C1 (nombres con variantes)
  const cCob  = buscar('M BASICA', 'M BÁSICA');
  const c1Cob = buscar('M PLUS', 'M PLUS+');

  // TR por % franquicia
  const d1Cob = buscar('D2 0020', 'D2 0025'); // 2%
  const d2Cob = buscar('D2 0030');            // 3%
  const d3Cob = buscar('D2 0050', 'D2 0040'); // 5% o 4%

  const fila: CompaniaCotizada = {
    compania: 'Mercantil Andina',
    rc:  premioDe(rcCob),
    c:   premioDe(cCob),
    c1:  premioDe(c1Cob),
    d1:  premioDe(d1Cob),
    d2:  premioDe(d2Cob),
    d3:  premioDe(d3Cob),

    // Tooltips priorizados por tu tabla (getDesc... lee rol2tooltip primero)
    rol2codigo: {
      rc:  rcCob?.producto,
      c:   cCob?.producto,
      c1:  c1Cob?.producto,
      d1:  d1Cob?.producto,
      d2:  d2Cob?.producto,
      d3:  d3Cob?.producto,
    },
    rol2tooltip: {
      rc:  tip(rcCob),
      c:   tip(cCob),
      c1:  tip(c1Cob),
      d1:  tip(d1Cob),
      d2:  tip(d2Cob),
      d3:  tip(d3Cob),
    },
    // (Opcional) si usás detallesPorCodigo en otros lados:
    detallesPorCodigo: Object.fromEntries(
      coberturas.map((c: any) => [
        String(c.producto).toUpperCase(),
        {
          codigo: c.producto,
          descripcion: humanDesc(c),
          premio: premioDe(c),
          cuota: toNum(c?.desglose?.cuotas?.[0]?.premio),
        },
      ])
    ),
  };

  return fila;
}


