import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RioUruguayComponent } from './rio-uruguay.component';

describe('RioUruguayComponent', () => {
  let component: RioUruguayComponent;
  let fixture: ComponentFixture<RioUruguayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RioUruguayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RioUruguayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
