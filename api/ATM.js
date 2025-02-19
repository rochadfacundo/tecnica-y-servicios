import axios from 'axios/dist/node/axios.cjs';


export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:tem="http://tempuri.org/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <soapenv:Body>
        <tem:AUTOS_Cotizar>
          <tem:doc_in>
            <auto>
              <usuario>
                <usa>TECYSEG</usa>
                <pass>TECYSEG%24</pass>
                <fecha>05112024</fecha>
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

    const response = await axios.post("http://wsatm-dev.atmseguros.com.ar/index.php/soap", soapRequest, {
      headers: {
        "Content-Type": "text/xml",
      },
      timeout: 25000, // 25 segundos
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.status(200).send(response.data);
  } catch (error) {
    console.error("❌ Error en la petición:", error.message);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
}
