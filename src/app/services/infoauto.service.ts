import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc } from 'firebase/firestore'; // Importa las funciones necesarias de Firebase
import { getFirestore } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoautoService {

  private apiUrl = 'https://api-5cekuonbbq-uc.a.run.app/infoauto/token';
  private firestore: Firestore;
  private prueba:string="";

  constructor(private http: HttpClient) {
    // Inicializa Firestore
    this.firestore = getFirestore();

  }

  // Método para obtener el token de INFOAUTO
  getToken(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

// Método para obtener el token desde Firestore
async obtenerTokenDesdeFirestore(): Promise<any> {
  const userId = 'unicoIdDelUsuario'; // El mismo ID de usuario que usaste al guardar el token
  const tokenDocRef = doc(this.firestore, 'Tokens_Infoauto', userId);
  const docSnap = await getDoc(tokenDocRef);

  if (docSnap.exists()) {
    return docSnap.data(); // Devuelve los datos del token
  } else {
    console.log('No se encontró el token en Firestore');
    return null;
  }
}


 // Método para guardar el token en Firestore
 async guardarTokenEnFirestore(token: string): Promise<void> {
  const userId = this.getRandomInt(1000000);
  this.prueba=userId;
  const tokenDocRef = doc(this.firestore, 'Tokens_Infoauto', userId);
  await setDoc(tokenDocRef, {
    access_token: token,
    timestamp: new Date() // Guardamos el momento en que se guardó el token
  });
}

getRandomInt(num:number) {
  let randomNum= Math.floor(Math.random() * num);
  return String(randomNum);
}
}
