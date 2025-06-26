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

  vaiven$ = this.estados['Vaiven'].asObservable();
  rebote$ = this.estados['Rebote'].asObservable();

  private timeoutMs = 15000;

  async runWithSpinner<T>(promise: Promise<T>,type:ESpinner): Promise<T|undefined> {

    this.show(type);
    let result;
    const minDurationMs = 4000;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de seguridad alcanzado')), this.timeoutMs)
    );
    const minDuration = new Promise(resolve =>
      setTimeout(resolve, minDurationMs)
    );

    try {
      result = await Promise.race([promise, timeout]);
      await minDuration;

    }catch(e:any){
      console.log(e);
    } finally {
      this.hide(type);
    }

    return result;
  }

  show(tipo?:ESpinner) {
    if (tipo) {
      this.estados[tipo].next(true);
    } else {
      this.loadingSubject.next(true);
    }
  }

  hide(tipo?:ESpinner) {
    if (tipo) {
      this.estados[tipo].next(false);
    } else {
      this.loadingSubject.next(false);
    }
  }
}
