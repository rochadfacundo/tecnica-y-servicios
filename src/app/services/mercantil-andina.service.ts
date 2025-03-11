import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MercantilAndinaService {
  private API_URL = "https://api-5cekuonbbq-uc.a.run.app/mercantil"; // Tu endpoint base

  constructor(private http: HttpClient) {}

  obtenerToken(): Observable<any> {
    return this.http.get(`${this.API_URL}/token`);
  }

  obtenerMarcas(): Observable<any> {
    return this.http.get(`${this.API_URL}/marcas`);
  }

  obtenerModelos(marca: number, año: number): Observable<any> {
    return this.http.get(`${this.API_URL}/modelos`, {
      params: {
        marca: marca,
        año: año,
      }
    });
  }

  obtenerVehiculos(marca: string, año: number, tipo: string): Observable<any> {
    return this.http.get(`${this.API_URL}/vehiculos`, {
      params: {marca, año, tipo}
    });
  }

  obtenerVehiculosPorModelo(marca: number, año: number, modelo: string): Observable<any> {
    return this.http.get(`${this.API_URL}/versiones`, {
      params: {marca, año, modelo}
    });
  }

}
