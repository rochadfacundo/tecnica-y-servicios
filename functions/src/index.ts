/* eslint-disable max-len */
import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import { cotizarMercantil, obtenerMarcasMercantil, obtenerModelosMercantil, obtenerTokenMercantil, obtenerVehiculosMercantil, obtenerVersionesMercantil } from "./ma-service";
import { cotizarRus, getMarcas,
  getModelos,
  getVersiones,
  getTokenRus } from "./rus-service";
import { getGruposPorMarca, getModelosPorMarcaYGrupo, getMarcasInfoauto, getTokenInfoauto} from "./intoauto-service";
import { cotizarRivadavia, getCodigoVehiculo, getSumaAsegurada, getTokenRivadavia } from "./rivadavia-service";
import { cotizarFederacion, getFranquiciaVigente, getLocalidadesFederacion, getRastreadores, getTiposPersoneria, getTipoVehiculoFederacion, getTokenFederacion } from "./federacion-service";

const app = express();
// Habilitar CORS para todas las solicitudes
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());


// ✅ Obtener token de INFOAUTO
app.get("/infoauto/token", async (req: Request, res: Response) => {
  try {
    const token = await getTokenInfoauto();
    res.status(200).json({ access_token: token });
  } catch (error: any) {
    console.log("Error al obtener token:", error);
    res.status(500).json({
      message: error.message || "Error desconocido",
      stack: error.stack,
    });
  }
});


// ✅ Obtener marcas de INFOAUTO
app.get("/infoauto/marcas", async (req: Request, res: Response) => {
  try {
    const marcas = await getMarcasInfoauto();
    res.status(200).json(marcas);
  } catch (error: any) {
    console.error("Error obteniendo marcas de INFOAUTO:", error);
    res.status(500).json({
      message: error.message || "Error desconocido",
      stack: error.stack,
    });
  }
});

// ✅ Obtener grupos de una marca específica en INFOAUTO
app.get("/infoauto/marcas/:brandId/grupos", async (req: Request, res: Response) => {
  const { brandId } = req.params;

  try {
    const grupos = await getGruposPorMarca(brandId);
    res.status(200).json(grupos);
  } catch (error: any) {
    console.error(`Error obteniendo grupos para la marca ${brandId}:`, error);
    res.status(500).json({
      message: error.message || "Error desconocido",
      stack: error.stack,
    });
  }
});

// ✅ Obtener modelos de una marca y grupo específico en INFOAUTO
app.get("/infoauto/marcas/:brandId/grupos/:groupId/modelos", async (req: Request, res: Response) => {
  const { brandId, groupId } = req.params;

  try {
    const grupos = await getModelosPorMarcaYGrupo(brandId, groupId);
    res.status(200).json(grupos);
  } catch (error: any) {
    console.error(`Error obteniendo grupos para la marca ${brandId}:`, error);
    res.status(500).json({
      message: error.message || "Error desconocido",
      stack: error.stack,
    });
  }
});

