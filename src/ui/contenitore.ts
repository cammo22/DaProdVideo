// Il contenitore: tutto in un posto, ma in ordine. Video, musica e audio, immagini, e poi le transizioni,
// i titoli con le macchine della sala e gli effetti. Passa il mouse su un video e scorre avanti e indietro
// (per capire al volo se è quello giusto); trascina nella timeline; "+" lo mette al cursore; doppio clic lo
// apre nel monitor per scegliere attacco e stacco.
import { store } from '../core/store';
import { motore } from '../motore';
import { mediaRT, quandoAnalisi, quandoPicchi } from '../media/libreria';
import { fotogramma, lascia, quandoFotogramma } from '../media/fotogrammi';
import { durataUmana, fps } from '../core/timecode';
import { applicaTransizione, bersagli, inserisciGeneratore, montaDalPlayer, mettiBlocco, modi } from '../azioni';
import { DURATE, EFFETTI_TEMPO, type EffettoTempo } from '../core/blocchi';
import { importaDialogo, importaDaDrop, ricollega, togliMedia } from '../progetti';
import { avviso, chiedi, h, icona, menuContesto } from './dom';
import { trascinabile } from './trascina';
import type { MediaItem, Transition } from '../core/tipi';
import { projectEnd, newTransition, end, clipById } from '../core/progetto';
import * as M from '../core/montaggio';
import { EFFETTI, TENDINE } from '../render/transizioni';
import { EFFETTI_AUDIO, EFFETTI_VIDEO, adatte, alternaEffetto, type Effetto } from '../effetti';
import { anteprimaViva } from '../render/anteprime';

type Categoria = 'tutto' | 'video' | 'audio' | 'immagini' | 'transizioni' | 'titoli' | 'effetti';

const CATEGORIE: { id: Categoria; nome: string; icona: string }[] = [
  { id: 'tutto', nome: 'Tutto', icona: 'tutto' },
  { id: 'video', nome: 'Video', icona: 'video' },
  { id: 'audio', nome: 'Musica', icona: 'musica' },
  { id: 'immagini', nome: 'Immagini', icona: 'immagine' },
  { id: 'transizioni', nome: 'Transizioni', icona: 'transizione' },
  { id: 'titoli', nome: 'Titoli', icona: 'titolo' },
  { id: 'effetti', nome: 'Effetti', icona: 'effetti' },
];

/** mette un file al cursore senza coprire niente, e porta il cursore alla fine: "+", "+", "+" fa la scaletta */
export function mettiAlCursore(m: MediaItem) {
  const p = store.doc;
  const srcIn = m.markIn ?? m.t0 ?? 0;
  const srcOut = m.markOut ?? (m.type === 'image' ? srcIn + 5 : m.duration);
  const f = Math.round(store.head);
  const ids = store.edit('Metti al cursore', (pp) => M.placeSource(pp, { mediaId: m.id, srcIn, srcOut }, f, null, bersagli(), modi.inserisci ? 'insert' : 'libero'));
  if (!ids.length) { avviso('Accendi una traccia del tipo giusto', 'info'); return; }
  store.select(ids);
  const fine = Math.max(...ids.map((id) => { const c = clipById(store.doc, id); return c ? end(c) : f; }));
  motore.setMonitor('recorder');
  store.setHead(fine);
  avviso(`➕ ${m.name} al cursore`, 'ok', 1200);
  void p;
}

export class Contenitore {
  el: HTMLElement;
  private corpo: HTMLElement;
  private cat: Categoria = 'tutto';
  private filtro = '';
  private pagine = new Map<Categoria, HTMLElement>();
  /** la scheda sotto il mouse che sta scorrendo (anteprima al passaggio) */
  private scorre: { m: MediaItem; cv: HTMLCanvasElement; t: number; linea: HTMLElement } | null = null;

