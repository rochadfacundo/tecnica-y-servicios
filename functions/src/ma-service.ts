/* eslint-disable max-len */
import axios from "axios";
import * as admin from "firebase-admin";
import qs from "qs";
import { defineSecret } from "firebase-functions/params";
import { CotizacionMercantil } from "./interfaces/CotizacionMercantil";

// Inicialización de Firebase
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// 🔐 Secrets desde Firebase
const SUBSCRIPTION_KEY = defineSecret("MERCANTIL_SUBSCRIPTION_KEY_DEMO");
const BASIC_AUTH = defineSecret("MERCANTIL_BASIC_AUTH_DEMO");
const USERNAME = defineSecret("MERCANTIL_USERNAME_DEMO");
const PASSWORD = defineSecret("MERCANTIL_PASSWORD_DEMO");

const TOKEN_URL = defineSecret("MERCANTIL_TOKEN_URL_DEMO");
const MARCAS_URL = defineSecret("MERCANTIL_MARCAS_URL_DEMO");
const VEHICULOS_URL = defineSecret("MERCANTIL_VEHICULOS_URL_DEMO");
const COTIZAR_BASE_URL = defineSecret("MERCANTIL_COTIZAR_URL_DEMO");

export const obtenerTokenMercantil = async () => {
  const tokenRef = db.doc("Mercantil/token");
  const refreshRef = db.doc("Mercantil/refreshToken");
  const now = Date.now();

  const tokenDoc = await tokenRef.get();
  const refreshDoc = await refreshRef.get();

  if (tokenDoc.exists && tokenDoc.data()?.expiration > now) {
    console.log("🔄 Reutilizando access_token de Mercantil");
    return tokenDoc.data()?.value;
  }

  // ♻️ Intentar renovar con refresh_token
  if (refreshDoc.exists && refreshDoc.data()?.expiration > now) {
    try {
      const refreshToken = refreshDoc.data()?.value;

      const body = qs.stringify({
        grant_type: "refresh_token",
        client_id: "api-clientes-login",
        refresh_token: refreshToken,
      });

      const response = await axios.post(await TOKEN_URL.value(), body, {
        headers: {
          "Ocp-Apim-Subscription-Key": await SUBSCRIPTION_KEY.value(),
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${await BASIC_AUTH.value()}`,
        },
      });

      const newAccessToken = response.data.access_token;
      const newExpiresIn = response.data.expires_in * 1000;
      const newExpiration = now + newExpiresIn - 60000;

      await tokenRef.set({ value: newAccessToken, expiration: newExpiration });

      console.log("✅ Token actualizado con refresh para Mercantil");
      return newAccessToken;
    } catch (error: any) {
      console.error("❌ Error al refrescar token de Mercantil:",
        error.response?.data || error.message);
    }
  }

  // 🔐 Solicitar nuevo token con usuario y contraseña
  try {
    const headers = {
      "Ocp-Apim-Subscription-Key": await SUBSCRIPTION_KEY.value(),
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${await BASIC_AUTH.value()}`,
    };

    const body = qs.stringify({
      client_id: "api-clientes-login",
      username: await USERNAME.value(),
      password: await PASSWORD.value(),
    });

    const response =
    await axios.post(await TOKEN_URL.value(), body, { headers });

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const expiresIn = response.data.expires_in;
    const refreshExpiresIn = response.data.refresh_expires_in;

    const accessExpiration = now + expiresIn * 1000 - 60000;
    const refreshExpiration = now + refreshExpiresIn * 1000;

    await tokenRef.set({ value: accessToken, expiration: accessExpiration });
    await refreshRef.set({ value: refreshToken, expiration: refreshExpiration });

    console.log("✅ Token y refresh guardados en Firestore para Mercantil");
    return accessToken;
  } catch (error: any) {
    console.error("Error token:", error.response?.data || error.message);
    throw new Error("No se pudo obtener el token de Mercantil Andina");
  }
};

export const obtenerMarcasMercantil = async () => {
  try {
    const headers = {
      "Ocp-Apim-Subscription-Key": await SUBSCRIPTION_KEY.value(),
      "Content-Type": "application/json",
    };

    const response = await axios.get(await MARCAS_URL.value(), { headers });
    console.log("obtener marcas ok");
    return response.data;
  } catch (error: any) {
    console.error("Error marcas:", error.response?.data || error.message);
    throw new Error("No se pudo obtener las marcas de Mercantil Andina");
  }
};

export const obtenerModelosMercantil = async (
  marca: number,
  año: number,
  token: string
) => {
  try {
    const url = `${await MARCAS_URL.value()}/${marca}/${año}`;
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": await SUBSCRIPTION_KEY.value(),
      "Content-Type": "application/json",
    };

    const response = await axios.get(url, {
      headers,
      params: { marca, año },
    });
    console.log("obtener modelos ok");
    return response.data;
  } catch (error: any) {
    console.error("Error modelos:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener los modelos");
  }
};

export const obtenerVehiculosMercantil = async (
  marca: string,
  año: number,
  tipo: string,
  token: string
) => {
  try {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": await SUBSCRIPTION_KEY.value(),
      "Content-Type": "application/json",
    };

    const params = { q: marca, anio: año, tipo };

    const response = await axios.get(await VEHICULOS_URL.value(), {
      headers,
      params,
    });
    console.log("obtener vehiculo ok");
    return response.data;
  } catch (error: any) {
    console.error("Error obtener vehículo MA:",
      error.response?.data ||
      error.message);
    const errorMessage =
      error.response?.data?.errores?.[0]?.texto ||
      error.response?.data?.errores?.[0]?.mensaje ||
      "Error desconocido";

    throw new Error(errorMessage);
  }
};

export const obtenerVersionesMercantil = async (
  marca: number,
  año: number,
  modelo: string,
  token: string
) => {
  try {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": await SUBSCRIPTION_KEY.value(),
      "Content-Type": "application/json",
    };

    const url = `${await MARCAS_URL.value()}/${marca}/${año}/${modelo}`;
    const params = { marca, año, modelo };

    const response = await axios.get(url, { headers, params });
    console.log("obtener versión ok");
    return response.data;
  } catch (error: any) {
    console.error("Error obtener versiones:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener los vehículos");
  }
};

export const cotizarMercantil = async (
  data: CotizacionMercantil
) => {
  try {
    const token = await obtenerTokenMercantil();
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": await SUBSCRIPTION_KEY.value(),
      "Content-Type": "application/json",
    };

    let cotizarUrl = await COTIZAR_BASE_URL.value();
    switch (data.tipo) {
    case "VEHICULO":
      cotizarUrl += "auto";
      break;
    case "MOTOVEHICULO":
      cotizarUrl += "moto";
      data.canal = 81;
      break;
    case "CAMION":
      cotizarUrl += "camion";
      break;
    }

    const response = await axios.post(cotizarUrl, data, { headers });
    console.log("cotiza MA ok");
    return response.data;
  } catch (error: any) {
    console.error("Error realizando cotización MA:", error.response?.data || error.message);
    const errorMessage =
      error.response?.data?.errores?.[0]?.mensaje ||
      error.response?.data?.errores?.[0]?.texto ||
      "Error desconocido";

    throw new Error(errorMessage);
  }
};
