import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiocatoriComponent } from './giocatori.component';

describe('GiocatoriComponent', () => {
  let component: GiocatoriComponent;
  let fixture: ComponentFixture<GiocatoriComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GiocatoriComponent]
    });
    fixture = TestBed.createComponent(GiocatoriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
