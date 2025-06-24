import { Component, Input } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { Observable } from 'rxjs';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  standalone: true,
  imports: [NgIf,AsyncPipe,NgClass]
})
export class SpinnerComponent {
  loading$:Observable<boolean>;
  @Input() tipo: 'vaiven' | 'rebote' = 'vaiven'; 

  constructor(private spinnerService: SpinnerService) {
    this.loading$=this.spinnerService.loading$;
  }

}
