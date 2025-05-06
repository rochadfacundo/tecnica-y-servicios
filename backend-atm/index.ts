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

// ✅ Endpoint principal
app.post("/ATM/cotizar", async (req, res) => {
  try {
    const xmlData: string = req.body;

    //const response= await cotizarATMXML(xmlData);
    res.status(200).send(xmlData);
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).send(error);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
