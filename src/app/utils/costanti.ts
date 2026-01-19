import {AddettoDefibrillatore} from "../model/addetto-defibrillatore";

export class Costanti {

  static readonly PROFILI_UTENTE = {
    amministratore: { value: 'amministratore', label: 'Amministratore' },
    giocatore: { value: 'giocatore', label: 'Giocatore' },
    staff: { value: 'staff', label: 'Staff' }
  };

  static readonly RUOLI = {
    schiacciatore: { value: 'schiacciatore', label: 'Schiacciatore' },
    palleggiatore: { value: 'palleggiatore', label: 'Palleggiatore' },
    centrale: { value: 'centrale', label: 'Centrale' },
    libero: { value: 'libero', label: 'Libero' },
    opposto: { value: 'opposto', label: 'Opposto' },
    allenatore: { value: 'allenatore', label: 'Allenatore' },
    dirigente: { value: 'dirigente', label: 'Dirigente' }
  };

  static readonly ADDETTO_DEFIBRILLATORE_THUNDERS: AddettoDefibrillatore =
    {
      nome: 'Emanuele',
      cognome: 'Peroni',
      codiceFiscale: 'PRNMNL97L08D972O',
      dataDiNascita: '1997-07-08',
      luogoNascita: 'Genzano di Roma',
      residenza: 'Via Napoli 55, Albano Laziale'
    };


  // Costanti per PDF Lista Gara
  static readonly TITOLO_PDF = 'SETTORE DI ATTIVITÀ PALLAVOLO UISP LAZIO SUD EST';
  static readonly PRIMO_SOTTOTITOLO = 'LISTA PARTECIPANTI ALLA GARA';
  static readonly SECONDO_SOTTOTITOLO = 'DENOMINAZIONE DELLA SQUADRA';
  static readonly NOME_SQUADRA = 'PUNTO VOLLEY CR ASD THUNDERS';
  static readonly TITOLO_DEFIBRILLATORE = 'DA COMPILARE DA PARTE DELLA SOLA SQUADRA OSPITANTE';
  static readonly SOTTOTITOLO_DEFIBRILLATORE = 'AUTOCERTIFICAZIONE DELL\'ADDETTO ALL\'UTILIZZO DEL DEFIBRILLATORE (ART. 45 E 46 DPR 28 DICEMBRE 2000 N. 445)';
  static readonly TESTO_DICHIARAZIONE_DEFIBRILLATORE = 'CONSAPEVOLE della responsabilità penale e civile derivante da dichiarazioni mendaci, DICHIARA che nella struttura sportiva ove si svolge la gara è presente un defibrillatore semiautomatico esterno conforme alla vigente normativa e che è presente una persona adeguatamente formata al suo utilizzo.';

  static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

}
