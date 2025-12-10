import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Allenamento } from '../model/allenamento';

@Injectable({
  providedIn: 'root'
})
export class AllenamentiService {
  private allenamentoCollection = collection(this.firestore, 'allenamenti');

  constructor(private firestore: Firestore) {}

  getAllenamenti(): Observable<Allenamento[]> {
    const q = query(this.allenamentoCollection, orderBy('ordinamento', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Allenamento[]>;
  }

  addAllenamento(allenamento: Allenamento): Promise<any> {
    return addDoc(this.allenamentoCollection, allenamento);
  }

  updateAllenamento(id: string, allenamento: Partial<Allenamento>): Promise<void> {
    const allenamentoDoc = doc(this.firestore, 'allenamenti', id);
    return updateDoc(allenamentoDoc, allenamento);
  }

  deleteAllenamento(id: string): Promise<void> {
    const allenamentoDoc = doc(this.firestore, 'allenamenti', id);
    return deleteDoc(allenamentoDoc);
  }
}