// ✅ Obtener marcas RUS
app.get("RUS/marcas", async (req: Request, res: Response) => {
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

// ✅ Obtener modelos RUS
app.get("RUS/modelos", async (req: Request, res: Response) => {
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


// ✅ Obtener versiones RUS
app.get("RUS/versiones", async (req: Request, res: Response) => {
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
app.put("/RUS/cotizaciones", async (req: Request, res: Response) => {
  try {
    const cotizacion = await cotizarRus(req.body);
    return res.status(200).json(cotizacion);
  } catch (error:any) {
    console.error("Error realizando cotización:", error.message);

    return res.status(500).json({ error: error.message });
  }
});

// ✅ Obtener token de Rus
app.get("/RUS/token", async (req: Request, res: Response) => {
  try {
    const token = await getTokenRus();
    return res.status(200).json(token);
  } catch (error) {
    console.error("Error obteniendo token de Mercantil Andina:", error);
    return res.status(500).json({error: "Error token de Mercantil Andina"});
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
  } catch (error:any) {
    console.log("Error al cotizar:", error);
    return res.status(500).json({
      message: error.message || "Error desconocido",
      stack: error.stack, // Solo para depuración, puedes quitarlo después
    });
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
    const response = await cotizarMercantil(data);
    res.status(200).json(response);
  } catch (error:any) {
    console.log("Error al cotizar:", error);
    res.status(500).json({
      message: error.message || "Error desconocido",
    });
  }
});

// ✅ Obtener token de Rivadavia
app.get("/rivadavia/token", async (req: Request, res: Response) => {
  try {
    const token = await getTokenRivadavia();
    return res.status(200).json({ access_token: token });
  } catch (error: any) {
    console.error("Error obteniendo token de Rivadavia:", error);
    return res.status(500).json({ error: error.message || "Error token de Rivadavia" });
  }
});

// ✅ Suma asegurada en Rivadavia
app.get("/rivadavia/suma_asegurada", async (req: Request, res: Response) => {
  try {
    const nroProductor=String(req.query.nroProductor);
    const codigoInfoAuto=Number(req.query.codigoInfoAuto);
    const modelo=String(req.query.modelo);


    const suma = await getSumaAsegurada(nroProductor, codigoInfoAuto, modelo);
    res.status(200).json(suma);
  } catch (error) {
    console.error("Error al suma asegurada Rivadavia:", error);
    res.status(500).json({
      message: error || "Error desconocido",
    });
  }
});

// ✅ Codigo Vehiculo asegurada en Rivadavia
app.get("/rivadavia/codigo_vehiculo", async (req: Request, res: Response) => {
  try {
    const nroProductor=String(req.query.nro_productor);
    const tipoVehiculo=String(req.query.tipo_vehiculo);
    const tipoUso=String(req.query.tipo_uso);

    console.log("chekeo:"+ nroProductor);
    const codigoVehiculo = await getCodigoVehiculo(nroProductor, tipoVehiculo, tipoUso);
    res.status(200).json(codigoVehiculo);
  } catch (error) {
    console.error("Error al obtener codigo Rivadavia:", error);
    res.status(500).json({
      message: error || "Error desconocido",
    });
  }
});

// ✅ Cotizar con Rivadavia
app.post("/rivadavia/cotizar", async (req: Request, res: Response) => {
  try {
    const resultado = await cotizarRivadavia(req.body);
    res.status(200).json(resultado);
  } catch (error: any) {
    console.error("Error al cotizar con Rivadavia:", error);
    res.status(500).json({
      message: error || "Error desconocido",
    });
  }
});

// ✅ Obtener token de FEDERACION PATRONAL
app.get("/federacion/token", async (req: Request, res: Response) => {
  try {
    const token = await getTokenFederacion();
    return res.status(200).json({ access_token: token });
  } catch (error: any) {
    console.error("Error obteniendo token de federacion:", error);
    return res.status(500).json({ error: error.message || "Error token de Rivadavia" });
  }
});

// ✅ Obtener tipoPersoneria EN FIRESTORE de FEDERACION PATRONAL
app.get("/federacion/tipoPersoneria", async (req: Request, res: Response) => {
  try {
    const tiposPersoneria = await getTiposPersoneria();
    return res.status(200).json(tiposPersoneria);
  } catch (error) {
    console.error("Error obteniendo personerias federacion:", error);
    return res.status(500).json({ error: error });
  }
});

// ✅ Obtener rastreadores de FEDERACION PATRONAL
app.get("/federacion/rastreadores", async (req: Request, res: Response) => {
  try {
    const rastreadores = await getRastreadores();
    return res.status(200).json(rastreadores);
  } catch (error) {
    console.error("Error obteniendo rastreadores federacion:", error);
    return res.status(500).json(
      { error: error instanceof Error ? error.message : String(error) });
  }
});

// ✅ Obtener localidades de Federacion patronal
app.get("/federacion/localidades", async (req: Request, res: Response) => {
  try {
    const localidades = await getLocalidadesFederacion();
    return res.status(200).json(localidades);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
});

// ✅ Obtener franquicia de Federacion patronal
app.get("/federacion/franquicia/:codInfoAuto/:fecha", async (req: Request, res: Response) => {
  try {
    const { codInfoAuto, fecha } = req.params;
    console.log(codInfoAuto);
    console.log(fecha);
    const resultado = await getFranquiciaVigente(codInfoAuto, fecha);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Error obteniendo franquicia:", error);
    return res.status(500).json({ error: error });
  }
});

// ✅ Obtener localidades de Federacion patronal
app.get("/federacion/tiposVehiculo/:codInfoAuto", async (req: Request, res: Response) => {
  try {
    const { codInfoAuto } = req.params;
    const tiposVehiculo = await getTipoVehiculoFederacion(Number(codInfoAuto));
    return res.status(200).json(tiposVehiculo);
  } catch (error) {
    console.error("Error obteniendo tipos vehiculo federacion:", error);
    return res.status(500).json({ error: "Error al obtener tipos vehiculo fedpat" });
  }
});


// ✅ Cotizar con Federacion
app.post("/federacion/cotizar", async (req: Request, res: Response) => {
  try {
    const resultado = await cotizarFederacion(req.body);
    res.status(200).json(resultado);
  } catch (error: any) {
    console.error("Error al cotizar con Federacion:", error);
    res.status(500).json({
      message: error || "Error desconocido",
    });
  }
});

// ✅ Exportamos la función principal
export const api = functions.https.onRequest(app);

