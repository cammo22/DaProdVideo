// La pulsantiera: la centralina di montaggio sotto i monitor. Tasti grandi con il numero stampato sopra,
// modi con la spia accesa, patch delle tracce, attacco/stacco, solleva/estrai, rivedi, zoom.
import { store } from '../core/store';
import { esegui, modi } from '../azioni';
import { h, icona } from './dom';
import type { Timeline } from './timeline';

export class Pulsantiera {
  el: HTMLElement;
  private spie: { el: HTMLElement; on: () => boolean }[] = [];

  constructor(tl: Timeline) {
    const tasto = (num: string, ic: string, nome: string, az: string, title: string, cls = '') =>
      h('button', { class: 'tasto-num ' + cls, title, on: { click: () => esegui(az) } }, h('span', { class: 'tasto-numero' }, num), icona(ic, 16), h('span', { class: 'nome' }, nome));
    const modo = (nome: string, az: string, on: () => boolean, title: string, ic?: string) => {
      const el = h('button', { class: 'tasto-modo', title, on: { click: () => esegui(az) } }, h('span', { class: 'led' }), ic ? icona(ic, 14) : null, h('span', null, nome));
      this.spie.push({ el, on });
      return el;
    };
    const piccolo = (nome: string, az: string, title: string, ic?: string) => h('button', { class: 'tasto-piccolo', title, on: { click: () => esegui(az) } }, ic ? icona(ic, 15) : null, nome ? h('span', null, nome) : null);
    const insSovr = h('button', { class: 'tasto-modo largo', title: 'Modo inserisci / sovrascrivi (Ins)', on: { click: () => esegui('modoInserisci') } }, h('span', { class: 'led' }), h('span', { class: 'etichetta-modo' }, 'SOVRASCRIVI'));
    this.spie.push({ el: insSovr, on: () => modi.inserisci });
    this.el = h('div', { class: 'pulsantiera' },
      h('div', { class: 'gruppo-tasti numeri' },
        tasto('1', 'forbici', 'TAGLIA', 'taglia', 'Taglia al cursore (1)'),
        tasto('2', 'cestino', 'ELIMINA', 'elimina', 'Elimina la clip selezionata (2)', 'rosso'),
        tasto('3', 'chiudi', 'CHIUDI', 'eliminaChiudi', 'Elimina e chiudi il buco (3)'),
        tasto('4', 'catena', 'SEPARA', 'separa', 'Separa / unisci audio e video (4)'),
        tasto('5', 'dissolvenza', 'MIX', 'dissolvenza', 'Dissolvenza sul taglio (5)')),
      h('div', { class: 'gruppo-tasti' },
        insSovr,
        modo('RIPPLE', 'ripple', () => modi.ripple, 'Ripple: eliminare e accorciare chiude i buchi (R)', 'ripple'),
        modo('CALAMITA', 'snap', () => modi.snap, 'Aggancio ai tagli e al cursore (N)', 'calamita'),
        modo('ELASTICO', 'elastico', () => modi.elastico, 'Linee elastiche: trasparenza e volume nel tempo (B)', 'elastico')),
      h('div', { class: 'gruppo-tasti' },
        piccolo('IN', 'segnaIn', 'Attacco (I)', 'segnaIn'),
        piccolo('OUT', 'segnaOut', 'Stacco (O)', 'segnaOut'),
        piccolo('INS', 'inserisci', 'Inserisci dal Player (,)'),
        piccolo('SOVR', 'sovrascrivi', 'Sovrascrivi dal Player (.)'),
        piccolo('LIFT', 'solleva', 'Solleva attacco-stacco (Z)'),
        piccolo('EXTRACT', 'estrai', 'Estrai attacco-stacco (X)'),
        piccolo('REVIEW', 'rivedi', 'Rivedi l\'ultimo montaggio con preroll (Shift+R)'),
        piccolo('FOTO', 'istantanea', 'Istantanea del fotogramma nel contenitore (P) · Shift+P fermo immagine', 'foto')),
      h('div', { class: 'gruppo-tasti' },
        piccolo('', 'annulla', 'Annulla (Ctrl+Z)', 'annulla'),
        piccolo('', 'ripeti', 'Ripeti (Ctrl+Y)', 'ripeti'),
        h('button', { class: 'tasto-piccolo', title: 'Zoom indietro (-)', on: { click: () => tl.zoom(1 / 1.5) } }, icona('zoomMeno', 15)),
        h('button', { class: 'tasto-piccolo', title: 'Zoom avanti (+)', on: { click: () => tl.zoom(1.5) } }, icona('zoomPiu', 15)),
        h('button', { class: 'tasto-piccolo', title: 'Tutto il montaggio nella finestra (\\)', on: { click: () => tl.adattaTutto() } }, icona('adatta', 15))));
    store.on('status', () => this.aggiorna());
    this.aggiorna();
  }

  aggiorna() {
    for (const s of this.spie) s.el.classList.toggle('acceso', s.on());
    const e = this.el.querySelector('.etichetta-modo');
    if (e) e.textContent = modi.inserisci ? 'INSERISCI' : 'SOVRASCRIVI';
  }
}
