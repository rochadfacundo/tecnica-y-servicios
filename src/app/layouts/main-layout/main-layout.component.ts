import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ESpinner } from '../../enums/ESpinner';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [HeaderComponent,FooterComponent,RouterModule,SpinnerComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

  vaiven:ESpinner=ESpinner.Vaiven;

}
