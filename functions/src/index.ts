/* eslint-disable max-len */
import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import { obtenerMarcasMercantil, obtenerModelosMercantil, obtenerTokenMercantil } from "./ma-service";
import { cotizarRusAutos, cotizarRusMotos, getMarcas,
  getModelos,
  getVersiones } from "./rus-service";

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
    const idModelo=req.query.idGrupoModelo;
    const tipoU=req.query.tipoUnidad;

    const idMod = idModelo ? Number(idModelo) : undefined;
    const anio = req.query.anio ? Number(req.query.anio) : undefined;
    const idMarca = req.query.idMarca ? Number(req.query.idMarca) : undefined;
    const uni = tipoU? Number(tipoU) : undefined;

    if (!idModelo && (!idMarca || !anio)) {
      return res.status(400).json({error: "Indicar modelo o marca y año"});
    }

    const versiones = idMod ? await getVersiones(idMod, anio, uni) : undefined;
    return res.status(200).json(versiones);
  } catch (error) {
    console.error("Error obteniendo versiones:", error);
    return res.status(500).json({error: "Error interno al obtener versiones"});
  }
});

// ✅ Cotización de seguros RUS
app.put("/cotizaciones/autos", async (req: Request, res: Response) => {
  try {
    const cotizacion = await cotizarRusAutos(req.body);
    return res.status(200).json(cotizacion);
  } catch (error) {
    console.error("Error realizando cotización:", error);
    return res.status(500).json({ error: "Error interno en la cotización" });
  }
});

// ✅ Cotización de seguros RUS
app.put("/cotizaciones/motos", async (req: Request, res: Response) => {
  try {
    const cotizacion = await cotizarRusMotos(req.body);
    return res.status(200).json(cotizacion);
  } catch (error) {
    console.error("Error realizando cotización:", error);
    return res.status(500).json({ error: "Error interno en la cotización" });
  }
});


// ✅ Obtener token de Mercantil Andina
app.get("/mercantil/token", async (req: Request, res: Response) => {
  try {
    const token = await obtenerTokenMercantil();
    return res.status(200).json(token);
  } catch (error) {
    console.error("Error obteniendo token de Mercantil Andina:", error);
    return res.status(500).json({error: "Error token de Mercantil Andina"});
  }
});


// ✅ Obtener marcas de Mercantil Andina
app.get("/mercantil/marcas", async (req: Request, res: Response) => {
  try {
    const marcas = await obtenerMarcasMercantil();
    return res.status(200).json(marcas);
  } catch (error) {
    console.error("Error obteniendo marcas de Mercantil Andina:", error);
    return res.status(500).json({ error: "Error al obtener marcas" });
  }
});

// ✅ Obtener modelos de Mercantil Andina
app.get("/mercantil/modelos", async (req: Request, res: Response) => {
  const { marca, año } = req.query;

  if (!marca || !año) {
    return res.status(400).json({ error: "Marca y año son requeridos" });
  }

  try {
    const token = await obtenerTokenMercantil(); // Obtener token primero
    console.log("QUIERO OBTENER");
    console.log(marca, año, token);
    const modelos = await obtenerModelosMercantil(Number(marca), Number(año), token);
    return res.status(200).json(modelos);
  } catch (error) {
    console.error("Error obteniendo modelos de Mercantil Andina:", error);
    return res.status(500).json({ error: "Error al obtener modelos" });
  }
});


// ✅ Exportamos la función principal
export const api = functions.https.onRequest(app);
