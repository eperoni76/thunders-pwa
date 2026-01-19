import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { CalendarioService } from '../../service/calendario.service';
import { AllenamentiService } from '../../service/allenamenti.service';
import { Allenamento } from '../../model/allenamento';
import { GenericUtils } from '../../utils/generic-utils';

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
          const dataPartita = GenericUtils.parseDataPartita(p.data);
          if (!dataPartita) return false;
          dataPartita.setHours(0, 0, 0, 0);
          return p.risultato && dataPartita < oggi;
        })
        .sort((a, b) => {
          const dateA = GenericUtils.parseDataPartita(a.data);
          const dateB = GenericUtils.parseDataPartita(b.data);
          if (!dateA || !dateB) return 0;
          return dateB.getTime() - dateA.getTime();
        });
      
      this.ultimiRisultati = partiteGiocate.slice(0, 3);

      // Filtra partite future
      const partiteFuture = partite
        .filter(p => {
          if (!p.data) return false;
          const dataPartita = GenericUtils.parseDataPartita(p.data);
          if (!dataPartita) return false;
          dataPartita.setHours(0, 0, 0, 0);
          return dataPartita >= oggi && !p.risultato;
        })
        .sort((a, b) => {
          const dateA = GenericUtils.parseDataPartita(a.data);
          const dateB = GenericUtils.parseDataPartita(b.data);
          if (!dateA || !dateB) return 0;
          return dateA.getTime() - dateB.getTime();
        });
      
      this.prossimiAppuntamenti = partiteFuture.slice(0, 3);
    });
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
    return GenericUtils.formatDateWithFullDay(GenericUtils.parseDataPartita(dataStr) || dataStr);
  }

  formatDataBreve(dataStr: string): string {
    return GenericUtils.formatDate(GenericUtils.parseDataPartita(dataStr) || dataStr);
  }

  openMaps(indirizzo: string): void {
    GenericUtils.openMaps(indirizzo);
  }
}
