// La prova del motore AI (il pulsante "Controlla l'AI" del Centro AI): si carica la libreria come fanno i worker veri
// e le si fa fare un conto piccolo (una moltiplicazione di matrici, che passa dal motore ONNX Runtime in wasm). Così si
// sa subito se l'AI può partire su questo computer, senza scaricare nessun modello.
import { libreria, testoErrore } from './libreriaAI';

self.onmessage = async (e: MessageEvent) => {
  const { base } = e.data as { base?: string };
  const t0 = performance.now();
  try {
    const { T, dove } = await libreria(base);
    const a = new T.Tensor('float32', new Float32Array([1, 2, 3, 4]), [2, 2]);
    const b = new T.Tensor('float32', new Float32Array([0, 1, 1, 0]), [2, 2]);
    const c = await T.matmul(a, b);
    const dati = Array.from(c.data as Float32Array);
    const giusto = dati.join(',') === '2,1,4,3';
    (self as unknown as Worker).postMessage({ ok: giusto, dove, ms: performance.now() - t0, msg: giusto ? '' : 'il conto di prova è sbagliato: ' + dati.join(',') });
  } catch (err) {
    (self as unknown as Worker).postMessage({ ok: false, dove: '', ms: performance.now() - t0, msg: testoErrore(err) });
  }
};
