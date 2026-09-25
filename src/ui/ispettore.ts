// Le proprietà della clip scelta, semplici: un riassunto in alto, gli effetti al volo come interruttori,
// poche regolazioni che servono davvero (opacità, zoom, colore, volume, durata, transizioni) e il resto
// chiuso in "Avanzate". Il colore di tutto il montaggio sta nella pagina Finale.
import { store } from '../core/store';
import type { Clip, TitleSpec } from '../core/tipi';
import { clipById, end, isVideoClip, mediaOf, trackOf, TF0, FX0 } from '../core/progetto';
import { frameToTc, fps } from '../core/timecode';
import { avviso, h } from './dom';
import * as M from '../core/montaggio';
import { esegui, modi, mettiBlocco } from '../azioni';
import { EFFETTI, TENDINE } from '../render/transizioni';
import { EFFETTI_AUDIO, EFFETTI_VIDEO, adatte, alternaEffetto } from '../effetti';
import { cambiaModello, durataDelBlocco, EFFETTI_TEMPO, effettoTempo, nomeBlocco, nuovoBlocco, posaBlocco, taglioDelBlocco, taglioVicino, transizioneSul } from '../core/blocchi';
import { SUONI } from '../core/suoni';
import { ascoltaSuono } from '../media/audio';

type Campo = { el: HTMLElement; aggiorna: () => void };

export class Ispettore {
  el: HTMLElement;
  private corpo: HTMLElement;
  private campi: Campo[] = [];
  private firma = '';
  private aperti = new Set<string>(['fxv', 'fxa', 'immagine', 'titolo', 'audio', 'generatore', 'trin', 'durata']);

  constructor() {
    this.corpo = h('div', { class: 'isp-corpo' });
    this.el = h('div', { class: 'ispettore' }, this.corpo);
    store.on('sel', () => this.costruisci());
    store.on('doc', () => this.costruisci());
    this.costruisci();
  }

  private sel(): Clip[] {
    return store.doc.clips.filter((c) => store.sel.has(c.id));
  }

