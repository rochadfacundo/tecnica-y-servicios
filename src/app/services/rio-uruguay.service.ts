import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CotizacionRioUruguay, VigenciaRus } from '../interfaces/cotizacionRioUruguay';
import { environment } from '../../../environment';
import { TipoVehiculo } from '../enums/tipoVehiculos';

@Injectable({
  providedIn: 'root'
})
export class RioUruguayService {
  private apiBaseUrl = 'https://api-5cekuonbbq-uc.a.run.app/RUS';
  //private apiBaseUrl = environment.URL_DEV+'/RUS';

  constructor(private http: HttpClient) {}


  getMarcas(tipoUnidad: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/marcas?tipoUnidad=${tipoUnidad}`);
  }

  getModelos(marca: number, anio: number, tipoUnidad?: number): Observable<any> {
    let params = new HttpParams().set("marca", marca).set("anio", anio);
    if (tipoUnidad !== undefined) {
      params = params.set("tipoUnidad", tipoUnidad);
    }

    return this.http.get(`${this.apiBaseUrl}/modelos`, { params });
  }


  getVersiones(idGrupoModelo: number, anio?: number, tipoUnidad?: number, idMarca?: number): Observable<any> {
    let params: any = { idGrupoModelo };
    if (anio) params.anio = anio;
    if (tipoUnidad) params.tipoUnidad = tipoUnidad;
    if (idMarca) params.idMarca = idMarca;

    console.log(params);
    return this.http.get(`${this.apiBaseUrl}/versiones`, { params });
  }

  getVigencias(tipo: TipoVehiculo): Observable<VigenciaRus[]> {
    return this.http.get<VigenciaRus[]>(`${this.apiBaseUrl}/vigencias`, {
      params: { tipo }
    });
  }

  cotizar(data: CotizacionRioUruguay): Observable<any> {
    console.log("📩 Enviando a la API RUS: ", JSON.stringify(data, null, 2));
    return this.http.put(`${this.apiBaseUrl}/cotizaciones`, data);
  }

}