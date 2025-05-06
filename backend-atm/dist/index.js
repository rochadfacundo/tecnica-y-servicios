"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const atm_service_1 = require("./atm-service");
const app = (0, express_1.default)();
const PORT = process.env["PORT"] || 3000;
// ✅ Middleware
app.use((0, cors_1.default)({ origin: "*", methods: ["POST"] }));
app.use(express_1.default.text({ type: "text/xml" }));
app.use(express_1.default.json());
// ✅ Endpoint principal
app.post("/ATM/cotizar", async (req, res) => {
    try {
        const xml = typeof req.body === "string" ? req.body : req.body.xml;
        if (!xml) {
            res.status(400).json({ message: "XML no recibido." });
        }
        const resultado = await (0, atm_service_1.cotizarATMXML)(xml);
        res.set("Content-Type", "text/xml");
        res.status(200).send(resultado);
    }
    catch (error) {
        console.error("❌ Error en /ATM/cotizar:", error);
        res.status(500).json({ message: "Error en cotización ATM", detalle: error });
    }
});
