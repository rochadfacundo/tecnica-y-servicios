import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Cotizacion } from '../../../../interfaces/cotizacion';
import { AuthService } from '../../../../services/auth.service';
import { Productor } from '../../../../models/productor.model';
import { ETipoVehiculo } from '../../../../enums/tipoVehiculos';

type Maybe<T> = T | null | undefined;

interface ProdCompania {
  compania: string;
  cuotasMoto?: number | string | null;
  cuotasAuto?: number | string | null;
  cantidadCuotas?: string | null;   // Rivadavia
  cuotas?: string | null;            // Mercantil Andina
  refacturaciones?: string | null;   // Federación Patronal
  plan?: string | null;              // ATM
  // ...otros campos que ya tengas
}

@Component({
  selector: 'app-tabla-cotizadora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-cotizadora.component.html',
  styleUrl: './tabla-cotizadora.component.css'
})
export class TablaCotizadoraComponent implements OnInit {
  cotizaciones!: Cotizacion;
  tipoVehiculo!: ETipoVehiculo;
  user!: Productor | null;

  /**
   * Cache: nombre canonizado de compañía -> cantidad de cuotas (null/undefined = mensual/no mostrar)
   */
  private cuotasPorCompania = new Map<string, number | null>();

  constructor(
    @Inject(Router) private router: Router,
    @Inject(AuthService) private s_auth: AuthService,
    @Inject(ToastrService) private s_toast: ToastrService
  ) {}

  // ===== helpers =====

