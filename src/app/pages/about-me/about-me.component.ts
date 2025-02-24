import { Component, OnInit } from '@angular/core';
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

  constructor() {}

  ngOnInit(): void {
    this.team = teamData as Team[]; // Carga los datos del archivo JSON
    console.log(this.team); // Verifica los datos en la consola
  }
}
