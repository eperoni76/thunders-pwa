import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Costanti} from '../../costanti';

@Component({
  selector: 'app-dialog-giocatore',
  templateUrl: './dialog-giocatore.component.html',
  styleUrls: ['./dialog-giocatore.component.css']
})
export class DialogGiocatoreComponent implements OnInit {
  @Input() giocatore: any = null;
  @Input() isEditMode: boolean = false;
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  giocatoreForm!: FormGroup;
  ruoli: any[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.ruoli = Object.values(Costanti.RUOLI);

    this.giocatoreForm = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      numeroMaglia: ['', Validators.required],
      dataDiNascita: ['', Validators.required],
      ruolo: ['', Validators.required],
      tesseraUisp: ['', Validators.required]
    });

    if (this.giocatore) {
      this.giocatoreForm.patchValue(this.giocatore);
    }
  }

  salvaGiocatore(): void {
    if (this.giocatoreForm.valid) {
      this.onSave.emit(this.giocatoreForm.value);
      this.giocatoreForm.reset();
    }
  }

  onCancel(): void {
    this.giocatoreForm.reset();
    this.onClose.emit();
  }
}
