// I preset di DaProdMontage: ognuno è una ricetta per una festa o una cerimonia. Dice quanto sta ogni foto, come si
// muove, che transizioni si usano, che colore ha, quali animazioni mettere in apertura e in chiusura (src/core/animazioni.ts),
// cosa cade sopra (cuori, petali, coriandoli…) e quali effetti a tempo mettere sui tagli. Il motore (src/core/montage.ts)
// legge la ricetta e monta da solo foto e video: funziona anche con sole foto.
import type { AnimSpec } from './tipi';
import { nuovaAnim } from './animazioni';

export type CategoriaMontage = 'cerimonie' | 'famiglia' | 'feste' | 'viaggi' | 'sport' | 'social' | 'ricordi';
export const CATEGORIE_MONTAGE: { id: CategoriaMontage; nome: string }[] = [
  { id: 'cerimonie', nome: 'Cerimonie' }, { id: 'famiglia', nome: 'Famiglia' }, { id: 'feste', nome: 'Feste' },
  { id: 'viaggi', nome: 'Viaggi e natura' }, { id: 'sport', nome: 'Sport e serate' }, { id: 'ricordi', nome: 'Ricordi' }, { id: 'social', nome: 'Social e lavoro' },
];

/** quello che l'utente scrive (tutto facoltativo): il motore se lo ricorda e lo dà alle animazioni */
export interface TestiMontage { titolo: string; sottotitolo: string; nomi: string; data: string }

/** come si muove una foto lungo la sua durata (Ken Burns) */
export type Moto = 'zoomIn' | 'zoomOut' | 'panSx' | 'panDx' | 'panSu' | 'panGiu' | 'diagonale' | 'fermo';

/** un'animazione che cade sopra il montaggio fra due punti (frazioni 0..1 della durata) */
export interface Sovrapposizione { anim: string; v?: Record<string, string | number | boolean> | ((t: TestiMontage) => Record<string, string | number | boolean>); da: number; a: number }

/** un effetto a tempo da posare: sui tagli (ogni n tagli), a intervalli regolari (ogni n secondi) o su tutto il montaggio */
export type EffettoPiano =
  | { id: string; quando: 'tagli'; ogni: number; durata: number }
  | { id: string; quando: 'intervalli'; ogni: number; durata: number; da?: number }
  | { id: string; quando: 'tutto'; durata?: number };

export interface PresetMontage {
  id: string;
  nome: string;
  emoji: string;
  categoria: CategoriaMontage;
  info: string;
  /** quali testi chiede, col suggerimento dentro la casella */
  chiede: Partial<Record<keyof TestiMontage, string>>;
  /** secondi per foto: minimo, tipico, massimo */
  foto: [number, number, number];
  /** secondi di ogni spezzone di video: tipico e massimo */
  video: [number, number];
  moto: Moto[];
  /** di quanto si zooma o si sposta (0.05 = 5%) */
  forzaMoto: number;
  /** il gradiente dietro le foto che non riempiono il quadro */
  sfondo: [string, string];
  /** gli effetti al volo di ogni clip (src/effetti.ts): caldo, cinema, sogno… */
  look: string[];
  transizioni: string[];
  /** quanto durano le transizioni (secondi) */
  durTr: number;
  apertura?: (t: TestiMontage) => AnimSpec | null;
  chiusura?: (t: TestiMontage) => AnimSpec | null;
  sovrapposizioni: Sovrapposizione[];
  effetti: EffettoPiano[];
  /** un consiglio sul tipo di musica da mettere */
  musica: string;
  ritmo: 'lento' | 'medio' | 'veloce';
  /** si monta in verticale o in quadrato (se il progetto è vuoto) */
  formato?: 'verticale' | 'quadrato';
}

const A = (id: string, v: Record<string, string | number | boolean> = {}) => nuovaAnim(id, v);
const vuoto = (s: string) => !s.trim();

/** le iniziali dei nomi: "Anna e Marco" → "A & M" */
export function iniziali(nomi: string): string {
  const parti = nomi.split(/\s*(?:\be\b|&|\+|,|\/|e\s)\s*/i).map((s) => s.trim()).filter(Boolean);
  const ini = parti.map((s) => s[0].toUpperCase());
  return ini.length ? ini.slice(0, 3).join(' & ') : '';
}

// ——— le aperture e le chiusure più usate ———
const titoloCon = (def: string, font = 'playfair', sotto = '') => (t: TestiMontage) =>
  A('tx-titolo', { titolo: vuoto(t.titolo) ? (t.nomi || def) : t.titolo, sottotitolo: vuoto(t.sottotitolo) ? (sotto ? sotto : t.data) : t.sottotitolo, font });