  constructor() {
    const cerca = h('input', { class: 'bin-cerca', type: 'search', placeholder: 'Cerca…' }) as HTMLInputElement;
    cerca.addEventListener('input', () => { this.filtro = cerca.value.toLowerCase(); this.firma = ''; this.disegnaMedia(); });
    this.corpo = h('div', { class: 'bin-pagina' });
    const nav = h('nav', { class: 'bin-categorie' }, CATEGORIE.map((c) =>
      h('button', { class: 'bin-cat' + (c.id === this.cat ? ' attiva' : ''), 'data-c': c.id, title: c.nome, on: { click: () => this.mostra(c.id) } }, icona(c.icona, 15), h('span', null, c.nome))));
    this.el = h('section', { class: 'pannello contenitore' },
      h('header', { class: 'bin-testa' },
        h('button', { class: 'btn primario piccolo', title: 'Importa video, audio e immagini (Ctrl+I)', on: { click: () => importaDialogo() } }, icona('importa', 15), 'Importa'),
        cerca),
      nav,
      this.corpo);
    // file dal sistema lasciati cadere sul contenitore
    this.el.addEventListener('dragover', (e) => { if (e.dataTransfer?.types.includes('Files')) { e.preventDefault(); this.el.classList.add('sopra'); } });
    this.el.addEventListener('dragleave', () => this.el.classList.remove('sopra'));
    this.el.addEventListener('drop', (e) => {
      this.el.classList.remove('sopra');
      if (!e.dataTransfer?.files.length) return;
      e.preventDefault();
      e.stopPropagation();
      void importaDaDrop(e.dataTransfer);
    });
    store.on('doc', () => this.disegnaMedia());
    store.on('status', () => this.evidenzia());
    store.on('sel', () => { if (this.cat === 'effetti') this.aggiornaEffetti(); });
    quandoPicchi(() => { this.firma = ''; this.disegnaMedia(); });
    quandoAnalisi(() => {});
    quandoFotogramma(() => { if (this.scorre) this.disegnaScorre(); });
    this.disegnaMedia();
  }

  mostra(c: Categoria) {
    this.cat = c;
    this.el.querySelectorAll('.bin-cat').forEach((b) => b.classList.toggle('attiva', (b as HTMLElement).dataset.c === c));
    this.firma = '';
    if (c === 'transizioni' || c === 'titoli' || c === 'effetti') {
      let pg = this.pagine.get(c);
      if (!pg) { pg = c === 'transizioni' ? this.paginaTransizioni() : c === 'titoli' ? this.paginaGeneratori() : this.paginaEffetti(); this.pagine.set(c, pg); }
      this.corpo.replaceChildren(pg);
      if (c === 'effetti') this.aggiornaEffetti();
    } else this.disegnaMedia(true);
    this.corpo.scrollTop = 0;
  }

  private evidenzia() {
    this.corpo.querySelectorAll('.carta[data-id]').forEach((el) => el.classList.toggle('nel-monitor', motore.attivo === 'player' && (el as HTMLElement).dataset.id === motore.playerMedia));
  }

  private firma = '';
  disegnaMedia(forza = false) {
    if (this.cat === 'transizioni' || this.cat === 'titoli' || this.cat === 'effetti') return;
    const p = store.doc;
    // si ricostruisce solo se cambia qualcosa che si vede qui (non a ogni spostamento di clip)
    const usi = new Map<string, number>();
    for (const c of p.clips) if (c.media) usi.set(c.media, (usi.get(c.media) ?? 0) + 1);
    const firma = this.cat + '|' + this.filtro + '|' + p.media.map((m) => [m.id, m.name, m.markIn, m.markOut, usi.get(m.id) ?? 0, mediaRT(m.id)?.stato, !!mediaRT(m.id)?.poster].join(',')).join(';');
    if (!forza && firma === this.firma) return;
    this.firma = firma;
    this.scorre = null;
    if (!p.media.length) {
      this.corpo.replaceChildren(h('div', { class: 'bin-vuoto' },
        h('div', { class: 'bin-vuoto-icona' }, icona('importa', 34)),
        h('b', null, 'Trascina qui i tuoi video'),
        h('span', null, 'oppure premi Importa. Poi passaci sopra col mouse per vederli scorrere, trascinali nella timeline o premi + per metterli al cursore.'),
        h('button', { class: 'btn piccolo', on: { click: () => document.dispatchEvent(new CustomEvent('dpv:demo')) } }, '✨ Prova con il montaggio dimostrativo')));
      return;
    }
    const voci = p.media.filter((m) => !this.filtro || m.name.toLowerCase().includes(this.filtro));
    const gruppi: [Categoria, string, MediaItem[]][] = [
      ['video', 'Video', voci.filter((m) => m.type === 'video')],
      ['audio', 'Musica e audio', voci.filter((m) => m.type === 'audio')],
      ['immagini', 'Immagini e istantanee', voci.filter((m) => m.type === 'image')],
    ];
    const out: HTMLElement[] = [];
    for (const [id, nome, lista] of gruppi) {
      if (this.cat !== 'tutto' && this.cat !== id) continue;
      if (!lista.length) { if (this.cat === id) out.push(h('p', { class: 'nota' }, `Nessun file qui. ${this.filtro ? 'Prova a cercare altro.' : 'Importa o trascina qui i file.'}`)); continue; }
      if (this.cat === 'tutto') out.push(h('h4', { class: 'bin-sezione' }, icona(CATEGORIE.find((c) => c.id === id)!.icona, 13), nome, h('small', null, String(lista.length))));
      out.push(h('div', { class: 'bin-griglia' + (id === 'audio' ? ' audio' : '') }, lista.map((m) => this.carta(m, usi.get(m.id) ?? 0))));
    }
    this.corpo.replaceChildren(...out);
    this.evidenzia();
  }

