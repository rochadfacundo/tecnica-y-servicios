import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CotizacionMercantil } from '../interfaces/cotizacionMercantil';

@Injectable({
  providedIn: 'root'
})
export class MercantilAndinaService {
  private API_URL = "https://api-5cekuonbbq-uc.a.run.app/mercantil";

  constructor(private http: HttpClient) {}

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


  cotizar(data: CotizacionMercantil): Observable<any> {
 console.log("📩 Enviando a la API MA:", JSON.stringify(data, null, 2));
  return this.http.post(`${this.API_URL}/cotizaciones`, data);
  }
}
