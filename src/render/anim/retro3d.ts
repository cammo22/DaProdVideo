// Retro 3D (1.4.0): i trucchi delle sigle e dei salvaschermi degli anni '90 e 2000, rifatti come funzioni del tempo.
// Niente motore 3D vero: un piccolo proiettore prospettico (un punto in 3D → un punto sul quadro), l'ordine "dal più
// lontano al più vicino" (l'algoritmo del pittore, come facevano i giochi prima dello z-buffer) e i vecchi segreti:
//  · l'estrusione a strati: il testo ridisegnato 20-30 volte un po' più indietro e più scuro = le lettere col fianco;
//  · il cromo: un gradiente verticale con l'orizzonte scuro a metà (la "mappa d'ambiente" finta) e un riflesso che passa;
//  · la scia: lo stesso oggetto disegnato com'era qualche fotogramma prima, sempre più trasparente;
//  · i tubi del salvaschermo: un cammino a caso in una griglia 3D, con le giunture a palla;
//  · la griglia synthwave, il warp delle stelle, il tunnel della demoscene, il terreno a poligoni piatti.
import { E, caso, clamp01, hexA, mixa, prog, resta, rgb, scrivi, FONT, type Ctx2D, type Q } from './base';

type V = [number, number, number];
const rx = (p: V, a: number): V => { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; };
const ry = (p: V, a: number): V => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; };
const rz = (p: V, a: number): V => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; };
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V): V => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** il proiettore: x a destra, y in alto, z lontano dalla camera. Ritorna il punto sul quadro e la scala (null = dietro) */
const proietta = (p: V, cx: number, cy: number, f: number): [number, number, number] | null => {
  if (p[2] <= 0.05) return null;
  const s = f / p[2];
  return [cx + p[0] * s, cy - p[1] * s, s];
};

const num = (q: Q, k: string, d: number) => (typeof q.v[k] === 'number' ? (q.v[k] as number) : d);
const str = (q: Q, k: string, d: string) => (typeof q.v[k] === 'string' ? (q.v[k] as string) : d);
const sì = (q: Q, k: string, d: boolean) => (typeof q.v[k] === 'boolean' ? (q.v[k] as boolean) : d);

/** i cromi: argento, oro, neon. Gradiente verticale con l'orizzonte scuro poco sotto la metà */
const CROMI: Record<string, string[]> = {
  argento: ['#ffffff', '#dfe8f5', '#9fb2cf', '#2a3550', '#5d7299', '#e9f1ff', '#b7c6de'],
  oro: ['#fffbe6', '#ffe58a', '#ffbf1f', '#5a3200', '#a86b00', '#ffe08a', '#d99a00'],
  neon: ['#ffffff', '#ffb3fb', '#ff3df2', '#2a0040', '#7b2cff', '#35e8ff', '#c9fbff'],
  rame: ['#fff1e6', '#ffc39b', '#e07a3f', '#3a1400', '#8a3d12', '#ffb48a', '#c8662e'],
};
function gradCromo(c: Ctx2D, y0: number, y1: number, nome: string) {
  const col = CROMI[nome] ?? CROMI.argento;
  const g = c.createLinearGradient(0, y0, 0, y1);
  const stop = [0, 0.18, 0.44, 0.5, 0.56, 0.8, 1];
  col.forEach((k, i) => g.addColorStop(stop[i], k));
  return g;
}

/**
 * Il testo estruso: strati dal fondo al davanti, ognuno spostato lungo la profondità e più scuro, poi la faccia
 * davanti col cromo, il bordo e il riflesso che passa. ang = rotazione attorno all'asse verticale (radianti),
 * inc = inclinazione (in su), sc = grandezza, prof = profondità in pixel.
 */
