import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private estados: Record<string, BehaviorSubject<boolean>> = {
    vaiven: new BehaviorSubject(false),
    rebote: new BehaviorSubject(false)
  };

  vaiven$ = this.estados['vaiven'].asObservable();
  rebote$ = this.estados['rebote'].asObservable();

  private timeoutMs = 15000;

  async runWithSpinner<T>(promise: Promise<T>): Promise<T> {
    this.show();

    const minDurationMs = 1000;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de seguridad alcanzado')), this.timeoutMs)
    );
    const minDuration = new Promise(resolve =>
      setTimeout(resolve, minDurationMs)
    );

    try {
      const result = await Promise.race([promise, timeout]);
      await minDuration;
      return result;
    } finally {
      this.hide();
    }
  }

  show(tipo?: 'vaiven' | 'rebote') {
    if (tipo) {
      this.estados[tipo].next(true);
    } else {
      this.loadingSubject.next(true);
    }
  }

  hide(tipo?: 'vaiven' | 'rebote') {
    if (tipo) {
      this.estados[tipo].next(false);
    } else {
      this.loadingSubject.next(false);
    }
  }
}
