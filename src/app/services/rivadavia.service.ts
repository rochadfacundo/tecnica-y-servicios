import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RivadaviaService {

  private API_URL = "https://api-5cekuonbbq-uc.a.run.app/rivadavia";

  constructor(private http: HttpClient) {}

  obtenerToken(): Observable<any> {
    return this.http.get(`${this.API_URL}/token`);
  }
}
