// I due monitor come in sala di montaggio: a sinistra il PLAYER (la sorgente, il lettore) e a destra il
// RECORDER (il programma, il registratore). Timecode a sette segmenti, attacco/stacco, jog e shuttle.
import { store } from '../core/store';
import { motore, type Monitor } from '../motore';
import { Compositore } from '../render/compositore';
import { fps, frameToTc, parseTc, s2f, f2s } from '../core/timecode';
import { projectEnd } from '../core/progetto';
import { esegui, modi } from '../azioni';
import { avviso, h, icona } from './dom';
import { suTastierino } from './tastiera';

export class PannelloMonitor {
  el: HTMLElement;
  schermo: HTMLElement;
  canvas: HTMLCanvasElement;
  sopra: HTMLCanvasElement;
  private tc: HTMLElement;
  private tcIn: HTMLElement;
  private tcOut: HTMLElement;
  private tcDur: HTMLElement;
  private nome: HTMLElement;
  private barra: HTMLCanvasElement;
  private inserimento: HTMLInputElement;
  private playBtn: HTMLElement;
  private shuttleLbl: HTMLElement;
  qualita = 1;

  constructor(public quale: Monitor) {
    const rec = quale === 'recorder';
    this.canvas = h('canvas', { class: 'schermo-tela' });
    this.sopra = h('canvas', { class: 'schermo-sopra' });
    this.nome = h('span', { class: 'mon-sorgente' }, rec ? 'Programma' : 'nessuna sorgente');
    this.schermo = h('div', { class: 'schermo' }, this.canvas, this.sopra);
    this.tc = h('button', { class: 'tc grande', title: 'Clic per scrivere un timecode (o usa il tastierino numerico)' }, '00:00:00:00');
    this.tcIn = h('span', { class: 'tc piccolo' }, '--:--:--:--');
    this.tcOut = h('span', { class: 'tc piccolo' }, '--:--:--:--');
    this.tcDur = h('span', { class: 'tc piccolo' }, '--:--:--:--');
    this.inserimento = h('input', { class: 'tc-inserimento', inputmode: 'numeric', placeholder: 'hhmmssff o +25' }) as HTMLInputElement;
    this.barra = h('canvas', { class: 'mon-barra' });
    this.playBtn = h('button', { class: 'tasto-trasporto play', title: 'Play / Stop (Spazio)', on: { click: () => { this.attiva(); motore.toggle(); } } }, icona('play', 20));
    this.shuttleLbl = h('span', { class: 'shuttle-vel' }, '');
    const t = (ic: string, title: string, fn: () => void, cls = '') => h('button', { class: 'tasto-trasporto ' + cls, title, on: { click: () => { this.attiva(); fn(); } } }, icona(ic, 17));
    const jog = new JogShuttle(() => this.attiva());
    this.el = h('section', { class: 'monitor ' + quale, on: { pointerdown: () => this.attiva() } },
      h('header', { class: 'mon-testa' },
        h('span', { class: 'led' }), h('b', null, rec ? 'RECORDER' : 'PLAYER'), this.nome,
        h('span', { class: 'mon-spazio' }),
        h('button', { class: 'btn-mini foto', title: rec ? 'Istantanea del fotogramma nel contenitore (P) · Shift+P fermo immagine' : 'Istantanea della sorgente nel contenitore (P)', on: { click: () => { this.attiva(); esegui('istantanea'); } } }, icona('foto', 13), 'FOTO'),
        rec ? h('button', { class: 'btn-mini', title: 'Zone di sicurezza e croce (G)', on: { click: () => { modi.zoneSicure = !modi.zoneSicure; this.disegnaSopra(); } } }, 'ZONE') : null,
        h('select', {
          class: 'mini-select', title: 'Qualità dell\'anteprima',
          on: { change: (e: Event) => { this.qualita = Number((e.target as HTMLSelectElement).value); this.adatta(); } },
        }, h('option', { value: '1' }, 'Piena'), h('option', { value: '0.5' }, '½'), h('option', { value: '0.25' }, '¼'))),
      this.schermo,
      this.barra,
      h('div', { class: 'mon-tc' },
        this.tc, this.inserimento,
        h('div', { class: 'mon-segni' },
          h('label', null, 'IN'), this.tcIn, h('label', null, 'OUT'), this.tcOut, h('label', null, 'DUR'), this.tcDur)),
      h('div', { class: 'mon-trasporto' },
        t('inizio', 'All\'inizio (Home)', () => esegui('inizio')),
        t('indietro', 'Shuttle indietro (J)', () => motore.shuttle(-1)),
        t('fotoPrec', 'Fotogramma prima (←)', () => motore.passo(-1)),
        this.playBtn,
        t('fotoSucc', 'Fotogramma dopo (→)', () => motore.passo(1)),
        t('avanti', 'Shuttle avanti (L)', () => motore.shuttle(1)),
        t('fine', 'Alla fine (End)', () => esegui('fine')),
        h('span', { class: 'sep-v' }),
        t('segnaIn', 'Segna attacco (I)', () => esegui('segnaIn'), 'in'),
        t('segnaOut', 'Segna stacco (O)', () => esegui('segnaOut'), 'out'),
        t('loop', 'Loop (Ctrl+L)', () => esegui('loop'), 'loop'),
        rec ? null : h('span', { class: 'sep-v' }),
        rec ? null : h('button', { class: 'tasto-edit', title: 'Inserisci nella timeline (, oppure [)', on: { click: () => esegui('inserisci') } }, h('small', null, ','), 'INS'),
        rec ? null : h('button', { class: 'tasto-edit rosso', title: 'Sovrascrivi nella timeline (. oppure ])', on: { click: () => esegui('sovrascrivi') } }, h('small', null, '.'), 'SOVR'),
        this.shuttleLbl,
        jog.el));

    this.tc.addEventListener('click', () => this.apriInserimento(''));
    this.inserimento.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { this.vaiTc(this.inserimento.value); this.chiudiInserimento(); }
      if (e.key === 'Escape') this.chiudiInserimento();
      e.stopPropagation();
    });
    this.inserimento.addEventListener('blur', () => this.chiudiInserimento());
    this.barra.addEventListener('pointerdown', (e) => {
      this.attiva();
      const muovi = (ev: PointerEvent) => {
        const r = this.barra.getBoundingClientRect();
        const k = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
        if (this.quale === 'recorder') motore.vaiA(Math.round(k * Math.max(1, projectEnd(store.doc))));
        else { const m = this.media(); if (m) motore.playerVaiA((m.t0 || 0) + k * (m.duration - (m.t0 || 0))); }
      };
      motore.stop();
      muovi(e);
      this.barra.setPointerCapture(e.pointerId);
      const up = () => { this.barra.removeEventListener('pointermove', muovi); this.barra.removeEventListener('pointerup', up); };
      this.barra.addEventListener('pointermove', muovi);
      this.barra.addEventListener('pointerup', up);
    });
    this.schermo.addEventListener('dblclick', () => { if (document.fullscreenElement) void document.exitFullscreen(); else void this.schermo.requestFullscreen?.(); });
    new ResizeObserver(() => this.adatta()).observe(this.schermo);
    if (rec) motore.rec = new Compositore(this.canvas);
    else motore.playerCanvas = this.canvas;
    store.on('status', () => this.aggiorna());
    store.on('head', () => { if (rec) this.aggiorna(); });
    store.on('doc', () => { this.aggiorna(); this.adatta(); });
  }

  private media() { return store.doc.media.find((x) => x.id === motore.playerMedia); }

  attiva() {
    motore.setMonitor(this.quale);
    suTastierino((c) => this.apriInserimento(c));
  }

  private apriInserimento(prima: string) {
    this.attiva();
    this.el.classList.add('inserisce');
    this.inserimento.value = prima;
    this.inserimento.focus();
  }

  private chiudiInserimento() { this.el.classList.remove('inserisce'); }

  private vaiTc(testo: string) {
    const p = store.doc;
    if (this.quale === 'recorder') {
      const f = parseTc(testo, p.rate, p.drop, Math.round(store.head));
      if (f === null) { avviso('Timecode non valido', 'errore'); return; }
      motore.vaiA(f);
    } else {
      const m = this.media();
      if (!m) return;
      const r = { num: Math.round((m.fps || fps(p.rate)) * 1000), den: 1000 };
      const cur = s2f(motore.playerT, r);
      const f = parseTc(testo, r, false, cur);
      if (f === null) { avviso('Timecode non valido', 'errore'); return; }
      motore.playerVaiA(f2s(f, r));
    }
  }

  adatta() {
    const r = this.schermo.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return;
    const p = store.doc;
    const asp = p.w / p.h;
    let w = r.width, hh = r.width / asp;
    if (hh > r.height) { hh = r.height; w = hh * asp; }
    const dpr = Math.min(2, devicePixelRatio || 1);
    const pw = Math.max(16, Math.round(Math.min(p.w, w * dpr) * this.qualita));
    const ph = Math.max(9, Math.round(pw / asp));
    for (const c of [this.canvas, this.sopra]) {
      c.style.width = w + 'px';
      c.style.height = hh + 'px';
    }
    if (this.canvas.width !== pw || this.canvas.height !== ph) {
      this.canvas.width = pw;
      this.canvas.height = ph;
    }
    this.sopra.width = Math.round(w * dpr);
    this.sopra.height = Math.round(hh * dpr);
    const bw = this.barra.getBoundingClientRect().width;
    this.barra.width = Math.round(bw * dpr);
    this.barra.height = Math.round(14 * dpr);
    motore.ridisegna();
    this.disegnaSopra();
    this.aggiorna();
  }

  aggiorna() {
    const p = store.doc;
    const attivo = motore.attivo === this.quale;
    this.el.classList.toggle('attivo', attivo);
    const suona = attivo && motore.playing;
    this.playBtn.replaceChildren(icona(suona ? 'stop' : 'play', 20));
    this.playBtn.classList.toggle('acceso', suona);
    this.shuttleLbl.textContent = attivo && motore.speed !== 0 && motore.speed !== 1 ? `${motore.speed > 0 ? '▶' : '◀'} ×${Math.abs(motore.speed)}` : '';
    this.el.querySelector('.loop')?.classList.toggle('acceso', motore.loop);
    if (this.quale === 'recorder') {
      this.tc.textContent = frameToTc(Math.floor(store.head + 1e-6), p.rate, p.drop);
      this.tcIn.textContent = p.inF !== null ? frameToTc(p.inF, p.rate, p.drop) : '--:--:--:--';
      this.tcOut.textContent = p.outF !== null ? frameToTc(p.outF, p.rate, p.drop) : '--:--:--:--';
      const d = p.inF !== null && p.outF !== null ? p.outF - p.inF : projectEnd(p);
      this.tcDur.textContent = frameToTc(d, p.rate, p.drop);
      this.nome.textContent = p.name;
    } else {
      const m = this.media();
      this.nome.textContent = m ? m.name : 'doppio clic su un file del contenitore';
      const r = { num: Math.round((m?.fps || fps(p.rate)) * 1000), den: 1000 };
      const tcS = (s: number) => frameToTc(s2f(s, r), r);
      this.tc.textContent = m ? tcS(motore.playerT) : '--:--:--:--';
      this.tcIn.textContent = m?.markIn != null ? tcS(m.markIn) : '--:--:--:--';
      this.tcOut.textContent = m?.markOut != null ? tcS(m.markOut) : '--:--:--:--';
      this.tcDur.textContent = m ? tcS((m.markOut ?? m.duration) - (m.markIn ?? m.t0 ?? 0)) : '--:--:--:--';
    }
    this.disegnaBarra();
  }

  private disegnaBarra() {
    const c = this.barra, ctx = c.getContext('2d')!;
    const W = c.width, H = c.height;
    if (!W) return;
    ctx.fillStyle = '#0a090e';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#23212b';
    ctx.fillRect(0, H * 0.35, W, H * 0.3);
    let pos = 0, a: number | null = null, b: number | null = null;
    if (this.quale === 'recorder') {
      const e = Math.max(1, projectEnd(store.doc));
      pos = store.head / e;
      if (store.doc.inF !== null) a = store.doc.inF / e;
      if (store.doc.outF !== null) b = store.doc.outF / e;
    } else {
      const m = this.media();
      if (m && m.duration) {
        const t0 = m.t0 || 0, d = m.duration - t0;
        pos = (motore.playerT - t0) / d;
        if (m.markIn != null) a = (m.markIn - t0) / d;
        if (m.markOut != null) b = (m.markOut - t0) / d;
      }
    }
    if (a !== null || b !== null) {
      ctx.fillStyle = 'rgba(53,232,255,.55)';
      const x0 = (a ?? 0) * W, x1 = (b ?? 1) * W;
      ctx.fillRect(x0, H * 0.3, x1 - x0, H * 0.4);
    }
    ctx.fillStyle = '#ffd54a';
    ctx.fillRect(Math.round(pos * W) - 1, 0, 3, H);
  }

  disegnaSopra() {
    const c = this.sopra, ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    if (this.quale !== 'recorder' || !modi.zoneSicure) return;
    const W = c.width, H = c.height;
    ctx.lineWidth = Math.max(1, W / 900);
    const box = (k: number, col: string) => { ctx.strokeStyle = col; ctx.strokeRect(W * (1 - k) / 2, H * (1 - k) / 2, W * k, H * k); };
    box(0.93, 'rgba(255,213,74,.7)'); // azione
    box(0.9, 'rgba(53,232,255,.7)'); // titoli
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 12, H / 2); ctx.lineTo(W / 2 + 12, H / 2);
    ctx.moveTo(W / 2, H / 2 - 12); ctx.lineTo(W / 2, H / 2 + 12);
    ctx.stroke();
    // il 4:3 dentro il 16:9, per chi manda ancora in onda sui vecchi televisori
    if (W / H > 1.5) {
      const w43 = H * 4 / 3;
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = 'rgba(255,61,242,.55)';
      ctx.strokeRect((W - w43) / 2, 0, w43, H);
      ctx.setLineDash([]);
    }
  }
}

