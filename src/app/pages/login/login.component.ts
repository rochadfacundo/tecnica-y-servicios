import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // Cambié "styleUrl" a "styleUrls"
})
export class LoginComponent {
  public loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private s_auth: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      console.error('Formulario inválido');
      return;
    }

    const { username, password } = this.loginForm.value;

    try {
      // Convertimos el username en un correo electrónico ficticio
      const email = `${username}@tecnicayservicios.com`;

      // Llamamos al servicio de autenticación
      const user = await this.s_auth.login(email, password);
      console.log('Usuario logueado:', user);

      // Redirigir al dashboard
      this.router.navigateByUrl('dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }
}
