import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RioUruguayService {
  private apiBaseUrl = 'https://api-5cekuonbbq-uc.a.run.app'; // Nueva URL base

  constructor(private http: HttpClient) {}

  getMarcas(tipoUnidad: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/marcas?tipoUnidad=${tipoUnidad}`);
  }

  getModelos(marca: number, anio: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/modelos?marca=${marca}&anio=${anio}`);
  }

  getVersiones(idGrupoModelo: number, anio?: number, tipoUnidad?: number, idMarca?: number): Observable<any> {
    let params: any = { idGrupoModelo };
    if (anio) params.anio = anio;
    if (tipoUnidad) params.tipoUnidad = tipoUnidad;
    if (idMarca) params.idMarca = idMarca;

    console.log(params);
    return this.http.get(`${this.apiBaseUrl}/versiones`, { params });
  }

  cotizarAutos(data: any): Observable<any> {

    console.log("📩 Enviando a la API:", JSON.stringify(data, null, 2));
    return this.http.put(`${this.apiBaseUrl}/cotizaciones/autos`, data);
  }

  cotizarMotos(data: any): Observable<any> {

    console.log("📩 Enviando a la API:", JSON.stringify(data, null, 2));
    return this.http.put(`${this.apiBaseUrl}/cotizaciones/motos`, data);
  }
}
