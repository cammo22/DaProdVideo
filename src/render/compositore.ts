// Il mixer video in WebGL2. Ogni strato si disegna nel suo buffer (trasformazioni, proc amp, chiave, look),
// poi si combina sull'uscita con la transizione e la trasparenza. Stesso codice per i monitor e per l'export.
import type { Project, Transition } from '../core/tipi';
import type { Strato, Sorgente } from './piano';
import { fotogramma, type Fotogramma } from '../media/fotogrammi';

/** chi fornisce i fotogrammi esatti (l'export); senza, si usano quelli dei monitor */
export type Fornitore = (s: Sorgente) => Fotogramma | null;
import { autoColore, masterDi, mediaOf } from '../core/progetto';
import { mediaRT } from '../media/libreria';
import { gradeDi, gradeNeutro } from './colore';
import { statoEffetti, type StatoFx } from '../core/blocchi';
import { fxEffettivo } from '../core/effettiClip';
import { disegnaSovr, firmaSovr } from './sovrimpressione';
import { nuovaTela } from './grafica';
import { disegnaCountdown, motoTitolo, specAlTempo, telaTitolo } from './grafica';
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
uniform int u_look;         // bit: 1 vhs, 2 pellicola, 4 b/n, 8 seppia, 16 crt (si sommano)
uniform float u_time;
uniform vec2 u_texel;
uniform int u_key;          // 0 no, 1 luma, 2 chroma
uniform vec3 u_keyColor;
uniform float u_keyLevel, u_keySoft;
uniform bool u_keyInv;
uniform bool u_mirror;
uniform float u_temp, u_vignette;
uniform bool u_auto;          // colore automatico: livelli, bianco e luce misurati sulla ripresa
uniform vec3 u_autoLo, u_autoHi, u_autoWb;
uniform float u_autoK, u_autoGamma;
uniform float u_alpha;        // i titoli animati che compaiono e spariscono
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
  vec2 uv0 = u_mirror ? vec2(1.0 - v_uv.x, v_uv.y) : v_uv;
  vec4 c = src(uv0);
  vec3 rgb = c.a > 0.0 ? c.rgb / c.a : vec3(0.0);
  float a = c.a;
  if (u_auto) {
    vec3 lv = clamp((rgb - u_autoLo) / max(u_autoHi - u_autoLo, vec3(0.05)), 0.0, 1.0);
    lv = pow(lv * u_autoWb, vec3(u_autoGamma));
    rgb = mix(rgb, clamp(lv, 0.0, 1.0), u_autoK);
  }
  if ((u_look & 1) != 0) {
    // VHS: il colore scappa di lato, righe di tracking, rumore
    float wob = sin(v_uv.y * 180.0 + u_time * 3.0) * 0.0009 + (hash(vec2(floor(v_uv.y * 240.0), u_time)) - 0.5) * 0.0012;
    vec2 uvw = uv0 + vec2(wob, 0.0);
    vec3 cr = src(uvw + vec2(u_texel.x * 3.5, 0.0)).rgb;
    vec3 cb = src(uvw - vec2(u_texel.x * 3.5, 0.0)).rgb;
    vec3 cm = src(uvw).rgb;
    rgb = vec3(cr.r, cm.g, cb.b);
    float band = smoothstep(0.02, 0.0, abs(fract(v_uv.y * 0.6 - u_time * 0.07) - 0.95));
    rgb += band * 0.25 * hash(v_uv * 400.0 + u_time);
    rgb = mix(rgb, vec3(dot(rgb, vec3(.299,.587,.114))), -0.25);
    rgb += (hash(v_uv * vec2(640.0, 480.0) + u_time) - 0.5) * 0.07;
    rgb *= 0.94 + 0.06 * sin(v_uv.y * 900.0);
  }
  if ((u_look & 2) != 0) {
    // pellicola: grana, vignetta, tinta calda, sfarfallio
    float g = (hash(v_uv * 900.0 + fract(u_time * 7.13)) - 0.5) * 0.09;
    rgb = rgb * vec3(1.06, 1.0, 0.9) + g;
    vec2 d = v_uv - 0.5;
    rgb *= 1.0 - dot(d, d) * 0.9;
    rgb *= 0.97 + 0.03 * hash(vec2(u_time, 1.0));
  }
  if ((u_look & 4) != 0) {
    rgb = vec3(dot(rgb, vec3(.299, .587, .114)));
  }
  if ((u_look & 8) != 0) {
    float y = dot(rgb, vec3(.299, .587, .114));
    rgb = vec3(y * 1.07 + 0.05, y * 0.95 + 0.02, y * 0.75);
  }
  if ((u_look & 16) != 0) {
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
  if (u_temp != 0.0) rgb *= vec3(1.0 + u_temp * 0.18, 1.0 + u_temp * 0.02, 1.0 - u_temp * 0.2);
  if (u_vignette > 0.0) { vec2 dv = v_uv - 0.5; rgb *= 1.0 - u_vignette * smoothstep(0.15, 0.6, dot(dv, dv) * 2.2); }
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
  a *= u_alpha;
  o = vec4(rgb * a, a);
}`;

export const VS_FULL = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() { v_uv = a_pos; gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`;

/** il colore finale su tutto il montaggio (pagina Finale): lift, gamma, gain, contrasto, saturazione,
 *  viraggio, vignetta e grana. A sinistra di u_split resta l'originale (il "prima" del prima/dopo). */
