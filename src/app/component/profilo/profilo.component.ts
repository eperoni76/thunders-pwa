import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { GiocatoriService } from '../../service/giocatori.service';
import { Giocatore } from '../../model/giocatore';
import { GenericUtils } from '../../utils/generic-utils';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';

@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.component.html',
  styleUrls: ['./profilo.component.css']
})
export class ProfiloComponent implements OnInit {
  currentUser: Giocatore | null = null;
  isEditMode = false;
  editedUser: Giocatore | null = null;
  uploadingFoto = false;
  uploadingCertificato = false;
  isMobile = false;
  showFotoSourceDialog = false;
  showCertificatoSourceDialog = false;

  constructor(
    private authService: AuthService,
    private giocatoriService: GiocatoriService,
    private storage: Storage
  ) {}

  ngOnInit(): void {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
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
    return GenericUtils.formatDate(date);
  }

  onClickCaricaFoto(): void {
    if (this.isMobile) {
      // Usa setTimeout per evitare conflitti con altri event handler
      setTimeout(() => {
        this.showFotoSourceDialog = true;
      }, 0);
    } else {
      // Desktop: apri direttamente il file picker
      const input = document.getElementById('fotoInputGallery') as HTMLInputElement;
      input?.click();
    }
  }

  onClickCaricaCertificato(): void {
    if (this.isMobile) {
      // Usa setTimeout per evitare conflitti con altri event handler
      setTimeout(() => {
        this.showCertificatoSourceDialog = true;
      }, 0);
    } else {
      // Desktop: apri direttamente il file picker
      const input = document.getElementById('certificatoInputGallery') as HTMLInputElement;
      input?.click();
    }
  }

  scegliSorgenteFoto(sorgente: 'galleria' | 'fotocamera'): void {
    this.showFotoSourceDialog = false;
    const inputId = sorgente === 'galleria' ? 'fotoInputGallery' : 'fotoInputCamera';
    const input = document.getElementById(inputId) as HTMLInputElement;
    input?.click();
  }

  scegliSorgenteCertificato(sorgente: 'galleria' | 'fotocamera'): void {
    this.showCertificatoSourceDialog = false;
    const inputId = sorgente === 'galleria' ? 'certificatoInputGallery' : 'certificatoInputCamera';
    const input = document.getElementById(inputId) as HTMLInputElement;
    input?.click();
  }