function testoEstruso(c: Ctx2D, s: string, x: number, y: number, o: {
  font: string; sc: number; ang: number; inc: number; prof: number; fianco: string; davanti: string | CanvasGradient | ((y0: number, y1: number) => string | CanvasGradient);
  riflesso?: number; alfa?: number; contorno?: string;
}) {
  const strati = 26;
  const cosA = Math.cos(o.ang);
  const sx = Math.sign(cosA || 1) * Math.max(0.06, Math.abs(cosA));
  c.save();
  c.globalAlpha *= o.alfa ?? 1;
  c.translate(x, y);
  c.scale(o.sc * sx, o.sc);
  c.font = o.font;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  const m = c.measureText(s);
  const alto = (m.actualBoundingBoxAscent || 80) + (m.actualBoundingBoxDescent || 10);
  // dove va la profondità, nel piano del testo: di lato quando gira, in su quando s'inclina
  const dx = Math.sin(o.ang) * (o.prof / strati) / Math.max(0.06, Math.abs(cosA)) * Math.sign(cosA || 1);
  const dy = Math.sin(o.inc) * (o.prof / strati);
  const [fr, fg, fb] = rgb(o.fianco);
  for (let i = strati; i >= 1; i--) {
    const k = 0.35 + 0.65 * (1 - i / strati);
    c.fillStyle = `rgb(${Math.round(fr * k)},${Math.round(fg * k)},${Math.round(fb * k)})`;
    c.fillText(s, dx * i, dy * i);
  }
  const y0 = -alto / 2, y1 = alto / 2;
  const davanti = typeof o.davanti === 'function' ? o.davanti(y0, y1) : o.davanti;
  if (o.contorno) { c.lineWidth = 6; c.strokeStyle = o.contorno; c.lineJoin = 'round'; c.strokeText(s, 0, 0); }
  c.fillStyle = davanti;
  c.fillText(s, 0, 0);
  if (o.riflesso !== undefined && o.riflesso > -0.5 && o.riflesso < 1.5) {
    // il riflesso: una banda chiara obliqua che attraversa le lettere (il gradiente colora solo le lettere)
    const w = m.width;
    const bx = -w / 2 + o.riflesso * w * 1.4 - w * 0.2;
    const g = c.createLinearGradient(bx - 80, y0, bx + 80, y1);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillText(s, 0, 0);
  }
  c.restore();
}

/** il bagliore d'obiettivo degli anni '90: una stella, una riga orizzontale e qualche anello */
function bagliore(c: Ctx2D, x: number, y: number, k: number, colore = '#bfe3ff') {
  if (k <= 0.01) return;
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(x, y, 0, x, y, 160 * k);
  g.addColorStop(0, `rgba(255,255,255,${0.95 * k})`);
  g.addColorStop(0.2, hexA(colore, 0.55 * k));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, 160 * k, 0, Math.PI * 2); c.fill();
  const r = c.createLinearGradient(x - 700 * k, y, x + 700 * k, y);
  r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(0.5, `rgba(255,255,255,${0.8 * k})`); r.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = r;
  c.fillRect(x - 700 * k, y - 3, 1400 * k, 6);
  c.fillRect(x - 2, y - 120 * k, 4, 240 * k);
  c.restore();
}

/** stelline fisse, come nei titoli dello spazio */
function stelle(c: Ctx2D, w: number, h: number, n: number, seme: number, t = 0) {
  for (let i = 0; i < n; i++) {
    const x = caso(i, seme) * w, y = caso(i, seme + 1) * h;
    const a = 0.3 + 0.7 * caso(i, seme + 2) * (0.75 + 0.25 * Math.sin(t * 3 + i));
    c.fillStyle = `rgba(255,255,255,${a})`;
    c.fillRect(x, y, 2 + (i % 3 === 0 ? 1 : 0), 2 + (i % 3 === 0 ? 1 : 0));
  }
}

// ——————————————————————————————————————————————— le animazioni

/** il logo cromato che arriva da lontano girando, si ferma con un bagliore, e alla fine passa oltre la camera */
function logo(q: Q) {
  const { c, w, h, t, d } = q;
  const testo = str(q, 'testo', 'DAPROD');
  const sotto = str(q, 'sotto', '');
  const cromo = str(q, 'cromo', 'argento');
  const dim = num(q, 'dim', 100) / 100;
  const scia = sì(q, 'scia', true);
  const entra = Math.min(1.8, d * 0.45);
  const font = `900 220px ${FONT.archivo}`;
  const stato = (tt: number) => {
    const e = prog(tt, 0, entra, E.p3out);
    const fuori = clamp01((tt - (d - 0.6)) / 0.6);
    const ang = (1 - e) * -Math.PI * 2.2 + Math.sin(tt * 0.9) * 0.22 * e;
    const inc = 0.18 + (1 - e) * 0.5;
    const sc = dim * (0.08 + 0.92 * e) * (1 + E.p3in(fuori) * 4);
    return { ang, inc, sc, alfa: 1 - E.p2in(fuori), e };
  };
  const fianco = cromo === 'oro' ? '#8a5200' : cromo === 'neon' ? '#4a0a80' : cromo === 'rame' ? '#6b2a08' : '#22324f';
  // la scia: tre copie di poco prima, sempre più deboli
  if (scia) {
    for (const [dt, a] of [[0.12, 0.12], [0.08, 0.2], [0.04, 0.3]] as [number, number][]) {
      const s = stato(Math.max(0, t - dt));
      if (s.e >= 0.999) continue;
      testoEstruso(c, testo, w / 2, h * 0.47, { font, sc: s.sc, ang: s.ang, inc: s.inc, prof: 70, fianco, davanti: (y0, y1) => gradCromo(c, y0, y1, cromo), alfa: a * s.alfa });
    }
  }
  const s = stato(t);
  const rifl = (t - entra + 0.1) / 1.1;
  testoEstruso(c, testo, w / 2, h * 0.47, { font, sc: s.sc, ang: s.ang, inc: s.inc, prof: 70, fianco, davanti: (y0, y1) => gradCromo(c, y0, y1, cromo), riflesso: rifl, alfa: s.alfa, contorno: 'rgba(0,0,0,0.55)' });
  // il bagliore quando si ferma
  const flash = Math.max(0, 1 - Math.abs(t - entra) / 0.45);
  bagliore(c, w / 2 + 260 * dim, h * 0.47 - 90 * dim, flash * s.alfa, cromo === 'oro' ? '#ffd27a' : '#bfe3ff');
  if (sotto) {
    const a = prog(t, entra, 0.6) * s.alfa;
    scrivi(c, sotto.toUpperCase(), w / 2, h * 0.47 + 190 * dim, { font: `700 ${Math.round(46 * dim)}px ${FONT.orbitron}`, colore: '#fff', align: 'center', spazio: 14 * dim, alfa: a, ombra: { blur: 18, colore: 'rgba(0,0,0,.8)' } });
  }
}

