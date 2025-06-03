import { XMLParser } from "fast-xml-parser";
import { MedioPago, Plan } from "../../../enums/EnumAtm";
import { Cotizacion, CotizacionATM } from "../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../interfaces/cotizacionFormValue";
import { CodigosPersoneria, getYesNo } from "../utils/utils";

export function buildATMRequest(form: CotizacionFormValue,infoAuto:string):string{
  const today = form.vigenciaDesde;
  const [year, month, day] = today.split('-');
  const atmFormatDay = `${day}${month}${year}`;
  const alarma= form.alarma ? 1: 0;
  const ajuste = form.clausulaAjuste.codigo;
  const seccionAuto=3;
  const yes = 'S';
  const no = 'N';
  const descripcion = form.tipoRefacturacion.descripcion.trim().toUpperCase();
  const uso= '0101';



  const medioPago: MedioPago =
    form.medioPago.codigo === 1
      ? MedioPago.EFVO
      : form.medioPago.codigo === 2
      ? MedioPago.TARJETA
      : MedioPago.CBU;

  let plan: Plan;

  if (descripcion.includes('MENSUAL') && medioPago === MedioPago.TARJETA) {
    plan = Plan.MENSUAL_TARJETA;
  } else if (descripcion.includes('MENSUAL') && medioPago === MedioPago.CBU) {
    plan = Plan.MENSUAL_CBU;
  } else if (descripcion.includes('BIMESTRAL') && medioPago === MedioPago.TARJETA) {
    plan = Plan.BIMESTRAL_TARJETA;
  } else if (descripcion.includes('BIMESTRAL')  && medioPago === MedioPago.EFVO) {
    plan = Plan.BIMESTRAL_EFVO;
  } else if (descripcion.includes('TRIMESTRAL') && medioPago === MedioPago.EFVO) {
    plan = Plan.TRIMESTRAL_EFVO;
  } else {
    plan = Plan.DESCONOCIDO;
  }

  const xml = `
  <soapenv:Envelope xmlns:tem="http://tempuri.org/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <soapenv:Body>
         <tem:AUTOS_Cotizar>
            <tem:doc_in>
   <auto>
     <usuario>
       <usa>TECYSEG</usa>
       <pass>TECYSEG%24</pass>
       <fecha>${atmFormatDay}</fecha>
       <vendedor>0956109561</vendedor>
       <origen>WS</origen>
       <plan>${plan}</plan>
     </usuario>
     <asegurado>
       <persona>${CodigosPersoneria.Atm.personaFisica}</persona>
       <iva>${form.condicionFiscal.cfFedRusATM}</iva>
       <cupondscto></cupondscto>
       <bonificacion></bonificacion>
     </asegurado>
     <bien>
       <cerokm>N</cerokm>
       <rastreo>${getYesNo(form.tieneRastreador,yes,no)}</rastreo>
       <micrograbado>N</micrograbado>
       <alarma>${alarma}</alarma>
       <ajuste>${ajuste}</ajuste>
       <codpostal>${form.cpLocalidadGuarda}</codpostal>
       <cod_infoauto>${infoAuto}</cod_infoauto>
       <anofab>${form.anio}</anofab>
       <seccion>${seccionAuto}</seccion>
       <uso>${uso}</uso>
       <suma></suma>
     </bien>
   </auto>
            </tem:doc_in>
         </tem:AUTOS_Cotizar>
      </soapenv:Body>
   </soapenv:Envelope>`.trim();


return xml;

}

export function parsearXML(res:string):CotizacionATM[]{
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(res);

  // Acceso al nodo principal
  const coberturas = parsed['SOAP-ENV:Envelope']
    ['SOAP-ENV:Body']
    ['ns1:AUTOS_CotizarResponse']
    ['ns1:AUTOS_CotizarResult']
    .auto
    .cotizacion
    .cobertura;

  const resultado: CotizacionATM[] = Array.isArray(coberturas) ? coberturas.map((c) => ({
    codigo: c.codigo,
    descripcion: c.descripcion,
    prima: parseFloat(c.prima),
    premio: parseFloat(c.premio),
    cuotas: parseInt(c.cuotas),
    impcuotas: parseFloat(c.impcuotas),
    ajuste: c.ajuste,
    formapago: c.formapago,
    plan_cot: c.plan_cot,
    solicitud_glm: c.solicitud_glm
  })) : [];
  console.log(resultado);

  return resultado;
}


export function construirCotizacionATM(coberturas: any[]): Cotizacion {
  const buscarPremio = (codigo: string): number | undefined => {
    const cobertura = coberturas.find(c => c.codigo === codigo);
    return cobertura ? cobertura.premio : undefined;
  };

  const cotizacion: Cotizacion = {
    compania: 'ATM',
    rc: buscarPremio('A0'),
    c: buscarPremio('C3'),
    c1: buscarPremio('C2'),
    d1: buscarPremio(''),
    d2: buscarPremio('D2'),
    d3: buscarPremio('D3'),
  };

  return cotizacion;
}