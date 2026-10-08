// Le animazioni da attaccare a un oggetto tracciato (1.4.0): stanno tutte attorno al centro del quadro, così quando la
// clip "segue" l'oggetto (c.segue) il centro va proprio sull'oggetto e il disegno lo accompagna. Si usano anche da sole.
import { E, clamp01, hexA, prog, resta, scrivi, FONT, type Q } from './base';

const centro = (q: Q) => [q.w / 2, q.h / 2] as const;
const num = (q: Q, k: string, d: number) => (typeof q.v[k] === 'number' ? (q.v[k] as number) : d);
const str = (q: Q, k: string, d: string) => (typeof q.v[k] === 'string' ? (q.v[k] as string) : d);

/** un cerchio che si disegna attorno all'oggetto, con un secondo anello che pulsa */
function cerchio(q: Q) {
  const { c } = q;
  const [x, y] = centro(q);
  const r = 1.2 * num(q, 'dim', 100);
  const col = str(q, 'colore', '#ff3df2');
  const a = prog(q.t, 0, 0.7, E.p3out) * resta(q, 0.35);
  c.save();
  c.lineCap = 'round';
  c.lineWidth = 9;
  c.strokeStyle = col;
  c.shadowColor = hexA(col, 0.8);
  c.shadowBlur = 18;
  c.beginPath();
  c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a);
  c.stroke();
  const pulse = (q.t * 1.2) % 1;
  c.globalAlpha = (1 - pulse) * 0.6 * resta(q, 0.35) * (a >= 1 ? 1 : 0);
  c.lineWidth = 4;
  c.beginPath();
  c.arc(x, y, r * (1 + pulse * 0.35), 0, Math.PI * 2);
  c.stroke();
  c.restore();
  const etichetta = str(q, 'etichetta', '');
  if (etichetta) scrivi(c, etichetta, x, y + r + 58, { font: `800 46px ${FONT.montserrat}`, colore: '#fff', align: 'center', alfa: prog(q.t, 0.5, 0.4) * resta(q, 0.35), ombra: { blur: 12, colore: 'rgba(0,0,0,.7)' } });
}

/** una freccia che arriva da un lato e indica l'oggetto, col testo in coda */
function freccia(q: Q) {
  const { c } = q;
  const [x, y] = centro(q);
  const col = str(q, 'colore', '#ffd54a');
  const lato = str(q, 'da', 'sinistra');
  const ang = { sinistra: Math.PI, destra: 0, sopra: -Math.PI / 2, sotto: Math.PI / 2 }[lato as 'sinistra'] ?? Math.PI;
  const dist = 1.1 * num(q, 'dim', 100);
  const lung = 260;
  const ent = prog(q.t, 0, 0.6, E.back(1.4));
  const bob = Math.sin(q.t * 6) * 10 * (q.t > 0.6 ? 1 : 0);
  const a = resta(q, 0.3);
  const px = x + Math.cos(ang) * (dist + bob + (1 - ent) * 400);
  const py = y + Math.sin(ang) * (dist + bob + (1 - ent) * 400);
  c.save();
  c.globalAlpha = clamp01(ent * 2) * a;
  c.translate(px, py);
  c.rotate(ang);
  c.shadowColor = 'rgba(0,0,0,.55)';
  c.shadowBlur = 14;
  c.fillStyle = col;
  // gambo e punta (la punta guarda il centro: verso -x nel sistema ruotato)
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(70, -46);
  c.lineTo(70, -18);
  c.lineTo(70 + lung, -18);
  c.lineTo(70 + lung, 18);
  c.lineTo(70, 18);
  c.lineTo(70, 46);
  c.closePath();
  c.fill();
  c.restore();
  const testo = str(q, 'testo', '');
  if (testo) {
    const tx = x + Math.cos(ang) * (dist + 70 + lung + 40 + bob);
    const ty = y + Math.sin(ang) * (dist + 70 + lung + 40 + bob);
    const al: CanvasTextAlign = lato === 'sinistra' ? 'right' : lato === 'destra' ? 'left' : 'center';
    scrivi(c, testo, tx, ty + (lato === 'sotto' ? 40 : lato === 'sopra' ? -10 : 16), { font: `900 54px ${FONT.montserrat}`, colore: '#fff', align: al, alfa: prog(q.t, 0.4, 0.4) * a, contorno: { colore: 'rgba(0,0,0,.85)', px: 10 } });
  }
}

