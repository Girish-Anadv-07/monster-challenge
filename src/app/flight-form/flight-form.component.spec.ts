import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightFormComponent } from './flight-form.component';

describe('FlightFormComponent', () => {
  let component: FlightFormComponent;
  let fixture: ComponentFixture<FlightFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
