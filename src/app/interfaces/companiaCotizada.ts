/** Roles fijos que usa la tabla (no cambian por compañía) */
export type RolCobertura = 'rc' | 'c' | 'c1' | 'd1' | 'd2' | 'd3';

/** Conjunto ampliado de claves posibles (guardar más variantes) */
export type CoberturaKey =
  | 'rc' | 'c' | 'c1' | 'cf'
  | 'd1' | 'd2' | 'd3'
  | 'b'  | 'b1'
  | 'e'  | 'e1'
  | 'lb' | 'lb1'
  | 'td' | 'td1' | 'td3';

/** Detalle de una cobertura tal como viene de la compañía */
export interface CoberturaDet {
  /** Código propio de la compañía: ej. 'A4', 'C', 'TD3' */
  codigo: string;
  /** Descripción textual que vamos a mostrar en el tooltip */
  descripcion?: string;
  /** Premio total (lo que mostrás como importe en la celda) */
  premio?: number;
  /** Importe de la cuota (si aplica) */
  cuota?: number;
}

/**
 * Modelo de una fila de la tabla para una compañía.
 * Conserva tus campos clásicos (rc/c/c1/d1/d2/d3) y agrega:
 * - detalles:    acceso por claves "genéricas" (CoberturaKey) si te sirve
 * - detallesPorCodigo: acceso por código real de la compañía (A4/C/TD3/…)
 * - rol2codigo:  mapea cada rol de TU tabla al código real de la compañía
 */
export interface CompaniaCotizada {
  compania: string;

  // Mismos campos que ya usabas para dibujar la tabla:
  rc?: number;
  c?: number;
  c1?: number;
  d1?: number;
  d2?: number;
  d3?: number;

  /** (Opcional) Detalles indexados por claves genéricas (si los querés usar) */
  detalles?: Partial<Record<CoberturaKey, CoberturaDet>>;

  /** (Opcional) Detalles indexados por CÓDIGO real de la compañía (recomendado) */
  detallesPorCodigo?: Record<string, CoberturaDet>;

  /**
   * (Opcional) Mapa de rol -> código real de la compañía.
   * Ej Federación: { rc:'A4', c:'C', c1:'C1', d2:'TD3' } si la franquicia mapea a D2
   */
  rol2codigo?: Partial<Record<RolCobertura, string>>;

   /** Tooltip listo por rol (prioridad sobre rol2codigo+detallesPorCodigo) */
   rol2tooltip?: Partial<Record<RolCobertura, string>>;
}
