import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterModule,HeaderComponent,FooterComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {

  constructor(private router:Router){

  }

  showMulticotizador()
  {
    this.router.navigate(['/dashboard'], {
      queryParams: { openMulticotizador: true }
    });
  }
}
