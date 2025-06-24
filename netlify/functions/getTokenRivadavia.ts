import { Handler } from "@netlify/functions";
import axios from "axios";
import * as qs from "qs";

const handler: Handler = async () => {
  try {
    // Datos en formato x-www-form-urlencoded
    const data = qs.stringify({
      client_id: process.env["CLIENT_ID"],
      client_secret: process.env["CLIENT_SECRET"],
      grant_type: "password",
      username: process.env["USERNAME"],
      password: process.env["PASSWORD"],
    });

    // Llamada a la API de Rivadavia
    const response = await axios.post(process.env["API_RIVADAVIA"] as string, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Ocp-Apim-Subscription-Key": process.env["SUBSCRIPTION_KEY"],
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",  // Permite solicitudes desde cualquier origen
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(response.data),
    };
  } catch (error: any) {
    console.error(" Error en la petición:", error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data,
      }),
    };
  }
};

export { handler };
