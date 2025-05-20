import { MedioPago, Plan } from "../../../enums/EnumAtm";
import { CotizacionFormValue } from "../../../interfaces/cotizacionFormValue";
import { getYesNo } from "../utils/utils";

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

  const persona =
form.tipoPersoneria.descripcion === 'Persona Fisica' ? 'F' : 'J';

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
       <persona>${persona}</persona>
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
       <uso>0101</uso>
       <suma></suma>
     </bien>
   </auto>
            </tem:doc_in>
         </tem:AUTOS_Cotizar>
      </soapenv:Body>
   </soapenv:Envelope>`.trim();


return xml;

}
