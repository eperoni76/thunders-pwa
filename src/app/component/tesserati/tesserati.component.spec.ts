import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TesseratiComponent } from './tesserati.component';

describe('TesseratiComponent', () => {
  let component: TesseratiComponent;
  let fixture: ComponentFixture<TesseratiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TesseratiComponent]
    });
    fixture = TestBed.createComponent(TesseratiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
