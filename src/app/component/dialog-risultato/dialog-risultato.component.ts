import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-dialog-risultato',
  templateUrl: './dialog-risultato.component.html',
  styleUrls: ['./dialog-risultato.component.css']
})
export class DialogRisultatoComponent implements OnChanges {
  @Input() partita: any;
  @Input() isOpen = false;
  @Output() onSave = new EventEmitter<{ ospitante: number; ospite: number }>();
  @Output() onClose = new EventEmitter<void>();

  ospitanteRis: number | null = null;
  ospiteRis: number | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      // Reset valori ad apertura
      this.ospitanteRis = null;
      this.ospiteRis = null;
    }
  }

  salva() {
    if (this.ospitanteRis == null || this.ospiteRis == null) {
      return;
    }
    this.onSave.emit({ ospitante: this.ospitanteRis, ospite: this.ospiteRis });
  }

  chiudi() {
    this.onClose.emit();
  }
}
