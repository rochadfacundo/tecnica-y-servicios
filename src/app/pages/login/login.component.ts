import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SpinnerService } from '../../services/spinner.service'; // 👈 importar spinner
import { ESpinner } from '../../enums/ESpinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  public loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private s_auth: AuthService,
    private spinner: SpinnerService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      console.error('Formulario inválido');
      return;
    }

    const { email, password } = this.loginForm.value;

    try {
      const user = await this.spinner.runWithSpinner(
        this.s_auth.login(email, password),ESpinner.Vaiven
      );
      console.log('Usuario logueado:', user);
      this.router.navigateByUrl('dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }
}
