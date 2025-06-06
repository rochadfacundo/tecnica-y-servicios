/* eslint-disable @typescript-eslint/no-explicit-any */
import * as admin from "firebase-admin";
import axios from "axios";
import { defineSecret } from "firebase-functions/params";

const FED_TOKEN_URL = defineSecret("FED_TOKEN_URL_DEMO");
const FED_BASIC_USER = defineSecret("FED_BASIC_USER_DEMO");
const FED_BASIC_PASS = defineSecret("FED_BASIC_PASS_DEMO");
const FED_USER = defineSecret("FED_USER_DEMO");
const FED_PASS = defineSecret("FED_PASS_DEMO");

const FED_URL_LOCALIDADES = defineSecret("FED_URL_LOCALIDADES_DEMO");
const FED_URL_VEHICULO = defineSecret("FED_URL_VEHICULO_DEMO");
const FED_URL_COTIZACION = defineSecret("FED_URL_COTIZACION_DEMO");
const FED_URL_RASTREADORES = defineSecret("FED_URL_RASTREADORES_DEMO");

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const getTokenFederacion = async () => {
  const tokenRef = db.doc("Federacion/token");
  const now = Date.now();

  const tokenDoc = await tokenRef.get();

  if (tokenDoc.exists && tokenDoc.data()?.expiration > now) {
    return tokenDoc.data()?.value;
  }

  try {
    const auth = {
      username: await FED_BASIC_USER.value(),
      password: await FED_BASIC_PASS.value(),
    };

    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", await FED_USER.value());
    formData.append("password", await FED_PASS.value());

    const response = await axios.post(await FED_TOKEN_URL.value(), formData, {
      auth,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = response.data.access_token;
    const expiration = now + 55 * 60 * 1000;

    await tokenRef.set({ value: accessToken, expiration });

    return accessToken;
  } catch (error: any) {
    console.error("Error obteniendo token Federacion:",
      error.response?.data || error.message);
    throw new Error("No se pudo obtener el token de Federacion");
  }
};

const authHeaders = async () => ({
  "Authorization": `Bearer ${await getTokenFederacion()}`,
  "Content-Type": "application/json",
});

export const getLocalidadesFederacion = async () => {
  try {
    const headers = await authHeaders();
    const response =
    await axios.get(await FED_URL_LOCALIDADES.value(), { headers });
    console.log("obtener localidades ok");
    return response.data;
  } catch (error: any) {
    console.error("Error localidades:", error.response?.data || error.message);
    throw new Error("No se pudo obtener las localidades en federacion");
  }
};

export const getRastreadores = async () => {
  try {
    const headers = await authHeaders();
    const response = await axios.get(
      await FED_URL_RASTREADORES.value(), { headers });
    console.log("obtener rastreadores ok");
    return response.data.respuesta;
  } catch (error: any) {
    console.error("Error rastreador:", error.response?.data || error.message);
    throw new Error("No se pudo obtener los rastreadores en federacion");
  }
};

export const getFranquiciaVigente = async (
  codInfoAuto: string,
  fecha: string
) => {
  try {
    const headers = await authHeaders();
    const url =
`${await FED_URL_VEHICULO.value()}/${codInfoAuto}/franquicia-vigente/${fecha}`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error: any) {
    console.error("Error franquicia:", error.response?.data || error.message);
    return error.response?.data || error?.data;
  }
};

export const getTiposPersoneria = async () => {
  try {
    const snapshot = await db.collection("tipoPersoneria").get();
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("❌ Error al obtener tipoPersoneria:", error);
    return error;
  }
};

export const getTipoVehiculoFederacion = async (codInfoAuto: number) => {
  try {
    const headers = await authHeaders();
    const url = `${await FED_URL_VEHICULO.value()}/${codInfoAuto}/tipos`;
    const response = await axios.get(url, { headers });
    console.log("obtener tipo vehiculo ok");
    return response.data;
  } catch (error: any) {
    console.error("Error tipo vehiculo:",
      error.response?.data || error.message);
    throw new Error("No se pudo obtener los tipo vehiculo en federacion");
  }
};

export const cotizarFederacion = async (datos: any) => {
  try {
    const token = await getTokenFederacion();
    const response = await axios.post(await FED_URL_COTIZACION.value(), datos, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "accept": "*/*",
      },
    });
    console.log("cotiza fedPat ok");
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data || "Error desconocido";
    console.error("❌ Error en cotización Federacion:", errorMessage);
    throw errorMessage;
  }
};
