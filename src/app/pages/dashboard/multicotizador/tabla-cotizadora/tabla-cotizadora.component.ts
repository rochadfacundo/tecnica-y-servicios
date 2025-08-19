import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { Cotizacion } from '../../../../interfaces/cotizacion';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Productor } from '../../../../models/productor.model';
import { getRandomNumber } from '../../../../utils/utils';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tabla-cotizadora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-cotizadora.component.html',
  styleUrl: './tabla-cotizadora.component.css'
})
export class TablaCotizadoraComponent implements OnInit{
  cotizaciones!: Cotizacion;
  user!:Productor |null;

  constructor(
  @Inject(Router) private router: Router,
  @Inject(AuthService) private s_auth: AuthService,
  @Inject(ToastrService) private s_toast: ToastrService
  ){

  }

  async guardarCotizaciones() {
    if (!this.user || !this.cotizaciones)
      return;

    const yaExiste = this.user.cotizaciones?.some(c =>
      c.nroCotizacion === this.cotizaciones.nroCotizacion
    );

    if (!yaExiste) {
      this.user.cotizaciones = this.user.cotizaciones || [];
      this.user.cotizaciones.push(this.cotizaciones);

      try {
        await this.s_auth.updateUser(this.user);
        this.s_toast.success("Cotizacion guardada exitosamente","Cotizacion guardada");
        console.log('✅ Cotización guardada');
      } catch (error) {
        this.s_toast.error("Error al guardar la cotizacion","No se guardo la cotizacion");
        console.error('❌ Error al guardar cotización:', error);
      }
    } else {
      console.log('⚠️ La cotización ya fue guardada');
    }
  }


  async ngOnInit(): Promise<void> {

    this.user = await this.s_auth.obtenerProductorLogueado();

    if(!this.user)
      return;

    const state = history.state as { cotizaciones: Cotizacion };
      if (state?.cotizaciones) {
        this.cotizaciones = state.cotizaciones;
      } else {
        console.warn("⚠️ No se encontraron cotizaciones en el estado");
        this.router.navigate(['/dashboard']); // fallback
      }

    }

}
