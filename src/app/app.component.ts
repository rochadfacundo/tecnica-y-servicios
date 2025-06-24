import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { routeAnimations } from './animations/animations';
import { AuthService } from './services/auth.service';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'técnica y servicios';
  isAuthenticated = false;
  isNavigating = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    // Escuchar los eventos del router para gestionar el estado de navegación
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
      } else if (event instanceof NavigationEnd) {
        this.isNavigating = false;
      }
    });
  }

  ngOnInit() {
    // Observar el estado de autenticación
    this.authService.isAuthenticated$.subscribe((authStatus) => {
      this.isAuthenticated = authStatus;
      this.cdr.detectChanges(); // Asegura que se actualice la vista
    });
  }
}