  async onFotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.currentUser) return;

    const file = input.files[0];
    
    console.log('File selezionato:', file.name, 'Tipo:', file.type, 'Dimensione:', file.size);
    
    // Valida tipo file - accetta anche se il tipo è vuoto (alcune fotocamere non impostano il MIME type)
    if (file.type && !file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido');
      input.value = '';
      return;
    }

    // Se il tipo è vuoto, prova a validare dall'estensione
    if (!file.type) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
        alert('Seleziona un file immagine valido');
        input.value = '';
        return;
      }
    }

    // Valida dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Il file è troppo grande. Massimo 5MB');
      input.value = '';
      return;
    }

    this.uploadingFoto = true;

    try {
      const giocatoreId = (this.currentUser as any).id;
      if (!giocatoreId) {
        alert('Impossibile caricare: ID giocatore non trovato');
        return;
      }

      // Elimina foto precedente se esiste
      if (this.currentUser.fotoUrl) {
        try {
          const oldFotoRef = ref(this.storage, `giocatori/${giocatoreId}/foto`);
          await deleteObject(oldFotoRef);
        } catch (error) {
          console.log('Nessuna foto precedente da eliminare');
        }
      }

      // Upload nuova foto
      const fotoRef = ref(this.storage, `giocatori/${giocatoreId}/foto`);
      await uploadBytes(fotoRef, file);
      const fotoUrl = await getDownloadURL(fotoRef);

      // Aggiorna Firestore
      await this.giocatoriService.updateGiocatore(giocatoreId, { fotoUrl });
      
      // Aggiorna currentUser
      this.currentUser = { ...this.currentUser, fotoUrl };
      if (this.editedUser) {
        this.editedUser = { ...this.editedUser, fotoUrl };
      }
      this.authService.updateCurrentUser(this.currentUser);

      alert('Foto caricata con successo!');
    } catch (error) {
      console.error('Errore durante il caricamento della foto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      alert(`Errore durante il caricamento della foto: ${errorMessage}`);
    } finally {
      this.uploadingFoto = false;
      input.value = '';
    }
  }

  async onCertificatoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.currentUser) return;

    const file = input.files[0];
    
    console.log('Certificato selezionato:', file.name, 'Tipo:', file.type, 'Dimensione:', file.size);
    
    // Valida tipo file (PDF o immagine) - accetta anche tipo vuoto per foto da fotocamera
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type ? file.type.startsWith('image/') : true; // Se tipo vuoto, assume immagine
    
    if (!isPdf && !isImage) {
      // Se non è PDF e non è immagine, controlla l'estensione
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
        alert('Seleziona un file PDF o un\'immagine');
        input.value = '';
        return;
      }
    }

    // Valida dimensione (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Il file è troppo grande. Massimo 10MB');
      input.value = '';
      return;
    }

    this.uploadingCertificato = true;

    try {
      const giocatoreId = (this.currentUser as any).id;
      if (!giocatoreId) {
        alert('Impossibile caricare: ID giocatore non trovato');
        return;
      }

      // Elimina certificato precedente se esiste
      if (this.currentUser.certificatoMedicoUrl) {
        try {
          const oldCertificatoRef = ref(this.storage, `giocatori/${giocatoreId}/certificato`);
          await deleteObject(oldCertificatoRef);
        } catch (error) {
          console.log('Nessun certificato precedente da eliminare');
        }
      }

      // Upload nuovo certificato
      const certificatoRef = ref(this.storage, `giocatori/${giocatoreId}/certificato`);
      await uploadBytes(certificatoRef, file);
      const certificatoMedicoUrl = await getDownloadURL(certificatoRef);
      
      // Aggiorna Firestore
      await this.giocatoriService.updateGiocatore(giocatoreId, { 
        certificatoMedicoUrl,
        certificatoMedicoNomeFile: file.name
      });
      
      // Aggiorna currentUser
      this.currentUser = { 
        ...this.currentUser, 
        certificatoMedicoUrl,
        certificatoMedicoNomeFile: file.name
      };
      if (this.editedUser) {
        this.editedUser = { 
          ...this.editedUser, 
          certificatoMedicoUrl,
          certificatoMedicoNomeFile: file.name
        };
      }
      this.authService.updateCurrentUser(this.currentUser);

      alert('Certificato caricato con successo!');
    } catch (error) {
      console.error('Errore durante il caricamento del certificato:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      alert(`Errore durante il caricamento del certificato: ${errorMessage}`);
    } finally {
      this.uploadingCertificato = false;
      input.value = '';
    }
  }

  async rimuoviFoto(): Promise<void> {
    if (!this.currentUser || !this.currentUser.fotoUrl) return;

    if (!confirm('Sei sicuro di voler rimuovere la foto profilo?')) return;

    try {
      const giocatoreId = (this.currentUser as any).id;
      if (!giocatoreId) return;

      // Elimina da Storage
      const fotoRef = ref(this.storage, `giocatori/${giocatoreId}/foto`);
      await deleteObject(fotoRef);

      // Aggiorna Firestore
      await this.giocatoriService.updateGiocatore(giocatoreId, { fotoUrl: null });
      
      // Aggiorna currentUser
      this.currentUser = { ...this.currentUser, fotoUrl: undefined };
      if (this.editedUser) {
        this.editedUser = { ...this.editedUser, fotoUrl: undefined };
      }
      this.authService.updateCurrentUser(this.currentUser);

      alert('Foto rimossa con successo!');
    } catch (error) {
      console.error('Errore durante la rimozione della foto:', error);
      alert('Errore durante la rimozione della foto');
    }
  }

  async scaricaCertificato(): Promise<void> {
    if (!this.currentUser || !this.currentUser.certificatoMedicoUrl) return;

    window.open(this.currentUser.certificatoMedicoUrl, '_blank');
  }

  async rimuoviCertificato(): Promise<void> {
    if (!this.currentUser || !this.currentUser.certificatoMedicoUrl) return;

    if (!confirm('Sei sicuro di voler rimuovere il certificato medico?')) return;

    try {
      const giocatoreId = (this.currentUser as any).id;
      if (!giocatoreId) return;

      // Elimina da Storage
      const certificatoRef = ref(this.storage, `giocatori/${giocatoreId}/certificato`);
      await deleteObject(certificatoRef);

      // Aggiorna Firestore
      await this.giocatoriService.updateGiocatore(giocatoreId, { 
        certificatoMedicoUrl: null,
        certificatoMedicoNomeFile: null
      });
      
      // Aggiorna currentUser
      this.currentUser = { 
        ...this.currentUser, 
        certificatoMedicoUrl: undefined,
        certificatoMedicoNomeFile: undefined
      };
      if (this.editedUser) {
        this.editedUser = { 
          ...this.editedUser, 
          certificatoMedicoUrl: undefined,
          certificatoMedicoNomeFile: undefined
        };
      }
      this.authService.updateCurrentUser(this.currentUser);

      alert('Certificato rimosso con successo!');
    } catch (error) {
      console.error('Errore durante la rimozione del certificato:', error);
      alert('Errore durante la rimozione del certificato');
    }
  }
}
