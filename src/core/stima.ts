// Quanto è passato e quanto manca: la stima parte dalla velocità degli ultimi secondi (così regge anche quando una
// fase va più piano dell'altra, come lo scarico dei modelli e poi il lavoro vero). Pura: la usano la barra del lavoro
// e il centro attività.

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
