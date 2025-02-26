import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AtmService {
  private atmUrl = 'http://wsatm-dev.atmseguros.com.ar/index.php/soap';

  constructor(private http: HttpClient) {}

  cotizarAuto() {
    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:tem="http://tempuri.org/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
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
              </asegurado>
              <bien>
                <cerokm>N</cerokm>
                <marca>18</marca>
                <modelo>505</modelo>
                <anofab>2010</anofab>
                <seccion>3</seccion>
                <uso>0101</uso>
                <codpostal>1005</codpostal>
              </bien>
            </auto>
          </tem:doc_in>
        </tem:AUTOS_Cotizar>
      </soapenv:Body>
    </soapenv:Envelope>`;

    const headers = new HttpHeaders({
      'Content-Type': 'text/xml'
    });

    return this.http.post(this.atmUrl, soapRequest, { headers, responseType: 'text' });
  }
}
