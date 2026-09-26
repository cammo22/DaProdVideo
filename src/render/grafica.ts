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
  // il cinema: maiuscole, lettere larghe e sottili
  const testo = st === 'cinema' ? spec.text.toUpperCase() : spec.text;
  const lines = testo.split('\n');
  const lineH = size * (st === 'citazione' ? 1.35 : 1.2);
  const peso = st === 'cinema' ? 500 : st === 'social' || st === 'rimbalzo' ? 800 : 700;
  const famiglia = st === 'macchina' ? '"Share Tech Mono", "Courier New", monospace' : st === 'citazione' ? 'Georgia, "Times New Roman", serif'
    : `"${spec.font}", "Rajdhani", "Segoe UI", sans-serif`;
  const font = `${st === 'citazione' ? 'italic ' : ''}${peso} ${size}px ${famiglia}`;
  const spazio = st === 'cinema' ? size * 0.32 : 0;
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
  else if (spec.style === 'sottopancia') { y0 = H * 0.82 - textH / 2 + lineH / 2; }
  else { y0 = H * spec.y - textH / 2 + lineH / 2; }
  const align = spec.style === 'crawl' || st === 'macchina' ? 'left' : (spec.style === 'sottopancia' || st === 'social') && spec.align === 'center' ? 'left' : spec.align;
  ctx.textAlign = align as CanvasTextAlign;
  if (spec.style === 'crawl') x0 = size / 2;
  else if (st === 'macchina' && spec.align === 'center') x0 = (W - textW) / 2;
  else if (align === 'left') x0 = spec.style === 'sottopancia' || st === 'social' ? W * 0.08 : W * 0.1;
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
  } else if (spec.box) {
    ctx.fillStyle = spec.boxColor;
    const bx = align === 'left' ? x0 - pad : align === 'right' ? x0 - textW - pad : x0 - textW / 2 - pad;
    ctx.fillRect(bx, y0 - lineH / 2 - pad / 2, textW + pad * 2, textH + pad);
  }
  lines.forEach((l, i) => {
    const y = y0 + i * lineH;
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
  const r = { tela, w, h };
  cacheTitoli.set(key, r);
  return r;
}

/** la macchina da scrivere: il testo fino alla lettera che si vede al tempo t (una lettera ogni 1/18 di secondo) */
export function specAlTempo(spec: TitleSpec, t: number): TitleSpec {
  if (spec.style !== 'macchina') return spec;
  const n = Math.max(0, Math.floor(t * 18));
  return n >= spec.text.length ? spec : { ...spec, text: spec.text.slice(0, n), intero: spec.text };
}

const dolce = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
const salto = (x: number) => { const t = Math.max(0, Math.min(1, x)) - 1; return 1 + 2.7 * t * t * t + 1.7 * t * t; };

/** spostamento, grandezza e trasparenza del titolo animato al tempo locale t su una durata d (pixel del progetto) */
export function motoTitolo(spec: TitleSpec, w: number, h: number, W: number, H: number, t: number, d: number): { dx: number; dy: number; scala?: number; alfa?: number } {
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
    case 'citazione': return { dx: 0, dy: H * 0.03 * (1 - entra(0.8)), alfa: Math.min(entra(0.8), esce(0.7)) };
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

/** il countdown da pellicola (academy leader): settori che girano, numeri da N a 2, croce e cerchi */
export function disegnaCountdown(W: number, H: number, t: number, durata: number): Tela {
  const w = Math.min(W, 1280), h = Math.round(w * H / W);
  if (!telaCountdown || telaCountdown.width !== w || telaCountdown.height !== h) telaCountdown = nuovaTela(w, h);
  const ctx = telaCountdown.getContext('2d') as Ctx2D;
  const restante = Math.max(0, durata - t);
  const n = Math.ceil(restante - 1e-6);
  const fraz = restante - Math.floor(restante - 1e-6) ; // 1 -> 0 dentro il secondo
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, w, h);
  if (n <= 1) {
    // l'ultimo secondo è nero, come sulla pellicola dopo il "2"
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    return telaCountdown;
  }
  const cx = w / 2, cy = h / 2, R = Math.hypot(w, h);
  // settore che gira
  ctx.fillStyle = '#6b6b6b';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  const a0 = -Math.PI / 2;
  ctx.arc(cx, cy, R, a0, a0 + (1 - fraz) * Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  // croce e cerchi
  ctx.strokeStyle = '#f2f2f2';
  ctx.lineWidth = Math.max(2, h / 180);
  ctx.beginPath();
  ctx.moveTo(0, cy); ctx.lineTo(w, cy);
  ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
  ctx.stroke();
  for (const r of [h * 0.36, h * 0.43]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#f2f2f2';
  ctx.font = `700 ${h * 0.5}px "Orbitron", "Rajdhani", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), cx, cy + h * 0.02);
  // graffi e polvere: un po' di pellicola vera
  const seme = Math.floor(t * 24);
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  for (let i = 0; i < 6; i++) {
    const x = ((Math.sin(seme * 12.9898 + i * 78.233) * 43758.5453) % 1 + 1) % 1 * w;
    const y = ((Math.sin(seme * 93.9898 + i * 11.233) * 23421.631) % 1 + 1) % 1 * h;
    ctx.fillRect(x, y, 2, 2 + (i % 3) * 3);
  }
  return telaCountdown;
}
