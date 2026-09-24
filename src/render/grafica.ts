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
  const lines = spec.text.split('\n');
  const lineH = size * 1.2;
  const font = `700 ${size}px "${spec.font}", "Rajdhani", "Segoe UI", sans-serif`;
  const misura = nuovaTela(8, 8).getContext('2d') as Ctx2D;
  misura.font = font;
  const textW = Math.max(...lines.map((l) => misura.measureText(l).width), 1);
  const textH = lines.length * lineH;
  let w = W, h = H;
  if (spec.style === 'rullo') h = Math.ceil(textH + H * 0.2);
  if (spec.style === 'crawl') w = Math.ceil(textW + size);
  const tela = nuovaTela(w, h);
  const ctx = tela.getContext('2d') as Ctx2D;
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const pad = size * 0.35;
  let x0: number, y0: number;
  if (spec.style === 'rullo') { y0 = H * 0.1 + lineH / 2; }
  else if (spec.style === 'crawl') { y0 = h * spec.y; }
  else if (spec.style === 'sottopancia') { y0 = H * 0.82 - textH / 2 + lineH / 2; }
  else { y0 = H * spec.y - textH / 2 + lineH / 2; }
  const align = spec.style === 'crawl' ? 'left' : spec.style === 'sottopancia' && spec.align === 'center' ? 'left' : spec.align;
  ctx.textAlign = align as CanvasTextAlign;
  if (spec.style === 'crawl') x0 = size / 2;
  else if (align === 'left') x0 = spec.style === 'sottopancia' ? W * 0.08 : W * 0.1;
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
  } else if (spec.box) {
    ctx.fillStyle = spec.boxColor;
    const bx = align === 'left' ? x0 - pad : align === 'right' ? x0 - textW - pad : x0 - textW / 2 - pad;
    ctx.fillRect(bx, y0 - lineH / 2 - pad / 2, textW + pad * 2, textH + pad);
  }
  lines.forEach((l, i) => {
    const y = y0 + i * lineH;
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

/** spostamento del titolo animato (rullo / crawl) al tempo locale t su una durata d, in pixel del progetto */
export function motoTitolo(spec: TitleSpec, w: number, h: number, W: number, H: number, t: number, d: number): { dx: number; dy: number } {
  const k = d > 0 ? Math.min(1, Math.max(0, t / d)) : 0;
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
