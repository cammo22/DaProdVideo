// DaProdMontage: la quarta pagina. Butti dentro foto e video alla rinfusa, scegli che festa è, dici quanto deve durare e
// il programma monta da solo: ordine, tempi, movimenti, transizioni, titoli, cuori e petali, musica a tempo. Il risultato
// è una timeline vera (una scheda nuova) che poi ritocchi come vuoi. Il motore sta in src/core/montage.ts.
import { store } from '../core/store';
import type { MediaItem } from '../core/tipi';
import { CATEGORIE_MONTAGE, PRESET_MONTAGE, presetMontage, type PresetMontage, type TestiMontage } from '../core/montagePreset';
import { costruisciSequenza, fmtDur, pianifica, type EntrataMontage, type Ordine, type OpzMontage } from '../core/montage';
import { disegnaAnimazione } from '../render/animazioni';
import { caricaFontAnimazioni } from '../render/font';
import { mediaRT } from '../media/libreria';
import { pixelAl } from '../media/campiona';
import { misuraQualita } from '../media/qualita';
import { dataDiScatto } from '../media/exif';
import { battitiDi } from '../media/ritmo';
import { importaDialogo } from '../progetti';
import { invoke, isTauri } from '../platform';
import { motore } from '../motore';
import { avviso, h } from './dom';
import { BarraLavoro } from './lavoro';

type Formato = 'auto' | 'progetto' | '16:9' | '9:16' | '1:1';
interface Scelte {
  preset: string;
  durata: number;
  ordine: Ordine;
  titoli: boolean;
  effetti: boolean;
  scarta: boolean;
  audioVideo: number;
  formato: Formato;
  testi: TestiMontage;
  musica: string;
}

const DURATE = [30, 60, 90, 120, 180, 300, 600];
const MISURE: Record<Exclude<Formato, 'auto' | 'progetto'>, [number, number]> = { '16:9': [1920, 1080], '9:16': [1080, 1920], '1:1': [1080, 1080] };

const leggi = (): Partial<Scelte> => { try { return JSON.parse(localStorage.getItem('dpv-montage') ?? '{}'); } catch { return {}; } };
const scrivi = (s: Scelte) => { try { localStorage.setItem('dpv-montage', JSON.stringify({ ...s, musica: '' })); } catch { /* niente */ } };

/** le misure di un file importato, già girate per il verso giusto */
function misure(m: MediaItem) { const g = m.rotation % 180; return { w: g ? m.height : m.width, h: g ? m.width : m.height }; }

/** i primi byte di un file (per la data di scatto) */
async function primiByte(m: MediaItem): Promise<Blob | null> {
  const r = mediaRT(m.id);
  if (r?.file) return r.file;
  if (r?.path && isTauri) {
    try { const off = r.off ?? 0; const b = await invoke<ArrayBuffer>('media_leggi', { path: r.path, start: off, end: off + 131072 }); return new Blob([b]); } catch { return null; }
  }
  return null;
}

export class Montage {
  el: HTMLElement;
  private s: Scelte;
  private incluse = new Set<string>();
  private viste = new Set<string>();
  private griglia: HTMLElement;
  private conta: HTMLElement;
  private carte = new Map<string, HTMLElement>();
  private riepilogo: HTMLElement;
  private lavoro = new BarraLavoro();
  private bCrea: HTMLButtonElement;
  private selMusica: HTMLSelectElement;
  private campiTesto: HTMLElement;
  private sinc: (() => void)[] = [];
  private visibile = false;
  private occupato = false;
  /** finisce quando il montaggio è pronto (per le prove) */
  ultimo: Promise<unknown> = Promise.resolve();

