import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ESpinner } from '../enums/ESpinner';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private estados: Record<ESpinner, BehaviorSubject<boolean>> = {
    Vaiven: new BehaviorSubject(false),
    Rebote: new BehaviorSubject(false)
  };

  private mensajes: Record<ESpinner, BehaviorSubject<string | null>> = {
    Vaiven: new BehaviorSubject<string | null>(null),
    Rebote: new BehaviorSubject<string | null>(null)
  };

  vaiven$ = this.estados['Vaiven'].asObservable();
  rebote$ = this.estados['Rebote'].asObservable();

  mensajeVaiven$ = this.mensajes['Vaiven'].asObservable();
  mensajeRebote$ = this.mensajes['Rebote'].asObservable();

  private timeoutMs = 15000;

  /**
   * Ejecuta una promesa mostrando el spinner mientras dura
   * @param promise Promesa a ejecutar
   * @param type Tipo de spinner
   * @param mensaje Texto a mostrar mientras se ejecuta
   */
  async runWithSpinner<T>(
    promise: Promise<T>,
    type: ESpinner,
    mensaje?: string
  ): Promise<T | undefined> {
    this.show(type, mensaje);

    let result;
    const minDurationMs = 500; // mínimo visible
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Timeout de seguridad alcanzado')),
        this.timeoutMs
      )
    );
    const minDuration = new Promise(resolve =>
      setTimeout(resolve, minDurationMs)
    );

    try {
      result = await Promise.race([
        (async () => {
          const res = await promise;
          await minDuration;
          return res;
        })(),
        timeout
      ]);
    } catch (e: any) {
      console.error(e);
    } finally {
      this.hide(type);
    }

    return result;
  }

  show(tipo?: ESpinner, mensaje?: string) {
    if (tipo) {
      this.estados[tipo].next(true);
      if (mensaje) {
        this.mensajes[tipo].next(mensaje);
      }
    } else {
      this.loadingSubject.next(true);
    }
  }

  hide(tipo?: ESpinner) {
    if (tipo) {
      this.estados[tipo].next(false);
      this.mensajes[tipo].next(null); // limpiar mensaje al cerrar
    } else {
      this.loadingSubject.next(false);
    }
  }
}
