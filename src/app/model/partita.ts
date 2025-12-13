export interface Partita {
  numeroGara: number;
  data: string;
  ora: string;
  campionato: string;
  indirizzo: string;
  ospitante: string;
  ospite: string;
  risultato?: string;
}

export interface PartiteData {
  lastUpdate: Date;
  season: string;
  partite: Partita[];
}