  constructor() {
    const salvate = leggi();
    this.s = {
      preset: salvate.preset && presetMontage(salvate.preset) ? salvate.preset : 'matrimonio', durata: salvate.durata ?? 120, ordine: salvate.ordine ?? 'data',
      titoli: salvate.titoli ?? true, effetti: salvate.effetti ?? true, scarta: salvate.scarta ?? true, audioVideo: salvate.audioVideo ?? -14, formato: salvate.formato ?? 'auto',
      testi: salvate.testi ?? { titolo: '', sottotitolo: '', nomi: '', data: '' }, musica: '',
    };
    this.griglia = h('div', { class: 'mt-file' });
    this.conta = h('div', { class: 'mt-conta' });
    this.riepilogo = h('div', { class: 'mt-riepilogo' });
    this.campiTesto = h('div', { class: 'mt-testi' });
    this.selMusica = h('select', { class: 'mini-select largo', title: 'La musica del video', on: { change: () => { this.s.musica = this.selMusica.value; this.aggiorna(); } } }) as HTMLSelectElement;
    this.bCrea = h('button', { class: 'btn primario mt-crea', on: { click: () => void this.crea() } }, '✨ CREA IL MONTAGGIO') as HTMLButtonElement;

    const chip = (testo: string, acceso: () => boolean, fn: () => void, title = '') => {
      const b = h('button', { class: 'chip', title, on: { click: () => { fn(); this.salva(); this.sinc.forEach((f) => f()); this.aggiorna(); } } }, testo);
      this.sinc.push(() => b.classList.toggle('acceso', acceso()));
      return b;
    };
    const interruttore = (testo: string, info: string, k: 'titoli' | 'effetti' | 'scarta') => {
      const led = h('span', { class: 'led' });
      const b = h('button', { class: 'fin-interruttore', title: info, on: { click: () => { this.s[k] = !this.s[k]; this.salva(); this.sinc.forEach((f) => f()); this.aggiorna(); } } }, led, h('span', { class: 'fin-int-testo' }, testo));
      this.sinc.push(() => { b.classList.toggle('acceso', this.s[k]); led.classList.toggle('acceso', this.s[k]); });
      return b;
    };

    // ——— 1 · i file ———
    const colFile = h('section', { class: 'mt-col mt-colfile' },
      h('h3', null, h('span', { class: 'mt-num' }, '1'), 'I tuoi file'),
      h('p', { class: 'nota' }, 'Foto e video alla rinfusa, anche solo foto. Trascinali qui o in qualunque parte del programma.'),
      h('div', { class: 'mt-barra' },
        h('button', { class: 'btn-mini oro', on: { click: () => void this.aggiungi() } }, '＋ Aggiungi foto e video'),
        h('button', { class: 'btn-mini', on: { click: () => { for (const m of this.disponibili()) this.incluse.add(m.id); this.disegnaFile(); this.aggiorna(); } } }, 'Tutti'),
        h('button', { class: 'btn-mini', on: { click: () => { this.incluse.clear(); this.disegnaFile(); this.aggiorna(); } } }, 'Nessuno')),
      this.conta, this.griglia);

    // ——— 2 · la festa ———
    this.carteFesta = h('div', { class: 'mt-feste' });
    const filtri = h('div', { class: 'isp-chips' }, [{ id: 'tutte', nome: 'Tutte' }, ...CATEGORIE_MONTAGE].map((c) => chip(c.nome, () => this.filtro === c.id, () => { this.filtro = c.id; this.disegnaFeste(); })));
    const colFesta = h('section', { class: 'mt-col mt-colfesta' },
      h('h3', null, h('span', { class: 'mt-num' }, '2'), 'Cosa festeggi'),
      h('p', { class: 'nota' }, `${PRESET_MONTAGE.length} stili pronti: ognuno sa quanto tenere le foto, come muoverle, che transizioni usare e cosa far cadere sopra.`),
      filtri, this.carteFesta);

    // ——— 3 · come lo vuoi ———
    const mm = h('input', { type: 'number', class: 'num', min: 0, max: 60, step: 1, title: 'minuti' }) as HTMLInputElement;
    const ss = h('input', { type: 'number', class: 'num', min: 0, max: 59, step: 5, title: 'secondi' }) as HTMLInputElement;
    const daNumeri = () => { this.s.durata = Math.max(10, Math.min(3600, (Number(mm.value) || 0) * 60 + (Number(ss.value) || 0))); this.salva(); this.sinc.forEach((f) => f()); this.aggiorna(); };
    mm.addEventListener('change', daNumeri); ss.addEventListener('change', daNumeri);
    this.sinc.push(() => { if (document.activeElement !== mm) mm.value = String(Math.floor(this.s.durata / 60)); if (document.activeElement !== ss) ss.value = String(this.s.durata % 60); });
    const colCome = h('section', { class: 'mt-col mt-colcome' },
      h('h3', null, h('span', { class: 'mt-num' }, '3'), 'Come lo vuoi'),
      h('div', { class: 'fin-sezione' }, h('h4', null, 'Quanto dura'),
        h('div', { class: 'isp-chips' }, DURATE.map((d) => chip(fmtDur(d).replace(' s', ' s'), () => this.s.durata === d, () => { this.s.durata = d; }))),
        h('div', { class: 'isp-riga' }, h('label', null, 'Minuti e secondi'), h('span', { class: 'mt-mmss' }, mm, ':', ss))),
      h('div', { class: 'fin-sezione' }, h('h4', null, 'Titoli'), this.campiTesto, interruttore('Titoli di apertura e di chiusura', 'Il titolo all\'inizio e quello in fondo, come li prevede lo stile', 'titoli')),
      h('div', { class: 'fin-sezione' }, h('h4', null, 'Ordine delle foto'),
        h('div', { class: 'isp-chips' },
          chip('Per data', () => this.s.ordine === 'data', () => { this.s.ordine = 'data'; }, 'Dalla data di scatto (EXIF) o del file'),
          chip('A caso', () => this.s.ordine === 'caso', () => { this.s.ordine = 'caso'; }, 'Mescolate: lo stesso mazzo dà sempre lo stesso risultato'),
          chip('Come le ho messe', () => this.s.ordine === 'dato', () => { this.s.ordine = 'dato'; }, 'Nell\'ordine del contenitore')),
        interruttore('Scarta le foto sfocate o doppie', 'Se sono più di quelle che servono tiene le migliori; toglie le raffiche quasi uguali', 'scarta'),
        interruttore('Cuori, petali, coriandoli ed effetti', 'Quello che cade sopra e gli effetti a tempo sui tagli', 'effetti')),
      h('div', { class: 'fin-sezione' }, h('h4', null, 'Musica'),
        this.selMusica,
        h('div', { class: 'isp-pulsanti' }, h('button', { class: 'btn-mini', on: { click: () => void this.aggiungiBrano() } }, '＋ Aggiungi un brano')),
        h('p', { class: 'nota' }, 'Con un brano ritmato i tagli si appoggiano sui battiti. Senza musica il montaggio resta muto: la aggiungi dopo.'),
        h('div', { class: 'isp-chips' },
          chip('Audio dei video: muto', () => this.s.audioVideo <= -50, () => { this.s.audioVideo = -60; }),
          chip('basso', () => this.s.audioVideo === -14, () => { this.s.audioVideo = -14; }),
          chip('normale', () => this.s.audioVideo === -3, () => { this.s.audioVideo = -3; }))),
      h('div', { class: 'fin-sezione' }, h('h4', null, 'Formato'),
        h('div', { class: 'isp-chips' }, ([['auto', 'Come lo stile'], ['progetto', 'Come il progetto'], ['16:9', 'Orizzontale'], ['9:16', 'Verticale'], ['1:1', 'Quadrato']] as [Formato, string][])
          .map(([f, t]) => chip(t, () => this.s.formato === f, () => { this.s.formato = f; }))),
        h('p', { class: 'nota' }, 'Il formato si cambia solo se il progetto è ancora vuoto: se no resta quello che c\'è.')),
      this.riepilogo, this.bCrea, h('div', { class: 'mt-lavoro' }, ...this.lavoro.elementi));

    this.el = h('section', { class: 'montage' },
      h('header', { class: 'fin-testa' }, h('b', null, 'DAPROD'), h('b', { class: 'mt-m' }, 'MONTAGE'), h('span', null, 'butta dentro le foto, scegli la festa e il programma monta da solo'),
        h('span', { class: 'live-tastiera' }, 'F8 · poi ritocchi tutto nel Montaggio')),
      h('div', { class: 'mt-dentro' }, colFile, colFesta, colCome));
    store.on('doc', () => { if (this.visibile) this.rinfresca(); });
    this.sincronizza();
  }

