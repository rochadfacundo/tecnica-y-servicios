import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RivadaviaComponent } from './rivadavia.component';

describe('RivadaviaComponent', () => {
  let component: RivadaviaComponent;
  let fixture: ComponentFixture<RivadaviaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RivadaviaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RivadaviaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
