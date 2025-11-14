import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {

  private storageKey: string = 'partite';

  constructor() { }

  getPartite(): any[] {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  setPartite(partite: any[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(partite));
  }

  addPartita(partita: any) {
    const partite = this.getPartite();
    partite.push(partita);
    this.setPartite(partite);
  }

  deletePartita(id: number) {
    const partite = this.getPartite();
    this.setPartite(partite.filter(p => p.id !== id));
  }
}