/** il testo 3D arcobaleno che gira su se stesso e saltella (WordArt) */
function wordart(q: Q) {
  const { c, w, h, t, d } = q;
  const testo = str(q, 'testo', 'FANTASTICO!');
  const giri = num(q, 'giri', 2);
  const dim = num(q, 'dim', 100) / 100;
  const stile = str(q, 'stile', 'arcobaleno');
  const ent = prog(t, 0, 0.5, E.back(1.6));
  const a = resta(q, 0.35);
  const ang = (t / Math.max(0.5, d)) * Math.PI * 2 * giri;
  const salto = Math.abs(Math.sin(t * 3.2)) * 40 * dim;
  const davanti = (y0: number, y1: number) => {
    const g = c.createLinearGradient(0, y0, 0, y1);
    const col = stile === 'fuoco' ? ['#fff3a0', '#ffd000', '#ff7a00', '#d10000']
      : stile === 'ghiaccio' ? ['#ffffff', '#bff4ff', '#35c8ff', '#1a4fd6']
        : ['#ff2d2d', '#ff9a00', '#ffe600', '#2bd600', '#00a2ff', '#a033ff'];
    col.forEach((k, i) => g.addColorStop(i / (col.length - 1), k));
    return g;
  };
  testoEstruso(c, testo, w / 2, h / 2 - salto, {
    font: `900 170px ${FONT.archivo}`, sc: dim * ent, ang, inc: 0.22, prof: 60,
    fianco: stile === 'ghiaccio' ? '#0e2a6b' : stile === 'fuoco' ? '#5a0000' : '#1d1d8f', davanti, alfa: a, contorno: 'rgba(0,0,0,0.7)',
  });
}

