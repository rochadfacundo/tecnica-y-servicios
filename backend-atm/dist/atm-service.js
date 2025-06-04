"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cotizarATMXML = void 0;
const axios_1 = __importDefault(require("axios"));
const ATM_URL = process.env.ATM_URL_DEMO || "https://wsatm-dev.atmseguros.com.ar/index.php/soap";
const ATM_USUARIO = process.env.ATM_USUARIO_DEMO || "";
const ATM_CLAVE = process.env.ATM_CLAVE_DEMO || "";
const ATM_VENDEDOR = process.env.ATM_VENDEDOR_DEMO || "";
const cotizarATMXML = async (xmlBase) => {
    try {
        const xmlFinal = xmlBase
            .replace("<usa>__USUARIO__</usa>", `<usa>${ATM_USUARIO}</usa>`)
            .replace("<pass>__CLAVE__</pass>", `<pass>${ATM_CLAVE}</pass>`)
            .replace("<vendedor>__VENDEDOR__</vendedor>", `<vendedor>${ATM_VENDEDOR}</vendedor>`);
        const response = await axios_1.default.post(ATM_URL, xmlFinal, {
            headers: {
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": "http://tempuri.org/AUTOS_Cotizar",
                "User-Agent": "Mozilla/5.0 ATM-Test",
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("❌ Error ATM:", error.toJSON ? error.toJSON() : error);
        throw error;
    }
};
exports.cotizarATMXML = cotizarATMXML;
