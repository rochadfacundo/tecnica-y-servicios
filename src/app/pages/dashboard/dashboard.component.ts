import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MulticotizadorComponent } from '../../components/multicotizador/multicotizador.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,MulticotizadorComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  multicotizador:boolean=false;

  constructor(private s_auth:AuthService,private router:Router)
  {

  }

  logout()
  {
    this.s_auth.logout().then(()=>this.router.navigateByUrl('home'));

  }


  openMulticotizador(){
    this.multicotizador=!this.multicotizador;
  }
}

