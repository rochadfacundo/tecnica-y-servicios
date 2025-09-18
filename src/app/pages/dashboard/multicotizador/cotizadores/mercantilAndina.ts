import { CompaniaCotizada } from "../../../../interfaces/companiaCotizada";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CotizacionLocalidad, CotizacionMercantil, CotizacionVehiculo, CotizacionVehiculoMoto, ProductorMercantil } from "../../../../interfaces/cotizacionMercantil";
import { Productor } from "../../../../models/productor.model";

export function buildMercantilRequest(form:CotizacionFormValue,infoauto:number,productor:Productor):CotizacionMercantil{
  const TIPO_VEHICULO = form.tipoVehiculo.nombre;
  const ANIO = Number(form.anio);
  const codigoParticular=1;
  const configMA = productor.companias?.find(c => c.compania === 'MERCANTIL ANDINA');
  const LOCALIDAD:CotizacionLocalidad = {
    codigo_postal: Number(form.cpLocalidadGuarda),
    provincia: form.provincia.descripcion,
    id: Number(form.inderLocalidad)
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
    tipo: TIPO_VEHICULO,
    periodo: configMA?.periodo,
    iva: iva.consumidorFinal,
    comision: COMISION,
    ajuste_suma:AJUSTE,
    desglose:true
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
  }else {
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
    const raw = String(cob?.descripcion ?? cob?.texto ?? '').trim();
    return "Plan "+raw.replace(/\s-\s/, ': ');
  };

  const ajusteStr = ajusteSuma === 0 ? 'Sin ajuste' : `Ajuste ${ajusteSuma}%`;
  const tip = (cob?: any) => (cob ? `${humanDesc(cob)} - ${ajusteStr}` : '');

  // === Picks por rol ===
  const rcCob  = buscar('A');
  const b1Cob  = buscar('B1');
  const b2Cob  = buscar('B');
  const cCob   = buscar('M BASICA', 'M BÁSICA');
  const c1Cob  = buscar('M PLUS', 'M PLUS+');

  // TR fijos
  const d1Cob = buscar('D2 0020'); // 2%
  const d2Cob = buscar('D2 0030'); // 3%
  const d3Cob = buscar('D2 0040'); // 4%
  const d4Cob = buscar('D2 0050'); // 5%

  const fila: CompaniaCotizada = {
    compania: 'Mercantil Andina',
    rc:  premioDe(rcCob),
    b1:  premioDe(b1Cob),
    b2:  premioDe(b2Cob),
    c2:   premioDe(cCob),
    c3:  premioDe(c1Cob),
    d1:  premioDe(d1Cob),
    d2:  premioDe(d2Cob),
    d3:  premioDe(d3Cob),
    d4:  premioDe(d4Cob),

    rol2codigo: {
      rc:  rcCob?.producto,
      b1:  b1Cob?.producto,
      b2:  b2Cob?.producto,
      c2:  cCob?.producto,
      c3:  c1Cob?.producto,
      d1:  d1Cob?.producto,
      d2:  d2Cob?.producto,
      d3:  d3Cob?.producto,
      d4:  d4Cob?.producto,
    },
    rol2tooltip: {
      rc:  tip(rcCob),
      b1:  tip(b1Cob),
      b2:  tip(b2Cob),
      c2:  cCob?.producto,
      c3:  c1Cob?.producto,
      d1:  tip(d1Cob),
      d2:  tip(d2Cob),
      d3:  tip(d3Cob),
      d4:  tip(d4Cob),
    },
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
