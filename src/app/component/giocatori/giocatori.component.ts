import {Component, OnInit, OnDestroy} from '@angular/core';
import {GiocatoriService} from "../../service/giocatori.service";
import {Subscription} from 'rxjs';
import {GenericUtils} from "../../utils/generic-utils";
import {AuthService} from "../../service/auth.service";

declare var bootstrap: any;

@Component({
  selector: 'app-giocatori',
  templateUrl: './giocatori.component.html',
  styleUrls: ['./giocatori.component.css']
})
export class GiocatoriComponent implements OnInit, OnDestroy {

  giocatori: any[] = [];
  filteredGiocatori: any[] = [];
  selectedGiocatore: any = null;
  isEditMode: boolean = false;
  private giocatoriSubscription?: Subscription;

  // Filtri per colonna
  filters = {
    numeroMaglia: '',
    cognome: '',
    nome: '',
    dataDiNascita: '',
    ruolo: '',
    tesseraUisp: '',
    codiceFiscale: '',
    profilo: '',
    email: '',
    tagliaDivisa: '',
    scadenzaCertificatoMedico: ''
  };

  // Ordinamento
  sortColumn: string = 'cognome';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private giocatoriService: GiocatoriService
  ) { }

  ngOnInit(): void {
    this.giocatoriSubscription = this.giocatoriService.getGiocatoriObservable().subscribe(
      giocatori => {
        this.giocatori = giocatori;
        this.applyFilters();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.giocatoriSubscription) {
      this.giocatoriSubscription.unsubscribe();
    }
  }

  get giocatoriOrdinati(): any[] {
    return this.filteredGiocatori;
  }

  applyFilters(): void {
    let result = [...this.giocatori];

    // Applica filtri
    Object.keys(this.filters).forEach(key => {
      const filterValue = (this.filters as any)[key].toLowerCase().trim();
      if (filterValue) {
        result = result.filter(item => {
          let value = item[key];
          if (key === 'dataDiNascita' && value) {
            // Formatta la data per il filtro
            const date = new Date(value);
            value = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          }
          return value?.toString().toLowerCase().includes(filterValue);
        });
      }
    });

    // Applica ordinamento
    result.sort((a, b) => {
      let aVal = a[this.sortColumn];
      let bVal = b[this.sortColumn];

      // Gestione date
      if (this.sortColumn === 'dataDiNascita' || this.sortColumn === 'scadenzaCertificatoMedico') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      // Gestione numeri
      else if (this.sortColumn === 'numeroMaglia') {
        aVal = parseInt(aVal) || 0;
        bVal = parseInt(bVal) || 0;
      }
      // Gestione stringhe
      else {
        aVal = aVal?.toString().toLowerCase() || '';
        bVal = bVal?.toString().toLowerCase() || '';
      }

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredGiocatori = result;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      numeroMaglia: '',
      cognome: '',
      nome: '',
      dataDiNascita: '',
      ruolo: '',
      tesseraUisp: '',
      codiceFiscale: '',
      profilo: '',
      email: '',
      tagliaDivisa: '',
      scadenzaCertificatoMedico: ''
    };
    this.applyFilters();
  }

  get numeroGiocatori(): number {
    return this.giocatori.filter(g => {
      const ruolo = (g.ruolo || '').toLowerCase();
      return !ruolo.includes('allenatore') && !ruolo.includes('dirigente');
    }).length;
  }

  get etaMedia(): number {
    const giocatoriConEta = this.giocatori.filter(g => {
      const ruolo = (g.ruolo || '').toLowerCase();
      return g.dataDiNascita && !ruolo.includes('allenatore') && !ruolo.includes('dirigente');
    });

    if (giocatoriConEta.length === 0) return 0;

    const sommaEta = giocatoriConEta.reduce((sum, g) => {
      const nascita = new Date(g.dataDiNascita);
      const oggi = new Date();
      let eta = oggi.getFullYear() - nascita.getFullYear();
      const meseDiff = oggi.getMonth() - nascita.getMonth();
      if (meseDiff < 0 || (meseDiff === 0 && oggi.getDate() < nascita.getDate())) {
        eta--;
      }
      return sum + eta;
    }, 0);

    return Math.round(sommaEta / giocatoriConEta.length);
  }

  get nomeCapitano(): string {
    const capitano = this.giocatori.find(g => g.capitano === true);
    if (!capitano) return '';
    
    const capitalize = (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    
    const nome = capitalize(capitano.nome || '');
    const cognome = capitalize(capitano.cognome || '');
    return `${nome} ${cognome}`.trim();
  }

  getCertificatoClass(scadenza: string | undefined): string {
    if (!scadenza) return '';
    
    const oggi = new Date();
    const dataScadenza = new Date(scadenza);
    const differenzaMs = dataScadenza.getTime() - oggi.getTime();
    const differenzaGiorni = Math.ceil(differenzaMs / (1000 * 60 * 60 * 24));
    
    if (differenzaGiorni > 30) {
      return 'badge bg-success';
    } else if (differenzaGiorni > 14) {
      return 'badge bg-warning text-dark';
    } else {
      return 'badge bg-danger';
    }
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
        const giocatoreId = this.selectedGiocatore.id;
        const { id, ...giocatoreData } = giocatore;
        await this.giocatoriService.updateGiocatore(giocatoreId, giocatoreData);
      } else {
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
          alert('Il file JSON deve contenere un array di giocatori.');
          event.target.value = '';
          return;
        }

        const currentGiocatori = await this.giocatoriService.getGiocatori();
        const newGiocatori: any[] = [];
        let skippedCount = 0;

        data.forEach((giocatore: any) => {
          const nome = (giocatore.nome || '').toLowerCase();
          const cognome = (giocatore.cognome || '').toLowerCase();
          const exists = currentGiocatori.some(g =>
            g.nome.toLowerCase() === nome && g.cognome.toLowerCase() === cognome
          );

          if (!exists) {
            newGiocatori.push({
              ...giocatore,
              nome: nome,
              cognome: cognome,
              capitano: giocatore.capitano || false
            });
          } else {
            skippedCount++;
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
      } catch (err) {
        console.error('Errore nel parsing del file JSON:', err);
        alert('Errore nel parsing del file JSON. Assicurati che il formato sia corretto.');
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  }

  exportToJSON(): void {
    if (this.giocatori.length === 0) {
      alert('Nessun giocatore da esportare.');
      return;
    }

    const giocatoriToExport = this.giocatori.map(g => {
      const { id, ...giocatoreData } = g as any;
      return giocatoreData;
    });

    const dataStr = JSON.stringify(giocatoriToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;

    const today = new Date().toISOString().split('T')[0];
    link.download = `giocatori_${today}.json`;

    link.click();
    window.URL.revokeObjectURL(url);
  }

}
