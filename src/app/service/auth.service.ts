import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GiocatoriService } from './giocatori.service';
import { Giocatore } from '../model/giocatore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'currentUser';
  private currentUserSubject: BehaviorSubject<Giocatore | null>;
  public currentUser: Observable<Giocatore | null>;

  constructor(private giocatoriService: GiocatoriService) {
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    this.currentUserSubject = new BehaviorSubject<Giocatore | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Giocatore | null {
    return this.currentUserSubject.value;
  }

  async login(codiceFiscale: string): Promise<boolean> {
    const giocatori = await this.giocatoriService.getGiocatori();
    const giocatore = giocatori.find(
      g => g.codiceFiscale && g.codiceFiscale.toUpperCase() === codiceFiscale.toUpperCase()
    );

    if (giocatore) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(giocatore));
      this.currentUserSubject.next(giocatore);
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  hasEditPermission(): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    return user.profilo === 'Amministratore' || user.profilo === 'Staff';
  }

  isCurrentUser(giocatore: Giocatore): boolean {
    const user = this.currentUserValue;
    if (!user || !giocatore) return false;
    return user.nome === giocatore.nome && user.cognome === giocatore.cognome;
  }

  updateCurrentUser(updatedUser: Giocatore): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
  }
}

