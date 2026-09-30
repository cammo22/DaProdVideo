// Le funzioni lente (sottotitoli con l'AI, voce, installazione del motore) mostrano una barra con il tempo:
// quanto è passato e quanto manca, stimato dalla velocità degli ultimi secondi (così regge anche quando una
// fase va più piano dell'altra, come lo scarico dei modelli e poi il lavoro vero).
import { h } from './dom';

/** "45 s", "2 min 10 s", "1 h 05 min" */
export function durataTesto(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${s % 60 ? ' ' + String(s % 60).padStart(2, '0') + ' s' : ''}`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
}

/** la stima del tempo che manca */
export class Stima {
  private punti: { t: number; k: number }[] = [];
  private t0: number;
  constructor(private ora: () => number = () => performance.now(), private finestra = 25000) { this.t0 = this.ora(); }

  registra(k: number) {
    const t = this.ora();
    const u = this.punti[this.punti.length - 1];
    // un passo indietro (nuova fase) non conta come velocità
    if (u && k < u.k) this.punti = [];
    this.punti.push({ t, k });
    while (this.punti.length > 2 && t - this.punti[0].t > this.finestra) this.punti.shift();
  }

  /** secondi passati da quando è partito */
  trascorso(): number { return (this.ora() - this.t0) / 1000; }

  /** secondi che mancano, o null se ancora non si può dire */
  restante(): number | null {
    const p = this.punti;
    if (p.length < 2) return null;
    const a = p[0], b = p[p.length - 1];
    const dt = (b.t - a.t) / 1000, dk = b.k - a.k;
    if (dt < 2 || dk <= 1e-4 || b.k >= 1) return null;
    return ((1 - b.k) * dt) / dk;
  }
}

/** la barra con il testo della fase e, sotto, percentuale, tempo passato e tempo che manca */
export class BarraLavoro {
  readonly barra = h('div', { class: 'ai-barra' }, h('i'));
  readonly fase = h('div', { class: 'ai-fase' });
  readonly tempo = h('div', { class: 'ai-tempo' });
  private stima = new Stima();
  private k = 0;

  /** i tre elementi, da mettere nella pagina */
  get elementi(): HTMLElement[] { return [this.barra, this.fase, this.tempo]; }

  avvia(testo = '') {
    this.stima = new Stima();
    this.k = 0;
    this.barra.classList.add('attiva');
    this.imposta(testo, 0);
  }

  imposta(testo: string, k: number) {
    this.k = Math.max(0, Math.min(1, k));
    this.stima.registra(this.k);
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
    this.fase.textContent = testo;
    (this.barra.firstChild as HTMLElement).style.width = '100%';
    this.tempo.textContent = `finito in ${durataTesto(this.stima.trascorso())}`;
    this.barra.classList.remove('attiva');
  }

  /** fermato o non riuscito */
  ferma(testo: string) {
    this.fase.textContent = testo;
    this.tempo.textContent = '';
    this.barra.classList.remove('attiva');
    (this.barra.firstChild as HTMLElement).style.width = '0%';
  }
}
