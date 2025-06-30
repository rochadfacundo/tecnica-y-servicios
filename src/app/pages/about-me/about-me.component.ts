import { Component, OnInit, ViewChildren,AfterViewInit, ElementRef, Renderer2, QueryList } from '@angular/core';
import { Team } from '../../interfaces/team';
import teamData from '../../../assets/team.json';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css']
})
export class AboutMeComponent implements OnInit {
  public team: Team[] = [];
  @ViewChildren('animatedCard', { read: ElementRef }) cards!: QueryList<ElementRef>;


  constructor(private renderer: Renderer2){

  }

  ngOnInit(): void {
    this.team = teamData as Team[]; // Carga los datos del archivo JSON
    console.log(this.team); // Verifica los datos en la consola
  }


  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          this.renderer.addClass(el, 'animate__animated');
          this.renderer.addClass(el, 'animate__fadeInUp');
          this.renderer.addClass(el, 'animate__faster');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    this.cards.forEach(card => observer.observe(card.nativeElement));
  }
}
