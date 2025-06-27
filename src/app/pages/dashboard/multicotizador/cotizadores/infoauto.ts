import { Observable } from "rxjs";
import { InfoautoService } from "../../../../services/infoauto.service";
import { Brand } from "../../../../classes/infoauto";
import { Year } from "../../../../interfaces/year";

export function getMarcas(s_infoauto: InfoautoService, tipoVehiculo: string): Observable<Brand[]> {
  return s_infoauto.getMarcas(tipoVehiculo);
}

export function getAnios(s_infoauto: InfoautoService, brandId: number, tipoVehiculo: string): Observable<Year[]> {
  return s_infoauto.getAniosPorMarca(brandId, tipoVehiculo);
}

export function getAniosPorGrupo(
  s_infoauto: InfoautoService,
  brandId: number,
  groupId: number,
  tipoVehiculo: string
): Observable<Year[]> {
  return s_infoauto.getAniosPorMarcaYGrupo(brandId, groupId, tipoVehiculo);
}

export function getGrupos(s_infoauto: InfoautoService, brandId: number, tipoVehiculo: string): Observable<any> {
  return s_infoauto.getGruposPorMarca(brandId, tipoVehiculo);
}

export function getModelos(s_infoauto: InfoautoService, brandId: number, groupId: number, tipoVehiculo: string): Observable<any> {
  return s_infoauto.getModelosPorGrupoYMarca(brandId, groupId, tipoVehiculo);
}