const monogramma = (def: string, font = 'playfair') => (t: TestiMontage): AnimSpec => {
  if (vuoto(t.nomi)) return A('tx-titolo', { titolo: vuoto(t.titolo) ? def : t.titolo, sottotitolo: t.sottotitolo || t.data, font });
  return A('cr-monogramma', { iniziali: iniziali(t.nomi), nomi: t.nomi, data: t.data, font });
};
const cornice = (def: string, sotto: string) => (t: TestiMontage): AnimSpec => A('cr-cornice', { titolo: vuoto(t.titolo) ? (t.nomi || def) : t.titolo, sotto: vuoto(t.sottotitolo) ? (t.data ? `${sotto} · ${t.data}` : sotto) : t.sottotitolo });
const dedica = (testo: string) => (t: TestiMontage): AnimSpec => A('cr-dedica', { testo, firma: t.nomi ? '— ' + t.nomi : '' });
const grazie = (sotto: string) => (t: TestiMontage): AnimSpec => A('tx-titolo', { titolo: 'Grazie', sottotitolo: vuoto(t.nomi) ? sotto : t.nomi, font: 'playfair' });
const colpo = (def: string) => (t: TestiMontage): AnimSpec => A('tx-colpo', { testo: (vuoto(t.titolo) ? (t.nomi || def) : t.titolo).toUpperCase() });
const auguri = (def: string, c1: string, c2: string) => (t: TestiMontage): AnimSpec => A('cr-auguri', { testo: vuoto(t.titolo) ? def : t.titolo, sotto: vuoto(t.sottotitolo) ? t.nomi : t.sottotitolo, colore: c1, colore2: c2 });

