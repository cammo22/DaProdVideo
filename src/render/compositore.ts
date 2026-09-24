// Il mixer video in WebGL2. Ogni strato si disegna nel suo buffer (trasformazioni, proc amp, chiave, look),
// poi si combina sull'uscita con la transizione e la trasparenza. Stesso codice per i monitor e per l'export.
import type { Project, Transition } from '../core/tipi';
import type { Strato, Sorgente } from './piano';
import { fotogramma, type Fotogramma } from '../media/fotogrammi';

/** chi fornisce i fotogrammi esatti (l'export); senza, si usano quelli dei monitor */
export type Fornitore = (s: Sorgente) => Fotogramma | null;
import { mediaOf } from '../core/progetto';
import { disegnaCountdown, motoTitolo, telaTitolo } from './grafica';
import { TITLE0 } from '../core/progetto';

const VS_LAYER = `#version 300 es
in vec2 a_pos;
uniform vec2 u_res;        // dimensione del progetto in pixel
uniform vec2 u_size;       // dimensione mostrata della sorgente intera (dopo l'adattamento)
uniform vec4 u_crop;       // l, t, r, b in uv
uniform vec2 u_off;        // spostamento in pixel dal centro
uniform float u_scale, u_rot;
out vec2 v_uv;
void main() {
  vec2 uv = mix(u_crop.xy, vec2(1.0) - u_crop.zw, a_pos);
  vec2 p = (uv - 0.5) * u_size * u_scale;
  float c = cos(u_rot), s = sin(u_rot);
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + u_off;
  vec2 clip = p / (u_res * 0.5);
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_uv = uv;
}`;

const FS_LAYER = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tex;
uniform int u_src;          // 0 texture, 1 barre SMPTE, 2 barre EBU, 3 colore pieno
uniform int u_orient;       // rotazione dei metadati: 0, 90, 180, 270
uniform vec3 u_color;
uniform float u_bright, u_contrast, u_sat, u_hue;
uniform int u_look;         // 0 nessuno, 1 vhs, 2 pellicola, 3 b/n, 4 seppia, 5 crt
uniform float u_time;
uniform vec2 u_texel;
uniform int u_key;          // 0 no, 1 luma, 2 chroma
uniform vec3 u_keyColor;
uniform float u_keyLevel, u_keySoft;
uniform bool u_keyInv;
out vec4 o;

