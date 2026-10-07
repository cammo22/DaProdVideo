// La libreria AI dentro l'app. Le funzioni AI (sottotitoli con Whisper, traduzione, togliere lo sfondo) usano
// transformers.js e il motore ONNX Runtime: prima si scaricavano dalla CDN ogni volta, e se la CDN non rispondeva (rete
// aziendale, CDN lenta, versione sparita) l'AI non partiva. Adesso, prima di ogni build (npm run build lo chiama da solo),
// questo script prende i file giusti dal registro npm, controlla l'impronta (sha512) e li mette in public/ai/: Vite li
// copia in dist/ai/ e i worker li caricano da lì. Se qualcosa va storto non si ferma la build: l'app userà la CDN.
//   node scripts/ai-locale.mjs        (non rifà niente se i file della versione giusta ci sono già)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEST = path.join(ROOT, 'public', 'ai');
/** la versione di transformers.js che usano i worker (deve essere la stessa di CDN_LIBRERIA in src/media/libreriaAI.ts) */
export const TRANSFORMERS = '4.3.1';
const REGISTRO = 'https://registry.npmjs.org';

/** i file di un pacchetto npm (tgz) come mappa nome → contenuto, controllando l'impronta pubblicata */
async function pacchetto(nome, versione) {
  const meta = await (await fetch(`${REGISTRO}/${nome.replace('/', '%2F')}/${versione}`)).json();
  const r = await fetch(meta.dist.tarball);
  if (!r.ok) throw new Error(`${nome}@${versione}: ${r.status}`);
  const tgz = Buffer.from(await r.arrayBuffer());
  const [algo, atteso] = meta.dist.integrity.split('-');
  const vero = crypto.createHash(algo).update(tgz).digest('base64');
  if (vero !== atteso) throw new Error(`${nome}@${versione}: l'impronta non corrisponde`);
  // tar senza programmi esterni: blocchi da 512 byte, nome (con prefisso) e grandezza in ottale
  const tar = zlib.gunzipSync(tgz);
  const out = new Map();
  for (let o = 0; o + 512 <= tar.length;) {
    const testa = tar.subarray(o, o + 512);
    if (testa.every((b) => b === 0)) break;
    const str = (a, b) => testa.subarray(a, b).toString('utf8').replace(/\0.*$/s, '');
    const n = str(0, 100), prefisso = str(345, 500), dim = parseInt(str(124, 136).trim() || '0', 8), tipo = String.fromCharCode(testa[156] || 48);
    const file = (prefisso ? prefisso + '/' : '') + n;
    if (tipo === '0' || tipo === '\0') out.set(file.replace(/^package\//, ''), tar.subarray(o + 512, o + 512 + dim));
    o += 512 + Math.ceil(dim / 512) * 512;
  }
  return { meta, file: out };
}

async function main() {
  const segno = path.join(DEST, 'versione.json');
  try {
    const v = JSON.parse(fs.readFileSync(segno, 'utf8'));
    if (v.transformers === TRANSFORMERS && fs.existsSync(path.join(DEST, 'ort-wasm-simd-threaded.asyncify.wasm'))) { console.log(`ai-locale: transformers.js ${TRANSFORMERS} già pronto`); return; }
  } catch { /* da fare */ }
  const tr = await pacchetto('@huggingface/transformers', TRANSFORMERS);
  const ortVer = tr.meta.dependencies['onnxruntime-web'];
  const ort = await pacchetto('onnxruntime-web', ortVer);
  fs.mkdirSync(DEST, { recursive: true });
  const copia = (p, da, a) => { const b = p.file.get(da); if (!b) throw new Error('manca ' + da); fs.writeFileSync(path.join(DEST, a ?? path.basename(da)), b); };
  copia(tr, 'dist/transformers.min.js');
  copia(tr, 'LICENSE', 'LICENSE-transformers.txt');
  // il motore: la versione "asyncify" è quella che transformers.js 4 usa sia col processore sia con la scheda video
  copia(ort, 'dist/ort-wasm-simd-threaded.asyncify.mjs');
  copia(ort, 'dist/ort-wasm-simd-threaded.asyncify.wasm');
  // ONNX Runtime non mette il file della licenza nel pacchetto: è MIT (Microsoft), lo si scrive qui
  fs.writeFileSync(path.join(DEST, 'LICENSE-onnxruntime.txt'), `onnxruntime-web ${ortVer} · MIT License · Copyright (c) Microsoft Corporation\nhttps://github.com/microsoft/onnxruntime/blob/main/LICENSE\n`);
  fs.writeFileSync(segno, JSON.stringify({ transformers: TRANSFORMERS, ort: ortVer }, null, 2));
  console.log(`ai-locale: transformers.js ${TRANSFORMERS} e onnxruntime-web ${ortVer} in public/ai/`);
}

main().catch((e) => {
  // niente rete o registro irraggiungibile: la build va avanti, l'app userà la CDN come prima
  console.warn('ai-locale: non riesco a preparare la libreria AI locale (' + (e?.message ?? e) + '): l\'app userà la CDN');
});