  private carteFesta: HTMLElement;
  private filtro = 'tutte';
  private timerAgg = 0;

  private salva() { scrivi(this.s); }
  private sincronizza() { this.sinc.forEach((f) => f()); }

  private disponibili(): MediaItem[] { return store.doc.media.filter((m) => (m.type === 'image' || m.type === 'video') && m.width > 0); }
  private brani(): MediaItem[] { return store.doc.media.filter((m) => m.type === 'audio'); }

  mostrata(si: boolean) {
    this.visibile = si;
    if (si) { this.rinfresca(); void caricaFontAnimazioni().then(() => { if (this.visibile) this.disegnaFeste(); }); }
  }

  private rinfresca() {
    // i file nuovi si scelgono da soli (quelli che l'utente ha già tolto a mano restano tolti)
    for (const m of this.disponibili()) if (!this.viste.has(m.id)) { this.viste.add(m.id); this.incluse.add(m.id); }
    for (const id of [...this.incluse]) if (!store.doc.media.some((m) => m.id === id)) this.incluse.delete(id);
    this.disegnaFile();
    this.disegnaFeste();
    this.disegnaTesti();
    this.disegnaMusica();
    this.sincronizza();
    this.aggiorna();
  }

  private disegnaFile() {
    const lista = this.disponibili();
    this.carte.clear();
    this.griglia.replaceChildren(...lista.map((m) => {
      const cv = h('canvas', { width: 96, height: 54 }) as HTMLCanvasElement;
      const r = mediaRT(m.id);
      const src = r?.poster as (CanvasImageSource & { width: number; height: number }) | undefined;
      const x = cv.getContext('2d')!;
      x.fillStyle = '#15141a'; x.fillRect(0, 0, 96, 54);
      if (src && src.width) { const k = Math.max(96 / src.width, 54 / src.height); x.drawImage(src, (96 - src.width * k) / 2, (54 - src.height * k) / 2, src.width * k, src.height * k); }
      const el = h('button', { class: 'mt-thumb' + (this.incluse.has(m.id) ? ' scelta' : ''), title: `${m.name}${m.type === 'video' ? ` · ${fmtDur(m.duration)}` : ''}\nClic: usa / non usare`, 'data-id': m.id,
        on: { click: () => { if (this.incluse.has(m.id)) this.incluse.delete(m.id); else this.incluse.add(m.id); el.classList.toggle('scelta', this.incluse.has(m.id)); this.aggiorna(); } } },
      cv, m.type === 'video' ? h('i', { class: 'mt-tipo' }, '▶') : null, h('i', { class: 'mt-spunta' }, '✓'));
      this.carte.set(m.id, el);
      return el;
    }));
    if (!lista.length) this.griglia.replaceChildren(h('div', { class: 'mt-vuoto' }, h('b', null, 'Ancora niente'), h('p', null, 'Trascina qui le foto e i video, oppure premi "Aggiungi".')));
  }

