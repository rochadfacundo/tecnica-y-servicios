// header.component.ts
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Productor } from '../../models/productor.model';
import { ESpinner } from '../../enums/ESpinner';
import { SpinnerService } from '../../services/spinner.service';
import { ImageLoaderDirective } from '../../directives/image-loader.directive';
declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule,ImageLoaderDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Output() openMulticotizador = new EventEmitter<void>();
  isLoggedIn = false;
  productorLogueado$: Observable<Productor | null>;

  constructor(
    @Inject(AuthService) private s_auth: AuthService,
    @Inject(Router) private router: Router,
    @Inject(SpinnerService) private s_spinner: SpinnerService,
  ) {
    this.productorLogueado$ = this.s_auth.productor$;
  }

  ngOnInit() {
    this.s_auth.obtenerProductorLogueado().then(productor => {
      console.log('🧑‍💼 Productor logueado:', productor);
    });

    this.s_auth.isAuthenticated$.subscribe(state => {
      this.isLoggedIn = state;
    });

    document.querySelectorAll('.navbar-nav a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
  }

  async logout() {
    const resultado = await this.s_spinner.runWithSpinner(
      this.s_auth.logout(),
      ESpinner.Vaiven
    );

    if (resultado !== undefined) {

      this.router.navigateByUrl('/home');
    } else {
      console.error('❌ Logout fallido o timeout');
    }
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
