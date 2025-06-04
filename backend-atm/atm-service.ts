import axios from "axios";
import { Builder } from "xml2js";

const ATM_URL = process.env.ATM_URL_DEMO || "https://wsatm-dev.atmseguros.com.ar/index.php/soap";
const ATM_USUARIO = process.env.ATM_USUARIO_DEMO || "";
const ATM_CLAVE = process.env.ATM_CLAVE_DEMO || "";
const ATM_VENDEDOR = process.env.ATM_VENDEDOR_DEMO || "";

export const cotizarATMXML = async (xmlBase: string): Promise<any> => {
  try {

    const xmlFinal = xmlBase
      .replace("<usa>__USUARIO__</usa>", `<usa>${ATM_USUARIO}</usa>`)
      .replace("<pass>__CLAVE__</pass>", `<pass>${ATM_CLAVE}</pass>`)
      .replace("<vendedor>__VENDEDOR__</vendedor>", `<vendedor>${ATM_VENDEDOR}</vendedor>`)
      console.log("🔐 Usuario ATM:", ATM_USUARIO);
    console.log("🧾 XML Final enviado a ATM:\n", xmlFinal);
    const response = await axios.post(ATM_URL, xmlFinal, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://tempuri.org/AUTOS_Cotizar",
        "User-Agent": "Mozilla/5.0 ATM-Test",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Error ATM:", error.toJSON ? error.toJSON() : error);
    throw error;
  }
};