  private disegnaTesti() {
    const pr = presetMontage(this.s.preset)!;
    const campo = (k: keyof TestiMontage, nome: string) => {
      const i = h('input', { class: 'campo-testo', type: 'text', placeholder: pr.chiede[k] ?? '', value: this.s.testi[k] }) as HTMLInputElement;
      i.addEventListener('input', () => { this.s.testi[k] = i.value; this.salva(); });
      return h('label', { class: 'mt-campo' }, h('span', null, nome), i);
    };
    const c: HTMLElement[] = [];
    if ('nomi' in pr.chiede) c.push(campo('nomi', 'Nomi'));
    if ('titolo' in pr.chiede) c.push(campo('titolo', 'Titolo'));
    if ('data' in pr.chiede) c.push(campo('data', 'Data o luogo'));
    c.push(campo('sottotitolo', 'Sottotitolo (facoltativo)'));
    this.campiTesto.replaceChildren(...c);
  }

  private disegnaMusica() {
    const b = this.brani();
    this.selMusica.replaceChildren(h('option', { value: '' }, 'Nessuna musica'), ...b.map((m) => h('option', { value: m.id }, `${m.name} · ${fmtDur(m.duration)}`)));
    if (this.s.musica && !b.some((m) => m.id === this.s.musica)) this.s.musica = '';
    this.selMusica.value = this.s.musica;
  }

  private disegnaFeste() {
    const lista = PRESET_MONTAGE.filter((p) => this.filtro === 'tutte' || p.categoria === this.filtro);
    this.carteFesta.replaceChildren(...lista.map((p) => this.cartaFesta(p)));
  }

