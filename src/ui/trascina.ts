// Trascinamento interno (dal contenitore alla timeline) fatto con il puntatore, non con il drag & drop HTML5:
// così va col mouse, col dito (Android) e anche nell'app Windows, dove WebView2 riserva il drag & drop
// ai file che arrivano dal sistema.
import { h } from './dom';

export interface Bersaglio {
  el: HTMLElement;
  sopra(x: number, y: number, dato: string): void;
  lascia(x: number, y: number, dato: string): void;
  esci(): void;
}

const bersagli: Bersaglio[] = [];
export function registraBersaglio(b: Bersaglio) { bersagli.push(b); }

/**
 * Da chiamare su pointerdown di un elemento trascinabile. Col mouse parte dopo pochi pixel,
 * col dito dopo una pressione lunga (così il dito può anche solo scorrere la lista).
 */
export function trascinabile(el: HTMLElement, dato: () => string, etichetta: () => string) {
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const x0 = e.clientX, y0 = e.clientY;
    const tocco = e.pointerType === 'touch';
    let attivo = false;
    let fantasma: HTMLElement | null = null;
    let sotto: Bersaglio | null = null;
    let timer = 0;
    let yPrima = y0;
    let scorre = false;
    const lista = el.closest('.bin-pagina') as HTMLElement | null;
    const avvia = () => {
      attivo = true;
      fantasma = h('div', { class: 'fantasma-trascina' }, etichetta());
      document.body.appendChild(fantasma);
      document.body.classList.add('trascina-in-corso');
      navigator.vibrate?.(12);
    };
    if (tocco) timer = window.setTimeout(avvia, 320);
    const trova = (x: number, y: number) => bersagli.find((b) => { const r = b.el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }) ?? null;
    const muovi = (ev: PointerEvent) => {
      if (scorre) {
        // col dito, prima della pressione lunga, la lista scorre a mano (l'elemento non lascia scorrere il browser)
        if (lista) lista.scrollTop -= ev.clientY - yPrima;
        yPrima = ev.clientY;
        return;
      }
      if (!attivo) {
        if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 6) {
          if (tocco) { clearTimeout(timer); scorre = true; yPrima = ev.clientY; return; }
          avvia();
        } else return;
      }
      ev.preventDefault();
      fantasma!.style.transform = `translate(${ev.clientX + 12}px, ${ev.clientY + 12}px)`;
      const b = trova(ev.clientX, ev.clientY);
      if (sotto && sotto !== b) sotto.esci();
      sotto = b;
      b?.sopra(ev.clientX, ev.clientY, dato());
    };
    const su = (ev: PointerEvent) => {
      clearTimeout(timer);
      if (attivo) {
        const b = trova(ev.clientX, ev.clientY);
        if (b) b.lascia(ev.clientX, ev.clientY, dato());
        else sotto?.esci();
      }
      fine();
    };
    const fine = () => {
      fantasma?.remove();
      document.body.classList.remove('trascina-in-corso');
      window.removeEventListener('pointermove', muovi);
      window.removeEventListener('pointerup', su);
      window.removeEventListener('pointercancel', su);
    };
    window.addEventListener('pointermove', muovi, { passive: false });
    window.addEventListener('pointerup', su);
    window.addEventListener('pointercancel', su);
  });
}
