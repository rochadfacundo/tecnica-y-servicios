import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutMeComponent } from './pages/about-me/about-me.component';
import { ServicesComponent } from './pages/services/services.component';
import { ContactMeComponent } from './pages/contact-me/contact-me.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard, NoAuthGuard } from './guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, // Usa el layout principal
    canActivate: [NoAuthGuard], // Protegido con el guard
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'acerca-de', component: AboutMeComponent },
      { path: 'servicios', component: ServicesComponent },
      { path: 'contacto', component: ContactMeComponent },
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent, // Usa el layout del dashboard
    canActivate: [AuthGuard], // Protegido con el guard
    children: [
      { path: '', component: DashboardComponent }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
