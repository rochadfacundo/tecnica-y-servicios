/* eslint-disable max-len */
import axios from "axios";
import qs from "qs";

const API_URL = "https://apidev.mercantilandina.com.ar/credenciales/v2/";

const API_URL_MARCAS="https://apidev.mercantilandina.com.ar/vehiculos/v1/marcas";
const API_URL_VEHICULOS="https://apidev.mercantilandina.com.ar/vehiculos/v1/";
const SUBSCRIPTION_KEY = "5a51821ce0134a54ad1f46c3f5736f0b";
const USERNAME = "ROCHATST";
const PASS = "rochatst24";

export const obtenerTokenMercantil = async () => {
  try {
    const headers = {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic Uk9DSEFUU1Q6cm9jaGF0c3QyNA==",
    };

    const body = qs.stringify({
      client_id: "api-clientes-login",
      username: USERNAME,
      password: PASS,
    });

    const response = await axios.post(API_URL, body, { headers });
    console.log("mi token"+ response.data.access_token);
    return response.data.access_token;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error token:", error.response?.data || error.message);
    throw new Error("No se pudo obtener el token de Mercantil Andina");
  }
};


export const obtenerMarcasMercantil = async () => {
  try {
    const headers = {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
    };

    const response = await axios.get(API_URL_MARCAS, { headers });
    return response.data;
  } catch (error: any) {
    console.error("Error marcas:", error.response?.data || error.message);
    throw new Error("No se pudo obtener las marcas de Mercantil Andina");
  }
};

// Función para obtener modelos
export const obtenerModelosMercantil = async (
  marca: number,
  año: number,
  token: string
) => {
  try {
    // Usamos los parámetros en la query string
    const url = `${API_URL_MARCAS}/${marca}/${año}`;
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
    };

    // Realizamos la solicitud pasando los parámetros como query
    const response = await axios.get(url, {
      headers,
      params: { marca, año }, // Los parámetros se envían como query string
    });

    return response.data; // Devuelve los modelos
  } catch (error: any) {
    console.error("Error modelos:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener los modelos");
  }
};

// ✅ Función para obtener vehículos de Mercantil Andina
export const obtenerVehiculosMercantil = async (
  marca: string,
  año: number,
  tipo: string,
  token: string
) => {
  try {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
    };

    const params = { q: marca, anio: año, tipo };

    const response = await axios.get(API_URL_VEHICULOS, { headers, params });

    return response.data;
  } catch (error: any) {
    console.error("Error obtener vehículos:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener los vehículos");
  }
};

// ✅ Función para obtener vehículos de Mercantil Andina
export const obtenerVersionesMercantil = async (
  marca: number,
  año: number,
  modelo: string,
  token: string
) => {
  try {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
    };

    const params = { marca, año, modelo };
    const url = `${API_URL_MARCAS}/${marca}/${año}/${modelo}`;

    const response = await axios.get(url, { headers, params });

    return response.data;
  } catch (error: any) {
    console.error("Error obtener vehículos:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener los vehículos");
  }
};