  private costruisci() {
    const cs = this.sel();
    // si ricostruisce se cambia la scelta o se cambiano i blocchi FX (le transizioni della clip scelta)
    const firma = cs.map((c) => c.id + c.kind + (c.fxb ? c.fxb.id : '')).join(',') + '|' + store.doc.clips.filter((c) => c.kind === 'fx').map((c) => c.id + c.start + ':' + c.len + (c.fxb?.id ?? '')).join(',');
    if (firma === this.firma && this.campi.length) { for (const c of this.campi) c.aggiorna(); return; }
    this.firma = firma;
    this.campi = [];
    if (!cs.length) {
      this.corpo.replaceChildren(h('div', { class: 'isp-vuoto' },
        h('b', null, 'Nessuna clip scelta'),
        h('p', null, 'Clicca una clip nella timeline: qui trovi il riassunto, gli effetti al volo e le poche regolazioni che servono. Il colore di tutto il montaggio si fa nella pagina Finale.'),
        h('ul', { class: 'isp-tasti' },
          h('li', null, h('kbd', null, '1'), ' taglia (le tracce accese) e sceglie il pezzo più corto'),
          h('li', null, h('kbd', null, '2'), ' elimina e passa alla clip dopo'),
          h('li', null, h('kbd', null, 'S'), ' separa o unisce i gruppi di clip'),
          h('li', null, h('kbd', null, 'Q'), ' / ', h('kbd', null, 'W'), ' via lo scarto a sinistra / a destra'),
          h('li', null, h('kbd', null, 'rotella'), ' un fotogramma alla volta, col suono'),
          h('li', null, h('kbd', null, 'Ctrl'), '+', h('kbd', null, 'rotella'), ' zoom della timeline'))));
      return;
    }
    const blocchi = cs.filter((c) => c.kind === 'fx');
    if (blocchi.length === cs.length) { this.corpo.replaceChildren(...this.blocchi(blocchi)); return; }
    const video = cs.filter(isVideoClip);
    const audio = cs.filter((c) => !isVideoClip(c) && c.kind !== 'fx');
    const primo = video[0] ?? audio[0];
    const p = store.doc;
    const r = fps(p.rate);
    const m = mediaOf(p, primo);
    const out: HTMLElement[] = [];
    // ——— il riassunto: cos'è, dove sta, da dove viene
    const tipo = primo.kind === 'title' ? 'Titolo' : primo.kind === 'media' ? (m?.type === 'image' ? 'Immagine' : isVideoClip(primo) ? 'Video' : 'Audio') : 'Generatore';
    const legate = primo.link ? p.clips.filter((c) => c.link === primo.link).length - 1 : 0;
    out.push(h('div', { class: 'isp-testa' },
      h('input', {
        class: 'isp-nome', value: cs.length > 1 ? `${cs.length} clip scelte` : primo.name, disabled: cs.length > 1,
        on: { change: (e: Event) => store.edit('Rinomina clip', () => { for (const c of this.sel()) c.name = (e.target as HTMLInputElement).value; }) },
      }),
      h('div', { class: 'isp-riassunto' },
        h('span', { class: 'chip-tipo' }, tipo),
        h('span', null, 'da ', h('b', { class: 'tc-testo' }, frameToTc(primo.start, p.rate, p.drop))),
        h('span', null, 'dura ', h('b', null, (primo.len / r).toFixed(2).replace('.', ',') + ' s')),
        legate ? h('span', { class: 'chip-link' }, `⛓ +${legate}`) : null,
        m && m.type !== 'audio' && m.width ? h('span', null, `${m.width}×${m.height}${m.fps ? ' · ' + Math.round(m.fps * 100) / 100 + ' fps' : ''}`) : null,
        m ? h('span', { class: 'isp-sorgente' }, m.name) : h('span', null, trackOf(p, primo.track).name))));

    // ——— gli effetti al volo: interruttori, niente cursori
    const chips = (lista: typeof EFFETTI_VIDEO, quali: Clip[]) => h('div', { class: 'isp-chips' }, lista.filter((e) => adatte(e, quali).length).map((e) => {
      const b = h('button', { class: 'chip', title: e.info, on: { click: () => alternaEffetto(e.id, adatte(e, this.sel()).map((c) => c.id)) } }, e.nome);
      const agg = () => { const q = adatte(e, this.sel()); b.classList.toggle('acceso', q.length > 0 && q.every((c) => e.acceso(c, store.doc))); };
      agg();
      this.campi.push({ el: b, aggiorna: agg });
      return b;
    }));
    if (video.length) out.push(this.gruppo('fxv', 'Effetti al volo', [chips(EFFETTI_VIDEO, video)]));
    if (audio.length) out.push(this.gruppo('fxa', video.length ? 'Effetti audio' : 'Effetti al volo', [chips(EFFETTI_AUDIO, audio)]));

    if (video.length) {
      out.push(this.gruppo('immagine', 'Immagine', [
        this.cursore('Opacità', 0, 100, 1, (c) => Math.round(c.opacity * 100), (c, v) => { c.opacity = v / 100; c.opKeys = []; }, '%', video),
        this.cursore('Zoom', 20, 300, 1, (c) => Math.round(c.tf.scale * 100), (c, v) => { c.tf.scale = v / 100; }, '%', video),
        this.pulsanti([
          ['Adatta', () => store.edit('Adatta', () => { for (const c of video) c.tf = { ...TF0 }; })],
          ['Riempi', () => store.edit('Riempi', () => { for (const c of video) { const mm = mediaOf(p, c); if (mm?.width) { const w = mm.rotation % 180 ? mm.height : mm.width, hh = mm.rotation % 180 ? mm.width : mm.height; const kf = Math.min(p.w / w, p.h / hh), kc = Math.max(p.w / w, p.h / hh); c.tf.scale = kc / kf; } } })],
          ['Riquadro ↘', () => store.edit('Riquadro', () => { for (const c of video) c.tf = { ...TF0, scale: 0.33, x: p.w * 0.3, y: p.h * 0.28 }; })],
          ['Riquadro ↖', () => store.edit('Riquadro', () => { for (const c of video) c.tf = { ...TF0, scale: 0.33, x: -p.w * 0.3, y: -p.h * 0.28 }; })],
        ]),
        video.some((c) => c.opKeys.length) ? h('p', { class: 'nota' }, 'Questa clip ha una linea elastica: la trasparenza cambia nel tempo. Muovere l\'opacità la toglie.') : null,
      ]));
      out.push(this.gruppo('colore', 'Colore della clip', [
        this.cursore('Luce', -50, 50, 1, (c) => Math.round(c.fx.bright * 100), (c, v) => { c.fx.bright = v / 100; }, '', video),
        this.cursore('Contrasto', 50, 150, 1, (c) => Math.round(c.fx.contrast * 100), (c, v) => { c.fx.contrast = v / 100; }, '%', video),
        this.cursore('Saturazione', 0, 200, 1, (c) => Math.round(c.fx.sat * 100), (c, v) => { c.fx.sat = v / 100; }, '%', video),
        this.cursore('Temperatura', -100, 100, 1, (c) => Math.round((c.fx.temp ?? 0) * 100), (c, v) => { c.fx.temp = v / 100; }, '', video),
        this.pulsanti([['Azzera', () => store.edit('Azzera colore', () => { for (const c of video) { c.fx.bright = 0; c.fx.contrast = 1; c.fx.sat = 1; c.fx.hue = 0; c.fx.temp = 0; c.fx.look = 'none'; } })]]),
        h('p', { class: 'nota' }, 'Il colore automatico e il look di tutto il montaggio sono nella pagina Finale.'),
      ], true));
    }
    if (audio.length) {
      out.push(this.gruppo('audio', 'Volume', [
        this.cursore('Volume', -40, 12, 0.5, (c) => c.gain, (c, v) => { c.gain = v; c.gainKeys = []; }, 'dB', audio),
        this.pulsanti([['−6', () => store.edit('Volume', () => { for (const c of audio) { c.gain = -6; c.gainKeys = []; } })], ['0 dB', () => store.edit('Volume', () => { for (const c of audio) { c.gain = 0; c.gainKeys = []; } })], ['+6', () => store.edit('Volume', () => { for (const c of audio) { c.gain = 6; c.gainKeys = []; } })], ['Muto', () => store.edit('Volume', () => { for (const c of audio) { c.gain = -60; c.gainKeys = []; } })]]),
        this.cursore('Panorama', -100, 100, 1, (c) => Math.round(c.pan * 100), (c, v) => { c.pan = v / 100; }, '', audio),
        h('p', { class: 'nota' }, 'Nella timeline la linea gialla è il volume: trascinala, doppio clic per un punto, tasto destro → "Abbassa qui".'),
      ]));
    }
    out.push(this.gruppo('durata', 'Durata', [this.durata(cs.filter((c) => c.kind !== 'fx'))]));
    if (video.length) out.push(this.transizioniClip(video[0]));
    const gen = cs.filter((c) => c.kind === 'color' || c.kind === 'bars' || c.kind === 'tone' || c.kind === 'beep');
    if (gen.length) {
      const g0 = gen[0];
      const righe: HTMLElement[] = [];
      if (g0.kind === 'color') righe.push(this.colore('Colore', (c) => c.gen?.color ?? '#000', (c, v) => { c.gen = { ...c.gen, color: v }; }, gen));
      if (g0.kind === 'bars') righe.push(this.scelta('Barre', [['smpte', 'SMPTE (NTSC)'], ['ebu', 'EBU 100/75 (PAL)']], (c) => c.gen?.bars ?? 'smpte', (c, v) => { c.gen = { ...c.gen, bars: v as 'smpte' }; }, gen));
      if (g0.kind === 'tone' || g0.kind === 'beep') {
        righe.push(this.cursore('Frequenza', 100, 10000, 10, (c) => c.gen?.freq ?? 1000, (c, v) => { c.gen = { ...c.gen, freq: v }; }, 'Hz', gen));
        righe.push(this.cursore('Livello', -40, 0, 1, (c) => c.gen?.level ?? -18, (c, v) => { c.gen = { ...c.gen, level: v }; }, 'dBFS', gen));
      }
      out.push(this.gruppo('generatore', 'Generatore', righe));
    }
    const titoli = cs.filter((c) => c.kind === 'title');
    if (titoli.length) out.push(this.titolatrice(titoli));
    if (video.length) {
      out.push(this.gruppo('avanzate', 'Avanzate (posizione, ritaglio, chiave)', [
        this.cursore('Orizzontale', -p.w, p.w, 1, (c) => Math.round(c.tf.x), (c, v) => { c.tf.x = v; }, 'px', video),
        this.cursore('Verticale', -p.h, p.h, 1, (c) => Math.round(c.tf.y), (c, v) => { c.tf.y = v; }, 'px', video),
        this.cursore('Rotazione', -180, 180, 0.5, (c) => c.tf.rot, (c, v) => { c.tf.rot = v; }, '°', video),
        this.cursore('Ritaglio sinistra', 0, 50, 0.5, (c) => c.tf.cropL * 100, (c, v) => { c.tf.cropL = v / 100; }, '%', video),
        this.cursore('Ritaglio destra', 0, 50, 0.5, (c) => c.tf.cropR * 100, (c, v) => { c.tf.cropR = v / 100; }, '%', video),
        this.cursore('Ritaglio sopra', 0, 50, 0.5, (c) => c.tf.cropT * 100, (c, v) => { c.tf.cropT = v / 100; }, '%', video),
        this.cursore('Ritaglio sotto', 0, 50, 0.5, (c) => c.tf.cropB * 100, (c, v) => { c.tf.cropB = v / 100; }, '%', video),
        this.cursore('Tinta', -180, 180, 1, (c) => c.fx.hue, (c, v) => { c.fx.hue = v; }, '°', video),
        this.scelta('Chiave', [['none', 'Nessuna'], ['luma', 'Luminanza (toglie il nero)'], ['chroma', 'Croma (green / blue screen)']], (c) => c.fx.key, (c, v) => { c.fx.key = v as Clip['fx']['key']; }, video),
        this.colore('Colore della chiave', (c) => c.fx.keyColor, (c, v) => { c.fx.keyColor = v; }, video),
        this.pulsanti([['Green screen', () => store.edit('Chiave verde', () => { for (const c of video) { c.fx.key = 'chroma'; c.fx.keyColor = '#00b140'; } })], ['Blue screen', () => store.edit('Chiave blu', () => { for (const c of video) { c.fx.key = 'chroma'; c.fx.keyColor = '#0047bb'; } })]]),
        this.cursore('Soglia', 0, 100, 1, (c) => Math.round(c.fx.keyLevel * 100), (c, v) => { c.fx.keyLevel = v / 100; }, '', video),
        this.cursore('Morbidezza', 0, 50, 1, (c) => Math.round(c.fx.keySoft * 100), (c, v) => { c.fx.keySoft = v / 100; }, '', video),
        this.spunta('Inverti la chiave', (c) => c.fx.keyInvert, (c, v) => { c.fx.keyInvert = v; }, video),
      ], true));
    }
    this.corpo.replaceChildren(...out);
  }

