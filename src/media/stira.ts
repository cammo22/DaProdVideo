// Cambiare la velocità di un suono senza cambiargli il tono (voce che non diventa da paperino): WSOLA, cioè
// pezzetti di ~40 ms presi dall'originale a passo diverso e cuciti dove le onde si somigliano di più.
// Va "a flusso": si danno i campioni man mano e si ricevono quelli pronti, così serve anche per la riproduzione.
// Niente DOM qui dentro: si prova anche da Node.

export class Stiratore {
  private readonly N: number;
  private readonly Hs: number;
  private readonly Ha: number;
  private readonly tol: number;
  private readonly win: Float32Array;
  private inp: Float32Array[];
  private base = 0;
  private lung = 0;
  private k = 0;
  private sel = 0;
  private acc: Float32Array[];
  /** quanti campioni sono già usciti */
  usciti = 0;

  constructor(private readonly canali: number, readonly sr: number, readonly velocita: number) {
    this.N = 2 * Math.round(sr * 0.02);
    this.Hs = this.N / 2;
    this.Ha = this.Hs * velocita;
    this.tol = Math.max(8, Math.round(sr * 0.01));
    this.win = new Float32Array(this.N);
    for (let i = 0; i < this.N; i++) this.win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / this.N);
    this.inp = Array.from({ length: canali }, () => new Float32Array(this.N * 8));
    this.acc = Array.from({ length: canali }, () => new Float32Array(this.N));
  }

  /** dà campioni in ingresso (un array per canale) e ritorna quelli pronti in uscita */
  push(ch: Float32Array[]): Float32Array[] {
    const n = ch[0]?.length ?? 0;
    if (n) {
      if (this.lung + n > this.inp[0].length) {
        const nuova = Math.max(this.inp[0].length * 2, this.lung + n);
        this.inp = this.inp.map((a) => { const b = new Float32Array(nuova); b.set(a.subarray(0, this.lung)); return b; });
      }
      for (let c = 0; c < this.canali; c++) this.inp[c].set(ch[Math.min(c, ch.length - 1)], this.lung);
      this.lung += n;
    }
    return this.gira(false);
  }

  /** finito l'ingresso: tutto il resto */
  fine(): Float32Array[] { return this.gira(true); }

  private gira(chiuso: boolean): Float32Array[] {
    const { N, Hs, Ha, tol } = this;
    const pezzi: Float32Array[][] = [];
    for (;;) {
      const pos = Math.round(this.k * Ha);
      const totale = this.base + this.lung;
      if (chiuso ? pos >= totale : totale < pos + tol + N) break;
      let scelto = 0;
      if (this.k > 0) scelto = this.cerca(pos, totale);
      this.sel = scelto;
      // si somma il pezzo, con la finestra
      for (let c = 0; c < this.canali; c++) {
        const a = this.acc[c], x = this.inp[c];
        for (let i = 0; i < N; i++) {
          const j = scelto + i - this.base;
          if (j >= 0 && j < this.lung) a[i] += x[j] * this.win[i];
        }
      }
      // i primi Hs campioni sono definitivi
      pezzi.push(this.acc.map((a) => a.slice(0, Hs)));
      for (const a of this.acc) { a.copyWithin(0, Hs); a.fill(0, Hs); }
      this.usciti += Hs;
      this.k++;
      // via l'ingresso che non serve più
      const dopo = Math.round(this.k * Ha);
      const tieni = Math.max(0, Math.min(dopo - tol, this.sel + Hs));
      if (tieni - this.base > this.N * 4) {
        const d = tieni - this.base;
        for (const a of this.inp) a.copyWithin(0, d, this.lung);
        this.lung -= d; this.base += d;
      }
    }
    return unisci(pezzi, this.canali);
  }

  /** dov'è il pezzo che continua meglio quello di prima, attorno alla posizione */
  private cerca(pos: number, totale: number): number {
    const { Hs, tol } = this;
    const x = this.inp[0], b = this.base;
    const rif = this.sel + Hs; // la continuazione naturale (assoluta)
    const val = (i: number) => { const j = i - b; return j >= 0 && j < this.lung ? x[j] : 0; };
    const lo = Math.max(b, pos - tol), hi = Math.min(totale - 1, pos + tol);
    if (hi <= lo) return Math.max(b, Math.min(pos, totale - 1));
    const punteggio = (c: number, passo: number) => {
      let num = 0, en = 1e-9;
      for (let i = 0; i < Hs; i += passo) { const v = val(c + i); num += v * val(rif + i); en += v * v; }
      return num / Math.sqrt(en);
    };
    // prima a passi di 4 (in fretta), poi si affina attorno al migliore
    let best = lo, bs = -Infinity;
    for (let c = lo; c <= hi; c += 4) { const s = punteggio(c, 4); if (s > bs) { bs = s; best = c; } }
    let fine = best; bs = -Infinity;
    for (let c = Math.max(lo, best - 4); c <= Math.min(hi, best + 4); c++) { const s = punteggio(c, 1); if (s > bs) { bs = s; fine = c; } }
    return fine;
  }
}

function unisci(pezzi: Float32Array[][], canali: number): Float32Array[] {
  const tot = pezzi.reduce((s, p) => s + p[0].length, 0);
  const out = Array.from({ length: canali }, () => new Float32Array(tot));
  let o = 0;
  for (const p of pezzi) { for (let c = 0; c < canali; c++) out[c].set(p[c], o); o += p[0].length; }
  return out;
}

/** tutto un suono in una volta (per le prove e per i pezzi corti) */
export function stiraTutto(ch: Float32Array[], sr: number, velocita: number): Float32Array[] {
  const s = new Stiratore(ch.length, sr, velocita);
  const a = s.push(ch), b = s.fine();
  const out = a.map((x, c) => { const y = new Float32Array(x.length + b[c].length); y.set(x); y.set(b[c], x.length); return y; });
  // l'ultimo tratto va tagliato alla lunghezza giusta
  const giusta = Math.round(ch[0].length / velocita);
  return out.map((x) => x.subarray(0, Math.min(x.length, giusta)));
}
