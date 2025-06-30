import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ESpinner } from '../../enums/ESpinner';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterModule,HeaderComponent,FooterComponent,SpinnerComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  rebote:ESpinner=ESpinner.Rebote;
  vaiven:ESpinner=ESpinner.Vaiven;
  constructor(private router:Router){

  }

  showMulticotizador()
  {
    this.router.navigate(['/dashboard'], {
      queryParams: { openMulticotizador: true }
    });
  }
}