const FS_MASTER = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_src;
uniform vec3 u_lift, u_gamma, u_gain, u_shadow, u_high;
uniform float u_sat, u_contrast, u_vignette, u_grain, u_time, u_split;
out vec4 o;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 c = texture(u_src, v_uv).rgb;
  vec3 r = c;
  if (v_uv.x >= u_split) {
    r = c * u_gain + u_lift * (1.0 - c);
    r = pow(max(r, 0.0), 1.0 / max(u_gamma, vec3(0.1)));
    r = (r - 0.5) * u_contrast + 0.5;
    float y = dot(r, vec3(0.2126, 0.7152, 0.0722));
    r = mix(vec3(y), r, u_sat);
    r += u_shadow * (1.0 - smoothstep(0.0, 0.55, y)) + u_high * smoothstep(0.45, 1.0, y);
    vec2 d = v_uv - 0.5;
    r *= 1.0 - u_vignette * smoothstep(0.12, 0.62, dot(d, d) * 2.0);
    if (u_grain > 0.0) r += (hash(v_uv * vec2(1280.0, 720.0) + fract(u_time * 7.13)) - 0.5) * u_grain;
  }
  if (u_split > 0.0 && abs(v_uv.x - u_split) < 0.0015) r = vec3(1.0, 0.84, 0.29);
  o = vec4(clamp(r, 0.0, 1.0), 1.0);
}`;

/** gli effetti a tempo dei blocchetti FX (lampo, scossa, zoom, glitch…) sulla loro traccia e su tutto quello sotto */
const FS_FX = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_src;
uniform vec2 u_res, u_off;
uniform float u_zoom, u_rot, u_blur, u_pixel, u_rgb, u_glitch, u_seme, u_desat, u_invert, u_flash, u_fade, u_luce, u_lucePh, u_bande, u_vhs, u_time;
uniform float u_bagliore, u_flare, u_flarePh, u_arco, u_arcoPh, u_espo, u_neon, u_onda, u_bolla, u_vortice, u_caleido, u_calore, u_zblur;
uniform vec3 u_flashCol, u_fadeCol;
out vec4 o;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec3 campione(vec2 uv) { return texture(u_src, clamp(uv, vec2(0.0005), vec2(0.9995))).rgb; }
vec3 tinta(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main() {
  float asp = u_res.x / u_res.y;
  // zoom e rotazione attorno al centro, poi lo spostamento (scossa, camera a mano)
  vec2 c = (v_uv - 0.5) * vec2(asp, 1.0);
  float cr = cos(u_rot), sr = sin(u_rot);
  c = vec2(cr * c.x - sr * c.y, sr * c.x + cr * c.y) / u_zoom;
  // le distorsioni: tutte sulle coordinate, così si sommano fra loro e con lo zoom
  float rr = length(c);
  if (u_caleido > 0.0) {
    float seg = 6.2831853 / 6.0;
    float a = mod(atan(c.y, c.x) + u_time * 0.2, seg);
    a = abs(a - seg * 0.5);
    c = mix(c, vec2(cos(a), sin(a)) * rr, u_caleido);
  }
  if (u_vortice > 0.0) {
    float ang = u_vortice * 2.6 * max(0.0, 1.0 - rr * 1.4);
    c = vec2(cos(ang) * c.x - sin(ang) * c.y, sin(ang) * c.x + cos(ang) * c.y);
  }
  if (u_bolla > 0.0) c *= 1.0 - u_bolla * 0.45 * (1.0 - smoothstep(0.0, 0.55, rr));
  vec2 uv = c / vec2(asp, 1.0) + 0.5 + u_off;
  if (u_onda > 0.0) uv += vec2(sin(uv.y * 22.0 + u_time * 7.0) * 0.018, sin(uv.x * 16.0 + u_time * 5.0) * 0.01) * u_onda;
  if (u_calore > 0.0) uv += vec2(sin(uv.y * 70.0 + u_time * 13.0) + sin(uv.y * 31.0 - u_time * 9.0), cos(uv.x * 55.0 + u_time * 11.0)) * 0.0022 * u_calore;
  if (u_glitch > 0.0) {
    float riga = floor(uv.y * 28.0);
    if (hash(vec2(riga, u_seme)) > 1.0 - u_glitch * 0.55) uv.x += (hash(vec2(riga * 3.1, u_seme + 1.0)) - 0.5) * 0.18 * u_glitch;
  }
  if (u_vhs > 0.0) uv.x += sin(uv.y * 120.0 + u_time * 9.0) * 0.0025 * u_vhs + (hash(vec2(floor(uv.y * 200.0), u_time)) - 0.5) * 0.004 * u_vhs;
  if (u_pixel > 0.0) {
    float lato = mix(1.0, 80.0, u_pixel * u_pixel) / u_res.y;
    vec2 cella = vec2(lato / asp, lato);
    uv = (floor(uv / cella) + 0.5) * cella;
  }
  vec3 col;
  if (u_blur > 0.0) {
    // sfocatura a disco con la spirale d'oro: pochi campioni, morbida
    float r = u_blur * 0.035;
    col = vec3(0.0);
    for (int i = 0; i < 24; i++) {
      float fi = float(i);
      float a = fi * 2.39996;
      col += campione(uv + vec2(cos(a), sin(a)) * sqrt((fi + 0.5) / 24.0) * r * vec2(1.0 / asp, 1.0));
    }
    col /= 24.0;
  } else if (u_zblur > 0.0) {
    // zoom sfocato: la scia verso il centro
    col = vec3(0.0);
    for (int i = 0; i < 16; i++) col += campione(mix(uv, vec2(0.5), float(i) / 15.0 * u_zblur * 0.22));
    col /= 16.0;
  } else col = campione(uv);
  float sp = u_rgb * 0.014 + u_glitch * 0.012 + u_vhs * 0.004;
  if (sp > 0.0) { col.r = campione(uv + vec2(sp, 0.0)).r; col.b = campione(uv - vec2(sp, 0.0)).b; }
  if (u_neon > 0.0) {
    // i contorni: dove la luce cambia di colpo si accende il tubo, il resto si spegne
    vec2 px = 1.5 / u_res;
    float l = dot(campione(uv + vec2(px.x, 0.0)) - campione(uv - vec2(px.x, 0.0)), vec3(0.33));
    float m = dot(campione(uv + vec2(0.0, px.y)) - campione(uv - vec2(0.0, px.y)), vec3(0.33));
    float bordo = clamp(length(vec2(l, m)) * 5.0, 0.0, 1.0);
    vec3 luceNeon = tinta(fract(uv.x * 0.6 + uv.y * 0.3 + u_time * 0.15)) * bordo * 2.2;
    col = mix(col, col * 0.18 + luceNeon, u_neon);
  }
  if (u_bagliore > 0.0) {
    // le parti chiare si allargano (il bloom delle lenti)
    vec3 g = vec3(0.0);
    for (int i = 0; i < 12; i++) {
      float a = float(i) * 0.5236;
      vec3 s = campione(uv + vec2(cos(a), sin(a)) * 0.022 * vec2(1.0 / asp, 1.0));
      g += max(s - 0.5, 0.0);
    }
    col += g / 12.0 * 2.2 * u_bagliore + col * 0.08 * u_bagliore;
  }
  col *= 1.0 + u_espo;
  float y = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, vec3(y), u_desat);
  col = mix(col, 1.0 - col, u_invert);
  if (u_vhs > 0.0) {
    col += (hash(v_uv * vec2(640.0, 480.0) + u_time) - 0.5) * 0.12 * u_vhs;
    col += smoothstep(0.03, 0.0, abs(fract(v_uv.y * 0.7 - u_time * 0.35) - 0.9)) * 0.35 * u_vhs;
  }
  if (u_luce > 0.0) {
    // la lama di luce calda che attraversa il quadro
    float x = v_uv.x + (v_uv.y - 0.5) * 0.35;
    float lama = exp(-pow((x - mix(-0.2, 1.2, u_lucePh)) * 3.2, 2.0));
    col += vec3(1.0, 0.55, 0.2) * lama * u_luce * 0.9 + vec3(1.0, 0.85, 0.6) * pow(lama, 3.0) * u_luce * 0.5;
  }
  if (u_arco > 0.0) {
    // la scia di colori che attraversa in diagonale (come la luce che entra dalla pellicola)
    float d = v_uv.x * 0.8 + (1.0 - v_uv.y) * 0.45 - mix(-0.3, 1.5, u_arcoPh);
    float banda = exp(-d * d * 7.0);
    vec3 arco = tinta(fract(d * 1.3 + 0.1));
    col = 1.0 - (1.0 - col) * (1.0 - arco * banda * u_arco * 0.75);
  }
  if (u_flare > 0.0) {
    // il riflesso d'obiettivo: la sorgente che passa in alto, la striscia orizzontale e gli aloni verso il centro
    vec2 sole = vec2(mix(-0.1, 1.1, u_flarePh), 0.28);
    vec2 d = (v_uv - vec2(sole.x, 1.0 - sole.y)) * vec2(asp, 1.0);
    vec3 fl = vec3(1.0, 0.92, 0.75) * exp(-dot(d, d) * 60.0) * 1.4 + vec3(1.0, 0.8, 0.55) * exp(-abs(d.y) * 90.0) * exp(-abs(d.x) * 1.8) * 0.55;
    for (int i = 1; i <= 3; i++) {
      vec2 g = mix(vec2(sole.x, 1.0 - sole.y), vec2(0.5), 0.5 + float(i) * 0.45);
      vec2 dg = (v_uv - g) * vec2(asp, 1.0);
      float an = smoothstep(0.08 * float(i), 0.07 * float(i), length(dg)) * 0.12;
      fl += tinta(0.08 * float(i) + 0.5) * an;
    }
    col += fl * u_flare;
  }
  col = mix(col, u_flashCol, u_flash);
  col = mix(col, u_fadeCol, u_fade);
  if (u_bande > 0.0) {
    float b = u_bande * max(0.0, (1.0 - asp / 2.39) * 0.5);
    if (v_uv.y < b || v_uv.y > 1.0 - b) col = vec3(0.0);
  }
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export const FS_COMBINE = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_a, u_b;
uniform bool u_hasA;
uniform int u_mode;        // 0 solo B, 1 mix, 2 tendina, 3 passaggio a colore, 4 effetto digitale
uniform float u_p, u_opacity, u_soft, u_border, u_aspect;
uniform int u_pattern;
uniform bool u_reverse;
uniform vec3 u_borderColor, u_dipColor;
out vec4 o;

// q: coordinate dello schermo, 0..1 con y verso il basso. Fuori dal quadro = trasparente.
bool fuori(vec2 q) { return q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0; }
vec4 tA(vec2 q) { return (!u_hasA || fuori(q)) ? vec4(0.0) : texture(u_a, vec2(q.x, 1.0 - q.y)); }
vec4 tB(vec2 q) { return fuori(q) ? vec4(0.0) : texture(u_b, vec2(q.x, 1.0 - q.y)); }
vec4 sopra(vec4 b, vec4 a) { return b + a * (1.0 - b.a); }
float caso(float x) { return fract(sin(x * 91.3458) * 47453.5453); }
float dolce(float t) { return t * t * (3.0 - 2.0 * t); }

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

// forme per le tendine a sagoma: distanza con segno (negativa dentro), di Inigo Quilez
float sdStella(vec2 p, float r, float rf) {
  const vec2 k1 = vec2(0.809016994375, -0.587785252292);
  const vec2 k2 = vec2(-k1.x, k1.y);
  p.x = abs(p.x);
  p -= 2.0 * max(dot(k1, p), 0.0) * k1;
  p -= 2.0 * max(dot(k2, p), 0.0) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}
float d2(vec2 v) { return dot(v, v); }
float sdCuore(vec2 p) {
  p.x = abs(p.x);
  if (p.y + p.x > 1.0) return sqrt(d2(p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
  return sqrt(min(d2(p - vec2(0.0, 1.0)), d2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}

vec4 tendina(vec2 q, vec4 A, vec4 B) {
  float s = max(u_soft, 0.0005);
  if (u_pattern == 120 || u_pattern == 121) {
    // la sagoma cresce dal centro fino a coprire tutto il quadro
    vec2 c = (q - 0.5) * vec2(u_aspect, 1.0);
    c.y = -c.y;
    float mezzaDiag = length(vec2(u_aspect, 1.0) * 0.5);
    float k = u_reverse ? 1.0 - u_p : u_p;
    float d;
    if (u_pattern == 120) { float r = k * mezzaDiag * 3.4 + 0.0001; d = sdStella(c, r, 0.45); }
    else { float sc = k * mezzaDiag * 4.2 + 0.0001; d = sdCuore(c / sc + vec2(0.0, 0.5)) * sc; }
    float m = 1.0 - smoothstep(-s * 0.5, s * 0.5, d);
    if (u_reverse) m = 1.0 - m;
    vec4 r = mix(A, B, m);
    if (u_border > 0.0) {
      float bm = smoothstep(-s * 0.5, s * 0.5, d) * (1.0 - smoothstep(u_border * 0.6 - s * 0.5, u_border * 0.6 + s * 0.5, d));
      r = mix(r, vec4(u_borderColor, 1.0), bm * step(0.001, u_p) * step(u_p, 0.999));
    }
    return r;
  }
  float f = campo(q);
  if (u_reverse) f = 1.0 - f;
  float e = u_p * (1.0 + 2.0 * s + u_border) - s - u_border;
  float m = 1.0 - smoothstep(e - s, e, f);
  vec4 r = mix(A, B, m);
  if (u_border > 0.0) {
    float bm = smoothstep(e - s, e, f) * (1.0 - smoothstep(e + u_border - s, e + u_border, f));
    r = mix(r, vec4(u_borderColor, 1.0), bm);
  }
  return r;
}

// un piano (la faccia di un cubo o una cartolina) visto da un occhio davanti allo schermo
vec2 ruotaY(vec2 xz, float a) { float c = cos(a), s = sin(a); return vec2(c * xz.x - s * xz.y, s * xz.x + c * xz.y); }

vec4 effetto(vec2 q, float p) {
  float e = dolce(p);
  float arco = sin(p * 3.14159265);
  if (u_pattern == 301) return q.x < 1.0 - e ? tA(q + vec2(e, 0.0)) : tB(q - vec2(1.0 - e, 0.0));
  if (u_pattern == 302) return q.x > e ? tA(q - vec2(e, 0.0)) : tB(q + vec2(1.0 - e, 0.0));
  if (u_pattern == 303) return q.y < 1.0 - e ? tA(q + vec2(0.0, e)) : tB(q - vec2(0.0, 1.0 - e));
  if (u_pattern == 304) return q.y > e ? tA(q - vec2(0.0, e)) : tB(q + vec2(0.0, 1.0 - e));
  if (u_pattern == 311) return q.x >= 1.0 - e ? sopra(tB(q - vec2(1.0 - e, 0.0)), tA(q)) : tA(q);
  if (u_pattern == 321) {
    vec2 c = q - 0.5;
    float sa = 1.0 + e * 1.6, sb = 1.0 + (1.0 - e) * 1.6;
    vec4 a = vec4(0.0), b = vec4(0.0);
    for (int i = 0; i < 10; i++) {
      float k = float(i) / 9.0 * arco * 0.35;
      a += tA(0.5 + c / (sa + k));
      b += tB(0.5 + c / (sb + k));
    }
    return mix(a / 10.0, b / 10.0, smoothstep(0.4, 0.6, p));
  }
  if (u_pattern == 331) {
    float lato = mix(0.0015, 0.075, 1.0 - abs(2.0 * p - 1.0));
    vec2 cella = vec2(lato / u_aspect, lato);
    vec2 qq = (floor(q / cella) + 0.5) * cella;
    return mix(tA(qq), tB(qq), smoothstep(0.45, 0.55, p));
  }
  if (u_pattern == 341) {
    vec2 d = q - 0.5;
    float r = length(d * vec2(u_aspect, 1.0));
    vec2 w = d / max(r, 1e-4) * sin(r * 42.0 - p * 32.0) * arco * 0.028;
    return mix(tA(q + w), tB(q + w), smoothstep(0.3, 0.7, p));
  }
  if (u_pattern == 351) {
    vec4 m = mix(tA(q), tB(q), smoothstep(0.45, 0.55, p));
    return mix(m, vec4(1.0), pow(arco, 3.0));
  }
  if (u_pattern == 361) {
    vec4 m = mix(tA(q), tB(q), smoothstep(0.35, 0.65, p));
    float n = sin(q.x * 6.0 + p * 9.0) * 0.5 + sin(q.y * 9.0 - p * 7.0 + q.x * 3.0) * 0.5;
    float fronte = smoothstep(0.0, 1.0, (q.x * 0.9 + n * 0.22 + 0.25 - (1.0 - p) * 1.3) * 2.2);
    float l = arco * fronte * 1.5;
    vec3 luce = vec3(1.0, 0.55, 0.18) * l + vec3(1.0, 0.92, 0.7) * pow(l, 4.0);
    return vec4(min(vec3(1.0), m.rgb + luce), max(m.a, min(1.0, l)));
  }
  if (u_pattern == 371) {
    float fase = floor(p * 18.0);
    float riga = floor(q.y * 26.0);
    float h = caso(riga * 13.7 + fase * 7.3);
    float sh = (h - 0.5) * 0.25 * arco * step(0.55, caso(riga + fase * 1.7));
    vec2 qq = q + vec2(sh, 0.0);
    float sw = step(caso(fase * 3.1 + riga * 0.7), p);
    float rs = 0.014 * arco;
    vec4 base = mix(tA(qq), tB(qq), sw);
    vec4 r1 = mix(tA(qq + vec2(rs, 0.0)), tB(qq + vec2(rs, 0.0)), sw);
    vec4 b1 = mix(tA(qq - vec2(rs, 0.0)), tB(qq - vec2(rs, 0.0)), sw);
    return vec4(r1.r, base.g, b1.b, base.a);
  }
  if (u_pattern == 381) {
    vec2 c = (q - 0.5) * vec2(u_aspect, 1.0);
    float ang = arco * 3.0 * max(0.0, 1.0 - length(c) * 1.2);
    vec2 r = vec2(cos(ang) * c.x - sin(ang) * c.y, sin(ang) * c.x + cos(ang) * c.y) / vec2(u_aspect, 1.0) + 0.5;
    return mix(tA(r), tB(r), smoothstep(0.35, 0.65, p));
  }
  if (u_pattern == 391) {
    float rad = arco * 0.028;
    vec4 a = vec4(0.0), b = vec4(0.0);
    for (int i = -3; i <= 3; i++) for (int j = -3; j <= 3; j++) {
      vec2 d = vec2(float(i), float(j)) * rad / 3.0 * vec2(1.0 / u_aspect, 1.0);
      a += tA(q + d);
      b += tB(q + d);
    }
    return mix(a / 49.0, b / 49.0, smoothstep(0.3, 0.7, p));
  }
  if (u_pattern == 421) {
    // zoom sfocato: si entra nella vecchia con la scia, si esce dalla nuova
    vec2 c = q - 0.5;
    vec4 a = vec4(0.0), b = vec4(0.0);
    float sa = 1.0 + e * 2.0, sb = 1.0 + (1.0 - e) * 0.6;
    for (int i = 0; i < 14; i++) {
      float k = float(i) / 13.0 * arco * 0.5;
      a += tA(0.5 + c / (sa + k));
      b += tB(0.5 + c / (sb + k));
    }
    return mix(a / 14.0, b / 14.0, smoothstep(0.42, 0.58, p));
  }
  if (u_pattern == 431) {
    // frusta: la camera gira di scatto, tutto striscia di lato
    float sh = e;
    vec4 a = vec4(0.0), b = vec4(0.0);
    for (int i = 0; i < 16; i++) {
      float k = (float(i) / 15.0 - 0.5) * arco * 0.35;
      a += tA(q + vec2(sh + k, 0.0));
      b += tB(q - vec2(1.0 - sh - k, 0.0));
    }
    return q.x < 1.0 - sh ? a / 16.0 : b / 16.0;
  }
  if (u_pattern == 441) {
    // rotazione: la vecchia gira e si rimpicciolisce, la nuova arriva girando
    vec2 c = (q - 0.5) * vec2(u_aspect, 1.0);
    float ang = e * 6.2831853;
    float s1 = mix(1.0, 3.0, e), s2 = mix(3.0, 1.0, e);
    vec2 ra = vec2(cos(ang) * c.x - sin(ang) * c.y, sin(ang) * c.x + cos(ang) * c.y);
    vec2 qa = ra * s1 / vec2(u_aspect, 1.0) + 0.5, qb = ra * s2 / vec2(u_aspect, 1.0) + 0.5;
    return mix(tA(qa), tB(qb), smoothstep(0.4, 0.6, p));
  }
  if (u_pattern == 451) {
    // lama di luce: una striscia bianca in diagonale spazza via la vecchia
    float x = q.x * 0.8 + q.y * 0.4;
    float fronte = mix(-0.25, 1.45, p);
    vec4 m = x < fronte ? tB(q) : tA(q);
    float l = exp(-pow((x - fronte) * 9.0, 2.0));
    return vec4(min(vec3(1.0), m.rgb + vec3(1.0, 0.97, 0.9) * l * 1.3), max(m.a, l));
  }
  if (u_pattern == 461) {
    // caleidoscopio: l'immagine si piega a spicchi, cambia, si riapre
    vec2 c = (q - 0.5) * vec2(u_aspect, 1.0);
    float r = length(c), seg = 6.2831853 / 8.0;
    float a0 = mod(atan(c.y, c.x) + p * 3.0, seg);
    a0 = abs(a0 - seg * 0.5);
    vec2 k = mix(c, vec2(cos(a0), sin(a0)) * r, arco);
    vec2 qq = k / vec2(u_aspect, 1.0) + 0.5;
    return mix(tA(qq), tB(qq), smoothstep(0.4, 0.6, p));
  }
  if (u_pattern == 471) {
    // aria calda: tutto trema come sopra l'asfalto e si scioglie nella nuova
    vec2 w = vec2(sin(q.y * 60.0 + p * 40.0) + sin(q.y * 23.0 - p * 30.0), cos(q.x * 45.0 + p * 35.0)) * 0.012 * arco;
    float n = caso(floor(q.x * 90.0) + floor(q.y * 50.0) * 91.0);
    return mix(tA(q + w), tB(q + w), smoothstep(n * 0.5, n * 0.5 + 0.5, p));
  }
  if (u_pattern == 481) {
    // tenda: la vecchia si apre dal centro in due metà, con l'ombra
    float h = e * 0.5;
    vec4 b = tB(q) * (0.6 + 0.4 * e);
    if (q.x < 0.5 - h) return tA(q + vec2(h, 0.0)) * (1.0 - 0.25 * smoothstep(0.5 - h - 0.05, 0.5 - h, q.x));
    if (q.x > 0.5 + h) return tA(q - vec2(h, 0.0)) * (1.0 - 0.25 * smoothstep(0.5 + h + 0.05, 0.5 + h, q.x));
    return b;
  }
  if (u_pattern == 491) {
    // sovraesposta: la vecchia si brucia di luce, dalla luce esce la nuova
    vec4 m = mix(tA(q), tB(q), smoothstep(0.45, 0.55, p));
    float l = pow(arco, 1.5);
    return vec4(min(vec3(1.0), m.rgb * (1.0 + l * 3.5) + l * 0.25), m.a);
  }
  if (u_pattern == 521) {
    // polvere: la vecchia si sgretola in granelli e sotto c'è la nuova
    float n = caso(floor(q.x * 320.0) * 1.37 + floor(q.y * 180.0) * 91.7);
    float soglia = q.y * 0.35 + n * 0.65;
    return p > soglia ? tB(q) : tA(q + vec2(0.0, -max(0.0, p - soglia + 0.25) * 0.15));
  }
  if (u_pattern == 401 || u_pattern == 411) {
    // raggio dall'occhio (0,0,-D) attraverso il punto dello schermo; lo schermo è il piano z = 0
    float a = u_aspect;
    vec3 s3 = vec3((q.x - 0.5) * a, 0.5 - q.y, 0.0);
    float D = 2.4;
    vec3 O = vec3(0.0, 0.0, -D);
    vec3 dir = normalize(s3 - O);
    bool cubo = u_pattern == 401;
    float ang = cubo ? e * 1.5707963 : e * 3.14159265;
    float lontano = arco * (cubo ? 0.45 : 0.6);
    vec3 C = vec3(0.0, 0.0, (cubo ? a * 0.5 : 0.0) + lontano);
    // si porta il raggio nel riferimento dell'oggetto: l'oggetto ruota verso sinistra (la faccia di destra viene davanti),
    // qui si applica la rotazione inversa
    vec2 oxz = ruotaY((O - C).xz, ang), dxz = ruotaY(dir.xz, ang);
    vec3 ol = vec3(oxz.x, O.y - C.y, oxz.y), dl = vec3(dxz.x, dir.y, dxz.y);
    vec4 col = vec4(0.0);
    float tMin = 1e9;
    if (cubo) {
      // faccia A davanti (z = -a/2), faccia B a destra (x = +a/2)
      float t = (-a * 0.5 - ol.z) / dl.z;
      vec3 h = ol + t * dl;
      if (t > 0.0 && abs(h.x) <= a * 0.5 && abs(h.y) <= 0.5) { tMin = t; col = tA(vec2((h.x + a * 0.5) / a, 0.5 - h.y)) * (0.55 + 0.45 * cos(ang)); }
      t = (a * 0.5 - ol.x) / dl.x;
      h = ol + t * dl;
      if (t > 0.0 && t < tMin && abs(h.z) <= a * 0.5 && abs(h.y) <= 0.5) { col = tB(vec2((h.z + a * 0.5) / a, 0.5 - h.y)) * (0.55 + 0.45 * sin(ang)); }
    } else {
      float t = -ol.z / dl.z;
      vec3 h = ol + t * dl;
      if (t > 0.0 && abs(h.x) <= a * 0.5 && abs(h.y) <= 0.5) {
        float u = (h.x + a * 0.5) / a;
        float luce = 0.6 + 0.4 * abs(cos(ang));
        col = (ang < 1.5707963 ? tA(vec2(u, 0.5 - h.y)) : tB(vec2(1.0 - u, 0.5 - h.y))) * luce;
      }
    }
    return col;
  }
  return mix(tA(q), tB(q), p);
}

void main() {
  vec2 q = vec2(v_uv.x, 1.0 - v_uv.y);
  vec4 B = texture(u_b, v_uv);
  vec4 A = u_hasA ? texture(u_a, v_uv) : vec4(0.0);
  vec4 r = B;
  if (u_mode == 1) r = mix(A, B, u_p);
  else if (u_mode == 3) {
    vec4 d = vec4(u_dipColor, 1.0);
    r = u_p < 0.5 ? mix(A, d, u_p * 2.0) : mix(d, B, (u_p - 0.5) * 2.0);
  } else if (u_mode == 2) r = tendina(q, A, B);
  else if (u_mode == 4) r = effetto(q, clamp(u_p, 0.0, 1.0));
  o = r * u_opacity;
}`;

