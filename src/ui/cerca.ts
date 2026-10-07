// La ricerca dei comandi (Ctrl+K, o il pulsante 🔍 in alto): si scrive quello che si vuole fare ("rallenta",
// "sottotitoli", "togli lo sfondo", "neon", "dissolvenza") e lo si trova, con il suo tasto accanto. Dentro ci sono tutti
// i comandi registrati in src/azioni.ts (anche quelli di app.ts) e le "fonti" che si iscrivono qui: pagine, funzioni AI,
// transizioni, effetti, titoli, animazioni, generatori e le guide. Le ultime cose fatte stanno in cima.
import { azioni } from '../azioni';
import { avviso, h } from './dom';

export type CatCerca = 'Comandi' | 'Pagine' | 'AI' | 'Guida' | 'Transizioni' | 'Effetti a tempo' | 'Effetti sulla clip' | 'Titoli' | 'Animazioni' | 'Generatori';

export interface VoceCerca {
  id: string;
  titolo: string;
  /** a cosa serve, o dove sta */
  sotto?: string;
  cat: CatCerca;
  tasto?: string;
  /** parole in più per trovarla (sinonimi, inglese) */
  parole?: string;
  fn: () => void;
  /** se non si può fare adesso, il perché ("scegli prima una clip") */
  manca?: () => string | null;
}

const fonti: (() => VoceCerca[])[] = [];
/** chi ha qualcosa da far trovare si iscrive qui (la lista si rifà ogni volta che si apre la ricerca) */
export const fonteCerca = (f: () => VoceCerca[]) => { fonti.push(f); };

/** sinonimi: chi cerca con altre parole (o in inglese) trova lo stesso */
const SINONIMI: Record<string, string> = {
  taglia: 'split cut dividi', elimina: 'cancella togli delete rimuovi', annulla: 'undo indietro', ripeti: 'redo',
  velocita: 'rallenta accelera slow motion veloce speed ralenti', sottotitoli: 'srt caption trascrivi testo parlato',
  sfondo: 'green screen chroma scontorna ritaglia background', titolo: 'testo scritta text title',
  dissolvenza: 'fade mix incrociata', esporta: 'export render salva video mp4', importa: 'import aggiungi carica file',
  volume: 'audio livello gain', colore: 'color grading look', transizione: 'transition passaggio',
  effetto: 'effect filtro fx', registra: 'record schermo screen', salva: 'save', apri: 'open', nuovo: 'new',
};

export const normalizza = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const parole = (s: string) => normalizza(s).split(/[^a-z0-9+]+/).filter(Boolean);

/** quanto una voce risponde alla ricerca (0 = per niente): il titolo conta di più, ogni parola cercata deve esserci */
export function punteggio(v: VoceCerca, q: string): number {
  const qq = normalizza(q).trim();
  if (!qq) return 1;
  const tit = normalizza(v.titolo);
  const pt = parole(v.titolo);
  const altro = normalizza([v.sotto, v.parole, v.cat, v.tasto].filter(Boolean).join(' '));
  const pa = altro.split(/[^a-z0-9+]+/).filter(Boolean);
  const extra = pt.concat(pa).map((w) => SINONIMI[w] ?? '').join(' ');
  const pe = extra.split(' ').filter(Boolean);
  let s = 0;
  for (const tk of qq.split(/\s+/)) {
    if (pt.some((w) => w.startsWith(tk))) s += 6;
    else if (tit.includes(tk)) s += 4;
    else if (pa.some((w) => w.startsWith(tk))) s += 2;
    else if (tk.length >= 3 && altro.includes(tk)) s += 1;
    else if (pe.some((w) => w.startsWith(tk))) s += 1.5;
    else return 0;
  }
  if (tit === qq) s += 10;
  else if (tit.startsWith(qq)) s += 5;
  if (v.cat === 'Comandi' || v.cat === 'AI' || v.cat === 'Pagine') s += 0.5;
  return s;
}

const tastoBello = (t?: string) => t?.replace('ArrowLeft', '←').replace('ArrowRight', '→').replace('ArrowUp', '↑').replace('ArrowDown', '↓').replace('Space', 'Spazio');

/** tutte le voci: i comandi registrati e quelle delle fonti (senza doppioni di id) */
export function tutteLeVoci(): VoceCerca[] {
  const out = new Map<string, VoceCerca>();
  for (const a of azioni.values()) {
    out.set('az:' + a.id, { id: 'az:' + a.id, titolo: a.nome, sotto: a.info ?? a.gruppo, cat: 'Comandi', tasto: tastoBello(a.tasti?.[0]), parole: a.gruppo, fn: a.fn });
  }
  for (const f of fonti) for (const v of f()) if (!out.has(v.id)) out.set(v.id, v);
  return [...out.values()];
}

const CHIAVE = 'dpv-cerca-recenti';
function recenti(): string[] { try { const l = JSON.parse(localStorage.getItem(CHIAVE) ?? '[]'); return Array.isArray(l) ? l : []; } catch { return []; } }
function ricorda(id: string) { try { localStorage.setItem(CHIAVE, JSON.stringify([id, ...recenti().filter((x) => x !== id)].slice(0, 8))); } catch { /* niente */ } }

