import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Costanti} from '../../costanti';

@Component({
  selector: 'app-dialog-giocatore',
  templateUrl: './dialog-giocatore.component.html',
  styleUrls: ['./dialog-giocatore.component.css']
})
export class DialogGiocatoreComponent implements OnInit, OnChanges {

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
      id: [null],
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      numeroMaglia: [''],
      dataDiNascita: ['', Validators.required],
      ruolo: ['', Validators.required],
      tesseraUisp: ['', Validators.required],
      capitano: [false]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['giocatore'] && this.giocatoreForm) {
      if (this.giocatore) {
        this.giocatoreForm.patchValue(this.giocatore);
      } else {
        this.giocatoreForm.reset();
      }
    }
  }

  salvaGiocatore(): void {
    if (this.giocatoreForm.valid) {
      const value = this.giocatoreForm.value;
      this.onSave.emit(value);
      this.giocatoreForm.reset({
        nome: '', cognome: '', numeroMaglia: '', dataDiNascita: '', ruolo: '', tesseraUisp: '', capitano: false
      });
    }
  }

  onCancel(): void {
    this.giocatoreForm.reset();
    this.onClose.emit();
  }
}
