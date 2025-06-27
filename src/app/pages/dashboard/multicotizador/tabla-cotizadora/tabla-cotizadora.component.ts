import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { Cotizacion } from '../../../../interfaces/cotizacion';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabla-cotizadora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-cotizadora.component.html',
  styleUrl: './tabla-cotizadora.component.css'
})
export class TablaCotizadoraComponent implements OnInit{
  cotizaciones: Cotizacion[] = [];

  constructor(
  @Inject(Router) private router: Router,
  ){

  }

  ngOnInit(): void {
    const state = history.state as { cotizaciones: Cotizacion[] };
      if (state?.cotizaciones) {
        this.cotizaciones = state.cotizaciones;
      } else {
        console.warn("⚠️ No se encontraron cotizaciones en el estado");
        this.router.navigate(['/dashboard']); // fallback
      }

    }

}
