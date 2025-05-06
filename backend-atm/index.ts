import express, { Application, Request, Response } from "express";
import cors from "cors";
import { cotizarATMXML } from "./atm-service";

const app: Application = express();
const PORT = process.env["PORT"] || 3000;

// ✅ Middleware
app.use(cors({ origin: "*", methods: ["POST"] }));
app.use(express.text({ type: "text/xml" }));
app.use(express.json());

// ✅ Endpoint principal
app.post("/ATM/cotizar", async (req: Request, res: Response) : Promise<void> =>{
  try {
    const xml = typeof req.body === "string" ? req.body : req.body.xml;
    if (!xml) {
       res.status(400).json({ message: "XML no recibido." });
    }

    const resultado = await cotizarATMXML(xml);
    res.set("Content-Type", "text/xml");
     res.status(200).send(resultado);
  } catch (error: any) {
    console.error("❌ Error en /ATM/cotizar:", error);
     res.status(500).json({ message: "Error en cotización ATM", detalle: error });
  }
});