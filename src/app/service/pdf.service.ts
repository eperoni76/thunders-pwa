import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Partita } from '../model/partita';
import { GiocatoriService } from './giocatori.service';
import { Costanti } from '../costanti';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor(private giocatoriService: GiocatoriService) { }

  async generaListaGara(partita: Partita): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const darkGreen = [0, 128, 0] as [number, number, number];
    const darkRed = [139, 0, 0] as [number, number, number];
    const black = [0, 0, 0] as [number, number, number];
    let yPosition = 15;

    try {
      const logoUisp1 = await this.loadImageAsBase64('assets/images/uisp1.png');
      const logoUisp2 = await this.loadImageAsBase64('assets/images/uisp2.png');
      const logoUisp3 = await this.loadImageAsBase64('assets/images/uisp3.jpg');
      doc.addImage(logoUisp1, 'PNG', 20, 5, 20, 20);
      doc.addImage(logoUisp2, 'PNG', pageWidth/2 - 10, 5, 20, 20);
      doc.addImage(logoUisp3, 'JPG', pageWidth - 40, 5, 20, 20);
    } catch (error) {
      console.error('Errore nel caricamento delle immagini:', error);
      doc.setFontSize(8);
      doc.setTextColor(...black);
      doc.text('UISP', 25, yPosition);
      doc.text('COMITATO TERRITORIALE', pageWidth/2 - 30, yPosition);
      doc.text('LOGO PALLAVOLO', pageWidth - 60, yPosition);
    }
    yPosition += 22;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGreen);
    const titleText = Costanti.TITOLO_PDF;
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleWidth) / 2, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const subtitleText = Costanti.PRIMO_SOTTOTITOLO;
    const subtitleWidth = doc.getTextWidth(subtitleText);
    doc.rect(20, yPosition - 6, pageWidth - 40, 8);
    doc.text(subtitleText, (pageWidth - subtitleWidth) / 2, yPosition);
    yPosition += 12;

    doc.setFontSize(9);
    doc.setTextColor(...darkGreen);
    doc.rect(20, yPosition - 6, pageWidth - 40, 8);
    doc.text(Costanti.SECONDO_SOTTOTITOLO, 22, yPosition);

    const secondoSottotitoloWidth = doc.getTextWidth(Costanti.SECONDO_SOTTOTITOLO);
    const nomeSquadraX = 22 + secondoSottotitoloWidth + 4;
    doc.setTextColor(...black);
    doc.setFont('helvetica', 'bold');
    doc.text(Costanti.NOME_SQUADRA, nomeSquadraX, yPosition);
    yPosition += 12;

    const tableStartX = 20;
    const tableWidth = pageWidth - 40;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    const gara1Y = yPosition;
    const garaRowHeight = 6;
    const gara1ColWidths = [0.2 * tableWidth, 0.4 * tableWidth, 0.4 * tableWidth];
    let garaCurrentX = tableStartX;
    gara1ColWidths.forEach(width => { doc.rect(garaCurrentX, gara1Y - 4, width, garaRowHeight); garaCurrentX += width; });

    garaCurrentX = tableStartX;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGreen);
    const nGaraText = 'N° GARA';
    doc.text(nGaraText, garaCurrentX + 2, gara1Y);
    const nGaraWidth = doc.getTextWidth(nGaraText);
    doc.setTextColor(...black);
    doc.text(`    ${partita.numeroGara}`, garaCurrentX + 2 + nGaraWidth, gara1Y);
    garaCurrentX += gara1ColWidths[0];

    doc.setTextColor(...darkGreen);
    const ospitanteText = 'OSPITANTE';
    doc.text(ospitanteText, garaCurrentX + 2, gara1Y);
    const ospitanteWidth = doc.getTextWidth(ospitanteText);
    doc.setTextColor(...black);
    doc.text(`    ${partita.ospitante}`, garaCurrentX + 2 + ospitanteWidth, gara1Y);
    garaCurrentX += gara1ColWidths[1];

    doc.setTextColor(...darkGreen);
    const ospiteText = 'OSPITE';
    doc.text(ospiteText, garaCurrentX + 2, gara1Y);
    const ospiteWidth = doc.getTextWidth(ospiteText);
    doc.setTextColor(...black);
    doc.text(`    ${partita.ospite}`, garaCurrentX + 2 + ospiteWidth, gara1Y);
    yPosition += garaRowHeight;

    const gara2Y = yPosition;
    const gara2ColWidths = [0.7 * tableWidth, 0.3 * tableWidth];
    garaCurrentX = tableStartX;
    gara2ColWidths.forEach(width => { doc.rect(garaCurrentX, gara2Y - 4, width, garaRowHeight); garaCurrentX += width; });
    garaCurrentX = tableStartX;
    const indirizzoTroncato = partita.indirizzo.length > 50 ? partita.indirizzo.substring(0, 32) + '...' : partita.indirizzo;
    doc.setTextColor(...darkGreen);
    const indirizzoText = 'INDIRIZZO';
    doc.text(indirizzoText, garaCurrentX + 2, gara2Y);
    const indirizzoWidth = doc.getTextWidth(indirizzoText);
    doc.setTextColor(...black);
    doc.text(`     ${indirizzoTroncato}`, garaCurrentX + 2 + indirizzoWidth, gara2Y);
    garaCurrentX += gara2ColWidths[0];
    doc.setTextColor(...darkGreen);
    const dataOraText = 'DATA E ORA';
    doc.text(dataOraText, garaCurrentX + 2, gara2Y);
    const dataOraWidth = doc.getTextWidth(dataOraText);
    doc.setTextColor(...black);
    const dataFormattata = this.formatDate(partita.data);
    doc.text(`    ${dataFormattata} ${partita.ora}`, garaCurrentX + 2 + dataOraWidth, gara2Y);
    yPosition += garaRowHeight;

    const gara3Y = yPosition;
    doc.rect(tableStartX, gara3Y - 4, tableWidth, garaRowHeight);
    doc.setTextColor(...darkGreen);
    const campionatoText = 'CAMPIONATO';
    doc.text(campionatoText, tableStartX + 2, gara3Y);
    const campionatoWidth = doc.getTextWidth(campionatoText);
    doc.setTextColor(...black);
    doc.text(`    ${partita.campionato}`, tableStartX + 2 + campionatoWidth, gara3Y);
    yPosition += garaRowHeight + 6;

    const tuttiGiocatori = await this.giocatoriService.getGiocatori();
    const giocatoriFiltrati = this.filtraEOrdinaGiocatori(tuttiGiocatori);
    const allenatori = tuttiGiocatori.filter((g: any) => (g.ruolo || '').toLowerCase() === 'allenatore');
    const dirigenti = tuttiGiocatori.filter((g: any) => (g.ruolo || '').toLowerCase() === 'dirigente');

    const totalProportion = 12.8;
    const colWidths = [
      (0.8 / totalProportion) * tableWidth,
      (4.0 / totalProportion) * tableWidth,
      (3.0 / totalProportion) * tableWidth,
      (3.0 / totalProportion) * tableWidth,
      (2.0 / totalProportion) * tableWidth
    ];

    const headerY = yPosition;
    const headerHeight = 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGreen);
    let currentX = tableStartX;
    ['N°', 'COGNOME E NOME', 'DATA DI NASCITA', 'TESSERA UISP', 'DOCUMENTO'].forEach((header, i) => {
      doc.rect(currentX, headerY - 4, colWidths[i], headerHeight);
      const w = doc.getTextWidth(header);
      doc.text(header, currentX + (colWidths[i] - w) / 2, headerY);
      currentX += colWidths[i];
    });
    yPosition += headerHeight;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...black);
    giocatoriFiltrati.forEach((g: any, index: number) => {
      const rowHeight = 6;
      currentX = tableStartX;
      colWidths.forEach(width => { doc.rect(currentX, yPosition - 4, width, rowHeight); currentX += width; });
      currentX = tableStartX;
      const numeroMaglia = `${g.numeroMaglia || (index + 1)}`;
      const numeroWidth = doc.getTextWidth(numeroMaglia);
      doc.text(numeroMaglia, currentX + (colWidths[0] - numeroWidth) / 2, yPosition);
      currentX += colWidths[0];
      let nomeCompleto = `${g.cognome?.toUpperCase() || ''} ${g.nome?.toUpperCase() || ''}`.trim();
      const letteraRuolo = g.capitano ? 'K' : (g.ruolo?.toLowerCase() === 'libero' ? 'L' : '');
      const letterWidth = letteraRuolo ? doc.getTextWidth(letteraRuolo) : 0;
      const spazioRiservato = letteraRuolo ? (letterWidth + 4) : 0;
      const maxNomeWidth = colWidths[1] - 2 - spazioRiservato;
      if (doc.getTextWidth(nomeCompleto) > maxNomeWidth) {
        while (doc.getTextWidth(nomeCompleto + '...') > maxNomeWidth && nomeCompleto.length > 0) {
          nomeCompleto = nomeCompleto.slice(0, -1);
        }
        nomeCompleto += '...';
      }
      doc.text(nomeCompleto, currentX + 2, yPosition);
      if (letteraRuolo) {
        const letterX = currentX + colWidths[1] - 2 - letterWidth;
        doc.text(letteraRuolo, letterX, yPosition);
      }
      currentX += colWidths[1];
      const dataNascita = this.formatDate(g.dataDiNascita || '');
      const dataWidth = doc.getTextWidth(dataNascita);
      doc.text(dataNascita, currentX + (colWidths[2] - dataWidth) / 2, yPosition);
      currentX += colWidths[2];
      const tessera = g.tesseraUisp || '';
      const tesseraWidth = doc.getTextWidth(tessera);
      doc.text(tessera, currentX + (colWidths[3] - tesseraWidth) / 2, yPosition);
      currentX += colWidths[3];
      yPosition += rowHeight;
    });

    yPosition += 4;

    const staffTotalProportion = 12.8;
    const staffColWidths = [
      (3.0 / staffTotalProportion) * tableWidth,
      (4.8 / staffTotalProportion) * tableWidth,
      (3.0 / staffTotalProportion) * tableWidth,
      (2.0 / staffTotalProportion) * tableWidth
    ];
    const staffRowHeight = 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const staffRolesOrder = ['1° ALLENATORE', '2° ALLENATORE', 'DIRIGENTE'];
    staffRolesOrder.forEach(role => {
      currentX = tableStartX;
      staffColWidths.forEach(width => { doc.rect(currentX, yPosition - 4, width, staffRowHeight); currentX += width; });
      currentX = tableStartX;
      doc.setTextColor(...darkGreen);
      const roleWidth = doc.getTextWidth(role);
      doc.text(role, currentX + (staffColWidths[0] - roleWidth) / 2, yPosition);
      currentX += staffColWidths[0];
      doc.setTextColor(...black);
      let persona: any = null;
      if (role.startsWith('1°') && allenatori.length > 0) persona = allenatori[0];
      else if (role.startsWith('2°') && allenatori.length > 1) persona = allenatori[1];
      else if (role === 'DIRIGENTE' && dirigenti.length > 0) persona = dirigenti[0];
      const nomeVal = persona ? `${(persona.cognome || '').toUpperCase()} ${(persona.nome || '').toUpperCase()}`.trim() : '';
      const tesseraVal = persona ? (persona.tesseraUisp || '') : '';
      if (nomeVal) {
        doc.text(nomeVal, currentX + 2, yPosition);
      }
      currentX += staffColWidths[1];
      if (tesseraVal) {
        const tesseraWidth = doc.getTextWidth(tesseraVal);
        doc.text(tesseraVal, currentX + (staffColWidths[2] - tesseraWidth) / 2, yPosition);
      }
      currentX += staffColWidths[2];
      yPosition += staffRowHeight;
    });

    yPosition += 4;

    const defibBoxHeight = 6;
    doc.rect(20, yPosition - 4, pageWidth - 40, defibBoxHeight);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkRed);
    const titleDefib = Costanti.TITOLO_DEFIBRILLATORE;
    const titleDefibWidth = doc.getTextWidth(titleDefib);
    doc.text(titleDefib, (pageWidth - titleDefibWidth) / 2, yPosition);
    yPosition += defibBoxHeight;

    doc.setFontSize(9);
    const subtitleDefib = Costanti.SOTTOTITOLO_DEFIBRILLATORE;
    const subtitleMaxWidth = pageWidth - 48;
    const subtitleLines = doc.splitTextToSize(subtitleDefib, subtitleMaxWidth);
    const subtitleLineHeight = 4;
    const subtitleBoxHeight = subtitleLines.length * subtitleLineHeight + 2;
    doc.rect(20, yPosition - 4, pageWidth - 40, subtitleBoxHeight);
    subtitleLines.forEach((line: string, idx: number) => {
      const lineWidth = doc.getTextWidth(line);
      doc.text(line, (pageWidth - lineWidth) / 2, yPosition + idx * subtitleLineHeight);
    });
    yPosition += subtitleBoxHeight + 4;

    // Dati personali (auto-fill se gara in casa)
    const isCasa = (partita.ospitante || '').toUpperCase().includes('THUNDERS');
    const addetto = Costanti.ADDETTO_DEFIBRILLATORE_THUNDERS;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...black);
    const sottoscrittoVal = isCasa ? `${addetto.cognome.toUpperCase()} ${addetto.nome.toUpperCase()}` : '';
    const codiceFiscaleVal = isCasa ? addetto.codiceFiscale : '';
    doc.text(`IL/LA SOTTOSCRITTO/A: ${sottoscrittoVal || '_______________________'}`, 20, yPosition);
    doc.text(`CODICE FISCALE: ${codiceFiscaleVal || '_______________'}`, 125, yPosition);
    yPosition += 6;
    const dataNascitaVal = isCasa ? this.formatDate(addetto.dataDiNascita) : '';
    const luogoNascitaVal = isCasa ? addetto.luogoNascita : '__________';
    const residenzaVal = isCasa ? addetto.residenza : '_______________';
    doc.text(`NATO/A IL: ${dataNascitaVal || '__________'}`, 20, yPosition);
    doc.text(`A: ${luogoNascitaVal}`, 75, yPosition);
    doc.text(`RESIDENTE IN: ${residenzaVal}`, 125, yPosition);
    yPosition += 7;

    doc.setFontSize(8);
    const testoDeclarazione = Costanti.TESTO_DICHIARAZIONE_DEFIBRILLATORE;
    const lines = doc.splitTextToSize(testoDeclarazione, pageWidth - 40);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 2.5 + 8;

    doc.setFontSize(9);
    doc.text('DATA_______________', 20, yPosition);
    doc.text('FIRMA_______________________', 80, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text('IL CAPITANO_____________________', 140, yPosition);

    const nomeFile = `Lista_Gara_${partita.numeroGara}_${partita.data.replace(/-/g, '')}.pdf`;
    doc.save(nomeFile);
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private async loadImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private filtraEOrdinaGiocatori(giocatori: any[]): any[] {
    return giocatori
      .filter((g: any) => {
        const ruolo = (g.ruolo || '').toLowerCase();
        return ruolo !== 'allenatore' && ruolo !== 'dirigente';
      })
      .sort((a: any, b: any) => {
        const cognomeA = (a.cognome || '').toLowerCase();
        const cognomeB = (b.cognome || '').toLowerCase();
        if (cognomeA < cognomeB) return -1;
        if (cognomeA > cognomeB) return 1;
        const nomeA = (a.nome || '').toLowerCase();
        const nomeB = (b.nome || '').toLowerCase();
        if (nomeA < nomeB) return -1;
        if (nomeA > nomeB) return 1;
        return 0;
      });
  }
}
