import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, firstValueFrom, map } from 'rxjs';
import { StandingsData, TeamStanding, SingleStandings } from '../model/classifica';

@Injectable({
  providedIn: 'root'
})
export class ClassificaService {

  private collectionName = 'classifica';

  constructor(private firestore: Firestore) { }

  /**
   * Ottiene i dati completi della classifica da Firebase
   * I dati sono salvati dal microservizio Java nella collection 'classifica'
   */
  getStandingsDataObservable(): Observable<StandingsData | null> {
    const classificaCollection = collection(this.firestore, this.collectionName);
    return (collectionData(classificaCollection, { idField: 'id' }) as Observable<any[]>)
      .pipe(
        map(docs => {
          if (docs && docs.length > 0) {
            const data = docs[0];
            return {
              lastUpdate: data.lastUpdate?.toDate ? data.lastUpdate.toDate() : new Date(data.lastUpdate),
              season: data.season,
              classifiche: data.classifiche || [],
              standings: data.standings || [] // Retrocompatibilità
            } as StandingsData;
          }
          return null;
        })
      );
  }

  /**
   * Ottiene i dati completi della classifica (Promise)
   */
  async getStandingsData(): Promise<StandingsData | null> {
    return await firstValueFrom(this.getStandingsDataObservable());
  }

  /**
   * Ottiene la lista dei campionati disponibili
   */
  getCampionatiObservable(): Observable<string[]> {
    return this.getStandingsDataObservable().pipe(
      map(data => {
        if (data && data.classifiche) {
          return data.classifiche.map(c => c.nomeCampionato);
        }
        return [];
      })
    );
  }

  /**
   * Ottiene la lista dei campionati disponibili (Promise)
   */
  async getCampionati(): Promise<string[]> {
    return await firstValueFrom(this.getCampionatiObservable());
  }

  /**
   * Ottiene le squadre di un campionato specifico (Observable)
   */
  getClassificaByCampionatoObservable(campionato: string): Observable<TeamStanding[]> {
    return this.getStandingsDataObservable().pipe(
      map(data => {
        if (data && data.classifiche) {
          const found = data.classifiche.find(c => c.nomeCampionato === campionato);
          if (found && found.standings) {
            return [...found.standings].sort((a, b) => (b.punti || 0) - (a.punti || 0));
          }
        }
        // Retrocompatibilità: se non ci sono classifiche multiple, usa la vecchia struttura
        if (data && data.standings) {
          return [...data.standings].sort((a, b) => (b.punti || 0) - (a.punti || 0));
        }
        return [];
      })
    );
  }

  /**
   * Ottiene le squadre di un campionato specifico (Promise)
   */
  async getClassificaByCampionato(campionato: string): Promise<TeamStanding[]> {
    return await firstValueFrom(this.getClassificaByCampionatoObservable(campionato));
  }
}