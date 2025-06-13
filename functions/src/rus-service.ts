/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable valid-jsdoc */
import * as admin from "firebase-admin";
import axios from "axios";
import { CotizacionRioUruguay } from "./interfaces/CotizacionRioUruguay";
import { defineSecret } from "firebase-functions/params";

// 🔒 Secrets DEMO
const RUS_AUTH_URL_DEMO = defineSecret("RUS_AUTH_URL_DEMO");
const RUS_COTIZACION_URL_DEMO = defineSecret("RUS_COTIZACION_URL_DEMO");
const RUS_USUARIO_DEMO = defineSecret("RUS_USUARIO_DEMO");
const RUS_CLAVE_DEMO = defineSecret("RUS_CLAVE_DEMO");
const RUS_AUTH_VIGENCIAS = defineSecret("RUS_AUTH_VIGENCIAS");

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

  if (tokenDoc.exists && tokenDoc.data()?.expiration > now) {
    return tokenDoc.data()?.value;
  }

  try {
    const authUrl = await RUS_AUTH_URL_DEMO.value();
    const username = await RUS_USUARIO_DEMO.value();
    const password = await RUS_CLAVE_DEMO.value();

    const response = await axios.post(authUrl, {
      userName: username,
      password: password,
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
    console.error("Error obteniendo token RUS:"
      , error.response?.data || error.message);
    throw new Error("No se pudo obtener el token de Río Uruguay");
  }
}


/**
 * Obtiene vigencias de vehiculos
 */
export async function getVigencias(): Promise<any> {
  try {
    const token = await getTokenRus();
    const urlVigencia = await RUS_AUTH_VIGENCIAS.value();

    const response = await axios.get(urlVigencia, {
      headers: { Authorization: token },
    });

    return response.data.dtoList;
  } catch (error: any) {
    console.error("Error obteniendo vigencias:",
      error.response?.data || error.message);
    throw new Error("No se pudieron obtener las vigencias");
  }
}

/**
 * Obtiene las marcas de vehículos según el tipo de unidad.
 */
export async function getMarcas(tipoUnidad: number): Promise<any> {
  if (!tipoUnidad) {
    throw new Error("Se requiere el parámetro tipoUnidad");
  }

  try {
    const token = await getTokenRus();
    const cotizacionUrl = await RUS_COTIZACION_URL_DEMO.value();

    const response = await axios.get(`${cotizacionUrl}/vehiculos/marcas`, {
      headers: { Authorization: token },
      params: { TipoUnidad: tipoUnidad },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error obteniendo marcas:",
      error.response?.data || error.message);
    throw new Error("No se pudieron obtener las marcas");
  }
}

/**
 * Obtiene los modelos de vehículos según la marca, el año y el tipo de unidad.
 */
export async function getModelos(marca: number, anio: number, tipoUnidad?: number): Promise<any> {
  if (!marca || !anio) {
    throw new Error("Se requieren los parámetros marca y anio");
  }

  try {
    const token = await getTokenRus();
    const cotizacionUrl = await RUS_COTIZACION_URL_DEMO.value();

    const params: any = { Marca: marca, Año: anio };
    if (tipoUnidad !== undefined) {
      params.TipoUnidad = tipoUnidad;
    }

    const response = await axios.get(`${cotizacionUrl}/vehiculos/gruposModelo`, {
      headers: { Authorization: token },
      params,
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
    const cotizacionUrl = await RUS_COTIZACION_URL_DEMO.value();

    const params: any = { IdGrupoModelo: idGrupoModelo };
    if (anio) params.Año = anio;
    if (tipoUnidad) params.TipoUnidad = tipoUnidad;
    if (idMarca) params.IdMarca = idMarca;

    const response = await axios.get(`${cotizacionUrl}/vehiculos/modelos`, {
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
 */
export async function cotizarRus(cotizacionData: CotizacionRioUruguay): Promise<any> {
  try {
    const token = await getTokenRus();
    const cotizacionUrl = await RUS_COTIZACION_URL_DEMO.value();

    if (cotizacionData.codigoTipoInteres === "VEHICULO") {
      const response = await axios.put(`${cotizacionUrl}/autos`, cotizacionData, {
        headers: { Authorization: token },
      });
      return response.data;
    } else if (cotizacionData.codigoTipoInteres === "MOTOVEHICULO") {
      const response =
      await axios.put(`${cotizacionUrl}/motos`, cotizacionData, {
        headers: { Authorization: token },
      });
      console.log("cotiza RUS ok");
      return response.data;
    }
  } catch (error: any) {
    console.error("Error realizando cotización RUS:",
      error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.validationErrors?.[0]?.message ||
      error.response?.data?.cause ||
      error.message ||
      "Error desconocido";

    throw new Error(errorMessage);
  }
}
