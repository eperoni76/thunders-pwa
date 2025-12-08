import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { GiocatoriService } from '../../service/giocatori.service';
import { Giocatore } from '../../model/giocatore';

@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.component.html',
  styleUrls: ['./profilo.component.css']
})
export class ProfiloComponent implements OnInit {
  currentUser: Giocatore | null = null;
  isEditMode = false;
  editedUser: Giocatore | null = null;

  constructor(
    private authService: AuthService,
    private giocatoriService: GiocatoriService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.editedUser = { ...user };
      }
    });
  }

  toggleEditMode(): void {
    if (this.isEditMode && this.currentUser) {
      this.editedUser = { ...this.currentUser };
    }
    this.isEditMode = !this.isEditMode;
  }

  async saveChanges(): Promise<void> {
    if (this.editedUser && this.currentUser) {
      try {
        // L'id è stato aggiunto da Firestore quando il giocatore è stato recuperato
        const giocatoreId = (this.editedUser as any).id;
        if (!giocatoreId) {
          alert('Impossibile salvare: ID giocatore non trovato');
          return;
        }
        
        await this.giocatoriService.updateGiocatore(giocatoreId, this.editedUser);
        // Update current user in auth service
        localStorage.setItem('currentUser', JSON.stringify(this.editedUser));
        this.currentUser = this.editedUser;
        this.isEditMode = false;
        alert('Dati aggiornati con successo!');
      } catch (error) {
        console.error('Errore durante il salvataggio:', error);
        alert('Errore durante il salvataggio dei dati');
      }
    }
  }

  cancelEdit(): void {
    if (this.currentUser) {
      this.editedUser = { ...this.currentUser };
    }
    this.isEditMode = false;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Non specificata';
    
    // Se la data è in formato YYYY-MM-DD, convertila in formato italiano DD/MM/YYYY
    if (date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    
    // Se è già in formato DD/MM/YYYY o altro, restituiscila così com'è
    return date;
  }
}
