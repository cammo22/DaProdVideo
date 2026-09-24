// Le proprietà della clip selezionata: trasparenza, posizione, proc amp (il TBC), look, chiave,
// transizione, dissolvenze, volume e — per i generatori — colore, barre, tono e la titolatrice.
import { store } from '../core/store';
import type { Clip, Look, TitleSpec } from '../core/tipi';
import { isVideoClip, mediaOf, trackOf, newTransition, TF0, FX0 } from '../core/progetto';
import { frameToTc, fps } from '../core/timecode';
import { h } from './dom';

type Campo = { el: HTMLElement; aggiorna: () => void };

export class Ispettore {
  el: HTMLElement;
  private corpo: HTMLElement;
  private campi: Campo[] = [];
  private firma = '';
  private aperti = new Set<string>(['trasparenza', 'trasforma', 'titolo', 'audio', 'generatore', 'transizione']);

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
    const firma = cs.map((c) => c.id + c.kind + c.trIn?.type + (c.trIn ? 1 : 0)).join(',');
    if (firma === this.firma && this.campi.length) { for (const c of this.campi) c.aggiorna(); return; }
    this.firma = firma;
    this.campi = [];
    if (!cs.length) {
      this.corpo.replaceChildren(h('div', { class: 'isp-vuoto' },
        h('b', null, 'Nessuna clip selezionata'),
        h('p', null, 'Clicca una clip nella timeline per vederne e cambiarne le proprietà: trasparenza, posizione, colore, volume, titoli.'),
        h('ul', { class: 'isp-tasti' },
          h('li', null, h('kbd', null, '1'), ' taglia al cursore'),
          h('li', null, h('kbd', null, '2'), ' elimina la clip selezionata'),
          h('li', null, h('kbd', null, '3'), ' elimina e chiudi il buco'),
          h('li', null, h('kbd', null, '4'), ' separa audio e video'),
          h('li', null, h('kbd', null, '5'), ' dissolvenza sul taglio'),
          h('li', null, h('kbd', null, 'Alt ↑↓'), ' trasparenza al volo'),
          h('li', null, h('kbd', null, 'B'), ' linee elastiche'))));
      return;
    }
    const video = cs.filter(isVideoClip);
    const audio = cs.filter((c) => !isVideoClip(c));
    const primo = video[0] ?? audio[0];
    const p = store.doc;
    const m = mediaOf(p, primo);
    const out: HTMLElement[] = [];
    out.push(h('div', { class: 'isp-testa' },
      h('input', {
        class: 'isp-nome', value: cs.length > 1 ? `${cs.length} clip` : primo.name, disabled: cs.length > 1,
        on: { change: (e: Event) => store.edit('Rinomina clip', () => { for (const c of this.sel()) c.name = (e.target as HTMLInputElement).value; }) },
      }),
      h('div', { class: 'isp-info' },
        h('span', null, 'Inizio ', h('b', { class: 'tc-testo' }, frameToTc(primo.start, p.rate, p.drop))),
        h('span', null, 'Durata ', h('b', { class: 'tc-testo' }, frameToTc(primo.len, p.rate, p.drop))),
        m ? h('span', { class: 'isp-sorgente' }, `${m.name} · ${m.vcodec || m.acodec}`) : h('span', null, trackOf(p, primo.track).name))));

