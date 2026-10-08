// I dialoghi scritti a mano (1.4.0): "Marco: Ciao!" una battuta per riga diventa una fila di sottotitoli col nome di
// chi parla (Sottotitolo.chi), coi tempi stimati da quanto è lunga la battuta. Ogni personaggio ha la sua voce AI
// (Sottotitoli.voci), così la voce fuori campo o il doppiaggio si fanno con un clic. Puro: si prova anche da Node.
import type { Sottotitolo } from './tipi';

export interface Battuta { chi: string; testo: string }

/** chi parla senza nome (una riga senza "Nome:") */
export const NARRATORE = 'Narratore';

/** le velocità di lettura: caratteri al secondo (come si contano nei sottotitoli professionali) */
export const RITMI: { id: string; nome: string; cps: number }[] = [
  { id: 'lento', nome: 'Lento', cps: 12 },
  { id: 'normale', nome: 'Normale', cps: 15 },
  { id: 'veloce', nome: 'Veloce', cps: 18 },
];

/**
 * Il testo del dialogo → le battute. "Nome: testo" (o "NOME - testo"); le righe senza nome sono del narratore, o
 * continuano la battuta di prima se cominciano con uno spazio; le righe vuote si saltano; "(pausa)" o "..." da soli
 * sono una pausa (testo vuoto).
 */
export function leggiDialogo(testo: string): Battuta[] {
  const out: Battuta[] = [];
  for (const grezza of testo.replace(/\r/g, '').split('\n')) {
    if (!grezza.trim()) continue;
    if (/^\s*(\(pausa\)|\.{3}|…)\s*$/i.test(grezza)) { out.push({ chi: '', testo: '' }); continue; }
    const m = /^\s*([^:\-–—]{1,28}?)\s*(?::|\s[-–—])\s+(.+)$/.exec(grezza);
    if (m && !/^\d/.test(m[1]) && m[1].split(/\s+/).length <= 3) { out.push({ chi: pulisciNome(m[1]), testo: m[2].trim() }); continue; }
    const prima = out[out.length - 1];
    if (/^\s/.test(grezza) && prima && prima.testo) prima.testo += ' ' + grezza.trim();
    else out.push({ chi: NARRATORE, testo: grezza.trim() });
  }
  return out;
}

const pulisciNome = (s: string) => {
  const n = s.trim().replace(/^[-–—*•]+\s*/, '');
  return n.charAt(0).toUpperCase() + n.slice(1);
};

/** chi parla, nell'ordine in cui compare */
export const personaggi = (b: Battuta[]) => [...new Set(b.filter((x) => x.chi && x.testo).map((x) => x.chi))];

/** quanti secondi ci vogliono per dire una battuta: almeno 1,2 s, al massimo 7 (poi si va a capo in un'altra riga) */
export function durataBattuta(testo: string, cps: number): number {
  const n = testo.replace(/\s+/g, ' ').trim().length;
  // le pause di punteggiatura allungano un po'
  const pause = (testo.match(/[,;:]/g)?.length ?? 0) * 0.15 + (testo.match(/[.!?…]/g)?.length ?? 0) * 0.25;
  return Math.max(1.2, Math.min(7, n / Math.max(5, cps) + pause));
}

/** una battuta lunga si spezza in pezzi da dire uno dopo l'altro (alla fine di una frase, o a una virgola) */
export function spezza(testo: string, max = 84): string[] {
  if (testo.length <= max) return [testo];
  const out: string[] = [];
  let resto = testo;
  while (resto.length > max) {
    const finestra = resto.slice(0, max);
    let k = Math.max(finestra.lastIndexOf('. '), finestra.lastIndexOf('! '), finestra.lastIndexOf('? '));
    if (k < max * 0.4) k = finestra.lastIndexOf(', ');
    if (k < max * 0.4) k = finestra.lastIndexOf(' ');
    if (k <= 0) k = max - 1;
    out.push(resto.slice(0, k + 1).trim());
    resto = resto.slice(k + 1).trim();
  }
  if (resto) out.push(resto);
  return out;
}

/**
 * Le battute → le righe dei sottotitoli in fotogrammi, a partire da f0. pausa = secondi fra una battuta e l'altra
 * (fra due pezzi della stessa battuta la metà). id = chi fa gli id nuovi.
 */
export function righeDialogo(b: Battuta[], f0: number, fpsReale: number, o: { cps: number; pausa: number }, id: () => string): Sottotitolo[] {
  const out: Sottotitolo[] = [];
  let t = f0 / fpsReale;
  for (const x of b) {
    if (!x.testo) { t += Math.max(0.6, o.pausa * 2); continue; }
    const pezzi = spezza(x.testo);
    pezzi.forEach((pz, i) => {
      const d = durataBattuta(pz, o.cps);
      const da = Math.round(t * fpsReale), a = Math.max(da + 2, Math.round((t + d) * fpsReale));
      out.push({ id: id(), da, a, testo: pz, chi: x.chi === NARRATORE && personaggi(b).length <= 1 ? undefined : x.chi });
      t += d + (i < pezzi.length - 1 ? o.pausa / 2 : o.pausa);
    });
  }
  return out;
}

/** le voci dei personaggi: chi ce l'ha già la tiene, gli altri prendono la prima libera (5 voci, poi si ricomincia) */
export function vociPer(chi: string[], gia: Record<string, number> = {}, quante = 5): Record<string, number> {
  const out: Record<string, number> = { ...gia };
  const usate = new Set(Object.values(out));
  for (const c of chi) {
    if (c in out) continue;
    let v = 0;
    while (usate.has(v) && v < quante) v++;
    if (v >= quante) v = Object.keys(out).length % quante;
    out[c] = v;
    usate.add(v);
  }
  return out;
}

/** il dialogo scritto di nuovo come testo (per riaprirlo e correggerlo) */
export function scriviDialogo(righe: Sottotitolo[]): string {
  return righe.map((r) => (r.chi ? `${r.chi}: ${r.testo}` : r.testo)).join('\n');
}
