import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc } from 'firebase/firestore'; // Importa las funciones necesarias de Firebase
import { getFirestore } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoautoService {

  private apiUrl = 'https://api-5cekuonbbq-uc.a.run.app/infoauto';

  constructor(private http: HttpClient) {
  }

    // Método para obtener el token de INFOAUTO
    getToken(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/token`);
    }

    // Obtener marcas de Infoauto
    getMarcas(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/marcas`);
    }

    // Obtener grupos de una marca específica
    getGruposPorMarca(brandId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/marcas/${brandId}/grupos`);
    }


    // Obtener modelos de una marca y grupo específico
    getModelosPorGrupoYMarca(brandId: number,groupId:number): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/marcas/${brandId}/grupos/${groupId}/modelos`);
      }

    // Obtener modelos de Infoauto
    getModelos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/modelos`);
    }



}
