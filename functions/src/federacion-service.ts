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
