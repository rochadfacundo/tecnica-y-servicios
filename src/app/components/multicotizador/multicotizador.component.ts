import { Component, OnInit } from '@angular/core';
import { AuthMercantilAndinaService } from '../../services/auth-mercantil-andina.service';
import { AuthFederacionPatronalService } from '../../services/auth-federacion-patronal.service';

@Component({
  selector: 'app-multicotizador',
  standalone: true,
  imports: [],
  templateUrl: './multicotizador.component.html',
  styleUrl: './multicotizador.component.css'
})
export class MulticotizadorComponent implements OnInit{

  private tokenFederacion:any;
  constructor(private mercantil_s:AuthMercantilAndinaService,
              private federacion_s:AuthFederacionPatronalService
  )
  {

  }

  ngOnInit(): void {
      this.obtenerTokenFederacion();
  }

  obtenerTokenFederacion(): void {
    this.federacion_s.obtenerToken().subscribe(
      (response) => {
        console.log('Token Federación Patronal:', response);
        this.tokenFederacion = response.access_token; // Ajustar según la respuesta de la API
      },
      (error) => {
        console.error('Error al obtener el token:', error);
      }
    );
  }

  getTokenMercantil()
  {
    //mercantil
    /*
    return this.mercantil_s.getToken().subscribe((data)=>{
      console.log(data.access_token);
    });*/


  }

}
