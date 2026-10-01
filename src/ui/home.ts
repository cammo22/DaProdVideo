// La pagina iniziale: i progetti. Da qui si ricomincia, si apre un progetto (uno dei recenti o uno da file), si va
// al montaggio automatico o si torna al montaggio in corso. Compare quando si apre il programma (se non si è
// aperto un file col doppio clic) e quando si preme "Progetti" in alto o File → Pagina iniziale.
import { store } from '../core/store';
import { FORMATI } from '../core/tipi';
import { apri, apriRecente, dimenticaRecente, nuovo, recenti, type Recente } from '../progetti';
import { h, icona } from './dom';

const FORMATI_RAPIDI = ['hd25', 'hd30', 'hd24', 'vert25', 'quad25', 'uhd25'];

const quando = (t: number) => {
  const d = Date.now() - t;
  if (d < 60_000) return 'adesso';
  if (d < 3_600_000) return `${Math.floor(d / 60_000)} min fa`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)} ore fa`;
  const g = Math.floor(d / 86_400_000);
  return g === 1 ? 'ieri' : g < 30 ? `${g} giorni fa` : new Date(t).toLocaleDateString('it-IT');
};
const durataUmana = (s: number) => { const m = Math.floor(s / 60), r = Math.round(s % 60); return m ? `${m}:${String(r).padStart(2, '0')}` : `${r} s`; };

export class Home {
  el: HTMLElement;
  private corpo: HTMLElement;
  private formato = 'hd25';
  visibile = false;

  constructor(private vaiAMontage: () => void) {
    this.corpo = h('div', { class: 'home-corpo' });
    this.el = h('div', { class: 'home', style: 'display:none' },
      h('div', { class: 'home-dentro' },
        h('header', { class: 'home-testa' },
          h('span', { class: 'moneta' }, 'D'),
          h('div', null, h('b', null, 'DaProd Video'), h('small', null, 'i tuoi progetti')),
          h('button', { class: 'btn-icona home-chiudi', title: 'Torna al montaggio (Esc)', on: { click: () => this.nascondi() } }, icona('x', 18))),
        this.corpo));
    document.addEventListener('keydown', (e) => { if (this.visibile && e.key === 'Escape') { e.stopPropagation(); this.nascondi(); } }, true);
  }

  mostra() {
    this.disegna();
    this.el.style.display = '';
    this.visibile = true;
  }

  nascondi() {
    this.el.style.display = 'none';
    this.visibile = false;
  }

  private disegna() {
    const p = store.doc;
    const inCorso = p.clips.length || p.media.length;
    // 1 · ricominciare
    const scelti = FORMATI.filter((f) => FORMATI_RAPIDI.includes(f.id));
    const chipFormati = h('div', { class: 'isp-chips' }, scelti.map((f) => h('button', {
      class: 'chip' + (f.id === this.formato ? ' acceso' : ''), 'data-f': f.id, title: f.nome,
      on: { click: (e: MouseEvent) => { this.formato = f.id; (e.currentTarget as HTMLElement).parentElement!.querySelectorAll('.chip').forEach((c) => c.classList.toggle('acceso', (c as HTMLElement).dataset.f === f.id)); } },
    }, f.nome.replace(' · ', ' ').replace('Verticale 1080×1920', 'Verticale').replace('Quadrato 1080×1080', 'Quadrato').replace('UHD 4K', '4K'))));
    const nuovoB = h('button', { class: 'btn primario home-grande', on: { click: async () => { const f = FORMATI.find((x) => x.id === this.formato) ?? FORMATI[0]; await nuovo(f); if (!(store.dirty && store.doc.clips.length)) this.nascondi(); } } }, '＋ Nuovo progetto');
    const apriB = h('button', { class: 'btn home-grande', on: { click: async () => { this.nascondi(); await apri(); } } }, icona('apri', 16), ' Apri un progetto…');
    const mont = h('button', { class: 'btn home-grande home-montage', title: 'Butta dentro le foto e il programma monta da solo', on: { click: () => { this.nascondi(); this.vaiAMontage(); } } }, '✨ DaProdMontage · il montaggio automatico');
    const demo = h('button', { class: 'btn-mini', on: { click: () => { this.nascondi(); document.dispatchEvent(new CustomEvent('dpv:demo')); } } }, 'Prova con il montaggio dimostrativo');

    const sinistra = h('section', { class: 'home-col' },
      inCorso ? h('div', { class: 'home-continua' },
        h('b', null, 'Montaggio in corso'),
        h('span', null, `${p.name || 'Montaggio senza nome'} · ${p.clips.filter((c) => c.kind !== 'fx').length} clip`),
        h('button', { class: 'btn primario', on: { click: () => this.nascondi() } }, '▶ Continua')) : null,
      h('h3', null, 'Ricomincia'),
      chipFormati, nuovoB, apriB, mont, demo);

    // 2 · i recenti
    const lista = recenti();
    const carta = (r: Recente) => h('div', { class: 'home-carta', 'data-chiave': r.chiave, title: r.path ?? r.nome, on: { click: async () => { if (await apriRecente(r)) this.nascondi(); } } },
      r.miniatura ? h('img', { src: r.miniatura, alt: '' }) : h('div', { class: 'home-vuota' }, icona('montaggio', 30)),
      h('div', { class: 'home-info' }, h('b', null, r.nome), h('small', null, `${r.clip} clip · ${durataUmana(r.durata)} · ${r.formato}`), h('small', null, quando(r.data))),
      h('button', { class: 'home-togli btn-icona', title: 'Toglila dall\'elenco (il progetto resta dov\'è)', on: { click: (e: MouseEvent) => { e.stopPropagation(); dimenticaRecente(r.chiave); this.disegna(); } } }, icona('x', 13)));
    const destra = h('section', { class: 'home-col home-recenti' },
      h('h3', null, 'Progetti recenti'),
      lista.length ? h('div', { class: 'home-griglia' }, lista.map(carta))
        : h('div', { class: 'home-nulla' }, h('b', null, 'Ancora niente'), h('p', null, 'I progetti che salvi o apri compaiono qui, con la loro miniatura, pronti da riaprire con un clic.')));
    this.corpo.replaceChildren(sinistra, destra);
  }
}

