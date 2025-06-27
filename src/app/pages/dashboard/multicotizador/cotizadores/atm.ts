import { XMLParser } from "fast-xml-parser";
import { MedioPago, Plan } from "../../../../enums/EnumAtm";
import { Cotizacion, CotizacionATM } from "../../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CodigosPersoneria, getRandomNumber, getYesNo } from "../utils/utils";
import { Productor } from "../../../../models/productor.model";

export function buildATMRequest(form: CotizacionFormValue,infoAuto:string,productor:Productor):string{
  const today = form.vigenciaDesde;
  const [year, month, day] = today.split('-');
  const atmFormatDay = `${day}${month}${year}`;
  const alarma= form.alarma ? 1: 0;
  const ajuste = form.clausulaAjuste.codigo;
  const seccionAuto=3;
  const configATM = productor.companias?.find(c => c.compania === 'ATM');
  const yes = 'S';
  const no = 'N';
  const uso= '0101';
  const personaFisica="F";
  const conficionFiscal="CF";

  const xml = `
  <soapenv:Envelope xmlns:tem="http://tempuri.org/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <soapenv:Body>
      <tem:AUTOS_Cotizar>
        <tem:doc_in>
              <auto>
            <usuario>
              <usa>__USUARIO__</usa>
              <pass>__CLAVE__</pass>
              <fecha>${atmFormatDay}</fecha>
              <vendedor>__VENDEDOR__</vendedor>
              <origen>WS</origen>
              <plan>${configATM?.plan}</plan>
            </usuario>
            <asegurado>
              <persona>${personaFisica}</persona>
              <iva>${conficionFiscal}</iva>
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
    nroCotizacion: getRandomNumber(),
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
