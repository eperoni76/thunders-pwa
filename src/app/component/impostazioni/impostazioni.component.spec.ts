import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpostazioniComponent } from './impostazioni.component';

describe('ImpostazioniComponent', () => {
  let component: ImpostazioniComponent;
  let fixture: ComponentFixture<ImpostazioniComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImpostazioniComponent]
    });
    fixture = TestBed.createComponent(ImpostazioniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
