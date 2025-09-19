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

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { jsPDF } from 'jspdf';
import autoTable, { CellDef } from 'jspdf-autotable';
import { Vehiculo } from '../../../../interfaces/vehiculo';

type Maybe<T> = T | null | undefined;

interface ProdCompania {
  compania: string;
  cuotasMoto?: number | string | null;
  cuotasAuto?: number | string | null;
  cantidadCuotas?: string | null;
  cuotas?: string | null;
  refacturaciones?: string | null;
  plan?: string | null;
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
  vehiculo: Vehiculo | null = null;
  tipoVehiculo!: ETipoVehiculo;
  user!: Productor | null;
  coberturasATM: CotizacionATM[] = [];
  buildTooltipATM = buildTooltipATM;
  coberturasSeleccionadas: ECobertura[] = [];

  private cuotasPorCompania = new Map<string, number | null>();

  constructor(
    @Inject(Router) private router: Router,
    @Inject(AuthService) private s_auth: AuthService,
    @Inject(ToastrService) private s_toast: ToastrService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = await this.s_auth.obtenerProductorLogueado();
    if (!this.user) return;

    const state = history.state as {
      cotizaciones?: Cotizacion;
      tipoVehiculo?: ETipoVehiculo;
      coberturasATM?: CotizacionATM[];
      coberturasSeleccionadas?: ECobertura[];
      vehiculo?: Vehiculo;
    };

    if (state?.cotizaciones && state?.tipoVehiculo) {
      this.cotizaciones = state.cotizaciones;
      this.tipoVehiculo = state.tipoVehiculo;
      this.coberturasATM = Array.isArray(state.coberturasATM) ? state.coberturasATM : [];
      this.coberturasSeleccionadas = state.coberturasSeleccionadas ?? [];
      this.vehiculo = state.vehiculo ?? null;
      this.construirMapaCuotas();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

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
        cot.rc, cot.b1, cot.b2, cot.c, cot.c1, cot.c2, cot.c3,cot.c4,
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
      } catch (error) {
        this.s_toast.error('Error al guardar la cotizacion', 'No se guardo la cotizacion');
      }
    }
  }

  calcularImportePorCuota(compania: string, importe: any): number | null {
    const q = this.getCuotasDe(compania);
    const val = Number(importe);
    if (!q || q <= 1 || !isFinite(val) || val <= 0) return null;
    return val / q;
  }

  getDescPorRol(cot: any, rol: string): string | null {
    const tip = cot?.rol2tooltip?.[rol];

    if (typeof tip === 'string' && /\b(plan|rcl|todo|robo|inc|acc|responsabilidad|riesgo)\b/i.test(tip)) {
      return tip.trim();
    }

    const code: string | undefined = cot?.rol2codigo?.[rol];
    if (!code) return null;

    let raw = cot?.detallesPorCodigo?.[code]?.descripcion ?? '';

    // 🧹 si la descripción arranca con el mismo código, lo saco
    const regex = new RegExp(`^${code}\\b[:\\s-]*`, 'i');
    raw = raw.replace(regex, '').trim();

    const toSentence = (s?: string) => {
      const t = (s ?? '').trim();
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
  getDescC4(cot: any): string | null { return this.getDescPorRol(cot, 'c4'); }

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

  getTextoImporteHTML(compania: string, importe: any, rol: string, cot: any): SafeHtml {

    const q = this.getCuotasDe(compania);
    const val = Number(importe);
    const codigo = cot?.rol2codigo?.[rol] ? ` (${cot.rol2codigo[rol]})` : '';
    if (!!q && q > 1 && isFinite(val) && val > 0) {
      const porCuota = val / q;
      return this.sanitizer.bypassSecurityTrustHtml(
        `<span class="cuotas-label">${q} cuotas de</span> $${porCuota.toLocaleString('es-AR')}${codigo}`
      );
    }
    return this.sanitizer.bypassSecurityTrustHtml(
      val > 0 ? `$${val.toLocaleString('es-AR')}${codigo}` : ''
    );
  }

  getTextoImportePDF(compania: string, importe: any, rol: string, cot: any): string {
    const q = this.getCuotasDe(compania);
    const val = Number(importe);
    const codigo = cot?.rol2codigo?.[rol] ? ` (${cot.rol2codigo[rol]})` : '';
    if (!!q && q > 1 && isFinite(val) && val > 0) {
      const porCuota = val / q;
      return `${q} cuotas de $${porCuota.toLocaleString('es-AR')}${codigo}`;
    }
    return val > 0 ? `$${val.toLocaleString('es-AR')}${codigo}` : '';
  }

  async downloadPDF() {
    if (!this.cotizaciones) {
      this.s_toast.error('No hay cotizaciones cargadas', 'Error al exportar');
      return;
    }

    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const nro = this.cotizaciones?.nroCotizacion ?? 'SIN_NUMERO';
    const apellido = this.user?.apellido ?? 'APELLIDO';
    const nombre = this.user?.nombre ?? 'NOMBRE';
    const fecha = new Date().toLocaleDateString('es-AR');

    // === Encabezado ===
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const titulo = `Cotización Nº ${nro}`;
    const textWidth = pdf.getTextWidth(titulo);
    pdf.text(titulo, (pageWidth - textWidth) / 2, 20);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Productor: ${apellido}, ${nombre}`, 14, 30);
    pdf.text(`Fecha: ${fecha}`, pageWidth - 60, 30);

    // === Cuerpo de la tabla ===
    const body: (string | CellDef)[][] = [];

    // 👉 Fila de suma asegurada
    body.push([
      { content: 'Suma Asegurada', rowSpan: 1, styles: { valign: 'middle', fontStyle: 'bold' } },
      ...this.companiasConDatos().map(c =>
        c.sumaAsegurada ? `$${c.sumaAsegurada.toLocaleString('es-AR')}` : '-'
      )
    ]);

    const getTextoCelda = (
      cot: any,
      rol: 'rc'|'b1'|'b2'|'c1'|'c2'|'c3'|'c4'|'d1'|'d2'|'d3'|'d4',
      compania: string,
      importe: any
    ): string => {
      const importeTxt = this.getTextoImportePDF(compania, importe, rol, cot);
      let desc: string | null = null;

      if (this.canonCompania(compania) === 'ATM') {
        switch (rol) {
          case 'rc':  desc = this.tooltipATM(['A0']); break;
          case 'b1':  desc = this.tooltipATM(['B1']); break;
          case 'b2':  desc = this.tooltipATM(['B0','B2']); break;
          case 'c1':  desc = this.tooltipATM(['C0','C0-BASICA','B2']); break;
          case 'c2':  desc = this.tooltipATM(['C3','C3-MEDIA']); break;
          case 'c3':  desc = this.tooltipATM(['C2','C2-MEDIA']); break;
          case 'c4':  desc = this.tooltipATM(['C4','C4-MEDIA']); break;
          case 'd1':  desc = this.tooltipATM(['D1','D2','C']); break;
          case 'd2':  desc = this.tooltipATM(['D3']); break;
          case 'd3':  desc = this.tooltipATM(['D4']); break;
          case 'd4':  desc = this.tooltipATM(['D5']); break;
        }
      } else {
        desc = this.getDescPorRol(cot, rol);
      }
      return desc ? `${importeTxt}\n${desc}` : importeTxt;
    };

    // === Resto de filas ===
    if (this.mostrarRC()) {
      body.push([
        { content: 'Responsabilidad Civil', rowSpan: 1, styles: { valign: 'middle' } },
        ...this.companiasConDatos().map(c => getTextoCelda(c, 'rc', c.compania, c.rc))
      ]);
    }

    if (this.mostrarRobo()) {
      body.push([
        { content: 'Robo', rowSpan: 2, styles: { valign: 'middle' } },
        ...this.companiasConDatos().map(c => getTextoCelda(c, 'b1', c.compania, c.b1))
      ]);
      body.push(this.companiasConDatos().map(c => getTextoCelda(c, 'b2', c.compania, c.b2)));
    }

    if (this.mostrarTerceros()) {
      body.push([
        { content: 'Terceros', rowSpan: 4, styles: { valign: 'middle' } },
        ...this.companiasConDatos().map(c => getTextoCelda(c, 'c1', c.compania, c.c1))
      ]);
      body.push(this.companiasConDatos().map(c => getTextoCelda(c, 'c2', c.compania, c.c2)));
      body.push(this.companiasConDatos().map(c => getTextoCelda(c, 'c3', c.compania, c.c3)));
      body.push(this.companiasConDatos().map(c => getTextoCelda(c, 'c4', c.compania, c.c4)));
    }

    if (this.mostrarTodoRiesgo()) {
      body.push([
        { content: 'Todo Riesgo', rowSpan: 4, styles: { valign: 'middle' } },
        ...this.companiasConDatos().map(c => getTextoCelda(c, 'd1', c.compania, c.d1))
      ]);
      body.push(this.companiasConDatos().map(c => getTextoCelda(c, 'd2', c.compania, c.d2)));
      body.push(this.companiasConDatos().map(c => getTextoCelda(c, 'd3', c.compania, c.d3)));
      body.push(this.companiasConDatos().map(c => getTextoCelda(c, 'd4', c.compania, c.d4)));
    }

    // === Render de tabla ===
    autoTable(pdf, {
      head: [['Cobertura', ...this.companiasConDatos().map(c => c.compania)]],
      body,
      startY: 40,
      theme: 'grid',
      styles: {
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
        fontSize: 9,
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
      },
    });

    // === Datos del vehículo ===
    if (this.vehiculo) {
      const startY = (pdf as any).lastAutoTable.finalY + 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Datos del Vehículo', 14, startY);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Marca: ${this.vehiculo.marca}`, 14, startY + 8);
      pdf.text(`Modelo: ${this.vehiculo.modelo}`, 14, startY + 16);
      pdf.text(`Versión: ${this.vehiculo.version}`, 14, startY + 24);
      pdf.text(`Año: ${this.vehiculo.anio}`, 14, startY + 32);
    }

    const nombreArchivo = `Cotizacion_${nro}_${apellido}_${nombre}.pdf`.replace(/\s+/g, '_');
    pdf.save(nombreArchivo);
  }




  private formatCurrency(val: any): string {
    return val ? `$ ${Number(val).toLocaleString('es-AR')}` : '-';
  }

  getMontoConCodigo(cot: any, rol: string): string {
    const monto = cot[rol];
    const codigo = cot.rol2codigo?.[rol];
    if (monto == null) return '';
    return `$${monto.toLocaleString('es-AR')} ${codigo ? '(' + codigo + ')' : ''}`;
  }
}