/** le cose che si consigliano a chi non ha ancora scritto niente */
const CONSIGLIATI = ['az:importa', 'guida:inizio', 'ai:sottotitoli', 'ai:sfondo', 'az:velocita', 'az:genTitolo', 'az:esporta', 'az:centroAI'];

/** i risultati per una ricerca (i recenti contano un po' di più) */
export function risultati(q: string, voci = tutteLeVoci(), max = 60): VoceCerca[] {
  const rec = recenti();
  if (!q.trim()) {
    const per = new Map(voci.map((v) => [v.id, v]));
    const ids = [...rec, ...CONSIGLIATI.filter((x) => !rec.includes(x))];
    return ids.map((id) => per.get(id)).filter((v): v is VoceCerca => !!v).slice(0, 12);
  }
  return voci.map((v) => ({ v, s: punteggio(v, q) + (rec.includes(v.id) ? 1.5 : 0) }))
    .filter((x) => x.s > 0.4)
    .sort((a, b) => b.s - a.s || a.v.titolo.localeCompare(b.v.titolo))
    .slice(0, max).map((x) => x.v);
}

let aperta: HTMLElement | null = null;

/** apre la ricerca (se è già aperta, la chiude) */
export function apriCerca(iniziale = '') {
  if (aperta) { chiudi(); return; }
  const voci = tutteLeVoci();
  const input = h('input', { class: 'cerca-input', type: 'search', placeholder: 'Cosa vuoi fare? (es. sottotitoli, rallenta, togli lo sfondo, dissolvenza, titolo neon)', 'aria-label': 'Cerca un comando', spellcheck: 'false', autocomplete: 'off' }) as HTMLInputElement;
  const lista = h('div', { class: 'cerca-lista', role: 'listbox' });
  const testa = h('div', { class: 'cerca-intesta' });
  let trovati: VoceCerca[] = [];
  let scelto = 0;
  const fai = (v: VoceCerca) => {
    const motivo = v.manca?.();
    chiudi();
    ricorda(v.id);
    if (motivo) { avviso(motivo, 'info', 2600); return; }
    // dopo che la ricerca si è chiusa (il fuoco torna al banco); la pagina iniziale, se c'è, si toglie di mezzo
    document.dispatchEvent(new CustomEvent('dpv:home-nascondi'));
    setTimeout(() => v.fn(), 0);
  };
  const disegna = () => {
    trovati = risultati(input.value, voci);
    scelto = Math.min(scelto, Math.max(0, trovati.length - 1));
    testa.textContent = input.value.trim() ? (trovati.length ? `${trovati.length} risultati` : 'Niente: prova con altre parole') : 'Ultimi usati e consigliati';
    lista.replaceChildren(...trovati.map((v, i) => {
      const motivo = v.manca?.() ?? null;
      const el = h('div', { class: 'cerca-voce' + (i === scelto ? ' scelta' : '') + (motivo ? ' manca' : ''), role: 'option', 'data-id': v.id, on: {
        click: () => fai(v),
        pointermove: () => { if (scelto !== i) { scelto = i; segna(); } },
      } },
      h('span', { class: 'cerca-cat', 'data-cat': v.cat }, v.cat),
      h('span', { class: 'cerca-testo' }, h('b', null, v.titolo), v.sotto || motivo ? h('small', null, motivo ? `${v.sotto ? v.sotto + ' · ' : ''}⚠ ${motivo}` : v.sotto!) : null),
      v.tasto ? h('kbd', null, v.tasto) : null);
      return el;
    }));
  };
  const segna = () => {
    lista.querySelectorAll('.cerca-voce').forEach((el, i) => el.classList.toggle('scelta', i === scelto));
    (lista.children[scelto] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
  };
  input.addEventListener('input', () => { scelto = 0; disegna(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); scelto = Math.min(trovati.length - 1, scelto + 1); segna(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); scelto = Math.max(0, scelto - 1); segna(); }
    else if (e.key === 'Enter') { e.preventDefault(); const v = trovati[scelto]; if (v) fai(v); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); chiudi(); }
    // Ctrl+K con la ricerca aperta la chiude
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); chiudi(); }
  });
  aperta = h('div', { class: 'cerca-velo', on: { pointerdown: (e: PointerEvent) => { if (e.target === aperta) chiudi(); } } },
    h('div', { class: 'cerca', role: 'dialog', 'aria-label': 'Cerca un comando' },
      h('div', { class: 'cerca-riga' }, h('span', { class: 'cerca-lente' }, '🔍'), input),
      testa, lista,
      h('div', { class: 'cerca-piede' }, h('span', null, h('kbd', null, '↑'), h('kbd', null, '↓'), ' scegli'), h('span', null, h('kbd', null, 'Invio'), ' fai'), h('span', null, h('kbd', null, 'Esc'), ' chiudi'), h('span', { class: 'spazio' }), h('span', null, 'Trovi comandi, effetti, transizioni, titoli, AI e guide'))));
  document.body.appendChild(aperta);
  input.value = iniziale;
  disegna();
  // il fuoco subito (se arrivasse dopo, le prime lettere scritte finirebbero al banco come tasti di montaggio)
  input.focus();
  setTimeout(() => { if (document.activeElement !== input) input.focus(); }, 0);
}

function chiudi() {
  aperta?.remove();
  aperta = null;
}

export const cercaAperta = () => !!aperta;
