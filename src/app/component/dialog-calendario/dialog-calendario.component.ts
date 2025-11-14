import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog-calendario',
  templateUrl: './dialog-calendario.component.html',
  styleUrls: ['./dialog-calendario.component.css']
})
export class DialogCalendarioComponent implements OnInit, OnChanges {
  @Input() partita: any = null;
  @Input() isEditMode: boolean = false;
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  partitaForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.partitaForm = this.fb.group({
      numeroGara: ['', Validators.required],
      data: ['', Validators.required],
      ora: ['', Validators.required],
      campionato: ['', Validators.required],
      indirizzo: ['', Validators.required],
      ospitante: ['', Validators.required],
      ospite: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['partita'] && this.partitaForm) {
      if (this.partita) {
        this.partitaForm.patchValue(this.partita);
      } else {
        this.partitaForm.reset();
      }
    }
  }

  salvaPartita(): void {
    if (this.partitaForm.valid) {
      this.onSave.emit(this.partitaForm.value);
      this.partitaForm.reset();
    }
  }

  onCancel(): void {
    this.partitaForm.reset();
    this.onClose.emit();
  }
}
