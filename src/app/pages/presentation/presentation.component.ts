import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.css'
})
export class PresentationComponent {
  companias = [
    { nombre: 'Río Uruguay', logo: '../../../assets/rus.png' },
    { nombre: 'Mercantil Andina', logo: '../../../assets/mercantil.jpeg' },
    { nombre: 'ATM', logo: '../../../assets/atm.jpeg' },
    { nombre: 'Rivadavia', logo: '../../../assets/rivadavia.jpeg' },
    { nombre: 'Federación Patronal', logo: '../../../assets/federacion.png' },
    { nombre: 'Digna', logo: '../../../assets/digna.jpeg' },
  ];
}