/** la manopola doppia della centralina: anello esterno = shuttle (torna al centro), rotella interna = jog */
class JogShuttle {
  el: HTMLCanvasElement;
  private ang = 0;
  private shuttle = 0;
  constructor(attiva: () => void) {
    this.el = h('canvas', { class: 'jog', width: 112, height: 112, title: 'Jog (centro, gira) · Shuttle (anello, tira e lascia)' });
    this.disegna();
    this.el.addEventListener('pointerdown', (e) => {
      attiva();
      const r = this.el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy) / (r.width / 2);
      const esterno = dist > 0.66;
      let a0 = Math.atan2(e.clientY - cy, e.clientX - cx);
      let resto = 0;
      this.el.setPointerCapture(e.pointerId);
      motore.stop();
      const mv = (ev: PointerEvent) => {
        const a = Math.atan2(ev.clientY - cy, ev.clientX - cx);
        let d = a - a0;
        if (d > Math.PI) d -= Math.PI * 2;
        if (d < -Math.PI) d += Math.PI * 2;
        if (esterno) {
          this.shuttle = Math.max(-1, Math.min(1, this.shuttle + d / 2));
          const s = Math.sign(this.shuttle) * Math.pow(2, Math.round(Math.abs(this.shuttle) * 5)) / 2;
          motore.shuttleContinuo(Math.abs(this.shuttle) < 0.08 ? 0 : s);
        } else {
          // un giro della rotella = 24 fotogrammi
          resto += (d / (Math.PI * 2)) * 24;
          const n = Math.trunc(resto);
          if (n) { motore.passo(n); resto -= n; }
          this.ang += d;
        }
        a0 = a;
        this.disegna();
      };
      const up = () => {
        this.el.removeEventListener('pointermove', mv);
        this.el.removeEventListener('pointerup', up);
        if (esterno) {
          // l'anello dello shuttle torna al centro con la molla
          const torna = () => { this.shuttle *= 0.6; this.disegna(); if (Math.abs(this.shuttle) > 0.01) requestAnimationFrame(torna); else { this.shuttle = 0; this.disegna(); } };
          torna();
          motore.stop();
        }
      };
      this.el.addEventListener('pointermove', mv);
      this.el.addEventListener('pointerup', up);
    });
    this.el.addEventListener('wheel', (e) => { e.preventDefault(); attiva(); motore.passo(e.deltaY > 0 ? 1 : -1); this.ang += e.deltaY > 0 ? 0.26 : -0.26; this.disegna(); }, { passive: false });
  }

  private disegna() {
    const c = this.el, ctx = c.getContext('2d')!;
    const W = c.width, R = W / 2;
    ctx.clearRect(0, 0, W, W);
    // anello shuttle
    const g = ctx.createRadialGradient(R, R * 0.7, R * 0.2, R, R, R);
    g.addColorStop(0, '#3a3844'); g.addColorStop(1, '#16151b');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(R, R, R - 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    for (let i = -5; i <= 5; i++) {
      const a = -Math.PI / 2 + i * 0.28;
      ctx.strokeStyle = i === 0 ? '#ffd54a' : '#5b5866';
      ctx.lineWidth = i === 0 ? 3 : 1.5;
      ctx.beginPath(); ctx.moveTo(R + Math.cos(a) * (R - 5), R + Math.sin(a) * (R - 5)); ctx.lineTo(R + Math.cos(a) * (R - 12), R + Math.sin(a) * (R - 12)); ctx.stroke();
    }
    const sa = -Math.PI / 2 + this.shuttle * 1.4;
    ctx.fillStyle = Math.abs(this.shuttle) > 0.05 ? '#ff3df2' : '#8e8a99';
    ctx.beginPath(); ctx.arc(R + Math.cos(sa) * (R - 9), R + Math.sin(sa) * (R - 9), 4.5, 0, Math.PI * 2); ctx.fill();
    // rotella jog
    const r2 = R * 0.62;
    const g2 = ctx.createRadialGradient(R - r2 * 0.3, R - r2 * 0.4, 2, R, R, r2);
    g2.addColorStop(0, '#6c6878'); g2.addColorStop(0.5, '#34313d'); g2.addColorStop(1, '#1b1a21');
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(R, R, r2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0b0a0e'; ctx.lineWidth = 1.5; ctx.stroke();
    for (let i = 0; i < 24; i++) {
      const a = this.ang + (i / 24) * Math.PI * 2;
      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      ctx.beginPath(); ctx.moveTo(R + Math.cos(a) * r2 * 0.82, R + Math.sin(a) * r2 * 0.82); ctx.lineTo(R + Math.cos(a) * r2 * 0.97, R + Math.sin(a) * r2 * 0.97); ctx.stroke();
    }
    // fossetta per il dito
    const fa = this.ang - Math.PI / 2;
    ctx.fillStyle = '#121116';
    ctx.beginPath(); ctx.arc(R + Math.cos(fa) * r2 * 0.55, R + Math.sin(fa) * r2 * 0.55, r2 * 0.17, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1; ctx.stroke();
  }
}
