/* eslint-disable max-len */
import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import { cotizarMercantil, obtenerMarcasMercantil, obtenerModelosMercantil, obtenerTokenMercantil, obtenerVehiculosMercantil, obtenerVersionesMercantil } from "./ma-service";
import { cotizarRus, getMarcas,
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
    const tipoUnidad = Number(req.query.tipoUnidad);

    if (!marca || !anio) {
      return res.status(400).json({ error: "marca y anio son requeridos" });
    }

    const modelos = await getModelos(marca, anio, tipoUnidad);
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
app.put("/cotizaciones", async (req: Request, res: Response) => {
  try {
    const cotizacion = await cotizarRus(req.body);
    return res.status(200).json(cotizacion);
  } catch (error:any) {
    console.error("Error realizando cotización:", error.message);

    return res.status(500).json({ error: error.message });
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

    const modelos = await obtenerModelosMercantil(Number(marca), Number(año), token);
    return res.status(200).json(modelos);
  } catch (error) {
    console.error("Error obteniendo modelos de Mercantil Andina:", error);
    return res.status(500).json({ error: "Error al obtener modelos" });
  }
});

// ✅ Obtener vehículos de Mercantil Andina
app.get("/mercantil/vehiculos", async (req: Request, res: Response) => {
  const { marca, año, tipo } = req.query;

  if (!marca || !año || !tipo) {
    return res.status(400).json({ error: "Marca, año y tipo son requeridos" });
  }

  try {
    const token = await obtenerTokenMercantil(); // Obtener token
    const vehiculos = await obtenerVehiculosMercantil(marca.toString(), Number(año), tipo.toString(), token);
    return res.status(200).json(vehiculos);
  } catch (error) {
    console.error("Error obteniendo vehículos de Mercantil Andina:", error);
    return res.status(500).json({ error: "Error al obtener vehículos" });
  }
});


// ✅ Obtener versiones de Mercantil Andina
app.get("/mercantil/versiones", async (req: Request, res: Response) => {
  const { marca, año, modelo } = req.query;

  if (!marca || !año || !modelo) {
    return res.status(400).json({ error: "Marca, año y modelo son requeridos" });
  }

  try {
    const token = await obtenerTokenMercantil(); // Obtener token
    const vehiculos = await obtenerVersionesMercantil(Number(marca), Number(año), modelo.toString(), token);
    return res.status(200).json(vehiculos);
  } catch (error) {
    console.error("Error obteniendo vehículos de Mercantil Andina:", error);
    return res.status(500).json({ error: "Error al obtener vehículos" });
  }
});

// COTIZAR MERCANTIL
app.post("/mercantil/cotizaciones", async (req, res) => {
  try {
    const data = req.body;
    const token = await obtenerTokenMercantil(); // Obtener token
    const response = await cotizarMercantil(data, token);
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error al cotizar:", error);
    res.status(500).json(error);
  }
});

// ✅ Exportamos la función principal
export const api = functions.https.onRequest(app);

