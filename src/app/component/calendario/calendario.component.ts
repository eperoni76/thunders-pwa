import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CalendarioService } from '../../service/calendario.service';
import { PdfService } from '../../service/pdf.service';
import { Partita } from '../../model/partita';
import { DialogRisultatoComponent } from '../dialog-risultato/dialog-risultato.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth.service';

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
    private pdfService: PdfService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.partiteSubscription = this.calendarioService.getPartiteObservable().subscribe(
      partite => {
        this.partite = partite;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.partiteSubscription) {
      this.partiteSubscription.unsubscribe();
    }
  }

  get partiteRimanenti(): number {
    return this.partite.filter(p => !p.risultato || p.risultato.trim() === '').length;
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
        const partitaId = (this.partite[this.selectedIndex] as any).id;
        const { id, ...partitaData } = partita as any;
        await this.calendarioService.updatePartita(partitaId, partitaData);
      } else {
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

  isVittoria(partita: Partita): boolean | null {
    if (!partita.risultato) return null;

    const risultatoSplit = partita.risultato.split('-');
    if (risultatoSplit.length !== 2) return null;

    const punteggioOspitante = parseInt(risultatoSplit[0].trim());
    const punteggioOspite = parseInt(risultatoSplit[1].trim());

    if (isNaN(punteggioOspitante) || isNaN(punteggioOspite)) return null;

    const thundersOspitanti = partita.ospitante.toLowerCase().includes('thunders');
    const thundersOspiti = partita.ospite.toLowerCase().includes('thunders');

    if (!thundersOspitanti && !thundersOspiti) return null;

    if (thundersOspitanti) {
      return punteggioOspitante > punteggioOspite;
    } else {
      return punteggioOspite > punteggioOspitante;
    }
  }

  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Seleziona un file JSON valido.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!Array.isArray(data)) {
          alert('Il file JSON deve contenere un array di partite.');
          event.target.value = '';
          return;
        }

        await this.parsePartiteFromJSON(data);
        event.target.value = '';
      } catch (err) {
        console.error('Errore nel parsing del file JSON:', err);
        alert('Errore nel parsing del file JSON. Assicurati che il formato sia corretto.');
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  }

  private async parsePartiteFromJSON(data: any[]): Promise<void> {
    const partite = [];

    for (const item of data) {
      if (item.numeroGara && item.data && item.ora && item.campionato &&
          item.indirizzo && item.ospitante && item.ospite) {
        const partita = {
          numeroGara: parseInt(item.numeroGara),
          data: item.data,
          ora: item.ora,
          campionato: item.campionato,
          indirizzo: item.indirizzo,
          ospitante: item.ospitante,
          ospite: item.ospite,
          risultato: item.risultato || ''
        };
        partite.push(partita);
      }
    }

    if (partite.length > 0) {
      try {
        for (const partita of partite) {
          await this.calendarioService.addPartita(partita);
        }
        alert(`${partite.length} partite caricate con successo!`);
      } catch (error) {
        console.error('Errore nel caricamento delle partite:', error);
        alert('Errore nel caricamento. Riprova.');
      }
    } else {
      alert('Nessuna partita valida trovata nel file');
    }
  }

  exportToJSON(): void {
    if (this.partite.length === 0) {
      alert('Nessuna partita da esportare.');
      return;
    }

    const partiteToExport = this.partite.map(p => {
      const { id, ...partitaData } = p as any;
      return partitaData;
    });

    const dataStr = JSON.stringify(partiteToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;

    const today = new Date().toISOString().split('T')[0];
    link.download = `partite_${today}.json`;

    link.click();
    window.URL.revokeObjectURL(url);
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
