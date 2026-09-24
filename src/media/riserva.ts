// Decodifica audio di riserva per l'app Mac: WebKit fino a Safari 18 non ha l'AudioDecoder di WebCodecs,
// quindi l'audio AAC/MP3 dei video resterebbe muto. Qui si registra in Mediabunny un decoder che manda i
// pacchetti al lato Rust (Symphonia, src-tauri/src/audio_riserva.rs) e riceve i campioni PCM.
// Dove l'AudioDecoder c'è (Windows, Android, Safari 26) non si attiva niente.
import { AudioSample, CustomAudioDecoder, registerDecoder, type AudioCodec, type EncodedPacket } from 'mediabunny';
import { invoke, isTauri } from '../platform';

const STRINGHE: Partial<Record<AudioCodec, string>> = { aac: 'mp4a.40.2', mp3: 'mp3', flac: 'flac', vorbis: 'vorbis' };
const manca = new Set<AudioCodec>();

class DecoderRust extends CustomAudioDecoder {
  private id = 0;

  static override supports(codec: AudioCodec): boolean {
    return manca.has(codec);
  }

  async init() {
    const d = this.config.description;
    let desc: number[] | null = null;
    if (d) desc = Array.from(ArrayBuffer.isView(d) ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength) : new Uint8Array(d as ArrayBuffer));
    this.id = await invoke<number>('audio_apri', { codec: this.codec, sampleRate: this.config.sampleRate, channels: this.config.numberOfChannels, description: desc });
  }

  async decode(packet: EncodedPacket) {
    const buf = await invoke<ArrayBuffer>('audio_decodifica', packet.data, { headers: { 'x-id': String(this.id) } });
    const dv = new DataView(buf);
    const frames = dv.getUint32(0, true), canali = dv.getUint32(4, true), rate = dv.getUint32(8, true);
    if (!frames || !canali) return;
    const data = new Float32Array(buf, 12, frames * canali);
    this.onSample(new AudioSample({ data, format: 'f32', numberOfChannels: canali, sampleRate: rate, timestamp: packet.timestamp }));
  }

  async flush() { /* Symphonia restituisce i campioni subito: niente in coda */ }

  async close() {
    await invoke('audio_chiudi', { id: this.id }).catch(() => {});
  }
}

/** all'avvio: controlla quali codec audio mancano alla WebView e, se serve, accende la riserva Rust */
export async function preparaRiserva(): Promise<string[]> {
  if (!isTauri) return [];
  for (const [codec, s] of Object.entries(STRINGHE) as [AudioCodec, string][]) {
    let ok = false;
    if (typeof AudioDecoder !== 'undefined') {
      try { ok = !!(await AudioDecoder.isConfigSupported({ codec: s, sampleRate: 48000, numberOfChannels: 2 })).supported; } catch { ok = false; }
    }
    if (!ok) manca.add(codec);
  }
  if (manca.size) registerDecoder(DecoderRust);
  return [...manca];
}
