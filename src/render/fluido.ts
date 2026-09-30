// Movimento fluido per i rallentatori: quando una ripresa va piano, lo stesso fotogramma resterebbe fermo per
// più fotogrammi del progetto e il movimento scatta. Qui si inventano quelli in mezzo, sulla GPU:
//  · sfumato: si mescolano il fotogramma di prima e quello dopo (semplice, va bene fino a ×0.5 circa);
//  · mosso: si stima dove va ogni pezzetto dell'immagine (blocchi a confronto, poco più di 200 mosse provate per blocco)
//    e si spostano tutti e due i fotogrammi verso il punto di mezzo prima di mescolarli. Dove la stima non è sicura
//    (cose che si scoprono, tagli) si torna allo sfumato.
// Il campo di movimento si rifà solo quando cambia la coppia di fotogrammi (a ×0.25 uno ogni quattro).
import { compila, VS_FULL } from './compositore';

const R = 7;

const FS_MOTO = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_a, u_b;
uniform vec2 u_cell;
uniform float u_lod;
out vec4 o;
float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
void main() {
  float pa[9];
  for (int j = 0; j < 3; j++) for (int i = 0; i < 3; i++)
    pa[j * 3 + i] = lum(textureLod(u_a, v_uv + vec2(float(i) - 1.0, float(j) - 1.0) * u_cell * 0.33, u_lod).rgb);
  float best = 1e9;
  vec2 bd = vec2(0.0);
  for (int dy = -${R}; dy <= ${R}; dy++) for (int dx = -${R}; dx <= ${R}; dx++) {
    vec2 d = vec2(float(dx), float(dy));
    float sad = 0.0;
    for (int j = 0; j < 3; j++) for (int i = 0; i < 3; i++)
      sad += abs(pa[j * 3 + i] - lum(textureLod(u_b, v_uv + (vec2(float(i) - 1.0, float(j) - 1.0) * 0.33 + d) * u_cell, u_lod).rgb));
    sad = sad / 9.0 + 0.0015 * length(d);
    if (sad < best) { best = sad; bd = d; }
  }
  float fid = 1.0 - smoothstep(0.035, 0.13, best);
  o = vec4(bd / ${(2 * R).toFixed(1)} + 0.5, fid, 1.0);
}`;

const FS_MEZZO = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_a, u_b, u_mv;
uniform float u_w;
uniform vec2 u_cell;
uniform bool u_mosso;
out vec4 o;
void main() {
  vec4 plain = mix(texture(u_a, v_uv), texture(u_b, v_uv), u_w);
  if (!u_mosso) { o = plain; return; }
  vec4 m = texture(u_mv, v_uv);
  vec2 d = (m.rg - 0.5) * ${(2 * R).toFixed(1)} * u_cell;
  vec4 wa = texture(u_a, v_uv - d * u_w);
  vec4 wb = texture(u_b, v_uv + d * (1.0 - u_w));
  o = mix(plain, mix(wa, wb, u_w), m.b);
}`;

export interface TexFl { tex: WebGLTexture }

interface Bersaglio { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number }
interface Stato { out: Bersaglio; mv?: Bersaglio; coppia?: unknown }

export class Interpolatore {
  private pMoto: WebGLProgram;
  private pMezzo: WebGLProgram;
  private uMoto: Record<string, WebGLUniformLocation | null> = {};
  private uMezzo: Record<string, WebGLUniformLocation | null> = {};
  private stati = new Map<string, Stato>();
  private usati = new Set<string>();

  constructor(private gl: WebGL2RenderingContext) {
    this.pMoto = compila(gl, VS_FULL, FS_MOTO);
    this.pMezzo = compila(gl, VS_FULL, FS_MEZZO);
    for (const n of ['u_a', 'u_b', 'u_cell', 'u_lod']) this.uMoto[n] = gl.getUniformLocation(this.pMoto, n);
    for (const n of ['u_a', 'u_b', 'u_mv', 'u_w', 'u_cell', 'u_mosso']) this.uMezzo[n] = gl.getUniformLocation(this.pMezzo, n);
  }

