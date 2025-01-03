import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
//import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
//import { auth } from '../../../firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {



  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Escucha los cambios en el estado de autenticación
    /*
    onAuthStateChanged(auth, (user) => {
      this.isAuthenticatedSubject.next(!!user); // Actualiza el estado
    });*/




  }


    // Para el estado de autenticación, usa un setter que actualice el estado
    setAuthenticated(status: boolean) {
      this.isAuthenticatedSubject.next(status);
    }

  get isAuthenticated() {
    return this.isAuthenticatedSubject.value;
  }

  async login(email: string, password: string) {/*
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('entramo y logueamo');
      this.setAuthenticated(true); // Al iniciar sesión, se actualiza el estado de autenticación
      return userCredential.user;
    } catch (error) {
      this.setAuthenticated(false); // Si ocurre un error, se marca como no autenticado
      console.error('Error al iniciar sesión', error);
      throw error;
    }*/
  }

  async register(email:string,password:string)
  {
    /*
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
  } catch (error) {
      console.error("Error al registrar usuario:", error);
      throw error;
  }*/
  }

  async logout() {/*
    // Lógica para cerrar sesión (si estás usando Firebase Authentication)
    await auth.signOut();
    this.setAuthenticated(false); // Se actualiza el estado a no autenticado*/
  }



  async getState()
  {
   return this.isAuthenticated$;


/*
    return await onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        console.log(uid);
        // ...
      } else {
        // User is signed out
        // ...
      }
    });*/

}


}
