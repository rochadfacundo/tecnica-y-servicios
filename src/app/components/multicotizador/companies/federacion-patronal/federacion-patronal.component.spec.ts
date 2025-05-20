import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FederacionPatronalComponent } from './federacion-patronal.component';

describe('FederacionPatronalComponent', () => {
  let component: FederacionPatronalComponent;
  let fixture: ComponentFixture<FederacionPatronalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FederacionPatronalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FederacionPatronalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
