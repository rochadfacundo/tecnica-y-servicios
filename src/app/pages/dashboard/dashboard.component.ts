import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MulticotizadorComponent } from './multicotizador/multicotizador.component';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TablaCotizadoraComponent } from './multicotizador/tabla-cotizadora/tabla-cotizadora.component';
import { Cotizacion } from '../../interfaces/cotizacion';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { Role } from '../../enums/role';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  misCotizaciones: Cotizacion[] = [];
  animar: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth_s: AuthService
  ) {}

  ngOnInit(): void {

    const img = new Image();
    img.src = 'assets/car.jpg';
    img.onload = () => {
      document.querySelector('.fondo-dashboard')?.classList.add('loaded');
    };

    setTimeout(() => {
      this.animar = true;
    }, 10);
  }

}

