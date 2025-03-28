import * as admin from "firebase-admin";
import axios from "axios";

// Inicializar Firestore si aún no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// URL del servicio de autenticación de INFOAUTO
const AUTH_URL = "https://demo.api.infoauto.com.ar/cars/auth/login";
const AUTH_URL_REFRESH= "https://demo.api.infoauto.com.ar/cars/auth/refresh";

// Credenciales de INFOAUTO
const CREDENTIALS = {
  usuario: "hrocha@tecnicayseguros.com.ar",
  clave: "tys.API2025",
};

// Función para obtener el token de INFOAUTO
export const obtenerTokenInfoauto = async () => {
  const docRef = db.collection("tokens").doc("infoauto");
  const doc = await docRef.get();

  if (doc.exists) {
    const data = doc.data();
    const now = Date.now();


    // Si no expira, todavia lo reutilizo
    if (data && data.access_token && data.expiration > now) {
      console.log("🔄 Reutilizando access_token de INFOAUTO");
      return data.access_token;
    }

    // Si expira, utilizo URL para renovar token.
    if (data && data.refresh_token && data.refresh_token_expiration > now) {
      console.log("🔄 Intentando refrescar el access_token...");
      try {
        const refreshResponse = await axios.post(AUTH_URL_REFRESH, {
          grant_type: "refresh_token",
          refresh_token: data.refresh_token,
        });
        console.log("Se actualiza exitosamente el nuevo token!");
        const newAccessToken = refreshResponse.data.access_token;
        const expiresIn = refreshResponse.data.expires_in * 1000;
        const expirationTime = Date.now() + expiresIn - 60000;

        await docRef.set({
          access_token: newAccessToken,
          refresh_token: data.refresh_token, // No cambia
          expiration: expirationTime,
        });
        console.log("Se guarda bien el nuevo token en firestore!");
        return newAccessToken;
      } catch (refreshError) {
        console.error("❌ Error refrescando el token, solicitando uno nuevo...");
      }
    }
  }

  // Obtenemos token nuevo si expira el refresh token, no hay bd o falla.
  console.log("🔄 Obteniendo access token de INFOAUTO...");
  try {
    const response = await axios.post(AUTH_URL, null, {
      headers: {
        "Authorization":
        `Basic ${Buffer.from(`${CREDENTIALS.usuario}:${CREDENTIALS.clave}`)
          .toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const expiresIn = 55 * 60 * 1000; // 55 minutos en milisegundos
    const expirationTime = Date.now() + expiresIn;
    // 24 horas
    const refreshTokenExpirationTime = Date.now() + (24 * 60 * 60 * 1000);
    console.log("Se crea el nuevo access_token!");

    await docRef.set({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiration: expirationTime,
      refresh_token_expiration: refreshTokenExpirationTime,
    });
    console.log("Se guardo bien el token NUEVO en firestore!");
    return accessToken;
  } catch (error: any) {
    const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error desconocido";
    throw new Error(errorMessage);
  }
};
