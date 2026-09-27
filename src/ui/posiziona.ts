// Spostare e ingrandire sull'immagine, come si fa col mouse sul monitor di un banco moderno: clic su quello che
// vedi e lo scegli; trascini per spostarlo, tiri un angolo per ingrandirlo, il pallino in alto lo gira. Col
// "movimento" acceso la clip ha due posizioni, quella d'inizio e quella di fine, e ci va piano piano lungo la clip
// (tfFine, src/core/progetto.ts tfAl). Gli effetti che hanno un centro (bolla, vortice, zoom, riflesso…) hanno il
// loro mirino: lo metti dove vuoi, e anche lui può muoversi dall'inizio alla fine del blocco.
import { store } from '../core/store';
import type { Clip, Project, Transform } from '../core/tipi';
import { end, mediaOf, tfAl, TF0 } from '../core/progetto';
import { centroBlocco, haCentro } from '../core/blocchi';
import { pianoVideo } from '../render/piano';
import { motoTitolo, specAlTempo, telaTitolo } from '../render/grafica';
import { TITLE0 } from '../core/progetto';
import { f2s } from '../core/timecode';
import { motore } from '../motore';
import { h } from './dom';

/** un rettangolo sul quadro, in pixel del progetto: centro, misure, rotazione in radianti */
export interface Riquadro { cx: number; cy: number; w: number; h: number; rot: number }

const VISIBILI = new Set(['media', 'title', 'color', 'bars', 'countdown']);

/** dove sta la clip sul quadro con quella posizione (lo stesso conto del compositore) */
export function riquadroClip(p: Project, c: Clip, tf: Transform, f: number): Riquadro | null {
  const W = p.w, H = p.h;
  let dw = W, dh = H, ox = 0, oy = 0, sc = 1;
  if (c.kind === 'media') {
    const m = mediaOf(p, c);
    if (!m) return null;
    if (m.width && m.height) {
      const w = m.rotation % 180 ? m.height : m.width, hh = m.rotation % 180 ? m.width : m.height;
      const k = Math.min(W / w, H / hh);
      dw = w * k; dh = hh * k;
    }
  }
  // i titoli stanno su una tela grande: il riquadro si stringe attorno alle lettere
  let bx0 = tf.cropL, by0 = tf.cropT, bx1 = 1 - tf.cropR, by1 = 1 - tf.cropB;
  if (c.kind === 'title') {
    const t = f2s(Math.max(0, f - c.start), p.rate);
    const spec = specAlTempo(c.gen?.title ?? TITLE0, t);
    const tt = telaTitolo(spec, W, H);
    const off = motoTitolo(spec, tt.w, tt.h, W, H, t, f2s(c.len, p.rate));
    dw = tt.w; dh = tt.h; ox = off.dx; oy = off.dy; sc = off.scala ?? 1;
    const bb = bordiTela(tt.tela as CanvasImageSource & { width: number; height: number });
    if (bb) { bx0 = Math.max(bx0, bb[0]); by0 = Math.max(by0, bb[1]); bx1 = Math.min(bx1, bb[2]); by1 = Math.min(by1, bb[3]); }
  }
  const s = tf.scale * sc;
  const w = dw * s * Math.max(0.01, bx1 - bx0), hh = dh * s * Math.max(0.01, by1 - by0);
  const ux = ((bx0 + bx1) / 2 - 0.5) * dw * s, uy = ((by0 + by1) / 2 - 0.5) * dh * s;
  const r = (tf.rot * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r);
  return { cx: W / 2 + tf.x + ox + co * ux - si * uy, cy: H / 2 + tf.y + oy + si * ux + co * uy, w, h: hh, rot: r };
}

