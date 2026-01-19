import { Partita } from "../model/partita";

export class GenericUtils {

  /**
   * Ordina un array di giocatori alfabeticamente per cognome (e per nome in caso di cognomi uguali)
   * @param giocatori Array di giocatori da ordinare
   * @returns Nuovo array ordinato
   */
  static ordinaGiocatoriPerCognome(giocatori: any[]): any[] {
    return [...giocatori].sort((a, b) => {
      const cognomeA = (a.cognome || '').toLowerCase();
      const cognomeB = (b.cognome || '').toLowerCase();
      if (cognomeA < cognomeB) return -1;
      if (cognomeA > cognomeB) return 1;
      // Se i cognomi sono uguali, ordina per nome
      const nomeA = (a.nome || '').toLowerCase();
      const nomeB = (b.nome || '').toLowerCase();
      if (nomeA < nomeB) return -1;
      if (nomeA > nomeB) return 1;
      return 0;
    });
  }

  /**
   * Apre Google Maps con l'indirizzo specificato in una nuova scheda
   * @param indirizzo L'indirizzo da cercare su Google Maps
   */
  static openMaps(indirizzo: string): void {
    if (!indirizzo) return;
    const encodedAddress = encodeURIComponent(indirizzo);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(url, '_blank');
  }

  /**
   * Formatta una data in formato DD/MM/YYYY
   * @param date Data da formattare (Date, string ISO, o string DD/MM/YYYY)
   * @returns Stringa formattata DD/MM/YYYY
   */
  static formatDate(date: Date | string | undefined): string {
    if (!date) return 'Non specificata';
    
    let d: Date;
    
    // Se è già una stringa in formato DD/MM/YYYY, restituiscila così
    if (typeof date === 'string' && date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return date;
    }
    
    // Se è una stringa in formato ISO (YYYY-MM-DD), convertila
    if (typeof date === 'string' && date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      d = new Date(date);
    } else if (typeof date === 'string') {
      d = new Date(date);
    } else {
      d = new Date(date);
    }
    
    if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formatta una data in formato DD/MM/YYYY HH:MM
   * @param date Data da formattare
   * @returns Stringa formattata DD/MM/YYYY HH:MM
   */
  static formatDateTime(date: Date | string): string {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  /**
   * Formatta una data con il giorno della settimana abbreviato: Sab 13/12/2025
   * @param date Data da formattare (string ISO o Date)
   * @returns Stringa formattata con giorno settimana
   */
  static formatDateWithDay(date: Date | string): string {
    if (!date) return '';
    
    try {
      const d = typeof date === 'string' ? new Date(date) : new Date(date);
      if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
      
      const giorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
      const giornoSettimana = giorni[d.getDay()];
      const giorno = String(d.getDate()).padStart(2, '0');
      const mese = String(d.getMonth() + 1).padStart(2, '0');
      const anno = d.getFullYear();
      
      return `${giornoSettimana} ${giorno}/${mese}/${anno}`;
    } catch (error) {
      return typeof date === 'string' ? date : '';
    }
  }

  /**
   * Formatta una data con il giorno della settimana completo: Sabato 13/12/2025
   * @param date Data da formattare
   * @returns Stringa formattata con giorno settimana completo
   */
  static formatDateWithFullDay(date: Date | string): string {
    if (!date) return '';
    
    try {
      const d = typeof date === 'string' ? new Date(date) : new Date(date);
      if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
      
      const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      const giornoSettimana = giorni[d.getDay()];
      const giorno = String(d.getDate()).padStart(2, '0');
      const mese = String(d.getMonth() + 1).padStart(2, '0');
      const anno = d.getFullYear();
      
      return `${giornoSettimana} ${giorno}/${mese}/${anno}`;
    } catch (error) {
      return typeof date === 'string' ? date : '';
    }
  }

  /**
   * Parse date string (supporta formato ISO yyyy-MM-dd e formato legacy "Gio 20/11")
   * @param dataStr Stringa data da parsare
   * @returns Date object o null se parsing fallisce
   */
  static parseDataPartita(dataStr: string): Date | null {
    if (!dataStr) return null;
    
    try {
      // Try ISO format first (yyyy-MM-dd)
      if (dataStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(dataStr);
      }
      
      // Legacy format: "Gio 20/11" or "20/11"
      // Extract day/month and assume current season
      const parts = dataStr.split(' ');
      const datePart = parts.length > 1 ? parts[1] : parts[0];
      const [giorno, mese] = datePart.split('/').map(n => parseInt(n));
      
      if (isNaN(giorno) || isNaN(mese)) return null;
      
      // Determine year based on season
      const oggi = new Date();
      const annoCorrente = oggi.getFullYear();
      const meseCorrente = oggi.getMonth() + 1;
      
      let anno = annoCorrente;
      if (meseCorrente >= 9 && mese <= 8) {
        anno = annoCorrente + 1;
      } else if (meseCorrente <= 8 && mese >= 9) {
        anno = annoCorrente - 1;
      }
      
      return new Date(anno, mese - 1, giorno);
    } catch (e) {
      console.warn('Error parsing date:', dataStr, e);
      return null;
    }
  }
  static getIcsConstants(dtStart: string, dtEnd: string, dtStamp: string, partita: Partita) {
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PuntoVolley Thunders//Calendario//IT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `DTSTAMP:${dtStamp}`,
      `UID:partita-${partita.numeroGara}-${dtStamp}@thunders.it`,
      `SUMMARY:${partita.ospitante} vs ${partita.ospite}`,
      `DESCRIPTION:Partita ${partita.campionato}\\nGara n. ${partita.numeroGara}`,
      `LOCATION:${partita.indirizzo}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Partita tra 1 ora',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }
}

