import axios from "axios";

const ATM_SOAP_URL = "https://wsatm-dev.atmseguros.com.ar/index.php/soap";

export const cotizarATMXML= async (xml: string) => {
  try {
    console.log("🕓 [ATM] Fecha y hora:", new Date().toISOString());

    const response = await axios.post(ATM_SOAP_URL, xml, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://tempuri.org/AUTOS_Cotizar", // importante
        "User-Agent": "Mozilla/5.0 ATM-Test",
      },
      timeout: 60000,
    });
    console.log("🕓 [ATM] Fecha y hora:", new Date().toISOString());

    return response.data;
  } catch (error: any) {
    console.log("🕓 [ATM] Fecha y hora:", new Date().toISOString());
    console.error("❌ Error completo ATM:",
      error.toJSON ? error.toJSON() : error);
    // console.error("❌ Error en cotización ATM:",
    // error.response?.data);
    throw error.response?.data;
  }
};