    if (video.length) {
      out.push(this.gruppo('trasparenza', 'Trasparenza', [
        this.cursore('Opacità', 0, 100, 1, (c) => Math.round(c.opacity * 100), (c, v) => { c.opacity = v / 100; c.opKeys = []; }, '%', video),
        this.pulsanti([['100%', 1], ['75%', 0.75], ['50%', 0.5], ['25%', 0.25], ['0', 0]].map(([n, v]) => [n as string, () => store.edit('Opacità', () => { for (const c of video) { c.opacity = v as number; c.opKeys = []; } })])),
        video.some((c) => c.opKeys.length) ? h('p', { class: 'nota' }, 'Questa clip ha una linea elastica: la trasparenza cambia nel tempo. Muovere il cursore la toglie.') : null,
      ]));
      out.push(this.gruppo('trasforma', 'Posizione e dimensione', [
        this.cursore('Scala', 5, 400, 1, (c) => Math.round(c.tf.scale * 100), (c, v) => { c.tf.scale = v / 100; }, '%', video),
        this.cursore('Orizzontale', -p.w, p.w, 1, (c) => Math.round(c.tf.x), (c, v) => { c.tf.x = v; }, 'px', video),
        this.cursore('Verticale', -p.h, p.h, 1, (c) => Math.round(c.tf.y), (c, v) => { c.tf.y = v; }, 'px', video),
        this.cursore('Rotazione', -180, 180, 0.5, (c) => c.tf.rot, (c, v) => { c.tf.rot = v; }, '°', video),
        this.cursore('Ritaglio sinistra', 0, 50, 0.5, (c) => c.tf.cropL * 100, (c, v) => { c.tf.cropL = v / 100; }, '%', video),
        this.cursore('Ritaglio destra', 0, 50, 0.5, (c) => c.tf.cropR * 100, (c, v) => { c.tf.cropR = v / 100; }, '%', video),
        this.cursore('Ritaglio sopra', 0, 50, 0.5, (c) => c.tf.cropT * 100, (c, v) => { c.tf.cropT = v / 100; }, '%', video),
        this.cursore('Ritaglio sotto', 0, 50, 0.5, (c) => c.tf.cropB * 100, (c, v) => { c.tf.cropB = v / 100; }, '%', video),
        this.pulsanti([
          ['Adatta', () => store.edit('Adatta', () => { for (const c of video) c.tf = { ...TF0 }; })],
          ['Riempi', () => store.edit('Riempi', () => { for (const c of video) { const mm = mediaOf(p, c); if (mm?.width) { const w = mm.rotation % 180 ? mm.height : mm.width, hh = mm.rotation % 180 ? mm.width : mm.height; const kf = Math.min(p.w / w, p.h / hh), kc = Math.max(p.w / w, p.h / hh); c.tf.scale = kc / kf; } } })],
          ['PiP ↘', () => store.edit('Riquadro', () => { for (const c of video) c.tf = { ...TF0, scale: 0.33, x: p.w * 0.3, y: p.h * 0.28 }; })],
          ['PiP ↖', () => store.edit('Riquadro', () => { for (const c of video) c.tf = { ...TF0, scale: 0.33, x: -p.w * 0.3, y: -p.h * 0.28 }; })],
        ]),
      ]));
      out.push(this.gruppo('procamp', 'Proc amp (TBC)', [
        this.cursore('Nero / luminosità', -50, 50, 1, (c) => Math.round(c.fx.bright * 100), (c, v) => { c.fx.bright = v / 100; }, '', video),
        this.cursore('Guadagno / contrasto', 0, 200, 1, (c) => Math.round(c.fx.contrast * 100), (c, v) => { c.fx.contrast = v / 100; }, '%', video),
        this.cursore('Croma / saturazione', 0, 200, 1, (c) => Math.round(c.fx.sat * 100), (c, v) => { c.fx.sat = v / 100; }, '%', video),
        this.cursore('Fase / tinta', -180, 180, 1, (c) => c.fx.hue, (c, v) => { c.fx.hue = v; }, '°', video),
        this.pulsanti([['Azzera', () => store.edit('Azzera proc amp', () => { for (const c of video) { c.fx.bright = 0; c.fx.contrast = 1; c.fx.sat = 1; c.fx.hue = 0; } })]]),
      ]));
      out.push(this.gruppo('look', 'Look', [
        this.scelta('Aspetto', [['none', 'Nessuno'], ['vhs', 'VHS'], ['film', 'Pellicola'], ['crt', 'Tubo catodico'], ['bn', 'Bianco e nero'], ['seppia', 'Seppia']], (c) => c.fx.look, (c, v) => { c.fx.look = v as Look; }, video),
      ]));
      out.push(this.gruppo('chiave', 'Chiave (key)', [
        this.scelta('Tipo', [['none', 'Nessuna'], ['luma', 'Luminanza (toglie il nero)'], ['chroma', 'Croma (green / blue screen)']], (c) => c.fx.key, (c, v) => { c.fx.key = v as Clip['fx']['key']; }, video),
        this.colore('Colore della chiave', (c) => c.fx.keyColor, (c, v) => { c.fx.keyColor = v; }, video),
        this.pulsanti([['Verde', () => store.edit('Chiave verde', () => { for (const c of video) { c.fx.key = 'chroma'; c.fx.keyColor = '#00b140'; } })], ['Blu', () => store.edit('Chiave blu', () => { for (const c of video) { c.fx.key = 'chroma'; c.fx.keyColor = '#0047bb'; } })]]),
        this.cursore('Soglia', 0, 100, 1, (c) => Math.round(c.fx.keyLevel * 100), (c, v) => { c.fx.keyLevel = v / 100; }, '', video),
        this.cursore('Morbidezza', 0, 50, 1, (c) => Math.round(c.fx.keySoft * 100), (c, v) => { c.fx.keySoft = v / 100; }, '', video),
        this.spunta('Inverti', (c) => c.fx.keyInvert, (c, v) => { c.fx.keyInvert = v; }, video),
      ], true));
    }
    const conTr = cs.filter((c) => c.trIn);
    out.push(this.gruppo('transizione', 'Transizione in testa', conTr.length ? [
      this.scelta('Tipo', [['mix', 'Dissolvenza incrociata'], ['wipe', 'Tendina'], ['dip', 'Passaggio a colore']], (c) => c.trIn?.type ?? 'mix', (c, v) => { if (c.trIn) c.trIn.type = v as 'mix'; }, conTr),
      this.cursore('Durata', 1, Math.round(fps(p.rate) * 5), 1, (c) => c.trIn?.len ?? 0, (c, v) => { if (c.trIn) c.trIn.len = Math.min(v, c.len); }, 'fot', conTr),
      this.scelta('Tendina SMPTE', [['1', '1 · orizzontale'], ['2', '2 · verticale'], ['3', '3 · angolo'], ['4', '4 · angolo destro'], ['21', '21 · porta'], ['22', '22 · porta orizz.'], ['41', '41 · diagonale'], ['101', '101 · scatola'], ['102', '102 · rombo'], ['119', '119 · iride'], ['201', '201 · orologio'], ['7', '7 · veneziana']], (c) => String(c.trIn?.pattern ?? 1), (c, v) => { if (c.trIn) c.trIn.pattern = Number(v); }, conTr),
      this.cursore('Bordo morbido', 0, 40, 1, (c) => Math.round((c.trIn?.soft ?? 0) * 100), (c, v) => { if (c.trIn) c.trIn.soft = v / 100; }, '', conTr),
      this.cursore('Bordo colorato', 0, 20, 0.5, (c) => (c.trIn?.border ?? 0) * 100, (c, v) => { if (c.trIn) c.trIn.border = v / 100; }, '', conTr),
      this.colore('Colore del bordo', (c) => c.trIn?.borderColor ?? '#ffd54a', (c, v) => { if (c.trIn) c.trIn.borderColor = v; }, conTr),
      this.colore('Colore del passaggio', (c) => c.trIn?.color ?? '#000000', (c, v) => { if (c.trIn) c.trIn.color = v; }, conTr),
      this.spunta('Al contrario', (c) => !!c.trIn?.reverse, (c, v) => { if (c.trIn) c.trIn.reverse = v; }, conTr),
      this.pulsanti([['Togli', () => store.edit('Togli transizione', () => { for (const c of this.sel()) c.trIn = undefined; })]]),
    ] : [
      h('p', { class: 'nota' }, 'Nessuna transizione. Mettila con 5 (dissolvenza), 6 (tendina), 7 (passaggio al nero) o trascinandola dal pannello Transizioni.'),
      this.pulsanti([['Dissolvenza', () => store.edit('Transizione', () => { for (const c of this.sel()) c.trIn = newTransition('mix', Math.min(c.len, Math.round(fps(p.rate)))); })]]),
    ]));
    out.push(this.gruppo('dissolvenze', 'Dissolvenze (fade)', [
      this.cursore('In apertura', 0, Math.round(fps(p.rate) * 5), 1, (c) => c.fadeIn, (c, v) => { c.fadeIn = Math.min(v, c.len); }, 'fot', cs),
      this.cursore('In chiusura', 0, Math.round(fps(p.rate) * 5), 1, (c) => c.fadeOut, (c, v) => { c.fadeOut = Math.min(v, c.len); }, 'fot', cs),
    ]));
    if (audio.length) {
      out.push(this.gruppo('audio', 'Audio', [
        this.cursore('Volume', -40, 12, 0.5, (c) => c.gain, (c, v) => { c.gain = v; c.gainKeys = []; }, 'dB', audio),
        this.cursore('Panorama', -100, 100, 1, (c) => Math.round(c.pan * 100), (c, v) => { c.pan = v / 100; }, '', audio),
        this.pulsanti([['0 dB', () => store.edit('Volume', () => { for (const c of audio) { c.gain = 0; c.gainKeys = []; } })], ['−6', () => store.edit('Volume', () => { for (const c of audio) { c.gain = -6; c.gainKeys = []; } })], ['−12', () => store.edit('Volume', () => { for (const c of audio) { c.gain = -12; c.gainKeys = []; } })], ['Muto', () => store.edit('Volume', () => { for (const c of audio) { c.gain = -60; c.gainKeys = []; } })]]),
      ]));
    }
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
    this.corpo.replaceChildren(...out);
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

  // ——— mattoncini ———
  private gruppo(id: string, titolo: string, righe: (HTMLElement | null)[], chiuso = false): HTMLElement {
    const aperto = this.aperti.has(id) || (!chiuso && !this.aperti.has('!' + id) && id !== 'chiave' && id !== 'look' && id !== 'procamp');
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
      const def: Record<string, number> = { Opacità: 100, Scala: 100, Orizzontale: 0, Verticale: 0, Rotazione: 0, 'Nero / luminosità': 0, 'Guadagno / contrasto': 100, 'Croma / saturazione': 100, 'Fase / tinta': 0, Volume: 0, Panorama: 0 };
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
