export interface TeamStanding {
    squadra: string;
    punti: number;
    partiteVinte: number;
    partitePerse: number;
    setVinti: number;
    setPersi: number;
    quozienteSet: number;
    puntiFatti: number;
    puntiSubiti: number;
    quozientePunti: number;
}

export interface StandingsData {
    lastUpdate: Date;
    season: string;
    standings: TeamStanding[];
}

// Manteniamo l'alias per retrocompatibilità
export type Classifica = TeamStanding;