  private cartaFesta(p: PresetMontage): HTMLElement {
    const cv = h('canvas', { width: 192, height: 108 }) as HTMLCanvasElement;
    const x = cv.getContext('2d')!;
    const g = x.createLinearGradient(0, 0, 192, 108); g.addColorStop(0, p.sfondo[0]); g.addColorStop(1, p.sfondo[1]);
    x.fillStyle = g; x.fillRect(0, 0, 192, 108);
    try {
      const esempio: TestiMontage = { titolo: p.chiede.titolo ?? '', sottotitolo: '', nomi: p.chiede.nomi ?? '', data: p.chiede.data ?? '' };
      const an = p.apertura?.(esempio);
      if (an) x.drawImage(disegnaAnimazione(an, 768, 432, 2.4, 6) as CanvasImageSource, 0, 0, 192, 108);
    } catch { /* resta il fondo */ }
    const el = h('button', { class: 'mt-festa' + (this.s.preset === p.id ? ' scelta' : ''), title: `${p.nome}\n${p.info}\nMusica: ${p.musica}`, 'data-preset': p.id,
      on: { click: () => { this.s.preset = p.id; this.salva(); this.disegnaFeste(); this.disegnaTesti(); this.aggiorna(); } } },
    h('div', { class: 'mt-festa-img' }, cv, h('span', { class: 'mt-emoji' }, p.emoji)), h('b', null, p.nome), h('small', null, p.info));
    return el;
  }

  private entrate(): EntrataMontage[] {
    return this.disponibili().filter((m) => this.incluse.has(m.id)).map((m) => ({
      media: m.id, nome: m.name, tipo: m.type as 'image' | 'video', durata: m.type === 'video' ? m.duration : 0, ...misure(m),
      data: m.lastModified || 0, audio: m.hasAudio, punteggio: 0.5,
    }));
  }

  private opzioni(musica?: OpzMontage['musica']): OpzMontage {
    return { preset: this.s.preset, durata: this.s.durata, ordine: this.s.ordine, titoli: this.s.titoli, effetti: this.s.effetti, audioVideo: this.s.audioVideo, testi: this.s.testi, seme: 12345, scarta: this.s.scarta, musica };
  }

  /** il riassunto sotto le scelte: quante foto, quanto sta ognuna (senza analisi: serve solo a dare un'idea) */
  private aggiorna() {
    clearTimeout(this.timerAgg);
    this.timerAgg = window.setTimeout(() => {
      const e = this.entrate();
      const nF = e.filter((x) => x.tipo === 'image').length, nV = e.length - nF;
      this.conta.textContent = e.length ? `${nF} foto · ${nV} video scelti` : 'Nessun file scelto';
      this.bCrea.disabled = this.occupato || !e.length;
      if (!e.length) { this.riepilogo.textContent = 'Scegli almeno un file.'; return; }
      const mus = this.s.musica ? this.brani().find((m) => m.id === this.s.musica) : undefined;
      const pi = pianifica(e, this.opzioni(mus ? { media: mus.id, durata: mus.duration } : undefined));
      const pr = presetMontage(this.s.preset)!;
      this.riepilogo.replaceChildren(
        h('b', null, `${pr.emoji} ${pr.nome} · ${fmtDur(this.s.durata)}`),
        h('div', null, `${pi.voci.length} cose sulla linea · circa ${pi.perFoto.toFixed(1).replace('.', ',')} s ciascuna`),
        ...pi.note.map((n) => h('div', { class: 'fin-attento' }, '• ' + n)),
        h('div', { class: 'fin-info' }, `Musica consigliata: ${pr.musica}`));
    }, 120);
  }

  private async aggiungi() { await importaDialogo(); }

  private async aggiungiBrano() {
    const prima = new Set(this.brani().map((m) => m.id));
    await importaDialogo(undefined, 'audio');
    const nuovo = this.brani().find((m) => !prima.has(m.id));
    this.disegnaMusica();
    if (nuovo) { this.s.musica = nuovo.id; this.selMusica.value = nuovo.id; this.aggiorna(); }
  }

