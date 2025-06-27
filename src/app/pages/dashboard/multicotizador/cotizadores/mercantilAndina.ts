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
      const AJUSTE=10;

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
        //   comision: nose,
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

export function construirCotizacionMercantil(coberturas: any[]): Cotizacion {
  const buscarPremio = (producto: string): number | undefined => {
    const cobertura = coberturas.find(c => c.producto === producto);
    return cobertura?.desglose?.total?.premio;
  };

  const cotizacion: Cotizacion = {
    nroCotizacion: getRandomNumber(),
    compania: 'Mercantil Andina',
    rc: buscarPremio('A'),
    c: buscarPremio('M BASICA'),
    c1: buscarPremio('M PLUS'),
    d1: buscarPremio('D2 0020'),  //ACLARAR LOS PORCENTAJES EN EL CUADRO 20%
    d2: buscarPremio('D2 0030'),
    d3: buscarPremio('D2 0050'),
  };

  return cotizacion;
}
