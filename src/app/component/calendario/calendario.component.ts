import { Component, OnInit } from '@angular/core';
import { CalendarioService } from '../../service/calendario.service';

declare var bootstrap: any;

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {

  partite: any[] = [];
  selectedPartita: any = null;
  isEditMode: boolean = false;

  constructor(
    private calendarioService: CalendarioService
  ) { }

  ngOnInit(): void {
    this.partite = this.calendarioService.getPartite();
  }

  openDialog(index?: number): void {
    if (index !== undefined) {
      this.selectedPartita = {...this.partite[index]};
      this.isEditMode = true;
    } else {
      this.selectedPartita = null;
      this.isEditMode = false;
    }
  }

  handleSave(partita: any): void {
    if (this.isEditMode) {
      const index = this.partite.findIndex(p => p === this.selectedPartita);
      if (index !== -1) {
        this.partite[index] = partita;
      }
    } else {
      this.partite.push(partita);
    }
    this.calendarioService.setPartite(this.partite);
    this.closeModal();
  }

  handleClose(): void {
    this.selectedPartita = null;
    this.isEditMode = false;
  }

  eliminaPartita(index: number): void {
    if (confirm('Sei sicuro di voler eliminare questa partita?')) {
      this.partite.splice(index, 1);
      this.calendarioService.setPartite(this.partite);
    }
  }

  private closeModal(): void {
    const modalElement = document.getElementById('calendarioModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

}
