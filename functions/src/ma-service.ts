/* eslint-disable max-len */
import axios from "axios";
import qs from "qs";
import { CotizacionMercantil } from "./interfaces/CotizacionMercantil";

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
    console.log("obtener marcas ok");
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
    console.log("obtener modelos ok");
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
    console.log("obtener vehiculo ok");
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
    console.log("obtener version ok");
    return response.data;
  } catch (error: any) {
    console.error("Error obtener vehículos:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener los vehículos");
  }
};

//  Metodo Cotizar mercantil
export const cotizarMercantil = async (
  data: CotizacionMercantil)=> {
  try {
    const token = await obtenerTokenMercantil(); // Obtener token
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
    };
    let API_URL_COTIZAR="https://apidev.mercantilandina.com.ar/cotizaciones/v2/";
    switch (data.tipo) {
    case "VEHICULO":
      API_URL_COTIZAR+="auto";
      break;
    case "MOTOVEHICULO":
      API_URL_COTIZAR+="moto";
      data.canal=81;
      break;
    case "CAMION":
      API_URL_COTIZAR+="camion";
      break;
    }
    console.log("La api pedida es: ", API_URL_COTIZAR);
    const response = await axios.post(API_URL_COTIZAR, data, {
      headers,
    });
    console.log("cotiza MA ok");
    return response.data;
  } catch (error:any) {
    console.error("Error realizando cotización MA:", error.response?.data || error.message);

    const errorMessage =
        error.response?.data?.errores?.[0]?.mensaje ||
        error.response?.data?.errores?.[0]?.texto ||
         "Error desconocido";

    throw new Error(errorMessage);
  }
};
