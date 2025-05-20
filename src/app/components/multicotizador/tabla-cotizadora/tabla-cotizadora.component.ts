import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Cotizacion } from '../../../interfaces/cotizacion';

@Component({
  selector: 'app-tabla-cotizadora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-cotizadora.component.html',
  styleUrl: './tabla-cotizadora.component.css'
})
export class TablaCotizadoraComponent {
  @Input() cotizaciones: Cotizacion[] = [];
}
