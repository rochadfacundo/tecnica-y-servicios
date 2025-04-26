import * as admin from "firebase-admin";
import axios from "axios";
import qs from "qs";

// Inicializar Firebase si aún no está
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const API_URL =
"https://ssotest.apps.segurosrivadavia.com/auth/realms/api-brokers/protocol/openid-connect/token";

const API_SUMA_ASEGURADA=
"https://apibrokerstest.apps.segurosrivadavia.com/consulta/api/emision/v1/consulta/suma_asegurada";

const API_CODIGO_VEHICULO=
"https://apibrokerstest.apps.segurosrivadavia.com/consulta/api/emision/v1/consulta/codigo_vehiculo";


const API_COTIZACION =
"https://apibrokerstest.apps.segurosrivadavia.com/solicitud/api/emision/v1/solicitud/cotizacion";

const USERNAME = "tsgr";
const PASSWORD = "vbVdGFsWnQ81Dg9";
const CLIENT_ID = "24bea14a";
const CLIENT_SECRET = "e946749e9e1cdce8a8709b5604a3e0e5";

export const getTokenRivadavia = async () => {
  const tokenRef = db.doc("Rivadavia/token");
  const refreshRef = db.doc("Rivadavia/refreshToken");
  const now = Date.now();

  const tokenDoc = await tokenRef.get();
  const refreshDoc = await refreshRef.get();


  // Token válido
  if (tokenDoc.exists && tokenDoc.data()?.expiration > now) {
    console.log("🔄 Reutilizando access_token de Rivadavia");
    return tokenDoc.data()?.value;
  }

  // Intentar refresh
  if (refreshDoc.exists && refreshDoc.data()?.expiration > now) {
    try {
      console.log("♻️ Renovando access_token con refresh_token de Rivadavia");
      const refreshToken = refreshDoc.data()?.value;

      const refreshBody = qs.stringify({
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
      });

      const response = await axios.post(API_URL, refreshBody, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const newAccessToken = response.data.access_token;
      const newExpiresIn = response.data.expires_in * 1000;
      const newExpiration = now + newExpiresIn - 60000;

      await tokenRef.set({
        value: newAccessToken,
        expiration: newExpiration,
      });

      console.log("✅ access_token guardado en Firestore (Rivadavia)");
      return newAccessToken;
    } catch (error) {
      console.error("❌ Error al refrescar token Rivadavia,");
    }
  }

  // Login completo
  try {
    console.log("🔑 Obteniendo nuevo access_token con login Rivadavia...");
    const loginBody = qs.stringify({
      grant_type: "password",
      username: USERNAME,
      password: PASSWORD,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    const response = await axios.post(API_URL, loginBody, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const expiresIn= response.data.expires_in;
    const refreshExpiresIn= response.data.refresh_expires_in;

    const accessExpiration = now + expiresIn * 1000 - 60000;
    const refreshExpiration = now + refreshExpiresIn * 1000;

    await tokenRef.set({ value: accessToken,
      expiration: accessExpiration });
    await refreshRef.set({ value: refreshToken,
      expiration: refreshExpiration });

    console.log("✅ Token y refresh_token de Rivadavia guardados en Firestore");
    return accessToken;
  } catch (error: any) {
    console.error("❌ Error obteniendo token de Rivadavia:",
      error.response?.data || error.message);
    throw new Error("No se pudo obtener el token de Rivadavia");
  }
};

export const cotizarRivadavia = async (datos: any) => {
  try {
    const token = await getTokenRivadavia();

    const response = await axios.post(API_COTIZACION, datos, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "accept": "*/*",
      },
    });

    return response.data;
  } catch (error:any) {
    console.log(error.response.data);
    const errorMessage =
    error.response?.data ||
    // error.response?.data?.fieldErrors?.[0]?.message ||
    "Error desconocido";

    console.error("❌ Error en cotización Rivadavia:", errorMessage);

    throw errorMessage;
  }
};

// ✅ Función para obtener tipo de vehiculo que tiene esa marca y modelo
export const getSumaAsegurada =
  async (
    nroProductor: string,
    codigoInfoAuto: string,
    modelo: string // anio
  ) => {
    try {
      const token = await getTokenRivadavia();

      const params: any = {
        nroProductor: nroProductor,
        codigoInfoAuto: codigoInfoAuto,
        modelo: modelo,
      };

      const response = await axios.get(API_SUMA_ASEGURADA, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "accept": "*/*",
        },
        params,
      });

      return response.data;
    } catch (error: any) {
      console.log("error al traer modelos", error.response.data);
      console.log(error);
      const errorMessage =
      error.response?.data ||
      error.message ||
      "Error desconocido";

      throw new Error(errorMessage);
    }
  };

// ✅ Función para obtener Luego con el tipo de vehículo, el codigo_vehiculo:
export const getCodigoVehiculo =
async (
  nroProductor: string,
  TipoVehiculo: string,
  tipoUso: string
) =>{
  try {
    const token = await getTokenRivadavia();

    const params: any = {
      nroProductor: nroProductor,
      tipo_vehiculo: TipoVehiculo,
      tipo_uso: tipoUso,
    };

    const response = await axios.get(API_CODIGO_VEHICULO, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "accept": "*/*",
      },
      params,
    });

    return response.data;
  } catch (error: any) {
    console.log("error al traer modelos", error.response.data);
    console.log(error);
    const errorMessage =
    error.response?.data ||
    error.message ||
    "Error desconocido";

    throw new Error(errorMessage);
  }
};
