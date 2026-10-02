// Le funzioni lente (sottotitoli con l'AI, voce, installazione del motore) mostrano una barra con il tempo:
// quanto è passato e quanto manca, stimato dalla velocità degli ultimi secondi (così regge anche quando una
// fase va più piano dell'altra, come lo scarico dei modelli e poi il lavoro vero).
import { h } from './dom';
import { nuova, type Categoria, type Lavoro } from '../media/attivita';

export { Stima, durataTesto } from '../core/stima';
import { Stima, durataTesto } from '../core/stima';

/** la barra con il testo della fase e, sotto, percentuale, tempo passato e tempo che manca */
export class BarraLavoro {
  readonly barra = h('div', { class: 'ai-barra' }, h('i'));
  readonly fase = h('div', { class: 'ai-fase' });
  readonly tempo = h('div', { class: 'ai-tempo' });
  private stima = new Stima();
  private k = 0;
  /** la riga nel centro attività (la barra in basso a destra): c'è solo se la barra ha un titolo */
  private riga: Lavoro | null = null;

  /** con un titolo, quello che fa la barra compare anche nel centro attività; alAnnulla = il pulsante ✕ di là */
  constructor(private titolo = '', private categoria: Categoria = 'ai', private alAnnulla?: () => void) {}

  /** i tre elementi, da mettere nella pagina */
  get elementi(): HTMLElement[] { return [this.barra, this.fase, this.tempo]; }

  avvia(testo = '') {
    this.stima = new Stima();
    this.k = 0;
    this.barra.classList.add('attiva');
    this.riga?.annullata();
    this.riga = this.titolo ? nuova({ titolo: this.titolo, categoria: this.categoria, alAnnulla: this.alAnnulla, annullabile: !!this.alAnnulla }) : null;
    this.imposta(testo, 0);
  }

  imposta(testo: string, k: number) {
    this.k = Math.max(0, Math.min(1, k));
    this.stima.registra(this.k);
    this.riga?.imposta(this.k, testo);
    this.fase.textContent = testo;
    (this.barra.firstChild as HTMLElement).style.width = Math.round(this.k * 100) + '%';
    const r = this.stima.restante();
    this.tempo.textContent = this.k > 0 || this.stima.trascorso() > 1
      ? `${Math.round(this.k * 100)}% · passati ${durataTesto(this.stima.trascorso())}${r !== null ? ` · mancano circa ${durataTesto(r)}` : ' · calcolo il tempo…'}`
      : '';
  }

  /** finito (bene): tempo totale al posto della stima */
  fine(testo: string) {
    this.k = 1;
    this.riga?.fine(testo.replace(/^Fatto:?\s*/i, ''));
    this.riga = null;
    this.fase.textContent = testo;
    (this.barra.firstChild as HTMLElement).style.width = '100%';
    this.tempo.textContent = `finito in ${durataTesto(this.stima.trascorso())}`;
    this.barra.classList.remove('attiva');
  }

  /** fermato o non riuscito */
  ferma(testo: string) {
    if (this.riga) { if (/^fermato/i.test(testo)) this.riga.annullata(testo); else this.riga.errore(testo); this.riga = null; }
    this.fase.textContent = testo;
    this.tempo.textContent = '';
    this.barra.classList.remove('attiva');
    (this.barra.firstChild as HTMLElement).style.width = '0%';
  }
}
