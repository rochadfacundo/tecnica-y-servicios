import { inject } from '@angular/core';
import { CanDeactivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';
import { CanActivateFn } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Usamos inject() para obtener el servicio
  const router = inject(Router);
/*
  authService.isAuthenticated$.pipe(
    map(state=>{
      console.log(state);
      if(!state){
        router.navigateByUrl('home');
        return false;
      }else{
        return true;
      }
    })
  )*/
  return true;
};

export const NoAuthGuard:  CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
/*
  authService.isAuthenticated$.pipe(

    map(state=>{
      console.log(state);
      if(state){
        router.navigateByUrl('dashboard');
        return false;
      }else{
        return true;
      }
    })
  )*/

  return true;
};
