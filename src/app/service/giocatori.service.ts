import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { Giocatore } from '../model/giocatore';

@Injectable({
  providedIn: 'root'
})
export class GiocatoriService {

  private collectionName = 'giocatori';

  constructor(private firestore: Firestore) { }

  /**
   * Ottiene tutti i giocatori da Firestore (Observable)
   */
  getGiocatoriObservable(): Observable<any[]> {
    const giocatoriCollection = collection(this.firestore, this.collectionName);
    const giocatoriQuery = query(giocatoriCollection, orderBy('numeroMaglia', 'asc'));
    return collectionData(giocatoriQuery, { idField: 'id' });
  }

  /**
   * Ottiene tutti i giocatori da Firestore (Promise)
   */
  async getGiocatori(): Promise<any[]> {
    return await firstValueFrom(this.getGiocatoriObservable());
  }

  /**
   * Aggiunge un giocatore a Firestore
   */
  async addGiocatore(giocatore: any): Promise<void> {
    const giocatoriCollection = collection(this.firestore, this.collectionName);
    await addDoc(giocatoriCollection, giocatore);
  }

  /**
   * Aggiorna un giocatore in Firestore
   */
  async updateGiocatore(id: string, giocatore: any): Promise<void> {
    const giocatoreDoc = doc(this.firestore, this.collectionName, id);
    await updateDoc(giocatoreDoc, giocatore);
  }

  /**
   * Elimina un giocatore da Firestore
   */
  async deleteGiocatore(id: string): Promise<void> {
    const giocatoreDoc = doc(this.firestore, this.collectionName, id);
    await deleteDoc(giocatoreDoc);
  }

  /**
   * Aggiunge multipli giocatori a Firestore
   */
  async addMultipleGiocatori(giocatori: any[]): Promise<void> {
    const giocatoriCollection = collection(this.firestore, this.collectionName);

    for (const giocatore of giocatori) {
      await addDoc(giocatoriCollection, giocatore);
    }
  }

  /**
   * Migra dati da localStorage a Firestore (usa solo una volta)
   */
  async migrateFromLocalStorage(): Promise<void> {
    const localData = localStorage.getItem('giocatori');
    if (localData) {
      const giocatori = JSON.parse(localData);
      await this.addMultipleGiocatori(giocatori);
      console.log(`Migrati ${giocatori.length} giocatori da localStorage a Firestore`);
    }
  }
}
