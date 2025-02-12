import { inject } from '@angular/core';
import { CanDeactivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';
import { CanActivateFn } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthService);
  const router = inject(Router);

  return authState.authState$.pipe(
    map(state=>{
      console.log(state);
      if(!state)
        {
          //router.navigateByUrl('dashboard');
          return false;
        }

        return true;

    }

    )
  )
};

export const NoAuthGuard:  CanActivateFn = (route, state) => {

  const authState = inject(AuthService);
  const router = inject(Router);

  return authState.authState$.pipe(
    map(state=>{
      console.log(state);
      if(!state)
        {
          return true;
        }

      router.navigateByUrl('dashboard');
      return false;

    }

    )
  )
};
