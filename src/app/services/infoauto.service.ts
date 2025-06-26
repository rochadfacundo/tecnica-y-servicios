import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc } from 'firebase/firestore'; // Importa las funciones necesarias de Firebase
import { getFirestore } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { TipoVehiculo } from '../enums/tipoVehiculos';
import { Year } from '../interfaces/year';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class InfoautoService {

  private apiUrl = 'https://api-5cekuonbbq-uc.a.run.app/infoauto';
  //private apiUrl = environment.URL_DEV+'/infoauto';

  constructor(private http: HttpClient) {
  }

    // Método para obtener el token de INFOAUTO
    getToken(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/token`);
    }

    // Obtener marcas de Infoauto
    getMarcas(tipoVehiculo: string): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/marcas`, {
        params: { tipo: tipoVehiculo }
      });
    }

     // Obtener anios de una marca
    getAniosPorMarca(brandId: number, tipoVehiculo: string): Observable<Year[]> {
      return this.http.get<Year[]>(`${this.apiUrl}/marcas/${brandId}/anios`, {
        params: { tipo: tipoVehiculo }
      });
    }

    // Obtener anios de una marca y grupo
    getAniosPorMarcaYGrupo(
      brandId: number,
      groupId: number,
      tipoVehiculo: string
    ): Observable<Year[]> {
      return this.http.get<Year[]>(
        `${this.apiUrl}/marcas/${brandId}/grupos/${groupId}/anios`,
        { params: { tipo: tipoVehiculo } }
      );
    }

    // Obtener grupos de una marca específica
    getGruposPorMarca(brandId: number, tipoVehiculo: string): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/marcas/${brandId}/grupos`, {
        params: { tipo: tipoVehiculo }
      });
    }

    // Obtener modelos de una marca y grupo específico
    getModelosPorGrupoYMarca(brandId: number, groupId: number, tipoVehiculo: string): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/marcas/${brandId}/grupos/${groupId}/modelos`, {
        params: { tipo: tipoVehiculo }
      });
    }
}
