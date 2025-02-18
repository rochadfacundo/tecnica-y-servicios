import axios from "axios";
import qs from "qs";

export async function handler(event) {
  try {
    const data = qs.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "password",
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    });

    const response = await axios.post(process.env.API_RIVADAVIA, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("❌ Error en la petición:", error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data,
      }),
    };
  }
}
