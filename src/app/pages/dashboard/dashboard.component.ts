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

  misCotizaciones:Cotizacion[];

  constructor(private router: Router,private route: ActivatedRoute,
    private auth_s: AuthService
  )
  {
    this.misCotizaciones= [];
  }

  async ngOnInit() {

}



 crearProductor() {

/*
  this.auth_s.deleteUser(this.productor.uid).then(() => {

  }).catch((err) => {
    console.log(err);
  });*/
  /*
  this.auth_s.register(this.productor)
    .then(() => alert('✅ Productor creado correctamente'))
    .catch(() => alert('❌ Error al crear productor'));*/
}


  actualizarCotizaciones(cot: Cotizacion) {
    const index = this.misCotizaciones.findIndex(c => c.compania === cot.compania);

    if (index !== -1) {
      this.misCotizaciones[index] = cot;
    } else {
      this.misCotizaciones.push(cot);
    }
  }

}

