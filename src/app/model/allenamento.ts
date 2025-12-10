export interface Allenamento {
  id?: string;
  giorno: string; // es. "Martedì", "Venerdì"
  orarioInizio: string; // es. "20:30"
  orarioFine: string; // es. "22:30"
  indirizzo: string; // es. "Via Ercolano 11, Castel Gandolfo"
  nomePalestra: string; // es. "Palestra Paolo VI"
  ordinamento?: number; // per ordinare i giorni della settimana
}