/** i tubi del salvaschermo: crescono in una griglia 3D, girano ad angolo retto, palle alle giunture */
function tubi(q: Q) {
  const { c, w, h, t } = q;
  const n = Math.round(num(q, 'quanti', 4));
  const vel = num(q, 'velocita', 6);
  if (sì(q, 'nero', false)) { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); }
  const G: V = [10, 7, 7];
  const passi = Math.floor(t * vel);
  const parz = t * vel - passi;
  const occ = new Set<string>();
  const chiave = (p: V) => p.join(',');
  const DIR: V[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const COL = ['#ff3d3d', '#3dff6e', '#3d9bff', '#ffd23d', '#ff3df2', '#35e8ff', '#ffffff', '#ff8a3d'];
  type Seg = { a: V; b: V; col: string; giunto: boolean };
  const segmenti: Seg[] = [];
  for (let k = 0; k < n; k++) {
    let p: V = [Math.floor(caso(k, 1) * G[0]), Math.floor(caso(k, 2) * G[1]), Math.floor(caso(k, 3) * G[2])];
    let dir = Math.floor(caso(k, 4) * 6);
    occ.add(chiave(p));
    const col = COL[k % COL.length];
    for (let i = 0; i <= passi; i++) {
      // a volte gira; se davanti è occupato o fuori dalla griglia prova le altre direzioni
      let nuova = caso(k * 131 + i, 7) < 0.3 ? Math.floor(caso(k * 131 + i, 8) * 6) : dir;
      let prossimo: V | null = null;
      for (let tent = 0; tent < 6; tent++) {
        const dd = DIR[(nuova + tent) % 6];
        const np: V = [p[0] + dd[0], p[1] + dd[1], p[2] + dd[2]];
        if (np.some((v, j) => v < 0 || v >= G[j]) || occ.has(chiave(np))) continue;
        prossimo = np; nuova = (nuova + tent) % 6; break;
      }
      if (!prossimo) break;
      const giunto = nuova !== dir;
      dir = nuova;
      if (i === passi) {
        // l'ultimo pezzo cresce piano
        const fine: V = [p[0] + (prossimo[0] - p[0]) * parz, p[1] + (prossimo[1] - p[1]) * parz, p[2] + (prossimo[2] - p[2]) * parz];
        segmenti.push({ a: p, b: fine, col, giunto });
      } else {
        occ.add(chiave(prossimo));
        segmenti.push({ a: p, b: prossimo, col, giunto });
        p = prossimo;
      }
    }
  }
  // la camera guarda la griglia da davanti, un filo dall'alto, e gira piano
  const giro = Math.sin(t * 0.15) * 0.35;
  const tr = (p: V): V => {
    let v: V = [p[0] - G[0] / 2 + 0.5, p[1] - G[1] / 2 + 0.5, p[2] - G[2] / 2 + 0.5];
    v = ry(v, giro);
    v = rx(v, -0.25);
    return [v[0], v[1], v[2] + 13];
  };
  const f = h * 1.25;
  const pr = segmenti.map((s) => {
    const a = tr(s.a), b = tr(s.b);
    return { s, a: proietta(a, w / 2, h / 2, f), b: proietta(b, w / 2, h / 2, f), z: (a[2] + b[2]) / 2 };
  }).filter((x) => x.a && x.b).sort((x, y) => y.z - x.z);
  c.save();
  c.lineCap = 'round';
  for (const { s, a, b } of pr) {
    const [x1, y1, s1] = a!, [x2, y2, s2] = b!;
    const sp = 0.32 * (s1 + s2) / 2;
    // il cilindro finto: scuro largo, colore, riga chiara stretta un po' più in alto
    c.strokeStyle = mixa(s.col, '#000000', 0.55);
    c.lineWidth = sp;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    c.strokeStyle = s.col;
    c.lineWidth = sp * 0.72;
    c.beginPath(); c.moveTo(x1, y1 - sp * 0.06); c.lineTo(x2, y2 - sp * 0.06); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.75)';
    c.lineWidth = sp * 0.16;
    c.beginPath(); c.moveTo(x1 - sp * 0.12, y1 - sp * 0.2); c.lineTo(x2 - sp * 0.12, y2 - sp * 0.2); c.stroke();
    if (s.giunto) {
      const g = c.createRadialGradient(x1 - sp * 0.2, y1 - sp * 0.25, sp * 0.05, x1, y1, sp * 0.62);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, s.col); g.addColorStop(1, mixa(s.col, '#000000', 0.6));
      c.fillStyle = g;
      c.beginPath(); c.arc(x1, y1, sp * 0.62, 0, Math.PI * 2); c.fill();
    }
  }
  c.restore();
}

/** il salto nell'iperspazio: le stelle vengono incontro e diventano strisce */
function warp(q: Q) {
  const { c, w, h, t, d } = q;
  c.fillStyle = str(q, 'base', '#02030a');
  c.fillRect(0, 0, w, h);
  const n = Math.round(num(q, 'quanti', 400));
  const col = str(q, 'colore', '#bfe3ff');
  // la velocità sale fino al "salto" a metà clip, poi resta
  const salto = clamp01((t - d * 0.3) / (d * 0.25));
  const v = 0.15 + 2.2 * E.p3in(salto);
  const coda = 0.01 + 0.25 * E.p2in(salto);
  const f = h * 0.9;
  c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = (caso(i, 11) * 2 - 1) * 6, y = (caso(i, 12) * 2 - 1) * 4;
    // la posizione in profondità, fatta girare: integrale della velocità (t*v approssimato a tratti)
    const z0 = caso(i, 13) * 10;
    const percorso = t * 0.15 + 2.2 * Math.max(0, t - d * 0.3) * E.p2in(salto) * 0.6;
    const z = 10 - ((z0 + percorso * 6) % 10) + 0.2;
    const a = proietta([x, y, z], w / 2, h / 2, f);
    const b = proietta([x, y, z + coda * 6 * (1 + v)], w / 2, h / 2, f);
    if (!a || !b) continue;
    const luce = clamp01(1.2 - z / 10);
    c.strokeStyle = hexA(i % 7 === 0 ? '#ffffff' : col, luce);
    c.lineWidth = Math.max(1, 2.6 * (1 - z / 10) + 1);
    c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(a[0], a[1]); c.stroke();
  }
  // il lampo al momento del salto
  const lampo = Math.max(0, 1 - Math.abs(salto - 1) * 6) * (salto > 0.95 ? 1 : 0);
  if (lampo > 0) { c.fillStyle = `rgba(220,240,255,${lampo * 0.5})`; c.fillRect(0, 0, w, h); }
}

