import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { CalendarioService } from '../../service/calendario.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  ultimiRisultati: any[] = [];
  prossimiAppuntamenti: any[] = [];

  constructor(
    public authService: AuthService,
    private calendarioService: CalendarioService
  ) {}

  ngOnInit(): void {
    this.calendarioService.getPartiteObservable().subscribe(partite => {
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);

      // Filtra partite già giocate con risultato
      const partiteGiocate = partite
        .filter(p => {
          if (!p.data) return false;
          const dataPartita = new Date(p.data);
          dataPartita.setHours(0, 0, 0, 0);
          return p.risultato && dataPartita < oggi;
        })
        .sort((a, b) => {
          const dateA = new Date(a.data);
          const dateB = new Date(b.data);
          return dateB.getTime() - dateA.getTime();
        });
      
      this.ultimiRisultati = partiteGiocate.slice(0, 3);

      // Filtra partite future
      const partiteFuture = partite
        .filter(p => {
          if (!p.data) return false;
          const dataPartita = new Date(p.data);
          dataPartita.setHours(0, 0, 0, 0);
          return dataPartita >= oggi;
        })
        .sort((a, b) => {
          const dateA = new Date(a.data);
          const dateB = new Date(b.data);
          return dateA.getTime() - dateB.getTime();
        });
      
      this.prossimiAppuntamenti = partiteFuture.slice(0, 3);
    });
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
}
