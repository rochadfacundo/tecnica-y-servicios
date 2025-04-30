import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AtmService {
  private apiUrl = 'https://api-5cekuonbbq-uc.a.run.app/ATM';

  constructor(private http: HttpClient) {}


  cotizarATM(xml: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cotizar`, { xml },
      { responseType: 'text' });
  }
}
