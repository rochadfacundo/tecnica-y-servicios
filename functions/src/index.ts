import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import cors from "cors";

admin.initializeApp();
const corsHandler = cors({origin: true});

export const atmCotizar = functions.onRequest(
  {
    timeoutSeconds: 60, // 🔥 Asegurar 60s de espera en Firebase
    memory: "512MiB",
  },
  async (req, res) => {
    console.log("🔹 Nueva solicitud recibida");

    corsHandler(req, res, async () => {
      if (req.method !== "POST") {
        console.log("❌ Método no permitido");
        res.status(405).json({error: "Método no permitido, solo POST"});
        return;
      }

      try {
        console.log("⏳ Enviando petición a ATM...");

        const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:tem="http://tempuri.org/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <soapenv:Body>
            <tem:AUTOS_Cotizar>
              <tem:doc_in>
                <auto>
                  <usuario>
                    <usa>TECYSEG</usa>
                    <pass>TECYSEG%24</pass>
                    <fecha>10032025</fecha>
                    <vendedor>0956109561</vendedor>
                    <origen>WS</origen>
                    <plan>02</plan>
                  </usuario>
                  <asegurado>
                    <persona>F</persona>
                    <iva>CF</iva>
                    <cupondscto></cupondscto>
                    <infomotoclub>N</infomotoclub>
                    <bonificacion></bonificacion>
                  </asegurado>
                  <bien>
                    <cerokm>N</cerokm>
                    <rastreo>N</rastreo>
                    <micrograbado>N</micrograbado>
                    <alarma>0</alarma>
                    <marcaalarma></marcaalarma>
                    <esventa>A</esventa>
                    <ajuste></ajuste>
                    <codpostal>1005</codpostal>
                    <accesorios/>
                    <marca>18</marca>
                    <modelo>505</modelo>
                    <anofab>2010</anofab>
                    <seccion>3</seccion>
                    <uso>0101</uso>
                    <suma></suma>
                  </bien>
                </auto>
              </tem:doc_in>
            </tem:AUTOS_Cotizar>
          </soapenv:Body>
        </soapenv:Envelope>`;

        const startTime = Date.now(); // ⏱ Medir tiempo de inicio
        console.log("🌍 Enviando solicitud a ATM...");

        const response = await axios.post(
          "http://wsatm-dev.atmseguros.com.ar/index.php/soap",
          soapRequest,
          {
            headers: {"Content-Type": "text/xml"},
            timeout: 55000, // ⏳ Timeout menor a 60s de Firebase
          }
        );

        const endTime = Date.now();
        console.log(`✅ Respuesta recibida en ${(endTime - startTime) / 1000}
       segundos`);

        res.status(200).send(response.data);
      } catch (error: any) {
        console.error("❌ Error en la petición a ATM");

        // 🔍 Imprimir detalles del error
        if (error.response) {
          console.error("🔴 Error HTTP:", error.response.status);
          console.error("📄 Respuesta de ATM:", error.response.data);
        } else if (error.request) {
          console.error("⏳ No hubo respuesta de ATM");
        } else {
          console.error("⚠️ Error desconocido:", error.message);
        }

        res.status(500).json({
          error: "Error en la comunicación con ATM",
          details: error.message,
        });
      }
    });
  }
);