/** la griglia synthwave: cielo viola, sole a righe, montagne di fil di ferro, pavimento a griglia che scorre */
function griglia(q: Q) {
  const { c, w, h, t } = q;
  const oriz = h * 0.6;
  const col = str(q, 'colore', '#ff3df2');
  const col2 = str(q, 'colore2', '#35e8ff');
  const vel = num(q, 'velocita', 1.2);
  // cielo
  const cielo = c.createLinearGradient(0, 0, 0, oriz);
  cielo.addColorStop(0, '#07001a'); cielo.addColorStop(0.55, '#2a0050'); cielo.addColorStop(1, mixa(col, '#2a0050', 0.35));
  c.fillStyle = cielo; c.fillRect(0, 0, w, oriz);
  stelle(c, w, oriz * 0.7, 90, 3, t);
  // il sole a righe
  const sx = w / 2, sy = oriz - 40, sr = h * 0.24;
  const sole = c.createLinearGradient(0, sy - sr, 0, sy + sr);
  sole.addColorStop(0, '#fff26a'); sole.addColorStop(0.5, '#ff9a3d'); sole.addColorStop(1, col);
  c.save();
  c.beginPath(); c.arc(sx, sy, sr, 0, Math.PI * 2); c.clip();
  c.fillStyle = sole; c.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
  for (let i = 0; i < 7; i++) {
    const yy = sy + sr * (0.05 + i * 0.14) - ((t * 20) % (sr * 0.14));
    c.fillStyle = '#2a0050';
    c.fillRect(sx - sr, yy, sr * 2, 3 + i * 2.2);
  }
  c.restore();
  c.save();
  c.globalCompositeOperation = 'lighter';
  const alone = c.createRadialGradient(sx, sy, sr * 0.8, sx, sy, sr * 1.8);
  alone.addColorStop(0, hexA(col, 0.35)); alone.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = alone; c.fillRect(0, 0, w, oriz);
  c.restore();
  // le montagne di fil di ferro, a destra e a sinistra
  for (const lato of [-1, 1]) {
    c.beginPath();
    c.moveTo(w / 2 + lato * w * 0.12, oriz);
    for (let i = 0; i <= 8; i++) {
      const x = w / 2 + lato * (w * 0.12 + i * w * 0.05);
      const y = oriz - (i % 2 ? 60 + caso(i, lato + 5) * 160 : 20 + caso(i, lato + 9) * 50);
      c.lineTo(x, y);
    }
    c.lineTo(w / 2 + lato * w * 0.6, oriz);
    c.closePath();
    c.fillStyle = '#12002a';
    c.fill();
    c.strokeStyle = col2;
    c.lineWidth = 2.5;
    c.shadowColor = col2; c.shadowBlur = 12;
    c.stroke();
    c.shadowBlur = 0;
  }
  // il pavimento
  c.fillStyle = '#0d0020';
  c.fillRect(0, oriz, w, h - oriz);
  c.save();
  c.strokeStyle = col;
  c.shadowColor = col; c.shadowBlur = 10;
  c.lineWidth = 2;
  const fuga = w / 2;
  for (let i = -24; i <= 24; i++) {
    c.beginPath(); c.moveTo(fuga + i * 6, oriz); c.lineTo(fuga + i * w * 0.12, h); c.stroke();
  }
  const scorre = (t * vel) % 1;
  for (let k = 0; k < 22; k++) {
    const z = k + 1 - scorre;
    const y = oriz + (h - oriz) * 1.4 / z;
    if (y > h) continue;
    c.globalAlpha = clamp01(1.4 - z / 16);
    c.lineWidth = Math.max(1, 3.5 / Math.sqrt(z));
    c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
  }
  c.restore();
  c.fillStyle = hexA(col, 0.9);
  c.fillRect(0, oriz - 1, w, 3);
  const testo = str(q, 'testo', '');
  if (testo) testoEstruso(c, testo, w / 2, h * 0.2, { font: `900 150px ${FONT.archivo}`, sc: prog(t, 0.2, 0.9, E.back(1.3)), ang: Math.sin(t * 0.8) * 0.12, inc: 0.25, prof: 46, fianco: '#3a0060', davanti: (y0, y1) => gradCromo(c, y0, y1, 'neon'), riflesso: (t % 4) / 2.5 - 0.3, contorno: 'rgba(0,0,0,.6)' });
}

