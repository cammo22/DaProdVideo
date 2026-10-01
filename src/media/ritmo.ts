// Il ritmo di un brano: dove cadono i battiti. Si guarda come cambia l'energia del suono (i colpi della batteria la
// fanno salire di botto), si cerca ogni quanto si ripete (la distanza che torna più spesso, fra 60 e 180 battiti al
// minuto) e si sceglie dove allinearla. DaProdMontage ci appoggia i tagli. Funziona su musica ritmata; su un brano senza
// pulsazione non trova niente e il montaggio va avanti a tempo suo.
import { AudioBufferSink } from 'mediabunny';
import { mediaRT } from './libreria';

export interface Ritmo { bpm: number; battiti: number[]; sicurezza: number }

/** il flusso dell'energia: un valore ogni "salto" campioni, la crescita (non la discesa) del suo logaritmo */
function crescita(x: Float32Array, finestra: number, salto: number): Float32Array {
  const n = Math.max(0, Math.floor((x.length - finestra) / salto));
  const e = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    let s = 0;
    const o = k * salto;
    for (let i = 0; i < finestra; i += 2) { const v = x[o + i]; s += v * v; }
    e[k] = Math.log(1e-6 + s / (finestra / 2));
  }
  const o = new Float32Array(n);
  for (let k = 1; k < n; k++) o[k] = Math.max(0, e[k] - e[k - 1]);
  // via la media che scorre (si tengono solo i picchi veri)
  const lisci = new Float32Array(n);
  const R = 8;
  for (let k = 0; k < n; k++) { let s = 0, c = 0; for (let j = Math.max(0, k - R); j <= Math.min(n - 1, k + R); j++) { s += o[j]; c++; } lisci[k] = Math.max(0, o[k] - (s / c) * 1.05); }
  return lisci;
}

/** battiti di un brano mono a "sr" campioni al secondo (meglio se già a ~11-16 kHz); null se non si sente un ritmo */
export function trovaBattiti(x: Float32Array, sr: number, bpmMin = 60, bpmMax = 180): Ritmo | null {
  const finestra = Math.max(256, Math.round(sr * 0.046)), salto = Math.max(64, Math.round(sr * 0.0116));
  const onset = crescita(x, finestra, salto);
  if (onset.length < 200) return null;
  const dt = salto / sr;
  const lagMin = Math.floor(60 / bpmMax / dt), lagMax = Math.ceil(60 / bpmMin / dt);
  // l'autocorrelazione dei colpi: il ritardo che torna più spesso è la durata di un battito
  let migliore = 0, lagBest = 0;
  const media = onset.reduce((a, b) => a + b, 0) / onset.length;
  const corr = new Float32Array(lagMax + 2);
  for (let lag = lagMin; lag <= lagMax; lag++) {
    let s = 0, n = 0;
    for (let k = 0; k + lag < onset.length; k++) { s += onset[k] * onset[k + lag]; n++; }
    corr[lag] = s / Math.max(1, n);
  }
  // si preferiscono i tempi vicini a 120 (la metà e il doppio dello stesso ritmo si confondono)
  for (let lag = lagMin; lag <= lagMax; lag++) {
    const bpm = 60 / (lag * dt);
    const peso = 1 - 0.18 * Math.abs(Math.log2(bpm / 120));
    const v = (corr[lag] + 0.5 * (corr[lag * 2] ?? 0) * (lag * 2 <= lagMax ? 1 : 0)) * peso;
    if (v > migliore) { migliore = v; lagBest = lag; }
  }
  if (!lagBest || migliore < media * media * 1.5) return null;
  // la posizione dei battiti: dove stanno meglio i colpi (a passo mezzo-decimo di battito)
  let fase = 0, forza = -1;
  for (let f = 0; f < lagBest; f++) {
    let s = 0;
    for (let k = f; k < onset.length; k += lagBest) s += onset[k];
    if (s > forza) { forza = s; fase = f; }
  }
  const battiti: number[] = [];
  for (let k = fase; k < onset.length; k += lagBest) battiti.push((k + 1) * dt + finestra / sr / 2);
  const sicurezza = Math.max(0, Math.min(1, forza / Math.max(1e-9, onset.reduce((a, b) => a + b, 0) / onset.length * (onset.length / lagBest) * 3)));
  return { bpm: Math.round((60 / (lagBest * dt)) * 10) / 10, battiti, sicurezza };
}

/** i battiti di un file audio del contenitore (i primi cinque minuti), o null */
export async function battitiDi(mediaId: string, avanza?: (k: number) => void): Promise<Ritmo | null> {
  const r = mediaRT(mediaId);
  if (!r?.a || !r.aDecodable) return null;
  const SR = 11025, MAX = 300;
  const sink = new AudioBufferSink(r.a);
  const mono = new Float32Array(SR * MAX);
  let n = 0;
  try {
    for await (const { buffer, timestamp } of sink.buffers(0, MAX)) {
      if (timestamp > MAX) break;
      const ch = buffer.numberOfChannels, len = buffer.length, passo = buffer.sampleRate / SR;
      const dati: Float32Array[] = [];
      for (let c = 0; c < ch; c++) dati.push(buffer.getChannelData(c));
      const o0 = Math.round(timestamp * SR);
      for (let i = 0; ; i++) {
        const s = Math.floor(i * passo);
        if (s >= len) break;
        let v = 0;
        for (let c = 0; c < ch; c++) v += dati[c][s];
        const o = o0 + i;
        if (o < mono.length) { mono[o] = v / ch; n = Math.max(n, o + 1); }
      }
      avanza?.(Math.min(1, timestamp / MAX));
    }
  } catch { /* si usa quello che è arrivato */ }
  return n > SR * 8 ? trovaBattiti(mono.subarray(0, n), SR) : null;
}
