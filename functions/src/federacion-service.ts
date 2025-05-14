import * as admin from "firebase-admin";
import axios from "axios";

// Inicializar Firebase si aún no está
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Endpoint y credenciales para Federación Patronal
const FEDERACION_TOKEN_URL = "https://api-sandbox.fedpat.com.ar/oauth/token";
const BASIC_AUTH_USERNAME = "API_TECNYSERV_SB";
const BASIC_AUTH_PASSWORD = "XS5ysAX$$r_ESI";

const FEDERACION_USERNAME = "29780";
const FEDERACION_PASSWORD = "qJP5.PtIJ6PAsI";

const API_LOCALIDADES_URL_FEDPAT=
"https://api-sandbox.fedpat.com.ar/v1/referencias/localidades/getLocalidades";

const API_VEHICULO_FEDPAT =
"https://api-sandbox.fedpat.com.ar/v1/vehiculos/vehiculo";

const API_URL_COTIZACION_FEDPAT=
"https://api-sandbox.fedpat.com.ar/v1/cotizador-automotores";

const API_URL_GET_RASTREADORES=
"https://api-sandbox.fedpat.com.ar/v1/referencias/rastreadoresVehiculares";


export const getTokenFederacion = async () => {
  const tokenRef = db.doc("Federacion/token");
  const now = Date.now();

  const tokenDoc = await tokenRef.get();

  // ✅ Reutilizar si aún es válido
  if (tokenDoc.exists && tokenDoc.data()?.expiration > now) {
    return tokenDoc.data()?.value;
  }

  // 🔐 Solicitar nuevo token
  try {
    const auth = {
      username: BASIC_AUTH_USERNAME,
      password: BASIC_AUTH_PASSWORD,
    };
    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", FEDERACION_USERNAME);
    formData.append("password", FEDERACION_PASSWORD);

    const response = await axios.post(FEDERACION_TOKEN_URL, formData, {
      auth,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;
    const expiration = now + (55 * 60 * 1000);

    await tokenRef.set({ value: accessToken,
      expiration: expiration });

    return accessToken;
  } catch (error: any) {
    console.error("Error obteniendo token Federacion:",
      error.response?.data || error.message);
    throw new Error("No se pudo obtener el token de Federacion");
  }
};

export const getLocalidadesFederacion = async () => {
  try {
    const token= await getTokenFederacion();
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get(API_LOCALIDADES_URL_FEDPAT, { headers });
    console.log("obtener localidades ok");
    return response.data;
  } catch (error: any) {
    console.error("Error marcas:", error.response?.data || error.message);
    throw new Error("No se pudo obtener las localidades en federacion");
  }
};

export const getRastreadores = async () => {
  try {
    const token= await getTokenFederacion();
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get(API_URL_GET_RASTREADORES, { headers });
    console.log("obtener rastreadores ok");
    return response.data.respuesta;
  } catch (error: any) {
    console.error("Error rastreador:", error.response?.data || error.message);
    throw new Error("No se pudo obtener los rastreadores en federacion");
  }
};

export const getFranquiciaVigente =
async (codInfoAuto: string, fecha: string) => {
  try {
    const token = await getTokenFederacion();
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get(
      API_VEHICULO_FEDPAT+`/${codInfoAuto}/franquicia-vigente/${fecha}`,
      { headers });
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data);
    console.error(error.data);
    return error.response?.data || error?.data;
  }
};

export const getTiposPersoneria = async () => {
  try {
    const snapshot = await db.collection("tipoPersoneria").get();
    const tipos = snapshot.docs.map((doc) => doc.data());
    return tipos;
  } catch (error) {
    console.error("❌ Error al obtener tipoPersoneria:", error);
    return error;
  }
};

export const getTipoVehiculoFederacion = async (codInfoAuto: number) => {
  try {
    const token= await getTokenFederacion();
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get(
      `${API_VEHICULO_FEDPAT}/${codInfoAuto}/tipos`, { headers });
    console.log("obtener tipo vehiculo ok");
    return response.data;
  } catch (error: any) {
    console.error("Error marcas:", error.response?.data || error.message);
    throw new Error("No se pudo obtener los tipo vehiculo en federacion");
  }
};

export const cotizarFederacion = async (datos: any) => {
  try {
    const token = await getTokenFederacion();

    const response = await axios.post(API_URL_COTIZACION_FEDPAT, datos, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "accept": "*/*",
      },
    });
    console.log("cotiza fedPat ok");
    return response.data;
  } catch (error:any) {
    console.log(error.response.data);
    const errorMessage =
    error.response?.data ||
    // error.response?.data?.fieldErrors?.[0]?.message ||
    "Error desconocido";

    console.error("❌ Error en cotización Federacion:", errorMessage);

    throw errorMessage;
  }
};
