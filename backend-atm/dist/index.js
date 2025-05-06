"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_xml_bodyparser_1 = __importDefault(require("express-xml-bodyparser"));
const app = (0, express_1.default)();
const PORT = Number(process.env["PORT"]) || 3000;
// ✅ Middleware
app.use((0, cors_1.default)({ origin: "*", methods: ["POST"] }));
app.use(express_1.default.text({ type: "text/xml" }));
app.use(express_1.default.json());
// Configurar body-parser para manejar XML
app.use((0, express_xml_bodyparser_1.default)());
// ✅ Endpoint principal
app.post("/ATM/cotizar", async (req, res) => {
    try {
        const xmlData = req.body;
        // Procesar xmlData según sea necesario
        res.status(200).send(xmlData);
    }
    catch (error) {
        console.error("Error al procesar la solicitud:", error);
        res.status(500).send(error);
    }
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
