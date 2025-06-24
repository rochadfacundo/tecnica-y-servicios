import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {
  @Output() abrirMulticotizador = new EventEmitter<void>();
  isLoggedIn = false;

  constructor(private s_auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.s_auth.isAuthenticated$.subscribe(state => {
      this.isLoggedIn = state;
    });
  }

  openMulticotizador() {
    this.abrirMulticotizador.emit();
  }

  logout() {
    this.s_auth.logout().then(() => {
      this.router.navigateByUrl('/home');
    });
  }
}
