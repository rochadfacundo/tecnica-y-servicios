import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DignaService {

private apiUrl = 'https://api-5cekuonbbq-uc.a.run.app/digna';

  constructor(private http: HttpClient) { }

  getToken(usuarioName:string,password:string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/token`, {
      usuarioName: usuarioName,
      password: password
    });
  }

  cotizar(){

  }
}