  /** le transizioni all'inizio e alla fine della clip: i blocchetti che stanno su quei bordi */
  private transizioniClip(v: Clip): HTMLElement {
    const p = store.doc;
    const r = fps(p.rate);
    const sulBordo = (f: number) => { const tg = taglioVicino(p, f, 0, v.track); return tg ? transizioneSul(p, tg) : undefined; };
    const riga = (nome: string, f: number) => {
      const b = sulBordo(f);
      return h('div', { class: 'isp-riga' }, h('label', null, nome),
        b
          ? h('div', { class: 'isp-chips' },
            h('button', { class: 'chip acceso tr', title: 'Scegli il blocco per cambiarlo', on: { click: () => store.select([b.id]) } }, `${nomeBlocco(b.fxb!)} · ${(b.len / r).toFixed(1).replace('.', ',')} s`),
            h('button', { class: 'chip', title: 'Togli', on: { click: () => store.edit('Togli transizione', (pp) => { pp.clips = pp.clips.filter((z) => z.id !== b.id); }) } }, '✕'))
          : h('div', { class: 'isp-chips' }, ['mix', 'dip', 'dve:301', 'dve:401'].map((id) => h('button', {
            class: 'chip', on: { click: () => { store.select([]); mettiBlocco('transizione', id, f, v.track); } },
          }, nomeBlocco(nuovoBlocco('transizione', id))))));
    };
    return this.gruppo('trclip', 'Transizioni', [
      riga('All\'inizio', v.start),
      riga('Alla fine', end(v)),
      h('p', { class: 'nota' }, 'Sono i blocchetti turchesi in basso sulla clip: più lunghi = più lente. Trascinali su un altro taglio quando vuoi.'),
    ]);
  }

