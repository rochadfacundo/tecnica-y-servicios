"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const atm_service_1 = require("./atm-service");
const app = (0, express_1.default)();
const PORT = Number(process.env["PORT"]) || 3000;
// ✅ Middleware
app.use((0, cors_1.default)({ origin: "*", methods: ["POST"] }));
app.use(express_1.default.text({ type: "text/xml" }));
// ✅ Endpoint principal
app.post("/ATM/cotizar", async (req, res) => {
    try {
        const xmlData = req.body;
        const response = await (0, atm_service_1.cotizarATMXML)(xmlData);
        res.status(200).send(response);
    }
    catch (error) {
        console.error("Error al procesar la solicitud:", error);
        res.status(500).send(error);
    }
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