export const NOMI_COMBINA = ['u_a', 'u_b', 'u_hasA', 'u_mode', 'u_p', 'u_opacity', 'u_soft', 'u_border', 'u_aspect', 'u_pattern', 'u_reverse', 'u_borderColor', 'u_dipColor'];

/** imposta le uniform della combinazione: le usano il compositore e le anteprime del pannello Transizioni */
export function impostaCombina(gl: WebGL2RenderingContext, u: Record<string, WebGLUniformLocation | null>, tr: Transition | null, prog: number, opacity: number, hasA: boolean, aspect: number) {
  gl.uniform1i(u.u_a, 0);
  gl.uniform1i(u.u_b, 1);
  gl.uniform1i(u.u_hasA, hasA ? 1 : 0);
  const mode = !tr ? 0 : tr.type === 'mix' ? 1 : tr.type === 'wipe' ? 2 : tr.type === 'dve' ? 4 : 3;
  gl.uniform1i(u.u_mode, mode);
  gl.uniform1f(u.u_p, Math.max(0, Math.min(1, prog)));
  gl.uniform1f(u.u_opacity, opacity);
  gl.uniform1f(u.u_soft, tr?.soft ?? 0);
  gl.uniform1f(u.u_border, tr?.border ?? 0);
  gl.uniform1f(u.u_aspect, aspect);
  gl.uniform1i(u.u_pattern, tr?.pattern ?? 1);
  gl.uniform1i(u.u_reverse, tr?.reverse ? 1 : 0);
  const bc = hex(tr?.borderColor ?? '#ffffff'), dc = hex(tr?.color ?? '#000000');
  gl.uniform3f(u.u_borderColor, bc[0], bc[1], bc[2]);
  gl.uniform3f(u.u_dipColor, dc[0], dc[1], dc[2]);
}

