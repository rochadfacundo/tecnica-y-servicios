import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RioUruguayService {
  private apiUrlMarcas = 'https://obtenermarcas-5cekuonbbq-uc.a.run.app/'; // URL de función en la nube
  private apiUrlModelos = 'https://obtenermodelos-5cekuonbbq-uc.a.run.app/'; // 🔹 Poner la URL correcta de la función en Firebase
  private apiUrlVersiones="https://obtenerversiones-5cekuonbbq-uc.a.run.app/";
  constructor(private http: HttpClient) {}

  /**
   * Obtiene las marcas de vehículos según el tipo de unidad.
   * @param tipoUnidad Código del tipo de unidad.
   */
  getMarcas(tipoUnidad: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.get(`${this.apiUrlMarcas}?tipoUnidad=${tipoUnidad}`, { headers });
  }

  /**
   * Obtiene los modelos de vehículos según la marca y el año.
   * @param marca Código de la marca del vehículo.
   * @param anio Año de fabricación del vehículo.
   */
  getModelos(marca: number, anio: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.get(`${this.apiUrlModelos}?marca=${marca}&anio=${anio}`, { headers });
  }

  getVersiones(idGrupoModelo: number, anio?: number, tipoUnidad?: number, idMarca?: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    let params: any = { idGrupoModelo };
    if (anio) params.anio = anio;
    if (tipoUnidad) params.tipoUnidad = tipoUnidad;
    if (idMarca) params.idMarca = idMarca;

    return this.http.get(`${this.apiUrlVersiones}`, { headers, params });
  }
}
