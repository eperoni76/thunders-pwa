import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalendarioService } from '../../service/calendario.service';
import { PdfService } from '../../service/pdf.service';
import { Partita } from '../../model/partita';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth.service';

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
  sortColumn: string = 'numeroGara';
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
      const partita = this.filteredPartite[index];
      await this.pdfService.generaListaGara(partita);
    } catch (error) {
      console.error('Errore nella generazione del PDF:', error);
      alert('Errore nella generazione del PDF. Riprova più tardi.');
    }
  }

  aggiungiAlCalendario(index: number): void {
    const partita = this.filteredPartite[index];
    
    // Parsing della data e ora
    const dataPartita = new Date(partita.data);
    const [ore, minuti] = partita.ora.split(':');
    dataPartita.setHours(parseInt(ore), parseInt(minuti), 0, 0);
    
    // Data fine (assumiamo 2 ore di durata)
    const dataFine = new Date(dataPartita);
    dataFine.setHours(dataPartita.getHours() + 2);
    
    // Formattazione date per iCalendar (formato: YYYYMMDDTHHMMSS)
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
    
    // Creazione contenuto iCalendar
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PuntoVolley Thunders//Calendario//IT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `DTSTAMP:${dtStamp}`,
      `UID:partita-${partita.numeroGara}-${dtStamp}@thunders.it`,
      `SUMMARY:${partita.ospitante} vs ${partita.ospite}`,
      `DESCRIPTION:Partita ${partita.campionato}\\nGara n. ${partita.numeroGara}`,
      `LOCATION:${partita.indirizzo}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Partita tra 1 ora',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    // Controlla se è mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Su mobile, crea un data URL che iOS e Android possono aprire direttamente
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Apri direttamente (iOS e Android gestiranno il file)
      window.location.href = url;
      
      // Cleanup dopo un po'
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      // Su desktop, scarica il file
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
    if (!dataString) return '';
    
    try {
      // Converti la stringa ISO in Date
      const data = new Date(dataString);
      
      // Array dei giorni della settimana abbreviati
      const giorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
      
      // Ottieni il giorno della settimana
      const giornoSettimana = giorni[data.getDay()];
      
      // Ottieni giorno, mese e anno
      const giorno = String(data.getDate()).padStart(2, '0');
      const mese = String(data.getMonth() + 1).padStart(2, '0');
      const anno = data.getFullYear();
      
      // Restituisci nel formato "Sab 13/12/2025"
      return `${giornoSettimana} ${giorno}/${mese}/${anno}`;
    } catch (error) {
      return dataString; // Se c'è un errore, restituisci la stringa originale
    }
  }

}
