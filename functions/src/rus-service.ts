/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable valid-jsdoc */
import axios from "axios";

const API_URL = "https://sandbox.sis.rus.com.ar/api-rus";
const USERNAME = "18291036ws";
const PASSWORD = "cambiar";

let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

/**
 * Obtiene el token de autenticación.
 * Si el token está en caché y no ha expirado, lo reutiliza.
 */
export async function getToken(): Promise<string|null> {
  if (cachedToken && tokenExpiration && tokenExpiration > Date.now()) {
    return cachedToken;
  }

  try {
    const response = await axios.post(`${API_URL}/login/token`, {
      userName: USERNAME,
      password: PASSWORD,
    }, {
      headers: {"Content-Type": "application/json"},
    });

    cachedToken = response.data.message;
    tokenExpiration = Date.now() + 60 * 60 * 1000; // Suponiendo que dura 1 hora
    console.log("Nuevo token obtenido:", cachedToken);
    return cachedToken;
  } catch (error: any) {
    console.error("Error obteniendo token:", error.response?.data || error.message);
    throw new Error("No se pudo obtener el token");
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
    const token = await getToken();
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
 * Obtiene los modelos de vehículos según la marca y el año.
 * @param marca Código de la marca del vehículo.
 * @param anio Año de fabricación del vehículo.
 */
export async function getModelos(marca: number, anio: number): Promise<any> {
  if (!marca || !anio) {
    throw new Error("Se requieren los parámetros marca y anio");
  }

  try {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/vehiculos/gruposModelo`, {
      headers: {Authorization: token},
      params: { Marca: marca, Año: anio },
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
    const token = await getToken();
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
 * Realiza una cotización de seguro de vehículo.
 * @param cotizacionData Datos de la cotización.
 */
export async function cotizarRus(cotizacionData: any): Promise<any> {
  try {
    const token = await getToken();
    const response = await axios.put(`${API_URL}/cotizaciones/autos`, cotizacionData, {
      headers: { Authorization: token},
    });

    return response.data;
  } catch (error: any) {
    console.error("Error realizando cotización:", error.response?.data || error.message);
    throw new Error("No se pudo realizar la cotización");
  }
}
