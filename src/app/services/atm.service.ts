import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AtmService {
  private apiUrl = 'http://3.149.136.15:3000/ATM';
  //private apiUrl = 'https://atm.tecnicayservicios.com.ar/ATM';

  constructor(private http: HttpClient) {}


  cotizarATM(xml: string): Observable<any> {
    console.log("📩 Enviando a ATM: ",xml);
    const headers = new HttpHeaders({'Content-Type': 'text/xml'});

    return this.http.post(`${this.apiUrl}/cotizar`,xml,
         { headers, responseType: 'text' });
  }

}
