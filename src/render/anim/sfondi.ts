// Fondi e luci: aurora, stelle, neve, bokeh, onde, impulso a tempo, perdite di luce, e due mirini (videocamera, HUD) e il
// notiziario. Idee da aurora-drift, starfield, snow, beat-pulse-background, light-leak, camcorder-hud, news-ticker di HyperFrames.
// I fondi riempiono il quadro; quelli "overlay" lasciano trasparente quello che non disegnano.
import { E, Q, caso, chiaro, col, hexA, larg, lerp, num, prog, resta, rgb, scrivi, tx, clamp01, rettTondo, stella, mixa } from './base';

/** un valore che gira in tondo: x modulo m, sempre positivo */
const giro = (x: number, m: number) => ((x % m) + m) % m;

/** 1) Aurora */
function aurora(q: Q) {
  const { c } = q;
  const base = col(q, 'base', '#0b0c12'), c1 = col(q, 'colore', '#46e5b7'), c2 = col(q, 'colore2', '#7c5cff');
  const g = c.createRadialGradient(q.w / 2, q.h * 0.42, 0, q.w / 2, q.h * 0.42, q.w * 0.7);
  g.addColorStop(0, mixa(base, c1, 0.08)); g.addColorStop(1, base);
  c.fillStyle = g; c.fillRect(0, 0, q.w, q.h);
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const cx = q.w * (0.5 + 0.38 * Math.sin(q.t * 0.22 + i * 1.9)), cy = q.h * (0.46 + 0.3 * Math.cos(q.t * 0.18 + i * 2.3));
    const r = q.h * (0.55 + 0.12 * Math.sin(q.t * 0.3 + i));
    const colore = i % 2 ? c2 : c1;
    const gr = c.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, hexA(colore, 0.5)); gr.addColorStop(0.45, hexA(colore, 0.2)); gr.addColorStop(1, hexA(colore, 0));
    c.fillStyle = gr; c.fillRect(0, 0, q.w, q.h);
  }
  c.globalCompositeOperation = 'source-over';
  const v = c.createRadialGradient(q.w / 2, q.h / 2, q.h * 0.4, q.w / 2, q.h / 2, q.w * 0.65);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
  c.fillStyle = v; c.fillRect(0, 0, q.w, q.h);
}

/** 2) Stelle */
function stelle(q: Q) {
  const { c } = q;
  const base = col(q, 'base', '#05060f'), colore = col(q, 'colore', '#cfe3ff');
  const g = c.createLinearGradient(0, 0, 0, q.h); g.addColorStop(0, mixa(base, '#1b2a55', 0.35)); g.addColorStop(1, base);
  c.fillStyle = g; c.fillRect(0, 0, q.w, q.h);
  const n = num(q, 'quante', 180);
  const W = q.w * 1.1;
  for (let i = 0; i < n; i++) {
    const z = 0.2 + caso(i, 2) * 0.8;
    const x = giro(caso(i, 0) * W - q.t * z * 34, W) - (W - q.w) / 2, y = caso(i, 1) * q.h;
    const tw = 0.55 + 0.45 * Math.sin(q.t * (1.2 + caso(i, 3) * 2.4) + i);
    const r = 1.2 + z * 3.4;
    c.fillStyle = hexA(colore, (0.35 + 0.65 * z) * tw);
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    if (z > 0.93) {
      c.strokeStyle = hexA(colore, 0.5 * tw); c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x - r * 5, y); c.lineTo(x + r * 5, y); c.moveTo(x, y - r * 5); c.lineTo(x, y + r * 5); c.stroke();
    }
  }
}

/** 3) Neve */
function neve(q: Q) {
  const { c } = q;
  const colore = col(q, 'colore', '#ffffff');
  const n = num(q, 'quanti', 120), vento = num(q, 'vento', 30);
  const u = prog(q.t, 0, 0.8, E.p2out) * resta(q, 0.8);
  for (let i = 0; i < n; i++) {
    const z = caso(i, 0);
    const r = 2.5 + z * 9;
    const vel = 55 + z * 130;
    const y = giro(caso(i, 1) * (q.h + 80) + q.t * vel, q.h + 80) - 40;
    const x = giro(caso(i, 2) * q.w + Math.sin(q.t * (0.6 + caso(i, 3)) + i) * (20 + z * 50) + q.t * vento * (0.4 + z), q.w + 40) - 20;
    const a = (0.35 + 0.55 * z) * u;
    if (r > 7) {
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hexA(colore, a)); g.addColorStop(1, hexA(colore, 0));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    } else { c.fillStyle = hexA(colore, a); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
  }
}

