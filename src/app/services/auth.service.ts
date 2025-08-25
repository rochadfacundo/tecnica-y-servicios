import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Productor } from '../models/productor.model';
import { updatePassword,getIdToken } from "@angular/fire/auth";
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://api-5cekuonbbq-uc.a.run.app/users';
  //private apiUrl = environment.URL_DEV+'/users';
  private http = inject(HttpClient);
  private s_toast = inject(ToastrService);

  private _auth = inject(Auth);
  private firestore = inject(Firestore);

    private productorSubject = new BehaviorSubject<Productor | null>(null);
    productor$ = this.productorSubject.asObservable();

  public productorActual: Productor | null = null;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Escuchamos el estado real de Firebase y sincronizamos
    authState(this._auth).subscribe(user => {
      this.isAuthenticatedSubject.next(!!user);
    });

  }

  async getToken(): Promise<string | null> {
    const user = this._auth.currentUser;

    if (!user) {
      console.warn('⚠️ No hay usuario logueado para obtener el token');
      return null;
    }

    try {
      const token = await getIdToken(user);
      return token;
    } catch (error) {
      console.error('❌ Error al obtener token:', error);
      return null;
    }
  }

  async obtenerProductorLogueado(): Promise<Productor | null> {
    const user = this._auth.currentUser;

    if (!user) {
      console.warn('⚠️ No hay usuario logueado');
      return null;
    }

    const docRef = doc(this.firestore, 'usuarios', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Productor;
      this.productorActual = { ...data, uid: user.uid };
      this.productorSubject.next(this.productorActual);
      return this.productorActual;
    } else {
      console.error('❌ No se encontró el documento del usuario');
      return null;
    }
  }

actualizarProductorLocal(productor: Productor) {
  this.productorActual = productor;
  this.productorSubject.next(productor);
}




  get authState$(): Observable<any> {
    return authState(this._auth); // lo siguen usando tus guards
  }

  get isAuthenticated() {
    return this.isAuthenticatedSubject.value;
  }

  setAuthenticated(status: boolean) {
    this.isAuthenticatedSubject.next(status); // lo podés usar si querés setear manual
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this._auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('❌ Error al iniciar sesión', error);
      throw error;
    }
  }

  async register(productor: Productor) {
    const token = await this.getToken();
    if (!token) throw new Error('No se pudo obtener el token');

    return firstValueFrom(
      this.http.post(this.apiUrl, productor, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    );
  }



  updatePassword(uid: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/reset-password`, { uid, newPassword });
  }

  async updateUser(productor: Productor) {
    try {
      const token = await this.getToken();
      const response = await fetch(`${this.apiUrl}/${productor.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: productor.nombre,
          apellido: productor.apellido,
          email: productor.email,
          role: productor.role,
          path: productor.path,
          companias: productor.companias ?? [],
          cotizaciones: productor.cotizaciones ?? [],

        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error al actualizar usuario:', errorText);
        throw new Error('Error al actualizar usuario en Firestore');
      }

      console.log('✅ Usuario actualizado correctamente');
      return await response.json();
    } catch (error) {
      console.error('❌ Error en actualización completa:', error);
      throw error;
    }
  }



  async getAllUsers(): Promise<Productor[]> {
    const response = await fetch(this.apiUrl);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return await response.json();
  }

  async getUserById(uid: string): Promise<Productor> {
    const response = await fetch(`${this.apiUrl}/${uid}`);
    if (!response.ok) throw new Error('Error al obtener el usuario');
    return await response.json();
  }
  async deleteUser(uid: string): Promise<void> {
    const token = await this.getToken();
    if (!token) throw new Error('No se pudo obtener el token');

    const response = await fetch(`${this.apiUrl}/${uid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error eliminando usuario:', errorText);
      this.s_toast.error('Error al eliminar el usuario','Error al eliminar');
    }
    this.s_toast.success('✅ Usuario eliminado correctamente',"Usuario eliminado");
    console.log('✅ Usuario eliminado correctamente');
  }



 async logout() {

  this.productorSubject.next(null);
  await this._auth.signOut();
}


  async getState() {
    return this.isAuthenticated$;
  }
}
