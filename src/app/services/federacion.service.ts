import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CotizacionFederacion } from '../interfaces/cotizacionfederacion';

@Injectable({
  providedIn: 'root'
})
export class FederacionService {

  private apiUrl = 'https://api-5cekuonbbq-uc.a.run.app/federacion';
  //private apiUrl = environment.URL_DEV+'/federacion';

  constructor(private http: HttpClient) {
  }
    getToken(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/token`);
    }

    getLocalidades(zipCode:number): Observable<any> {
      return this.http.get<any[]>(`${this.apiUrl}/localidades`, {
        params: { zipCode: zipCode }
      });
    }
    getFranquicia(codInfoAuto: string, fecha: string): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/franquicia/${codInfoAuto}/${fecha}`);
    }

    getRastreadores(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/rastreadores`);
    }

    getTiposPersoneria(): Observable<{ codigo: number, descripcion: string }[]> {
      return this.http.get<{ codigo: number, descripcion: string }[]>(`${this.apiUrl}/tipoPersoneria`);
    }

    getTiposVehiculo(codInfoAuto: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/tiposVehiculo/${codInfoAuto}`);
    }

    cotizarFederacion(data: CotizacionFederacion, zipCode: number,tipoVehiculo: string): Observable<any> {
      const params = { zipCode: zipCode, tipoVehiculo: tipoVehiculo  };
      return this.http.post(`${this.apiUrl}/cotizar`, data, { params });
    }

}