  private bersaglio(w: number, h: number, filtro: number): Bersaglio {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtro);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtro);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { fb, tex, w, h };
  }

  private libera(b?: Bersaglio) { if (b) { this.gl.deleteFramebuffer(b.fb); this.gl.deleteTexture(b.tex); } }

  /** all'inizio di ogni fotogramma: si buttano gli stati che non servono più */
  inizia() { this.usati.clear(); }
  finisce() {
    for (const [k, s] of this.stati) if (!this.usati.has(k)) { this.libera(s.out); this.libera(s.mv); this.stati.delete(k); }
  }

  /**
   * Il fotogramma a metà fra A e B (w = 0 è A, 1 è B). a e b sono le texture già caricate; `coppiaId` cambia quando cambia
   * la coppia. Ritorna la texture del risultato (grande wpx × hpx, con l'orientamento delle sorgenti). Lo stato di
   * disegno (framebuffer, viewport) va rimesso da chi chiama.
   */
  mezzo(chiave: string, a: TexFl, b: TexFl, coppiaId: unknown, w: number, wpx: number, hpx: number, mosso: boolean): WebGLTexture {
    const gl = this.gl;
    this.usati.add(chiave);
    let st = this.stati.get(chiave);
    if (!st || st.out.w !== wpx || st.out.h !== hpx) {
      if (st) { this.libera(st.out); this.libera(st.mv); }
      st = { out: this.bersaglio(wpx, hpx, gl.LINEAR) };
      this.stati.set(chiave, st);
    }
    gl.disable(gl.BLEND);
    // il campo di movimento (solo "mosso"), quando la coppia è nuova
    if (mosso) {
      const mvW = Math.max(8, Math.min(240, Math.ceil(wpx / 4)));
      const mvH = Math.max(8, Math.round((mvW * hpx) / wpx));
      if (!st.mv || st.mv.w !== mvW || st.mv.h !== mvH) { this.libera(st.mv); st.mv = this.bersaglio(mvW, mvH, gl.LINEAR); st.coppia = undefined; }
      if (st.coppia !== coppiaId) {
        // le mip servono solo per la stima del movimento: dopo si rimette il filtro di prima (se no la texture, che poi
        // viene ridisegnata da sola, userebbe mip vecchie)
        for (const t of [a, b]) {
          gl.bindTexture(gl.TEXTURE_2D, t.tex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.generateMipmap(gl.TEXTURE_2D);
        }
        const cellPx = wpx / mvW;
        gl.bindFramebuffer(gl.FRAMEBUFFER, st.mv.fb);
        gl.viewport(0, 0, mvW, mvH);
        gl.useProgram(this.pMoto);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.tex); gl.uniform1i(this.uMoto.u_a, 0);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, b.tex); gl.uniform1i(this.uMoto.u_b, 1);
        gl.uniform2f(this.uMoto.u_cell, 1 / mvW, 1 / mvH);
        gl.uniform1f(this.uMoto.u_lod, Math.max(0, Math.log2(cellPx / 2.5)));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        for (const t of [a, b]) { gl.bindTexture(gl.TEXTURE_2D, t.tex); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); }
        st.coppia = coppiaId;
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, st.out.fb);
    gl.viewport(0, 0, wpx, hpx);
    gl.useProgram(this.pMezzo);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.tex); gl.uniform1i(this.uMezzo.u_a, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, b.tex); gl.uniform1i(this.uMezzo.u_b, 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, mosso && st.mv ? st.mv.tex : a.tex); gl.uniform1i(this.uMezzo.u_mv, 2);
    gl.uniform1f(this.uMezzo.u_w, w);
    gl.uniform1i(this.uMezzo.u_mosso, mosso ? 1 : 0);
    gl.uniform2f(this.uMezzo.u_cell, 1 / (st.mv?.w ?? 1), 1 / (st.mv?.h ?? 1));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.activeTexture(gl.TEXTURE0);
    return st.out.tex;
  }

  distruggi() {
    for (const s of this.stati.values()) { this.libera(s.out); this.libera(s.mv); }
    this.stati.clear();
  }
}
