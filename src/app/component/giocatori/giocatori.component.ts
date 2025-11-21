import {Component, OnInit, OnDestroy} from '@angular/core';
import {GiocatoriService} from "../../service/giocatori.service";
import { Subscription } from 'rxjs';
import {PdfService} from "../../service/pdf.service";
import {GenericUtils} from "../../utils/generic-utils";

declare var bootstrap: any;

@Component({
  selector: 'app-giocatori',
  templateUrl: './giocatori.component.html',
  styleUrls: ['./giocatori.component.css']
})
export class GiocatoriComponent implements OnInit, OnDestroy {

  giocatori: any[] = [];
  selectedGiocatore: any = null;
  isEditMode: boolean = false;
  private giocatoriSubscription?: Subscription;

  constructor(
    private giocatoriService: GiocatoriService,
    private pdfService: PdfService
  ) { }

  ngOnInit(): void {
    // Usa Observable per aggiornamenti real-time
    this.giocatoriSubscription = this.giocatoriService.getGiocatoriObservable().subscribe(
      giocatori => {
        this.giocatori = giocatori;
      }
    );
  }

  ngOnDestroy(): void {
    // Pulisci la subscription
    if (this.giocatoriSubscription) {
      this.giocatoriSubscription.unsubscribe();
    }
  }

  get giocatoriOrdinati(): any[] {
    return GenericUtils.ordinaGiocatoriPerCognome(this.giocatori);
  }

  openDialog(giocatore?: any): void {
    if (giocatore !== undefined) {
      this.selectedGiocatore = {...giocatore};
      this.isEditMode = true;
    } else {
      this.selectedGiocatore = null;
      this.isEditMode = false;
    }
  }

  async handleSave(giocatore: any): Promise<void> {
    try {
      if (this.isEditMode && this.selectedGiocatore) {
        // Aggiorna giocatore esistente
        const giocatoreId = this.selectedGiocatore.id;
        const { id, ...giocatoreData } = giocatore; // Rimuovi id dai dati da aggiornare
        await this.giocatoriService.updateGiocatore(giocatoreId, giocatoreData);
      } else {
        // Aggiungi nuovo giocatore
        await this.giocatoriService.addGiocatore(giocatore);
      }
      this.closeModal();
      this.handleClose();
    } catch (error) {
      console.error('Errore nel salvataggio del giocatore:', error);
      alert('Errore nel salvataggio. Riprova.');
    }
  }

  handleClose(): void {
    this.selectedGiocatore = null;
    this.isEditMode = false;
  }

  async eliminaGiocatore(giocatore: any): Promise<void> {
    if (confirm('Sei sicuro di voler eliminare questo giocatore?')) {
      try {
        const giocatoreId = giocatore.id;
        await this.giocatoriService.deleteGiocatore(giocatoreId);
      } catch (error) {
        console.error('Errore nell\'eliminazione del giocatore:', error);
        alert('Errore nell\'eliminazione. Riprova.');
      }
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
    reader.onload = async (e: any) => {
      const text = e.target.result;
      const lines = text.split('\n').filter((line: string) => line.trim() !== '');

      const currentGiocatori = await this.giocatoriService.getGiocatori();
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
            tesseraUisp: parts[5],
            capitano: false
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
        try {
          await this.giocatoriService.addMultipleGiocatori(newGiocatori);

          let message = `${newGiocatori.length} giocatori caricati con successo!`;
          if (skippedCount > 0) {
            message += `\n${skippedCount} giocatori già presenti sono stati ignorati.`;
          }
          alert(message);
        } catch (error) {
          console.error('Errore nel caricamento dei giocatori:', error);
          alert('Errore nel caricamento. Riprova.');
        }
      } else {
        if (skippedCount > 0) {
          alert(`Nessun giocatore caricato.\n${skippedCount} giocatori erano già presenti.`);
        } else {
          alert('Nessun giocatore valido trovato nel file');
        }
      }

      event.target.value = '';
    };

    reader.readAsText(file);
  }

}