  /** le proprietà dei blocchetti FX scelti: durata, tipo, forza, colore */
  private blocchi(bs: Clip[]): HTMLElement[] {
    const p = store.doc;
    const r = fps(p.rate);
    const b0 = bs[0];
    const fb = b0.fxb!;
    const tr = fb.tipo === 'transizione';
    const tg = tr ? taglioDelBlocco(p, b0) : null;
    const out: HTMLElement[] = [];
    const sec = (len: number) => (len / r).toFixed(2).replace('.', ',').replace(/,?0+$/, '') + ' s';
    out.push(h('div', { class: 'isp-testa' },
      h('input', { class: 'isp-nome', value: bs.length > 1 ? `${bs.length} blocchi scelti` : nomeBlocco(fb), disabled: true }),
      h('div', { class: 'isp-riassunto' },
        h('span', { class: 'chip-tipo ' + (tr ? 'tr' : 'fx') }, tr ? 'Transizione' : 'Effetto a tempo'),
        h('span', null, 'da ', h('b', { class: 'tc-testo' }, frameToTc(b0.start, p.rate, p.drop))),
        h('span', null, 'dura ', h('b', null, sec(b0.len))),
        tr ? h('span', { class: tg ? '' : 'avviso-rosso' }, tg ? `sul taglio a ${frameToTc(tg.f, p.rate, p.drop)} (${trackOf(p, tg.track).name})` : 'nessun taglio sotto: spostala sopra un taglio') : h('span', null, effettoTempo(fb.id)?.info ?? ''))));
    const ids = bs.map((c) => c.id);
    const tutti = (label: string, fn: (c: Clip) => void) => store.edit(label, (pp) => { for (const id of ids) { const c = clipById(pp, id); if (c) fn(c); } });
    // durata: i chip fanno prima dei numeri (più corto = più rapido)
    const durate = [0.25, 0.5, 1, 2, 3, 5, 10];
    const n = h('input', { type: 'number', class: 'num largo', min: 0.08, step: 0.04, value: (b0.len / r).toFixed(2) }) as HTMLInputElement;
    n.addEventListener('change', () => store.edit('Durata', (pp) => { for (const id of ids) durataDelBlocco(pp, clipById(pp, id)!, Math.max(0.08, Number(n.value) || 1) * r); }));
    out.push(this.gruppo('bdurata', tr ? 'Durata (più lunga = più lenta)' : 'Durata', [
      h('div', { class: 'isp-chips' }, durate.map((d) => h('button', {
        class: 'chip' + (Math.round(d * r) === b0.len ? ' acceso' : ''),
        on: { click: () => store.edit('Durata', (pp) => { for (const id of ids) durataDelBlocco(pp, clipById(pp, id)!, d * r); }) },
      }, String(d).replace('.', ',') + ' s'))),
      h('div', { class: 'isp-riga' }, h('label', null, 'Secondi'), n),
    ]));
    if (tr) {
      const opz: [string, string][] = [['mix', 'Dissolvenza incrociata'], ['dip', 'Passaggio a colore'], ...EFFETTI.map((m) => ['dve:' + m.p, 'Effetto · ' + m.nome] as [string, string]), ...TENDINE.map((m) => ['wipe:' + m.p, 'Tendina ' + m.nome] as [string, string])];
      const trDi = (c: Clip) => c.fxb!.tr!;
      out.push(this.gruppo('btipo', 'Transizione', [
        this.scelta('Modello', opz, (c) => c.fxb?.id ?? 'mix', (c, v) => { c.fxb = cambiaModello(c.fxb!, v); c.name = nomeBlocco(c.fxb); }, bs),
        this.spunta('Al contrario', (c) => !!trDi(c)?.reverse, (c, v) => { trDi(c).reverse = v; }, bs),
        this.colore('Colore (passaggio o bordo)', (c) => (trDi(c)?.type === 'dip' ? trDi(c).color : trDi(c)?.borderColor ?? '#ffd54a'), (c, v) => { const t = trDi(c); if (t.type === 'dip') t.color = v; else t.borderColor = v; }, bs),
        this.cursore('Bordo', 0, 20, 0.5, (c) => (trDi(c)?.border ?? 0) * 100, (c, v) => { trDi(c).border = v / 100; }, '', bs),
        this.cursore('Morbidezza', 0, 30, 0.5, (c) => (trDi(c)?.soft ?? 0) * 100, (c, v) => { trDi(c).soft = v / 100; }, '', bs),
      ]));
    } else {
      const colori = ['flash', 'lampoNero', 'strobo', 'dalNero', 'alNero', 'dalBianco', 'alBianco'].includes(fb.id);
      out.push(this.gruppo('btipo', 'Effetto', [
        this.scelta('Effetto', EFFETTI_TEMPO.map((e) => [e.id, `${e.nome} · ${e.info}`] as [string, string]), (c) => c.fxb?.id ?? 'flash', (c, v) => { c.fxb = cambiaModello(c.fxb!, v); c.name = effettoTempo(v)!.nome; }, bs),
        this.cursore('Forza', 10, 150, 1, (c) => Math.round((c.fxb?.forza ?? 1) * 100), (c, v) => { c.fxb!.forza = v / 100; }, '%', bs),
        colori ? this.colore('Colore', (c) => c.fxb?.colore ?? '#ffffff', (c, v) => { c.fxb!.colore = v; }, bs) : null,
      ]));
    }
    // il suono dentro l'FX: acceso/spento, quale, quanto forte
    const suoni: [string, string][] = [['', 'Nessun suono'], ...SUONI.map((x) => [x.id, x.nome] as [string, string])];
    out.push(this.gruppo('bsuono', 'Suono dell\'FX', [
      this.spunta('Suono acceso', (c) => !!c.fxb?.audio && !!c.fxb.suono, (c, v) => { if (c.fxb?.suono) c.fxb.audio = v; }, bs),
      this.scelta('Suono', suoni, (c) => c.fxb?.suono ?? '', (c, v) => { c.fxb!.suono = v || undefined; c.fxb!.audio = !!v; if (v && c.id === b0.id) ascoltaSuono(v, c.fxb!.volume ?? 0); }, bs),
      this.cursore('Volume', -24, 6, 1, (c) => c.fxb?.volume ?? 0, (c, v) => { c.fxb!.volume = v; }, ' dB', bs),
      h('div', { class: 'isp-chips' }, h('button', { class: 'chip', disabled: !fb.suono, on: { click: () => { if (fb.suono) ascoltaSuono(fb.suono, fb.volume ?? 0); } } }, '▶ Ascolta')),
    ]));
    out.push(this.pulsanti([
      ['Centra sul taglio', () => {
        const tg2 = taglioVicino(store.doc, b0.start + b0.len / 2, Math.round(r * 5), b0.track);
        if (!tg2) { avviso('Non c\'è un taglio qui vicino', 'info'); return; }
        tutti('Sul taglio', (c) => { c.start = Math.max(0, Math.round(tg2.f - c.len / 2)); });
      }],
      ['Ripeti dopo', () => { const nb = store.edit('Ripeti blocco', (pp) => posaBlocco(pp, fb, end(b0), b0.len, b0.track)); store.select([nb.id]); }],
      ['Elimina', () => esegui('elimina')],
    ]));
    out.push(h('p', { class: 'nota' }, tr
      ? 'Il blocco lavora sul taglio che ha sotto: si vedono tutte e due le clip, e nessuna cambia durata.'
      : 'L\'effetto vale per la sua traccia e per tutto quello che sta sotto. Allungalo dai bordi, o mettine un altro subito dopo.'));
    return out;
  }

