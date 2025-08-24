import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Productor } from '../models/productor.model';

@Injectable({
  providedIn: 'root'
})
export class AtmService {
  //private apiUrl = 'http://3.149.136.15:3000/ATM';
  private apiUrl = 'https://atm.tecnicayservicios.com.ar/ATM';

  constructor(private http: HttpClient) {}


  cotizarATM(xml: string, productor: Productor): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(`${this.apiUrl}/cotizar`, {
      xml,
      productor
    }, {
      headers,
      responseType: 'text'
    });
  }

}