  /** la locandina (o la forma d'onda) nella tela della scheda */
  private locandina(cv: HTMLCanvasElement, m: MediaItem) {
    const ctx = cv.getContext('2d')!;
    const W = cv.width, H = cv.height;
    const rt = mediaRT(m.id);
    ctx.fillStyle = m.type === 'audio' ? '#07120c' : '#000';
    ctx.fillRect(0, 0, W, H);
    if (m.type === 'audio' || (!rt?.poster && rt?.peaks)) {
      const pk = rt?.peaks;
      if (!pk) return;
      ctx.fillStyle = '#5dffb4';
      const mid = H / 2;
      for (let x = 0; x < W; x++) {
        const a = Math.floor((x / W) * pk.length), b = Math.floor(((x + 1) / W) * pk.length);
        let v = 0;
        for (let i = a; i <= b && i < pk.length; i++) if (pk[i] > v) v = pk[i];
        const y = Math.max(0.5, v * H * 0.42);
        ctx.fillRect(x, mid - y, 1, y * 2);
      }
      return;
    }
    if (rt?.poster) {
      const src = rt.poster as HTMLCanvasElement;
      const k = Math.min(W / (src.width || 1), H / (src.height || 1));
      ctx.drawImage(src, (W - src.width * k) / 2, (H - src.height * k) / 2, src.width * k, src.height * k);
    }
  }

  private disegnaScorre() {
    const s = this.scorre;
    if (!s) return;
    const f = fotogramma('bin', s.m.id, s.t, false);
    if (!f) return;
    const ctx = s.cv.getContext('2d')!;
    const W = s.cv.width, H = s.cv.height;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    if (f instanceof ImageBitmap) {
      const k = Math.min(W / f.width, H / f.height);
      ctx.drawImage(f, (W - f.width * k) / 2, (H - f.height * k) / 2, f.width * k, f.height * k);
    } else {
      try { f.drawWithFit(ctx, { fit: 'contain' }); } catch { /* fotogramma chiuso nel frattempo */ }
    }
  }

