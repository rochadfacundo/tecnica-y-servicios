import express, { Application, Request, Response } from "express";
import cors from "cors";
import { cotizarATMXML } from "./atm-service";
import bodyParser from "body-parser";
import xmlparser from 'express-xml-bodyparser';


const app: Application = express();
const PORT: number = Number(process.env["PORT"]) || 3000;


// ✅ Middleware
app.use(cors({ origin: "*", methods: ["POST"] }));
app.use(express.text({ type: "text/xml" }));
app.use(express.json());
// Configurar body-parser para manejar XML
app.use(xmlparser());

// ✅ Endpoint principal
app.post("/ATM/cotizar", async (req, res) => {
  try {
    const xmlData = req.body;
    const response= cotizarATMXML(xmlData);
    res.status(200).send(response);
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).send(error);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