/** il cubo che gira: facce piene con la luce, spigoli al neon e una parola su ogni faccia */
function cubo(q: Q) {
  const { c, w, h, t } = q;
  const col = str(q, 'colore', '#35e8ff');
  const testo = str(q, 'testo', 'DAPROD');
  const dim = num(q, 'dim', 100) / 100;
  const ent = prog(t, 0, 0.7, E.back(1.5));
  const a = resta(q, 0.35);
  const V8: V[] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
  // le facce in senso antiorario viste da fuori: [a, b, c, d] (a in basso a sinistra della scritta)
  const F = [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]];
  const ax = t * 0.7 + 0.4, ay = t * 1.1;
  const pts = V8.map((p) => { const v = rx(ry(p, ay), ax); return [v[0] * 1.4 * dim * ent, v[1] * 1.4 * dim * ent, v[2] * 1.4 * dim * ent + 7] as V; });
  const luce = norm([-0.4, 0.7, -0.6]);
  const facce = F.map((idx) => {
    const P = idx.map((i) => pts[i]);
    // la normale verso fuori (le facce sono in senso antiorario viste da fuori)
    const n = norm(cross(sub(P[3], P[0]), sub(P[1], P[0])));
    const z = P.reduce((s, p) => s + p[2], 0) / 4;
    return { P, n, z };
  }).sort((x, y) => y.z - x.z);
  const f = h * 1.1;
  c.save();
  c.globalAlpha = a;
  for (const fc of facce) {
    const visto = dot(fc.n, norm(sub([0, 0, 0], fc.P[0])));
    if (visto <= 0) continue;
    const pp = fc.P.map((p) => proietta(p, w / 2, h / 2, f)!);
    if (pp.some((x) => !x)) continue;
    const l = 0.35 + 0.65 * Math.max(0, dot(fc.n, luce));
    c.beginPath();
    pp.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fillStyle = mixa('#05040a', col, l * 0.55);
    c.fill();
    c.strokeStyle = col;
    c.lineWidth = 4;
    c.shadowColor = col; c.shadowBlur = 14;
    c.stroke();
    c.shadowBlur = 0;
    if (testo) {
      // la scritta sulla faccia: una trasformazione affine dal rettangolo 400×400 ai tre angoli della faccia
      // (l'origine è l'angolo in alto a sinistra della faccia: d; x verso c, y verso a)
      const [pa, , pc, pd] = pp;
      c.save();
      c.transform((pc[0] - pd[0]) / 400, (pc[1] - pd[1]) / 400, (pa[0] - pd[0]) / 400, (pa[1] - pd[1]) / 400, pd[0], pd[1]);
      c.font = `900 ${Math.min(120, 620 / Math.max(3, testo.length))}px ${FONT.archivo}`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = hexA('#ffffff', 0.35 + 0.6 * l);
      c.fillText(testo, 200, 200);
      c.restore();
    }
  }
  c.restore();
}

/** la scritta che scorre e si allontana nello spazio (righe gialle in prospettiva) */
function crawl(q: Q) {
  const { c, w, h, t } = q;
  c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
  stelle(c, w, h, 220, 21, t);
  const righe = str(q, 'testo', 'Tanto tempo fa, in una sala di montaggio\nnon troppo lontana, un videomaker\nscoprì i segreti del 3D anni \'90.\n\nAccese il logo cromato,\nfece girare il cubo\ne partì verso le stelle…').split('\n');
  const col = str(q, 'colore', '#ffd54a');
  const vel = num(q, 'velocita', 60);
  const titolo = str(q, 'titolo', '');
  // il piano su cui scorre il testo: la camera sta sopra e guarda in avanti
  const oriz = h * 0.1, base = h * 1.05;
  const k = 900;
  const passo = 120;
  const avanza = t * vel;
  c.save();
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  const tutte = titolo ? [titolo.toUpperCase(), '', ...righe] : righe;
  tutte.forEach((r, i) => {
    if (!r) return;
    const u = 140 + i * passo - avanza + h * 0.2; // la distanza sul piano (più grande = più lontano)
    if (u < 60) return;
    const z = u / 140;
    const y = oriz + (base - oriz) / z;
    const sc = 1 / z;
    if (y < oriz + 4) return;
    c.globalAlpha = clamp01((y - oriz) / ((base - oriz) * 0.35));
    c.font = `${i === 0 && titolo ? 900 : 700} ${Math.round((i === 0 && titolo ? 96 : 64) * sc * (k / 900))}px ${FONT.montserrat}`;
    c.fillStyle = col;
    c.fillText(r, w / 2, y, w * 1.2 * sc);
  });
  c.restore();
}

