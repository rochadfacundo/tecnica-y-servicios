import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MulticotizadorComponent } from '../../components/multicotizador/multicotizador.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TablaCotizadoraComponent } from '../../components/multicotizador/tabla-cotizadora/tabla-cotizadora.component';
import { Cotizacion } from '../../interfaces/cotizacion';
import { getCotizacionesTabla } from '../../components/multicotizador/utils/utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,MulticotizadorComponent,TablaCotizadoraComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  multicotizador:boolean=false;
  misCotizaciones:Cotizacion[];

  constructor(private s_auth:AuthService,private router:Router)
  {
    this.misCotizaciones= [];
  }

  logout()
  {
    this.s_auth.logout().then(()=>this.router.navigateByUrl('home'));

  }

  actualizarCotizaciones(cot: Cotizacion) {
    const index = this.misCotizaciones.findIndex(c => c.compania === cot.compania);

    if (index !== -1) {
      this.misCotizaciones[index] = { ...this.misCotizaciones[index], ...cot };
    } else {
      this.misCotizaciones.push(cot);
    }
  }

  openMulticotizador(){
    this.multicotizador=!this.multicotizador;
  }
}

