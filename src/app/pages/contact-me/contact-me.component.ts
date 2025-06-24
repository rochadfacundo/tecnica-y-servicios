import { Component, signal } from '@angular/core';
import { Location } from '../../interfaces/location';
import {GoogleMap, MapAdvancedMarker} from '@angular/google-maps';

@Component({
  selector: 'app-contact-me',
  standalone: true,
  imports: [GoogleMap,MapAdvancedMarker],
  templateUrl: './contact-me.component.html',
  styleUrl: './contact-me.component.css'
})
export class ContactMeComponent {

  center: google.maps.LatLngLiteral = {lat: -34.620783, lng: -58.3797809};
  zoom = 18;



  initMap()
  {


  }
}
