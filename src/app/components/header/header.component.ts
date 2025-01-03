import { Component } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { routeAnimations } from '../../animations/animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [RouterModule],
  styleUrl: './header.component.css',

})
export class HeaderComponent {
  constructor(private router:Router)
  {

  }


}
