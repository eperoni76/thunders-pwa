import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { GiocatoriService } from '../../service/giocatori.service';
import { Giocatore } from '../../model/giocatore';
import { GenericUtils } from '../../utils/generic-utils';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Configura PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
      this.showFotoSourceDialog = true;
    } else {
      // Desktop: apri direttamente il file picker
      const input = document.getElementById('fotoInputGallery') as HTMLInputElement;
      input?.click();
    }
  }

  onClickCaricaCertificato(): void {
    if (this.isMobile) {
      this.showCertificatoSourceDialog = true;
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
    
    // Valida tipo file
    if (!file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido');
      return;
    }

    // Valida dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Il file è troppo grande. Massimo 5MB');
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
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

      alert('Foto caricata con successo!');
    } catch (error) {
      console.error('Errore durante il caricamento della foto:', error);
      alert('Errore durante il caricamento della foto');
    } finally {
      this.uploadingFoto = false;
      input.value = '';
    }
  }

  async onCertificatoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.currentUser) return;

    const file = input.files[0];
    
    // Valida tipo file (PDF o immagine)
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    
    if (!isPdf && !isImage) {
      alert('Seleziona un file PDF o un\'immagine');
      return;
    }

    // Valida dimensione (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Il file è troppo grande. Massimo 10MB');
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

      // Prova ad estrarre la data di scadenza
      const dataScadenza = await this.estraiDataScadenza(file);
      
      // Aggiorna Firestore
      const updateData: any = { 
        certificatoMedicoUrl,
        certificatoMedicoNomeFile: file.name
      };
      
      if (dataScadenza) {
        updateData.scadenzaCertificatoMedico = dataScadenza;
      }
      
      await this.giocatoriService.updateGiocatore(giocatoreId, updateData);
      
      // Aggiorna currentUser
      this.currentUser = { 
        ...this.currentUser, 
        certificatoMedicoUrl,
        certificatoMedicoNomeFile: file.name,
        ...(dataScadenza && { scadenzaCertificatoMedico: dataScadenza })
      };
      if (this.editedUser) {
        this.editedUser = { 
          ...this.editedUser, 
          certificatoMedicoUrl,
          certificatoMedicoNomeFile: file.name,
          ...(dataScadenza && { scadenzaCertificatoMedico: dataScadenza })
        };
      }
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

      if (dataScadenza) {
        alert(`Certificato caricato con successo!\n\nData di scadenza rilevata automaticamente: ${this.formatDate(dataScadenza)}`);
      } else {
        alert('Certificato caricato con successo!\n\nNon è stato possibile rilevare automaticamente la data di scadenza.');
      }
    } catch (error) {
      console.error('Errore durante il caricamento del certificato:', error);
      alert('Errore durante il caricamento del certificato');
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
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

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
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

      alert('Certificato rimosso con successo!');
    } catch (error) {
      console.error('Errore durante la rimozione del certificato:', error);
      alert('Errore durante la rimozione del certificato');
    }
  }

  private async estraiDataScadenza(file: File): Promise<string | null> {
    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        text = await this.estraiTestoDaPdf(file);
      } else if (file.type.startsWith('image/')) {
        text = await this.estraiTestoDaImmagine(file);
      }

      if (!text) {
        console.log('Nessun testo estratto dal file');
        return null;
      }

      console.log('Testo estratto:', text);
      return this.trovaDataScadenza(text);
    } catch (error) {
      console.error('Errore durante l\'estrazione della data:', error);
      return null;
    }
  }

  private async estraiTestoDaPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Estrai testo da tutte le pagine (max 3 per performance)
    const numPages = Math.min(pdf.numPages, 3);
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + ' ';
    }

    return fullText;
  }

  private async estraiTestoDaImmagine(file: File): Promise<string> {
    const worker = await createWorker('ita+eng');
    
    try {
      const { data } = await worker.recognize(file);
      return data.text;
    } finally {
      await worker.terminate();
    }
  }

  private trovaDataScadenza(text: string): string | null {
    // Pattern per cercare date in vari formati
    const patterns = [
      // "Scade il 31/12/2026" o "Scadenza: 31/12/2026"
      /scad(?:enza|e)?[:\s]*(?:il)?[\s]*(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/i,
      // "Valid until 31/12/2026" o "Valido fino al 31/12/2026"
      /valid(?:o|ità)?[\s]*(?:fino|until)?[\s]*(?:al|to)?[:\s]*(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/i,
      // "Expiry date: 31/12/2026"
      /expir(?:y|ation)?[\s]*date[:\s]*(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/i,
      // "31/12/2026" dopo parole chiave
      /(?:scadenza|scade|valid|valido|expiry|fino)[\s\S]{0,50}?(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/i,
      // Data in formato 2026-12-31
      /scad(?:enza|e)?[:\s]*(?:il)?[\s]*(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let day: string, month: string, year: string;
        
        // Gestisci formato YYYY-MM-DD vs DD/MM/YYYY
        if (match[1].length === 4) {
          year = match[1];
          month = match[2].padStart(2, '0');
          day = match[3].padStart(2, '0');
        } else {
          day = match[1].padStart(2, '0');
          month = match[2].padStart(2, '0');
          year = match[3];
        }

        // Valida che sia una data futura e ragionevole (max 5 anni)
        const dataScadenza = new Date(`${year}-${month}-${day}`);
        const oggi = new Date();
        const cinqueAnni = new Date();
        cinqueAnni.setFullYear(cinqueAnni.getFullYear() + 5);

        if (dataScadenza > oggi && dataScadenza < cinqueAnni) {
          return `${year}-${month}-${day}`;
        }
      }
    }

    return null;
  }
}
