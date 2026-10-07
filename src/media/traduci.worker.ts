// Il worker della traduzione: NLLB-200 (Meta, nella versione di Hugging Face per il browser) traduce i testi fra
// duecento lingue, qui lontano dall'interfaccia. La libreria sta dentro l'app (src/media/libreriaAI.ts, con la CDN di
// riserva); il modello si scarica da Hugging Face una volta e resta nella cache. Il testo non esce mai dal computer.
import { caricaConRipieghi, libreria, nomeTipo, progressoScarico, testoErrore } from './libreriaAI';

import { MODELLI_TRADUZIONE as MODELLI } from './traduci';

type Traduzione = { translation_text: string }[];
type Pipeline = (testi: string[], opz: Record<string, unknown>) => Promise<Traduzione>;

let tr: Pipeline | null = null;
let caricato = '';
let base = '';
const manda = (m: unknown) => (self as unknown as Worker).postMessage(m);

async function carica() {
  if (tr) { manda({ tipo: 'pronto', modello: caricato }); return; }
  const { T, dove } = await libreria(base);
  const progress_callback = progressoScarico(manda);
  // la traduzione sta sul processore: i modelli a codificatore e decodificatore sulla scheda video sbagliano spesso
  const ok = await caricaConRipieghi(MODELLI, ['wasm'], () => ['q8', 'fp32'],
    (r, device, dtype) => T.pipeline('translation', r, { progress_callback, device, dtype }) as Promise<Pipeline>);
  tr = ok.v;
  caricato = ok.repo;
  manda({ tipo: 'pronto', modello: ok.repo, dettaglio: `${nomeTipo(ok.dtype)} · libreria ${dove}` });
}

self.onmessage = async (e: MessageEvent) => {
  const m = e.data as { tipo: string; id?: number; testi?: string[]; da?: string; a?: string; base?: string };
  try {
    if (m.base !== undefined) base = m.base;
    if (m.tipo === 'carica') await carica();
    else if (m.tipo === 'traduci') {
      if (!tr) throw new Error('modello non caricato');
      const out = await tr(m.testi!, { src_lang: m.da, tgt_lang: m.a, max_new_tokens: 256 });
      manda({ tipo: 'tradotto', id: m.id, testi: out.map((x) => x.translation_text) });
    }
  } catch (err) {
    manda({ tipo: 'errore', id: m.id, msg: testoErrore(err) });
  }
};
