import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-toop-tip',
  standalone: true,
  imports: [],
  templateUrl: './toop-tip.component.html',
  styleUrls: ['./toop-tip.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToopTipComponent {


  @Input() toolTipText = '';
}