/** compila un programma GLSL (errori con il testo del compilatore) */
export function compila(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const mk = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
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

type Tex = { tex: WebGLTexture; src: unknown; w: number; h: number };

function hex(c: string): [number, number, number] {
  const m = c.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map((x) => x + x).join('') : m.slice(0, 6), 16) || 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}


export class Compositore {
  gl: WebGL2RenderingContext;
  private pLayer: WebGLProgram;
  private pComb: WebGLProgram;
  private pMaster: WebGLProgram;
  private pFx: WebGLProgram;
  private uM: Record<string, WebGLUniformLocation | null> = {};
  private uF: Record<string, WebGLUniformLocation | null> = {};
  /** prima/dopo: a sinistra di questa frazione si vede l'originale (0 = tutto col colore finale) */
  prima = 0;
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
  /** il buffer con l'ultima uscita (2 = il mix, 4 = con gli effetti a tempo, 3 = col colore finale) */
  private uscita = 2;
  perso = false;

  constructor(public canvas: HTMLCanvasElement | OffscreenCanvas, preserve = false) {
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: preserve, desynchronized: false, powerPreference: 'high-performance' }) as WebGL2RenderingContext | null;
    if (!gl) throw new Error('WebGL2 non disponibile');
    this.gl = gl;
    this.pLayer = this.prog(VS_LAYER, FS_LAYER);
    this.pComb = this.prog(VS_FULL, FS_COMBINE);
    this.pMaster = this.prog(VS_FULL, FS_MASTER);
    this.pFx = this.prog(VS_FULL, FS_FX);
    for (const n of ['u_src', 'u_res', 'u_off', 'u_zoom', 'u_rot', 'u_blur', 'u_pixel', 'u_rgb', 'u_glitch', 'u_seme', 'u_desat', 'u_invert', 'u_flash', 'u_fade', 'u_luce', 'u_lucePh', 'u_bande', 'u_vhs', 'u_time', 'u_flashCol', 'u_fadeCol', 'u_bagliore', 'u_flare', 'u_flarePh', 'u_arco', 'u_arcoPh', 'u_espo', 'u_neon', 'u_onda', 'u_bolla', 'u_vortice', 'u_caleido', 'u_calore', 'u_zblur'])
      this.uF[n] = gl.getUniformLocation(this.pFx, n);
    for (const n of ['u_res', 'u_size', 'u_crop', 'u_off', 'u_scale', 'u_rot', 'u_tex', 'u_src', 'u_orient', 'u_color', 'u_bright', 'u_contrast', 'u_sat', 'u_hue', 'u_look', 'u_time', 'u_texel', 'u_key', 'u_keyColor', 'u_keyLevel', 'u_keySoft', 'u_keyInv',
      'u_mirror', 'u_temp', 'u_vignette', 'u_alpha', 'u_auto', 'u_autoLo', 'u_autoHi', 'u_autoWb', 'u_autoK', 'u_autoGamma'])
      this.uL[n] = gl.getUniformLocation(this.pLayer, n);
    for (const n of ['u_src', 'u_lift', 'u_gamma', 'u_gain', 'u_shadow', 'u_high', 'u_sat', 'u_contrast', 'u_vignette', 'u_grain', 'u_time', 'u_split'])
      this.uM[n] = gl.getUniformLocation(this.pMaster, n);
    for (const n of NOMI_COMBINA) this.uC[n] = gl.getUniformLocation(this.pComb, n);
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    for (const p of [this.pLayer, this.pComb, this.pMaster, this.pFx]) {
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
    return compila(this.gl, vs, fs);
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
    for (let i = 0; i < 5; i++) {
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
    // dal basso: ogni traccia video si appoggia su quelle sotto, poi i suoi FX a tempo valgono per tutto il mucchio
    const video = p.tracks.filter((t) => t.kind === 'video');
    for (let i = video.length - 1; i >= 0; i--) {
      const tid = video[i].id;
      for (const s of strati) {
        if (s.trackId !== tid) continue;
        const hasA = !!s.a && !!s.tr;
        const okB = s.b ? this.layer(p, s.b, 1, playing, frame) : false;
        const okA = hasA ? this.layer(p, s.a!, 0, playing, frame) : false;
        if (!okB && !okA) continue;
        if (!okB) { // la sorgente B non è pronta: pulisce il suo buffer
          gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[1].fb);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        this.combine(s.tr, s.prog, s.opacity, okA);
      }
      const fx = statoEffetti(p, frame, tid);
      if (fx) {
        this.effetti(fx, frame, cw, ch);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.fbo[4].fb);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.fbo[2].fb);
        gl.blitFramebuffer(0, 0, cw, ch, 0, 0, cw, ch, gl.COLOR_BUFFER_BIT, gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[2].fb);
      }
    }
    const mix = 2;
    // il colore finale (pagina Finale) su tutto il quadro, poi sulla tela; resta nel buffer per gli strumenti
    const g = gradeDi(masterDi(p));
    const uscita = gradeNeutro(g) && this.prima <= 0 ? mix : 3;
    if (uscita === 3) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[3].fb);
      gl.viewport(0, 0, cw, ch);
      gl.disable(gl.BLEND);
      gl.useProgram(this.pMaster);
      const u = this.uM;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.fbo[mix].tex);
      gl.uniform1i(u.u_src, 0);
      gl.uniform3f(u.u_lift, ...g.lift);
      gl.uniform3f(u.u_gamma, ...g.gamma);
      gl.uniform3f(u.u_gain, ...g.gain);
      gl.uniform3f(u.u_shadow, ...g.shadow);
      gl.uniform3f(u.u_high, ...g.high);
      gl.uniform1f(u.u_sat, g.sat);
      gl.uniform1f(u.u_contrast, g.contrast);
      gl.uniform1f(u.u_vignette, g.vignette);
      gl.uniform1f(u.u_grain, g.grain);
      gl.uniform1f(u.u_time, (frame % 10000) / 25);
      gl.uniform1f(u.u_split, this.prima);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    this.uscita = uscita;
    // il logo e i sottotitoli, sopra a tutto
    const firma = firmaSovr(p, frame, cw, ch);
    if (firma) this.sovrimpressione(p, frame, cw, ch, firma, uscita);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.fbo[uscita].fb);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(0, 0, cw, ch, 0, 0, cw, ch, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // i buffer delle clip non più in scena si liberano
    for (const [k, t] of this.texs) {
      if (!this.used.has(k) && !k.startsWith('img:')) { gl.deleteTexture(t.tex); this.texs.delete(k); }
    }
  }

  private sovr: { firma: string; tela: HTMLCanvasElement | OffscreenCanvas } | null = null;

  /** appoggia la sovrimpressione (logo e sottotitoli) sul buffer d'uscita */
  private sovrimpressione(p: Project, frame: number, cw: number, ch: number, firma: string, uscita: number) {
    const gl = this.gl;
    if (!this.sovr || this.sovr.firma !== firma) {
      const tela = this.sovr && this.sovr.tela.width === cw && this.sovr.tela.height === ch ? this.sovr.tela : nuovaTela(cw, ch);
      disegnaSovr(tela.getContext('2d') as CanvasRenderingContext2D, p, frame, cw, ch);
      this.sovr = { firma, tela };
    }
    const t = this.upload('img:sovr', this.sovr.tela as TexImageSource, cw, ch, firma);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[uscita].fb);
    gl.viewport(0, 0, cw, ch);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.pLayer);
    const u = this.uL;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.uniform1i(u.u_tex, 0);
    gl.uniform2f(u.u_res, cw, ch);
    gl.uniform2f(u.u_size, cw, ch);
    gl.uniform4f(u.u_crop, 0, 0, 0, 0);
    gl.uniform2f(u.u_off, 0, 0);
    gl.uniform1f(u.u_scale, 1);
    gl.uniform1f(u.u_rot, 0);
    gl.uniform1i(u.u_src, 0);
    gl.uniform1i(u.u_orient, 0);
    gl.uniform1f(u.u_bright, 0);
    gl.uniform1f(u.u_contrast, 1);
    gl.uniform1f(u.u_sat, 1);
    gl.uniform1f(u.u_hue, 0);
    gl.uniform1i(u.u_look, 0);
    gl.uniform1i(u.u_key, 0);
    gl.uniform1i(u.u_mirror, 0);
    gl.uniform1f(u.u_temp, 0);
    gl.uniform1f(u.u_vignette, 0);
    gl.uniform1f(u.u_alpha, 1);
    gl.uniform1i(u.u_auto, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disable(gl.BLEND);
  }

  /** il passaggio degli effetti a tempo: dal mix (buffer 2) al buffer 4 */
  private effetti(st: StatoFx, frame: number, cw: number, ch: number) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[4].fb);
    gl.viewport(0, 0, cw, ch);
    gl.disable(gl.BLEND);
    gl.useProgram(this.pFx);
    const u = this.uF;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fbo[2].tex);
    gl.uniform1i(u.u_src, 0);
    gl.uniform2f(u.u_res, cw, ch);
    gl.uniform2f(u.u_off, st.dx, st.dy);
    gl.uniform1f(u.u_zoom, st.zoom);
    gl.uniform1f(u.u_rot, st.rot);
    gl.uniform1f(u.u_blur, st.blur);
    gl.uniform1f(u.u_pixel, st.pixel);
    gl.uniform1f(u.u_rgb, st.rgb);
    gl.uniform1f(u.u_glitch, st.glitch);
    gl.uniform1f(u.u_seme, st.seme % 1000);
    gl.uniform1f(u.u_desat, st.desat);
    gl.uniform1f(u.u_invert, st.invert);
    gl.uniform1f(u.u_flash, st.flash);
    gl.uniform1f(u.u_fade, st.fade);
    gl.uniform1f(u.u_luce, st.luce);
    gl.uniform1f(u.u_lucePh, st.lucePh);
    gl.uniform1f(u.u_bande, st.bande);
    gl.uniform1f(u.u_vhs, st.vhs);
    gl.uniform1f(u.u_bagliore, st.bagliore);
    gl.uniform1f(u.u_flare, st.flare);
    gl.uniform1f(u.u_flarePh, st.flarePh);
    gl.uniform1f(u.u_arco, st.arco);
    gl.uniform1f(u.u_arcoPh, st.arcoPh);
    gl.uniform1f(u.u_espo, st.espo);
    gl.uniform1f(u.u_neon, st.neon);
    gl.uniform1f(u.u_onda, st.onda);
    gl.uniform1f(u.u_bolla, st.bolla);
    gl.uniform1f(u.u_vortice, st.vortice);
    gl.uniform1f(u.u_caleido, st.caleido);
    gl.uniform1f(u.u_calore, st.calore);
    gl.uniform1f(u.u_zblur, st.zblur);
    gl.uniform1f(u.u_time, (frame % 10000) / 25);
    gl.uniform3f(u.u_flashCol, ...st.flashCol);
    gl.uniform3f(u.u_fadeCol, ...st.fadeCol);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /** disegna una sorgente nel buffer i (0 = A, 1 = B). Ritorna false se non c'è ancora niente da mostrare */
  private layer(p: Project, s: Sorgente, i: number, playing: boolean, frame: number): boolean {
    const gl = this.gl;
    const c = s.clip;
    const W = p.w, H = p.h;
    let srcKind = 0;
    let tex: WebGLTexture = this.blank;
    let sw = W, sh = H, orient = 0;
    let off: { dx: number; dy: number; scala?: number; alfa?: number } = { dx: 0, dy: 0 };
    let fit = true;
    if (c.kind === 'media' && c.media) {
      const m = mediaOf(p, c);
      if (!m) return false;
      const f = this.fornitore ? this.fornitore(s) : fotogramma(c.id, c.media, s.t, playing, this.canvas.width * Math.min(1, c.tf.scale));
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
      const spec = specAlTempo(c.gen?.title ?? TITLE0, s.local);
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
    // le regolazioni a mano più tutti gli effetti al volo accesi, sommati
    const fe = fxEffettivo(fx);
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
    // zoom lento (Ken Burns): la clip si avvicina piano piano lungo tutta la sua durata
    const kb = fe.zoom ? 1 + fe.zoom * Math.min(1, s.lf / Math.max(1, c.len)) : 1;
    gl.uniform1f(u.u_scale, tf.scale * kb * (off.scala ?? 1));
    gl.uniform1f(u.u_alpha, off.alfa ?? 1);
    gl.uniform1f(u.u_rot, (tf.rot * Math.PI) / 180);
    gl.uniform1i(u.u_src, srcKind);
    gl.uniform1i(u.u_orient, orient);
    const col = hex(c.gen?.color ?? '#000000');
    gl.uniform3f(u.u_color, col[0], col[1], col[2]);
    gl.uniform1f(u.u_bright, fe.bright);
    gl.uniform1f(u.u_contrast, fe.contrast);
    gl.uniform1f(u.u_sat, fe.sat);
    gl.uniform1f(u.u_hue, fe.hue);
    gl.uniform1i(u.u_look, fe.looks);
    gl.uniform1f(u.u_time, (frame % 10000) / 25);
    gl.uniform2f(u.u_texel, 1 / Math.max(1, dw), 1 / Math.max(1, dh));
    gl.uniform1i(u.u_key, fx.key === 'luma' ? 1 : fx.key === 'chroma' ? 2 : 0);
    const kc = hex(fx.keyColor);
    gl.uniform3f(u.u_keyColor, kc[0], kc[1], kc[2]);
    gl.uniform1f(u.u_keyLevel, fx.keyLevel);
    gl.uniform1f(u.u_keySoft, fx.keySoft);
    gl.uniform1i(u.u_keyInv, fx.keyInvert ? 1 : 0);
    gl.uniform1i(u.u_mirror, fe.mirror ? 1 : 0);
    gl.uniform1f(u.u_temp, fe.temp);
    gl.uniform1f(u.u_vignette, fe.vignette);
    const an = c.media && autoColore(p, c) ? mediaRT(c.media)?.colore : undefined;
    gl.uniform1i(u.u_auto, an ? 1 : 0);
    if (an) {
      gl.uniform3f(u.u_autoLo, ...an.lo);
      gl.uniform3f(u.u_autoHi, ...an.hi);
      gl.uniform3f(u.u_autoWb, ...an.wb);
      gl.uniform1f(u.u_autoGamma, an.gamma);
      gl.uniform1f(u.u_autoK, masterDi(p).autoK);
    }
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
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.fbo[1].tex);
    impostaCombina(gl, u, tr, prog, opacity, hasA, this.canvas.width / this.canvas.height);
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
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.fbo[this.uscita].fb);
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
