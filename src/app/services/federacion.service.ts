import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FederacionService {

  private apiUrl = 'https://api-5cekuonbbq-uc.a.run.app/federacion';

  constructor(private http: HttpClient) {
  }

    getToken(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/token`);
    }

}