/** 4) Bokeh */
function bokeh(q: Q) {
  const { c } = q;
  const c1 = col(q, 'colore', '#ffb347'), c2 = col(q, 'colore2', '#ff7ab8');
  const n = num(q, 'quanti', 22);
  const u = prog(q.t, 0, 1, E.p2out) * resta(q, 0.8);
  for (let i = 0; i < n; i++) {
    const z = caso(i, 0);
    const x = q.w * caso(i, 1) + Math.sin(q.t * (0.15 + caso(i, 4) * 0.2) + i * 3) * (40 + z * 80);
    const y = q.h * caso(i, 2) + Math.cos(q.t * (0.12 + caso(i, 5) * 0.2) + i * 2) * (30 + z * 60);
    const r = 36 + z * 120;
    const colore = i % 2 ? c2 : c1;
    const a = (0.12 + 0.2 * (0.5 + 0.5 * Math.sin(q.t * 0.8 + i * 1.7))) * u;
    const g = c.createRadialGradient(x, y, r * 0.2, x, y, r);
    g.addColorStop(0, hexA(colore, a * 0.7)); g.addColorStop(0.82, hexA(colore, a)); g.addColorStop(1, hexA(colore, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = hexA(chiaro(colore, 0.3), a * 0.9); c.lineWidth = 2; c.beginPath(); c.arc(x, y, r * 0.84, 0, Math.PI * 2); c.stroke();
  }
}

/** 5) Onde */
function onde(q: Q) {
  const { c } = q;
  const base = col(q, 'base', '#08101f'), c1 = col(q, 'colore', '#35e8ff'), c2 = col(q, 'colore2', '#7c5cff');
  const g = c.createLinearGradient(0, 0, 0, q.h); g.addColorStop(0, base); g.addColorStop(1, mixa(base, c2, 0.3));
  c.fillStyle = g; c.fillRect(0, 0, q.w, q.h);
  for (let i = 0; i < 6; i++) {
    const y0 = q.h * (0.46 + i * 0.09), amp = 22 + i * 9, f = 0.0035 - i * 0.00025, v = 0.7 + i * 0.18;
    c.beginPath(); c.moveTo(0, q.h);
    for (let x = 0; x <= q.w + 20; x += 20) c.lineTo(x, y0 + Math.sin(x * f + q.t * v + i * 1.3) * amp + Math.sin(x * f * 2.3 - q.t * v * 0.8) * amp * 0.4);
    c.lineTo(q.w, q.h); c.closePath();
    const gr = c.createLinearGradient(0, y0 - amp, 0, q.h);
    gr.addColorStop(0, hexA(i % 2 ? c2 : c1, 0.5 - i * 0.04)); gr.addColorStop(1, hexA(i % 2 ? c2 : c1, 0.08));
    c.fillStyle = gr; c.fill();
  }
}

/** 6) Impulso a tempo */
function impulso(q: Q) {
  const { c } = q;
  const base = col(q, 'base', '#0a0612'), colore = col(q, 'colore', '#ff3df2');
  const per = 60 / Math.max(30, num(q, 'bpm', 120));
  const fase = (q.t % per) / per, battito = Math.floor(q.t / per);
  const dec = Math.exp(-fase * 5);
  c.fillStyle = base; c.fillRect(0, 0, q.w, q.h);
  const cx = q.w / 2, cy = q.h / 2;
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, q.h * (0.55 + 0.1 * dec));
  g.addColorStop(0, hexA(colore, 0.35 + 0.3 * dec)); g.addColorStop(1, hexA(colore, 0));
  c.fillStyle = g; c.fillRect(0, 0, q.w, q.h);
  // gli anelli degli ultimi battiti
  for (let k = 0; k < 4; k++) {
    const eta = (k + fase) * per, r = 120 + eta * 380;
    c.lineWidth = 6 - k; c.strokeStyle = hexA(colore, Math.max(0, 0.7 - k * 0.2) * (k === 0 ? 1 - fase * 0.3 : 1));
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  }
  c.shadowColor = colore; c.shadowBlur = 50;
  c.fillStyle = hexA(chiaro(colore, 0.3), 0.9); c.beginPath(); c.arc(cx, cy, 90 * (1 + 0.2 * dec), 0, Math.PI * 2); c.fill();
  c.shadowColor = 'transparent';
  void battito;
}

/** 7) Perdita di luce */
function luce(q: Q) {
  const { c } = q;
  const c1 = col(q, 'colore', '#ff9a3d'), c2 = col(q, 'colore2', '#ff4d6d');
  const k = clamp01(q.t / q.d);
  const env = Math.sin(Math.PI * k);
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const cx = q.w * lerp(-0.1, 1.1, clamp01(k * 1.1 + i * 0.12 - 0.1)) , cy = q.h * (0.2 + 0.25 * i + 0.1 * Math.sin(q.t * 1.2 + i));
    const r = q.h * (0.7 + 0.25 * i);
    const colore = i === 1 ? c2 : c1;
    const gr = c.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, hexA(colore, 0.75 * env)); gr.addColorStop(0.5, hexA(colore, 0.25 * env)); gr.addColorStop(1, hexA(colore, 0));
    c.fillStyle = gr; c.fillRect(0, 0, q.w, q.h);
  }
  // una lama di luce che attraversa
  const bx = q.w * lerp(-0.3, 1.3, k);
  const gl = c.createLinearGradient(bx - 200, 0, bx + 200, 0);
  gl.addColorStop(0, hexA(c1, 0)); gl.addColorStop(0.5, hexA(chiaro(c1, 0.5), 0.4 * env)); gl.addColorStop(1, hexA(c1, 0));
  c.fillStyle = gl; c.fillRect(bx - 200, 0, 400, q.h);
  c.globalCompositeOperation = 'source-over';
}

