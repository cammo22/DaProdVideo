// La sovrimpressione finale: il logo del canale e i sottotitoli, sopra a tutto (dopo gli effetti e il colore
// finale, che non li devono toccare). Si disegna in 2D una tela grande quanto l'uscita e il compositore la
// appoggia sopra; si ridisegna solo quando cambia qualcosa (un'altra riga, un altro logo).
import type { Project, Sottotitolo } from '../core/tipi';
import { masterDi } from '../core/progetto';
import { mediaRT } from '../media/libreria';

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;


/** la riga dei sottotitoli al fotogramma f (se si scrivono nel video) */
export function rigaAl(p: Project, f: number): Sottotitolo | undefined {
  const s = p.sottotitoli;
  if (!s?.nelVideo) return undefined;
  return s.righe.find((r) => r.da <= f && f < r.a && r.testo.trim());
}

/** cosa c'è da disegnare sopra al fotogramma f (null = niente: il compositore salta il passaggio) */
export function firmaSovr(p: Project, f: number, w: number, h: number): string | null {
  const m = masterDi(p);
  const logo = m.logo && mediaRT(m.logo.media)?.image ? m.logo : null;
  const riga = rigaAl(p, f);
  if (!logo && !riga) return null;
  const s = p.sottotitoli;
  return JSON.stringify([w, h, logo, riga?.testo ?? null, s ? [s.dimensione, s.fascia, s.alto] : null]);
}

/** va a capo perché ogni riga stia nella larghezza */
function aCapo(ctx: Ctx2D, testo: string, max: number): string[] {
  const out: string[] = [];
  for (const par of testo.split('\n')) {
    let riga = '';
    for (const parola of par.split(/\s+/)) {
      const prova = riga ? riga + ' ' + parola : parola;
      if (ctx.measureText(prova).width > max && riga) { out.push(riga); riga = parola; } else riga = prova;
    }
    if (riga) out.push(riga);
  }
  return out.slice(0, 4);
}

export function disegnaSovr(ctx: Ctx2D, p: Project, f: number, W: number, H: number) {
  ctx.clearRect(0, 0, W, H);
  const m = masterDi(p);
  const img = m.logo ? mediaRT(m.logo.media)?.image : undefined;
  if (m.logo && img) {
    const lw = W * Math.max(0.03, Math.min(0.5, m.logo.scala));
    const lh = lw * (img.height / Math.max(1, img.width));
    const mg = Math.round(Math.min(W, H) * 0.04);
    const x = m.logo.pos.endsWith('dx') ? W - mg - lw : mg;
    const y = m.logo.pos.startsWith('alto') ? mg : H - mg - lh;
    ctx.globalAlpha = Math.max(0, Math.min(1, m.logo.opacita));
    ctx.drawImage(img, x, y, lw, lh);
    ctx.globalAlpha = 1;
  }
  const riga = rigaAl(p, f);
  const s = p.sottotitoli;
  if (riga && s) {
    const size = Math.max(10, (s.dimensione || 46) * (H / 1080));
    ctx.font = `700 ${size}px "Rajdhani", "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    const righe = aCapo(ctx, riga.testo, W * 0.84);
    const lh = size * 1.22;
    const tot = righe.length * lh;
    const y0 = s.alto ? H * 0.07 + lh / 2 : H * 0.93 - tot + lh / 2;
    if (s.fascia) {
      const larga = Math.max(...righe.map((r) => ctx.measureText(r).width));
      const pad = size * 0.35;
      ctx.fillStyle = 'rgba(0,0,0,.58)';
      ctx.beginPath();
      ctx.roundRect(W / 2 - larga / 2 - pad, y0 - lh / 2 - pad * 0.5, larga + pad * 2, tot + pad, size * 0.2);
      ctx.fill();
    }
    righe.forEach((r, i) => {
      const y = y0 + i * lh;
      ctx.lineWidth = size * 0.14;
      ctx.strokeStyle = 'rgba(0,0,0,.85)';
      ctx.strokeText(r, W / 2, y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(r, W / 2, y);
    });
  }
}
