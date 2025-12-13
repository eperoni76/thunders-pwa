import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable, firstValueFrom, map, combineLatest } from 'rxjs';
import { Partita } from '../model/partita';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {

  private collectionName = 'partite';
  private metadataCollectionName = 'partite-metadata';

  constructor(private firestore: Firestore) { }

  /**
   * Ottiene i metadati delle partite (lastUpdate, season)
   */
  getPartiteMetadataObservable(): Observable<any> {
    const metadataCollection = collection(this.firestore, this.metadataCollectionName);
    return (collectionData(metadataCollection, { idField: 'id' }) as Observable<any[]>)
      .pipe(
        map(docs => {
          if (docs && docs.length > 0) {
            const data = docs[0];
            return {
              lastUpdate: data.lastUpdate?.toDate ? data.lastUpdate.toDate() : new Date(data.lastUpdate),
              season: data.season
            };
          }
          return { lastUpdate: null, season: '' };
        })
      );
  }

  /**
   * Ottiene tutte le partite da Firestore (Observable)
   */
  getPartiteObservable(): Observable<Partita[]> {
    const partiteCollection = collection(this.firestore, this.collectionName);
    const partiteQuery = query(partiteCollection, orderBy('numeroGara', 'asc'));
    return collectionData(partiteQuery, { idField: 'id' }) as Observable<Partita[]>;
  }

  /**
   * Ottiene partite e metadati insieme
   */
  getPartiteWithMetadataObservable(): Observable<{ partite: Partita[], lastUpdate: Date | null, season: string }> {
    return combineLatest([
      this.getPartiteObservable(),
      this.getPartiteMetadataObservable()
    ]).pipe(
      map(([partite, metadata]) => ({
        partite,
        lastUpdate: metadata.lastUpdate,
        season: metadata.season
      }))
    );
  }

  /**
   * Ottiene tutte le partite da Firestore (Promise)
   */
  async getPartite(): Promise<Partita[]> {
    return await firstValueFrom(this.getPartiteObservable());
  }

  /**
   * Aggiunge una partita a Firestore
   */
  async addPartita(partita: any): Promise<void> {
    const partiteCollection = collection(this.firestore, this.collectionName);
    await addDoc(partiteCollection, partita);
  }

  /**
   * Aggiorna una partita in Firestore
   */
  async updatePartita(id: string, partita: any): Promise<void> {
    const partitaDoc = doc(this.firestore, this.collectionName, id);
    await updateDoc(partitaDoc, partita);
  }

  /**
   * Elimina una partita da Firestore
   */
  async deletePartita(id: string): Promise<void> {
    const partitaDoc = doc(this.firestore, this.collectionName, id);
    await deleteDoc(partitaDoc);
  }

}
