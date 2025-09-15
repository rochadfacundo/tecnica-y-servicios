import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Cotizacion, CotizacionATM } from '../../../../interfaces/cotizacion';
import { AuthService } from '../../../../services/auth.service';
import { Productor } from '../../../../models/productor.model';
import { ETipoVehiculo } from '../../../../enums/tipoVehiculos';
import { ToolTipDirective } from '../../../../directives/tool-tip.directive';
import { buildTooltipATM } from '../cotizadores/atm';
import { ECobertura } from '../../../../enums/Ecobertura';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type Maybe<T> = T | null | undefined;

interface ProdCompania {
  compania: string;
  cuotasMoto?: number | string | null;
  cuotasAuto?: number | string | null;
  cantidadCuotas?: string | null;   // Rivadavia
  cuotas?: string | null;           // Mercantil Andina
  refacturaciones?: string | null;  // Federación Patronal
  plan?: string | null;             // ATM
}

@Component({
  selector: 'app-tabla-cotizadora',
  standalone: true,
  imports: [CommonModule, ToolTipDirective],
  templateUrl: './tabla-cotizadora.component.html',
  styleUrl: './tabla-cotizadora.component.css'
})
export class TablaCotizadoraComponent implements OnInit {
  @ViewChild('tablaCotizaciones') tablaCotizaciones!: ElementRef;

  cotizaciones!: Cotizacion;
  tipoVehiculo!: ETipoVehiculo;
  user!: Productor | null;
  coberturasATM: CotizacionATM[] = [];
  buildTooltipATM = buildTooltipATM;
  coberturasSeleccionadas: ECobertura[] = [];

  private cuotasPorCompania = new Map<string, number | null>();

  constructor(
    @Inject(Router) private router: Router,
    @Inject(AuthService) private s_auth: AuthService,
    @Inject(ToastrService) private s_toast: ToastrService
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = await this.s_auth.obtenerProductorLogueado();
    if (!this.user) return;

    const state = history.state as {
      cotizaciones?: Cotizacion;
      tipoVehiculo?: ETipoVehiculo;
      coberturasATM?: CotizacionATM[];
      coberturasSeleccionadas?: ECobertura[];
    };

    if (state?.cotizaciones && state?.tipoVehiculo) {
      this.cotizaciones = state.cotizaciones;
      this.tipoVehiculo = state.tipoVehiculo;
      this.coberturasATM = Array.isArray(state.coberturasATM) ? state.coberturasATM : [];
      this.coberturasSeleccionadas = state.coberturasSeleccionadas ?? [];
      this.construirMapaCuotas();
    } else {
      console.warn('⚠️ No se encontraron cotizaciones en el estado');
      this.router.navigate(['/dashboard']);
    }
  }

  // ====== FILTROS con ENUM ======
  mostrarRC(): boolean {
    return this.coberturasSeleccionadas.includes(ECobertura.RC);
  }

  mostrarRobo(): boolean {
    return this.coberturasSeleccionadas.includes(ECobertura.ROBO);
  }

  mostrarTerceros(): boolean {
    return this.coberturasSeleccionadas.includes(ECobertura.TERCEROS);
  }

  mostrarTodoRiesgo(): boolean {
    return this.coberturasSeleccionadas.includes(ECobertura.TODO_RIESGO);
  }


  companiasConDatos(): any[] {
    if (!this.cotizaciones?.companiasCotizadas) return [];
    return this.cotizaciones.companiasCotizadas.filter(cot => {
      const importes = [
        cot.rc, cot.b1, cot.b2, cot.c, cot.c1, cot.c2, cot.c3,
        cot.d1, cot.d2, cot.d3, cot.d4
      ];
      return importes.some(val => val != null && Number(val) > 0);
    });
  }


