import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { Classifica } from '../model/classifica';

@Injectable({
  providedIn: 'root'
})
export class ClassificaService {

  private collectionName = 'classifica';

  constructor(private firestore: Firestore) { }

  /**
   * Ottiene la classifica da Firestore (Observable)
   * Ordinata per punti in modo decrescente
   */
  getClassificaObservable(): Observable<Classifica[]> {
    const classificaCollection = collection(this.firestore, this.collectionName);
    const classificaQuery = query(classificaCollection, orderBy('punti', 'desc'));
    return collectionData(classificaQuery, { idField: 'id' }) as Observable<Classifica[]>;
  }

  /**
   * Ottiene la classifica da Firestore (Promise)
   */
  async getClassifica(): Promise<Classifica[]> {
    return await firstValueFrom(this.getClassificaObservable());
  }
}
