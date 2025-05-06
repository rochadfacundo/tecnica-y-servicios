import axios from "axios";
import { Builder } from "xml2js";
const ATM_SOAP_URL = "https://wsatm-dev.atmseguros.com.ar/index.php/soap";

export const cotizarATMXML= async (xmlObject: any) => {
  try {
    console.log("🕓 [ATM] Fecha y hora:", new Date().toISOString());
    // 🔁 Convertir objeto JS a string XML
    const builder = new Builder({ headless: true }); // headless = sin <?xml ...?>
    const xmlString = builder.buildObject(xmlObject);
    const response = await axios.post(ATM_SOAP_URL, xmlString, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://tempuri.org/AUTOS_Cotizar", // importante
        "User-Agent": "Mozilla/5.0 ATM-Test",
      },
    });
    console.log("🕓 [ATM] Fecha y hora:", new Date().toISOString());

    return response.data;
  } catch (error: any) {
    console.log("🕓 [ATM] Fecha y hora:", new Date().toISOString());
    console.error("❌ Error completo ATM:",
      error.toJSON ? error.toJSON() : error);

    throw error;
  }
};
