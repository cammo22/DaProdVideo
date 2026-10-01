// Il worker della traduzione: NLLB-200 (Meta, nella versione di Hugging Face per il browser) traduce i testi fra
// duecento lingue, qui lontano dall'interfaccia. La libreria (transformers.js) arriva dalla CDN solo la prima volta
// che serve; il modello si scarica da Hugging Face una volta e resta nella cache. Il testo non esce mai dal computer.
export {};

const LIBRERIA = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0/dist/transformers.min.js';
/** il modello, e i ripieghi se uno non si trova (dal più preciso al più leggero) */
const MODELLI = ['Xenova/nllb-200-distilled-600M', 'onnx-community/nllb-200-distilled-600M-ONNX'];

type Traduzione = { translation_text: string }[];
type Pipeline = (testi: string[], opz: Record<string, unknown>) => Promise<Traduzione>;
interface Libreria {
  env: { allowLocalModels: boolean };
  pipeline: (compito: string, modello: string, opz: Record<string, unknown>) => Promise<Pipeline>;
}

let tr: Pipeline | null = null;
let caricato = '';
const manda = (m: unknown) => (self as unknown as Worker).postMessage(m);

async function carica() {
  if (tr) { manda({ tipo: 'pronto', modello: caricato }); return; }
  const T = (await import(/* @vite-ignore */ LIBRERIA)) as Libreria;
  T.env.allowLocalModels = false;
  const visti = new Map<string, number>();
  const progress_callback = (x: { status: string; file?: string; loaded?: number; total?: number }) => {
    if (x.status !== 'progress' || !x.file || !x.total) return;
    const k = Math.floor(((x.loaded ?? 0) / x.total) * 50);
    if (visti.get(x.file) === k) return;
    visti.set(x.file, k);
    manda({ tipo: 'scarico', file: x.file, loaded: x.loaded ?? 0, total: x.total });
  };
  let ultimo: unknown = null;
  for (const m of MODELLI) {
    try {
      tr = await T.pipeline('translation', m, { progress_callback, dtype: 'q8' });
      caricato = m;
      manda({ tipo: 'pronto', modello: m });
      return;
    } catch (e) { ultimo = e; }
  }
  throw new Error('Non riesco a caricare il modello di traduzione: ' + (ultimo instanceof Error ? ultimo.message : String(ultimo)));
}

self.onmessage = async (e: MessageEvent) => {
  const m = e.data as { tipo: string; id?: number; testi?: string[]; da?: string; a?: string };
  try {
    if (m.tipo === 'carica') await carica();
    else if (m.tipo === 'traduci') {
      if (!tr) throw new Error('modello non caricato');
      const out = await tr(m.testi!, { src_lang: m.da, tgt_lang: m.a, max_new_tokens: 256 });
      manda({ tipo: 'tradotto', id: m.id, testi: out.map((x) => x.translation_text) });
    }
  } catch (err) {
    manda({ tipo: 'errore', id: m.id, msg: err instanceof Error ? err.message : String(err) });
  }
};
