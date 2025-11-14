import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRisultatoComponent } from './dialog-risultato.component';

describe('DialogRisultatoComponent', () => {
  let component: DialogRisultatoComponent;
  let fixture: ComponentFixture<DialogRisultatoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogRisultatoComponent]
    });
    fixture = TestBed.createComponent(DialogRisultatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