/** dove c'è davvero qualcosa su una tela trasparente (frazioni: x0, y0, x1, y1), guardata in piccolo */
const bordiCache = new WeakMap<object, [number, number, number, number] | null>();
let piccola: HTMLCanvasElement | null = null;
function bordiTela(tela: CanvasImageSource & { width: number; height: number }): [number, number, number, number] | null {
  if (bordiCache.has(tela)) return bordiCache.get(tela)!;
  const W = 192, H = 108;
  piccola ??= document.createElement('canvas');
  piccola.width = W; piccola.height = H;
  const x = piccola.getContext('2d', { willReadFrequently: true })!;
  x.clearRect(0, 0, W, H);
  x.drawImage(tela, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
    if (d[(yy * W + xx) * 4 + 3] > 20) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
  }
  const r: [number, number, number, number] | null = x1 < 0 ? null : [Math.max(0, (x0 - 1) / W), Math.max(0, (y0 - 1) / H), Math.min(1, (x1 + 2) / W), Math.min(1, (y1 + 2) / H)];
  bordiCache.set(tela, r);
  return r;
}

/** il punto in coordinate del rettangolo (senza la sua rotazione) */
const locale = (q: Riquadro, x: number, y: number) => {
  const dx = x - q.cx, dy = y - q.cy, co = Math.cos(q.rot), si = Math.sin(q.rot);
  return { x: co * dx + si * dy, y: -si * dx + co * dy };
};
const mondo = (q: Riquadro, x: number, y: number) => {
  const co = Math.cos(q.rot), si = Math.sin(q.rot);
  return { x: q.cx + co * x - si * y, y: q.cy + si * x + co * y };
};

type Presa = 'sposta' | 'angolo' | 'gira' | 'centro';

/** chi si sta muovendo: una clip (con la sua posizione di inizio o di fine) o il centro di un effetto */
interface Bersaglio { c: Clip; fx: boolean; fine: boolean }

export class Posiziona {
  /** la barretta sopra l'immagine: movimento, inizio e fine, rimetti a posto */
  barra: HTMLElement;
  private nome: HTMLElement;
  private bMoto: HTMLButtonElement;
  private bInizio: HTMLButtonElement;
  private bFine: HTMLButtonElement;
  private bAdatta: HTMLButtonElement;
  private trascina: { presa: Presa; x0: number; y0: number; tf0: Transform; pos0: [number, number]; q0: Riquadro | null; mosso: boolean } | null = null;

  constructor(private schermo: HTMLElement, private sopra: HTMLCanvasElement, private ridisegna: () => void) {
    this.nome = h('b', { class: 'pos-nome' });
    this.bMoto = h('button', { class: 'pos-btn', title: 'Movimento: dalla posizione d\'inizio a quella di fine, lungo tutta la clip', on: { click: () => this.alternaMoto() } }, '↝ Movimento') as HTMLButtonElement;
    this.bInizio = h('button', { class: 'pos-btn', title: 'Vai all\'inizio: qui sistemi dove parte', on: { click: () => this.vai('inizio') } }, '◀ Inizio') as HTMLButtonElement;
    this.bFine = h('button', { class: 'pos-btn', title: 'Vai alla fine: qui sistemi dove arriva', on: { click: () => this.vai('fine') } }, 'Fine ▶') as HTMLButtonElement;
    this.bAdatta = h('button', { class: 'pos-btn', title: 'Rimetti com\'era (a tutto quadro, o l\'effetto al centro)', on: { click: () => this.rimetti() } }, '⟲') as HTMLButtonElement;
    this.barra = h('div', { class: 'pos-barra' }, this.nome, this.bMoto, this.bInizio, this.bFine, this.bAdatta);
    schermo.append(this.barra);
    schermo.addEventListener('pointerdown', (e) => this.giu(e));
    schermo.addEventListener('pointermove', (e) => { if (!this.trascina) this.cursore(e); });
    store.on('sel', () => this.ridisegna());
  }

  private k() { return this.sopra.getBoundingClientRect().width / store.doc.w; }

  /** il punto del mouse in pixel del progetto */
  private punto(e: PointerEvent) {
    const r = this.sopra.getBoundingClientRect(), p = store.doc;
    return { x: ((e.clientX - r.left) / Math.max(1, r.width)) * p.w, y: ((e.clientY - r.top) / Math.max(1, r.height)) * p.h };
  }

