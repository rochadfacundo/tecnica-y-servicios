import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth,authState,createUserWithEmailAndPassword,getAuth,signInWithEmailAndPassword} from '@angular/fire/auth';
//import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
//import { auth } from '../../../firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _auth=inject(Auth);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();


  get authState$():Observable<any>
  {
    return authState(this._auth);
  }

    // Para el estado de autenticación, usa un setter que actualice el estado
    setAuthenticated(status: boolean) {
      this.isAuthenticatedSubject.next(status);
    }

  get isAuthenticated() {
    return this.isAuthenticatedSubject.value;
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this._auth, email, password);
      console.log('entramo y logueamo');

      return userCredential.user;
    } catch (error) {

      console.error('Error al iniciar sesión', error);
      throw error;
    }
  }

  async register(email:string,password:string)
  {

    try {
      const userCredential = await createUserWithEmailAndPassword(this._auth, email, password);
      return userCredential.user;
  } catch (error) {
      console.error("Error al registrar usuario:", error);
      throw error;
  }
  }

  async logout() {
    await this._auth.signOut();
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
