import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Zona } from '../interfaces/zonas';

@Injectable({
  providedIn: 'root'
})
export class ZonasService {
  private zonasUrl = 'assets/zonas.json';

  constructor(private http: HttpClient) {}

  /** Obtener todo el JSON */
  getZonas(): Observable<Zona> {
    return this.http.get<Zona>(this.zonasUrl);
  }

  /** Barrios de CABA */
  getBarriosCABA(): Observable<string[]> {
    return this.getZonas().pipe(
      map(z => z['Capital Federal'].Barrios)
    );
  }

  /** Partidos dentro de una zona (Norte, Sur, Oeste, Fuera de AMBA) */
  getPartidosByZona(zona: keyof Omit<Zona, 'Capital Federal'>): Observable<string[]> {
    return this.getZonas().pipe(
      map(z => Object.keys(z[zona]))
    );
  }

  /** Localidades dentro de un partido */
  getLocalidades(zona: keyof Omit<Zona, 'Capital Federal'>, partido: string): Observable<string[]> {
    return this.getZonas().pipe(
      map(z => z[zona][partido] || [])
    );
  }
}
