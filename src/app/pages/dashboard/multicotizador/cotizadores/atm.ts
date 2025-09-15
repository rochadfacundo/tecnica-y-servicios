import { XMLParser } from "fast-xml-parser";
import { MedioPago, Plan } from "../../../../enums/EnumAtm";
import { Cotizacion, CotizacionATM } from "../../../../interfaces/cotizacion";
import { CotizacionFormValue } from "../../../../interfaces/cotizacionFormValue";
import { CodigosPersoneria, getRandomNumber, getYesNo } from "../../../../utils/utils";
import { Productor } from "../../../../models/productor.model";
import { CompaniaCotizada } from "../../../../interfaces/companiaCotizada";

export function buildATMRequest(
  form: CotizacionFormValue,
  infoAuto: string,
  productor: Productor,
  tipo: string
): string {
  const today = form.vigenciaDesde;
  const [year, month, day] = today.split("-");
  const atmFormatDay = `${day}${month}${year}`;

  const alarma = form.alarma ? 1 : 0;
  const ajuste = 10; // ajuste de 10
  const configATM = productor.companias?.find((c) => c.compania === "ATM");

  const yes = "S";
  const no = "N";
  const personaFisica = "F";
  const condicionFiscal = "CF";
  const cerokm = "N";
  const micrograbado = "N";
  const tipousoMoto = "1"; // particular

  // Determinar si es auto o moto
  const esAuto = tipo === "VEHICULO";
  const seccionAuto = esAuto ? 3 : 4;

  // XML condicional para uso
  const usoXML = esAuto ? `<uso>0101</uso>` : `<tipo_uso>1</tipo_uso>`;

  const xml = `
<soapenv:Envelope xmlns:tem="http://tempuri.org/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soapenv:Body>
    <tem:AUTOS_Cotizar>
      <tem:doc_in>
        <auto>
          <usuario>
            <usa>${configATM?.nroProductor}</usa>
            <pass>${configATM?.claveProductor}</pass>
            <fecha>${atmFormatDay}</fecha>
            <vendedor>__VENDEDOR__</vendedor>
            <origen>WS</origen>
            <plan>${configATM?.plan}</plan>
          </usuario>
          <asegurado>
            <persona>${personaFisica}</persona>
            <iva>${condicionFiscal}</iva>
            <cupondscto></cupondscto>
            <bonificacion></bonificacion>
          </asegurado>
          <bien>
            <cerokm>${cerokm}</cerokm>
            <rastreo>${getYesNo(form.tieneRastreador, yes, no)}</rastreo>
            <micrograbado>${micrograbado}</micrograbado>
            <alarma>${alarma}</alarma>
            <ajuste>${ajuste}</ajuste>
            <codpostal>${form.cpLocalidadGuarda}</codpostal>
            <cod_infoauto>${infoAuto}</cod_infoauto>
            <anofab>${form.anio}</anofab>
            <seccion>${seccionAuto}</seccion>
            ${usoXML}
            <suma></suma>
          </bien>
        </auto>
      </tem:doc_in>
    </tem:AUTOS_Cotizar>
  </soapenv:Body>
</soapenv:Envelope>`.trim();

  console.log("xml a atm", xml);

  return xml;
}

export function parsearXML(res: string): CotizacionATM[] {
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(res);

  // Acceso al nodo principal
  const coberturas =
  parsed["SOAP-ENV:Envelope"]
  ["SOAP-ENV:Body"]
  ["ns1:AUTOS_CotizarResponse"]
  ["ns1:AUTOS_CotizarResult"].auto.cotizacion.cobertura;

  const toNum = (v: any) => Number.parseFloat(String(v));

  const resultado: CotizacionATM[] = Array.isArray(coberturas)
    ? coberturas.map((c: any) => ({
        codigo: c.codigo,
        descripcion: c.descripcion,
        prima: toNum(c.prima),
        premio: toNum(c.premio),
        cuotas: Number.parseInt(c.cuotas),
        impcuotas: toNum(c.impcuotas),
        ajuste: c.ajuste,
        formapago: c.formapago,
        plan_cot: c.plan_cot,
        solicitud_glm: c.solicitud_glm,
        comision: c.comision != null ? toNum(c.comision) : undefined,
      }))
    : [];


    console.log(resultado);
  return resultado;
}

export function construirCotizacionATM(coberturas: any[]): CompaniaCotizada {
  const buscarPremio = (...codigos: string[]): number | undefined => {
    for (const codigo of codigos) {
      const cobertura = coberturas.find((c) => c.codigo === codigo);
      if (cobertura?.premio) {
        return cobertura.premio;
      }
    }
    return undefined;
  };

  const companiaCotizada: CompaniaCotizada = {
    compania: "ATM",
    rc: buscarPremio("A0"),
    b1:buscarPremio("B1"),
    b2:buscarPremio("B0"),
    c: buscarPremio("C2", "C3-BÁSICA", "B2"), // B2 PARA MOTO
    c1: buscarPremio("C3", "C2-MEDIA"),
    c2:buscarPremio("C4", "C2-MEDIA"),
    c3: buscarPremio("C0"),
    d1: buscarPremio("D1", "D2", "C"), // C PARA MOTO
    d2: buscarPremio("D3"), //3%
    d3: buscarPremio("D4"), //6%
  };

  return companiaCotizada;
}

/* ---------------- Tooltip Helpers ---------------- */

const moneyAR = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

/** Extrae "3%" / "6%" de descripciones TR tipo:
 * "TODO RIESGO C/FCIA.VARIABLE 6% SUMA ASEGURADA"
 */
function extraerFranquicia(descripcion: string): string | null {
  const m = descripcion?.match(/(\d{1,2})\s*%/);
  return m ? `${m[1]}%` : null;
}

/** Devuelve la franquicia solo si aplica (códigos D* suelen ser TR) */
function franquiciaSiAplica(c: CotizacionATM): string | null {
  if (!/^D\d/.test(c.codigo)) return null;
  return extraerFranquicia(c.descripcion);
}

export function buildTooltipATM(c: CotizacionATM): { title: string; lines: string[] } {
  const fran = franquiciaSiAplica(c);
  const title = `Plan ${c.codigo}: ${c.descripcion}${fran ? ` (${fran})` : ""}`;

  const lines: string[] = [
  //  `Premio total: ${moneyAR.format(c.premio)}`,
  //  `Cuotas: ${String(c.cuotas).padStart(2, "0")} x ${moneyAR.format(c.impcuotas)}`,
  //  `Forma de pago: ${c.formapago} \n`,
    ` - Ajuste: ${c.ajuste}\n`,
  ];

  //if (c.plan_cot) lines.push(`Plan: ${c.plan_cot}`);
  //if (Number.isFinite(c.comision as number)) lines.push(`Comisión: ${moneyAR.format(c.comision as number)}`);

  return { title, lines };
}
