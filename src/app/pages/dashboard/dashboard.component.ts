import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MulticotizadorComponent } from '../../components/multicotizador/multicotizador.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,MulticotizadorComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  multicotizador:boolean=false;

  logout()
  {}


  openMulticotizador(){
    this.multicotizador=!this.multicotizador;
  }
}

