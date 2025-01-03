import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  async onSubmit(userName: string, password: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post('http://localhost:8888/.netlify/functions/login', {
          username: userName,
          password: password,
        },{ headers: new HttpHeaders({
          'Content-Type': 'application/json',
        })})
      );

      console.log('Respuesta del servidor:', response);
      return response; // Retornamos la respuesta para manejarla en el componente
    } catch (error) {
      console.error('Error en la solicitud:', error);

    }
  }
}
