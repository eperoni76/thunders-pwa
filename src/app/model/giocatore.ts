export interface Giocatore {
  nome: string;
  cognome: string;
  numeroMaglia: string;
  dataDiNascita: string;
  ruolo: string;
  tesseraUisp: string;
  capitano: boolean;
  codiceFiscale?: string;
  profilo: string;
  email?: string;
  tagliaDivisa?: string;
  scadenzaCertificatoMedico?: string;
  fotoUrl?: string;
  certificatoMedicoUrl?: string;
  certificatoMedicoNomeFile?: string;
}