/** 8) Videocamera REC */
function rec(q: Q) {
  const { c } = q;
  const accent = col(q, 'colore', '#f12c2c');
  const m = Math.min(q.w, q.h) * 0.05, size = Math.min(q.w, q.h) * 0.037;
  const font = `700 ${size}px "Space Mono", "Courier New", monospace`;
  const o = { font, colore: '#fff', contorno: { colore: 'rgba(0,0,0,.92)', px: size * 0.12 }, ombra: { blur: 6, colore: 'rgba(0,0,0,.9)' } };
  const u = prog(q.t, 0, 0.3, E.lineare) * resta(q, 0.3);
  c.save(); c.globalAlpha = u;
  // REC con il pallino che lampeggia
  const acceso = Math.floor(q.t * 1.2) % 2 === 0;
  if (acceso) { c.fillStyle = accent; c.shadowColor = hexA(accent, 0.6); c.shadowBlur = 14; c.beginPath(); c.arc(m + size * 0.55, m + size * 0.7, size * 0.55, 0, Math.PI * 2); c.fill(); c.shadowColor = 'transparent'; }
  scrivi(c, 'REC', m + size * 1.6, m + size * 0.2, { ...o, base: 'top' });
  // la batteria
  const bw = size * 2.4, bh = size * 1.2, bx = q.w - m - bw - size * 0.4, by = m + size * 0.1;
  c.lineWidth = size * 0.12; c.strokeStyle = '#fff'; c.strokeRect(bx, by, bw, bh);
  c.fillStyle = '#fff'; c.fillRect(bx + bw, by + bh * 0.3, size * 0.25, bh * 0.4);
  for (let i = 0; i < 3; i++) c.fillRect(bx + size * 0.2 + i * size * 0.7, by + size * 0.2, size * 0.55, bh - size * 0.4);
  // data e modo, a sinistra in basso; il contatore a destra
  scrivi(c, tx(q, 'data', '12 GIU 2026'), m, q.h - m - size, { ...o, base: 'top' });
  scrivi(c, tx(q, 'modo', 'SP'), m, q.h - m - size * 2.4, { ...o, base: 'top', font: `700 ${size * 0.72}px "Space Mono", monospace` });
  const sec = Math.floor(q.t), pad = (n: number) => String(n).padStart(2, '0');
  scrivi(c, `0:${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`, q.w - m, q.h - m - size, { ...o, base: 'top', align: 'right' });
  c.restore();
}

