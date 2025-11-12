import {Component, OnInit} from '@angular/core';
import {GiocatoriService} from "../../service/giocatori.service";

declare var bootstrap: any;

@Component({
  selector: 'app-giocatori',
  templateUrl: './giocatori.component.html',
  styleUrls: ['./giocatori.component.css']
})
export class GiocatoriComponent implements OnInit {

  giocatori: any[] = [];
  selectedGiocatore: any = null;
  isEditMode: boolean = false;
  private modalInstance: any;

  constructor(
    private giocatoriService: GiocatoriService
  ) { }

  ngOnInit(): void {
    this.giocatori = this.giocatoriService.getGiocatori();
  }

  openDialog(index?: number): void {
    if (index !== undefined) {
      this.selectedGiocatore = {...this.giocatori[index]};
      this.isEditMode = true;
    } else {
      this.selectedGiocatore = null;
      this.isEditMode = false;
    }
  }

  handleSave(giocatore: any): void {
    if (this.isEditMode) {
      const index = this.giocatori.findIndex(g => g === this.selectedGiocatore);
      if (index !== -1) {
        this.giocatori[index] = giocatore;
      }
    } else {
      this.giocatori.push(giocatore);
    }
    this.giocatoriService.setGiocatori(this.giocatori);
    this.closeModal();
  }

  handleClose(): void {
    this.selectedGiocatore = null;
    this.isEditMode = false;
  }

  eliminaGiocatore(index: number): void {
    if (confirm('Sei sicuro di voler eliminare questo giocatore?')) {
      this.giocatori.splice(index, 1);
      this.giocatoriService.setGiocatori(this.giocatori);
    }
  }

  private closeModal(): void {
    const modalElement = document.getElementById('giocatoreModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

}
