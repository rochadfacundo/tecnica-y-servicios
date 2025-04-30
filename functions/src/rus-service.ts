/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable valid-jsdoc */
import * as admin from "firebase-admin";
import axios from "axios";
import { CotizacionRioUruguay } from "./interfaces/CotizacionRioUruguay";

const API_URL = "https://sandbox.sis.rus.com.ar/api-rus";

const USERNAME = "18291036ws";
const PASSWORD = "cambiar";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
/**
 * Obtiene el token de autenticación.
 * Si el token está en caché y no ha expirado, lo reutiliza.
 */
export async function getTokenRus(): Promise<string | null> {
  const tokenRef = db.doc("RUS/token");
  const now = Date.now();

  const tokenDoc = await tokenRef.get();

  // ✅ Reutilizar si aún es válido
  if (tokenDoc.exists && tokenDoc.data()?.expiration > now) {
    return tokenDoc.data()?.value;
  }

  // 🔐 Solicitar nuevo token
  try {
    const response = await axios.post(`${API_URL}/login/token`, {
      userName: USERNAME,
      password: PASSWORD,
    }, {
      headers: { "Content-Type": "application/json" },
    });

    const accessToken = response.data.message;
    const expiration = now + (55 * 60 * 1000);

    await tokenRef.set({
      value: accessToken,
      expiration,
    });

    return accessToken;
  } catch (error: any) {
    console.error("Error obteniendo token RUS:", error.response?.data || error.message);
    throw new Error("No se pudo obtener el token de Río Uruguay");
  }
}

/**
 * Obtiene las marcas de vehículos según el tipo de unidad.
 * @param tipoUnidad Código del tipo de unidad.
 */
export async function getMarcas(tipoUnidad: number): Promise<any> {
  if (!tipoUnidad) {
    throw new Error("Se requiere el parámetro tipoUnidad");
  }

  try {
    const token = await getTokenRus();
    const response = await axios.get(`${API_URL}/vehiculos/marcas`, {
      headers: {Authorization: token},
      params: {TipoUnidad: tipoUnidad},
    });

    return response.data;
  } catch (error: any) {
    console.error("Error obteniendo marcas:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener las marcas");
  }
}

/**
 * Obtiene los modelos de vehículos según la marca, el año y el tipo de unidad.
 * @param marca Código de la marca del vehículo.
 * @param anio Año de fabricación del vehículo.
 * @param tipoUnidad Tipo de unidad (ej: 8 para motos).
 */
export async function getModelos(marca: number, anio: number, tipoUnidad?: number): Promise<any> {
  if (!marca || !anio) {
    throw new Error("Se requieren los parámetros marca y anio");
  }

  try {
    const token = await getTokenRus();
    const params: any = { Marca: marca, Año: anio };
    if (tipoUnidad !== undefined) {
      params.TipoUnidad = tipoUnidad; // Solo agrega si está definido
    }

    const response = await axios.get(`${API_URL}/vehiculos/gruposModelo`, {
      headers: { Authorization: token },
      params, // Se envían los parámetros correctamente
    });

    return response.data;
  } catch (error: any) {
    console.error("Error obteniendo modelos:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener los modelos");
  }
}


/**
 * Obtiene los modelos de vehículos según la marca y el año.
 */
export async function getVersiones(
  idGrupoModelo: number,
  anio?: number,
  tipoUnidad?: number,
  idMarca?: number
): Promise<any> {
  try {
    const token = await getTokenRus();
    const params: any = { IdGrupoModelo: idGrupoModelo };

    if (anio) params.Año = anio;
    if (tipoUnidad) params.TipoUnidad = tipoUnidad;
    if (idMarca) params.IdMarca = idMarca;


    const response = await axios.get(`${API_URL}/vehiculos/modelos`, {
      headers: { Authorization: token },
      params,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error obteniendo versiones:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener las versiones del vehículo");
  }
}

/**
 * Realiza una cotización de seguro.
 * @param cotizacionData Datos de la cotización.
 */
export async function cotizarRus(cotizacionData: CotizacionRioUruguay): Promise<any> {
  try {
    const token = await getTokenRus();

    const apiUrlCotizacion=`${API_URL}/cotizaciones`;

    if (cotizacionData.vigenciaPolizaId==65) {
      const response = await axios.put(`${apiUrlCotizacion}/autos`, cotizacionData, {
        headers: { Authorization: token},
      });
      console.log("llegamos a cotizar?", response.data);
      return response.data;
    } else if (cotizacionData.vigenciaPolizaId==70) {
      const response = await axios.put(`${apiUrlCotizacion}/motos`, cotizacionData, {
        headers: { Authorization: token},
      });
      console.log("cotiza RUS ok");
      return response.data;
    }
  } catch (error: any) {
    console.error("Error realizando cotización RUS:", error.response?.data || error.message);

    const errorMessage =
        error.response?.data?.validationErrors?.[0]?.message ||
        error.response?.data?.cause ||
        error.message ||
        "Error desconocido";

    throw new Error(errorMessage);
  }
}