  private norm(s: Maybe<string>): string {
    return (s ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toUpperCase()
      .trim();
  }

  public canonCompania(nombre: Maybe<string>): string {
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

  private resolverCuotas(comp: ProdCompania): number | null {
    const nombre = this.canonCompania(comp.compania);

    if (nombre === 'RIO URUGUAY') {
      const raw = this.esMoto ? comp.cuotasMoto : comp.cuotasAuto;
      const n = Number(raw);
      if (!isFinite(n) || n <= 0 || n === 12) return null;
      return n;
    }
    if (nombre === 'RIVADAVIA') {
      const n = Number(comp.cantidadCuotas);
      if (!isFinite(n) || n <= 0 || n === 12) return null;
      return n;
    }
    if (nombre === 'MERCANTIL ANDINA') {
      const n = Number(comp.cuotas);
      if (!isFinite(n) || n <= 0 || n === 12) return null;
      return n;
    }
    if (nombre === 'FEDERACION PATRONAL') {
      const r = Number(comp.refacturaciones);
      if (!isFinite(r) || r <= 0) return null;
      if (r === 12) return null;
      if (r === 2) return 6;
      const guess = 12 / r;
      return Number.isInteger(guess) ? guess : null;
    }
    if (nombre === 'ATM') {
      const plan = this.norm(comp.plan);
      if (plan === '02' || plan === '11') return null;
      if (plan === '04' || plan === '03') return 2;
      if (plan === '01') return 3;
      return null;
    }
    return null;
  }

  private construirMapaCuotas(): void {
    this.cuotasPorCompania.clear();
    const listado = (this.user as any)?.companias as ProdCompania[] | undefined;
    if (!Array.isArray(listado)) return;

    for (const comp of listado) {
      const key = this.canonCompania(comp.compania);
      if (!key) continue;
      this.cuotasPorCompania.set(key, this.resolverCuotas(comp));
    }
  }

  getCuotasDe(companiaDeTabla: string): number | null {
    const key = this.canonCompania(companiaDeTabla);
    return this.cuotasPorCompania.get(key) ?? null;
  }

  tieneCuotas(compania: string, importe: any): boolean {
    const q = this.getCuotasDe(compania);
    const val = Number(importe);
    return !!q && q > 1 && isFinite(val) && val > 0;
  }

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

  calcularImportePorCuota(compania: string, importe: any): number | null {
    const q = this.getCuotasDe(compania);
    const val = Number(importe);
    if (!q || q <= 1 || !isFinite(val) || val <= 0) return null;
    return val / q;
  }

  getDescPorRol(cot: any, rol: 'rc'|'b1'|'b2'|'c'|'c1'|'c2'|'c3'|'d1'|'d2'|'d3'|'d4'): string | null {
    const tip = cot?.rol2tooltip?.[rol];
    if (typeof tip === 'string' && tip.trim()) return tip.trim();

    const code: string | undefined = cot?.rol2codigo?.[rol];
    if (!code) return null;

    const raw = cot?.detallesPorCodigo?.[code]?.descripcion ?? '';
    const toSentence = (s?: string) => {
      const t = (s ?? '').trim().toLowerCase();
      return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
    };
    const human = toSentence(raw || code);
    return `${code}: ${human}`.trim();
  }

  getDescRC(cot: any): string | null { return this.getDescPorRol(cot, 'rc'); }
  getDescB1(cot: any): string | null { return this.getDescPorRol(cot, 'b1'); }
  getDescB2(cot: any): string | null { return this.getDescPorRol(cot, 'b2'); }
  getDescC(cot: any): string | null { return this.getDescPorRol(cot, 'c'); }
  getDescC1(cot: any): string | null { return this.getDescPorRol(cot, 'c1'); }
  getDescC2(cot: any): string | null { return this.getDescPorRol(cot, 'c2'); }
  getDescC3(cot: any): string | null { return this.getDescPorRol(cot, 'c3'); }
  getDescD1(cot: any): string | null { return this.getDescPorRol(cot, 'd1'); }
  getDescD2(cot: any): string | null { return this.getDescPorRol(cot, 'd2'); }
  getDescD3(cot: any): string | null { return this.getDescPorRol(cot, 'd3'); }
  getDescD4(cot: any): string | null { return this.getDescPorRol(cot, 'd4'); }

  getCoberturaATM(codigos: string[]): CotizacionATM | undefined {
    if (!this.coberturasATM?.length) return undefined;
    for (const code of codigos) {
      const hit = this.coberturasATM.find(c => String(c.codigo).toUpperCase() === code.toUpperCase());
      if (hit) return hit;
    }
    return undefined;
  }

  tooltipATM(codigos: string[]): string {
    const c = this.getCoberturaATM(codigos);
    if (!c) return 'Sin detalle';
    const t = this.buildTooltipATM(c);
    return `${t.title}\n${t.lines.join('\n')}`;
  }




  async descargarPDF() {
    if (!this.tablaCotizaciones) {
      this.s_toast.error('No se encontró la tabla', 'Error al exportar');
      return;
    }

    const tabla = this.tablaCotizaciones.nativeElement as HTMLElement;

    const canvas = await html2canvas(tabla, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const nro = this.cotizaciones?.nroCotizacion ?? 'SIN_NUMERO';
    const apellido = this.user?.apellido ?? 'APELLIDO';
    const nombre = this.user?.nombre ?? 'NOMBRE';
    const fecha = new Date().toLocaleDateString('es-AR');

    // Encabezado centrado
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const titulo = `Cotización Nº ${nro}`;
    const textWidth = pdf.getTextWidth(titulo);
    pdf.text(titulo, (pageWidth - textWidth) / 2, 20);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Productor: ${apellido}, ${nombre}`, 14, 30);
    pdf.text(`Fecha: ${fecha}`, pageWidth - 60, 30);

    pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);

    const nombreArchivo = `Cotizacion_${nro}_${apellido}_${nombre}.pdf`
      .replace(/\s+/g, '_');
    pdf.save(nombreArchivo);
  }

}
