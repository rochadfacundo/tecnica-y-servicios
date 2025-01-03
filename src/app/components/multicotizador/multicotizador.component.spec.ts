import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MulticotizadorComponent } from './multicotizador.component';

describe('MulticotizadorComponent', () => {
  let component: MulticotizadorComponent;
  let fixture: ComponentFixture<MulticotizadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MulticotizadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MulticotizadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
