import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthRivadaviaService {
  private netlifyFunctionUrl = 'https://tecnicayservicios.netlify.app/.netlify/functions/getTokenRivadavia';

  constructor(private http: HttpClient) {}

  getToken(): Observable<any> {
    return this.http.get(this.netlifyFunctionUrl);
  }
}