/** un punto sull'oggetto, una linea che sale in diagonale e un'etichetta (come nei documentari) */
function etichetta(q: Q) {
  const { c } = q;
  const [x, y] = centro(q);
  const col = str(q, 'colore', '#35e8ff');
  const verso = str(q, 'verso', 'destra') === 'sinistra' ? -1 : 1;
  const a = resta(q, 0.35);
  const p1 = prog(q.t, 0.1, 0.35, E.p2out);
  const p2 = prog(q.t, 0.4, 0.35, E.p2out);
  const p3 = prog(q.t, 0.65, 0.45, E.p3out);
  const gx = x + verso * 160 * p1, gy = y - 160 * p1;
  const fx = gx + verso * 220 * p2;
  c.save();
  c.globalAlpha = a;
  c.fillStyle = col;
  c.shadowColor = hexA(col, 0.9);
  c.shadowBlur = 16;
  c.beginPath();
  c.arc(x, y, 12 * prog(q.t, 0, 0.3, E.back(2)), 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = col;
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(gx, gy);
  if (p2 > 0) c.lineTo(fx, gy);
  c.stroke();
  c.restore();
  if (p3 > 0) {
    const tit = str(q, 'titolo', 'Oggetto');
    const sot = str(q, 'sotto', '');
    const al: CanvasTextAlign = verso > 0 ? 'left' : 'right';
    const bx = fx + verso * 14;
    scrivi(c, tit, bx, gy - 14, { font: `900 50px ${FONT.montserrat}`, colore: '#fff', align: al, alfa: p3 * a, ombra: { blur: 14, colore: 'rgba(0,0,0,.8)' } });
    if (sot) scrivi(c, sot, bx, gy + 40, { font: `600 32px ${FONT.montserrat}`, colore: col, align: al, alfa: p3 * a, ombra: { blur: 10, colore: 'rgba(0,0,0,.8)' } });
  }
}

/** quattro angoli di mirino che si stringono sull'oggetto, girano piano e lampeggiano "AGGANCIATO" */
function aggancio(q: Q) {
  const { c } = q;
  const [x, y] = centro(q);
  const col = str(q, 'colore', '#5dffb4');
  const r0 = 1.1 * num(q, 'dim', 100);
  const st = prog(q.t, 0, 0.7, E.p3out);
  const r = r0 * (1.9 - 0.9 * st);
  const a = resta(q, 0.3);
  c.save();
  c.translate(x, y);
  c.rotate((1 - st) * 0.8 + Math.sin(q.t * 1.3) * 0.05);
  c.strokeStyle = col;
  c.lineWidth = 6;
  c.globalAlpha = a;
  c.shadowColor = hexA(col, 0.8);
  c.shadowBlur = 12;
  const l = r * 0.42;
  for (let i = 0; i < 4; i++) {
    c.save();
    c.rotate((i * Math.PI) / 2);
    c.beginPath();
    c.moveTo(-r, -r + l);
    c.lineTo(-r, -r);
    c.lineTo(-r + l, -r);
    c.stroke();
    c.restore();
  }
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(-18, 0); c.lineTo(18, 0); c.moveTo(0, -18); c.lineTo(0, 18);
  c.stroke();
  c.restore();
  if (st >= 1 && Math.floor(q.t * 3) % 2 === 0) {
    scrivi(c, str(q, 'etichetta', 'AGGANCIATO'), x, y - r0 - 26, { font: `700 34px ${FONT.mono}`, colore: col, align: 'center', alfa: a, spazio: 4 });
  }
}

/** un'emoji (o una parola) grande che rimbalza sopra l'oggetto */
function emoji(q: Q) {
  const { c } = q;
  const [x, y] = centro(q);
  const s = str(q, 'emoji', '😂');
  const dim = num(q, 'dim', 100);
  const ent = prog(q.t, 0, 0.55, E.back(2.2));
  const a = resta(q, 0.3);
  const ond = Math.sin(q.t * 5) * 0.06;
  c.save();
  c.translate(x, y);
  c.rotate(ond);
  c.scale(ent * (1 + Math.sin(q.t * 7) * 0.03), ent);
  c.globalAlpha = a;
  c.font = `${Math.round(2 * dim)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.shadowColor = 'rgba(0,0,0,.45)';
  c.shadowBlur = 20;
  c.fillText(s, 0, 0);
  c.restore();
}

/** un riquadro con gli angoli tondi che si disegna attorno all'oggetto */
function riquadro(q: Q) {
  const { c } = q;
  const [x, y] = centro(q);
  const col = str(q, 'colore', '#ffd54a');
  const lw = 1.5 * num(q, 'dim', 100), lh = 1.1 * num(q, 'dim', 100);
  const p = prog(q.t, 0, 0.8, E.p3out);
  const a = resta(q, 0.3);
  const per = 2 * (2 * lw + 2 * lh);
  c.save();
  c.globalAlpha = a;
  c.strokeStyle = col;
  c.lineWidth = 7;
  c.lineJoin = 'round';
  c.shadowColor = hexA(col, 0.7);
  c.shadowBlur = 12;
  c.setLineDash([per * p, per]);
  c.beginPath();
  c.roundRect(x - lw, y - lh, lw * 2, lh * 2, 24);
  c.stroke();
  c.restore();
  const etichetta = str(q, 'etichetta', '');
  if (etichetta && p >= 1) {
    c.save();
    c.globalAlpha = a * prog(q.t, 0.8, 0.3);
    c.font = `900 34px ${FONT.montserrat}`;
    const w = c.measureText(etichetta).width + 28;
    c.fillStyle = col;
    c.beginPath();
    c.roundRect(x - lw, y - lh - 58, w, 50, 10);
    c.fill();
    c.restore();
    scrivi(c, etichetta, x - lw + 14, y - lh - 22, { font: `900 34px ${FONT.montserrat}`, colore: '#141518', alfa: a * prog(q.t, 0.8, 0.3) });
  }
}

export const OGGETTO: Record<string, (q: Q) => void> = {
  'ob-cerchio': cerchio, 'ob-freccia': freccia, 'ob-etichetta': etichetta, 'ob-aggancio': aggancio, 'ob-emoji': emoji, 'ob-riquadro': riquadro,
};
