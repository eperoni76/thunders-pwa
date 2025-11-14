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
    this.sortGiocatoriByNumeroMaglia();
  }

  private sortGiocatoriByNumeroMaglia(): void {
    this.giocatori.sort((a, b) => {
      const numA = parseInt(a.numeroMaglia) || 0;
      const numB = parseInt(b.numeroMaglia) || 0;
      return numA - numB;
    });
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
    this.sortGiocatoriByNumeroMaglia();
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

  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      const lines = text.split('\n').filter((line: string) => line.trim() !== '');

      const currentGiocatori = this.giocatoriService.getGiocatori();
      const newGiocatori: any[] = [];
      let skippedCount = 0;

      lines.forEach((line: string) => {
        const parts = line.split(';').map((part: string) => part.trim());

        if (parts.length === 6) {
          const giocatore = {
            nome: parts[0],
            cognome: parts[1],
            numeroMaglia: parts[2],
            dataDiNascita: parts[3],
            ruolo: parts[4],
            tesseraUisp: parts[5]
          };

          // Controlla se esiste già un giocatore con lo stesso nome e cognome
          const exists = currentGiocatori.some(g =>
            g.nome.toLowerCase() === giocatore.nome.toLowerCase() &&
            g.cognome.toLowerCase() === giocatore.cognome.toLowerCase()
          );

          if (!exists) {
            newGiocatori.push(giocatore);
          } else {
            skippedCount++;
          }
        }
      });

      if (newGiocatori.length > 0) {
        this.giocatoriService.addMultipleGiocatori(newGiocatori);
        this.giocatori = this.giocatoriService.getGiocatori();

        let message = `${newGiocatori.length} giocatori caricati con successo!`;
        if (skippedCount > 0) {
          message += `\n${skippedCount} giocatori già presenti sono stati ignorati.`;
        }
        alert(message);
      } else {
        if (skippedCount > 0) {
          alert(`Nessun giocatore caricato.\n${skippedCount} giocatori erano già presenti.`);
        } else {
          alert('Nessun giocatore valido trovato nel file');
        }
      }

      // Reset input file
      event.target.value = '';
    };

    reader.readAsText(file);
  }

}