vec2 orient(vec2 uv) {
  if (u_orient == 90) return vec2(uv.y, 1.0 - uv.x);
  if (u_orient == 180) return vec2(1.0 - uv.x, 1.0 - uv.y);
  if (u_orient == 270) return vec2(1.0 - uv.y, uv.x);
  return uv;
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec3 smpte(vec2 uv) {
  vec3 bars[7] = vec3[7](vec3(.75), vec3(.75,.75,0.), vec3(0.,.75,.75), vec3(0.,.75,0.), vec3(.75,0.,.75), vec3(.75,0.,0.), vec3(0.,0.,.75));
  int i = int(clamp(floor(uv.x * 7.0), 0.0, 6.0));
  if (uv.y < 0.67) return bars[i];
  if (uv.y < 0.75) {
    vec3 rev[7] = vec3[7](vec3(0.,0.,.75), vec3(.075), vec3(.75,0.,.75), vec3(.075), vec3(0.,.75,.75), vec3(.075), vec3(.75));
    return rev[i];
  }
  float x = uv.x * 7.0;
  if (x < 1.25) return vec3(0.0, 0.129, 0.298);       // -I
  if (x < 2.5) return vec3(1.0);                      // bianco 100%
  if (x < 3.75) return vec3(0.196, 0.0, 0.416);       // +Q
  if (x < 5.0) return vec3(0.075);
  if (x < 5.333) return vec3(0.035);                  // PLUGE: sotto il nero
  if (x < 5.666) return vec3(0.075);
  if (x < 6.0) return vec3(0.115);                    //        sopra il nero
  return vec3(0.075);
}
vec3 ebu(vec2 uv) {
  vec3 b[8] = vec3[8](vec3(1.), vec3(.75,.75,0.), vec3(0.,.75,.75), vec3(0.,.75,0.), vec3(.75,0.,.75), vec3(.75,0.,0.), vec3(0.,0.,.75), vec3(0.));
  return b[int(clamp(floor(uv.x * 8.0), 0.0, 7.0))];
}

vec4 src(vec2 uv) {
  if (u_src == 1) return vec4(smpte(uv), 1.0);
  if (u_src == 2) return vec4(ebu(uv), 1.0);
  if (u_src == 3) return vec4(u_color, 1.0);
  return texture(u_tex, orient(uv));
}

void main() {
  vec4 c = src(v_uv);
  vec3 rgb = c.a > 0.0 ? c.rgb / c.a : vec3(0.0);
  float a = c.a;
  if (u_look == 1) {
    // VHS: il colore scappa di lato, righe di tracking, rumore
    float wob = sin(v_uv.y * 180.0 + u_time * 3.0) * 0.0009 + (hash(vec2(floor(v_uv.y * 240.0), u_time)) - 0.5) * 0.0012;
    vec2 uvw = v_uv + vec2(wob, 0.0);
    vec3 cr = src(uvw + vec2(u_texel.x * 3.5, 0.0)).rgb;
    vec3 cb = src(uvw - vec2(u_texel.x * 3.5, 0.0)).rgb;
    vec3 cm = src(uvw).rgb;
    rgb = vec3(cr.r, cm.g, cb.b);
    float band = smoothstep(0.02, 0.0, abs(fract(v_uv.y * 0.6 - u_time * 0.07) - 0.95));
    rgb += band * 0.25 * hash(v_uv * 400.0 + u_time);
    rgb = mix(rgb, vec3(dot(rgb, vec3(.299,.587,.114))), -0.25);
    rgb += (hash(v_uv * vec2(640.0, 480.0) + u_time) - 0.5) * 0.07;
    rgb *= 0.94 + 0.06 * sin(v_uv.y * 900.0);
  } else if (u_look == 2) {
    // pellicola: grana, vignetta, tinta calda, sfarfallio
    float g = (hash(v_uv * 900.0 + fract(u_time * 7.13)) - 0.5) * 0.09;
    rgb = rgb * vec3(1.06, 1.0, 0.9) + g;
    vec2 d = v_uv - 0.5;
    rgb *= 1.0 - dot(d, d) * 0.9;
    rgb *= 0.97 + 0.03 * hash(vec2(u_time, 1.0));
  } else if (u_look == 3) {
    rgb = vec3(dot(rgb, vec3(.299, .587, .114)));
  } else if (u_look == 4) {
    float y = dot(rgb, vec3(.299, .587, .114));
    rgb = vec3(y * 1.07 + 0.05, y * 0.95 + 0.02, y * 0.75);
  } else if (u_look == 5) {
    // tubo catodico: righe, maschera RGB, bordi scuri
    float sl = 0.78 + 0.22 * sin(v_uv.y / u_texel.y * 3.14159);
    int m = int(mod(gl_FragCoord.x, 3.0));
    vec3 mask = m == 0 ? vec3(1.0, 0.8, 0.8) : m == 1 ? vec3(0.8, 1.0, 0.8) : vec3(0.8, 0.8, 1.0);
    rgb *= sl * mask * 1.15;
    vec2 d = v_uv - 0.5;
    rgb *= smoothstep(0.75, 0.35, length(d * vec2(1.0, 1.2)));
  }
  // proc amp (il TBC): nero, guadagno, croma, fase
  rgb = (rgb - 0.5) * u_contrast + 0.5 + u_bright;
  float Y = dot(rgb, vec3(0.299, 0.587, 0.114));
  float I = dot(rgb, vec3(0.596, -0.274, -0.322));
  float Q = dot(rgb, vec3(0.211, -0.523, 0.312));
  float h = radians(u_hue), ch = cos(h), sh = sin(h);
  vec2 iq = vec2(ch * I - sh * Q, sh * I + ch * Q) * u_sat;
  rgb = vec3(Y + 0.956 * iq.x + 0.621 * iq.y, Y - 0.272 * iq.x - 0.647 * iq.y, Y - 1.106 * iq.x + 1.703 * iq.y);
  rgb = clamp(rgb, 0.0, 1.0);
  // chiave
  if (u_key == 1) {
    float k = smoothstep(u_keyLevel - u_keySoft, u_keyLevel + u_keySoft, Y);
    a *= u_keyInv ? 1.0 - k : k;
  } else if (u_key == 2) {
    vec3 kc = u_keyColor;
    float kY = dot(kc, vec3(0.299, 0.587, 0.114));
    vec2 kUV = vec2(dot(kc, vec3(-0.169, -0.331, 0.5)), dot(kc, vec3(0.5, -0.419, -0.081)));
    vec2 cUV = vec2(dot(rgb, vec3(-0.169, -0.331, 0.5)), dot(rgb, vec3(0.5, -0.419, -0.081)));
    float d = distance(cUV, kUV) * 2.2 + abs(Y - kY) * 0.15;
    float k = smoothstep(u_keyLevel * 0.5, u_keyLevel * 0.5 + u_keySoft + 0.001, d);
    a *= u_keyInv ? 1.0 - k : k;
    // toglie il colore della chiave che rimbalza sui bordi (spill)
    if (kc.g > kc.r && kc.g > kc.b) rgb.g = min(rgb.g, max(rgb.r, rgb.b) + 0.05);
    else if (kc.b > kc.r && kc.b > kc.g) rgb.b = min(rgb.b, max(rgb.r, rgb.g) + 0.05);
  }
  o = vec4(rgb * a, a);
}`;

const VS_FULL = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() { v_uv = a_pos; gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`;

const FS_COMBINE = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_a, u_b;
uniform bool u_hasA;
uniform int u_mode;        // 0 solo B, 1 mix, 2 tendina, 3 passaggio a colore
uniform float u_p, u_opacity, u_soft, u_border, u_aspect;
uniform int u_pattern;
uniform bool u_reverse;
uniform vec3 u_borderColor, u_dipColor;
out vec4 o;

float campo(vec2 uv) {
  vec2 c = uv - 0.5;
  if (u_pattern == 1) return uv.x;
  if (u_pattern == 2) return uv.y;
  if (u_pattern == 3) return max(uv.x, uv.y);
  if (u_pattern == 4) return max(1.0 - uv.x, uv.y);
  if (u_pattern == 21) return abs(c.x) * 2.0;
  if (u_pattern == 22) return abs(c.y) * 2.0;
  if (u_pattern == 41) return (uv.x + uv.y) * 0.5;
  if (u_pattern == 101) return max(abs(c.x), abs(c.y)) * 2.0;
  if (u_pattern == 102) return abs(c.x) + abs(c.y);
  if (u_pattern == 119) return length(c * vec2(u_aspect, 1.0)) / length(vec2(u_aspect, 1.0) * 0.5);
  if (u_pattern == 201) return fract(atan(c.x, -c.y) / 6.2831853 + 1.0);
  if (u_pattern == 7) return fract((uv.x * 8.0)) ; // veneziana
  return uv.x;
}

void main() {
  vec4 B = texture(u_b, v_uv);
  vec4 A = u_hasA ? texture(u_a, v_uv) : vec4(0.0);
  vec4 r = B;
  if (u_mode == 1) r = mix(A, B, u_p);
  else if (u_mode == 3) {
    vec4 d = vec4(u_dipColor, 1.0);
    r = u_p < 0.5 ? mix(A, d, u_p * 2.0) : mix(d, B, (u_p - 0.5) * 2.0);
  } else if (u_mode == 2) {
    float f = campo(vec2(v_uv.x, 1.0 - v_uv.y));
    if (u_reverse) f = 1.0 - f;
    float s = max(u_soft, 0.0005);
    float e = u_p * (1.0 + 2.0 * s + u_border) - s - u_border;
    float m = 1.0 - smoothstep(e - s, e, f);
    r = mix(A, B, m);
    if (u_border > 0.0) {
      float bm = smoothstep(e - s, e, f) * (1.0 - smoothstep(e + u_border - s, e + u_border, f));
      r = mix(r, vec4(u_borderColor, 1.0), bm);
    }
  }
  o = r * u_opacity;
}`;

type Tex = { tex: WebGLTexture; src: unknown; w: number; h: number };

function hex(c: string): [number, number, number] {
  const m = c.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map((x) => x + x).join('') : m.slice(0, 6), 16) || 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const LOOK: Record<string, number> = { none: 0, vhs: 1, film: 2, bn: 3, seppia: 4, crt: 5 };

export class Compositore {
  gl: WebGL2RenderingContext;
  private pLayer: WebGLProgram;
  private pComb: WebGLProgram;
  private uL: Record<string, WebGLUniformLocation | null> = {};
  private uC: Record<string, WebGLUniformLocation | null> = {};
  private vao: WebGLVertexArrayObject;
  private fbo: { fb: WebGLFramebuffer; tex: WebGLTexture }[] = [];
  private fbW = 0;
  private fbH = 0;
  private texs = new Map<string, Tex>();
  private used = new Set<string>();
  private blank: WebGLTexture;
  private fornitore: Fornitore | undefined;
  perso = false;

  constructor(public canvas: HTMLCanvasElement | OffscreenCanvas, preserve = false) {
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: preserve, desynchronized: false, powerPreference: 'high-performance' }) as WebGL2RenderingContext | null;
    if (!gl) throw new Error('WebGL2 non disponibile');
    this.gl = gl;
    this.pLayer = this.prog(VS_LAYER, FS_LAYER);
    this.pComb = this.prog(VS_FULL, FS_COMBINE);
    for (const n of ['u_res', 'u_size', 'u_crop', 'u_off', 'u_scale', 'u_rot', 'u_tex', 'u_src', 'u_orient', 'u_color', 'u_bright', 'u_contrast', 'u_sat', 'u_hue', 'u_look', 'u_time', 'u_texel', 'u_key', 'u_keyColor', 'u_keyLevel', 'u_keySoft', 'u_keyInv'])
      this.uL[n] = gl.getUniformLocation(this.pLayer, n);
    for (const n of ['u_a', 'u_b', 'u_hasA', 'u_mode', 'u_p', 'u_opacity', 'u_soft', 'u_border', 'u_aspect', 'u_pattern', 'u_reverse', 'u_borderColor', 'u_dipColor'])
      this.uC[n] = gl.getUniformLocation(this.pComb, n);
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    for (const p of [this.pLayer, this.pComb]) {
      const loc = gl.getAttribLocation(p, 'a_pos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }
    this.blank = this.newTex();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    if ('addEventListener' in canvas) {
      canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.perso = true; }, false);
    }
  }

  private prog(vs: string, fs: string) {
    const gl = this.gl;
    const mk = (type: number, s: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(sh));
      return sh;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'a_pos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('programma: ' + gl.getProgramInfoLog(p));
    return p;
  }

  private newTex() {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  private ensureFbo(w: number, h: number) {
    const gl = this.gl;
    if (this.fbW === w && this.fbH === h && this.fbo.length) return;
    for (const f of this.fbo) { gl.deleteFramebuffer(f.fb); gl.deleteTexture(f.tex); }
    this.fbo = [];
    for (let i = 0; i < 3; i++) {
      const tex = this.newTex();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      this.fbo.push({ fb, tex });
    }
    this.fbW = w;
    this.fbH = h;
  }

  /** carica sulla GPU un'immagine (fotogramma, tela, bitmap) solo se è cambiata */
  private upload(key: string, src: TexImageSource, w: number, h: number, sameAs: unknown): Tex {
    const gl = this.gl;
    let t = this.texs.get(key);
    if (!t) {
      t = { tex: this.newTex(), src: null, w: 0, h: 0 };
      this.texs.set(key, t);
    }
    this.used.add(key);
    if (t.src !== sameAs) {
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      t.src = sameAs;
      t.w = w;
      t.h = h;
    }
    return t;
  }

  /**
   * Disegna gli strati sull'uscita (la tela). W,H = dimensione del progetto; la tela può essere più piccola
   * (anteprima): tutto scala. playing = in riproduzione (i fotogrammi arrivano dal flusso).
   */
  render(p: Project, strati: Strato[], playing: boolean, frame: number, fornitore?: Fornitore) {
    this.fornitore = fornitore;
    const gl = this.gl;
    if (this.perso || gl.isContextLost()) return;
    const cw = this.canvas.width, ch = this.canvas.height;
    this.ensureFbo(cw, ch);
    this.used.clear();
    gl.bindVertexArray(this.vao);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[2].fb);
    gl.viewport(0, 0, cw, ch);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const s of strati) {
      const hasA = !!s.a && !!s.tr;
      const okB = this.layer(p, s.b, 1, playing, frame);
      const okA = hasA ? this.layer(p, s.a!, 0, playing, frame) : false;
      if (!okB && !okA) continue;
      if (!okB) { // la sorgente B non è pronta: pulisce il suo buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[1].fb);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      this.combine(s.tr, s.prog, s.opacity, okA);
    }
    // l'uscita va sulla tela; resta anche nel buffer, per gli strumenti di misura
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.fbo[2].fb);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(0, 0, cw, ch, 0, 0, cw, ch, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // i buffer delle clip non più in scena si liberano
    for (const [k, t] of this.texs) {
      if (!this.used.has(k) && !k.startsWith('img:')) { gl.deleteTexture(t.tex); this.texs.delete(k); }
    }
  }

  /** disegna una sorgente nel buffer i (0 = A, 1 = B). Ritorna false se non c'è ancora niente da mostrare */
  private layer(p: Project, s: Sorgente, i: number, playing: boolean, frame: number): boolean {
    const gl = this.gl;
    const c = s.clip;
    const W = p.w, H = p.h;
    let srcKind = 0;
    let tex: WebGLTexture = this.blank;
    let sw = W, sh = H, orient = 0;
    let off = { dx: 0, dy: 0 };
    let fit = true;
    if (c.kind === 'media' && c.media) {
      const m = mediaOf(p, c);
      if (!m) return false;
      const f = this.fornitore ? this.fornitore(s) : fotogramma(c.id, c.media, s.t, playing);
      if (!f) return false;
      if (f instanceof ImageBitmap) {
        const t = this.upload('img:' + c.media, f, f.width, f.height, f);
        tex = t.tex;
        sw = f.width;
        sh = f.height;
      } else {
        const vf = f.toCanvasImageSource();
        const t = this.upload('v:' + c.id + ':' + i, vf, f.displayWidth, f.displayHeight, f);
        tex = t.tex;
        orient = f.rotation;
        sw = orient % 180 ? f.displayHeight : f.displayWidth;
        sh = orient % 180 ? f.displayWidth : f.displayHeight;
        // pixel non quadrati (DV, HDV anamorfico): la larghezza giusta è quella "a pixel quadrati"
        if (f.squarePixelWidth && f.squarePixelHeight && !(orient % 180)) { sw = f.squarePixelWidth; sh = f.squarePixelHeight; }
      }
    } else if (c.kind === 'bars') {
      srcKind = c.gen?.bars === 'ebu' ? 2 : 1;
    } else if (c.kind === 'color') {
      srcKind = 3;
    } else if (c.kind === 'countdown') {
      const tela = disegnaCountdown(W, H, s.local, c.len * p.rate.den / p.rate.num);
      const t = this.upload('cd:' + c.id + ':' + i, tela as TexImageSource, tela.width, tela.height, frame + ':' + s.lf);
      tex = t.tex;
      sw = W; sh = H;
    } else if (c.kind === 'title') {
      const spec = c.gen?.title ?? TITLE0;
      const tt = telaTitolo(spec, W, H);
      const t = this.upload('img:t:' + c.id, tt.tela as TexImageSource, tt.w, tt.h, tt.tela);
      tex = t.tex;
      sw = tt.w; sh = tt.h;
      fit = false;
      off = motoTitolo(spec, tt.w, tt.h, W, H, s.local, c.len * p.rate.den / p.rate.num);
    } else return false;

    // adattamento al quadro: la sorgente intera ci sta dentro senza deformarsi
    let dw = sw, dh = sh;
    if (fit) {
      const k = Math.min(W / sw, H / sh);
      dw = sw * k;
      dh = sh * k;
    }
    const tf = c.tf, fx = c.fx;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[i].fb);
    gl.viewport(0, 0, this.fbW, this.fbH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.BLEND);
    gl.useProgram(this.pLayer);
    const u = this.uL;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(u.u_tex, 0);
    gl.uniform2f(u.u_res, W, H);
    gl.uniform2f(u.u_size, dw, dh);
    gl.uniform4f(u.u_crop, tf.cropL, tf.cropT, tf.cropR, tf.cropB);
    gl.uniform2f(u.u_off, tf.x + off.dx, tf.y + off.dy);
    gl.uniform1f(u.u_scale, tf.scale);
    gl.uniform1f(u.u_rot, (tf.rot * Math.PI) / 180);
    gl.uniform1i(u.u_src, srcKind);
    gl.uniform1i(u.u_orient, orient);
    const col = hex(c.gen?.color ?? '#000000');
    gl.uniform3f(u.u_color, col[0], col[1], col[2]);
    gl.uniform1f(u.u_bright, fx.bright);
    gl.uniform1f(u.u_contrast, fx.contrast);
    gl.uniform1f(u.u_sat, fx.sat);
    gl.uniform1f(u.u_hue, fx.hue);
    gl.uniform1i(u.u_look, LOOK[fx.look] ?? 0);
    gl.uniform1f(u.u_time, (frame % 10000) / 25);
    gl.uniform2f(u.u_texel, 1 / Math.max(1, dw), 1 / Math.max(1, dh));
    gl.uniform1i(u.u_key, fx.key === 'luma' ? 1 : fx.key === 'chroma' ? 2 : 0);
    const kc = hex(fx.keyColor);
    gl.uniform3f(u.u_keyColor, kc[0], kc[1], kc[2]);
    gl.uniform1f(u.u_keyLevel, fx.keyLevel);
    gl.uniform1f(u.u_keySoft, fx.keySoft);
    gl.uniform1i(u.u_keyInv, fx.keyInvert ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  }

  private combine(tr: Transition | null, prog: number, opacity: number, hasA: boolean) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[2].fb);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.pComb);
    const u = this.uC;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fbo[0].tex);
    gl.uniform1i(u.u_a, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.fbo[1].tex);
    gl.uniform1i(u.u_b, 1);
    gl.uniform1i(u.u_hasA, hasA ? 1 : 0);
    const mode = !tr ? 0 : tr.type === 'mix' ? 1 : tr.type === 'wipe' ? 2 : 3;
    gl.uniform1i(u.u_mode, mode);
    gl.uniform1f(u.u_p, Math.max(0, Math.min(1, prog)));
    gl.uniform1f(u.u_opacity, opacity);
    gl.uniform1f(u.u_soft, tr?.soft ?? 0);
    gl.uniform1f(u.u_border, tr?.border ?? 0);
    gl.uniform1f(u.u_aspect, this.canvas.width / this.canvas.height);
    gl.uniform1i(u.u_pattern, tr?.pattern ?? 1);
    gl.uniform1i(u.u_reverse, tr?.reverse ? 1 : 0);
    const bc = hex(tr?.borderColor ?? '#ffffff'), dc = hex(tr?.color ?? '#000000');
    gl.uniform3f(u.u_borderColor, bc[0], bc[1], bc[2]);
    gl.uniform3f(u.u_dipColor, dc[0], dc[1], dc[2]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.activeTexture(gl.TEXTURE0);
  }

  /** legge l'uscita in piccolo (per gli strumenti di misura: forma d'onda e vettorscopio) */
  leggiPiccolo(w: number, h: number, out: Uint8Array) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    // si ridisegna l'uscita in un buffer piccolo con blit, poi si legge
    if (!this.small || this.smallW !== w || this.smallH !== h) {
      if (this.small) { gl.deleteFramebuffer(this.small.fb); gl.deleteRenderbuffer(this.small.rb); }
      const rb = gl.createRenderbuffer()!;
      gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, w, h);
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rb);
      this.small = { fb, rb };
      this.smallW = w;
      this.smallH = h;
    }
    if (!this.fbo.length) { out.fill(0); return; }
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.fbo[2].fb);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.small.fb);
    gl.blitFramebuffer(0, 0, this.fbW, this.fbH, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.LINEAR);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.small.fb);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, out);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  private small: { fb: WebGLFramebuffer; rb: WebGLRenderbuffer } | null = null;
  private smallW = 0;
  private smallH = 0;

  /** dimentica le texture di un'immagine o di un titolo cambiato */
  dimentica(prefix: string) {
    for (const [k, t] of this.texs) if (k.startsWith(prefix)) { this.gl.deleteTexture(t.tex); this.texs.delete(k); }
  }

  distruggi() {
    const gl = this.gl;
    for (const t of this.texs.values()) gl.deleteTexture(t.tex);
    this.texs.clear();
    for (const f of this.fbo) { gl.deleteFramebuffer(f.fb); gl.deleteTexture(f.tex); }
    this.fbo = [];
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