/** 9) Notiziario */
function notizie(q: Q) {
  const { c } = q;
  const colore = col(q, 'colore', '#d2202a');
  const marca = tx(q, 'marca', 'NEWS').toUpperCase();
  const testo = tx(q, 'testo', '');
  const H = 132, y = q.h - 60 - H;
  const ent = prog(q.t, 0, 0.6, E.p4out), usc = prog(q.t, q.d - 0.5, 0.5, E.p2in);
  const off = (1 - ent + usc) * (H + 120);
  c.save(); c.translate(0, off);
  c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 30; c.shadowOffsetY = -4;
  c.fillStyle = 'rgba(14,16,22,.94)'; c.fillRect(80, y, q.w - 160, H);
  c.shadowColor = 'transparent';
  c.fillStyle = colore; c.fillRect(80, y - 8, q.w - 160, 8);
  // la sigla, con il bordo inclinato
  const fM = `700 ${56}px "Oswald", sans-serif`;
  const wM = larg(c, marca, fM, 3) + 90;
  c.beginPath(); c.moveTo(80, y); c.lineTo(80 + wM, y); c.lineTo(80 + wM - 34, y + H); c.lineTo(80, y + H); c.closePath(); c.fillStyle = colore; c.fill();
  scrivi(c, marca, 80 + 36, y + H / 2 + 2, { font: fM, colore: '#fff', base: 'middle', spazio: 3 });
  // il testo che scorre, finestra dopo la sigla
  c.save(); c.beginPath(); c.rect(80 + wM, y, q.w - 160 - wM, H); c.clip();
  const f = `600 ${46}px "Montserrat", sans-serif`;
  const t = `${testo}    •    `;
  const w = larg(c, t, f);
  const x0 = 80 + wM + 40 - ((q.t * 150) % w);
  for (let k = 0; k < 4; k++) { const x = x0 + k * w; if (x > q.w) break; scrivi(c, t, x, y + H / 2 + 2, { font: f, colore: '#fff', base: 'middle' }); }
  c.restore();
  c.restore();
}

/** 10) Mirino HUD */
function mirino(q: Q) {
  const { c } = q;
  const colore = col(q, 'colore', '#35e8ff');
  const m = 90, L = 110;
  const k = prog(q.t, 0.1, 0.8, E.p3out), u = resta(q, 0.4);
  c.save(); c.globalAlpha = u;
  c.strokeStyle = colore; c.lineWidth = 6; c.lineCap = 'square'; c.shadowColor = colore; c.shadowBlur = 14;
  const ang = (x: number, y: number, sx: number, sy: number) => { c.beginPath(); c.moveTo(x, y + sy * L * k); c.lineTo(x, y); c.lineTo(x + sx * L * k, y); c.stroke(); };
  ang(m, m, 1, 1); ang(q.w - m, m, -1, 1); ang(m, q.h - m, 1, -1); ang(q.w - m, q.h - m, -1, -1);
  // il mirino al centro
  const cx = q.w / 2, cy = q.h / 2;
  c.lineWidth = 3; c.globalAlpha = u * k;
  c.beginPath(); c.arc(cx, cy, 70, 0, Math.PI * 2); c.stroke();
  c.save(); c.translate(cx, cy); c.rotate(q.t * 0.5);
  for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(70, 0); c.lineTo(110, 0); c.stroke(); }
  c.restore();
  c.shadowColor = 'transparent';
  // etichetta e numeri
  const font = `700 28px "Space Mono", monospace`;
  scrivi(c, tx(q, 'etichetta', 'SOGGETTO 01'), m + 8, m + L * 0.5 + 28, { font, colore, base: 'top', alfa: k, spazio: 3 });
  const cifre = (i: number) => (caso(i, Math.floor(q.t * 6)) * 99).toFixed(2).padStart(5, '0');
  scrivi(c, `X ${cifre(1)}`, q.w - m - 8, m + L * 0.5 + 28, { font, colore, base: 'top', align: 'right', alfa: k });
  scrivi(c, `Y ${cifre(2)}`, q.w - m - 8, m + L * 0.5 + 66, { font, colore, base: 'top', align: 'right', alfa: k });
  scrivi(c, `T ${q.t.toFixed(2)}s`, m + 8, q.h - m - L * 0.5 - 34, { font, colore, base: 'top', alfa: k });
  // la riga di scansione che sale e scende
  const sy = m + ((q.h - m * 2) * (0.5 + 0.5 * Math.sin(q.t * 1.1)));
  const g = c.createLinearGradient(0, sy - 40, 0, sy + 4); g.addColorStop(0, hexA(colore, 0)); g.addColorStop(1, hexA(colore, 0.28));
  c.fillStyle = g; c.fillRect(m, sy - 40, q.w - m * 2, 44);
  c.restore();
  void rgb; void rettTondo; void stella;
}

export const SFONDI: Record<string, (q: Q) => void> = {
  'bg-aurora': aurora, 'bg-stelle': stelle, 'bg-neve': neve, 'bg-bokeh': bokeh, 'bg-onde': onde, 'bg-impulso': impulso, 'bg-luce': luce,
  'hd-rec': rec, 'hd-notizie': notizie, 'hd-mirino': mirino,
};
