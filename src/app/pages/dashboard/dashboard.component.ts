import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MulticotizadorComponent } from '../../components/multicotizador/multicotizador.component';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TablaCotizadoraComponent } from '../../components/multicotizador/tabla-cotizadora/tabla-cotizadora.component';
import { Cotizacion } from '../../interfaces/cotizacion';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { Role } from '../../enums/role';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MulticotizadorComponent,
    TablaCotizadoraComponent,
    FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  multicotizador:boolean=false;
  misCotizaciones:Cotizacion[];

  constructor(private router: Router,private route: ActivatedRoute,
    private auth_s: AuthService
  )
  {
    this.misCotizaciones= [];
  }

  async ngOnInit() {

  this.route.queryParams.subscribe(params => {
    if (params['openMulticotizador']) {
      this.multicotizador = true;
    }
  });
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

  open(){
    this.multicotizador=!this.multicotizador;
  }
}