  private norm(s: Maybe<string>): string {
    return (s ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toUpperCase()
      .trim();
  }

  private canonCompania(nombre: Maybe<string>): string {
    const n = this.norm(nombre);
    if (n.includes('RUS') || n.includes('RIO URUGUAY')) return 'RIO URUGUAY';
    if (n.includes('FEDERACION')) return 'FEDERACION PATRONAL';
    if (n.includes('MERCANTIL')) return 'MERCANTIL ANDINA';
    if (n.includes('RIVADAVIA')) return 'RIVADAVIA';
    if (n.includes('ATM')) return 'ATM';
    if (n.includes('DIGNA')) return 'DIGNA';
    return n || '';
  }

  get esMoto(): boolean {
    return this.tipoVehiculo === ETipoVehiculo.MOTOVEHICULO;
  }

  /**
   * Regla central por compañía: devuelve cantidad de cuotas o null/undefined si es mensual.
   */
  private resolverCuotas(comp: ProdCompania): number | null {
    const nombre = this.canonCompania(comp.compania);

    // RIO URUGUAY (RUS): usa cuotasMoto/cuotasAuto (number). 12 => mensual (ocultar).
    if (nombre === 'RIO URUGUAY') {
      const raw = this.esMoto ? comp.cuotasMoto : comp.cuotasAuto;
      const n = Number(raw);
      if (!isFinite(n) || n <= 0 || n === 12) return null;
      return n;
    }

    // RIVADAVIA: cantidadCuotas (string). "12" => mensual.
    if (nombre === 'RIVADAVIA') {
      const n = Number(comp.cantidadCuotas);
      if (!isFinite(n) || n <= 0 || n === 12) return null;
      return n;
    }

    // MERCANTIL ANDINA: cuotas (string). "12" => mensual.
    if (nombre === 'MERCANTIL ANDINA') {
      const n = Number(comp.cuotas);
      if (!isFinite(n) || n <= 0 || n === 12) return null;
      return n;
    }

    // FEDERACION PATRONAL: refacturaciones (string)
    // "12" => mensual (ocultar)
    // "2" => semestral => mostrar 6
    // otro r => si 12/r es entero, mostrar ese valor
    if (nombre === 'FEDERACION PATRONAL') {
      const r = Number(comp.refacturaciones);
      if (!isFinite(r) || r <= 0) return null;
      if (r === 12) return null; // mensual
      if (r === 2) return 6;     // semestral
      const guess = 12 / r;
      return Number.isInteger(guess) ? guess : null;
    }

    // ATM: por plan
    // 02 / 11 => mensual => ocultar
    // 04 / 03 => bimestral => 2
    // 01 => trimestral => 3
    if (nombre === 'ATM') {
      const plan = this.norm(comp.plan);
      if (plan === '02' || plan === '11') return null; // mensual
      if (plan === '04' || plan === '03') return 2;    // bimestral
      if (plan === '01') return 3;                     // trimestral
      return null;
    }

    // DIGNA / otros sin dato => no mostrar
    return null;
  }

  private construirMapaCuotas(): void {
    this.cuotasPorCompania.clear();
    // en tu modelo, las compañías del productor suelen venir en this.user.companias
    const listado = (this.user as any)?.companias as ProdCompania[] | undefined;
    if (!Array.isArray(listado)) return;

    for (const comp of listado) {
      const key = this.canonCompania(comp.compania);
      if (!key) continue;
      this.cuotasPorCompania.set(key, this.resolverCuotas(comp));
    }
  }

  /**
   * Se usa desde la vista: retorna las cuotas para la compañía de la fila
   */
  getCuotasDe(companiaDeTabla: string): number | null {
    const key = this.canonCompania(companiaDeTabla);
    return this.cuotasPorCompania.get(key) ?? null;
  }

  /**
   * Devuelve true si corresponde mostrar la leyenda "Cuotas: q" para ese importe.
   * Requisitos:
   *  - q = getCuotasDe(compania) > 1 (si es 1 o mensual, no mostrar)
   *  - importe numérico > 0 (si no hay valor en la celda, no mostrar)
   */
  tieneCuotas(compania: string, importe: any): boolean {
    const q = this.getCuotasDe(compania);
    const val = Number(importe);
    return !!q && q > 1 && isFinite(val) && val > 0;
  }

  // ===== acciones =====

  async guardarCotizaciones() {
    if (!this.user || !this.cotizaciones) return;

    const yaExiste = this.user.cotizaciones?.some(
      c => c.nroCotizacion === this.cotizaciones.nroCotizacion
    );

    if (!yaExiste) {
      this.user.cotizaciones = this.user.cotizaciones || [];
      this.user.cotizaciones.push(this.cotizaciones);

      try {
        await this.s_auth.updateUser(this.user);
        this.s_toast.success('Cotizacion guardada exitosamente', 'Cotizacion guardada');
        console.log('✅ Cotización guardada');
      } catch (error) {
        this.s_toast.error('Error al guardar la cotizacion', 'No se guardo la cotizacion');
        console.error('❌ Error al guardar cotización:', error);
      }
    } else {
      console.log('⚠️ La cotización ya fue guardada');
    }
  }

    /**
   * Calcula el valor de cada cuota si corresponde.
   * - Solo si q > 1 y el importe > 0.
   * - Devuelve null si no aplica.
   */
    calcularImportePorCuota(compania: string, importe: any): number | null {
      const q = this.getCuotasDe(compania);
      const val = Number(importe);
      if (!q || q <= 1 || !isFinite(val) || val <= 0) return null;
      return val / q;
    }


  // ===== lifecycle =====

  async ngOnInit(): Promise<void> {
    this.user = await this.s_auth.obtenerProductorLogueado();
    if (!this.user) return;

    const state = history.state as { cotizaciones?: Cotizacion; tipoVehiculo?: ETipoVehiculo };

    if (state?.cotizaciones && state?.tipoVehiculo) {
      this.cotizaciones = state.cotizaciones;
      this.tipoVehiculo = state.tipoVehiculo;

      // construimos el cache de cuotas según productor + tipo vehículo
      this.construirMapaCuotas();
    } else {
      console.warn('⚠️ No se encontraron cotizaciones en el estado');
      this.router.navigate(['/dashboard']);
    }
  }
}
