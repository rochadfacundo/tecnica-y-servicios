import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatosCotizacionRivadavia } from '../interfaces/cotizacionRivadavia';
import { TipoVehiculo } from '../interfaces/tipos';

@Injectable({
  providedIn: 'root'
})
export class RivadaviaService {

  private API_URL: string = "https://api-5cekuonbbq-uc.a.run.app/rivadavia";
  //private API_URL = environment.URL_DEV+'/rivadavia';

  constructor(private http: HttpClient) {}

  getSumaAsegurada(nroProductor: string, codigoInfoAuto: number, modelo: string): Observable<any> {
    let params: any = { nroProductor, codigoInfoAuto, modelo };

    return this.http.get(`${this.API_URL}/suma_asegurada`, { params });
  }

  getCodigoVehiculo(nro_productor: string, tipo_vehiculo: string, tipo_uso: string,tipo:string): Observable<any> {

    let params: any = { nro_productor, tipo_vehiculo, tipo_uso,tipo };

    return this.http.get(`${this.API_URL}/codigo_vehiculo`, { params });
  }

  cotizarRivadavia(data: DatosCotizacionRivadavia,tipo:TipoVehiculo | string): Observable<any> {
    const params = { tipoVehiculo: String(tipo) };

    console.log("📩 Enviando a la API Riv: ", JSON.stringify(data, null, 2));
    return this.http.post(`${this.API_URL}/cotizar`, data, { params });
  }
}
