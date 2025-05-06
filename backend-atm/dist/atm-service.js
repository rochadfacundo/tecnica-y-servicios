"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cotizarATMXML = void 0;
const axios_1 = __importDefault(require("axios"));
const ATM_SOAP_URL = "https://wsatm-dev.atmseguros.com.ar/index.php/soap";
const cotizarATMXML = async (xml) => {
    try {
        console.log("🕓 [ATM] Fecha y hora:", new Date().toISOString());
        const response = await axios_1.default.post(ATM_SOAP_URL, xml, {
            headers: {
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": "http://tempuri.org/AUTOS_Cotizar", // importante
                "User-Agent": "Mozilla/5.0 ATM-Test",
            },
            timeout: 60000,
        });
        console.log("🕓 [ATM] Fecha y hora:", new Date().toISOString());
        return response.data;
    }
    catch (error) {
        console.log("🕓 [ATM] Fecha y hora:", new Date().toISOString());
        console.error("❌ Error completo ATM:", error.toJSON ? error.toJSON() : error);
        throw error;
    }
};
exports.cotizarATMXML = cotizarATMXML;
