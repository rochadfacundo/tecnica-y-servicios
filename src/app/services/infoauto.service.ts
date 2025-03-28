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
  private firestore: Firestore;
  private prueba:string="";

  constructor(private http: HttpClient) {

    this.firestore = getFirestore();

  }

  // Método para obtener el token de INFOAUTO
  getToken(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/token`);
  }

   // Obtener marcas de Infoauto
   obtenerMarcas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/marcas`);
  }

}
