import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClassificaService } from '../../service/classifica.service';
import { TeamStanding, StandingsData } from '../../model/classifica';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-classifica',
  templateUrl: './classifica.component.html',
  styleUrls: ['./classifica.component.css']
})
export class ClassificaComponent implements OnInit, OnDestroy {

  classifica: TeamStanding[] = [];
  standingsData: StandingsData | null = null;
  lastUpdate: Date | null = null;
  season: string = '';
  
  private standingsSubscription?: Subscription;

  constructor(private classificaService: ClassificaService) { }

  ngOnInit(): void {
    this.standingsSubscription = this.classificaService.getStandingsDataObservable().subscribe(
      data => {
        if (data) {
          this.standingsData = data;
          this.classifica = data.standings || [];
          this.lastUpdate = data.lastUpdate;
          this.season = data.season;
          
          // Ordina per punti in modo decrescente
          this.classifica.sort((a, b) => (b.punti || 0) - (a.punti || 0));
        } else {
          this.classifica = [];
          this.lastUpdate = null;
          this.season = '';
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.standingsSubscription) {
      this.standingsSubscription.unsubscribe();
    }
  }

  /**
   * Verifica se una squadra è quella dei Thunders
   */
  isThunders(squadra: TeamStanding): boolean {
    return squadra.squadra?.toLowerCase().includes('thunders') || false;
  }
}

