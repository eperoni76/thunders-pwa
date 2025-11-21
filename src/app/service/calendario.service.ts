import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {

  private collectionName = 'partite';

  constructor(private firestore: Firestore) { }

  /**
   * Ottiene tutte le partite da Firestore (Observable)
   */
  getPartiteObservable(): Observable<any[]> {
    const partiteCollection = collection(this.firestore, this.collectionName);
    const partiteQuery = query(partiteCollection, orderBy('numeroGara', 'asc'));
    return collectionData(partiteQuery, { idField: 'id' });
  }

  /**
   * Ottiene tutte le partite da Firestore (Promise)
   */
  async getPartite(): Promise<any[]> {
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
