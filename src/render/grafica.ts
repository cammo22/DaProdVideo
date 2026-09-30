// La titolatrice e il countdown: disegnati in 2D su una tela e poi passati al compositore come immagine.
import type { TitleSpec } from '../core/tipi';

type Tela = HTMLCanvasElement | OffscreenCanvas;
type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function nuovaTela(w: number, h: number): Tela {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

const dolceT = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
const casuale = (x: number) => { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** la lettera che cade e rimbalza (0 in alto, 1 a terra) */
const rimbalzoLettera = (x: number) => {
  if (x < 1 / 2.75) return 7.5625 * x * x;
  if (x < 2 / 2.75) { x -= 1.5 / 2.75; return 7.5625 * x * x + 0.75; }
  if (x < 2.5 / 2.75) { x -= 2.25 / 2.75; return 7.5625 * x * x + 0.9375; }
  x -= 2.625 / 2.75;
  return 7.5625 * x * x + 0.984375;
};
/** un colore mescolato con un altro (k = quanto del secondo) */
function mescola(a: string, b: string, k: number): string {
  const n = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) || 0);
  const x = n(a), y = n(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
}

const cacheTitoli = new Map<string, { tela: Tela; w: number; h: number }>();

/**
 * Disegna un titolo. Per "rullo" la tela è alta quanto il testo più uno schermo, per "crawl" larga quanto
 * il testo più uno schermo: il movimento lo fa il compositore spostando l'immagine.
 */
export function telaTitolo(spec: TitleSpec, W: number, H: number): { tela: Tela; w: number; h: number } {
  const key = JSON.stringify(spec) + W + 'x' + H;
  const hit = cacheTitoli.get(key);
  if (hit) return hit;
  if (cacheTitoli.size > 40) cacheTitoli.delete(cacheTitoli.keys().next().value!);
  const size = Math.max(8, spec.size * (H / 1080));
  const st = spec.style;
  // il cinema: maiuscole, lettere larghe e sottili (anche il grande, l'etichetta e il glitch sono in maiuscolo)
  const testo = st === 'cinema' || st === 'grande' || st === 'etichetta' || st === 'glitch' ? spec.text.toUpperCase() : spec.text;
  const sotto = (spec.sotto ?? '').trim();
  const lines = testo.split('\n');
  const lineH = size * (st === 'citazione' ? 1.35 : st === 'grande' ? 1.0 : 1.2);
  const peso = spec.peso ?? (st === 'cinema' ? 500 : st === 'grande' ? 900 : st === 'social' || st === 'rimbalzo' || st === 'etichetta' || st === 'glitch' || st === 'estruso' || st === 'ombraLunga' ? 800 : 700);
  const famiglia = st === 'macchina' ? '"Share Tech Mono", "Courier New", monospace' : st === 'citazione' ? 'Georgia, "Times New Roman", serif'
    : `"${spec.font}", "Rajdhani", "Segoe UI", sans-serif`;
  const font = `${st === 'citazione' ? 'italic ' : ''}${peso} ${size}px ${famiglia}`;
  const spazio = (st === 'cinema' ? size * 0.32 : 0) + size * (spec.spaziatura ?? 0);
  const misura = nuovaTela(8, 8).getContext('2d') as Ctx2D;
  misura.font = font;
  const larga = (l: string) => misura.measureText(l).width + spazio * Math.max(0, l.length - 1);
  // la macchina da scrivere misura il testo intero: le lettere compaiono al loro posto, senza spostare le altre
  const intere = st === 'macchina' && spec.intero ? spec.intero.split('\n') : lines;
  const textW = Math.max(...intere.map(larga), 1);
  const textH = lines.length * lineH;
  let w = W, h = H;
  if (spec.style === 'rullo') h = Math.ceil(textH + H * 0.2);
  if (spec.style === 'crawl') w = Math.ceil(textW + size);
  const tela = nuovaTela(w, h);
  const ctx = tela.getContext('2d') as Ctx2D;
  ctx.font = font;
  if (spazio && 'letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = spazio + 'px';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const pad = size * 0.35;
  let x0: number, y0: number;
  if (spec.style === 'rullo') { y0 = H * 0.1 + lineH / 2; }
  else if (spec.style === 'crawl') { y0 = h * spec.y; }
  else if (spec.style === 'sottopancia' || st === 'notiziario') { y0 = H * 0.82 - textH / 2 + lineH / 2; }
  else { y0 = H * spec.y - (textH + (sotto ? size * 0.62 : 0)) / 2 + lineH / 2; }
  const align = spec.style === 'crawl' || st === 'macchina' ? 'left' : (spec.style === 'sottopancia' || st === 'social' || st === 'notiziario') && spec.align === 'center' ? 'left' : spec.align;
  ctx.textAlign = align as CanvasTextAlign;
  if (spec.style === 'crawl') x0 = size / 2;
  else if (st === 'macchina' && spec.align === 'center') x0 = (W - textW) / 2;
  else if (align === 'left') x0 = spec.style === 'sottopancia' || st === 'social' || st === 'notiziario' ? W * 0.08 : W * 0.1;
  else if (align === 'right') x0 = W * 0.9;
  else x0 = W / 2;
  // sottopancia: la fascia colorata sotto al nome, come nei TG
  if (spec.style === 'sottopancia') {
    const bw = textW + pad * 4, bh = textH + pad * 1.6;
    const by = y0 - lineH / 2 - pad * 0.8;
    const g = ctx.createLinearGradient(x0 - pad * 2, 0, x0 - pad * 2 + bw, 0);
    g.addColorStop(0, spec.boxColor.length > 7 ? spec.boxColor : spec.boxColor + 'dd');
    g.addColorStop(1, '#00000000');
    ctx.fillStyle = g;
    ctx.fillRect(x0 - pad * 2, by, bw, bh);
    ctx.fillStyle = '#ffd54a';
    ctx.fillRect(x0 - pad * 2, by, size * 0.12, bh);
  } else if (st === 'social') {
    // la fascia piena coi bordi appena tondi, come nei video dei social
    const bw = textW + pad * 3, bh = textH + pad * 1.4;
    const by = y0 - lineH / 2 - pad * 0.7;
    ctx.fillStyle = spec.boxColor.length === 7 ? spec.boxColor : spec.boxColor.slice(0, 7);
    ctx.beginPath();
    ctx.roundRect(x0 - pad * 1.5, by, bw, bh, size * 0.18);
    ctx.fill();
  } else if (st === 'citazione') {
    // le virgolette grandi e una riga sottile sotto
    ctx.save();
    ctx.fillStyle = spec.color;
    ctx.globalAlpha = 0.35;
    ctx.font = `700 ${size * 3}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('“', align === 'center' ? x0 - textW / 2 - size * 0.4 : x0 - size * 0.6, y0 - size * 0.2);
    ctx.globalAlpha = 0.6;
    ctx.fillRect(align === 'center' ? x0 - textW * 0.2 : x0, y0 + textH - lineH / 2 + size * 0.35, textW * 0.4, Math.max(1, size * 0.04));
    ctx.restore();
  } else if (st === 'etichetta') {
    // l'etichetta: la pillola piena col puntino, come i badge "NUOVO" dei social
    const bw = textW + pad * 3.4, bh = textH + pad * 1.2;
    const bx = align === 'left' ? x0 - pad * 2.2 : align === 'right' ? x0 - textW - pad * 1.2 : x0 - textW / 2 - pad * 2.2;
    const by = y0 - lineH / 2 - pad * 0.6;
    ctx.fillStyle = spec.boxColor.slice(0, 7);
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, bh / 2); ctx.fill();
    ctx.fillStyle = '#ff3df2';
    ctx.beginPath(); ctx.arc(bx + pad * 1.1, by + bh / 2, size * 0.16, 0, Math.PI * 2); ctx.fill();
    if (align === 'left') x0 += pad * 0.6; else if (align === 'center') x0 += pad * 0.6;
  } else if (st === 'grande') {
    // due righe sottili sopra e sotto, larghe come il testo
    ctx.fillStyle = spec.color;
    const lx = align === 'left' ? x0 : align === 'right' ? x0 - textW : x0 - textW / 2;
    const sp = Math.max(1, size * 0.03);
    ctx.fillRect(lx, y0 - lineH / 2 - size * 0.12, textW, sp);
    ctx.fillRect(lx, y0 + textH - lineH / 2 + size * 0.1, textW, sp);
  } else if (spec.box) {
    ctx.fillStyle = spec.boxColor;
    const bx = align === 'left' ? x0 - pad : align === 'right' ? x0 - textW - pad : x0 - textW / 2 - pad;
    ctx.fillRect(bx, y0 - lineH / 2 - pad / 2, textW + pad * 2, textH + pad);
  }
  const pr = Math.max(0, Math.min(1, spec.rivela ?? 1));
  const accento = spec.boxColor.slice(0, 7);
  const sx0 = align === 'left' ? x0 : align === 'right' ? x0 - textW : x0 - textW / 2;
  if (st === 'evidenzia') {
    // il pennarello: una barra colorata dietro le lettere, che si stende da sinistra
    ctx.fillStyle = accento;
    ctx.globalAlpha = 0.9;
    lines.forEach((l, i) => ctx.fillRect(sx0 - size * 0.15, y0 + i * lineH - lineH * 0.42, (larga(l) + size * 0.3) * pr, lineH * 0.8));
    ctx.globalAlpha = 1;
  }
  if (st === 'notiziario') {
    // due targhe: la prima riga su fondo pieno, la seconda su una fascia scura, come nei telegiornali
    lines.forEach((l, i) => {
      const bw = larga(l) + pad * 2.4, by = y0 + i * lineH - lineH / 2 - pad * 0.2;
      ctx.fillStyle = i === 0 ? accento : '#101218ee';
      ctx.fillRect(sx0 - pad * 1.2, by, bw, lineH + pad * 0.4);
      if (i === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(sx0 - pad * 1.2, by + lineH + pad * 0.4, bw, Math.max(2, size * 0.05)); }
    });
  }
  // "rivela": il testo si scopre da sinistra, dietro una barra colorata che scorre
  const sinistra = align === 'left' ? x0 : align === 'right' ? x0 - textW : x0 - textW / 2;
  if (st === 'rivela') {
    const r = Math.max(0, Math.min(1, spec.rivela ?? 1));
    ctx.save();
    ctx.beginPath();
    ctx.rect(sinistra - size, y0 - lineH, (textW + size) * r + size * 0.2, textH + lineH);
    ctx.clip();
  }
  lines.forEach((l, i) => {
    const y = y0 + i * lineH;
    if (st === 'cascata' || st === 'assembla' || st === 'onda') {
      // lettera per lettera: ognuna ha il suo tempo (cadono, arrivano da lontano, ondeggiano)
      ctx.textAlign = 'left';
      const n = l.length;
      for (let k = 0; k < n; k++) {
        const xk = sx0 + misura.measureText(l.slice(0, k)).width + spazio * k;
        let dx = 0, dy = 0, al = 1, rot = 0;
        if (st === 'cascata') {
          const tk = Math.max(0, Math.min(1, (pr * (n + 3) - k) / 3));
          dy = -(1 - rimbalzoLettera(tk)) * size * 1.7;
          al = Math.min(1, tk * 4);
        } else if (st === 'assembla') {
          const h1 = casuale(k * 3.1 + i), h2 = casuale(k * 7.7 + i + 1), h3 = casuale(k * 1.3 + 5);
          const e = dolceT(pr * 1.5 - h3 * 0.5);
          dx = (h1 - 0.5) * W * 0.6 * (1 - e); dy = (h2 - 0.5) * H * 0.7 * (1 - e); rot = (h1 - 0.5) * 3 * (1 - e);
          al = Math.min(1, e * 2);
        } else dy = Math.sin((spec.rivela ?? 0) * 4.2 + k * 0.55) * size * 0.14;
        if (al <= 0.01) continue;
        const wk = misura.measureText(l[k]).width;
        ctx.save();
        ctx.globalAlpha = al;
        ctx.translate(xk + wk / 2 + dx, y + dy);
        ctx.rotate(rot);
        if (spec.shadow) { ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = size * 0.1; ctx.shadowOffsetY = size * 0.05; }
        if (spec.outline && spec.outline !== 'none') { ctx.strokeStyle = spec.outline; ctx.lineWidth = Math.max(1, size * 0.07); ctx.strokeText(l[k], -wk / 2, 0); }
        ctx.fillStyle = spec.color;
        ctx.fillText(l[k], -wk / 2, 0);
        ctx.restore();
      }
      ctx.textAlign = align as CanvasTextAlign;
      return;
    }
    if (st === 'estruso') {
      // le lettere hanno spessore: tante copie in fila, sempre più scure, e la faccia davanti
      const prof = Math.max(4, Math.round(size * 0.16));
      for (let k = prof; k >= 1; k--) {
        ctx.fillStyle = mescola(accento, '#000000', 0.15 + 0.55 * (k / prof));
        ctx.fillText(l, x0 + k * size * 0.008, y + k * size * 0.010);
      }
      ctx.fillStyle = spec.color;
      ctx.fillText(l, x0, y);
      return;
    }
    if (st === 'ombraLunga') {
      // l'ombra lunga in diagonale, che sfuma
      const lun = Math.round(size * 0.7);
      for (let k = lun; k >= 1; k--) {
        ctx.fillStyle = accento;
        ctx.globalAlpha = 0.85 * (1 - k / (lun + 4));
        ctx.fillText(l, x0 + k * 0.72, y + k * 0.72);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = spec.color;
      ctx.fillText(l, x0, y);
      return;
    }
    if (st === 'contorno') {
      // solo il filo delle lettere, con un velo di colore dentro
      ctx.strokeStyle = spec.color;
      ctx.lineWidth = Math.max(2, size * 0.035);
      ctx.strokeText(l, x0, y);
      ctx.globalAlpha = 0.18 + 0.4 * pr;
      ctx.fillStyle = spec.color;
      ctx.fillText(l, x0, y);
      ctx.globalAlpha = 1;
      return;
    }
    if (st === 'karaoke') {
      // il testo spento, e sopra quello acceso che avanza da sinistra
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = spec.color;
      ctx.fillText(l, x0, y);
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.beginPath();
      ctx.rect(sx0 - size, y - lineH, (larga(l) + size * 0.3) * pr + size, lineH * 2);
      ctx.clip();
      ctx.shadowColor = accento; ctx.shadowBlur = size * 0.25;
      ctx.fillStyle = accento;
      ctx.fillText(l, x0, y);
      ctx.restore();
      return;
    }
    if (st === 'notiziario') {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(l, x0, y);
      return;
    }
    if (st === 'gradiente') {
      // le lettere sfumano da un colore all'altro, con l'alone del secondo
      const g = ctx.createLinearGradient(sinistra, y - size / 2, sinistra + textW, y + size / 2);
      g.addColorStop(0, spec.color);
      g.addColorStop(1, spec.boxColor.slice(0, 7));
      ctx.save();
      ctx.shadowColor = spec.boxColor.slice(0, 7);
      ctx.shadowBlur = size * 0.35;
      ctx.fillStyle = g;
      ctx.fillText(l, x0, y);
      ctx.restore();
      ctx.fillStyle = g;
      ctx.fillText(l, x0, y);
      return;
    }
    if (st === 'glitch') {
      // rosso e azzurro sfasati, poi il bianco sopra
      const o = size * 0.045;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = '#ff2050'; ctx.fillText(l, x0 - o, y + o * 0.3);
      ctx.fillStyle = '#20e0ff'; ctx.fillText(l, x0 + o, y - o * 0.3);
      ctx.restore();
      ctx.fillStyle = spec.color;
      ctx.globalAlpha = 0.9;
      ctx.fillText(l, x0, y);
      ctx.globalAlpha = 1;
      // una fetta spostata, come una riga che salta
      const fy = y - size * 0.1;
      ctx.save();
      ctx.beginPath(); ctx.rect(sinistra - size, fy, textW + size * 2, size * 0.12); ctx.clip();
      ctx.clearRect(sinistra - size, fy, textW + size * 2, size * 0.12);
      ctx.fillStyle = spec.color;
      ctx.fillText(l, x0 + size * 0.12, y);
      ctx.restore();
      return;
    }
    if (st === 'neon') {
      // il tubo al neon: tre aloni del colore e il filo quasi bianco in mezzo
      ctx.save();
      ctx.shadowColor = spec.color;
      for (const b of [size * 0.6, size * 0.3, size * 0.12]) {
        ctx.shadowBlur = b;
        ctx.fillStyle = spec.color;
        ctx.fillText(l, x0, y);
      }
      ctx.restore();
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.85;
      ctx.fillText(l, x0, y);
      ctx.globalAlpha = 1;
      return;
    }
    if (st === 'macchina' && i === lines.length - 1 && spec.intero && spec.intero !== spec.text) {
      // il cursore che lampeggia dopo l'ultima lettera
      ctx.fillStyle = spec.color;
      ctx.fillRect(x0 + larga(l) + size * 0.08, y - size * 0.42, size * 0.5, size * 0.84);
    }
    if (spec.shadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.75)';
      ctx.shadowBlur = size * 0.12;
      ctx.shadowOffsetX = size * 0.05;
      ctx.shadowOffsetY = size * 0.06;
      ctx.fillStyle = spec.color;
      ctx.fillText(l, x0, y);
      ctx.restore();
    }
    if (spec.outline && spec.outline !== 'none') {
      ctx.strokeStyle = spec.outline;
      ctx.lineWidth = Math.max(1, size * 0.07);
      ctx.strokeText(l, x0, y);
    }
    ctx.fillStyle = spec.color;
    ctx.fillText(l, x0, y);
  });
  if (sotto) {
    // la riga piccola sotto il titolo
    const ss = size * 0.42;
    ctx.save();
    ctx.font = `500 ${ss}px ${famiglia}`;
    if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = size * 0.04 + 'px';
    ctx.textAlign = align as CanvasTextAlign;
    ctx.fillStyle = spec.color;
    ctx.globalAlpha = 0.85;
    if (spec.shadow) { ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = size * 0.08; ctx.shadowOffsetY = size * 0.03; }
    sotto.split('\n').forEach((r, k) => ctx.fillText(r, x0, y0 + lines.length * lineH - lineH / 2 + ss * 0.9 + k * ss * 1.25));
    ctx.restore();
  }
  if (st === 'rivela') {
    ctx.restore();
    const r = Math.max(0, Math.min(1, spec.rivela ?? 1));
    // la barra: corre davanti al testo e poi esce a destra
    if (r < 1) {
      ctx.fillStyle = spec.boxColor.slice(0, 7);
      ctx.fillRect(sinistra - size * 0.2 + (textW + size * 0.4) * r, y0 - lineH / 2 - size * 0.1, size * 0.28, textH + size * 0.2);
    }
  }
  const r = { tela, w, h };
  cacheTitoli.set(key, r);
  return r;
}

/** la macchina da scrivere: il testo fino alla lettera che si vede al tempo t (una lettera ogni 1/18 di secondo) */
export function specAlTempo(spec: TitleSpec, t: number): TitleSpec {
  const n = spec.text.replace(/\n/g, '').length;
  const a = (d: number) => Math.min(1, Math.round((t / d) * 30) / 30);
  // "rivela": in 0,8 secondi il testo si scopre (a scatti di 1/30, così la cache dei titoli regge)
  switch (spec.style) {
    case 'rivela': { const r = a(0.8); return r >= 1 ? spec : { ...spec, rivela: r }; }
    case 'evidenzia': { const r = a(0.7); return r >= 1 ? spec : { ...spec, rivela: r }; }
    case 'contorno': { const r = a(1.2); return r >= 1 ? spec : { ...spec, rivela: r }; }
    case 'cascata': { const r = a(0.05 * n + 0.7); return r >= 1 ? spec : { ...spec, rivela: r }; }
    case 'assembla': { const r = a(1.3); return r >= 1 ? spec : { ...spec, rivela: r }; }
    case 'karaoke': { const r = a(Math.max(1, 0.09 * n + 0.5)); return { ...spec, rivela: r }; }
    // l'onda non finisce mai: la fase è il tempo (a scatti di 1/30)
    case 'onda': return { ...spec, rivela: Math.round(t * 30) / 30 };
  }
  if (spec.style !== 'macchina') return spec;
  const k = Math.max(0, Math.floor(t * 18));
  return k >= spec.text.length ? spec : { ...spec, text: spec.text.slice(0, k), intero: spec.text };
}

const dolce = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
const salto = (x: number) => { const t = Math.max(0, Math.min(1, x)) - 1; return 1 + 2.7 * t * t * t + 1.7 * t * t; };

/** spostamento, grandezza e trasparenza del titolo animato al tempo locale t su una durata d (pixel del progetto):
 *  il modo del suo stile, più come entra e come esce (qualunque stile) */
export function motoTitolo(spec: TitleSpec, w: number, h: number, W: number, H: number, t: number, d: number): { dx: number; dy: number; scala?: number; alfa?: number } {
  const b = motoStile(spec, w, h, W, H, t, d);
  if (!spec.ingresso && !spec.uscita) return b;
  let { dx, dy } = b, sc = b.scala ?? 1, al = b.alfa ?? 1;
  const app = (tipo: string, u: number, entrata: boolean) => {
    const e = dolce(u), inv = 1 - e;
    switch (tipo) {
      case 'dissolve': al *= e; break;
      case 'sale': dy += H * 0.12 * inv * (entrata ? 1 : -1); al *= e; break;
      case 'scende': dy -= H * 0.12 * inv * (entrata ? 1 : -1); al *= e; break;
      case 'sinistra': dx -= W * 0.5 * inv; al *= Math.min(1, e * 2); break;
      case 'destra': dx += W * 0.5 * inv; al *= Math.min(1, e * 2); break;
      case 'zoom': sc *= entrata ? 0.55 + 0.45 * e : 1 + 0.5 * inv; al *= e; break;
      case 'rimbalza': sc *= Math.max(0.001, salto(u)); break;
    }
  };
  if (spec.ingresso && t < 0.7) app(spec.ingresso, t / 0.7, true);
  if (spec.uscita && d - t < 0.7) app(spec.uscita, Math.max(0, (d - t) / 0.7), false);
  return { dx, dy, scala: sc, alfa: al };
}

function motoStile(spec: TitleSpec, w: number, h: number, W: number, H: number, t: number, d: number): { dx: number; dy: number; scala?: number; alfa?: number } {
  const k = d > 0 ? Math.min(1, Math.max(0, t / d)) : 0;
  const resta = d - t;
  const entra = (s: number) => dolce(t / s), esce = (s: number) => dolce(resta / s);
  switch (spec.style) {
    case 'neon': {
      // si accende a scatti come un'insegna, poi resta; si spegne alla fine
      const scatti = t < 0.7 ? ([0.08, 0.16, 0.3, 0.38, 0.55].filter((x) => t > x).length % 2 ? 0.25 : 1) : 1;
      return { dx: 0, dy: 0, alfa: Math.min(t < 0.7 ? scatti : 1, esce(0.35)) };
    }
    case 'cinema': return { dx: 0, dy: 0, scala: 1 + 0.08 * k, alfa: Math.min(entra(0.9), esce(0.9)) };
    case 'rimbalzo': return { dx: 0, dy: 0, scala: Math.max(0.001, Math.min(salto(t / 0.45), resta < 0.3 ? dolce(resta / 0.3) : 1)) };
    case 'social': return { dx: -W * 0.7 * (1 - Math.min(entra(0.35), esce(0.3))), dy: 0 };
    case 'notiziario': return { dx: -W * 0.6 * (1 - Math.min(entra(0.45), esce(0.35))), dy: 0 };
    case 'ombraLunga': return { dx: 0, dy: H * 0.02 * (1 - entra(0.6)), alfa: Math.min(entra(0.6), esce(0.5)) };
    case 'estruso': return { dx: 0, dy: 0, scala: 0.8 + 0.2 * entra(0.5), alfa: Math.min(entra(0.35), esce(0.4)) };
    case 'contorno': return { dx: 0, dy: 0, alfa: Math.min(entra(0.4), esce(0.5)) };
    case 'karaoke': return { dx: 0, dy: 0, alfa: Math.min(entra(0.3), esce(0.4)) };
    case 'citazione': return { dx: 0, dy: H * 0.03 * (1 - entra(0.8)), alfa: Math.min(entra(0.8), esce(0.7)) };
    case 'gradiente': return { dx: 0, dy: H * 0.04 * (1 - entra(0.7)), alfa: Math.min(entra(0.7), esce(0.6)) };
    case 'etichetta': return { dx: -W * 0.03 * (1 - entra(0.3)), dy: 0, scala: Math.max(0.001, Math.min(salto(t / 0.35), resta < 0.25 ? dolce(resta / 0.25) : 1)) };
    case 'rivela': return { dx: 0, dy: 0, alfa: esce(0.5) };
    case 'grande': return { dx: 0, dy: 0, scala: 1.12 - 0.12 * dolce(t / 1.1), alfa: Math.min(entra(0.5), esce(0.6)) };
    case 'glitch': {
      // salta a scatti all'inizio e ogni tanto dopo, con qualche lampo di buio
      const scatto = Math.floor(t * 14);
      const caso = (x: number) => { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
      const salta = t < 0.6 || caso(scatto) > 0.86;
      return { dx: salta ? (caso(scatto + 3) - 0.5) * W * 0.03 : 0, dy: salta ? (caso(scatto + 7) - 0.5) * H * 0.01 : 0, alfa: Math.min(t < 0.5 && scatto % 3 === 1 ? 0.3 : 1, esce(0.3)) };
    }
  }
  if (spec.style === 'rullo') {
    // parte da sotto lo schermo e finisce fuori in alto
    const from = H / 2 + h / 2, to = -H / 2 - h / 2;
    return { dx: 0, dy: from + (to - from) * k };
  }
  if (spec.style === 'crawl') {
    const from = W / 2 + w / 2, to = -W / 2 - w / 2;
    return { dx: from + (to - from) * k, dy: 0 };
  }
  return { dx: 0, dy: 0 };
}

let telaCountdown: Tela | null = null;

export type StileConto = 'pellicola' | 'moderno' | 'neon' | 'minimal';
export const STILI_CONTO: { id: StileConto; nome: string; secondi: number }[] = [
  { id: 'pellicola', nome: 'Pellicola', secondi: 5 },
  { id: 'moderno', nome: 'Moderno', secondi: 5 },
  { id: 'neon', nome: 'Neon', secondi: 3 },
  { id: 'minimal', nome: 'Minimal', secondi: 10 },
];

/**
 * Il countdown: da N a 1, un numero al secondo, e finisce col suo ultimo fotogramma.
 * Pellicola = la coda del cinema (settori che girano, croce, cerchi, graffi); moderno = anello che si svuota;
 * neon = anello luminoso che pulsa; minimal = numero nero su bianco che respira.
 */
/** il numero del countdown al secondo t (N..1: l'ultimo secondo è 1, poi finisce) */
export const numeroConto = (t: number, durata: number) => Math.max(1, Math.ceil(Math.max(1e-3, durata - t) - 1e-6));

export function disegnaCountdown(W: number, H: number, t: number, durata: number, stile: StileConto = 'pellicola'): Tela {
  const w = Math.min(W, 1280), h = Math.round(w * H / W);
  if (!telaCountdown || telaCountdown.width !== w || telaCountdown.height !== h) telaCountdown = nuovaTela(w, h);
  const ctx = telaCountdown.getContext('2d') as Ctx2D;
  const restante = Math.max(1e-3, durata - t);
  // il numero di adesso (N..1) e quanto manca al prossimo (1 → 0 dentro il secondo)
  const n = numeroConto(t, durata);
  const fraz = Math.max(0, Math.min(1, restante - (n - 1)));
  const dentro = 1 - fraz; // 0 → 1 dentro il secondo
  const cx = w / 2, cy = h / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (stile === 'pellicola') {
    const R = Math.hypot(w, h);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#6b6b6b';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const a0 = -Math.PI / 2;
    ctx.arc(cx, cy, R, a0, a0 + dentro * Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f2f2f2';
    ctx.lineWidth = Math.max(2, h / 180);
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();
    for (const r of [h * 0.36, h * 0.43]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = '#f2f2f2';
    ctx.font = `700 ${h * 0.5}px "Orbitron", "Rajdhani", sans-serif`;
    ctx.fillText(String(n), cx, cy + h * 0.02);
    // graffi e polvere: un po' di pellicola vera
    const seme = Math.floor(t * 24);
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < 6; i++) {
      const x = ((Math.sin(seme * 12.9898 + i * 78.233) * 43758.5453) % 1 + 1) % 1 * w;
      const y = ((Math.sin(seme * 93.9898 + i * 11.233) * 23421.631) % 1 + 1) % 1 * h;
      ctx.fillRect(x, y, 2, 2 + (i % 3) * 3);
    }
  } else if (stile === 'moderno') {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(cx, cy));
    g.addColorStop(0, '#1d2433'); g.addColorStop(1, '#07080c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const r = h * 0.3;
    ctx.lineWidth = h * 0.018;
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // l'anello si svuota nel secondo
    ctx.strokeStyle = '#ffd54a';
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + fraz * Math.PI * 2); ctx.stroke();
    // il numero entra un po' più grande e si posa
    const k = 1 + 0.25 * Math.pow(1 - Math.min(1, dentro * 4), 3);
    ctx.globalAlpha = Math.min(1, dentro * 6);
    ctx.fillStyle = '#ffffff';
    ctx.font = `200 ${h * 0.34 * k}px "Rajdhani", "Segoe UI", sans-serif`;
    ctx.fillText(String(n), cx, cy + h * 0.015);
  } else if (stile === 'neon') {
    ctx.fillStyle = '#05030a';
    ctx.fillRect(0, 0, w, h);
    const r = h * 0.32 * (1 + 0.04 * Math.sin(dentro * Math.PI));
    const col = ['#35e8ff', '#ff3df2', '#ffd54a'][n % 3];
    ctx.shadowColor = col;
    ctx.shadowBlur = h * 0.06;
    ctx.lineWidth = h * 0.012;
    ctx.strokeStyle = col;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = h * 0.006;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, -Math.PI / 2, -Math.PI / 2 + dentro * Math.PI * 2); ctx.stroke();
    // il numero si accende tremando, come un'insegna
    const trema = dentro < 0.12 ? (Math.sin(t * 90) > 0 ? 1 : 0.35) : 1;
    ctx.globalAlpha = trema;
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = h * 0.08;
    ctx.font = `800 ${h * 0.38}px "Orbitron", "Rajdhani", sans-serif`;
    ctx.fillText(String(n), cx, cy + h * 0.02);
  } else {
    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, w, h);
    // il numero respira: entra grande e trasparente, si posa, poi sparisce
    const k = 1.15 - 0.15 * Math.min(1, dentro * 3);
    ctx.globalAlpha = Math.min(1, dentro * 5) * Math.min(1, fraz * 5);
    ctx.fillStyle = '#111111';
    ctx.font = `300 ${h * 0.42 * k}px "Rajdhani", "Segoe UI", sans-serif`;
    ctx.fillText(String(n), cx, cy + h * 0.02);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#111111';
    ctx.fillRect(w * 0.3, h * 0.8, w * 0.4 * fraz, Math.max(2, h * 0.006));
  }
  ctx.restore();
  return telaCountdown;
}
