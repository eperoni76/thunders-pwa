import { Component, Input, Output, EventEmitter } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-dialog-risultato',
  templateUrl: './dialog-risultato.component.html',
  styleUrls: ['./dialog-risultato.component.css']
})
export class DialogRisultatoComponent  {
  @Input() partita: any;
  @Output() onSave = new EventEmitter<{ ospitante: number; ospite: number }>();
  @Output() onClose = new EventEmitter<void>();

  ospitanteRis: number | null = null;
  ospiteRis: number | null = null;
  private modalInstance: any;

  open() {
    this.ospitanteRis = null;
    this.ospiteRis = null;
    const el = document.getElementById('risultatoModal');
    if (el) {
      this.modalInstance = new bootstrap.Modal(el);
      this.modalInstance.show();
    }
  }

  salva() {
    if (this.ospitanteRis == null || this.ospiteRis == null) {
      return;
    }
    this.onSave.emit({ ospitante: this.ospitanteRis, ospite: this.ospiteRis });
    this.chiudi();
  }

  chiudi() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.onClose.emit();
  }
}