/** il tunnel della demoscene: anelli quadrati che vengono incontro, girando, coi colori che scorrono */
function tunnel(q: Q) {
  const { c, w, h, t } = q;
  c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
  const vel = num(q, 'velocita', 2);
  const forma = str(q, 'forma', 'quadrati');
  const f = h * 0.8;
  const cx = w / 2 + Math.sin(t * 0.7) * w * 0.08, cy = h / 2 + Math.cos(t * 0.9) * h * 0.06;
  const N = 34;
  const scorre = (t * vel) % 1;
  c.save();
  c.lineJoin = 'round';
  for (let k = N; k >= 0; k--) {
    const z = (k + 1 - scorre) * 0.55;
    const s = f / z;
    const r = 1.2 * s;
    const indice = k + Math.floor(t * vel);
    const hue = (indice * 23 + t * 40) % 360;
    c.strokeStyle = `hsla(${hue},100%,${55 + 10 * Math.sin(indice)}%,${clamp01(1.3 - z / (N * 0.55))})`;
    c.lineWidth = Math.max(1, 14 / z);
    c.beginPath();
    if (forma === 'cerchi') c.arc(cx, cy, r, 0, Math.PI * 2);
    else {
      const ang = indice * 0.12 + t * 0.4;
      const lati = forma === 'esagoni' ? 6 : 4;
      for (let i = 0; i <= lati; i++) {
        const a = ang + (i * Math.PI * 2) / lati;
        const x = cx + Math.cos(a) * r * (w / h) * 0.75, y = cy + Math.sin(a) * r;
        if (i) c.lineTo(x, y); else c.moveTo(x, y);
      }
    }
    c.stroke();
  }
  c.restore();
}

/** il volo radente su un terreno a poligoni piatti (come le prime console 3D), col sole al tramonto */
function terreno(q: Q) {
  const { c, w, h, t } = q;
  const col = str(q, 'colore', '#5dffb4');
  const fil = sì(q, 'fili', true);
  const vel = num(q, 'velocita', 3);
  const oriz = h * 0.42;
  const cielo = c.createLinearGradient(0, 0, 0, oriz);
  cielo.addColorStop(0, '#0a0624'); cielo.addColorStop(1, '#ff7a3d');
  c.fillStyle = cielo; c.fillRect(0, 0, w, oriz + 2);
  const sole = c.createRadialGradient(w * 0.5, oriz, 10, w * 0.5, oriz, h * 0.22);
  sole.addColorStop(0, '#fff3c0'); sole.addColorStop(0.35, '#ffb347'); sole.addColorStop(1, 'rgba(255,122,61,0)');
  c.fillStyle = sole; c.fillRect(0, 0, w, oriz + 2);
  c.fillStyle = '#120a1e'; c.fillRect(0, oriz, w, h - oriz);
  const COLS = 22, RIGHE = 26;
  const avanti = t * vel;
  const r0 = Math.floor(avanti), fr = avanti - r0;
  const alt = (i: number, j: number) => {
    const x = i - COLS / 2, z = j + r0;
    const valle = Math.min(1, Math.abs(x) / 4); // al centro una valle dove si vola
    return valle * (1.4 * Math.sin(x * 0.7 + z * 0.35) + 1.1 * Math.sin(z * 0.6 - x * 0.3) + 1.6 * caso(Math.round(x * 7 + 3), z)) + 0.3;
  };
  const camY = 2.4, f = h * 0.9;
  const P = (i: number, j: number): [number, number, number] | null => {
    const x = (i - COLS / 2) * 1.2, z = (j - fr) * 1.2 + 1.2, y = alt(i, j) - camY;
    return proietta([x, y, z], w / 2, oriz, f);
  };
  const luce = norm([0.3, 0.8, 0.5]);
  for (let j = RIGHE - 1; j >= 0; j--) {
    for (let i = 0; i < COLS; i++) {
      const a = P(i, j), b = P(i + 1, j), cc = P(i + 1, j + 1), dd = P(i, j + 1);
      if (!a || !b || !cc || !dd) continue;
      const va: V = [(i - COLS / 2) * 1.2, alt(i, j), j * 1.2], vb: V = [(i + 1 - COLS / 2) * 1.2, alt(i + 1, j), j * 1.2], vd: V = [(i - COLS / 2) * 1.2, alt(i, j + 1), (j + 1) * 1.2];
      const n = norm(cross(sub(vd, va), sub(vb, va)));
      const l = 0.25 + 0.75 * Math.max(0, dot(n, luce));
      const nebbia = clamp01(j / RIGHE);
      c.beginPath();
      c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(cc[0], cc[1]); c.lineTo(dd[0], dd[1]); c.closePath();
      c.fillStyle = mixa(mixa('#1a0f2e', col, l * 0.6), '#ff7a3d', nebbia * 0.5);
      c.fill();
      if (fil) { c.strokeStyle = hexA(col, 0.55 * (1 - nebbia)); c.lineWidth = 1.2; c.stroke(); }
    }
  }
}

