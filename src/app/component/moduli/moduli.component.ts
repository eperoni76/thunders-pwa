import { Component, OnInit } from '@angular/core';
import { ModuliService } from '../../service/moduli.service';
import { AuthService } from '../../service/auth.service';
import { Modulo } from '../../model/modulo';
import { GenericUtils } from '../../utils/generic-utils';

@Component({
  selector: 'app-moduli',
  templateUrl: './moduli.component.html',
  styleUrls: ['./moduli.component.css']
})
export class ModuliComponent implements OnInit {

  moduli: Modulo[] = [];
  isLoading: boolean = false;
  isUploading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isUploadSectionOpen: boolean = false;
  
  // Form upload
  nomeModulo: string = '';
  fileSelezionato: File | null = null;

  // Filtri per colonna
  filters = {
    nome: '',
    nomeFile: '',
    caricatoDa: '',
    dataCaricamento: '',
    dimensione: ''
  };

  // Ordinamento
  sortColumn: string = 'dataCaricamento';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    public moduliService: ModuliService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.caricaModuli();
  }

  caricaModuli(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.moduliService.getModuli().subscribe({
      next: (moduli) => {
        this.moduli = moduli;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento dei moduli:', error);
        this.errorMessage = 'Errore nel caricamento dei moduli';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileSelezionato = file;
      // Se il nome non è stato specificato, usa il nome del file
      if (!this.nomeModulo) {
        this.nomeModulo = file.name.replace(/\.[^/.]+$/, ''); // Rimuove l'estensione
      }
    }
  }

  async caricaFile(): Promise<void> {
    if (!this.fileSelezionato || !this.nomeModulo.trim()) {
      this.errorMessage = 'Seleziona un file e inserisci un nome';
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.errorMessage = 'Utente non autenticato';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const nomeCompleto = `${currentUser.nome} ${currentUser.cognome}`;
      await this.moduliService.caricaModulo(this.fileSelezionato, this.nomeModulo, nomeCompleto);
      
      this.successMessage = 'File caricato con successo!';
      this.nomeModulo = '';
      this.fileSelezionato = null;
      
      // Reset del file input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Ricarica la lista
      this.caricaModuli();
      
      // Nascondi il messaggio di successo dopo 3 secondi
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
      
    } catch (error) {
      console.error('Errore nel caricamento del file:', error);
      this.errorMessage = 'Errore nel caricamento del file';
    } finally {
      this.isUploading = false;
    }
  }

  async eliminaModulo(modulo: Modulo): Promise<void> {
    if (!confirm(`Sei sicuro di voler eliminare "${modulo.nome}"?`)) {
      return;
    }

    try {
      await this.moduliService.eliminaModulo(modulo);
      this.successMessage = 'File eliminato con successo!';
      this.caricaModuli();
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
      
    } catch (error) {
      console.error('Errore nell\'eliminazione del file:', error);
      this.errorMessage = 'Errore nell\'eliminazione del file';
    }
  }

  scaricaModulo(modulo: Modulo): void {
    this.moduliService.scaricaModulo(modulo);
  }

  formattaDimensione(bytes: number): string {
    return this.moduliService.formattaDimensione(bytes);
  }

  getIconaFile(tipo: string): string {
    if (tipo.includes('pdf')) return 'bi-file-pdf-fill';
    if (tipo.includes('word') || tipo.includes('document')) return 'bi-file-word-fill';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return 'bi-file-excel-fill';
    if (tipo.includes('image')) return 'bi-file-image-fill';
    if (tipo.includes('zip') || tipo.includes('compressed')) return 'bi-file-zip-fill';
    return 'bi-file-earmark-fill';

  }

  toggleUploadSection(): void {
    this.isUploadSectionOpen = !this.isUploadSectionOpen;
  }

  get moduliFiltrati(): Modulo[] {
    let result = [...this.moduli];

    // Applica filtri
    if (this.filters.nome) {
      result = result.filter(m => 
        m.nome.toLowerCase().includes(this.filters.nome.toLowerCase())
      );
    }
    if (this.filters.nomeFile) {
      result = result.filter(m => 
        m.nomeFile.toLowerCase().includes(this.filters.nomeFile.toLowerCase())
      );
    }
    if (this.filters.caricatoDa) {
      result = result.filter(m => 
        m.caricatoDa.toLowerCase().includes(this.filters.caricatoDa.toLowerCase())
      );
    }
    if (this.filters.dataCaricamento) {
      result = result.filter(m => {
        const dataStr = this.formatDate(m.dataCaricamento);
        return dataStr.includes(this.filters.dataCaricamento);
      });
    }
    if (this.filters.dimensione) {
      result = result.filter(m => 
        this.formattaDimensione(m.dimensione).toLowerCase().includes(this.filters.dimensione.toLowerCase())
      );
    }

    // Applica ordinamento
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortColumn) {
        case 'nome':
          aValue = a.nome.toLowerCase();
          bValue = b.nome.toLowerCase();
          break;
        case 'nomeFile':
          aValue = a.nomeFile.toLowerCase();
          bValue = b.nomeFile.toLowerCase();
          break;
        case 'caricatoDa':
          aValue = a.caricatoDa.toLowerCase();
          bValue = b.caricatoDa.toLowerCase();
          break;
        case 'dataCaricamento':
          aValue = a.dataCaricamento.getTime();
          bValue = b.dataCaricamento.getTime();
          break;
        case 'dimensione':
          aValue = a.dimensione;
          bValue = b.dimensione;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  clearFilters(): void {
    this.filters = {
      nome: '',
      nomeFile: '',
      caricatoDa: '',
      dataCaricamento: '',
      dimensione: ''
    };
  }

  formatDate(date: Date): string {
    return GenericUtils.formatDateTime(date);
  }
}
