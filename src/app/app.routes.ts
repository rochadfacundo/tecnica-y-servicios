import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutMeComponent } from './pages/about-me/about-me.component';
import { ServicesComponent } from './pages/services/services.component';
import { ContactMeComponent } from './pages/contact-me/contact-me.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard, NoAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {path: 'home', component: HomeComponent,canActivate:[NoAuthGuard]
  },
  {path: 'acerca-de', component: AboutMeComponent},
  {path: 'servicios', component: ServicesComponent},
  {path: 'contacto', component: ContactMeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent,canActivate:[AuthGuard]},
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' } // Ruta por defecto si no se encuentra otra
];
