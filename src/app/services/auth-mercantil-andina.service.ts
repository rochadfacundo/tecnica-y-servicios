import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthMercantilAndinaService {
  private apiUrl = 'https://apidev.mercantilandina.com.ar/credenciales/v2/';
  private subscriptionKey = '5a51821ce0134a54ad1f46c3f5736f0b';
  private username = 'ROCHATST';
  private password = 'rochatst24';

  constructor(private http: HttpClient) {}

  getToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': this.subscriptionKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`),
    });

    const body = new HttpParams()
      .set('client_id', 'api-clientes-login')
      .set('username', this.username)
      .set('password', this.password);

    return this.http.post(this.apiUrl, body.toString(), { headers });
  }
}
