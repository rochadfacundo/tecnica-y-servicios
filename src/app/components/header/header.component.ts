import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Productor } from '../../models/productor.model';

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  @Output() openMulticotizador = new EventEmitter<void>();
  isLoggedIn = false;
  productorLogueado!:Productor |null;

  constructor(private s_auth: AuthService, private router: Router) {}

  async ngOnInit() {

    const productor = await this.s_auth.obtenerProductorLogueado();
    console.log('🧑‍💼 Productor logueado:', productor);
    this.productorLogueado=productor;
    this.s_auth.isAuthenticated$.subscribe(state => {
      this.isLoggedIn = state;
    });

    document.querySelectorAll('.navbar-nav a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
  }

  logout() {
    this.s_auth.logout().then(() => {
      this.router.navigateByUrl('/home');
    });
  }

  closeMenu() {
    const navbar = document.querySelector('.navbar-collapse') as HTMLElement;
    if (navbar?.classList.contains('show')) {
      const bsCollapse = new bootstrap.Collapse(navbar, { toggle: false });
      bsCollapse.hide();
    }
  }

  emitMulticotizador() {
    this.openMulticotizador.emit();
  }
}
