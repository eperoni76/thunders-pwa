import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { CalendarioService } from '../../service/calendario.service';
import { AllenamentiService } from '../../service/allenamenti.service';
import { Allenamento } from '../../model/allenamento';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  ultimiRisultati: any[] = [];
  prossimiAppuntamenti: any[] = [];
  allenamenti: Allenamento[] = [];

  constructor(
    public authService: AuthService,
    private calendarioService: CalendarioService,
    private allenamentiService: AllenamentiService
  ) {}

  ngOnInit(): void {
    // Carica allenamenti
    this.allenamentiService.getAllenamenti().subscribe(allenamenti => {
      this.allenamenti = allenamenti;
    });

    this.calendarioService.getPartiteObservable().subscribe(partite => {
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);

      // Filtra partite già giocate con risultato
      const partiteGiocate = partite
        .filter(p => {
          if (!p.data) return false;
          const dataPartita = this.parseDataPartita(p.data);
          if (!dataPartita) return false;
          dataPartita.setHours(0, 0, 0, 0);
          return p.risultato && dataPartita < oggi;
        })
        .sort((a, b) => {
          const dateA = this.parseDataPartita(a.data);
          const dateB = this.parseDataPartita(b.data);
          if (!dateA || !dateB) return 0;
          return dateB.getTime() - dateA.getTime();
        });
      
      this.ultimiRisultati = partiteGiocate.slice(0, 3);

      // Filtra partite future
      const partiteFuture = partite
        .filter(p => {
          if (!p.data) return false;
          const dataPartita = this.parseDataPartita(p.data);
          if (!dataPartita) return false;
          dataPartita.setHours(0, 0, 0, 0);
          return dataPartita >= oggi && !p.risultato;
        })
        .sort((a, b) => {
          const dateA = this.parseDataPartita(a.data);
          const dateB = this.parseDataPartita(b.data);
          if (!dateA || !dateB) return 0;
          return dateA.getTime() - dateB.getTime();
        });
      
      this.prossimiAppuntamenti = partiteFuture.slice(0, 3);
    });
  }

  /**
   * Parse date string (supports both ISO format yyyy-MM-dd and legacy format)
   */
  private parseDataPartita(dataStr: string): Date | null {
    if (!dataStr) return null;
    
    try {
      // Try ISO format first (yyyy-MM-dd)
      if (dataStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(dataStr);
      }
      
      // Legacy format: "Gio 20/11" or "20/11"
      // Extract day/month and assume current season
      const parts = dataStr.split(' ');
      const datePart = parts.length > 1 ? parts[1] : parts[0];
      const [giorno, mese] = datePart.split('/').map(n => parseInt(n));
      
      if (isNaN(giorno) || isNaN(mese)) return null;
      
      // Determine year based on season
      const oggi = new Date();
      const annoCorrente = oggi.getFullYear();
      const meseCorrente = oggi.getMonth() + 1;
      
      let anno = annoCorrente;
      if (meseCorrente >= 9 && mese <= 8) {
        anno = annoCorrente + 1;
      } else if (meseCorrente <= 8 && mese >= 9) {
        anno = annoCorrente - 1;
      }
      
      return new Date(anno, mese - 1, giorno);
    } catch (e) {
      console.warn('Error parsing date:', dataStr, e);
      return null;
    }
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }

  isVittoria(partita: any): boolean {
    if (!partita.risultato) return false;
    const [set1, set2] = partita.risultato.split('-').map((s: string) => parseInt(s.trim()));
    
    // Verifica se i Thunders sono ospitanti o ospiti
    const thundersOspitanti = partita.ospitante.toLowerCase().includes('thunders');
    
    // Se Thunders sono ospitanti, set1 è il loro punteggio, altrimenti set2
    if (thundersOspitanti) {
      return set1 > set2;
    } else {
      return set2 > set1;
    }
  }

  formatData(dataStr: string): string {
    const data = this.parseDataPartita(dataStr);
    if (!data) return dataStr;
    
    const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const giorno = data.getDate().toString().padStart(2, '0');
    const mese = (data.getMonth() + 1).toString().padStart(2, '0');
    const anno = data.getFullYear();
    const nomGiorno = giorni[data.getDay()];
    
    return `${nomGiorno} ${giorno}/${mese}/${anno}`;
  }

  formatDataBreve(dataStr: string): string {
    const data = this.parseDataPartita(dataStr);
    if (!data) return dataStr;
    
    const giorno = data.getDate().toString().padStart(2, '0');
    const mese = (data.getMonth() + 1).toString().padStart(2, '0');
    const anno = data.getFullYear();
    
    return `${giorno}/${mese}/${anno}`;
  }
}
