// Punto d'ingresso del banco di montaggio.
import '@fontsource/orbitron/latin-700.css';
import '@fontsource/orbitron/latin-900.css';
import '@fontsource/rajdhani/latin-500.css';
import '@fontsource/rajdhani/latin-600.css';
import '@fontsource/rajdhani/latin-700.css';
import './stile/editor.css';
import { avvia } from './ui/app';
import { h } from './ui/dom';
import { isTauri } from './platform';
import { preparaRiserva } from './media/riserva';

const radice = document.getElementById('app')!;
let banco: ReturnType<typeof avvia> | null = null;

function nonSupportato(): string | null {
  if (typeof VideoDecoder === 'undefined' || typeof VideoEncoder === 'undefined') return 'Questo browser non ha WebCodecs, il motore video di DaProd Video.';
  const c = document.createElement('canvas');
  if (!c.getContext('webgl2')) return 'Questo browser non ha WebGL2 (serve per mixare i livelli video).';
  return null;
}

const problema = nonSupportato();
if (problema) {
  radice.replaceWith(h('div', { class: 'non-supportato' },
    h('div', { class: 'avvio-targa' },
      h('span', { class: 'marchio-grande' }, 'Da', h('b', null, 'Prod'), ' Video'),
      h('p', null, problema),
      h('p', null, 'Usa Chrome, Edge, Brave, Opera (anche su Android) o Safari 26, oppure scarica l\'app per Windows, Mac o Android.'),
      h('a', { class: 'btn primario', href: 'https://github.com/cammo22/DaProdVideo/releases/latest' }, 'Scarica l\'app'))));
} else {
  // le barre colore all'accensione, come le macchine della sala
  const avvio = h('div', { class: 'avvio' }, h('div', { class: 'avvio-targa' }, h('span', { class: 'marchio-grande' }, 'Da', h('b', null, 'Prod'), ' Video'), h('small', null, '00:00:00:00')));
  document.body.appendChild(avvio);
  // nell'app, prima di aprire qualunque file, si accende (se serve) la decodifica audio di riserva in Rust
  await preparaRiserva().catch(() => []);
  banco = avvia(radice);
  setTimeout(() => { avvio.classList.add('via'); setTimeout(() => avvio.remove(), 500); }, isTauri ? 500 : 900);
}

// agganci per le prove automatiche (test/prove.mjs) e per chi curiosa dalla console
import * as M from './core/montaggio';
import * as TC from './core/timecode';
import * as P from './core/progetto';
import { esporta } from './export/esporta';
import { creaEdl } from './export/edl';
import { motore } from './motore';
import { guadagnoClip, mixaggio } from './media/audio';
import * as SU from './media/suoni';
import * as V from './media/voce';
import * as AG from './ui/aggiornamenti';
import * as LV from './ui/live';
import * as SQ from './core/sequenze';
import * as SOT from './core/sottotitoli';
import * as FE from './core/effettiClip';
import * as G from './render/grafica';
import { pianoVideo } from './render/piano';
import * as Z from './azioni';
import { statoDecoder } from './media/fotogrammi';
import { ripresaDiProva } from './demo';
import { importaFile } from './progetti';
import { mediaRT } from './media/libreria';
import * as B from './core/blocchi';
import * as S from './core/sottotitoli';
(window as unknown as Record<string, unknown>).__dpvTest = { M, TC, P, esporta, creaEdl, motore, guadagnoClip, pianoVideo, Z, statoDecoder, ripresaDiProva, importaFile, proxyStato: (id: string) => mediaRT(id)?.proxyStato, mediaRT, B, S, SU, V, AG, LV, SQ, SOT, FE, G, mixaggio, ui: () => banco };
