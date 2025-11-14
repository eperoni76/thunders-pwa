import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCalendarioComponent } from './dialog-calendario.component';

describe('DialogCalendarioComponent', () => {
  let component: DialogCalendarioComponent;
  let fixture: ComponentFixture<DialogCalendarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogCalendarioComponent]
    });
    fixture = TestBed.createComponent(DialogCalendarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
