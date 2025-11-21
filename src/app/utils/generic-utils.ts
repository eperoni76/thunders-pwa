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
}
