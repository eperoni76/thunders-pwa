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
  indiceProssimaPartita = 0;
  indiceUltimoRisultato = 0;
  prossimaPartitaTransitionClass = '';
  ultimoRisultatoTransitionClass = '';
  private touchStartX: number | null = null;
  private touchCurrentX: number | null = null;
  private resultsTouchStartX: number | null = null;
  private resultsTouchCurrentX: number | null = null;
  private readonly swipeThreshold = 45;
  private transitionResetTimer: ReturnType<typeof setTimeout> | null = null;
  private resultsTransitionResetTimer: ReturnType<typeof setTimeout> | null = null;

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

      this.ultimiRisultati = partiteGiocate;

      if (this.ultimiRisultati.length === 0) {
        this.indiceUltimoRisultato = 0;
      } else if (this.indiceUltimoRisultato > this.ultimiRisultati.length - 1) {
        this.indiceUltimoRisultato = this.ultimiRisultati.length - 1;
      }

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

      this.prossimiAppuntamenti = partiteFuture;

      if (this.prossimiAppuntamenti.length === 0) {
        this.indiceProssimaPartita = 0;
      } else if (this.indiceProssimaPartita > this.prossimiAppuntamenti.length - 1) {
        this.indiceProssimaPartita = this.prossimiAppuntamenti.length - 1;
      }
    });
  }

  get prossimaPartitaCorrente(): any | null {
    if (this.prossimiAppuntamenti.length === 0) {
      return null;
    }

    return this.prossimiAppuntamenti[this.indiceProssimaPartita] || null;
  }

  get ultimoRisultatoCorrente(): any | null {
    if (this.ultimiRisultati.length === 0) {
      return null;
    }

    return this.ultimiRisultati[this.indiceUltimoRisultato] || null;
  }

  prevProssimaPartita(): void {
    if (this.indiceProssimaPartita > 0) {
      this.indiceProssimaPartita--;
      this.playProssimaPartitaTransition('prev');
    }
  }

  nextProssimaPartita(): void {
    if (this.indiceProssimaPartita < this.prossimiAppuntamenti.length - 1) {
      this.indiceProssimaPartita++;
      this.playProssimaPartitaTransition('next');
    }
  }

  isPrimaProssimaPartita(): boolean {
    return this.indiceProssimaPartita === 0;
  }

  isUltimaProssimaPartita(): boolean {
    return this.indiceProssimaPartita >= this.prossimiAppuntamenti.length - 1;
  }

  vaiAProssimaPartita(index: number): void {
    if (index >= 0 && index < this.prossimiAppuntamenti.length) {
      const direction = index >= this.indiceProssimaPartita ? 'next' : 'prev';
      this.indiceProssimaPartita = index;
      this.playProssimaPartitaTransition(direction);
    }
  }

  prevUltimoRisultato(): void {
    if (this.indiceUltimoRisultato > 0) {
      this.indiceUltimoRisultato--;
      this.playUltimoRisultatoTransition('prev');
    }
  }

  nextUltimoRisultato(): void {
    if (this.indiceUltimoRisultato < this.ultimiRisultati.length - 1) {
      this.indiceUltimoRisultato++;
      this.playUltimoRisultatoTransition('next');
    }
  }

  isPrimoUltimoRisultato(): boolean {
    return this.indiceUltimoRisultato === 0;
  }

  isUltimoUltimoRisultato(): boolean {
    return this.indiceUltimoRisultato >= this.ultimiRisultati.length - 1;
  }

  getIndiceUltimoRisultatoVisuale(): number {
    return this.ultimiRisultati.length - this.indiceUltimoRisultato;
  }

  vaiAUltimoRisultato(index: number): void {
    if (index >= 0 && index < this.ultimiRisultati.length) {
      const direction = index >= this.indiceUltimoRisultato ? 'next' : 'prev';
      this.indiceUltimoRisultato = index;
      this.playUltimoRisultatoTransition(direction);
    }
  }

  private playProssimaPartitaTransition(direction: 'next' | 'prev'): void {
    if (this.transitionResetTimer) {
      clearTimeout(this.transitionResetTimer);
    }

    this.prossimaPartitaTransitionClass = '';

    setTimeout(() => {
      this.prossimaPartitaTransitionClass = direction === 'next'
        ? 'next-match-slide-in-left'
        : 'next-match-slide-in-right';

      this.transitionResetTimer = setTimeout(() => {
        this.prossimaPartitaTransitionClass = '';
      }, 280);
    }, 0);
  }

  onNextMatchTouchStart(event: TouchEvent): void {
    if (!event.touches.length) {
      return;
    }

    this.touchStartX = event.touches[0].clientX;
    this.touchCurrentX = this.touchStartX;
  }

  onNextMatchTouchMove(event: TouchEvent): void {
    if (!event.touches.length || this.touchStartX === null) {
      return;
    }

    this.touchCurrentX = event.touches[0].clientX;
  }

  onNextMatchTouchEnd(): void {
    if (this.touchStartX === null || this.touchCurrentX === null) {
      this.touchStartX = null;
      this.touchCurrentX = null;
      return;
    }

    const deltaX = this.touchCurrentX - this.touchStartX;

    if (Math.abs(deltaX) >= this.swipeThreshold) {
      if (deltaX < 0) {
        this.nextProssimaPartita();
      } else {
        this.prevProssimaPartita();
      }
    }

    this.touchStartX = null;
    this.touchCurrentX = null;
  }

  onResultTouchStart(event: TouchEvent): void {
    if (!event.touches.length) {
      return;
    }

    this.resultsTouchStartX = event.touches[0].clientX;
    this.resultsTouchCurrentX = this.resultsTouchStartX;
  }

  onResultTouchMove(event: TouchEvent): void {
    if (!event.touches.length || this.resultsTouchStartX === null) {
      return;
    }

    this.resultsTouchCurrentX = event.touches[0].clientX;
  }

  onResultTouchEnd(): void {
    if (this.resultsTouchStartX === null || this.resultsTouchCurrentX === null) {
      this.resultsTouchStartX = null;
      this.resultsTouchCurrentX = null;
      return;
    }

    const deltaX = this.resultsTouchCurrentX - this.resultsTouchStartX;

    if (Math.abs(deltaX) >= this.swipeThreshold) {
      if (deltaX < 0) {
        this.nextUltimoRisultato();
      } else {
        this.prevUltimoRisultato();
      }
    }

    this.resultsTouchStartX = null;
    this.resultsTouchCurrentX = null;
  }

  private playUltimoRisultatoTransition(direction: 'next' | 'prev'): void {
    if (this.resultsTransitionResetTimer) {
      clearTimeout(this.resultsTransitionResetTimer);
    }

    this.ultimoRisultatoTransitionClass = '';

    setTimeout(() => {
      this.ultimoRisultatoTransitionClass = direction === 'next'
        ? 'result-slide-in-left'
        : 'result-slide-in-right';

      this.resultsTransitionResetTimer = setTimeout(() => {
        this.ultimoRisultatoTransitionClass = '';
      }, 280);
    }, 0);
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

  getEsitoLabel(partita: any): string {
    return this.isVittoria(partita) ? 'Vittoria' : 'Sconfitta';
  }

  getAvversario(partita: any): string {
    const ospitante = partita?.ospitante || '';
    const ospite = partita?.ospite || '';
    const isThundersOspitante = ospitante.toLowerCase().includes('thunders');
    const isThundersOspite = ospite.toLowerCase().includes('thunders');

    if (isThundersOspitante && !isThundersOspite) {
      return ospite;
    }

    if (isThundersOspite && !isThundersOspitante) {
      return ospitante;
    }

    return `${ospitante} vs ${ospite}`;
  }

  getRuoloPartita(partita: any): string {
    const ospitante = partita?.ospitante || '';
    return ospitante.toLowerCase().includes('thunders') ? 'Casa' : 'Trasferta';
  }

  formatData(dataStr: string): string {
    return GenericUtils.formatDateWithFullDay(GenericUtils.parseDataPartita(dataStr) || dataStr);
  }

  formatDataBreve(dataStr: string): string {
    return GenericUtils.formatDate(GenericUtils.parseDataPartita(dataStr) || dataStr);
  }

  formatDataCompatta(dataStr: string): string {
    const data = GenericUtils.parseDataPartita(dataStr);

    if (!data) {
      return this.formatDataBreve(dataStr);
    }

    const weekday = new Intl.DateTimeFormat('it-IT', { weekday: 'short' })
      .format(data)
      .replace('.', '');
    const dayMonth = new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit'
    }).format(data);

    return `${weekday} ${dayMonth}`;
  }

  openMaps(indirizzo: string): void {
    GenericUtils.openMaps(indirizzo);
  }
}