  /** il montaggio vero: legge le date, misura le foto, trova i battiti, pianifica e costruisce la timeline */
  async crea(): Promise<void> {
    if (this.occupato) return this.ultimo as Promise<void>;
    this.occupato = true;
    this.bCrea.disabled = true;
    const lavoro = (async () => {
      const lav = this.lavoro;
      lav.avvia('Guardo i file…');
      try {
        const lista = this.disponibili().filter((m) => this.incluse.has(m.id));
        const entrate = this.entrate();
        // quando sono state scattate (EXIF) e, se serve, quanto sono venute bene
        for (let i = 0; i < lista.length; i++) {
          const m = lista[i], e = entrate[i];
          lav.imposta(`Guardo ${m.name} (${i + 1} di ${lista.length})`, (i / lista.length) * 0.6);
          if (m.type === 'image' && /\.jpe?g$/i.test(m.name) && this.s.ordine === 'data') {
            const b = await primiByte(m);
            const d = b ? await dataDiScatto(b) : null;
            if (d) e.data = d;
          }
          if (this.s.scarta) {
            try {
              if (m.type === 'image') { const px = await pixelAl(m.id, 0, 128); if (px) { const q = misuraQualita(px); e.punteggio = q.punteggio; e.firma = q.firma; } }
              else if (m.duration > 4) {
                // il pezzo più bello: si guardano sei istanti e si parte da quello migliore
                let best = -1, tb = 0;
                for (let k = 1; k <= 6; k++) { const t = (m.duration * k) / 7; const px = await pixelAl(m.id, t, 96); if (!px) continue; const q = misuraQualita(px); if (q.punteggio > best) { best = q.punteggio; tb = t; } }
                if (best >= 0) { e.punteggio = best; e.inizioMigliore = Math.max(0, tb - 1); }
              }
            } catch { /* resta il valore di mezzo */ }
          }
        }
        let musica: OpzMontage['musica'];
        const mus = this.s.musica ? this.brani().find((m) => m.id === this.s.musica) : undefined;
        if (mus) {
          lav.imposta('Ascolto il ritmo del brano…', 0.65);
          const rit = await battitiDi(mus.id, (k) => lav.imposta('Ascolto il ritmo del brano…', 0.65 + k * 0.2)).catch(() => null);
          musica = { media: mus.id, durata: mus.duration, nome: mus.name, battiti: rit && rit.sicurezza > 0.15 ? rit.battiti : undefined };
          if (rit && musica.battiti) avviso(`♪ Ritmo trovato: ${Math.round(rit.bpm)} battiti al minuto`, 'info', 2200);
        }
        lav.imposta('Monto…', 0.9);
        const opz = this.opzioni(musica);
        const piano = pianifica(entrate, opz);
        if (!piano.voci.length) throw new Error('Non c\'è niente da montare');
        const pr = presetMontage(this.s.preset)!;
        // il formato, solo se il progetto è ancora vuoto
        const vuoto = store.doc.clips.length === 0 && !(store.doc.sequenze ?? []).some((q) => q.clips?.length);
        const f = this.s.formato === 'auto' ? (pr.formato === 'verticale' ? '9:16' : pr.formato === 'quadrato' ? '1:1' : 'progetto') : this.s.formato;
        const info = store.edit('DaProdMontage', (pp) => {
          if (vuoto && f !== 'progetto') { const [w, hh] = MISURE[f]; pp.w = w; pp.h = hh; }
          return costruisciSequenza(pp, piano, opz);
        });
        lav.fine(`Fatto: ${piano.voci.length} cose in ${fmtDur(piano.durata)}`);
        store.select([]);
        document.dispatchEvent(new CustomEvent('dpv:pagina', { detail: 'montaggio' }));
        motore.setMonitor('recorder');
        motore.vaiA(0);
        document.dispatchEvent(new CustomEvent('dpv:adatta'));
        avviso(`✨ ${pr.nome}: ${piano.voci.length} cose in ${fmtDur(piano.durata)}${piano.note.length ? ' · ' + piano.note[0] : ''}. Premi Spazio per vederlo (${info.tracce} tracce)`, 'ok', 6000);
        this.ultimo = Promise.resolve(piano);
      } catch (e) {
        lav.ferma('Non riuscito');
        avviso('DaProdMontage: ' + (e instanceof Error ? e.message : String(e)), 'errore', 5000);
      } finally {
        this.occupato = false;
        this.aggiorna();
      }
    })();
    this.ultimo = lavoro;
    return lavoro;
  }
}

