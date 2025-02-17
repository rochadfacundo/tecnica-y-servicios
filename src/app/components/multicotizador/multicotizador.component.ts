import { Component, OnInit } from '@angular/core';
import { AuthMercantilAndinaService } from '../../services/auth-mercantil-andina.service';
import { AuthFederacionPatronalService } from '../../services/auth-federacion-patronal.service';
import { AuthRioUruguayService } from '../../services/auth-rio-uruguay.service';
import { AuthRivadaviaService } from '../../services/auth-rivadavia.service';

@Component({
  selector: 'app-multicotizador',
  standalone: true,
  imports: [],
  templateUrl: './multicotizador.component.html',
  styleUrl: './multicotizador.component.css'
})
export class MulticotizadorComponent implements OnInit{

  private tokenFederacion:any;
  private tokenRivadavia: string | null = null;
  private tokenRus:any;
  constructor(private mercantil_s:AuthMercantilAndinaService,
              private federacion_s:AuthFederacionPatronalService,
              private rus_s:AuthRioUruguayService,
              private rivadavia_s:AuthRivadaviaService
  )
  {

  }

  ngOnInit(): void {
      this.obtenerTokenRivadavia();
  }

  obtenerTokenRivadavia(): void {
    this.rivadavia_s.getToken().subscribe(
      (response) => {
        console.log('Token Rivadavia:', response);
        this.tokenRivadavia = response.access_token; // Ajustar según la respuesta de la API
      },
      (error) => {
        console.error('Error al obtener el token de Rivadavia:', error);
      }
    );
  }

  obtenerTokenRus(): void {
    this.rus_s.getToken().subscribe(
      (response) => {
        console.log('Token RUS:', response);
        this.tokenRus = response.access_token; // Ajustar según la respuesta de la API
      },
      (error) => {
        console.error('Error al obtener el token de RUS:', error);
      }
    );
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
