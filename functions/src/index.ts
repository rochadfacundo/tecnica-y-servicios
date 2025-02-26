import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import { cotizarRus, getMarcas, getModelos, getVersiones } from "./rus-service";

const app = express();
// Habilitar CORS para todas las solicitudes
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());

// ✅ Obtener marcas
app.get("/marcas", async (req: Request, res: Response) => {
  try {
    const tipoUnidad = Number(req.query.tipoUnidad);
    if (!tipoUnidad) {
      return res.status(400).json({ error: "tipoUnidad es requerido" });
    }

    const marcas = await getMarcas(tipoUnidad);
    return res.status(200).json(marcas);
  } catch (error) {
    console.error("Error obteniendo marcas:", error);
    return res.status(500).json({ error: "Error interno al obtener marcas" });
  }
});

// ✅ Obtener modelos
app.get("/modelos", async (req: Request, res: Response) => {
  try {
    const marca = Number(req.query.marca);
    const anio = Number(req.query.anio);
    if (!marca || !anio) {
      return res.status(400).json({ error: "marca y anio son requeridos" });
    }

    const modelos = await getModelos(marca, anio);
    return res.status(200).json(modelos);
  } catch (error) {
    console.error("Error obteniendo modelos:", error);
    return res.status(500).json({ error: "Error interno al obtener modelos" });
  }
});

// ✅ Obtener versiones
app.get("/versiones", async (req: Request, res: Response) => {
  try {
    const idMod=req.query.idGrupoModelo;

    const idModelo = idMod ? Number(idMod) : undefined;
    const anio = req.query.anio ? Number(req.query.anio) : undefined;
    const idMarca = req.query.idMarca ? Number(req.query.idMarca) : undefined;

    if (!idModelo && (!idMarca || !anio)) {
      return res.status(400).json({error: "Indicar modelo o marca y año"});
    }

    const versiones = idModelo ? await getVersiones(idModelo, anio) : undefined;
    return res.status(200).json(versiones);
  } catch (error) {
    console.error("Error obteniendo versiones:", error);
    return res.status(500).json({error: "Error interno al obtener versiones"});
  }
});

// ✅ Cotización de seguros
app.put("/cotizaciones/autos", async (req: Request, res: Response) => {
  try {
    const cotizacion = await cotizarRus(req.body);
    return res.status(200).json(cotizacion);
  } catch (error) {
    console.error("Error realizando cotización:", error);
    return res.status(500).json({ error: "Error interno en la cotización" });
  }
});

// ✅ Exportamos la función principal
export const api = functions.https.onRequest(app);
