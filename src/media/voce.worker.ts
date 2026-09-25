// Il worker della voce: Whisper (il riconoscimento del parlato di OpenAI, nella versione di Hugging Face per il
// browser) gira qui, lontano dall'interfaccia. La libreria (transformers.js) arriva dalla CDN solo la prima volta che
// serve; il modello si scarica da Hugging Face una volta e resta nella cache del browser/app. L'audio non esce mai
// dal computer: tutto il lavoro si fa qui.

const LIBRERIA = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0/dist/transformers.min.js';

type Pipeline = (audio: Float32Array, opz: Record<string, unknown>) => Promise<{ text: string; chunks?: { timestamp: [number, number | null]; text: string }[] }>;
interface Libreria {
  env: { allowLocalModels: boolean };
  pipeline: (compito: string, modello: string, opz: Record<string, unknown>) => Promise<Pipeline>;
}

let asr: Pipeline | null = null;
let caricato = '';
const manda = (m: unknown) => (self as unknown as Worker).postMessage(m);

async function carica(modello: string) {
  if (asr && caricato === modello) { manda({ tipo: 'pronto' }); return; }
  const T = (await import(/* @vite-ignore */ LIBRERIA)) as Libreria;
  T.env.allowLocalModels = false;
  // quanto si è scaricato: un messaggio ogni tanto, non a ogni pezzetto
  const visti = new Map<string, number>();
  const progress_callback = (x: { status: string; file?: string; loaded?: number; total?: number }) => {
    if (x.status !== 'progress' || !x.file || !x.total) return;
    const k = Math.floor(((x.loaded ?? 0) / x.total) * 50);
    if (visti.get(x.file) === k) return;
    visti.set(x.file, k);
    manda({ tipo: 'scarico', file: x.file, loaded: x.loaded ?? 0, total: x.total });
  };
  const gpu = (navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
  const conGpu = gpu ? await gpu.requestAdapter().catch(() => null) : null;
  let device = conGpu ? 'webgpu' : 'wasm';
  try {
    asr = await T.pipeline('automatic-speech-recognition', modello, {
      progress_callback, device, dtype: conGpu ? { encoder_model: 'fp32', decoder_model_merged: 'q4' } : 'q8',
    });
  } catch (e) {
    if (!conGpu) throw e;
    // la scheda video non ce la fa: si va col processore
    device = 'wasm';
    asr = await T.pipeline('automatic-speech-recognition', modello, { progress_callback, device, dtype: 'q8' });
  }
  caricato = modello;
  manda({ tipo: 'pronto', device });
}

self.onmessage = async (e: MessageEvent) => {
  const m = e.data as { tipo: string; id?: number; modello?: string; audio?: Float32Array; lingua?: string; traduci?: boolean };
  try {
    if (m.tipo === 'carica') await carica(m.modello!);
    else if (m.tipo === 'trascrivi') {
      if (!asr) throw new Error('modello non caricato');
      const out = await asr(m.audio!, {
        language: m.lingua === 'en' ? 'english' : 'italian',
        task: m.traduci ? 'translate' : 'transcribe',
        chunk_length_s: 30, stride_length_s: 5, return_timestamps: true,
      });
      const pezzi = (out.chunks?.length ? out.chunks : [{ timestamp: [0, null] as [number, number | null], text: out.text }])
        .map((c) => ({ da: c.timestamp[0], a: c.timestamp[1], testo: c.text }));
      manda({ tipo: 'testo', id: m.id, pezzi });
    }
  } catch (err) {
    manda({ tipo: 'errore', id: m.id, msg: err instanceof Error ? err.message : String(err) });
  }
};
