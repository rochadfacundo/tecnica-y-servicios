import { Cotizacion } from "../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../interfaces/cotizacionFormValue";
import { CotizacionLocalidad, CotizacionMercantil, CotizacionVehiculo, CotizacionVehiculoMoto, Productor } from "../../../interfaces/cotizacionMercantil";
import { TipoDeUso } from "../../../interfaces/tiposDeUso";
import { getTipo } from "../utils/utils";

export function buildMercantilRequest(form:CotizacionFormValue,infoauto:number):CotizacionMercantil{
      const TIPO_VEHICULO = getTipo(form.tipoVehiculo.id);
      const ANIO = Number(form.anio);
      const USO: TipoDeUso =  form.uso;
      const PRODUCTOR:Productor={ id: 86322 };
      const LOCALIDAD:CotizacionLocalidad=
      { codigo_postal: Number(form.cpLocalidadGuarda),
        id:10407,
        provincia: form.provincia.descripcion
      };
      const RASTREADOR=form.rastreador ? 1 : 0;


      let cotizacionData: CotizacionMercantil = {
        canal: 78, //canal autos
        localidad: LOCALIDAD,
        vehiculo:null,
        productor: PRODUCTOR,
        cuotas:Number(form.cuotas),
        tipo: TIPO_VEHICULO,//este lo agregue yo para validar en el backend el endpoint
        periodo: Number(form.tipoRefacturacion?.mercantilPeriodo),
        iva: Number(form.condicionFiscal.cfMercantil),
        //   comision: nose,
        //   bonificacion: nose,
        //    ajuste_suma?:number;  //10,25,50 clausula ajuste?
        desglose:true     //desglose de montos totales y cuotas
      };

      if(cotizacionData.tipo=="MOTOVEHICULO"){

        const MOTOVEHICULO:CotizacionVehiculoMoto=  {
          infoauto: infoauto,
          aniofab: ANIO,
          uso: USO.id,
          gnc: form.tieneGnc,
          rastreo: RASTREADOR };
         cotizacionData.vehiculo=MOTOVEHICULO;
         cotizacionData.canal=81; //canal motos

      }else
      {
        const VEHICULO:CotizacionVehiculo=  {
          infoauto: infoauto,
          anio: ANIO,
          uso: USO.id,
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
