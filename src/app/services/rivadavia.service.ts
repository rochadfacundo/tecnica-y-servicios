import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatosCotizacionRivadavia } from '../interfaces/cotizacionRivadavia';

@Injectable({
  providedIn: 'root'
})
export class RivadaviaService {

  private API_URL = "https://api-5cekuonbbq-uc.a.run.app/rivadavia";

  constructor(private http: HttpClient) {}

  cotizarRivadavia(data: DatosCotizacionRivadavia): Observable<any> {
    console.log("📩 Enviando a la API:", JSON.stringify(data, null, 2));
    return this.http.post(`${this.API_URL}/cotizar`, data);
  }
}
