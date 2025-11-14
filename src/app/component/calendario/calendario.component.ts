import { Component, OnInit } from '@angular/core';
import { CalendarioService } from '../../service/calendario.service';

declare var bootstrap: any;

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {

  partite: any[] = [];
  selectedPartita: any = null;
  isEditMode: boolean = false;
  selectedIndex: number | null = null;

  constructor(
    private calendarioService: CalendarioService
  ) { }

  ngOnInit(): void {
    this.partite = this.calendarioService.getPartite();
  }

  openDialog(index?: number): void {
    if (index !== undefined) {
      this.selectedPartita = {...this.partite[index]};
      this.selectedIndex = index;
      this.isEditMode = true;
    } else {
      this.selectedPartita = null;
      this.selectedIndex = null;
      this.isEditMode = false;
    }
  }

  handleSave(partita: any): void {
    if (this.isEditMode && this.selectedIndex !== null) {
      this.partite[this.selectedIndex] = partita;
    } else {
      this.partite.push(partita);
    }
    this.calendarioService.setPartite(this.partite);
    this.closeModal();
    this.handleClose();
  }

  handleClose(): void {
    this.selectedPartita = null;
    this.selectedIndex = null;
    this.isEditMode = false;
  }

  eliminaPartita(index: number): void {
    if (confirm('Sei sicuro di voler eliminare questa partita?')) {
      this.partite.splice(index, 1);
      this.calendarioService.setPartite(this.partite);
    }
  }

  private closeModal(): void {
    const modalElement = document.getElementById('calendarioModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        this.parsePartiteFromFile(content);
      };
      reader.readAsText(file);
    }
  }

  private parsePartiteFromFile(content: string): void {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const partite = [];

    for (const line of lines) {
      const parts = line.split('///');
      if (parts.length >= 7) {
        const partita = {
          numeroGara: parseInt(parts[0]),
          data: this.parseDate(parts[1]),
          ora: parts[2],
          campionato: parts[3],
          indirizzo: parts[4],
          ospitante: parts[5],
          ospite: parts[6]
        };
        partite.push(partita);
      }
    }

    // Aggiungi le partite al calendario esistente
    this.partite = [...this.partite, ...partite];
    // Ordina per data se necessario
    this.partite.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    this.calendarioService.setPartite(this.partite);
  }

  private parseDate(dateString: string): string {
    // Converte "Gio 20/11/2025" in formato ISO "2025-11-20"
    const datePart = dateString.split(' ')[1]; // "20/11/2025"
    const [day, month, year] = datePart.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

}
