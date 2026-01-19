import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject, listAll, StorageReference } from '@angular/fire/storage';
import { Firestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map, switchMap } from 'rxjs';
import { Modulo } from '../model/modulo';

@Injectable({
  providedIn: 'root'
})
export class ModuliService {

  private readonly STORAGE_PATH = 'moduli';
  private readonly COLLECTION_NAME = 'moduli';

  constructor(
    private storage: Storage,
    private firestore: Firestore
  ) { }

  /**
   * Carica un file su Firebase Storage e salva i metadata su Firestore
   */
  async caricaModulo(file: File, nomeVisibile: string, caricatoDa: string): Promise<void> {
    // Genera un nome file unico con timestamp
    const timestamp = Date.now();
    const nomeFileSicuro = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const percorsoFile = `${this.STORAGE_PATH}/${timestamp}_${nomeFileSicuro}`;
    
    // Upload su Storage
    const storageRef = ref(this.storage, percorsoFile);
    await uploadBytes(storageRef, file);
    
    // Ottieni URL di download
    const url = await getDownloadURL(storageRef);
    
    // Salva metadata su Firestore
    const moduloData: Omit<Modulo, 'id'> = {
      nome: nomeVisibile,
      nomeFile: file.name,
      url: url,
      dataCaricamento: new Date(),
      dimensione: file.size,
      tipo: file.type,
      caricatoDa: caricatoDa
    };
    
    const moduliCollection = collection(this.firestore, this.COLLECTION_NAME);
    await addDoc(moduliCollection, {
      ...moduloData,
      dataCaricamento: Timestamp.fromDate(moduloData.dataCaricamento)
    });
  }

  /**
   * Ottiene tutti i moduli da Firestore
   */
  getModuli(): Observable<Modulo[]> {
    const moduliCollection = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(moduliCollection, orderBy('dataCaricamento', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nome: data['nome'],
            nomeFile: data['nomeFile'],
            url: data['url'],
            dataCaricamento: data['dataCaricamento'].toDate(),
            dimensione: data['dimensione'],
            tipo: data['tipo'],
            caricatoDa: data['caricatoDa']
          } as Modulo;
        });
      })
    );
  }

  /**
   * Elimina un modulo da Storage e da Firestore
   */
  async eliminaModulo(modulo: Modulo): Promise<void> {
    if (!modulo.id) {
      throw new Error('ID modulo non valido');
    }

    // Elimina da Firestore
    const moduloDoc = doc(this.firestore, this.COLLECTION_NAME, modulo.id);
    await deleteDoc(moduloDoc);

    // Elimina da Storage (estrae il path dall'URL)
    try {
      const pathMatch = modulo.url.match(/o\/(.*?)\?/);
      if (pathMatch && pathMatch[1]) {
        const decodedPath = decodeURIComponent(pathMatch[1]);
        const storageRef = ref(this.storage, decodedPath);
        await deleteObject(storageRef);
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del file da Storage:', error);
    }
  }

  /**
   * Formatta la dimensione del file in formato leggibile
   */
  formattaDimensione(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Scarica un file
   */
  scaricaModulo(modulo: Modulo): void {
    const link = document.createElement('a');
    link.href = modulo.url;
    link.download = modulo.nomeFile;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