/** il pianeta di fil di ferro con l'anello, che gira (le demo dei computer di casa) */
function pianeta(q: Q) {
  const { c, w, h, t } = q;
  const col = str(q, 'colore', '#35e8ff');
  const col2 = str(q, 'colore2', '#ff3df2');
  const dim = num(q, 'dim', 100) / 100;
  const ent = prog(t, 0, 0.8, E.back(1.3));
  const a = resta(q, 0.35);
  const R = 2.2 * dim * ent;
  const giro = t * 0.6;
  const inc = 0.42;
  const f = h * 1.2;
  const tr = (p: V): V => { const v = rx(ry(p, giro), inc); return [v[0], v[1], v[2] + 9]; };
  c.save();
  c.globalAlpha = a;
  c.lineWidth = 2.5;
  // l'anello, metà dietro
  const anello = (davanti: boolean) => {
    c.strokeStyle = col2; c.shadowColor = col2; c.shadowBlur = 10;
    for (const rr of [1.6, 1.75, 1.9]) {
      c.beginPath();
      let primo = true;
      for (let i = 0; i <= 96; i++) {
        const an = (i / 96) * Math.PI * 2;
        const p: V = [Math.cos(an) * R * rr, 0, Math.sin(an) * R * rr];
        const v = rx(rz(p, 0.15), inc);
        const dietro = v[2] > 0;
        if (dietro === davanti) { primo = true; continue; }
        const pr = proietta([v[0], v[1], v[2] + 9], w / 2, h / 2, f);
        if (!pr) continue;
        if (primo) { c.moveTo(pr[0], pr[1]); primo = false; } else c.lineTo(pr[0], pr[1]);
      }
      c.stroke();
    }
  };
  anello(false);
  // il pianeta: un disco scuro e la rete dei meridiani e paralleli (solo la metà davanti)
  const centro = proietta([0, 0, 9], w / 2, h / 2, f)!;
  c.shadowBlur = 0;
  c.fillStyle = '#04030a';
  c.beginPath(); c.arc(centro[0], centro[1], R * centro[2], 0, Math.PI * 2); c.fill();
  c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 8;
  const linea = (punti: V[]) => {
    c.beginPath();
    let primo = true;
    for (const p of punti) {
      const v = tr(p);
      if (v[2] > 9) { primo = true; continue; }
      const pr = proietta(v, w / 2, h / 2, f);
      if (!pr) continue;
      if (primo) { c.moveTo(pr[0], pr[1]); primo = false; } else c.lineTo(pr[0], pr[1]);
    }
    c.stroke();
  };
  for (let m = 0; m < 12; m++) {
    const lon = (m / 12) * Math.PI * 2;
    linea(Array.from({ length: 49 }, (_, i) => { const lat = -Math.PI / 2 + (i / 48) * Math.PI; return [Math.cos(lat) * Math.cos(lon) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R] as V; }));
  }
  for (let k = 1; k < 8; k++) {
    const lat = -Math.PI / 2 + (k / 8) * Math.PI;
    linea(Array.from({ length: 73 }, (_, i) => { const lon = (i / 72) * Math.PI * 2; return [Math.cos(lat) * Math.cos(lon) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R] as V; }));
  }
  anello(true);
  c.restore();
  const testo = str(q, 'testo', '');
  if (testo) scrivi(c, testo.toUpperCase(), w / 2, h / 2 + R * centro[2] + 120, { font: `700 54px ${FONT.orbitron}`, colore: '#fff', align: 'center', spazio: 10, alfa: a * prog(t, 0.6, 0.5), ombra: { blur: 16, colore: hexA(col, 0.9) } });
}

export const RETRO3D: Record<string, (q: Q) => void> = {
  'r3-logo': logo, 'r3-wordart': wordart, 'r3-tubi': tubi, 'r3-warp': warp, 'r3-griglia': griglia, 'r3-cubo': cubo,
  'r3-crawl': crawl, 'r3-tunnel': tunnel, 'r3-terreno': terreno, 'r3-pianeta': pianeta,
};
