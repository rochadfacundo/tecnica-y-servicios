import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Productor } from '../interfaces/productor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://api-5cekuonbbq-uc.a.run.app/users';


  private _auth = inject(Auth);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Escuchamos el estado real de Firebase y sincronizamos
    authState(this._auth).subscribe(user => {
      this.isAuthenticatedSubject.next(!!user);
    });
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
      console.log('✅ Usuario logueado');
      return userCredential.user;
    } catch (error) {
      console.error('❌ Error al iniciar sesión', error);
      throw error;
    }
  }

  async register(productor: Productor) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productor),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error al guardar usuario en Firestore:', errorText);
        throw new Error('Error al guardar usuario en Firestore');
      }

      console.log('✅ Usuario registrado correctamente en Firestore');
    } catch (error) {
      console.error('❌ Error en registro completo:', error);
      throw error;
    }
  }


  async updateUser(productor: Productor) {
    try {
      const response = await fetch(`${this.apiUrl}/${productor.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: productor.nombre,
          apellido: productor.apellido,
          email: productor.email,
          role: productor.role,
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
    const response = await fetch(`${this.apiUrl}/${uid}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error eliminando usuario:', errorText);
      throw new Error('Error al eliminar usuario');
    }

    console.log('✅ Usuario eliminado correctamente');
  }


  async logout() {
    await this._auth.signOut();

  }

  async getState() {
    return this.isAuthenticated$;
  }
}
