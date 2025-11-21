import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CalendarioService } from '../../service/calendario.service';
import { PdfService } from '../../service/pdf.service';
import { Partita } from '../../model/partita';
import { DialogRisultatoComponent } from '../dialog-risultato/dialog-risultato.component';
import { Subscription } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit, OnDestroy {

  partite: Partita[] = [];
  selectedPartita: Partita | null = null;
  isEditMode: boolean = false;
  selectedIndex: number | null = null;
  private partiteSubscription?: Subscription;
  @ViewChild(DialogRisultatoComponent) dialogRisultatoComp!: DialogRisultatoComponent;

  constructor(
    private calendarioService: CalendarioService,
    private pdfService: PdfService
  ) { }

  ngOnInit(): void {
    // Usa Observable per aggiornamenti real-time
    this.partiteSubscription = this.calendarioService.getPartiteObservable().subscribe(
      partite => {
        this.partite = partite;
      }
    );
  }

  ngOnDestroy(): void {
    // Pulisci la subscription
    if (this.partiteSubscription) {
      this.partiteSubscription.unsubscribe();
    }
  }

  openDialog(index?: number): void {
    if (index !== undefined) {
      this.selectedPartita = { ...this.partite[index] };
      this.selectedIndex = index;
      this.isEditMode = true;
    } else {
      this.selectedPartita = null;
      this.selectedIndex = null;
      this.isEditMode = false;
    }
  }

  async handleSave(partita: Partita): Promise<void> {
    try {
      if (this.isEditMode && this.selectedIndex !== null) {
        // Aggiorna partita esistente
        const partitaId = (this.partite[this.selectedIndex] as any).id;
        const { id, ...partitaData } = partita as any; // Rimuovi id dai dati da aggiornare
        await this.calendarioService.updatePartita(partitaId, partitaData);
      } else {
        // Aggiungi nuova partita
        await this.calendarioService.addPartita(partita);
      }
      this.closeModal();
      this.handleClose();
    } catch (error) {
      console.error('Errore nel salvataggio della partita:', error);
      alert('Errore nel salvataggio. Riprova.');
    }
  }

  handleClose(): void {
    this.selectedPartita = null;
    this.selectedIndex = null;
    this.isEditMode = false;
  }

  async eliminaPartita(index: number): Promise<void> {
    if (confirm('Sei sicuro di voler eliminare questa partita?')) {
      try {
        const partitaId = (this.partite[index] as any).id;
        await this.calendarioService.deletePartita(partitaId);
      } catch (error) {
        console.error('Errore nell\'eliminazione della partita:', error);
        alert('Errore nell\'eliminazione. Riprova.');
      }
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

  // Metodo per verificare se è una vittoria
  isVittoria(partita: Partita): boolean | null {
    if (!partita.risultato) return null;

    const risultatoSplit = partita.risultato.split('-');
    if (risultatoSplit.length !== 2) return null;

    const punteggioOspitante = parseInt(risultatoSplit[0].trim());
    const punteggioOspite = parseInt(risultatoSplit[1].trim());

    if (isNaN(punteggioOspitante) || isNaN(punteggioOspite)) return null;

    // Determina se i Thunders sono ospitanti o ospiti
    const thundersOspitanti = partita.ospitante.toLowerCase().includes('thunders');
    const thundersOspiti = partita.ospite.toLowerCase().includes('thunders');

    // Se i Thunders non sono né ospitanti né ospiti, ritorna null
    if (!thundersOspitanti && !thundersOspiti) return null;

    // Calcola se è vittoria in base a chi sono i Thunders
    if (thundersOspitanti) {
      return punteggioOspitante > punteggioOspite;
    } else {
      return punteggioOspite > punteggioOspitante;
    }
  }

  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        await this.parsePartiteFromFile(content);
      };
      reader.readAsText(file);
    }
  }

  private async parsePartiteFromFile(content: string): Promise<void> {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const partite = [];

    for (const line of lines) {
      const parts = line.split('///');
      if (parts.length >= 7) {
        const partita = {
          numeroGara: parseInt(parts[0]),
          data: this.parseDate(parts[1]),
          ora: parts[2],
          campionato: parts[3],
          indirizzo: parts[4],
          ospitante: parts[5],
          ospite: parts[6]
        };
        partite.push(partita);
      }
    }

    // Aggiungi le partite a Firestore
    try {
      for (const partita of partite) {
        await this.calendarioService.addPartita(partita);
      }
      alert(`${partite.length} partite caricate con successo!`);
    } catch (error) {
      console.error('Errore nel caricamento delle partite:', error);
      alert('Errore nel caricamento. Riprova.');
    }
  }

  private parseDate(dateString: string): string {
    // Converte "Gio 20/11/2025" in formato ISO "2025-11-20"
    const datePart = dateString.split(' ')[1]; // "20/11/2025"
    const [day, month, year] = datePart.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  apriDialogRisultato(index: number) {
    this.selectedPartita = this.partite[index];
    if (this.dialogRisultatoComp) {
      this.dialogRisultatoComp.open();
    }
  }

  chiudiDialogRisultato() {}

  async salvaRisultato(valori: { ospitante: number; ospite: number }): Promise<void> {
    if (this.selectedPartita == null) {
      return;
    }
    if (
      valori.ospitante < 0 || valori.ospitante > 3 ||
      valori.ospite < 0 || valori.ospite > 3
    ) {
      return;
    }

    try {
      this.selectedPartita.risultato = `${valori.ospitante}-${valori.ospite}`;
      const partitaId = (this.selectedPartita as any).id;
      const { id, ...partitaData } = this.selectedPartita as any;
      await this.calendarioService.updatePartita(partitaId, partitaData);
    } catch (error) {
      console.error('Errore nel salvataggio del risultato:', error);
      alert('Errore nel salvataggio. Riprova.');
    }
  }

  openMaps(indirizzo: string): void {
    const encodedAddress = encodeURIComponent(indirizzo);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `https://maps.google.com/?q=${encodedAddress}`;
    } else {
      window.open(`https://www.google.com/maps?q=${encodedAddress}`, '_blank');
    }
  }

  async creaListaGara(index: number): Promise<void> {
    try {
      const partita = this.partite[index];
      await this.pdfService.generaListaGara(partita);
    } catch (error) {
      console.error('Errore nella generazione del PDF:', error);
      alert('Errore nella generazione del PDF. Riprova più tardi.');
    }
  }

}
