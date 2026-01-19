import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalendarioService } from '../../service/calendario.service';
import { PdfService } from '../../service/pdf.service';
import { Partita } from '../../model/partita';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { GenericUtils } from '../../utils/generic-utils';
import { Costanti } from 'src/app/utils/costanti';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit, OnDestroy {

  partite: Partita[] = [];
  filteredPartite: Partita[] = [];
  lastUpdate: Date | null = null;
  season: string = '';
  private partiteSubscription?: Subscription;

  // Filtri per colonna
  filters = {
    numeroGara: '',
    data: '',
    ora: '',
    campionato: '',
    indirizzo: '',
    ospitante: '',
    ospite: '',
    risultato: ''
  };

  // Ordinamento
  sortColumn: string = 'data';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private calendarioService: CalendarioService,
    private pdfService: PdfService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.partiteSubscription = this.calendarioService.getPartiteWithMetadataObservable().subscribe(
      data => {
        this.partite = data.partite || [];
        this.lastUpdate = data.lastUpdate;
        this.season = data.season;
        this.applyFilters();
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

  get campionato(): string {
    return this.partite.length > 0 ? this.partite[0].campionato : '';
  }

  get partiteOrdinateEFiltrate(): Partita[] {
    return this.filteredPartite;
  }

  applyFilters(): void {
    let result = [...this.partite];

    // Applica filtri
    Object.keys(this.filters).forEach(key => {
      const filterValue = (this.filters as any)[key].toLowerCase().trim();
      if (filterValue) {
        result = result.filter(item => {
          let value = (item as any)[key];
          if (key === 'data' && value) {
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
      let aVal = (a as any)[this.sortColumn];
      let bVal = (b as any)[this.sortColumn];

      // Gestione date
      if (this.sortColumn === 'data') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      // Gestione numeri
      else if (this.sortColumn === 'numeroGara') {
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

    this.filteredPartite = result;
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
      numeroGara: '',
      data: '',
      ora: '',
      campionato: '',
      indirizzo: '',
      ospitante: '',
      ospite: '',
      risultato: ''
    };
    this.applyFilters();
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

  openMaps(indirizzo: string): void {
    GenericUtils.openMaps(indirizzo);
  }

  async creaListaGara(index: number): Promise<void> {
    try {
      const partita = this.filteredPartite[index];
      await this.pdfService.generaListaGara(partita);
    } catch (error) {
      console.error('Errore nella generazione del PDF:', error);
      alert('Errore nella generazione del PDF. Riprova più tardi.');
    }
  }

  aggiungiAlCalendario(index: number): void {
    const partita = this.filteredPartite[index];

    const dataPartita = new Date(partita.data);
    const [ore, minuti] = partita.ora.split(':');
    dataPartita.setHours(parseInt(ore), parseInt(minuti), 0, 0);

    const dataFine = new Date(dataPartita);
    dataFine.setHours(dataPartita.getHours() + 2);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };
    
    const dtStart = formatDate(dataPartita);
    const dtEnd = formatDate(dataFine);
    const dtStamp = formatDate(new Date());
    
    const icsContent = GenericUtils.getIcsConstants(dtStart, dtEnd, dtStamp, partita);
    
    if (Costanti.isMobile) {
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
    
      window.location.href = url;
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `partita-${partita.numeroGara}.ics`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  formatDataCompleta(dataString: string): string {
    return GenericUtils.formatDateWithDay(dataString);
  }
}
