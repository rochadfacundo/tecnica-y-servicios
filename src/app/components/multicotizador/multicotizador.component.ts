import { Component, OnInit } from '@angular/core';
import { AuthMercantilAndinaService } from '../../services/auth-mercantil-andina.service';
import { AuthFederacionPatronalService } from '../../services/auth-federacion-patronal.service';
import { AuthRioUruguayService } from '../../services/auth-rio-uruguay.service';
import { AuthRivadaviaService } from '../../services/auth-rivadavia.service';
import { AtmService } from '../../services/atm.service';

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
  constructor(private s_mercantil:AuthMercantilAndinaService,
              private s_federacion:AuthFederacionPatronalService,
              private s_rus:AuthRioUruguayService,
              private s_rivadavia:AuthRivadaviaService,
              private s_atm:AtmService
  )
  {

  }

  ngOnInit(): void {
    this.s_atm.cotizarAuto().subscribe(
      data => {
        console.log('Respuesta:', data);
      },
      error => console.error('Error:', error)
    );
  }


  obtenerTokenRivadavia(): void {
    this.s_rivadavia.getToken().subscribe(
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
    this.s_rus.getToken().subscribe(
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
    this.s_federacion.obtenerToken().subscribe(
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
    return this.s_mercantil.getToken().subscribe((data)=>{
      console.log(data.access_token);
    });*/


  }

}
