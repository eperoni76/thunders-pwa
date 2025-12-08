import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, doc, getDoc } from '@angular/fire/firestore';
import { Observable, firstValueFrom, map } from 'rxjs';
import { StandingsData, TeamStanding } from '../model/classifica';

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
            // Assumiamo che ci sia un solo documento con i dati della classifica
            const data = docs[0];
            return {
              lastUpdate: data.lastUpdate?.toDate ? data.lastUpdate.toDate() : new Date(data.lastUpdate),
              season: data.season,
              standings: data.standings || []
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
   * Ottiene solo l'array delle squadre in classifica (Observable)
   * Ordinata per punti in modo decrescente
   */
  getClassificaObservable(): Observable<TeamStanding[]> {
    return this.getStandingsDataObservable().pipe(
      map(data => {
        if (data && data.standings) {
          // Ordina per punti in modo decrescente
          return [...data.standings].sort((a, b) => (b.punti || 0) - (a.punti || 0));
        }
        return [];
      })
    );
  }

  /**
   * Ottiene solo l'array delle squadre in classifica (Promise)
   */
  async getClassifica(): Promise<TeamStanding[]> {
    return await firstValueFrom(this.getClassificaObservable());
  }
}
