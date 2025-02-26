import * as functions from "firebase-functions";
import { getMarcas, getModelos, getVersiones } from "./rus-service";

export const obtenerMarcas = functions.https.onRequest(async (req, res) => {
  // Configuración de CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const tipoUnidad = Number(req.query.tipoUnidad);
    if (!tipoUnidad) {
      res.status(400).json({ error: "tipoUnidad es requerido" });
      return;
    }

    const marcas = await getMarcas(tipoUnidad);
    res.status(200).json(marcas);
  } catch (error: unknown) {
    res.status(500).json({ error });
  }
});

export const obtenerModelos = functions.https.onRequest(async (req, res) => {
  // Configuración de CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const marca = Number(req.query.marca);
    const anio = Number(req.query.anio);

    if (!marca || !anio) {
      res.status(400).json({ error: "marca y anio son requeridos" });
      return;
    }

    const modelos = await getModelos(marca, anio);
    res.status(200).json(modelos);
  } catch (error: unknown) {
    res.status(500).json({ error });
  }
});

export const obtenerVersiones = functions.https.onRequest(async (req, res) => {
  // Configuración de CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const idModelo = req.query.idGrupoModelo;
    const idMod = idModelo ? Number(idModelo) : undefined;
    const anio = req.query.anio ? Number(req.query.anio) : undefined;
    const idMarca = req.query.idMarca ? Number(req.query.idMarca) : undefined;

    // Validación según la API
    if (!idMod && (!idMarca || !anio)) {
      res.status(400).json({ error: "Debe indicar un modelo o marca y año." });
      return;
    }

    const versiones = idMod ? await getVersiones(idMod, anio) : undefined;

    res.status(200).json(versiones);
  } catch (error: unknown) {
    res.status(500).json({ error });
  }
});
