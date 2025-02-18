import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AtmService {
  private apiUrl = 'https://tecnicayservicios.netlify.app/.netlify/functions/cotizarATM';

  constructor(private http: HttpClient) {}

  cotizarAuto() {
    return this.http.get(this.apiUrl);
  }
}
