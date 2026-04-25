import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClassificaService } from '../../service/classifica.service';
import { TeamStanding, StandingsData, SingleStandings } from '../../model/classifica';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-classifica',
  templateUrl: './classifica.component.html',
  styleUrls: ['./classifica.component.css']
})
export class ClassificaComponent implements OnInit, OnDestroy {

  standingsData: StandingsData | null = null;
  campionati: string[] = [];
  selectedCampionato: string = '';
  classifica: TeamStanding[] = [];
  lastUpdate: Date | null = null;
  season: string = '';
  
  private standingsSubscription?: Subscription;

  constructor(private classificaService: ClassificaService) { }

  ngOnInit(): void {
    this.standingsSubscription = this.classificaService.getStandingsDataObservable().subscribe(
      data => {
        if (data) {
          this.standingsData = data;
          this.lastUpdate = data.lastUpdate;
          this.season = data.season;
          
          if (data.classifiche && data.classifiche.length > 0) {
            this.campionati = data.classifiche.map(c => c.nomeCampionato);
            if (!this.selectedCampionato || !this.campionati.includes(this.selectedCampionato)) {
              this.selectedCampionato = this.campionati[0];
            }
            this.loadClassificaForCampionato(this.selectedCampionato);
          } else if (data.standings && data.standings.length > 0) {
            this.campionati = [];
            this.selectedCampionato = '';
            this.classifica = [...data.standings].sort((a, b) => (b.punti || 0) - (a.punti || 0));
          } else {
            this.classifica = [];
          }
        } else {
          this.classifica = [];
          this.campionati = [];
          this.lastUpdate = null;
          this.season = '';
        }
      }
    );
  }

  private loadClassificaForCampionato(campionato: string): void {
    this.classificaService.getClassificaByCampionatoObservable(campionato).subscribe(
      classifica => {
        this.classifica = classifica;
      }
    );
  }

  setSelectedCampionato(campionato: string): void {
    this.selectedCampionato = campionato;
    this.loadClassificaForCampionato(campionato);
  }

  ngOnDestroy(): void {
    if (this.standingsSubscription) {
      this.standingsSubscription.unsubscribe();
    }
  }

  isThunders(squadra: TeamStanding): boolean {
    return squadra.squadra?.toLowerCase().includes('thunders') || false;
  }

  get showChips(): boolean {
    return this.campionati.length > 1;
  }
}