  private titolatrice(tt: Clip[]): HTMLElement {
    const t0 = tt[0].gen!.title!;
    const set = (label: string, fn: (s: TitleSpec) => void) => store.edit(label, () => { for (const c of tt) if (c.gen?.title) fn(c.gen.title); });
    const testo = h('textarea', { class: 'campo-testo', rows: 3 }) as HTMLTextAreaElement;
    testo.value = t0.text;
    let timer = 0;
    testo.addEventListener('input', () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => set('Testo del titolo', (s) => { s.text = testo.value; }), 250);
    });
    const agg = () => { if (document.activeElement !== testo) testo.value = tt[0].gen?.title?.text ?? ''; };
    this.campi.push({ el: testo, aggiorna: agg });
    const tsel = (nome: string, opts: [string, string][], get: (s: TitleSpec) => string, put: (s: TitleSpec, v: string) => void) =>
      this.scelta(nome, opts, (c) => get(c.gen!.title!), (c, v) => put(c.gen!.title!, v), tt);
    return this.gruppo('titolo', 'Titolatrice', [
      h('label', { class: 'etichetta' }, 'Testo (a capo per più righe)'), testo,
      tsel('Stile', [['fisso', 'Fisso'], ['sottopancia', 'Sottopancia'], ['rullo', 'Rullo (sale)'], ['crawl', 'Crawl (scorre)']], (s) => s.style, (s, v) => { s.style = v as TitleSpec['style']; }),
      tsel('Carattere', [['Rajdhani', 'Rajdhani'], ['Orbitron', 'Orbitron'], ['Georgia', 'Georgia (graziato)'], ['Arial Black', 'Arial Black'], ['Courier New', 'Macchina da scrivere'], ['Impact', 'Impact']], (s) => s.font, (s, v) => { s.font = v; }),
      this.cursore('Dimensione', 16, 240, 1, (c) => c.gen!.title!.size, (c, v) => { c.gen!.title!.size = v; }, 'pt', tt),
      this.cursore('Altezza', 5, 95, 1, (c) => Math.round(c.gen!.title!.y * 100), (c, v) => { c.gen!.title!.y = v / 100; }, '%', tt),
      tsel('Allineamento', [['left', 'Sinistra'], ['center', 'Centro'], ['right', 'Destra']], (s) => s.align, (s, v) => { s.align = v as 'left'; }),
      this.colore('Colore', (c) => c.gen!.title!.color, (c, v) => { c.gen!.title!.color = v; }, tt),
      this.colore('Contorno', (c) => c.gen!.title!.outline === 'none' ? '#000000' : c.gen!.title!.outline, (c, v) => { c.gen!.title!.outline = v; }, tt),
      this.spunta('Ombra', (c) => c.gen!.title!.shadow, (c, v) => { c.gen!.title!.shadow = v; }, tt),
      this.spunta('Fascia dietro', (c) => c.gen!.title!.box, (c, v) => { c.gen!.title!.box = v; }, tt),
      this.colore('Colore fascia', (c) => c.gen!.title!.boxColor.slice(0, 7), (c, v) => { c.gen!.title!.boxColor = v + 'cc'; }, tt),
    ]);
  }

  /** durata in secondi: si allunga o si accorcia dal bordo di uscita (con il ripple, se acceso) */
  private durata(cs: Clip[]): HTMLElement {
    const p0 = store.doc;
    const r = fps(p0.rate);
    // una sola clip per gruppo legato: il trim porta con sé anche l'audio o il video della stessa ripresa
    const scelte = () => {
      const visti = new Set<string>();
      return store.doc.clips.filter((c) => cs.some((x) => x.id === c.id)).filter((c) => { if (!c.link) return true; if (visti.has(c.link)) return false; visti.add(c.link); return true; });
    };
    const n = h('input', { type: 'number', class: 'num largo', min: 0.04, step: 0.04 }) as HTMLInputElement;
    const agg = () => { const c = scelte()[0]; if (c && document.activeElement !== n) n.value = (c.len / r).toFixed(2); };
    agg();
    const allunga = (label: string, fn: (c: Clip) => number) => {
      store.edit(label, (p) => {
        for (const c of scelte()) {
          const d = fn(c);
          if (d) M.trimClip(p, c.id, 'out', d, { ripple: modi.ripple, linked: true });
        }
      });
      agg();
    };
    n.addEventListener('change', () => allunga('Durata', (c) => Math.max(1, Math.round(Number(n.value) * r)) - c.len));
    const prossima = (c: Clip) => {
      const dopo = store.doc.clips.filter((x) => x.track === c.track && x.start >= c.start + c.len && x.id !== c.id).sort((a, b) => a.start - b.start)[0];
      return dopo ? dopo.start - (c.start + c.len) : 0;
    };
    const el = h('div', { class: 'isp-durata' },
      h('div', { class: 'isp-riga' }, h('label', null, 'Secondi'), n, h('small', { class: 'nota' }, modi.ripple ? 'ripple: sposta le clip dopo' : 'si ferma alla clip dopo')),
      this.pulsanti([
        ['+1 s', () => allunga('Allunga', () => Math.round(r))],
        ['+5 s', () => allunga('Allunga', () => Math.round(r * 5))],
        ['−1 s', () => allunga('Accorcia', (c) => -Math.min(c.len - 1, Math.round(r)))],
        ['↦ fino alla prossima', () => allunga('Allunga fino alla prossima', prossima)],
      ]),
      h('p', { class: 'nota' }, 'Le immagini e le istantanee si allungano quanto vuoi; i video fino alla fine della ripresa.'));
    this.campi.push({ el, aggiorna: agg });
    return el;
  }

  // ——— mattoncini ———
  private gruppo(id: string, titolo: string, righe: (HTMLElement | null)[], chiuso = false): HTMLElement {
    const aperto = this.aperti.has(id) || (!chiuso && !this.aperti.has('!' + id));
    const el = h('details', { class: 'isp-gruppo', open: aperto }, h('summary', null, titolo), ...righe.filter(Boolean) as HTMLElement[]);
    el.addEventListener('toggle', () => { if ((el as HTMLDetailsElement).open) { this.aperti.add(id); this.aperti.delete('!' + id); } else { this.aperti.delete(id); this.aperti.add('!' + id); } });
    return el;
  }

  private cursore(nome: string, min: number, max: number, step: number, get: (c: Clip) => number, put: (c: Clip, v: number) => void, unita: string, quali: Clip[]): HTMLElement {
    const ids = quali.map((c) => c.id);
    const trova = () => store.doc.clips.filter((c) => ids.includes(c.id));
    const r = h('input', { type: 'range', min, max, step }) as HTMLInputElement;
    const n = h('input', { type: 'number', class: 'num', min, max, step }) as HTMLInputElement;
    const agg = () => { const c = trova()[0]; if (!c) return; const v = get(c); if (document.activeElement !== n) n.value = String(Math.round(v * 100) / 100); r.value = String(v); };
    agg();
    let vivo = false;
    const applica = (v: number) => {
      if (!vivo) { store.begin(nome); vivo = true; }
      for (const c of trova()) put(c, v);
      store.liveChange();
    };
    r.addEventListener('input', () => { applica(Number(r.value)); n.value = r.value; });
    r.addEventListener('change', () => { if (vivo) store.commit(true); vivo = false; });
    n.addEventListener('change', () => { const v = Math.max(min, Math.min(max, Number(n.value) || 0)); applica(v); store.commit(true); vivo = false; r.value = String(v); });
    r.addEventListener('dblclick', () => {
      // doppio clic = valore di partenza
      const def: Record<string, number> = { Opacità: 100, Zoom: 100, Orizzontale: 0, Verticale: 0, Rotazione: 0, Luce: 0, Contrasto: 100, Saturazione: 100, Temperatura: 0, Tinta: 0, Volume: 0, Panorama: 0 };
      if (nome in def) { applica(def[nome]); store.commit(true); vivo = false; agg(); }
    });
    const el = h('div', { class: 'isp-riga' }, h('label', null, nome), r, h('span', { class: 'isp-num' }, n, h('small', null, unita)));
    this.campi.push({ el, aggiorna: agg });
    return el;
  }

  private scelta(nome: string, opzioni: [string, string][], get: (c: Clip) => string, put: (c: Clip, v: string) => void, quali: Clip[]): HTMLElement {
    const ids = quali.map((c) => c.id);
    const s = h('select', { class: 'mini-select' }, opzioni.map(([v, t]) => h('option', { value: v }, t))) as HTMLSelectElement;
    const agg = () => { const c = store.doc.clips.find((x) => ids.includes(x.id)); if (c) s.value = get(c); };
    agg();
    s.addEventListener('change', () => store.edit(nome, () => { for (const c of store.doc.clips) if (ids.includes(c.id)) put(c, s.value); }));
    const el = h('div', { class: 'isp-riga' }, h('label', null, nome), s);
    this.campi.push({ el, aggiorna: agg });
    return el;
  }

  private colore(nome: string, get: (c: Clip) => string, put: (c: Clip, v: string) => void, quali: Clip[]): HTMLElement {
    const ids = quali.map((c) => c.id);
    const inp = h('input', { type: 'color' }) as HTMLInputElement;
    const agg = () => { const c = store.doc.clips.find((x) => ids.includes(x.id)); if (c) inp.value = get(c).slice(0, 7); };
    agg();
    let vivo = false;
    inp.addEventListener('input', () => { if (!vivo) { store.begin(nome); vivo = true; } for (const c of store.doc.clips) if (ids.includes(c.id)) put(c, inp.value); store.liveChange(); });
    inp.addEventListener('change', () => { if (vivo) store.commit(true); vivo = false; });
    const el = h('div', { class: 'isp-riga' }, h('label', null, nome), inp);
    this.campi.push({ el, aggiorna: agg });
    return el;
  }

  private spunta(nome: string, get: (c: Clip) => boolean, put: (c: Clip, v: boolean) => void, quali: Clip[]): HTMLElement {
    const ids = quali.map((c) => c.id);
    const inp = h('input', { type: 'checkbox' }) as HTMLInputElement;
    const agg = () => { const c = store.doc.clips.find((x) => ids.includes(x.id)); if (c) inp.checked = get(c); };
    agg();
    inp.addEventListener('change', () => store.edit(nome, () => { for (const c of store.doc.clips) if (ids.includes(c.id)) put(c, inp.checked); }));
    const el = h('label', { class: 'isp-riga spunta' }, inp, h('span', null, nome));
    this.campi.push({ el, aggiorna: agg });
    return el;
  }

  private pulsanti(lista: [string, () => void][]): HTMLElement {
    return h('div', { class: 'isp-pulsanti' }, lista.map(([n, fn]) => h('button', { class: 'btn-mini', on: { click: fn } }, n)));
  }
}

export { FX0 };
