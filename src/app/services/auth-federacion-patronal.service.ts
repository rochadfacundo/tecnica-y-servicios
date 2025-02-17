import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthFederacionPatronalService {
  private apiUrl = 'https://api-sandbox.fedpat.com.ar/oauth/token';
  private username = 'API_TECNYSERV_SB';
  private password = 'XS5ysAX$$r_ESI';

  constructor(private http: HttpClient) {}

  obtenerToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`),
    });

    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('username', '29780')
      .set('password', 'qJP5.PtIJ6PAsI');

    return this.http.post(this.apiUrl, body.toString(), { headers });
  }
}