export const PRESET_MONTAGE: PresetMontage[] = [
  // ——— cerimonie ———
  {
    id: 'matrimonio', nome: 'Matrimonio romantico', emoji: '💍', categoria: 'cerimonie', info: 'dolce e luminoso: dissolvenze lente, petali, monogramma dorato',
    chiede: { nomi: 'Anna e Marco', data: '12 giugno 2026', titolo: 'Il nostro matrimonio' },
    foto: [3.5, 5, 8], video: [7, 14], moto: ['zoomIn', 'panSx', 'zoomOut', 'panDx'], forzaMoto: 0.1,
    sfondo: ['#f7efe2', '#d8c7a4'], look: ['caldo', 'sogno'], transizioni: ['mix', 'mix', 'dip'], durTr: 1.1,
    apertura: monogramma('Il nostro matrimonio'), chiusura: dedica('Il giorno più bello\nè quello in cui\nsiamo stati insieme'),
    sovrapposizioni: [{ anim: 'cr-petali', da: 0.1, a: 0.3 }, { anim: 'cr-scintille', da: 0.45, a: 0.58 }, { anim: 'cr-petali', da: 0.72, a: 0.9 }],
    effetti: [{ id: 'sogno', quando: 'intervalli', ogni: 24, durata: 3 }],
    musica: 'pianoforte e archi, lento e romantico', ritmo: 'lento',
  },
  {
    id: 'matrimonio-cinema', nome: 'Matrimonio da film', emoji: '🎬', categoria: 'cerimonie', info: 'bande da cinema, colori da film, movimenti lenti',
    chiede: { nomi: 'Anna e Marco', data: '12 giugno 2026', titolo: 'Una storia d\'amore' },
    foto: [4, 6, 9], video: [8, 16], moto: ['zoomIn', 'panDx', 'zoomOut', 'panSx', 'diagonale'], forzaMoto: 0.12,
    sfondo: ['#14110f', '#050404'], look: ['cinema', 'vignetta'], transizioni: ['mix', 'dip', 'mix'], durTr: 1.2,
    apertura: titoloCon('Una storia d\'amore'), chiusura: (t) => A('cr-data', { giorno: t.data.match(/\d+/)?.[0] ?? '12', mese: (t.data.replace(/\d+/g, '').trim().split(/\s+/)[0] || 'GIUGNO').toUpperCase(), anno: t.data.match(/\d{4}/)?.[0] ?? '2026', nomi: t.nomi }),
    sovrapposizioni: [{ anim: 'bg-luce', da: 0.2, a: 0.28 }, { anim: 'bg-luce', da: 0.6, a: 0.68 }],
    effetti: [{ id: 'bande', quando: 'tutto' }],
    musica: 'colonna sonora orchestrale, emozionante', ritmo: 'lento',
  },
  {
    id: 'fidanzamento', nome: 'Proposta e fidanzamento', emoji: '💞', categoria: 'cerimonie', info: 'cuori che salgono e tanta tenerezza',
    chiede: { nomi: 'Giulia e Luca', data: '14 febbraio', titolo: 'Ha detto sì!' },
    foto: [3, 4.5, 7], video: [6, 12], moto: ['zoomIn', 'zoomOut', 'panSx'], forzaMoto: 0.1,
    sfondo: ['#ffe3ea', '#f6aabd'], look: ['caldo', 'sogno'], transizioni: ['mix', 'dve:351'], durTr: 0.9,
    apertura: cornice('Ha detto sì!', 'fidanzati'), chiusura: grazie('con amore'),
    sovrapposizioni: [{ anim: 'cr-cuori', da: 0.08, a: 0.35 }, { anim: 'cr-cuori', da: 0.62, a: 0.92 }],
    effetti: [{ id: 'flash', quando: 'tagli', ogni: 6, durata: 0.5 }],
    musica: 'pop romantico, piano e voce', ritmo: 'medio',
  },
  {
    id: 'battesimo', nome: 'Battesimo', emoji: '🕊️', categoria: 'cerimonie', info: 'azzurro e bianco, scintille leggere, tutto morbido',
    chiede: { nomi: 'Sofia', data: '20 aprile 2026', titolo: 'Il battesimo di' },
    foto: [3.5, 5, 7.5], video: [6, 12], moto: ['zoomIn', 'zoomOut', 'panDx', 'panSx'], forzaMoto: 0.09,
    sfondo: ['#eef6ff', '#c5dcf2'], look: ['luminoso', 'sogno'], transizioni: ['mix', 'mix', 'dve:351'], durTr: 1,
    apertura: cornice('Il battesimo', 'battesimo'), chiusura: dedica('Benvenuto nella\nnostra grande famiglia'),
    sovrapposizioni: [{ anim: 'cr-scintille', v: { colore: '#ffffff' }, da: 0.1, a: 0.35 }, { anim: 'bg-bokeh', v: { colore: '#bfe0ff', colore2: '#ffffff' }, da: 0.55, a: 0.8 }],
    effetti: [{ id: 'sogno', quando: 'intervalli', ogni: 30, durata: 3 }],
    musica: 'carillon e archi dolci', ritmo: 'lento',
  },
  {
    id: 'comunione', nome: 'Prima Comunione', emoji: '✝️', categoria: 'cerimonie', info: 'bianco e oro, luce calda, scintille dorate',
    chiede: { nomi: 'Marco', data: '10 maggio 2026', titolo: 'La Prima Comunione di' },
    foto: [3.5, 5, 7.5], video: [6, 12], moto: ['zoomIn', 'panSx', 'zoomOut', 'panDx'], forzaMoto: 0.09,
    sfondo: ['#fffaf0', '#e6d6a8'], look: ['luminoso', 'caldo'], transizioni: ['mix', 'dip', 'mix'], durTr: 1,
    apertura: monogramma('La Prima Comunione'), chiusura: dedica('Un giorno di luce\nche non dimenticheremo'),
    sovrapposizioni: [{ anim: 'cr-scintille', da: 0.1, a: 0.4 }, { anim: 'cr-scintille', da: 0.65, a: 0.92 }],
    effetti: [{ id: 'luce', quando: 'intervalli', ogni: 28, durata: 2.5, da: 10 }],
    musica: 'organo e coro, solenne e sereno', ritmo: 'lento',
  },
  {
    id: 'cresima', nome: 'Cresima', emoji: '🕯️', categoria: 'cerimonie', info: 'sobrio ed elegante, toni caldi e oro',
    chiede: { nomi: 'Francesca', data: '7 giugno 2026', titolo: 'La Cresima di' },
    foto: [3.5, 5, 7], video: [6, 12], moto: ['zoomIn', 'zoomOut', 'panDx'], forzaMoto: 0.08,
    sfondo: ['#2a1a1f', '#0f0709'], look: ['cinema', 'caldo'], transizioni: ['mix', 'dip'], durTr: 1.1,
    apertura: cornice('La Cresima', 'cresima'), chiusura: grazie('con affetto'),
    sovrapposizioni: [{ anim: 'cr-scintille', da: 0.2, a: 0.45 }],
    effetti: [], musica: 'archi e pianoforte, composto', ritmo: 'lento',
  },
  {
    id: 'laurea', nome: 'Laurea', emoji: '🎓', categoria: 'cerimonie', info: 'coriandoli, titolo grande e ritmo allegro',
    chiede: { nomi: 'Giulia Rossi', titolo: 'Dottoressa in Lettere', data: '18 luglio 2026' },
    foto: [3, 4.5, 7], video: [6, 12], moto: ['zoomIn', 'panSx', 'zoomOut', 'panDx'], forzaMoto: 0.1,
    sfondo: ['#1d2f5c', '#0a1330'], look: ['vivace', 'contrasto'], transizioni: ['dve:301', 'mix', 'dve:351'], durTr: 0.8,
    apertura: titoloCon('Dottore!', 'montserrat', 'Laurea 2026'), chiusura: dedica('Il traguardo è solo\nl\'inizio del viaggio'),
    sovrapposizioni: [{ anim: 'cr-coriandoli', da: 0.02, a: 0.1 }, { anim: 'cr-coriandoli', da: 0.9, a: 0.98 }],
    effetti: [{ id: 'flash', quando: 'tagli', ogni: 8, durata: 0.4 }],
    musica: 'pop allegro e solare', ritmo: 'medio',
  },

  // ——— famiglia ———
  {
    id: 'anniversario', nome: 'Anniversario', emoji: '❤️', categoria: 'famiglia', info: 'una vita insieme: tono vintage, cuori e petali',
    chiede: { nomi: 'Maria e Giuseppe', data: '50 anni insieme', titolo: 'Per sempre' },
    foto: [3.5, 5, 8], video: [7, 14], moto: ['zoomIn', 'zoomOut', 'panSx', 'panDx'], forzaMoto: 0.1,
    sfondo: ['#f2e6d2', '#bda47a'], look: ['sbiadito', 'caldo', 'vignetta'], transizioni: ['mix', 'mix', 'dip'], durTr: 1.1,
    apertura: titoloCon('Per sempre', 'playfair', '50 anni insieme'), chiusura: dedica('Ogni giorno con te\nè il giorno più bello'),
    sovrapposizioni: [{ anim: 'cr-cuori', da: 0.15, a: 0.3 }, { anim: 'cr-petali', da: 0.7, a: 0.9 }],
    effetti: [], musica: 'swing lento o canzone d\'epoca', ritmo: 'lento',
  },
  {
    id: 'nascita', nome: 'Nascita e primi mesi', emoji: '👶', categoria: 'famiglia', info: 'colori pastello, stelline e dolcezza',
    chiede: { nomi: 'Alice', data: 'nata il 3 marzo 2026', titolo: 'Benvenuta' },
    foto: [3.5, 5, 7.5], video: [6, 12], moto: ['zoomIn', 'zoomOut', 'panSx'], forzaMoto: 0.09,
    sfondo: ['#fff1f4', '#cfe6ff'], look: ['luminoso', 'sogno'], transizioni: ['mix', 'dve:351', 'mix'], durTr: 1,
    apertura: cornice('Benvenuta', 'nata'), chiusura: grazie('con tutto l\'amore'),
    sovrapposizioni: [{ anim: 'cr-scintille', v: { colore: '#ffffff' }, da: 0.1, a: 0.4 }, { anim: 'bg-bokeh', v: { colore: '#ffd1dc', colore2: '#cfe6ff' }, da: 0.55, a: 0.85 }],
    effetti: [{ id: 'sogno', quando: 'intervalli', ogni: 25, durata: 3 }],
    musica: 'ninna nanna e xilofono', ritmo: 'lento',
  },
  {
    id: 'babyshower', nome: 'Baby shower e gender reveal', emoji: '🍼', categoria: 'famiglia', info: 'palloncini e coriandoli rosa e azzurri',
    chiede: { nomi: 'Elena e Paolo', titolo: 'Sta arrivando!', data: 'giugno 2026' },
    foto: [2.5, 4, 6], video: [5, 10], moto: ['zoomIn', 'zoomOut', 'panDx', 'panSx'], forzaMoto: 0.1,
    sfondo: ['#ffe4ec', '#d6ebff'], look: ['vivace', 'luminoso'], transizioni: ['dve:301', 'mix', 'dve:351'], durTr: 0.8,
    apertura: auguri('Sta arrivando!', '#ff8fb1', '#7ab8ff'), chiusura: grazie('a tutti voi'),
    sovrapposizioni: [{ anim: 'cr-palloncini', v: { colore: '#ff8fb1', colore2: '#7ab8ff', colore3: '#ffffff' }, da: 0.08, a: 0.3 }, { anim: 'cr-coriandoli', v: { colore: '#ff8fb1', colore2: '#7ab8ff', colore3: '#ffffff' }, da: 0.5, a: 0.56 }],
    effetti: [], musica: 'pop allegro e dolce', ritmo: 'medio',
  },
  {
    id: 'natale', nome: 'Natale in famiglia', emoji: '🎄', categoria: 'famiglia', info: 'neve che cade, luci calde e rosso e oro',
    chiede: { titolo: 'Buon Natale', nomi: 'Famiglia Rossi', data: '2026' },
    foto: [3, 4.5, 7], video: [6, 12], moto: ['zoomIn', 'panSx', 'zoomOut', 'panDx'], forzaMoto: 0.1,
    sfondo: ['#3a0d12', '#12060a'], look: ['caldo', 'vignetta'], transizioni: ['mix', 'dve:351', 'mix'], durTr: 0.9,
    apertura: auguri('Buon Natale', '#ffd23f', '#e02d3c'), chiusura: grazie('Buone feste a tutti'),
    sovrapposizioni: [{ anim: 'bg-neve', da: 0.05, a: 0.95 }, { anim: 'bg-bokeh', v: { colore: '#ffcf70', colore2: '#ff7a7a' }, da: 0.3, a: 0.55 }],
    effetti: [], musica: 'canzoni natalizie dolci', ritmo: 'medio',
  },
  {
    id: 'ricordi', nome: 'Ricordi di famiglia', emoji: '📼', categoria: 'ricordi', info: 'colori d\'altri tempi, grana e mirino da videocamera',
    chiede: { titolo: 'Ricordi di famiglia', data: 'estate 1998', nomi: '' },
    foto: [3.5, 5, 8], video: [7, 14], moto: ['zoomIn', 'zoomOut', 'panSx'], forzaMoto: 0.08,
    sfondo: ['#2a241c', '#0d0b08'], look: ['sbiadito', 'pellicola', 'caldo'], transizioni: ['mix', 'mix', 'dip'], durTr: 1.1,
    apertura: (t) => A('tx-scrivi', { testo: vuoto(t.titolo) ? 'Ricordi di famiglia' : t.titolo, font: 'caveat' }), chiusura: dedica('Quello che si vive\nresta per sempre'),
    sovrapposizioni: [{ anim: 'hd-rec', v: (t) => ({ data: (t.data || 'RICORDI').toUpperCase() }), da: 0, a: 1 }],
    effetti: [{ id: 'vhs', quando: 'intervalli', ogni: 22, durata: 1.2, da: 8 }],
    musica: 'una canzone di quegli anni', ritmo: 'lento',
  },
  {
    id: 'tributo', nome: 'In ricordo di…', emoji: '🕯️', categoria: 'ricordi', info: 'bianco e nero, tempi lenti, nessuna festa: solo i ricordi',
    chiede: { nomi: 'Nonna Maria', data: '1938 – 2026', titolo: 'In ricordo di' },
    foto: [4.5, 6.5, 10], video: [8, 16], moto: ['zoomIn', 'zoomOut', 'fermo'], forzaMoto: 0.06,
    sfondo: ['#1b1b1f', '#050506'], look: ['bn', 'sbiadito', 'vignetta'], transizioni: ['mix', 'dip'], durTr: 1.4,
    apertura: (t) => A('tx-titolo', { titolo: vuoto(t.nomi) ? (t.titolo || 'In ricordo') : t.nomi, sottotitolo: t.data || 'sempre con noi', font: 'playfair' }),
    chiusura: dedica('Chi vive nel cuore\nnon muore mai'),
    sovrapposizioni: [], effetti: [], musica: 'pianoforte solo, sereno', ritmo: 'lento',
  },

  // ——— feste ———
  {
    id: 'compleanno', nome: 'Compleanno', emoji: '🎂', categoria: 'feste', info: 'palloncini, coriandoli e colori vivaci',
    chiede: { titolo: 'Buon Compleanno', nomi: 'Sofia', data: '30 anni' },
    foto: [2.5, 3.5, 6], video: [5, 10], moto: ['zoomIn', 'zoomOut', 'panDx', 'panSx', 'diagonale'], forzaMoto: 0.11,
    sfondo: ['#ffe9b5', '#ff9ec2'], look: ['vivace', 'luminoso'], transizioni: ['dve:301', 'mix', 'dve:351', 'dve:321'], durTr: 0.7,
    apertura: auguri('Buon Compleanno', '#ffd23f', '#ff4d6d'), chiusura: colpo('GRAZIE A TUTTI'),
    sovrapposizioni: [{ anim: 'cr-palloncini', da: 0.05, a: 0.3 }, { anim: 'cr-coriandoli', da: 0.48, a: 0.54 }, { anim: 'cr-palloncini', da: 0.7, a: 0.92 }],
    effetti: [{ id: 'flash', quando: 'tagli', ogni: 5, durata: 0.4 }],
    musica: 'pop e dance allegri', ritmo: 'veloce',
  },
  {
    id: 'compleanno-bimbi', nome: 'Festa dei bambini', emoji: '🎈', categoria: 'feste', info: 'colori a palla, palloncini che salgono, ritmo da festa',
    chiede: { titolo: 'Tanti auguri', nomi: 'Leonardo', data: '6 anni' },
    foto: [2.5, 3.5, 5.5], video: [5, 9], moto: ['zoomIn', 'zoomOut', 'diagonale', 'panDx'], forzaMoto: 0.12,
    sfondo: ['#a8e6ff', '#ffe27a'], look: ['pop', 'luminoso'], transizioni: ['dve:301', 'dve:351', 'dve:321', 'mix'], durTr: 0.7,
    apertura: auguri('Tanti auguri', '#ff4d6d', '#35a7ff'), chiusura: colpo('EVVIVA!'),
    sovrapposizioni: [{ anim: 'cr-palloncini', v: { quanti: 18 }, da: 0.04, a: 0.4 }, { anim: 'cr-coriandoli', da: 0.55, a: 0.62 }, { anim: 'cr-palloncini', v: { quanti: 18 }, da: 0.72, a: 0.95 }],
    effetti: [{ id: 'zoomColpo', quando: 'tagli', ogni: 4, durata: 0.4 }],
    musica: 'canzoncine allegre', ritmo: 'veloce',
  },
  {
    id: 'diciottesimo', nome: '18 anni', emoji: '🎉', categoria: 'feste', info: 'festa grossa: luci, stroboscopio e ritmo veloce',
    chiede: { titolo: '18', nomi: 'Martina', data: '18 anni' },
    foto: [2, 3, 5], video: [4, 8], moto: ['zoomIn', 'diagonale', 'zoomOut', 'panSx'], forzaMoto: 0.13,
    sfondo: ['#2a0d4a', '#07020f'], look: ['pop', 'contrasto'], transizioni: ['dve:301', 'dve:351', 'dve:321', 'dve:331'], durTr: 0.6,
    apertura: colpo('18 ANNI'), chiusura: colpo('GRAZIE!'),
    sovrapposizioni: [{ anim: 'bg-bokeh', v: { colore: '#ff3df2', colore2: '#35e8ff', quanti: 30 }, da: 0.1, a: 0.9 }, { anim: 'cr-coriandoli', da: 0.4, a: 0.46 }],
    effetti: [{ id: 'flash', quando: 'tagli', ogni: 3, durata: 0.3 }, { id: 'glitch', quando: 'tagli', ogni: 7, durata: 0.5 }],
    musica: 'dance e pop ritmati', ritmo: 'veloce',
  },
  {
    id: 'addio', nome: 'Addio al celibato / nubilato', emoji: '🥂', categoria: 'feste', info: 'brindisi, scintille e un ritmo da serata',
    chiede: { titolo: 'Ultima notte da single', nomi: 'Chiara', data: '' },
    foto: [2, 3, 5], video: [4, 8], moto: ['zoomIn', 'zoomOut', 'diagonale', 'panDx'], forzaMoto: 0.12,
    sfondo: ['#3a1230', '#0c040a'], look: ['pop', 'caldo'], transizioni: ['dve:301', 'dve:351', 'mix'], durTr: 0.6,
    apertura: colpo('ULTIMA NOTTE DA SINGLE'), chiusura: colpo('CHE SERATA!'),
    sovrapposizioni: [{ anim: 'cr-scintille', v: { quante: 140 }, da: 0.05, a: 0.95 }],
    effetti: [{ id: 'flash', quando: 'tagli', ogni: 4, durata: 0.3 }, { id: 'strobo', quando: 'intervalli', ogni: 25, durata: 1, da: 12 }],
    musica: 'pop e dance', ritmo: 'veloce',
  },
  {
    id: 'capodanno', nome: 'Capodanno', emoji: '🎆', categoria: 'feste', info: 'scintille dorate, coriandoli e notte di festa',
    chiede: { titolo: 'Buon Anno', nomi: '', data: '2027' },
    foto: [2.5, 3.5, 5.5], video: [5, 9], moto: ['zoomIn', 'diagonale', 'zoomOut', 'panSx'], forzaMoto: 0.12,
    sfondo: ['#0e1038', '#030412'], look: ['notte', 'pop'], transizioni: ['dve:301', 'mix', 'dve:351'], durTr: 0.7,
    apertura: (t) => A('dt-contatore', { valore: Number(t.data.match(/\d{4}/)?.[0] ?? 2027), etichetta: vuoto(t.titolo) ? 'Buon Anno' : t.titolo, suffisso: '', colore: '#ffd54a' }), chiusura: colpo('BUON ANNO!'),
    sovrapposizioni: [{ anim: 'cr-scintille', v: { quante: 130 }, da: 0.05, a: 0.95 }, { anim: 'cr-coriandoli', da: 0.9, a: 0.97 }],
    effetti: [{ id: 'flash', quando: 'tagli', ogni: 6, durata: 0.4 }], musica: 'dance e brindisi', ritmo: 'veloce',
  },
  {
    id: 'recita', nome: 'Recita e festa di scuola', emoji: '🎭', categoria: 'feste', info: 'allegro e pulito, con tanti titoli chiari',
    chiede: { titolo: 'Lo spettacolo di fine anno', nomi: 'Classe 3ª B', data: 'giugno 2026' },
    foto: [2.5, 4, 6], video: [6, 12], moto: ['zoomIn', 'panSx', 'zoomOut', 'panDx'], forzaMoto: 0.1,
    sfondo: ['#2b2f7a', '#101240'], look: ['vivace'], transizioni: ['mix', 'dve:301', 'dve:351'], durTr: 0.8,
    apertura: titoloCon('Lo spettacolo', 'montserrat'), chiusura: grazie('a tutti i bravissimi attori'),
    sovrapposizioni: [{ anim: 'cr-coriandoli', da: 0.92, a: 0.99 }],
    effetti: [], musica: 'musica da spettacolo, allegra', ritmo: 'medio',
  },

  // ——— viaggi e natura ———
  {
    id: 'mare', nome: 'Vacanze al mare', emoji: '🏖️', categoria: 'viaggi', info: 'luce piena, colori caldi, onde e ricordi d\'estate',
    chiede: { titolo: 'Estate 2026', nomi: '', data: 'Salento' },
    foto: [2.5, 4, 6], video: [6, 12], moto: ['zoomIn', 'panSx', 'diagonale', 'panDx', 'zoomOut'], forzaMoto: 0.11,
    sfondo: ['#35d0c6', '#1b4f9c'], look: ['vivace', 'tramonto'], transizioni: ['dve:301', 'mix', 'dve:351'], durTr: 0.8,
    apertura: (t) => A('tx-parole', { testo: vuoto(t.titolo) ? 'Estate' : t.titolo + (t.data ? ' · ' + t.data : ''), unita: 'parola' }), chiusura: grazie('di questa bella estate'),
    sovrapposizioni: [{ anim: 'bg-luce', da: 0.3, a: 0.38 }, { anim: 'bg-luce', v: { colore: '#ffd27a' }, da: 0.75, a: 0.83 }],
    effetti: [{ id: 'bagliore', quando: 'intervalli', ogni: 20, durata: 1.5, da: 10 }], musica: 'pop estivo e solare', ritmo: 'medio',
  },
  {
    id: 'viaggio', nome: 'Viaggio e avventura', emoji: '🧳', categoria: 'viaggi', info: 'stile documentario: mirino, mappe di colore e movimenti ampi',
    chiede: { titolo: 'Il nostro viaggio', nomi: '', data: 'Islanda · luglio 2026' },
    foto: [3, 4.5, 7], video: [6, 12], moto: ['zoomIn', 'panSx', 'panDx', 'diagonale', 'zoomOut'], forzaMoto: 0.13,
    sfondo: ['#1c2733', '#070b0f'], look: ['cinema', 'contrasto'], transizioni: ['dve:301', 'dve:321', 'mix', 'dve:351'], durTr: 0.8,
    apertura: titoloCon('Il nostro viaggio', 'oswald'), chiusura: grazie('per averci seguito'),
    sovrapposizioni: [{ anim: 'hd-mirino', v: { etichetta: 'VIAGGIO' }, da: 0, a: 0.08 }],
    effetti: [{ id: 'zoomColpo', quando: 'tagli', ogni: 6, durata: 0.4 }], musica: 'folk e strumentale epico', ritmo: 'medio',
  },
  {
    id: 'montagna', nome: 'Montagna e natura', emoji: '🏔️', categoria: 'viaggi', info: 'colori freschi e puliti, movimenti lenti e ariosi',
    chiede: { titolo: 'Sopra le nuvole', nomi: '', data: 'Dolomiti' },
    foto: [3.5, 5.5, 8], video: [8, 16], moto: ['zoomIn', 'panSx', 'zoomOut', 'panDx', 'panSu'], forzaMoto: 0.11,
    sfondo: ['#cfe3ee', '#6f93a8'], look: ['freddo', 'luminoso'], transizioni: ['mix', 'mix', 'dve:351'], durTr: 1.1,
    apertura: titoloCon('Sopra le nuvole', 'cormorant'), chiusura: grazie('alla natura'),
    sovrapposizioni: [{ anim: 'bg-luce', v: { colore: '#bfe6ff', colore2: '#ffffff' }, da: 0.4, a: 0.48 }],
    effetti: [{ id: 'sogno', quando: 'intervalli', ogni: 30, durata: 3 }], musica: 'chitarra e archi, ariosi', ritmo: 'lento',
  },

  // ——— sport e serate ———
  {
    id: 'sport', nome: 'Sport e tornei', emoji: '⚽', categoria: 'sport', info: 'ritmo da highlights: zoom a colpo, contrasto e titoli forti',
    chiede: { titolo: 'La nostra stagione', nomi: 'ASD Fortitudo', data: '2025/26' },
    foto: [1.8, 2.8, 4.5], video: [4, 8], moto: ['zoomIn', 'diagonale', 'panDx', 'zoomOut'], forzaMoto: 0.14,
    sfondo: ['#0f2a1a', '#030a06'], look: ['contrasto', 'pop'], transizioni: ['dve:301', 'dve:321', 'dve:331', 'dve:351'], durTr: 0.5,
    apertura: colpo('LA NOSTRA STAGIONE'), chiusura: colpo('GRAZIE TIFOSI'),
    sovrapposizioni: [{ anim: 'hd-mirino', v: { etichetta: 'HIGHLIGHTS' }, da: 0, a: 0.06 }],
    effetti: [{ id: 'zoomColpo', quando: 'tagli', ogni: 3, durata: 0.4 }, { id: 'flash', quando: 'tagli', ogni: 6, durata: 0.3 }], musica: 'rock e trap energici', ritmo: 'veloce',
  },
  {
    id: 'concerto', nome: 'Concerto e serata', emoji: '🎸', categoria: 'sport', info: 'luci al neon, bokeh e stroboscopio',
    chiede: { titolo: 'Live', nomi: '', data: 'Estate 2026' },
    foto: [2, 3, 5], video: [4, 8], moto: ['zoomIn', 'diagonale', 'zoomOut'], forzaMoto: 0.13,
    sfondo: ['#1a0a30', '#05020a'], look: ['notte', 'pop'], transizioni: ['dve:301', 'dve:351', 'dve:331'], durTr: 0.6,
    apertura: (t) => A('tx-decodifica', { testo: (vuoto(t.titolo) ? 'LIVE' : t.titolo).toUpperCase(), colore: '#ff3df2' }), chiusura: colpo('GRAZIE!'),
    sovrapposizioni: [{ anim: 'bg-bokeh', v: { colore: '#ff3df2', colore2: '#35e8ff', quanti: 28 }, da: 0.1, a: 0.9 }],
    effetti: [{ id: 'strobo', quando: 'intervalli', ogni: 18, durata: 1, da: 8 }, { id: 'glitch', quando: 'tagli', ogni: 6, durata: 0.4 }], musica: 'rock o elettronica', ritmo: 'veloce',
  },

  // ——— social e lavoro ———
  {
    id: 'reel', nome: 'Reel verticale per i social', emoji: '📱', categoria: 'social', info: 'in verticale, veloce, con titoli che sbattono e l\'invito finale',
    chiede: { titolo: 'Guarda che bello', nomi: '@daprod', data: '' },
    foto: [1.4, 2.2, 3.5], video: [3, 6], moto: ['zoomIn', 'zoomOut', 'panSu', 'panGiu'], forzaMoto: 0.12,
    sfondo: ['#2b1055', '#0a0314'], look: ['pop', 'contrasto'], transizioni: ['dve:301', 'dve:351', 'dve:321'], durTr: 0.4,
    apertura: colpo('GUARDA CHE BELLO'), chiusura: (t) => A('sc-segui', { nome: t.nomi || '@daprod', pos: 'centro' }),
    sovrapposizioni: [],
    effetti: [{ id: 'flash', quando: 'tagli', ogni: 3, durata: 0.25 }, { id: 'zoomColpo', quando: 'tagli', ogni: 4, durata: 0.3 }], musica: 'trap o pop in tendenza', ritmo: 'veloce', formato: 'verticale',
  },
  {
    id: 'vetrina', nome: 'Prodotto, casa o locale', emoji: '🏠', categoria: 'social', info: 'pulito e luminoso: per presentare un immobile, un piatto, un prodotto',
    chiede: { titolo: 'Casa in vendita', nomi: 'Via Roma 12', data: '' },
    foto: [3, 4.5, 6.5], video: [5, 10], moto: ['zoomIn', 'panSx', 'zoomOut', 'panDx'], forzaMoto: 0.08,
    sfondo: ['#f6f7f9', '#d3d8e0'], look: ['luminoso', 'vivace'], transizioni: ['mix', 'dve:301', 'mix'], durTr: 0.7,
    apertura: (t) => A('lt-scheda', { nome: vuoto(t.titolo) ? 'In vetrina' : t.titolo, ruolo: t.nomi || t.sottotitolo }), chiusura: (t) => A('sc-chiusura', { titolo: 'Vieni a trovarci', sotto: t.nomi, bottone: 'Contattaci' }),
    sovrapposizioni: [], effetti: [], musica: 'strumentale pulita e moderna', ritmo: 'medio',
  },
  {
    id: 'azienda', nome: 'Festa in azienda e pensionamento', emoji: '🏢', categoria: 'social', info: 'elegante e sobrio, con i nomi in evidenza',
    chiede: { titolo: 'Grazie di tutto', nomi: 'Mario Bianchi', data: '35 anni in azienda' },
    foto: [3, 4.5, 7], video: [6, 12], moto: ['zoomIn', 'zoomOut', 'panSx'], forzaMoto: 0.09,
    sfondo: ['#1b2433', '#070a10'], look: ['cinema', 'luminoso'], transizioni: ['mix', 'dve:301'], durTr: 0.8,
    apertura: (t) => A('lt-kicker', { etichetta: t.data || 'Un saluto a', nome: t.nomi || t.titolo || 'Collega', ruolo: '' }), chiusura: grazie('i tuoi colleghi'),
    sovrapposizioni: [{ anim: 'cr-coriandoli', da: 0.9, a: 0.97 }], effetti: [], musica: 'strumentale ispirante', ritmo: 'medio',
  },
  {
    id: 'classico', nome: 'Presentazione classica', emoji: '🖼️', categoria: 'social', info: 'senza fronzoli: foto una dopo l\'altra con dissolvenze',
    chiede: { titolo: 'Le nostre foto', nomi: '', data: '' },
    foto: [3, 4.5, 7], video: [6, 12], moto: ['zoomIn', 'zoomOut', 'panSx', 'panDx'], forzaMoto: 0.08,
    sfondo: ['#1d1f26', '#08090c'], look: ['luminoso'], transizioni: ['mix'], durTr: 0.9,
    apertura: titoloCon('Le nostre foto', 'montserrat'), chiusura: undefined,
    sovrapposizioni: [], effetti: [], musica: 'qualunque cosa ti piaccia', ritmo: 'medio',
  },
];

export const presetMontage = (id: string) => PRESET_MONTAGE.find((p) => p.id === id);
