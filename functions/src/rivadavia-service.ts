import * as admin from "firebase-admin";
import axios from "axios";
import qs from "qs";
import { defineSecret } from "firebase-functions/params";

// Inicializar Firebase si aún no está
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// 🔐 Secrets desde Firebase
const SUBSCRIPTION_KEY = defineSecret("RIVADAVIA_SUBSCRIPTION_KEY_DEMO");
const TOKEN_URL = defineSecret("RIVADAVIA_TOKEN_URL_DEMO");
const COTIZACION_URL = defineSecret("RIVADAVIA_COTIZACION_URL_DEMO");
const SUMA_URL = defineSecret("RIVADAVIA_SUMA_URL_DEMO");
const CODIGO_VEHICULO_URL = defineSecret("RIVADAVIA_CODIGO_VEHICULO_URL_DEMO");

const USERNAME = defineSecret("RIVADAVIA_USERNAME_DEMO");
const PASSWORD = defineSecret("RIVADAVIA_PASSWORD_DEMO");
const CLIENT_ID = defineSecret("RIVADAVIA_CLIENT_ID_DEMO");
const CLIENT_SECRET = defineSecret("RIVADAVIA_CLIENT_SECRET_DEMO");

export const getTokenRivadavia = async () => {
  const tokenRef = db.doc("Rivadavia/token");
  const refreshRef = db.doc("Rivadavia/refreshToken");
  const now = Date.now();

  const tokenDoc = await tokenRef.get();
  const refreshDoc = await refreshRef.get();

  if (tokenDoc.exists && tokenDoc.data()?.expiration > now) {
    return tokenDoc.data()?.value;
  }

  if (refreshDoc.exists && refreshDoc.data()?.expiration > now) {
    try {
      const refreshToken = refreshDoc.data()?.value;

      const refreshBody = qs.stringify({
        grant_type: "refresh_token",
        client_id: await CLIENT_ID.value(),
        client_secret: await CLIENT_SECRET.value(),
        refresh_token: refreshToken,
      });

      const response = await axios.post(await TOKEN_URL.value(), refreshBody, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const accessToken = response.data.access_token;
      const expiration = now + response.data.expires_in * 1000 - 60000;

      await tokenRef.set({ value: accessToken, expiration });
      return accessToken;
    } catch (error) {
      console.error("❌ Error al refrescar token Rivadavia");
    }
  }

  // Login completo
  try {
    const loginBody = qs.stringify({
      grant_type: "password",
      username: await USERNAME.value(),
      password: await PASSWORD.value(),
      client_id: await CLIENT_ID.value(),
      client_secret: await CLIENT_SECRET.value(),
    });

    const response = await axios.post(await TOKEN_URL.value(), loginBody, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const accessExpiration = now + response.data.expires_in * 1000 - 60000;
    const refreshExpiration = now + response.data.refresh_expires_in * 1000;

    await tokenRef.set({ value: accessToken, expiration: accessExpiration });
    await refreshRef.set({ value: refreshToken, expiration: refreshExpiration});

    return accessToken;
  } catch (error: any) {
    console.error("❌ Error obteniendo token de Rivadavia:",
      error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const cotizarRivadavia = async (datos: any) => {
  try {
    const token = await getTokenRivadavia();

    const response = await axios.post(await COTIZACION_URL.value(), datos, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "accept": "*/*",
        "Ocp-Apim-Subscription-Key": await SUBSCRIPTION_KEY.value(),
      },
    });
    console.log("cotiza Riv ok");
    return response.data;
  } catch (error: any) {
    console.log(error.response?.data);
    const errorMessage = error.response?.data || "Error desconocido";
    console.error("❌ Error en cotización Rivadavia:", errorMessage);
    throw errorMessage;
  }
};

export const getSumaAsegurada = async (
  nroProductor: string,
  codigoInfoAuto: number,
  modelo: string
) => {
  try {
    const token = await getTokenRivadavia();

    const params = { nroProductor, codigoInfoAuto, modelo };

    const response = await axios.get(await SUMA_URL.value(), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "accept": "*/*",
        "Ocp-Apim-Subscription-Key": await SUBSCRIPTION_KEY.value(),
      },
      params,
    });

    return response.data;
  } catch (error: any) {
    console.log("error al traer suma asegurada", error.response?.data);
    throw error.response?.data || error.message || "Error desconocido";
  }
};

export const getCodigoVehiculo = async (
  nroProductor: string,
  tipoVehiculo: string,
  tipoUso: string
) => {
  try {
    const token = await getTokenRivadavia();

    const params = {
      nro_productor: nroProductor,
      tipo_vehiculo: tipoVehiculo,
      tipo_uso: tipoUso,
    };

    const response = await axios.get(await CODIGO_VEHICULO_URL.value(), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "accept": "*/*",
        "Ocp-Apim-Subscription-Key": await SUBSCRIPTION_KEY.value(),
      },
      params,
    });

    return response.data;
  } catch (error: any) {
    console.log("error al traer código", error.response?.data);
    throw error.response?.data || "Error desconocido";
  }
};
