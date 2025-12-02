import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Costanti} from '../../utils/costanti';
import {AuthService} from '../../service/auth.service';

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
  profili: any[] = [];

  constructor(private fb: FormBuilder, public authService: AuthService) {}

  ngOnInit(): void {
    this.ruoli = Object.values(Costanti.RUOLI);
    this.profili = Object.values(Costanti.PROFILI_UTENTE);

    this.giocatoreForm = this.fb.group({
      id: [null],
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      numeroMaglia: [''],
      dataDiNascita: ['', Validators.required],
      ruolo: ['', Validators.required],
      tesseraUisp: ['', Validators.required],
      capitano: [false],
      codiceFiscale: [''],
      profilo: ['', Validators.required],
      email: ['', [Validators.email]],
      tagliaDivisa: [''],
      scadenzaCertificatoMedico: ['']
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
      // Trasforma taglia divisa in maiuscolo
      if (value.tagliaDivisa) {
        value.tagliaDivisa = value.tagliaDivisa.toUpperCase();
      }
      this.onSave.emit(value);
      this.giocatoreForm.reset({
        nome: '', cognome: '', numeroMaglia: '', dataDiNascita: '', ruolo: '', tesseraUisp: '', 
        capitano: false, codiceFiscale: '', profilo: '', email: '', tagliaDivisa: '', scadenzaCertificatoMedico: ''
      });
    }
  }

  onCancel(): void {
    this.giocatoreForm.reset();
    this.onClose.emit();
  }
}
