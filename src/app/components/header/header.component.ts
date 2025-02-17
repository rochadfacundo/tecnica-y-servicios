import { Component, OnInit } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { routeAnimations } from '../../animations/animations';


declare var bootstrap: any; // 👈 Esto va antes de la clase

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [RouterModule],
  styleUrl: './header.component.css',

})

export class HeaderComponent implements OnInit {

  constructor(private router:Router)
  {


  }

  ngOnInit()
  {
    document.querySelectorAll('.navbar-nav a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
  }
  closeMenu() {
    const navbar = document.querySelector('.navbar-collapse') as HTMLElement;
    if (navbar.classList.contains('show')) {
      const bsCollapse = new bootstrap.Collapse(navbar, { toggle: false });
      bsCollapse.hide(); // Usa Bootstrap para animar el cierre
    }
  }




}