  /** la clip (o l'effetto) scelta che si vede adesso nel programma */
  bersaglio(): Bersaglio | null {
    if (motore.attivo !== 'recorder') return null;
    const p = store.doc, f = Math.floor(store.head + 1e-6);
    const id = [...store.sel][0];
    const c = id ? p.clips.find((x) => x.id === id) : undefined;
    if (!c || f < c.start || f >= end(c)) return null;
    const traccia = p.tracks.find((t) => t.id === c.track);
    if (!traccia || traccia.kind !== 'video') return null;
    if (c.kind === 'fx') {
      if (c.fxb?.tipo !== 'effetto' || !haCentro(c.fxb.id)) return null;
      return { c, fx: true, fine: !!c.fxb.posFine && f - c.start >= c.len / 2 };
    }
    if (!VISIBILI.has(c.kind)) return null;
    return { c, fx: false, fine: !!c.tfFine && f - c.start >= c.len / 2 };
  }

  /** la posizione che si sta sistemando: quella d'inizio o quella di fine */
  private tfDi(b: Bersaglio): Transform { return b.fine && b.c.tfFine ? b.c.tfFine : b.c.tf; }

  /** disegna riquadro, maniglie, il percorso del movimento; e accende la barretta */
  disegna(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const b = this.bersaglio();
    this.barra.classList.toggle('su', !!b && !motore.playing);
    if (!b) return;
    const p = store.doc, k = W / p.w, f = Math.floor(store.head + 1e-6);
    const dpr = W / Math.max(1, this.sopra.getBoundingClientRect().width);
    this.nome.textContent = b.c.name;
    const moto = b.fx ? !!b.c.fxb!.posFine : !!b.c.tfFine;
    this.bMoto.classList.toggle('acceso', moto);
    this.bInizio.hidden = this.bFine.hidden = !moto;
    this.bInizio.classList.toggle('acceso', moto && !b.fine);
    this.bFine.classList.toggle('acceso', moto && b.fine);
    ctx.save();
    ctx.lineWidth = 1.5 * dpr;
    if (b.fx) {
      const bl = b.c.fxb!;
      const a = bl.pos ?? [0.5, 0.5], z = bl.posFine;
      const mirino = (x: number, y: number, col: string, pieno: boolean) => {
        const cx = x * W, cy = y * H, r = 16 * dpr;
        ctx.strokeStyle = col; ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - r * 1.6, cy); ctx.lineTo(cx + r * 1.6, cy); ctx.moveTo(cx, cy - r * 1.6); ctx.lineTo(cx, cy + r * 1.6); ctx.stroke();
        if (pieno) { ctx.beginPath(); ctx.arc(cx, cy, 4 * dpr, 0, Math.PI * 2); ctx.fill(); }
      };
      if (z) {
        freccia(ctx, a[0] * W, a[1] * H, z[0] * W, z[1] * H, 'rgba(255,61,242,.8)', dpr);
        mirino(b.fine ? a[0] : z[0], b.fine ? a[1] : z[1], 'rgba(255,61,242,.75)', false);
      }
      const [x, y] = z ? (b.fine ? z : a) : centroBlocco(b.c, f);
      mirino(x, y, '#ffd54a', true);
    } else {
      const tf = this.tfDi(b);
      const q = riquadroClip(p, b.c, tf, f);
      if (moto) {
        const altro = riquadroClip(p, b.c, b.fine ? b.c.tf : b.c.tfFine!, f);
        if (altro && q) {
          ctx.setLineDash([6 * dpr, 5 * dpr]);
          rettangolo(ctx, altro, k, 'rgba(255,61,242,.75)');
          ctx.setLineDash([]);
          const [da, a] = b.fine ? [altro, q] : [q, altro];
          freccia(ctx, da.cx * k, da.cy * k, a.cx * k, a.cy * k, 'rgba(255,61,242,.85)', dpr);
        }
      }
      if (q) {
        rettangolo(ctx, q, k, '#ffd54a');
        // le maniglie: gli angoli (grandezza) e il pallino sopra (rotazione)
        ctx.fillStyle = '#ffd54a';
        ctx.strokeStyle = '#1a1206';
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          const m = mondo(q, (sx * q.w) / 2, (sy * q.h) / 2);
          ctx.fillRect(m.x * k - 5 * dpr, m.y * k - 5 * dpr, 10 * dpr, 10 * dpr);
          ctx.strokeRect(m.x * k - 5 * dpr, m.y * k - 5 * dpr, 10 * dpr, 10 * dpr);
        }
        const top = mondo(q, 0, -q.h / 2), giro = mondo(q, 0, -q.h / 2 - 26 / (k / dpr));
        ctx.strokeStyle = '#ffd54a';
        ctx.beginPath(); ctx.moveTo(top.x * k, top.y * k); ctx.lineTo(giro.x * k, giro.y * k); ctx.stroke();
        ctx.beginPath(); ctx.arc(giro.x * k, giro.y * k, 6 * dpr, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  /** quale maniglia sta sotto il punto (in pixel del progetto) */
  private presaSotto(b: Bersaglio, x: number, y: number): Presa | null {
    const p = store.doc, kk = this.k(), f = Math.floor(store.head + 1e-6);
    const tol = 12 / kk;
    if (b.fx) {
      const bl = b.c.fxb!;
      const [cx, cy] = bl.posFine ? (b.fine ? bl.posFine : bl.pos ?? [0.5, 0.5]) : centroBlocco(b.c, f);
      return Math.hypot(x - cx * p.w, y - cy * p.h) < 26 / kk ? 'centro' : null;
    }
    const q = riquadroClip(p, b.c, this.tfDi(b), f);
    if (!q) return null;
    const l = locale(q, x, y);
    if (Math.hypot(l.x, l.y + q.h / 2 + 26 / kk) < tol) return 'gira';
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) if (Math.hypot(l.x - (sx * q.w) / 2, l.y - (sy * q.h) / 2) < tol) return 'angolo';
    if (Math.abs(l.x) <= q.w / 2 && Math.abs(l.y) <= q.h / 2) return 'sposta';
    return null;
  }

  /** la clip più in alto che si vede sotto il punto (per sceglierla col clic sull'immagine) */
  private clipSotto(x: number, y: number): Clip | null {
    const p = store.doc, f = Math.floor(store.head + 1e-6);
    const strati = pianoVideo(p, f);
    for (let i = strati.length - 1; i >= 0; i--) {
      const s = strati[i].b ?? strati[i].a;
      if (!s) continue;
      const q = riquadroClip(p, s.clip, tfAl(s.clip, s.lf), f);
      if (!q) continue;
      const l = locale(q, x, y);
      if (Math.abs(l.x) <= q.w / 2 && Math.abs(l.y) <= q.h / 2) return s.clip;
    }
    return null;
  }

  private cursore(e: PointerEvent) {
    if (motore.attivo !== 'recorder') { this.schermo.style.cursor = ''; return; }
    const b = this.bersaglio();
    const { x, y } = this.punto(e);
    const presa = b ? this.presaSotto(b, x, y) : null;
    this.schermo.style.cursor = presa === 'sposta' || presa === 'centro' ? 'move' : presa === 'angolo' ? 'nwse-resize' : presa === 'gira' ? 'grab' : '';
  }

  private giu(e: PointerEvent) {
    if (e.button !== 0 || motore.attivo !== 'recorder') return;
    if ((e.target as HTMLElement).closest('.pos-barra, .mini-tl')) return;
    const { x, y } = this.punto(e);
    let b = this.bersaglio();
    let presa = b ? this.presaSotto(b, x, y) : null;
    if (!presa) {
      // clic su quello che si vede: si sceglie e si può già trascinare
      const c = this.clipSotto(x, y);
      if (!c) return;
      if (motore.playing) motore.stop();
      store.select([c.id]);
      b = this.bersaglio();
      if (!b) return;
      presa = 'sposta';
    }
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    if (motore.playing) motore.stop();
    const f = Math.floor(store.head + 1e-6);
    store.begin(b.fx ? 'Sposta il centro dell\'effetto' : presa === 'sposta' ? 'Sposta sull\'immagine' : presa === 'gira' ? 'Gira' : 'Ingrandisci');
    const bl = b.c.fxb;
    this.trascina = {
      presa, x0: x, y0: y, tf0: structuredClone(this.tfDi(b)),
      pos0: bl ? [...(bl.posFine && b.fine ? bl.posFine : bl.pos ?? [0.5, 0.5])] as [number, number] : [0.5, 0.5],
      q0: b.fx ? null : riquadroClip(store.doc, b.c, this.tfDi(b), f), mosso: false,
    };
    const id = b.c.id, fine = b.fine;
    this.schermo.setPointerCapture(e.pointerId);
    const muovi = (ev: PointerEvent) => this.muovi(ev, id, fine);
    const su = () => {
      this.schermo.removeEventListener('pointermove', muovi);
      this.schermo.removeEventListener('pointerup', su);
      this.schermo.removeEventListener('pointercancel', su);
      store.commit(!!this.trascina?.mosso);
      this.trascina = null;
    };
    this.schermo.addEventListener('pointermove', muovi);
    this.schermo.addEventListener('pointerup', su);
    this.schermo.addEventListener('pointercancel', su);
  }

  private muovi(e: PointerEvent, id: string, fine: boolean) {
    const t = this.trascina;
    if (!t) return;
    const p = store.doc;
    const c = p.clips.find((x) => x.id === id);
    if (!c) return;
    const { x, y } = this.punto(e);
    const aggancio = e.altKey ? 0 : 10 / this.k();
    if (t.presa === 'centro' && c.fxb) {
      let px = Math.max(0, Math.min(1, t.pos0[0] + (x - t.x0) / p.w)), py = Math.max(0, Math.min(1, t.pos0[1] + (y - t.y0) / p.h));
      if (Math.abs(px - 0.5) * p.w < aggancio) px = 0.5;
      if (Math.abs(py - 0.5) * p.h < aggancio) py = 0.5;
      if (fine && c.fxb.posFine) c.fxb.posFine = [px, py]; else c.fxb.pos = [px, py];
    } else {
      const tf = fine && c.tfFine ? c.tfFine : c.tf;
      const q0 = t.q0;
      if (!q0) return;
      if (t.presa === 'sposta') {
        let nx = t.tf0.x + x - t.x0, ny = t.tf0.y + y - t.y0;
        // il centro della clip si aggancia al centro del quadro e i bordi ai bordi (Alt = libero)
        const cx = q0.cx + (nx - t.tf0.x), cy = q0.cy + (ny - t.tf0.y);
        if (Math.abs(cx - p.w / 2) < aggancio) nx += p.w / 2 - cx;
        else if (Math.abs(cx - q0.w / 2) < aggancio) nx += q0.w / 2 - cx;
        else if (Math.abs(cx + q0.w / 2 - p.w) < aggancio) nx += p.w - q0.w / 2 - cx;
        if (Math.abs(cy - p.h / 2) < aggancio) ny += p.h / 2 - cy;
        else if (Math.abs(cy - q0.h / 2) < aggancio) ny += q0.h / 2 - cy;
        else if (Math.abs(cy + q0.h / 2 - p.h) < aggancio) ny += p.h - q0.h / 2 - cy;
        tf.x = Math.round(nx); tf.y = Math.round(ny);
      } else if (t.presa === 'angolo') {
        const d0 = Math.max(1, Math.hypot(t.x0 - q0.cx, t.y0 - q0.cy)), d = Math.hypot(x - q0.cx, y - q0.cy);
        let s = Math.max(0.03, t.tf0.scale * (d / d0));
        // si aggancia al 100% (a tutto quadro)
        if (Math.abs(s - 1) < 0.025 && !e.altKey) s = 1;
        tf.scale = Math.round(s * 1000) / 1000;
      } else if (t.presa === 'gira') {
        const a0 = Math.atan2(t.y0 - q0.cy, t.x0 - q0.cx), a = Math.atan2(y - q0.cy, x - q0.cx);
        let g = t.tf0.rot + ((a - a0) * 180) / Math.PI;
        g = ((g + 540) % 360) - 180;
        if (!e.altKey) for (const s of [-180, -90, 0, 90, 180]) if (Math.abs(g - s) < 4) g = s;
        tf.rot = Math.round(g * 10) / 10;
      }
    }
    t.mosso = true;
    store.liveChange();
  }

  /** accende o spegne il movimento: acceso, la fine parte uguale all'inizio e si va a sistemarla */
  private alternaMoto() {
    const b = this.bersaglio();
    if (!b) return;
    const acceso = b.fx ? !!b.c.fxb!.posFine : !!b.c.tfFine;
    store.edit(acceso ? 'Movimento spento' : 'Movimento', (p) => {
      const c = p.clips.find((x) => x.id === b.c.id);
      if (!c) return;
      if (b.fx) {
        if (acceso) delete c.fxb!.posFine; else c.fxb!.posFine = [...(c.fxb!.pos ?? [0.5, 0.5])] as [number, number];
        if (!c.fxb!.pos) c.fxb!.pos = [0.5, 0.5];
      } else if (acceso) delete c.tfFine; else c.tfFine = structuredClone(c.tf);
    });
    if (!acceso) this.vai('fine');
  }

  private vai(dove: 'inizio' | 'fine') {
    const b = this.bersaglio() ?? (() => { const c = store.doc.clips.find((x) => store.sel.has(x.id)); return c ? { c } : null; })();
    if (!b) return;
    motore.vaiA(dove === 'inizio' ? b.c.start : end(b.c) - 1);
    store.select([b.c.id]);
  }

  private rimetti() {
    const b = this.bersaglio();
    if (!b) return;
    store.edit('Rimetti a posto', (p) => {
      const c = p.clips.find((x) => x.id === b.c.id);
      if (!c) return;
      if (b.fx) { delete c.fxb!.pos; delete c.fxb!.posFine; return; }
      // tiene angoli e ombra (la cornice), rimette posizione e grandezza
      const tieni = { angoli: c.tf.angoli, ombra: c.tf.ombra };
      c.tf = { ...TF0, ...tieni };
      delete c.tfFine;
    });
  }
}

function rettangolo(ctx: CanvasRenderingContext2D, q: Riquadro, k: number, col: string) {
  ctx.save();
  ctx.translate(q.cx * k, q.cy * k);
  ctx.rotate(q.rot);
  ctx.strokeStyle = 'rgba(0,0,0,.6)';
  ctx.strokeRect((-q.w / 2) * k - 1, (-q.h / 2) * k - 1, q.w * k + 2, q.h * k + 2);
  ctx.strokeStyle = col;
  ctx.strokeRect((-q.w / 2) * k, (-q.h / 2) * k, q.w * k, q.h * k);
  ctx.restore();
}

function freccia(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, col: string, dpr: number) {
  const a = Math.atan2(y1 - y0, x1 - x0), l = Math.hypot(x1 - x0, y1 - y0);
  if (l < 4) return;
  ctx.save();
  ctx.strokeStyle = col; ctx.fillStyle = col;
  ctx.setLineDash([4 * dpr, 4 * dpr]);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.setLineDash([]);
  const s = 10 * dpr;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - s * Math.cos(a - 0.45), y1 - s * Math.sin(a - 0.45));
  ctx.lineTo(x1 - s * Math.cos(a + 0.45), y1 - s * Math.sin(a + 0.45));
  ctx.fill();
  ctx.restore();
}
