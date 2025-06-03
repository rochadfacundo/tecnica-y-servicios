import * as admin from "firebase-admin";
import axios from "axios";
import { defineSecret } from "firebase-functions/params";
import { Tipo } from "./enums/tipoVehiculo";

const ENV = defineSecret("ENV");

// Autos
const INFOA_USUARIO = defineSecret("INFOA_USUARIO");
const INFOA_CLAVE = defineSecret("INFOA_CLAVE");
const INFOA_AUTH_URL = defineSecret("INFOA_AUTH_URL");
const REFRESH_URL = defineSecret("INFOA_REFRESH_URL");
const INFOA_BRANDS_URL = defineSecret("INFOA_BRANDS_URL");

// Motos
const INFOM_USUARIO = defineSecret("INFOM_USUARIO");
const INFOM_CLAVE = defineSecret("INFOM_CLAVE");
const INFOM_AUTH_URL = defineSecret("INFOM_AUTH_URL");
const INFOM_REFRESH_URL = defineSecret("INFOM_REFRESH_URL");
const INFOM_BRANDS_URL = defineSecret("INFOM_BRANDS_URL");

// Demo Autos
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

const getCredentials = async (unidad: Tipo) => {
  if (await isDemo()) {
    return {
      usuario: await INFOA_USUARIO_DEMO.value(),
      clave: await INFOA_CLAVE_DEMO.value(),
    };
  }

  if (unidad === Tipo.VEHICULO) {
    return {
      usuario: await INFOA_USUARIO.value(),
      clave: await INFOA_CLAVE.value(),
    };
  } else {
    return {
      usuario: await INFOM_USUARIO.value(),
      clave: await INFOM_CLAVE.value(),
    };
  }
};

const getUrls = async (unidad: Tipo) => {
  const demo = await isDemo();

  if (unidad === Tipo.VEHICULO) {
    return {
      authUrl:
      demo ? await INFOA_AUTH_URL_DEMO.value() : await INFOA_AUTH_URL.value(),
      refreshUrl:
      demo ? await REFRESH_URL_DEMO.value() : await REFRESH_URL.value(),
      brandsUrl:
      demo ? await INFOA_BRANDS_URL_DEMO.value():await INFOA_BRANDS_URL.value(),
    };
  } else {
    return {
      authUrl: await INFOM_AUTH_URL.value(),
      refreshUrl: await INFOM_REFRESH_URL.value(),
      brandsUrl: await INFOM_BRANDS_URL.value(),
    };
  }
};

export const getTokenInfoauto = async (unidad: Tipo) => {
  const { usuario, clave } = await getCredentials(unidad);
  const { authUrl, refreshUrl } = await getUrls(unidad);
  const docRef = db.collection("tokens").doc(`infoauto_${unidad}`);
  const doc = await docRef.get();

  if (doc.exists) {
    const data = doc.data();
    const now = Date.now();

    if (data?.access_token && data.expiration > now) {
      console.log(`🔄 Reutilizando token de ${unidad}`);
      return data.access_token;
    }

    if (data?.refresh_token && data.refresh_token_expiration > now) {
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

        const newAccessToken = refreshResponse.data.access_token;
        const expiresIn = refreshResponse.data.expires_in * 1000;

        await docRef.set({
          access_token: newAccessToken,
          refresh_token: data.refresh_token,
          expiration: Date.now() + expiresIn - 60000,
        });

        return newAccessToken;
      } catch (err) {
        console.error("❌ Error al refrescar token. Pidiendo uno nuevo.");
      }
    }
  }

  const response = await axios.post(authUrl, null, {
    headers: {
      "Authorization":
      `Basic ${Buffer.from(`${usuario}:${clave}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const accessToken = response.data.access_token;
  const refreshToken = response.data.refresh_token;
  const expirationTime = Date.now() + 55 * 60 * 1000;
  const refreshExpiration = Date.now() + 24 * 60 * 60 * 1000;

  await docRef.set({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiration: expirationTime,
    refresh_token_expiration: refreshExpiration,
  });

  return accessToken;
};

export const getTodasLasMarcasInfoauto = async (unidad: Tipo) => {
  try {
    const token = await getTokenInfoauto(unidad);
    const { brandsUrl } = await getUrls(unidad);
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
          page,
          page_size: pageSize,
        },
      });

      const marcas = response.data;
      todasLasMarcas = [...todasLasMarcas, ...marcas];
      hayMas = marcas.length >= pageSize;
      page++;
    }

    return todasLasMarcas;
  } catch (error: any) {
    const message = error.response?.data?.message || "Error get marcas";
    throw new Error(message);
  }
};

export const getMarcasInfoauto = async (unidad: Tipo) => {
  try {
    const token = await getTokenInfoauto(unidad);
    const { brandsUrl } = await getUrls(unidad);

    const response = await axios.get(brandsUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Error get marcas";
    throw new Error(message);
  }
};

export const getGruposPorMarca = async (
  brandId: string,
  unidad: Tipo
) => {
  try {
    const token = await getTokenInfoauto(unidad);
    const { brandsUrl } = await getUrls(unidad);
    const url = `${brandsUrl}/${brandId}/groups`;
    const response = await axios.get(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Error get grupos";
    throw new Error(message);
  }
};

export const getModelosPorMarcaYGrupo = async (
  brandId: string,
  groupId: string,
  unidad: Tipo
) => {
  try {
    const token = await getTokenInfoauto(unidad);
    const { brandsUrl } = await getUrls(unidad);
    const url = `${brandsUrl}/${brandId}/groups/${groupId}/models`;
    const response = await axios.get(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Error get modelos";
    throw new Error(message);
  }
};
