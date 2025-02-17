import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthRivadaviaService {
  private apiUrl = 'https://ssotest.apps.segurosrivadavia.com/auth/realms/api-brokers/protocol/openid-connect/token';

  constructor(private http: HttpClient) {}

  getToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Ocp-Apim-Subscription-Key': 'c6b637fc51',
    });

    const body = new HttpParams()
      .set('client_id', '24bea14a')
      .set('client_secret', 'e946749e9e1cdce8a8709b5604a3e0e5')
      .set('grant_type', 'password')
      .set('username', 'tsgr')
      .set('password', 'vbVdGFsWnQ81Dg9');

    return this.http.post(this.apiUrl, body, { headers });
  }
}
