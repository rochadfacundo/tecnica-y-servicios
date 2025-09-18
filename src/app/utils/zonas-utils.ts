import { ZonasService } from '../services/zonas.service';
import { Provincia } from '../interfaces/provincia';
import { Zona } from '../interfaces/zonas';   // tu interface raíz
import { Observable, of, map } from 'rxjs';

export class ZonasUtils {
  constructor(private zonasService: ZonasService) {}

  getBarriosIfCABA(provincia: Provincia | null): Observable<string[]> {
    if (provincia?.descripcion === 'Capital Federal') {
      return this.zonasService.getBarriosCABA();
    }
    return of([]);
  }

  getZonasIfBuenosAires(provincia: Provincia | null): Observable<string[]> {
    if (provincia?.descripcion === 'Buenos Aires') {
      // 👇 claves tipadas correctamente
      const zonasKeys: (keyof Zona)[] = ['Zona Norte', 'Zona Sur', 'Zona Oeste'];

      return this.zonasService.getZonas().pipe(
        map(z => {
          const zonasAMBA: string[] = [];
          zonasKeys.forEach((zKey: keyof Zona) => {
            zonasAMBA.push(...Object.keys(z[zKey]));
          });
          return zonasAMBA;
        })
      );
    }
    return of([]);
  }

  getLocalidadesByZona(zona: string): Observable<string[]> {
    const zonasKeys: (keyof Zona)[] = ['Zona Norte', 'Zona Sur', 'Zona Oeste'];

    return this.zonasService.getZonas().pipe(
      map(z => {
        for (const zKey of zonasKeys) {
          const detalle = z[zKey];
          if (detalle[zona]) {
            return detalle[zona];
          }
        }
        return [];
      })
    );
  }

}
