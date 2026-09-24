// La timeline: tutto disegnato su una tela (migliaia di clip restano fluide), le testate delle tracce in HTML.
// Clic sul righello = cursore · clic su una clip = selezione · trascina = sposta (con la calamita)
// bordi = trim · Shift sul taglio = roll · Alt+trascina = slip · linee elastiche = trasparenza e volume.
import { store } from '../core/store';
import { motore } from '../motore';
import * as M from '../core/montaggio';
import { clipById, dbToGain, end, isVideoClip, keyValue, mediaOf, newTrack, nextTrackName, projectEnd, srcTimeAt, trackOf } from '../core/progetto';
import type { Clip, Project, Track } from '../core/tipi';
import { ETICHETTE } from '../core/tipi';
import { fps, frameToTc, f2s, tcBase } from '../core/timecode';
import { miniatura, mediaRT, PEAKS_PER_SEC, quandoMiniature, quandoPicchi } from '../media/libreria';
import { modi, esegui, montaDalPlayer, bersagli, inserisciGeneratore } from '../azioni';
import { avviso, chiedi, clamp, h, icona, menuContesto, type VoceMenu } from './dom';
import { registraBersaglio } from './trascina';

const RIGHELLO = 30;
const SEP = 8;
const BORDO = 7;

const COLORI: Record<string, [string, string]> = {
  video: ['#3565c7', '#23458c'],
  audio: ['#2a8a5e', '#1b5e3f'],
  title: ['#8448d6', '#5b2c9e'],
  gen: ['#b67a2c', '#7c521b'],
  tone: ['#9a7d22', '#6b5614'],
};

type Presa =
  | { tipo: 'cursore' }
  | { tipo: 'sposta'; ids: Set<string>; base: Clip[]; x0: number; y0: number; kind: 'video' | 'audio'; df: number; dt: number; ancora: Clip }
  | { tipo: 'trim'; id: string; edge: 'in' | 'out'; base: Clip[]; x0: number; d: number; linked: boolean; ripple: boolean }
  | { tipo: 'roll'; l: string; r: string; base: Clip[]; x0: number; d: number }
  | { tipo: 'slip'; ids: Set<string>; base: Clip[]; x0: number; d: number }
  | { tipo: 'riquadro'; x0: number; y0: number; x1: number; y1: number; add: boolean }
  | { tipo: 'elastico'; id: string; key: number; base: Clip[] };

interface Colpo {
  track?: Track;
  clip?: Clip;
  zona: 'righello' | 'corpo' | 'in' | 'out' | 'vuoto' | 'fuori';
  f: number;
  taglio?: { l: Clip; r: Clip };
}

export class Timeline {
  el: HTMLElement;
  private cv: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private testate: HTMLElement;
  private barra: HTMLElement;
  private barraManiglia: HTMLElement;
  private area: HTMLElement;
  ppf = 4; // pixel per fotogramma
  scrollF = 0;
  scrollY = 0;
  private dpr = 1;
  private W = 0;
  private H = 0;
  private sporco = true;
  private presa: Presa | null = null;
  private snapLinea: number | null = null;
  private fantasma: { track: string; f: number; len: number; kind: 'video' | 'audio' }[] | null = null;
  private seguiCursore = true;

