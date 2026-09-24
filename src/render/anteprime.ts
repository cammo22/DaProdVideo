// Le anteprime animate del pannello Transizioni: disegnate con lo stesso shader del Recorder
// (un solo contesto WebGL piccolo per tutte), così quello che vedi nel pannello è quello che esce.
import type { Transition } from '../core/tipi';
import { compila, FS_COMBINE, impostaCombina, NOMI_COMBINA, VS_FULL } from './compositore';

const W = 128, H = 72;
let stato: { gl: WebGL2RenderingContext; tela: OffscreenCanvas | HTMLCanvasElement; u: Record<string, WebGLUniformLocation | null>; prog: WebGLProgram } | null = null;
let rotto = false;

function immagine(testo: string, c1: string, c2: string, righe: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,.18)';
  if (righe) for (let i = 0; i < W; i += 12) x.fillRect(i, 0, 5, H);
  else for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(18 + i * 20, 12 + (i % 2) * 44, 7, 0, 7); x.fill(); }
  x.fillStyle = '#fff';
  x.font = '900 34px Orbitron, sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(testo, W / 2, H / 2 + 2);
  return c;
}

function prepara() {
  if (stato || rotto) return stato;
  try {
    const tela = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
    const gl = tela.getContext('webgl2', { premultipliedAlpha: true, preserveDrawingBuffer: true, alpha: false }) as WebGL2RenderingContext | null;
    if (!gl) throw new Error('niente WebGL2');
    const prog = compila(gl, VS_FULL, FS_COMBINE);
    const u: Record<string, WebGLUniformLocation | null> = {};
    for (const n of NOMI_COMBINA) u[n] = gl.getUniformLocation(prog, n);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    // le due immagini di prova: A blu DaProd, B oro. Si caricano capovolte come i buffer del compositore
    const carica = (unit: number, img: HTMLCanvasElement) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    carica(0, immagine('A', '#1b3a8f', '#35e8ff', true));
    carica(1, immagine('B', '#ffab00', '#ff3df2', false));
    gl.useProgram(prog);
    stato = { gl, tela, u, prog };
  } catch { rotto = true; }
  return stato;
}

/** disegna la transizione tr al punto p (0..1) nella tela di destinazione */
export function anteprima(dest: HTMLCanvasElement, tr: Transition, p: number) {
  const s = prepara();
  const ctx = dest.getContext('2d')!;
  if (!s) { ctx.fillStyle = p < 0.5 ? '#1b3a8f' : '#ffab00'; ctx.fillRect(0, 0, dest.width, dest.height); return; }
  const gl = s.gl;
  gl.viewport(0, 0, W, H);
  gl.clearColor(0.03, 0.03, 0.05, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  impostaCombina(gl, s.u, tr, p, 1, true, W / H);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  ctx.drawImage(s.tela as CanvasImageSource, 0, 0, dest.width, dest.height);
}

/** anteprima ferma a metà; al passaggio del mouse (o al tocco) si anima */
export function anteprimaViva(dest: HTMLCanvasElement, tr: Transition) {
  anteprima(dest, tr, 0.5);
  let raf = 0, t0 = 0;
  const giro = (t: number) => {
    if (!t0) t0 = t;
    const k = ((t - t0) / 1600) % 1.25;
    anteprima(dest, tr, Math.min(1, k));
    raf = requestAnimationFrame(giro);
  };
  const via = () => { cancelAnimationFrame(raf); t0 = 0; anteprima(dest, tr, 0.5); };
  dest.addEventListener('pointerenter', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(giro); });
  dest.addEventListener('pointerleave', via);
}
