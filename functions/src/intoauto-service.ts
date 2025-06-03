import * as admin from "firebase-admin";
import axios from "axios";
import { defineSecret } from "firebase-functions/params";

const ENV = defineSecret("ENV");

const INFOA_USUARIO = defineSecret("INFOA_USUARIO");
const INFOA_CLAVE = defineSecret("INFOA_CLAVE");
const INFOA_AUTH_URL = defineSecret("INFOA_AUTH_URL");
const REFRESH_URL = defineSecret("INFOA_REFRESH_URL");
const INFOA_BRANDS_URL = defineSecret("INFOA_BRANDS_URL");

const INFOA_USUARIO_DEMO = defineSecret("INFOA_USUARIO_DEMO");
const INFOA_CLAVE_DEMO = defineSecret("INFOA_CLAVE_DEMO");
const INFOA_AUTH_URL_DEMO = defineSecret("INFOA_AUTH_URL_DEMO");
const REFRESH_URL_DEMO = defineSecret("INFOA_REFRESH_URL_DEMO");
const INFOA_BRANDS_URL_DEMO = defineSecret("INFOA_BRANDS_URL_DEMO");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const isDemo = async () => {
  return (await ENV.value()) === "produccion";
};

const getCredentials = async () => {
  if (await isDemo()) {
    return {
      usuario: await INFOA_USUARIO_DEMO.value(),
      clave: await INFOA_CLAVE_DEMO.value(),
    };
  } else {
    return {
      usuario: await INFOA_USUARIO.value(),
      clave: await INFOA_CLAVE.value(),
    };
  }
};

const getUrls = async () => {
  if (await isDemo()) {
    return {
      authUrl: await INFOA_AUTH_URL_DEMO.value(),
      refreshUrl: await REFRESH_URL_DEMO.value(),
      brandsUrl: await INFOA_BRANDS_URL_DEMO.value(),
    };
  } else {
    return {
      authUrl: await INFOA_AUTH_URL.value(),
      refreshUrl: await REFRESH_URL.value(),
      brandsUrl: await INFOA_BRANDS_URL.value(),
    };
  }
};

export const getTokenInfoauto = async () => {
  const { usuario, clave } = await getCredentials();
  const { authUrl, refreshUrl } = await getUrls();

  const docRef = db.collection("tokens").doc("infoauto");
  const doc = await docRef.get();

  if (doc.exists) {
    const data = doc.data();
    const now = Date.now();

    if (data && data.access_token && data.expiration > now) {
      console.log("🔄 Reutilizando access_token de INFOAUTO");
      return data.access_token;
    }

    if (data && data.refresh_token && data.refresh_token_expiration > now) {
      console.log("🔄 Intentando refrescar el access_token...");
      try {
        const refreshResponse = await axios.post(refreshUrl, {
          grant_type: "refresh_token",
          refresh_token: data.refresh_token,
        }, {
          headers: {
            "Authorization": `Bearer ${data.access_token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Se actualiza exitosamente el nuevo token!");
        const newAccessToken = refreshResponse.data.access_token;
        const expiresIn = refreshResponse.data.expires_in * 1000;
        const expirationTime = Date.now() + expiresIn - 60000;

        await docRef.set({
          access_token: newAccessToken,
          refresh_token: data.refresh_token,
          expiration: expirationTime,
        });
        console.log("Se guarda bien el nuevo token en firestore!");
        return newAccessToken;
      } catch (refreshError) {
        console.error("❌ Error refrescando el token, solicitando uno nuevo");
      }
    }
  }

  console.log("🔄 Obteniendo access token de INFOAUTO...");
  try {
    const response = await axios.post(authUrl, null, {
      headers: {
        "Authorization":
        `Basic ${Buffer.from(`${usuario}:${clave}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const expiresIn = 55 * 60 * 1000;
    const expirationTime = Date.now() + expiresIn;
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
    const errorMessage = error.response?.data?.message || "Error desconocido";
    throw new Error(errorMessage);
  }
};

export const getTodasLasMarcasInfoauto = async () => {
  try {
    const token = await getTokenInfoauto();
    const { brandsUrl } = await getUrls();
    const pageSize = 100;
    let page = 1;
    let todasLasMarcas: any[] = [];
    let hayMas = true;

    while (hayMas) {
      const response = await axios.get(brandsUrl, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          page: page,
          page_size: pageSize,
        },
      });

      const marcas = response.data;
      todasLasMarcas = [...todasLasMarcas, ...marcas];

      if (marcas.length < pageSize) {
        hayMas = false;
      } else {
        page++;
      }
    }

    return todasLasMarcas;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Error get marcas";
    throw new Error(errorMessage);
  }
};

export const getMarcasInfoauto = async () => {
  try {
    const token = await getTokenInfoauto();
    const { brandsUrl } = await getUrls();

    const response = await axios.get(brandsUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Error desconocido";
    throw new Error(errorMessage);
  }
};

export const getGruposPorMarca = async (brandId: string) => {
  try {
    const token = await getTokenInfoauto();
    const { brandsUrl } = await getUrls();
    const url = `${brandsUrl}/${brandId}/groups`;
    const response = await axios.get(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.log("error al traer grupos");
    console.log(error);
    const errorMessage = error.response?.data?.message || "Error desconocido";
    throw new Error(errorMessage);
  }
};

export const getModelosPorMarcaYGrupo = async (
  brandId: string,
  groupId: string
) => {
  try {
    const token = await getTokenInfoauto();
    const { brandsUrl } = await getUrls();
    const url = `${brandsUrl}/${brandId}/groups/${groupId}/models`;
    const response = await axios.get(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.log("error al traer modelos");
    console.log(error);
    const errorMessage = error.response?.data?.message || "Error desconocido";
    throw new Error(errorMessage);
  }
};
