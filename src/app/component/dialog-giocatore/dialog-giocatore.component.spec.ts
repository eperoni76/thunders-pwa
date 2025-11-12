import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGiocatoreComponent } from './dialog-giocatore.component';

describe('DialogGiocatoreComponent', () => {
  let component: DialogGiocatoreComponent;
  let fixture: ComponentFixture<DialogGiocatoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogGiocatoreComponent]
    });
    fixture = TestBed.createComponent(DialogGiocatoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
