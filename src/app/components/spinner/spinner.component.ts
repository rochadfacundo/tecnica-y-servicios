import { Component, Input, OnInit } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { Observable } from 'rxjs';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ESpinner } from '../../enums/ESpinner';
@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  standalone: true,
  imports: [NgIf,AsyncPipe,NgClass]
})
export class SpinnerComponent implements OnInit {
  loading$:Observable<boolean>;
  @Input() tipo!: ESpinner; 
  ESpinner = ESpinner;
  constructor(private spinnerService: SpinnerService) {
    this.loading$=this.spinnerService.loading$;
  }

   ngOnInit() {
    switch (this.tipo) {
      case ESpinner.Rebote:
        this.loading$ = this.spinnerService.rebote$;
        break;
      case ESpinner.Vaiven:
        this.loading$ = this.spinnerService.vaiven$;
        break;
      default:
        this.loading$ = this.spinnerService.loading$;
        break;
    }
  }

}