  constructor() {
    this.cv = h('canvas', { class: 'tl-tela', tabindex: 0 });
    this.ctx = this.cv.getContext('2d', { alpha: false })!;
    this.testate = h('div', { class: 'tl-testate' });
    this.barraManiglia = h('div', { class: 'tl-scroll-maniglia' });
    this.barra = h('div', { class: 'tl-scroll' }, this.barraManiglia);
    this.area = h('div', { class: 'tl-area' }, this.cv, this.barra);
    this.el = h('div', { class: 'timeline' },
      h('div', { class: 'tl-angolo' },
        h('button', { class: 'btn-mini', title: 'Aggiungi traccia video (Ctrl+Alt+V)', on: { click: () => esegui('tracciaV') } }, '+V'),
        h('button', { class: 'btn-mini', title: 'Aggiungi traccia audio (Ctrl+Alt+A)', on: { click: () => esegui('tracciaA') } }, '+A')),
      this.testate, this.area);
    new ResizeObserver(() => this.adatta()).observe(this.area);
    store.on('doc', () => { this.testateSeCambiate(); this.sporca(); });
    store.on('sel', () => this.sporca());
    store.on('view', () => { this.costruisciTestate(); this.sporca(); });
    store.on('status', () => this.sporca());
    store.on('head', () => { this.segui(); this.sporca(); });
    quandoMiniature(() => this.sporca());
    quandoPicchi(() => this.sporca());
    this.eventi();
    this.costruisciTestate();
    const loop = () => { if (this.sporco) { this.sporco = false; this.disegna(); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  sporca() { this.sporco = true; }

  private adatta() {
    this.dpr = Math.min(2, devicePixelRatio || 1);
    const r = this.area.getBoundingClientRect();
    this.W = Math.max(50, r.width);
    this.H = Math.max(50, r.height - 12);
    this.cv.width = Math.round(this.W * this.dpr);
    this.cv.height = Math.round(this.H * this.dpr);
    this.cv.style.width = this.W + 'px';
    this.cv.style.height = this.H + 'px';
    this.sporca();
  }

  // ——— coordinate ———
  fX = (f: number) => (f - this.scrollF) * this.ppf;
  xF = (x: number) => x / this.ppf + this.scrollF;

  private righe(p: Project) {
    const out: { t: Track; y: number; h: number }[] = [];
    let y = RIGHELLO - this.scrollY;
    let prima: Track | null = null;
    for (const t of p.tracks) {
      if (prima && prima.kind === 'video' && t.kind === 'audio') y += SEP;
      out.push({ t, y, h: t.height });
      y += t.height;
      prima = t;
    }
    return out;
  }

  private altezzaTotale() {
    const p = store.doc;
    return p.tracks.reduce((s, t) => s + t.height, 0) + SEP + RIGHELLO + 40;
  }

  private colpo(x: number, y: number): Colpo {
    const p = store.doc;
    const f = this.xF(x);
    if (y < RIGHELLO) return { zona: 'righello', f };
    const riga = this.righe(p).find((r) => y >= r.y && y < r.y + r.h);
    if (!riga) return { zona: 'fuori', f };
    const t = riga.t;
    const on = p.clips.filter((c) => c.track === t.id);
    const bordo = BORDO / this.ppf;
    // prima i bordi (anche un po' fuori dalla clip, così le clip corte si prendono lo stesso)
    for (const c of on) {
      const w = c.len * this.ppf;
      const b = Math.min(bordo, (c.len / 3));
      if (Math.abs(f - c.start) <= b && w > 10) {
        const l = on.find((x) => end(x) === c.start);
        return { track: t, clip: c, zona: 'in', f, taglio: l ? { l, r: c } : undefined };
      }
      if (Math.abs(f - end(c)) <= b && w > 10) {
        const rr = on.find((x) => x.start === end(c));
        if (rr && f > end(c)) continue; // lato destro del taglio: è il bordo d'ingresso della clip dopo
        return { track: t, clip: c, zona: 'out', f, taglio: rr ? { l: c, r: rr } : undefined };
      }
    }
    const c = on.find((x) => f >= x.start && f < end(x));
    if (c) return { track: t, clip: c, zona: 'corpo', f };
    return { track: t, zona: 'vuoto', f };
  }

  // ——— zoom e scorrimento ———
  zoom(k: number, attornoX?: number) {
    const x = attornoX ?? this.fX(store.head);
    const f = this.xF(x);
    this.ppf = clamp(this.ppf * k, 0.004, 48);
    this.scrollF = Math.max(0, f - x / this.ppf);
    this.sporca();
  }

  adattaTutto() {
    const e = Math.max(projectEnd(store.doc), tcBase(store.doc.rate) * 10);
    this.ppf = clamp((this.W - 40) / e, 0.004, 48);
    this.scrollF = 0;
    this.sporca();
  }

  /** in riproduzione la timeline gira pagina quando il cursore esce a destra, come in EDIUS */
  private segui() {
    if (!this.seguiCursore || this.presa) return;
    const x = this.fX(store.head);
    if (x > this.W - 30 || x < 0) {
      this.scrollF = motore.playing ? store.head - 30 / this.ppf : Math.max(0, store.head - (this.W * 0.3) / this.ppf);
      this.scrollF = Math.max(0, this.scrollF);
    }
  }

  // ——— testate ———
  private firmaTestate = '';
  /** le testate si rifanno solo se cambiano le tracce, non a ogni spostamento di clip */
  private testateSeCambiate() {
    const b = bersagli();
    const f = store.doc.tracks.map((t) => [t.id, t.name, t.height, t.mute, t.solo, t.lock, t.opacity, t.volume].join(',')).join(';') + '|' + b.video + b.audio.join(',') + '|' + this.scrollY;
    if (f !== this.firmaTestate) this.costruisciTestate();
  }

  costruisciTestate() {
    const bb0 = bersagli();
    this.firmaTestate = store.doc.tracks.map((t) => [t.id, t.name, t.height, t.mute, t.solo, t.lock, t.opacity, t.volume].join(',')).join(';') + '|' + bb0.video + bb0.audio.join(',') + '|' + this.scrollY;
    const p = store.doc;
    this.testate.replaceChildren();
    this.testate.style.setProperty('--righello', RIGHELLO + 'px');
    const cont = h('div', { class: 'tl-testate-in', style: `transform: translateY(${-this.scrollY}px)` });
    let prima: Track | null = null;
    const bb = bersagli();
    const tv = bb.video;
    const ta = bb.audio;
    for (const t of p.tracks) {
      if (prima && prima.kind === 'video' && t.kind === 'audio') cont.appendChild(h('div', { class: 'tl-sep', style: `height:${SEP}px` }));
      prima = t;
      const bersaglio = t.kind === 'video' ? t.id === tv : ta.includes(t.id);
      const cambia = (label: string, fn: (tr: Track) => void) => store.edit(label, (pp) => fn(pp.tracks.find((x) => x.id === t.id)!));
      const fader = h('input', {
        type: 'range', class: 'fader-mini', min: t.kind === 'video' ? 0 : -40, max: t.kind === 'video' ? 100 : 12, step: 1,
        value: String(t.kind === 'video' ? Math.round(t.opacity * 100) : t.volume),
        title: t.kind === 'video' ? 'Trasparenza della traccia (livello al volo)' : 'Volume della traccia (dB)',
      }) as HTMLInputElement;
      const val = h('span', { class: 'fader-val' }, t.kind === 'video' ? Math.round(t.opacity * 100) + '%' : (t.volume > 0 ? '+' : '') + t.volume + 'dB');
      let preso = false;
      fader.addEventListener('pointerdown', () => { preso = true; store.begin(t.kind === 'video' ? 'Trasparenza traccia' : 'Volume traccia'); });
      fader.addEventListener('input', () => {
        const v = Number(fader.value);
        const tr = store.doc.tracks.find((x) => x.id === t.id)!;
        if (t.kind === 'video') tr.opacity = v / 100; else tr.volume = v;
        val.textContent = t.kind === 'video' ? v + '%' : (v > 0 ? '+' : '') + v + 'dB';
        if (!preso) store.begin('Livello');
        preso = true;
        store.liveChange();
      });
      fader.addEventListener('change', () => { if (preso) store.commit(true); preso = false; });
      fader.addEventListener('dblclick', () => { store.edit('Livello a zero', (pp) => { const tr = pp.tracks.find((x) => x.id === t.id)!; if (t.kind === 'video') tr.opacity = 1; else tr.volume = 0; }); });
      const riga = h('div', { class: `tl-testata ${t.kind}${t.lock ? ' bloccata' : ''}${t.mute ? ' spenta' : ''}`, style: `height:${t.height}px` },
        h('div', { class: 'tt-riga' },
          h('button', {
            class: 'tt-nome' + (bersaglio ? ' bersaglio' : ''), title: 'Destinazione dal Player (patch): clic per accendere/spegnere',
            on: {
              click: () => {
                if (t.kind === 'video') { if (bersaglio) modi.patchV = false; else { modi.patchV = true; modi.targetV = t.id; } }
                else { const cur = new Set(ta); if (cur.has(t.id)) cur.delete(t.id); else cur.add(t.id); modi.targetA = [...cur].slice(-2); }
                this.costruisciTestate();
                store.emit('status');
              },
            },
          }, h('span', { class: 'led' + (bersaglio ? ' acceso' : '') }), t.name),
          h('button', { class: 'tt-btn' + (t.mute ? ' on-rosso' : ''), title: t.kind === 'video' ? 'Mostra / nascondi la traccia' : 'Muto', on: { click: () => cambia(t.mute ? 'Accendi traccia' : 'Spegni traccia', (tr) => { tr.mute = !tr.mute; }) } }, icona(t.kind === 'video' ? 'occhio' : 'altoparlante', 14)),
          t.kind === 'audio' ? h('button', { class: 'tt-btn' + (t.solo ? ' on-oro' : ''), title: 'Solo', on: { click: () => cambia('Solo', (tr) => { tr.solo = !tr.solo; }) } }, 'S') : null,
          h('button', { class: 'tt-btn' + (t.lock ? ' on-oro' : ''), title: 'Blocca la traccia', on: { click: () => cambia(t.lock ? 'Sblocca' : 'Blocca', (tr) => { tr.lock = !tr.lock; }) } }, icona('lucchetto', 13))),
        t.height >= 40 ? h('div', { class: 'tt-riga fader' }, fader, val) : null,
        h('div', {
          class: 'tt-altezza', title: 'Trascina per cambiare l\'altezza',
          on: {
            pointerdown: (e: PointerEvent) => {
              const y0 = e.clientY, h0 = t.height;
              const el = e.currentTarget as HTMLElement;
              el.setPointerCapture(e.pointerId);
              const mv = (ev: PointerEvent) => { const tr = store.doc.tracks.find((x) => x.id === t.id)!; tr.height = clamp(h0 + ev.clientY - y0, 26, 180); riga.style.height = tr.height + 'px'; this.sporca(); };
              const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); this.costruisciTestate(); };
              el.addEventListener('pointermove', mv);
              el.addEventListener('pointerup', up);
            },
          },
        }));
      riga.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        menuContesto(e.clientX, e.clientY, [
          { nome: 'Rinomina traccia', fn: async () => { const n = await chiedi('Rinomina traccia', 'Nome', t.name); if (n) cambia('Rinomina', (tr) => { tr.name = n.slice(0, 12); }); } },
          { nome: 'Aggiungi traccia ' + (t.kind === 'video' ? 'video sopra' : 'audio sotto'), fn: () => store.edit('Aggiungi traccia', (pp) => { const i = pp.tracks.findIndex((x) => x.id === t.id); pp.tracks.splice(t.kind === 'video' ? i : i + 1, 0, newTrack(t.kind, nextTrackName(pp, t.kind))); }) },
          { nome: 'Elimina traccia (e le sue clip)', disattiva: p.tracks.filter((x) => x.kind === t.kind).length <= 1, fn: () => store.edit('Elimina traccia', (pp) => { pp.tracks = pp.tracks.filter((x) => x.id !== t.id); pp.clips = pp.clips.filter((c) => c.track !== t.id); }) },
          { sep: true },
          { nome: 'Altezza piccola', fn: () => cambia('Altezza', (tr) => { tr.height = 30; }) },
          { nome: 'Altezza normale', fn: () => cambia('Altezza', (tr) => { tr.height = t.kind === 'video' ? 58 : 46; }) },
          { nome: 'Altezza grande', fn: () => cambia('Altezza', (tr) => { tr.height = 100; }) },
        ]);
      });
      cont.appendChild(riga);
    }
    this.testate.appendChild(h('div', { class: 'tl-testate-righello', style: `height:${RIGHELLO}px` },
      h('span', { class: 'tc-mini' }, frameToTc(Math.round(store.head), p.rate, p.drop))));
    this.testate.appendChild(cont);
  }

  // ——— disegno ———
  private disegna() {
    const ctx = this.ctx, p = store.doc, W = this.W, H = this.H;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#0f0e14';
    ctx.fillRect(0, 0, W, H);
    const righe = this.righe(p);
    const r = fps(p.rate);
    const f0 = Math.floor(this.scrollF), f1 = Math.ceil(this.xF(W));
    // sfondo delle tracce
    for (const { t, y, h: hh } of righe) {
      if (y > H || y + hh < RIGHELLO) continue;
      ctx.fillStyle = t.kind === 'video' ? '#16151e' : '#13161a';
      ctx.fillRect(0, y, W, hh);
      ctx.fillStyle = 'rgba(255,255,255,.035)';
      ctx.fillRect(0, y + hh - 1, W, 1);
      if (t.lock) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, y, W, hh); ctx.clip();
        ctx.strokeStyle = 'rgba(255,213,74,.06)';
        for (let x = -hh; x < W; x += 12) { ctx.beginPath(); ctx.moveTo(x, y + hh); ctx.lineTo(x + hh, y); ctx.stroke(); }
        ctx.restore();
      }
    }
    // separatore video/audio
    const primaAudio = righe.find((x) => x.t.kind === 'audio');
    if (primaAudio) {
      const g = ctx.createLinearGradient(0, primaAudio.y - SEP, 0, primaAudio.y);
      g.addColorStop(0, '#2a2833'); g.addColorStop(1, '#0a090d');
      ctx.fillStyle = g;
      ctx.fillRect(0, primaAudio.y - SEP, W, SEP);
    }
    // zona attacco-stacco
    if (p.inF !== null || p.outF !== null) {
      const a = p.inF ?? 0, b = p.outF ?? projectEnd(p);
      ctx.fillStyle = 'rgba(53,232,255,.07)';
      ctx.fillRect(this.fX(a), RIGHELLO, (b - a) * this.ppf, H);
    }
    // clip
    for (const { t, y, h: hh } of righe) {
      if (y > H || y + hh < RIGHELLO) continue;
      for (const c of p.clips) {
        if (c.track !== t.id) continue;
        if (end(c) < f0 - 1 || c.start > f1 + 1) continue;
        this.disegnaClip(ctx, p, c, t, y, hh, r);
      }
    }
    // fantasma del trascinamento dal contenitore
    if (this.fantasma) {
      for (const g of this.fantasma) {
        const row = righe.find((x) => x.t.id === g.track);
        if (!row) continue;
        ctx.fillStyle = 'rgba(255,213,74,.25)';
        ctx.strokeStyle = '#ffd54a';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.fillRect(this.fX(g.f), row.y + 2, g.len * this.ppf, row.h - 4);
        ctx.strokeRect(this.fX(g.f) + 0.5, row.y + 2.5, g.len * this.ppf - 1, row.h - 5);
        ctx.setLineDash([]);
      }
    }
    // riquadro di selezione
    if (this.presa?.tipo === 'riquadro') {
      const q = this.presa;
      ctx.fillStyle = 'rgba(255,213,74,.08)';
      ctx.strokeStyle = 'rgba(255,213,74,.8)';
      ctx.fillRect(Math.min(q.x0, q.x1), Math.min(q.y0, q.y1), Math.abs(q.x1 - q.x0), Math.abs(q.y1 - q.y0));
      ctx.strokeRect(Math.min(q.x0, q.x1) + 0.5, Math.min(q.y0, q.y1) + 0.5, Math.abs(q.x1 - q.x0), Math.abs(q.y1 - q.y0));
    }
    this.disegnaRighello(ctx, p, W, r);
    // linea della calamita
    if (this.snapLinea !== null) {
      const x = Math.round(this.fX(this.snapLinea)) + 0.5;
      ctx.strokeStyle = '#ffd54a';
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(x, RIGHELLO); ctx.lineTo(x, H); ctx.stroke();
      ctx.setLineDash([]);
    }
    // cursore
    const hx = Math.round(this.fX(store.head)) + 0.5;
    if (hx >= -2 && hx <= W + 2) {
      ctx.strokeStyle = motore.playing ? '#ff4d6d' : '#ff6b81';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hx, RIGHELLO - 6); ctx.lineTo(hx, H); ctx.stroke();
      ctx.fillStyle = '#ffd54a';
      ctx.beginPath(); ctx.moveTo(hx - 6, RIGHELLO - 12); ctx.lineTo(hx + 6, RIGHELLO - 12); ctx.lineTo(hx + 6, RIGHELLO - 6); ctx.lineTo(hx, RIGHELLO); ctx.lineTo(hx - 6, RIGHELLO - 6); ctx.closePath(); ctx.fill();
    }
    this.aggiornaScroll();
    const tcm = this.testate.querySelector('.tc-mini');
    if (tcm) tcm.textContent = frameToTc(Math.round(store.head), p.rate, p.drop);
  }

  private disegnaRighello(ctx: CanvasRenderingContext2D, p: Project, W: number, r: number) {
    const g = ctx.createLinearGradient(0, 0, 0, RIGHELLO);
    g.addColorStop(0, '#24222c'); g.addColorStop(1, '#17161d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, RIGHELLO);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, RIGHELLO - 1, W, 1);
    // passo delle tacche: secondi "tondi" che stanno bene alla scala attuale
    const base = tcBase(p.rate);
    const passi = [1, 2, 5, 10, base, base * 2, base * 5, base * 10, base * 30, base * 60, base * 120, base * 300, base * 600, base * 1800, base * 3600];
    const passo = passi.find((s) => s * this.ppf >= 90) ?? passi[passi.length - 1];
    const minore = passi.find((s) => s * this.ppf >= 12) ?? passo;
    const a = Math.floor(this.scrollF / minore) * minore;
    ctx.font = '600 10.5px Rajdhani, sans-serif';
    ctx.textBaseline = 'top';
    for (let f = a; this.fX(f) < W; f += minore) {
      const x = Math.round(this.fX(f)) + 0.5;
      const major = f % passo === 0;
      ctx.strokeStyle = major ? '#8f8a9e' : '#4a4756';
      ctx.beginPath(); ctx.moveTo(x, major ? RIGHELLO - 13 : RIGHELLO - 6); ctx.lineTo(x, RIGHELLO - 1); ctx.stroke();
      if (major) {
        ctx.fillStyle = '#bdb8cc';
        ctx.fillText(frameToTc(f, p.rate, p.drop), x + 3, 3);
      }
    }
    // attacco / stacco
    if (p.inF !== null || p.outF !== null) {
      const a2 = p.inF ?? 0, b2 = p.outF ?? projectEnd(p);
      ctx.fillStyle = 'rgba(53,232,255,.35)';
      ctx.fillRect(this.fX(a2), RIGHELLO - 5, (b2 - a2) * this.ppf, 4);
      ctx.fillStyle = '#35e8ff';
      if (p.inF !== null) { const x = this.fX(p.inF); ctx.fillRect(x, 13, 2, RIGHELLO - 13); ctx.fillText('IN', x + 3, 14); }
      if (p.outF !== null) { const x = this.fX(p.outF); ctx.fillRect(x - 2, 13, 2, RIGHELLO - 13); ctx.fillText('OUT', x - 22, 14); }
    }
    // marcatori
    for (const m of p.markers) {
      const x = this.fX(m.f);
      if (x < -10 || x > W + 10) continue;
      ctx.fillStyle = m.color;
      ctx.beginPath(); ctx.moveTo(x - 5, 14); ctx.lineTo(x + 5, 14); ctx.lineTo(x + 5, 21); ctx.lineTo(x, 26); ctx.lineTo(x - 5, 21); ctx.closePath(); ctx.fill();
    }
    void r;
  }

  private disegnaClip(ctx: CanvasRenderingContext2D, p: Project, c: Clip, t: Track, y: number, hh: number, r: number) {
    const x = this.fX(c.start), w = Math.max(1, c.len * this.ppf);
    const top = y + 2, alt = hh - 4;
    const sel = store.sel.has(c.id);
    const m = mediaOf(p, c);
    const rt = c.media ? mediaRT(c.media) : undefined;
    const offline = c.kind === 'media' && (!rt || rt.stato !== 'ok');
    const tipo = c.kind === 'media' ? (t.kind === 'video' ? 'video' : 'audio') : c.kind === 'title' ? 'title' : c.kind === 'tone' || c.kind === 'beep' ? 'tone' : 'gen';
    const [c1, c2] = COLORI[tipo];
    const xl = Math.max(x, -4), xr = Math.min(x + w, this.W + 4);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + 0.5, top + 0.5, w - 1, alt - 1, Math.min(4, w / 3));
    ctx.clip();
    const g = ctx.createLinearGradient(0, top, 0, top + alt);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(xl, top, xr - xl, alt);
    if (t.mute) { ctx.globalAlpha = 0.45; }
    const testa = Math.min(15, alt * 0.4);
    const corpoY = top + testa, corpoH = alt - testa;
    // contenuto: miniature o forma d'onda
    if (c.kind === 'media' && !offline && corpoH > 8) {
      if (t.kind === 'video' && m && m.type !== 'audio') this.filmstrip(ctx, p, c, x, w, corpoY, corpoH, r, xl, xr);
      else if (t.kind === 'audio' && rt?.peaks) this.onda(ctx, c, x, w, corpoY, corpoH, rt.peaks, rt.peaksDone, xl, xr, r);
    } else if (c.kind === 'bars' && corpoH > 6) {
      const cols = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
      const bw = Math.min(w, 70) / 7;
      cols.forEach((col, i) => { ctx.fillStyle = col; ctx.fillRect(x + 2 + i * bw, corpoY + 2, bw, corpoH - 4); });
    } else if ((c.kind === 'tone' || c.kind === 'beep') && corpoH > 6) {
      ctx.strokeStyle = 'rgba(255,240,180,.6)';
      ctx.beginPath();
      for (let xx = xl; xx < xr; xx += 2) { const yy = corpoY + corpoH / 2 + Math.sin(xx * 0.5) * corpoH * 0.3; if (xx === xl) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
      ctx.stroke();
    } else if (c.kind === 'color' && corpoH > 6) {
      ctx.fillStyle = c.gen?.color ?? '#000';
      ctx.fillRect(xl + 2, corpoY + 2, Math.min(xr - xl - 4, 60), corpoH - 4);
    }
    if (offline) {
      ctx.fillStyle = 'rgba(255,77,109,.28)';
      ctx.fillRect(xl, top, xr - xl, alt);
      ctx.strokeStyle = 'rgba(255,77,109,.5)';
      for (let xx = xl - alt; xx < xr; xx += 10) { ctx.beginPath(); ctx.moveTo(xx, top + alt); ctx.lineTo(xx + alt, top); ctx.stroke(); }
    }
    // dissolvenze in/out: triangoli scuri
    const fadeTri = (f0: number, f1: number, dir: 1 | -1) => {
      const a = this.fX(f0), b = this.fX(f1);
      ctx.fillStyle = 'rgba(0,0,0,.4)';
      ctx.beginPath();
      if (dir > 0) { ctx.moveTo(a, top); ctx.lineTo(b, top); ctx.lineTo(a, top + alt); }
      else { ctx.moveTo(a, top); ctx.lineTo(b, top); ctx.lineTo(b, top + alt); }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.55)';
      ctx.beginPath();
      if (dir > 0) { ctx.moveTo(a, top + alt); ctx.lineTo(b, top); } else { ctx.moveTo(a, top); ctx.lineTo(b, top + alt); }
      ctx.stroke();
    };
    if (c.fadeIn > 0) fadeTri(c.start, c.start + c.fadeIn, 1);
    if (c.fadeOut > 0) fadeTri(end(c) - c.fadeOut, end(c), -1);
    // transizione in testa: il blocco a strisce sul taglio
    if (c.trIn) {
      const a = this.fX(c.start), b = this.fX(c.start + c.trIn.len);
      ctx.fillStyle = c.trIn.type === 'dip' ? 'rgba(0,0,0,.55)' : 'rgba(255,213,74,.28)';
      ctx.fillRect(a, top, b - a, alt);
      ctx.strokeStyle = 'rgba(255,213,74,.95)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (c.trIn.type === 'mix') { ctx.moveTo(a, top + alt); ctx.lineTo(b, top); ctx.moveTo(a, top); ctx.lineTo(b, top + alt); }
      else if (c.trIn.type === 'wipe') { ctx.moveTo(a, top + alt); ctx.lineTo(b, top); ctx.lineTo(b, top + alt); ctx.closePath(); }
      else { ctx.moveTo(a, top); ctx.lineTo((a + b) / 2, top + alt); ctx.lineTo(b, top); }
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    // testa della clip
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(xl, top, xr - xl, testa);
    if (c.label) { ctx.fillStyle = ETICHETTE[c.label % ETICHETTE.length]; ctx.fillRect(xl, top, xr - xl, 2); }
    if (w > 24 && testa >= 10) {
      ctx.fillStyle = '#fff';
      ctx.font = '600 11px Rajdhani, sans-serif';
      ctx.textBaseline = 'middle';
      let nome = c.name;
      if (c.link) nome = '⛓ ' + nome;
      if (isVideoClip(c) && c.opacity < 1 && !c.opKeys.length) nome += `  ${Math.round(c.opacity * 100)}%`;
      if (c.fx.look !== 'none') nome += '  ◐' + c.fx.look.toUpperCase();
      if (c.fx.key !== 'none') nome += '  ⬚chiave';
      const tx = Math.max(x + 4, 4);
      ctx.fillText(nome, tx, top + testa / 2 + 0.5, Math.max(10, x + w - tx - 4));
    }
    // linee elastiche
    if (modi.elastico && corpoH > 10) this.elastico(ctx, c, t, x, w, corpoY, corpoH);
    ctx.globalAlpha = 1;
    ctx.restore();
    // bordo
    ctx.lineWidth = sel ? 2 : 1;
    ctx.strokeStyle = sel ? '#ffd54a' : 'rgba(0,0,0,.6)';
    ctx.beginPath();
    ctx.roundRect(x + (sel ? 1 : 0.5), top + (sel ? 1 : 0.5), w - (sel ? 2 : 1), alt - (sel ? 2 : 1), Math.min(4, w / 3));
    ctx.stroke();
    if (sel) {
      ctx.strokeStyle = 'rgba(255,213,74,.25)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    ctx.lineWidth = 1;
  }

  private filmstrip(ctx: CanvasRenderingContext2D, p: Project, c: Clip, x: number, w: number, y: number, hh: number, r: number, xl: number, xr: number) {
    const m = mediaOf(p, c)!;
    const asp = m.width && m.height ? (m.rotation % 180 ? m.height / m.width : m.width / m.height) : 16 / 9;
    const tw = Math.max(16, hh * asp);
    // passo di sorgente in secondi: potenza di due, così zoomando si riusano le miniature già fatte
    const secPerTile = tw / this.ppf / r;
    const passo = Math.pow(2, Math.ceil(Math.log2(Math.max(1 / 8, secPerTile))));
    const primo = Math.max(0, Math.floor((xl - x) / tw));
    for (let i = primo; x + i * tw < xr; i++) {
      const tx = x + i * tw;
      if (tx > x + w) break;
      const f = c.start + (i * tw) / this.ppf;
      const st = srcTimeAt(p, c, f);
      const q = Math.max(m.t0 || 0, Math.floor(st / passo) * passo);
      const img = miniatura(c.media!, m.type === 'image' ? 0 : Math.min(q, Math.max(0, m.duration - 0.05)));
      if (img) {
        const iw = (img as HTMLCanvasElement).width || 1, ih = (img as HTMLCanvasElement).height || 1;
        const k = Math.min(tw / iw, hh / ih);
        ctx.drawImage(img, tx + (tw - iw * k) / 2, y + (hh - ih * k) / 2, iw * k, ih * k);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        ctx.fillRect(tx + 1, y + 1, tw - 2, hh - 2);
      }
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillRect(tx, y, 1, hh);
    }
  }

  private onda(ctx: CanvasRenderingContext2D, c: Clip, x: number, w: number, y: number, hh: number, peaks: Float32Array, pronti: number, xl: number, xr: number, r: number) {
    const mid = y + hh / 2;
    const gain = dbToGain(c.gain);
    ctx.fillStyle = 'rgba(200,255,225,.75)';
    const a = Math.max(Math.floor(xl), Math.floor(x)), b = Math.min(Math.ceil(xr), Math.ceil(x + w));
    for (let px = a; px < b; px++) {
      const f0 = this.xF(px), f1 = this.xF(px + 1);
      const s0 = c.srcIn + (f0 - c.start) / r, s1 = c.srcIn + (f1 - c.start) / r;
      const i0 = Math.floor(s0 * PEAKS_PER_SEC), i1 = Math.max(i0 + 1, Math.floor(s1 * PEAKS_PER_SEC));
      if (i0 >= pronti) break;
      let mx = 0;
      for (let i = i0; i < i1 && i < peaks.length; i++) if (peaks[i] > mx) mx = peaks[i];
      const v = Math.min(1, mx * gain) * hh * 0.48;
      if (v > 0.3) ctx.fillRect(px, mid - v, 1, v * 2);
    }
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.fillRect(xl, mid, xr - xl, 1);
  }

  private elastico(ctx: CanvasRenderingContext2D, c: Clip, t: Track, x: number, w: number, y: number, hh: number) {
    const video = t.kind === 'video';
    const keys = video ? c.opKeys : c.gainKeys;
    const base = video ? c.opacity : c.gain;
    const vy = (v: number) => video ? y + hh - v * hh : y + hh - ((clamp(v, -40, 12) + 40) / 52) * hh;
    ctx.strokeStyle = video ? '#35e8ff' : '#ffb23d';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    if (!keys.length) { ctx.moveTo(x, vy(base)); ctx.lineTo(x + w, vy(base)); }
    else {
      ctx.moveTo(x, vy(keys[0].v));
      for (const k of keys) ctx.lineTo(this.fX(c.start + k.f), vy(k.v));
      ctx.lineTo(x + w, vy(keys[keys.length - 1].v));
    }
    ctx.stroke();
    ctx.fillStyle = video ? '#35e8ff' : '#ffb23d';
    for (const k of keys) { const px = this.fX(c.start + k.f); ctx.fillRect(px - 3, vy(k.v) - 3, 6, 6); }
    ctx.lineWidth = 1;
  }

  private aggiornaScroll() {
    const e = Math.max(projectEnd(store.doc), this.xF(this.W)) + 60;
    const vis = this.W / this.ppf;
    const k = Math.min(1, vis / e);
    this.barraManiglia.style.width = Math.max(20, k * 100) + '%';
    this.barraManiglia.style.left = Math.min(100 - k * 100, (this.scrollF / e) * 100) + '%';
  }

  // ——— eventi ———
  private eventi() {
    const cv = this.cv;
    const pos = (e: { clientX: number; clientY: number }) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.addEventListener('pointermove', (e) => {
      if (this.presa) return;
      const { x, y } = pos(e);
      const c = this.colpo(x, y);
      let cur = 'default';
      if (c.zona === 'righello') cur = 'col-resize';
      else if (c.zona === 'in' || c.zona === 'out') cur = e.shiftKey && c.taglio ? 'ew-resize' : c.zona === 'in' ? 'w-resize' : 'e-resize';
      else if (c.zona === 'corpo') cur = e.altKey ? 'grab' : modi.elastico ? 'crosshair' : 'move';
      cv.style.cursor = cur;
    });
    let tocchi = new Map<number, { x: number; y: number }>();
    let pizzico: { d: number; ppf: number; cx: number } | null = null;
    let lungo = 0;
    cv.addEventListener('pointerdown', (e) => {
      cv.focus({ preventScroll: true });
      const { x, y } = pos(e);
      if (e.pointerType === 'touch') {
        tocchi.set(e.pointerId, { x, y });
        if (tocchi.size === 2) {
          const [a, b] = [...tocchi.values()];
          pizzico = { d: Math.hypot(a.x - b.x, a.y - b.y), ppf: this.ppf, cx: (a.x + b.x) / 2 };
          this.annullaPresa();
          return;
        }
      }
      if (e.button === 2) return;
      const c = this.colpo(x, y);
      if (c.zona === 'righello' || (c.zona === 'vuoto' && e.pointerType === 'touch')) {
        motore.setMonitor('recorder');
        this.presa = { tipo: 'cursore' };
        motore.stop();
        store.setHead(Math.max(0, Math.round(c.f)));
      } else if (c.clip && modi.elastico && c.zona === 'corpo') {
        this.presaElastico(e, c, x, y);
      } else if (c.clip && (c.zona === 'in' || c.zona === 'out')) {
        if (trackOf(store.doc, c.clip.track).lock) return;
        store.begin('Trim');
        const base = structuredClone(store.doc.clips);
        if (e.shiftKey && c.taglio) this.presa = { tipo: 'roll', l: c.taglio.l.id, r: c.taglio.r.id, base, x0: x, d: 0 };
        else this.presa = { tipo: 'trim', id: c.clip.id, edge: c.zona, base, x0: x, d: 0, linked: !e.altKey, ripple: modi.ripple || e.ctrlKey || e.metaKey };
      } else if (c.clip) {
        const clip = c.clip;
        const add = e.shiftKey || e.ctrlKey || e.metaKey;
        if (add) {
          const ids = M.withLinked(store.doc, [clip.id]);
          if (store.sel.has(clip.id)) { for (const id of ids) store.sel.delete(id); store.emit('sel'); }
          else store.select(ids, true);
        } else if (!store.sel.has(clip.id)) store.select(e.altKey ? [clip.id] : M.withLinked(store.doc, [clip.id]));
        store.focusTrack = clip.track;
        if (trackOf(store.doc, clip.track).lock) return;
        const base = structuredClone(store.doc.clips);
        if (e.altKey) { store.begin('Slip'); this.presa = { tipo: 'slip', ids: M.withLinked(store.doc, [clip.id]), base, x0: x, d: 0 }; }
        else {
          const avvia = () => {
            store.begin('Sposta');
            this.presa = { tipo: 'sposta', ids: new Set(store.sel), base, x0: x, y0: y, kind: trackOf(store.doc, clip.track).kind, df: 0, dt: 0, ancora: clip };
          };
          if (e.pointerType === 'touch') {
            // sul telefono si sposta con la pressione lunga, così il dito può anche solo scorrere
            clearTimeout(lungo);
            lungo = window.setTimeout(() => { avvia(); navigator.vibrate?.(15); }, 280);
          } else avvia();
        }
      } else {
        if (!e.shiftKey && !e.ctrlKey) store.select([]);
        store.focusTrack = c.track?.id ?? null;
        this.presa = { tipo: 'riquadro', x0: x, y0: y, x1: x, y1: y, add: e.shiftKey || e.ctrlKey };
      }
      try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
      this.sporca();
    });
    cv.addEventListener('pointermove', (e) => {
      const { x, y } = pos(e);
      if (e.pointerType === 'touch' && tocchi.has(e.pointerId)) {
        const prec = tocchi.get(e.pointerId)!;
        tocchi.set(e.pointerId, { x, y });
        if (pizzico && tocchi.size === 2) {
          const [a, b] = [...tocchi.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const f = this.xF(pizzico.cx);
          this.ppf = clamp(pizzico.ppf * (d / Math.max(10, pizzico.d)), 0.004, 48);
          this.scrollF = Math.max(0, f - pizzico.cx / this.ppf);
          this.sporca();
          return;
        }
        if (!this.presa) {
          clearTimeout(lungo);
          this.scrollF = Math.max(0, this.scrollF - (x - prec.x) / this.ppf);
          this.scrollY = clamp(this.scrollY - (y - prec.y), 0, Math.max(0, this.altezzaTotale() - this.H));
          this.costruisciTestate();
          this.sporca();
          return;
        }
      }
      if (!this.presa) return;
      this.muovi(x, y, e);
    });
    const fine = (e: PointerEvent) => {
      clearTimeout(lungo);
      tocchi.delete(e.pointerId);
      if (tocchi.size < 2) pizzico = null;
      const q = this.presa;
      this.presa = null;
      this.snapLinea = null;
      if (!q) return;
      if (q.tipo === 'sposta') store.commit(q.df !== 0 || q.dt !== 0);
      else if (q.tipo === 'trim' || q.tipo === 'roll' || q.tipo === 'slip') store.commit(q.d !== 0);
      else if (q.tipo === 'elastico') store.commit(true);
      else if (q.tipo === 'riquadro') this.selezionaRiquadro(q);
      this.sporca();
    };
    cv.addEventListener('pointerup', fine);
    cv.addEventListener('pointercancel', (e) => { if (this.presa && this.presa.tipo !== 'cursore' && this.presa.tipo !== 'riquadro') store.cancelLive(); this.presa = null; fine(e); });
    cv.addEventListener('dblclick', (e) => {
      const { x, y } = pos(e);
      const c = this.colpo(x, y);
      if (c.clip?.media) {
        const t = srcTimeAt(store.doc, c.clip, Math.round(c.f));
        motore.caricaPlayer(c.clip.media, t);
        motore.setMonitor('player');
      } else if (c.clip) {
        store.select([c.clip.id]);
        document.dispatchEvent(new CustomEvent('dpv:ispettore'));
      }
    });
    cv.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const { x, y } = pos(e);
      const c = this.colpo(x, y);
      if (c.clip && !store.sel.has(c.clip.id)) store.select(M.withLinked(store.doc, [c.clip.id]));
      this.menu(e.clientX, e.clientY, c);
    });
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      const { x } = pos(e);
      if (e.ctrlKey || e.metaKey) this.zoom(e.deltaY < 0 ? 1.18 : 1 / 1.18, x);
      else if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) this.scrollF = Math.max(0, this.scrollF + (e.deltaX || e.deltaY) / this.ppf);
      else {
        this.scrollY = clamp(this.scrollY + e.deltaY * 0.6, 0, Math.max(0, this.altezzaTotale() - this.H));
        this.costruisciTestate();
      }
      this.sporca();
    }, { passive: false });
    this.testate.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.scrollY = clamp(this.scrollY + e.deltaY * 0.6, 0, Math.max(0, this.altezzaTotale() - this.H));
      this.costruisciTestate();
      this.sporca();
    }, { passive: false });
    // barra di scorrimento
    this.barraManiglia.addEventListener('pointerdown', (e) => {
      const x0 = e.clientX, s0 = this.scrollF;
      const el = this.barraManiglia;
      el.setPointerCapture(e.pointerId);
      const tot = this.barra.getBoundingClientRect().width;
      const eTot = Math.max(projectEnd(store.doc), this.xF(this.W)) + 60;
      const mv = (ev: PointerEvent) => { this.scrollF = Math.max(0, s0 + ((ev.clientX - x0) / tot) * eTot); this.sporca(); };
      const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); };
      el.addEventListener('pointermove', mv);
      el.addEventListener('pointerup', up);
    });
    // trascinamento dal contenitore (col puntatore: vedi trascina.ts)
    registraBersaglio({
      el: this.area,
      sopra: (x, y, dato) => { const q = pos({ clientX: x, clientY: y }); this.fantasma = this.anteprimaDrop(q.x, q.y, dato); this.sporca(); },
      lascia: (x, y, dato) => { const q = pos({ clientX: x, clientY: y }); this.fantasma = null; this.rilascia(dato, q.x, q.y); this.sporca(); },
      esci: () => { this.fantasma = null; this.snapLinea = null; this.sporca(); },
    });
  }

  private annullaPresa() {
    if (this.presa && this.presa.tipo !== 'cursore' && this.presa.tipo !== 'riquadro') store.cancelLive();
    this.presa = null;
  }

  private aggancia(f: number, esclusi: Set<string>): number {
    if (!modi.snap) { this.snapLinea = null; return f; }
    const pts = M.snapPoints(store.doc, esclusi, [Math.round(store.head)]);
    const soglia = 8 / this.ppf;
    let best = f, bd = soglia;
    for (const s of pts) { const d = Math.abs(s - f); if (d < bd) { bd = d; best = s; } }
    this.snapLinea = best !== f ? best : null;
    return best;
  }

  private muovi(x: number, y: number, e: PointerEvent) {
    const q = this.presa!;
    const p = store.doc;
    if (q.tipo === 'cursore') {
      let f = Math.max(0, Math.round(this.xF(x)));
      if (modi.snap && e.shiftKey) f = this.aggancia(f, new Set());
      store.setHead(f);
      if (x > this.W - 20) this.scrollF += 4 / this.ppf;
      if (x < 20 && this.scrollF > 0) this.scrollF = Math.max(0, this.scrollF - 4 / this.ppf);
      return;
    }
    if (q.tipo === 'riquadro') { q.x1 = x; q.y1 = y; this.sporca(); return; }
    if (q.tipo === 'sposta') {
      let df = Math.round((x - q.x0) / this.ppf);
      const moving = q.base.filter((c) => q.ids.has(c.id));
      const a = Math.min(...moving.map((c) => c.start)), b = Math.max(...moving.map((c) => end(c)));
      // calamita sui due bordi del gruppo
      if (modi.snap) {
        const sa = this.aggancia(a + df, q.ids);
        if (this.snapLinea !== null) df = sa - a;
        else { const sb = this.aggancia(b + df, q.ids); if (this.snapLinea !== null) df = sb - b; }
      }
      // tracce: quante righe si è scesi o saliti
      const righe = this.righe(p).filter((r) => r.t.kind === q.kind);
      const riga0 = righe.findIndex((r) => r.t.id === q.ancora.track);
      const sotto = righe.findIndex((r) => y >= r.y && y < r.y + r.h);
      let dt = sotto >= 0 && riga0 >= 0 ? sotto - riga0 : q.dt;
      if (sotto < 0) {
        const tutte = this.righe(p);
        const r2 = tutte.find((r) => y >= r.y && y < r.y + r.h);
        if (!r2) dt = y < RIGHELLO + 20 ? -riga0 : righe.length - 1 - riga0; else dt = q.dt;
      }
      if (df === q.df && dt === q.dt) return;
      q.df = df; q.dt = dt;
      p.clips = structuredClone(q.base);
      M.moveClips(p, q.ids, df, dt, q.kind, modi.inserisci ? 'insert' : 'overwrite');
      store.liveChange();
      return;
    }
    if (q.tipo === 'trim') {
      let d = Math.round((x - q.x0) / this.ppf);
      const c0 = q.base.find((c) => c.id === q.id)!;
      const bordo = q.edge === 'in' ? c0.start : end(c0);
      if (modi.snap) { const s = this.aggancia(bordo + d, M.withLinked(p, [q.id])); if (this.snapLinea !== null) d = s - bordo; }
      if (d === q.d) return;
      p.clips = structuredClone(q.base);
      q.d = M.trimClip(p, q.id, q.edge, d, { ripple: q.ripple, linked: q.linked });
      store.liveChange();
      this.mostraTrim(q.id, q.edge);
      return;
    }
    if (q.tipo === 'roll') {
      let d = Math.round((x - q.x0) / this.ppf);
      const l0 = q.base.find((c) => c.id === q.l)!;
      if (modi.snap) { const s = this.aggancia(end(l0) + d, new Set([q.l, q.r])); if (this.snapLinea !== null) d = s - end(l0); }
      p.clips = structuredClone(q.base);
      q.d = M.rollEdit(p, q.l, q.r, d);
      store.liveChange();
      return;
    }
    if (q.tipo === 'slip') {
      const d = -Math.round((x - q.x0) / this.ppf);
      if (d === q.d) return;
      p.clips = structuredClone(q.base);
      M.slipClip(p, q.ids, d);
      q.d = d;
      store.liveChange();
      // durante lo slip il Player mostra il nuovo primo fotogramma
      const c = p.clips.find((x2) => q.ids.has(x2.id) && x2.media);
      if (c?.media) { motore.caricaPlayer(c.media, c.srcIn); }
      return;
    }
    if (q.tipo === 'elastico') {
      const c = p.clips.find((x2) => x2.id === q.id)!;
      const t = trackOf(p, c.track);
      const riga = this.righe(p).find((r) => r.t.id === t.id)!;
      const testa = Math.min(15, (riga.h - 4) * 0.4);
      const cy = riga.y + 2 + testa, ch = riga.h - 4 - testa;
      const video = t.kind === 'video';
      const val = video ? clamp(1 - (y - cy) / ch, 0, 1) : Math.round((clamp(1 - (y - cy) / ch, 0, 1) * 52 - 40) * 2) / 2;
      const keys = video ? c.opKeys : c.gainKeys;
      const k = keys[q.key];
      if (!k) return;
      const lf = clamp(Math.round(this.xF(x) - c.start), q.key > 0 ? keys[q.key - 1].f + 1 : 0, q.key < keys.length - 1 ? keys[q.key + 1].f - 1 : c.len);
      k.f = lf;
      k.v = val;
      store.liveChange();
      avvisoValore(video ? `Opacità ${Math.round(val * 100)}%` : `Volume ${val > 0 ? '+' : ''}${val} dB`);
    }
  }

  private mostraTrim(id: string, edge: 'in' | 'out') {
    const c = clipById(store.doc, id);
    if (!c) return;
    // durante il trim il monitor segue il bordo che si muove
    const f = edge === 'in' ? c.start : end(c) - 1;
    store.setHead(f);
  }

  private presaElastico(e: PointerEvent, c: Colpo, x: number, y: number) {
    const clip = c.clip!;
    const p = store.doc;
    const t = trackOf(p, clip.track);
    const video = t.kind === 'video';
    const riga = this.righe(p).find((r) => r.t.id === t.id)!;
    const testa = Math.min(15, (riga.h - 4) * 0.4);
    const cy = riga.y + 2 + testa, ch = riga.h - 4 - testa;
    if (y < cy) { store.select(M.withLinked(p, [clip.id])); return; }
    store.begin('Linea elastica');
    const cc = p.clips.find((x2) => x2.id === clip.id)!;
    const keys = video ? cc.opKeys : cc.gainKeys;
    const base = video ? cc.opacity : cc.gain;
    const lf = Math.round(this.xF(x) - cc.start);
    const vy = (v: number) => video ? cy + ch - v * ch : cy + ch - ((clamp(v, -40, 12) + 40) / 52) * ch;
    // punto esistente vicino?
    let idx = keys.findIndex((k) => Math.abs(this.fX(cc.start + k.f) - x) < 7 && Math.abs(vy(k.v) - y) < 8);
    if (e.altKey) {
      if (idx >= 0) { keys.splice(idx, 1); store.commit(true); }
      else store.commit(false);
      return;
    }
    if (idx < 0) {
      if (!keys.length) {
        keys.push({ f: 0, v: base }, { f: cc.len, v: base });
      }
      const v = keyValue(keys, lf, base);
      keys.push({ f: lf, v });
      keys.sort((a, b) => a.f - b.f);
      idx = keys.findIndex((k) => k.f === lf);
    }
    store.select(M.withLinked(p, [clip.id]));
    this.presa = { tipo: 'elastico', id: clip.id, key: idx, base: [] };
    store.liveChange();
  }

  private selezionaRiquadro(q: Extract<Presa, { tipo: 'riquadro' }>) {
    const p = store.doc;
    const x0 = Math.min(q.x0, q.x1), x1 = Math.max(q.x0, q.x1), y0 = Math.min(q.y0, q.y1), y1 = Math.max(q.y0, q.y1);
    if (x1 - x0 < 3 && y1 - y0 < 3) {
      // è stato un clic nel vuoto: cursore lì
      motore.setMonitor('recorder');
      store.setHead(Math.max(0, Math.round(this.xF(q.x0))));
      return;
    }
    const f0 = this.xF(x0), f1 = this.xF(x1);
    const righe = this.righe(p).filter((r) => r.y + r.h > y0 && r.y < y1).map((r) => r.t.id);
    const ids = p.clips.filter((c) => righe.includes(c.track) && end(c) > f0 && c.start < f1).map((c) => c.id);
    store.select(ids, q.add);
  }

  private anteprimaDrop(x: number, y: number, dato: string) {
    const p = store.doc;
    const f = Math.max(0, Math.round(this.xF(x)));
    const riga = this.righe(p).find((r) => y >= r.y && y < r.y + r.h);
    if (dato.startsWith('m:')) {
      const m = p.media.find((z) => z.id === dato.slice(2));
      if (!m) return null;
      const len = m.type === 'image' ? Math.round(fps(p.rate) * 5) : Math.round(((m.markOut ?? m.duration) - (m.markIn ?? m.t0 ?? 0)) * fps(p.rate));
      const tg = this.bersagliDrop(riga?.t, m.hasVideo, m.hasAudio);
      const out: { track: string; f: number; len: number; kind: 'video' | 'audio' }[] = [];
      if (tg.video) out.push({ track: tg.video, f, len, kind: 'video' });
      for (const a of tg.audio) out.push({ track: a, f, len, kind: 'audio' });
      return out;
    }
    return riga ? [{ track: riga.t.id, f, len: Math.round(fps(p.rate) * 5), kind: riga.t.kind }] : null;
  }

  private bersagliDrop(t: Track | undefined, v: boolean, a: boolean): M.Targets {
    const p = store.doc;
    const vts = p.tracks.filter((x) => x.kind === 'video' && !x.lock);
    const ats = p.tracks.filter((x) => x.kind === 'audio' && !x.lock);
    let video: string | null = null, audio: string[] = [];
    if (v) video = t?.kind === 'video' && !t.lock ? t.id : vts[vts.length - 1]?.id ?? null;
    if (a) {
      const i = t?.kind === 'audio' ? ats.findIndex((x) => x.id === t.id) : 0;
      audio = ats.slice(Math.max(0, i), Math.max(0, i) + 1).map((x) => x.id);
      if (!audio.length && ats.length) audio = [ats[0].id];
    }
    return { video, audio };
  }

  private rilascia(dato: string, x: number, y: number) {
    const p = store.doc;
    const f = Math.max(0, Math.round(this.xF(x)));
    const riga = this.righe(p).find((r) => y >= r.y && y < r.y + r.h);
    if (dato.startsWith('m:')) {
      const m = p.media.find((z) => z.id === dato.slice(2));
      if (!m) return;
      const srcIn = m.markIn ?? m.t0 ?? 0;
      const srcOut = m.markOut ?? (m.type === 'image' ? srcIn + 5 : m.duration);
      const tg = this.bersagliDrop(riga?.t, m.hasVideo, m.hasAudio);
      let fx = f;
      if (modi.snap) fx = this.aggancia(f, new Set());
      this.snapLinea = null;
      const ids = store.edit('Metti nella timeline', (pp) => M.placeSource(pp, { mediaId: m.id, srcIn, srcOut }, fx, null, tg, modi.inserisci ? 'insert' : 'overwrite'));
      store.select(ids);
      avviso(`${m.name} nella timeline`, 'ok', 1200);
    } else if (dato.startsWith('g:')) {
      const kind = dato.slice(2) as 'bars' | 'color' | 'countdown' | 'title' | 'nero';
      inserisciGeneratore(kind, f, riga?.t.kind === 'video' ? riga.t.id : undefined);
    } else if (dato.startsWith('t:')) {
      const tipo = dato.slice(2);
      const c = riga ? store.doc.clips.find((z) => z.track === riga.t.id && Math.abs(z.start - f) < Math.max(3, 20 / this.ppf)) ?? store.doc.clips.find((z) => z.track === riga.t.id && f >= z.start && f < end(z)) : undefined;
      if (!c) { avviso('Lascia la transizione sopra un taglio', 'info'); return; }
      store.select(M.withLinked(store.doc, [c.id]));
      esegui(tipo === 'mix' ? 'dissolvenza' : tipo === 'dip' ? 'passaggioNero' : 'tendina');
      if (tipo.startsWith('wipe:')) {
        const pat = Number(tipo.split(':')[1]);
        store.edit('Tendina', (pp) => { for (const z of pp.clips) if (store.sel.has(z.id) && z.trIn) z.trIn.pattern = pat; });
      }
    }
  }

  private menu(x: number, y: number, c: Colpo) {
    const voci: VoceMenu[] = [];
    const f = Math.round(c.f);
    if (c.clip) {
      voci.push(
        { nome: 'Taglia qui', tasto: '1', fn: () => { motore.vaiA(f); esegui('taglia'); } },
        { nome: 'Elimina', tasto: '2', fn: () => esegui('elimina') },
        { nome: 'Elimina e chiudi il buco', tasto: '3', fn: () => esegui('eliminaChiudi') },
        { nome: c.clip.link ? 'Separa audio e video' : 'Unisci le selezionate', tasto: '4', fn: () => esegui('separa') },
        { sep: true },
        {
          nome: 'Transizione in testa', sotto: [
            { nome: 'Dissolvenza incrociata', tasto: '5', fn: () => esegui('dissolvenza') },
            { nome: 'Tendina', tasto: '6', fn: () => esegui('tendina') },
            { nome: 'Passaggio al nero', tasto: '7', fn: () => esegui('passaggioNero') },
            { nome: 'Togli transizione', disattiva: !c.clip.trIn, fn: () => store.edit('Togli transizione', (p) => M.setTransition(p, M.withLinked(p, store.sel), null)) },
          ],
        },
        { nome: 'Dissolvenza in apertura/chiusura', tasto: '8', fn: () => esegui('dissolviInOut') },
        {
          nome: 'Colore etichetta', sotto: ETICHETTE.map((col, i) => ({ nome: ['Nessuno', 'Verde', 'Giallo', 'Arancio', 'Rosso', 'Viola', 'Ciano', 'Grigio'][i], spunta: c.clip!.label === i, fn: () => store.edit('Etichetta', (p) => { for (const z of p.clips) if (store.sel.has(z.id)) z.label = i; }) })),
        },
        { sep: true },
        { nome: 'Apri nel Player (abbina)', tasto: 'F', disattiva: !c.clip.media, fn: () => { motore.vaiA(f); esegui('abbina'); } },
        { nome: 'Proprietà della clip…', fn: () => document.dispatchEvent(new CustomEvent('dpv:ispettore')) },
      );
    } else {
      voci.push(
        { nome: 'Cursore qui', fn: () => motore.vaiA(f) },
        { nome: 'Incolla qui', tasto: 'Ctrl+V', fn: () => { motore.vaiA(f); esegui('incolla'); } },
        { sep: true },
        { nome: 'Titolo qui', fn: () => { motore.vaiA(f); esegui('genTitolo'); } },
        { nome: 'Barre colore e tono qui', fn: () => { motore.vaiA(f); esegui('genBarre'); } },
        { nome: 'Countdown qui', fn: () => { motore.vaiA(f); esegui('genCountdown'); } },
        { nome: 'Nero qui', fn: () => { motore.vaiA(f); esegui('genNero'); } },
      );
    }
    voci.push({ sep: true }, { nome: 'Marcatore', tasto: 'M', fn: () => { motore.vaiA(f); esegui('marcatore'); } }, { nome: 'Adatta alla finestra', tasto: '\\', fn: () => this.adattaTutto() });
    menuContesto(x, y, voci);
  }

  // per il Player: rilascio "a mano" da touch
  inserisciDaPlayer() { montaDalPlayer(modi.inserisci ? 'insert' : 'overwrite'); }
}


let tAvviso = 0;
function avvisoValore(t: string) {
  const now = performance.now();
  if (now - tAvviso < 120) return;
  tAvviso = now;
  avviso(t, 'tasto', 700);
}

void f2s;
