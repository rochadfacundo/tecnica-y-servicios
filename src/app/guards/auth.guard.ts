import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { first, map, tap } from 'rxjs';
import { CanActivateFn } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthService);
  const router = inject(Router);

  return authState.authState$.pipe(
    first(), // En lugar de take(1), maneja mejor si no hay emisiones
    tap(state => {
      if (!state) {
        router.navigateByUrl('/home');
      }
    }),
    map(state => !!state)
  );
};

export const NoAuthGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthService);
  const router = inject(Router);

  return authState.authState$.pipe(
    first(),
    tap(state => {
      if (state) {
        router.navigateByUrl('/dashboard');
      }
    }),
    map(state => !state)
  );
};
