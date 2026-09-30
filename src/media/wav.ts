// File WAV: si scrivono (mono, 16 bit) per dare l'audio al motore della voce e per salvare quello che ne esce;
// si leggono (16 e 24 bit, float, anche stereo) per riprendere quello che il motore ha prodotto.
// Niente DOM: si prova anche da Node.

/** l'audio mono in un file WAV a 16 bit */
export function codificaWav(audio: Float32Array, sr: number): Uint8Array {
  const n = audio.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const testo = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  testo(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); testo(8, 'WAVE');
  testo(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  testo(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const x = Math.max(-1, Math.min(1, audio[i]));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  return new Uint8Array(buf);
}

/** un WAV (PCM 8/16/24/32 bit o float) in un solo canale: se ce n'è più d'uno si fa la media */
export function leggiWav(dati: ArrayBuffer | Uint8Array): { audio: Float32Array; sr: number } {
  const u8 = dati instanceof Uint8Array ? dati : new Uint8Array(dati);
  const v = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const tag = (o: number) => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));
  if (u8.byteLength < 44 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('non è un file WAV');
  let formato = 1, canali = 1, sr = 48000, bit = 16;
  let o = 12, inizio = -1, lung = 0;
  while (o + 8 <= u8.byteLength) {
    const nome = tag(o);
    let n = v.getUint32(o + 4, true);
    if (nome === 'fmt ') {
      formato = v.getUint16(o + 8, true);
      canali = Math.max(1, v.getUint16(o + 10, true));
      sr = v.getUint32(o + 12, true);
      bit = v.getUint16(o + 22, true);
      // il formato esteso: il vero tipo sta più avanti
      if (formato === 0xfffe && n >= 26) formato = v.getUint16(o + 32, true);
    } else if (nome === 'data') {
      inizio = o + 8;
      // chi scrive "in streaming" lascia la lunghezza a 0 o enorme: si prende quello che c'è
      if (n === 0 || n === 0xffffffff || inizio + n > u8.byteLength) n = u8.byteLength - inizio;
      lung = n;
      break;
    }
    o += 8 + n + (n & 1);
  }
  if (inizio < 0) throw new Error('nel WAV non ci sono dati');
  const byte = bit / 8;
  const frame = byte * canali;
  const nf = Math.floor(lung / frame);
  const out = new Float32Array(nf);
  for (let i = 0; i < nf; i++) {
    let s = 0;
    for (let c = 0; c < canali; c++) {
      const p = inizio + i * frame + c * byte;
      let x: number;
      if (formato === 3) x = bit === 64 ? v.getFloat64(p, true) : v.getFloat32(p, true);
      else if (bit === 8) x = (v.getUint8(p) - 128) / 128;
      else if (bit === 16) x = v.getInt16(p, true) / 32768;
      else if (bit === 24) x = ((v.getUint8(p) | (v.getUint8(p + 1) << 8) | (v.getInt8(p + 2) << 16)) as number) / 8388608;
      else x = v.getInt32(p, true) / 2147483648;
      s += x;
    }
    out[i] = s / canali;
  }
  return { audio: out, sr };
}

/** cambia la frequenza di campionamento (interpolazione lineare: per la voce basta) */
export function ricampiona(a: Float32Array, da: number, a2: number): Float32Array {
  if (da === a2 || !a.length) return a;
  const n = Math.max(1, Math.round((a.length * a2) / da));
  const out = new Float32Array(n);
  const k = da / a2;
  for (let i = 0; i < n; i++) {
    const x = i * k, i0 = Math.floor(x), f = x - i0;
    out[i] = a[Math.min(a.length - 1, i0)] * (1 - f) + a[Math.min(a.length - 1, i0 + 1)] * f;
  }
  return out;
}
