import { Component, OnInit } from '@angular/core';
import { AllenamentiService } from '../../service/allenamenti.service';
import { Allenamento } from '../../model/allenamento';

@Component({
  selector: 'app-impostazioni',
  templateUrl: './impostazioni.component.html',
  styleUrls: ['./impostazioni.component.css']
})
export class ImpostazioniComponent implements OnInit {
  allenamenti: Allenamento[] = [];
  editingAllenamento: Allenamento | null = null;
  isAdding = false;
  
  nuovoAllenamento: Allenamento = {
    giorno: '',
    orarioInizio: '',
    orarioFine: '',
    indirizzo: '',
    nomePalestra: '',
    ordinamento: 0
  };

  giorniSettimana = [
    { nome: 'Lunedì', valore: 1 },
    { nome: 'Martedì', valore: 2 },
    { nome: 'Mercoledì', valore: 3 },
    { nome: 'Giovedì', valore: 4 },
    { nome: 'Venerdì', valore: 5 },
    { nome: 'Sabato', valore: 6 },
    { nome: 'Domenica', valore: 7 }
  ];

  constructor(private allenamentiService: AllenamentiService) {}

  ngOnInit(): void {
    this.loadAllenamenti();
  }

  loadAllenamenti(): void {
    this.allenamentiService.getAllenamenti().subscribe(allenamenti => {
      this.allenamenti = allenamenti;
    });
  }

  startAdding(): void {
    this.isAdding = true;
    this.nuovoAllenamento = {
      giorno: '',
      orarioInizio: '',
      orarioFine: '',
      indirizzo: '',
      nomePalestra: '',
      ordinamento: 0
    };
  }

  cancelAdding(): void {
    this.isAdding = false;
  }

  saveAllenamento(): void {
    if (this.isFormValid(this.nuovoAllenamento)) {
      const giorno = this.giorniSettimana.find(g => g.nome === this.nuovoAllenamento.giorno);
      this.nuovoAllenamento.ordinamento = giorno ? giorno.valore : 0;
      
      this.allenamentiService.addAllenamento(this.nuovoAllenamento).then(() => {
        this.isAdding = false;
        this.loadAllenamenti();
      });
    }
  }

  startEditing(allenamento: Allenamento): void {
    this.editingAllenamento = { ...allenamento };
  }

  cancelEditing(): void {
    this.editingAllenamento = null;
  }

  updateAllenamento(): void {
    if (this.editingAllenamento && this.editingAllenamento.id && this.isFormValid(this.editingAllenamento)) {
      const giorno = this.giorniSettimana.find(g => g.nome === this.editingAllenamento!.giorno);
      this.editingAllenamento.ordinamento = giorno ? giorno.valore : 0;
      
      const { id, ...allenamentoData } = this.editingAllenamento;
      this.allenamentiService.updateAllenamento(id, allenamentoData).then(() => {
        this.editingAllenamento = null;
        this.loadAllenamenti();
      });
    }
  }

  deleteAllenamento(id: string | undefined): void {
    if (id && confirm('Sei sicuro di voler eliminare questo allenamento?')) {
      this.allenamentiService.deleteAllenamento(id).then(() => {
        this.loadAllenamenti();
      });
    }
  }

  isFormValid(allenamento: Allenamento): boolean {
    return !!(allenamento.giorno && 
              allenamento.orarioInizio && 
              allenamento.orarioFine && 
              allenamento.indirizzo && 
              allenamento.nomePalestra);
  }
}
