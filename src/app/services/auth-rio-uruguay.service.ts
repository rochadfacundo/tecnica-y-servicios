import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthRioUruguayService {
  private apiUrl = 'https://sandbox.sis.rus.com.ar/api-rus/login/token';

  constructor(private http: HttpClient) {}

  getToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const body = {
      userName: '18291036ws',
      password: 'cambiar',
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}