  private carta(m: MediaItem, usi: number): HTMLElement {
    const rt = mediaRT(m.id);
    const ok = rt?.stato === 'ok';
    const cv = h('canvas', { width: 192, height: 108 });
    this.locandina(cv, m);
    const linea = h('i', { class: 'carta-linea' });
    const tempo = h('span', { class: 'carta-dur' }, m.type === 'image' ? 'IMG' : durataUmana(m.duration - (m.t0 || 0)));
    const dur = m.duration - (m.t0 || 0);
    const img = h('div', { class: 'carta-img' + (m.type === 'audio' ? ' audio' : '') },
      cv, linea,
      h('span', { class: 'carta-tipo' }, icona(m.type === 'audio' ? 'musica' : m.type === 'image' ? 'immagine' : 'video', 12)),
      tempo,
      usi ? h('span', { class: 'carta-usi', title: 'Clip nella timeline' }, '×' + usi) : null,
      m.markIn != null || m.markOut != null ? h('span', { class: 'carta-io', title: 'Attacco e stacco segnati' }, 'I/O') : null,
      h('button', { class: 'carta-piu', title: 'Metti al cursore (e il cursore va alla fine)', on: { click: (e: MouseEvent) => { e.stopPropagation(); mettiAlCursore(m); }, pointerdown: (e: PointerEvent) => e.stopPropagation() } }, icona('piu', 14)));
    // passaggio del mouse: il video scorre avanti e indietro seguendo il puntatore
    if (ok && m.type !== 'image') {
      img.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = img.getBoundingClientRect();
        const k = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        linea.style.left = k * 100 + '%';
        img.classList.add('scorre');
        tempo.textContent = durataUmana(k * dur) + ' / ' + durataUmana(dur);
        if (m.type === 'video') {
          this.scorre = { m, cv, t: (m.t0 || 0) + k * Math.max(0, dur - 0.04), linea };
          this.disegnaScorre();
        }
      });
      img.addEventListener('pointerleave', () => {
        img.classList.remove('scorre');
        tempo.textContent = durataUmana(dur);
        if (this.scorre?.cv === cv) this.scorre = null;
        lascia('bin', m.id);
        this.locandina(cv, m);
      });
    }
    const apri = () => { motore.caricaPlayer(m.id); motore.setMonitor('player'); };
    const el = h('div', {
      class: 'carta' + (ok ? '' : ' offline'), 'data-id': m.id, title: `${m.name}\n${m.container} · ${m.vcodec || ''} ${m.acodec || ''}\nDoppio clic: apri nel monitor · trascina: nella timeline · +: al cursore`,
      on: {
        dblclick: apri,
        click: () => { if (matchMedia('(pointer: coarse)').matches) apri(); },
        contextmenu: (e: MouseEvent) => {
          e.preventDefault();
          menuContesto(e.clientX, e.clientY, [
            { nome: 'Apri nel monitor (attacco e stacco)', fn: apri },
            { nome: 'Metti al cursore', fn: () => mettiAlCursore(m) },
            { nome: 'Metti in coda al montaggio', fn: () => { motore.setMonitor('recorder'); store.setHead(projectEnd(store.doc)); mettiAlCursore(m); } },
            { nome: 'Sovrascrivi al cursore (copre quello che c\'è)', fn: () => { motore.caricaPlayer(m.id); montaDalPlayer('overwrite'); } },
            { sep: true },
            { nome: 'Rinomina…', fn: async () => { const n = await chiedi('Rinomina', 'Nome', m.name); if (n) store.edit('Rinomina', () => { m.name = n; }); } },
            { nome: 'Ricollega file mancanti…', disattiva: ok, fn: () => ricollega() },
            { nome: 'Togli dal contenitore', fn: () => togliMedia(m.id) },
          ]);
        },
      },
    },
      img,
      h('div', { class: 'carta-nome' }, m.name),
      h('div', { class: 'carta-info' }, ok
        ? (m.type === 'audio' ? `${m.acodec.toUpperCase()} · ${m.sampleRate / 1000} kHz` : `${m.width}×${m.height}${m.fps ? ' · ' + Math.round(m.fps * 100) / 100 + ' fps' : ''}${m.hasAudio && m.type === 'video' ? ' · audio' : ''}`)
        : (rt?.stato === 'caricamento' ? 'apro…' : 'OFFLINE · da ricollegare')));
    trascinabile(el, () => 'm:' + m.id, () => (m.type === 'audio' ? '🎵 ' : m.type === 'image' ? '🖼 ' : '🎞 ') + m.name);
    return el;
  }

  private paginaGeneratori(): HTMLElement {
    const g = (kind: 'bars' | 'color' | 'countdown' | 'title' | 'nero', nome: string, desc: string, anteprima: string, extra?: () => void) => {
      const el = h('div', {
        class: 'carta gen gen-voce', title: 'Clic: al cursore · Trascina: dove vuoi',
        on: { click: () => { if (extra) extra(); else inserisciGeneratore(kind); avviso(`${nome} al cursore`, 'ok', 1000); } },
      }, h('div', { class: 'carta-img gen-anteprima ' + anteprima }), h('div', { class: 'carta-nome' }, nome), h('div', { class: 'carta-info' }, desc));
      if (!extra) trascinabile(el, () => 'g:' + kind, () => '📺 ' + nome);
      return el;
    };
    const titolo = (stile: 'fisso' | 'sottopancia' | 'rullo' | 'crawl', testo: string) => () => {
      const ids = inserisciGeneratore('title');
      store.edit('Stile titolo', (p) => { for (const c of p.clips) if (ids.includes(c.id) && c.gen?.title) { c.gen.title.style = stile; c.gen.title.text = testo; if (stile === 'sottopancia') { c.gen.title.size = 56; c.gen.title.align = 'left'; } if (stile === 'rullo') { c.len = c.len * 3; c.gen.title.size = 64; } if (stile === 'crawl') { c.len = c.len * 2; c.gen.title.size = 50; c.gen.title.y = 0.9; c.gen.title.box = true; } } });
    };
    return h('div', { class: 'gen-lista' },
      h('p', { class: 'nota' }, 'Clic per metterli al cursore (su una traccia libera: non coprono niente), o trascinali dove vuoi.'),
      h('h4', { class: 'bin-sezione' }, 'Titolatrice'),
      h('div', { class: 'bin-griglia' },
        g('title', 'Titolo', 'testo fisso al centro', 'titolo'),
        g('title', 'Sottopancia', 'nome e ruolo in basso, stile TG', 'sottopancia', titolo('sottopancia', 'Mario Rossi\nregista')),
        g('title', 'Rullo titoli', 'i titoli di coda che salgono', 'rullo', titolo('rullo', 'DaProd Video\n\nMontaggio\nDaProd\n\nMusica\nDaProd\n\nGrazie per la visione')),
        g('title', 'Crawl', 'la scritta che scorre in basso', 'crawl', titolo('crawl', 'ULTIM\'ORA · DaProd Video: il montaggio vecchio stile, moderno dentro · '))),
      h('h4', { class: 'bin-sezione' }, 'Le macchine della sala'),
      h('div', { class: 'bin-griglia' },
        g('bars', 'Barre + tono', 'SMPTE e 1 kHz a −18 dBFS', 'barre'),
        g('countdown', 'Countdown', 'da 8 a 2 con il "2-pop"', 'countdown'),
        g('nero', 'Nero', 'cinque secondi di nero', 'nero'),
        g('color', 'Colore pieno', 'fondo colorato', 'colore')),
    );
  }

  /** i chip della durata dei blocchetti nuovi: valgono per effetti e transizioni (Auto = quella giusta per ognuno) */
  private chipDurate: HTMLElement[] = [];
  private durate(): HTMLElement {
    const el = h('div', { class: 'bin-durate', title: 'Quanto durano i blocchetti che metti (poi li allunghi o accorci dai bordi)' },
      h('span', null, 'Durata'),
      DURATE.map((d) => h('button', {
        class: 'chip' + (modi.durataFx === d ? ' acceso' : ''), 'data-d': d,
        on: { click: () => { modi.durataFx = d; for (const c of this.chipDurate) c.querySelectorAll('.chip').forEach((b) => b.classList.toggle('acceso', Number((b as HTMLElement).dataset.d) === d)); } },
      }, d ? String(d).replace('.', ',') + ' s' : 'Auto')));
    this.chipDurate.push(el);
    return el;
  }

  private paginaTransizioni(): HTMLElement {
    const t = (tipo: Transition['type'], m: { p: number; nome: string; info: string }) => {
      const cv = h('canvas', { class: 'tr-anteprima', width: 160, height: 90 });
      anteprimaViva(cv, { ...newTransition(tipo, 25, m.p), soft: tipo === 'wipe' ? 0.03 : 0, border: tipo === 'wipe' ? 0.012 : 0 });
      const id = tipo === 'mix' || tipo === 'dip' ? tipo : `${tipo}:${m.p}`;
      const el = h('div', {
        class: 'carta tr gen-voce', 'data-tr': id, title: 'Trascina sopra un taglio (diventa un blocchetto nella corsia FX) · Clic: sul taglio più vicino al cursore',
        on: { click: () => applicaTransizione(tipo, m.p) },
      }, h('div', { class: 'carta-img' }, cv, h('span', { class: 'carta-blocco tr' })), h('div', { class: 'carta-nome' }, m.nome), h('div', { class: 'carta-info' }, m.info));
      trascinabile(el, () => 'x:t:' + id, () => '✦ ' + m.nome);
      return el;
    };
    return h('div', { class: 'gen-lista' },
      this.durate(),
      h('p', { class: 'nota' }, 'Trascina la transizione sopra un taglio fra due clip: diventa un blocchetto turchese nella corsia FX, centrato sul taglio. Più è lungo, più è lenta. Clic = sul taglio più vicino al cursore. Le clip non cambiano durata.'),
      h('h4', { class: 'bin-sezione' }, 'Dissolvenze'),
      h('div', { class: 'bin-griglia' },
        t('mix', { p: 0, nome: 'Dissolvenza incrociata', info: 'il MIX classico · tasto 5' }),
        t('dip', { p: 0, nome: 'Passaggio al nero', info: 'scende al nero e risale · tasto 7' })),
      h('h4', { class: 'bin-sezione' }, 'Effetti digitali (DVE)'),
      h('div', { class: 'bin-griglia' }, EFFETTI.map((m) => t('dve', m))),
      h('h4', { class: 'bin-sezione' }, 'Tendine SMPTE'),
      h('div', { class: 'bin-griglia' }, TENDINE.map((m) => t('wipe', m))),
    );
  }

  private carteEffetti: { el: HTMLElement; e: Effetto }[] = [];
  private paginaEffetti(): HTMLElement {
    // gli effetti a tempo: blocchetti magenta nella corsia FX (valgono per tutto quello che sta sotto)
    const tempo = (e: EffettoTempo) => {
      const el = h('div', {
        class: 'carta fxt', 'data-fx': e.id, title: 'Trascina sopra le clip o su un taglio (diventa un blocchetto nella corsia FX) · Clic: al cursore',
        on: { click: () => mettiBlocco('effetto', e.id) },
      }, h('div', { class: 'carta-img fxt-anteprima fxt-' + e.motore + (e.colore === '#000000' ? ' nero' : '') }, h('i', { class: 'fxt-scena' }), h('i', { class: 'fxt-velo' }), h('span', { class: 'carta-blocco fx' }), h('span', { class: 'carta-dur' }, String(e.durata).replace('.', ',') + ' s')),
      h('div', { class: 'carta-nome' }, e.nome), h('div', { class: 'carta-info' }, e.info));
      trascinabile(el, () => 'x:e:' + e.id, () => '⚡ ' + e.nome);
      return el;
    };
    const carta = (e: Effetto) => {
      const el = h('div', {
        class: 'carta fx', title: 'Clic: acceso/spento sulle clip scelte · Trascina: sopra una clip',
        on: { click: () => { if (!store.sel.size) { avviso('Scegli prima una clip (clic nella timeline), o trascina l\'effetto sopra una clip', 'info', 2400); return; } alternaEffetto(e.id, M.withLinked(store.doc, store.sel)); } },
      }, h('div', { class: 'carta-img fx-anteprima ' + e.anteprima }, h('span', { class: 'fx-spia' })), h('div', { class: 'carta-nome' }, e.nome), h('div', { class: 'carta-info' }, e.info));
      trascinabile(el, () => 'e:' + e.id, () => '✨ ' + e.nome);
      this.carteEffetti.push({ el, e });
      return el;
    };
    return h('div', { class: 'gen-lista' },
      this.durate(),
      h('p', { class: 'nota' }, 'Trascina un effetto sopra le clip o proprio su un taglio: diventa un blocchetto nella corsia FX in cima, e vale per tutto quello che ci sta sotto. Allungalo dai bordi, mettine uno dopo l\'altro. Vicino a un taglio il lampo scoppia proprio lì.'),
      h('h4', { class: 'bin-sezione' }, '⚡ Effetti rapidi'),
      h('div', { class: 'bin-griglia' }, EFFETTI_TEMPO.filter((e) => e.gruppo === 'rapidi').map(tempo)),
      h('h4', { class: 'bin-sezione' }, '⏱ Effetti lunghi'),
      h('div', { class: 'bin-griglia' }, EFFETTI_TEMPO.filter((e) => e.gruppo === 'lunghi').map(tempo)),
      h('h4', { class: 'bin-sezione' }, icona('video', 13), 'Stile della clip · trascinali su una clip'),
      h('div', { class: 'bin-griglia' }, EFFETTI_VIDEO.map(carta)),
      h('h4', { class: 'bin-sezione' }, icona('musica', 13), 'Audio · trascinali su una clip audio'),
      h('div', { class: 'bin-griglia' }, EFFETTI_AUDIO.map(carta)),
    );
  }

  /** le spie degli effetti accesi sulle clip selezionate */
  private aggiornaEffetti() {
    const p = store.doc;
    const cs = p.clips.filter((c) => store.sel.has(c.id));
    for (const { el, e } of this.carteEffetti) {
      const quali = adatte(e, cs);
      el.classList.toggle('acceso', quali.length > 0 && quali.every((c) => e.acceso(c, p)));
    }
  }
}

export { fps };
