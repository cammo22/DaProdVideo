// Il contenitore (il "bin" di EDIUS): i file importati, i generatori della sala e le transizioni.
// Doppio clic = nel Player · trascina = nella timeline · clic sui generatori = al cursore.
import { store } from '../core/store';
import { motore } from '../motore';
import { mediaRT, quandoPicchi } from '../media/libreria';
import { durataUmana } from '../core/timecode';
import { esegui, inserisciGeneratore, montaDalPlayer, modi } from '../azioni';
import { importaDialogo, importaDaDrop, ricollega, togliMedia } from '../progetti';
import { avviso, chiedi, h, icona, menuContesto } from './dom';
import { trascinabile } from './trascina';
import type { MediaItem } from '../core/tipi';
import { projectEnd } from '../core/progetto';

type Scheda = 'media' | 'generatori' | 'transizioni';

export class Contenitore {
  el: HTMLElement;
  private lista: HTMLElement;
  private schede: Record<Scheda, HTMLElement>;
  private corpo: HTMLElement;
  private filtro = '';

  constructor() {
    this.lista = h('div', { class: 'bin-lista' });
    const cerca = h('input', { class: 'bin-cerca', type: 'search', placeholder: 'Cerca…' }) as HTMLInputElement;
    cerca.addEventListener('input', () => { this.filtro = cerca.value.toLowerCase(); this.disegnaMedia(); });
    const media = h('div', { class: 'bin-pagina' },
      h('div', { class: 'bin-barra' },
        h('button', { class: 'btn primario piccolo', title: 'Importa video, audio e immagini (Ctrl+I)', on: { click: () => importaDialogo() } }, icona('importa', 15), 'Importa'),
        cerca),
      this.lista);
    const gen = this.paginaGeneratori();
    const tr = this.paginaTransizioni();
    this.schede = { media, generatori: gen, transizioni: tr };
    this.corpo = h('div', { class: 'bin-corpo' }, media);
    const tab = (id: Scheda, nome: string) => h('button', { class: 'scheda' + (id === 'media' ? ' attiva' : ''), 'data-s': id, on: { click: () => this.mostra(id) } }, nome);
    this.el = h('section', { class: 'pannello contenitore' },
      h('header', { class: 'schede' }, tab('media', 'Contenitore'), tab('generatori', 'Generatori'), tab('transizioni', 'Transizioni')),
      this.corpo);
    // file dal sistema lasciati cadere sul contenitore
    this.el.addEventListener('dragover', (e) => { if (e.dataTransfer?.types.includes('Files')) { e.preventDefault(); this.el.classList.add('sopra'); } });
    this.el.addEventListener('dragleave', () => this.el.classList.remove('sopra'));
    this.el.addEventListener('drop', (e) => {
      this.el.classList.remove('sopra');
      if (!e.dataTransfer?.files.length) return;
      e.preventDefault();
      e.stopPropagation();
      void importaDaDrop(e.dataTransfer);
    });
    store.on('doc', () => this.disegnaMedia());
    store.on('status', () => this.evidenzia());
    quandoPicchi(() => {});
    this.disegnaMedia();
  }

  mostra(s: Scheda) {
    this.corpo.replaceChildren(this.schede[s]);
    this.el.querySelectorAll('.scheda').forEach((b) => b.classList.toggle('attiva', (b as HTMLElement).dataset.s === s));
  }

  private evidenzia() {
    this.lista.querySelectorAll('.bin-voce').forEach((el) => el.classList.toggle('nel-player', (el as HTMLElement).dataset.id === motore.playerMedia));
  }

  private firma = '';
  disegnaMedia(forza = false) {
    const p = store.doc;
    // si ricostruisce solo se cambia qualcosa che si vede qui (non a ogni spostamento di clip)
    const usi = new Map<string, number>();
    for (const c of p.clips) if (c.media) usi.set(c.media, (usi.get(c.media) ?? 0) + 1);
    const firma = this.filtro + '|' + p.media.map((m) => [m.id, m.name, m.markIn, m.markOut, usi.get(m.id) ?? 0, mediaRT(m.id)?.stato, !!mediaRT(m.id)?.poster].join(',')).join(';');
    if (!forza && firma === this.firma) return;
    this.firma = firma;
    const voci = p.media.filter((m) => !this.filtro || m.name.toLowerCase().includes(this.filtro));
    if (!p.media.length) {
      this.lista.replaceChildren(h('div', { class: 'bin-vuoto' },
        h('div', { class: 'bin-vuoto-icona' }, icona('importa', 34)),
        h('b', null, 'Trascina qui i tuoi video'),
        h('span', null, 'oppure premi Importa. Poi doppio clic per vederli nel Player, trascinali nella timeline.'),
        h('button', { class: 'btn piccolo', on: { click: () => document.dispatchEvent(new CustomEvent('dpv:demo')) } }, '✨ Prova con il montaggio dimostrativo')));
      return;
    }
    const usati = new Map<string, number>();
    for (const c of p.clips) if (c.media) usati.set(c.media, (usati.get(c.media) ?? 0) + 1);
    this.lista.replaceChildren(...voci.map((m) => this.voce(m, usati.get(m.id) ?? 0)));
    this.evidenzia();
  }

  private voce(m: MediaItem, usi: number): HTMLElement {
    const rt = mediaRT(m.id);
    const ok = rt?.stato === 'ok';
    const poster = h('div', { class: 'bin-poster' });
    if (rt?.poster) {
      const c = h('canvas', { width: 160, height: 90 });
      const ctx = c.getContext('2d')!;
      const src = rt.poster as HTMLCanvasElement;
      const k = Math.min(160 / (src.width || 1), 90 / (src.height || 1));
      ctx.drawImage(src, (160 - src.width * k) / 2, (90 - src.height * k) / 2, src.width * k, src.height * k);
      poster.appendChild(c);
    } else if (m.type === 'audio') {
      poster.appendChild(icona('onda', 36));
      poster.classList.add('audio');
    } else poster.appendChild(icona(ok ? 'schermo' : 'x', 30));
    const badge = [m.hasVideo && m.type !== 'image' ? 'V' : '', m.type === 'image' ? 'IMG' : '', m.hasAudio ? 'A' + (m.channels > 2 ? m.channels : '') : ''].filter(Boolean).join(' ');
    const info = m.type === 'audio' ? `${m.acodec.toUpperCase()} · ${m.sampleRate / 1000} kHz` : `${m.width}×${m.height}${m.fps ? ' · ' + Math.round(m.fps * 100) / 100 + ' fps' : ''}`;
    const el = h('div', {
      class: 'bin-voce' + (ok ? '' : ' offline'), 'data-id': m.id, title: `${m.name}\n${m.container} · ${m.vcodec || ''} ${m.acodec || ''}\n${info}`,
      on: {
        dblclick: () => { motore.caricaPlayer(m.id); motore.setMonitor('player'); },
        click: () => { if (matchMedia('(pointer: coarse)').matches) { motore.caricaPlayer(m.id); motore.setMonitor('player'); } },
        contextmenu: (e: MouseEvent) => {
          e.preventDefault();
          menuContesto(e.clientX, e.clientY, [
            { nome: 'Apri nel Player', fn: () => { motore.caricaPlayer(m.id); motore.setMonitor('player'); } },
            { nome: 'Metti nella timeline al cursore', fn: () => { motore.caricaPlayer(m.id); montaDalPlayer(modi.inserisci ? 'insert' : 'overwrite'); } },
            { nome: 'Metti in coda alla timeline', fn: () => { motore.caricaPlayer(m.id); motore.vaiA(projectEnd(store.doc)); montaDalPlayer('overwrite'); } },
            { sep: true },
            { nome: 'Rinomina…', fn: async () => { const n = await chiedi('Rinomina', 'Nome', m.name); if (n) store.edit('Rinomina', () => { m.name = n; }); } },
            { nome: 'Ricollega file mancanti…', disattiva: ok, fn: () => ricollega() },
            { nome: 'Togli dal contenitore', fn: () => togliMedia(m.id) },
          ]);
        },
      },
    },
      poster,
      h('div', { class: 'bin-testo' },
        h('b', null, m.name),
        h('span', null, ok ? `${m.type === 'image' ? 'immagine' : durataUmana(m.duration - (m.t0 || 0))} · ${info}` : (rt?.stato === 'caricamento' ? 'apro…' : 'OFFLINE · da ricollegare'))),
      h('div', { class: 'bin-badge' }, badge ? h('span', { class: 'badge' }, badge) : null, usi ? h('span', { class: 'badge usato', title: 'Clip nella timeline' }, '×' + usi) : null,
        m.markIn != null || m.markOut != null ? h('span', { class: 'badge segnato', title: 'Attacco/stacco segnati' }, 'I/O') : null));
    trascinabile(el, () => 'm:' + m.id, () => '🎞 ' + m.name);
    return el;
  }

  private paginaGeneratori(): HTMLElement {
    const g = (kind: 'bars' | 'color' | 'countdown' | 'title' | 'nero', nome: string, desc: string, anteprima: string, extra?: () => void) => {
      const el = h('div', {
        class: 'gen-voce', title: 'Clic: al cursore · Trascina: dove vuoi',
        on: { click: () => { if (extra) extra(); else inserisciGeneratore(kind); avviso(`${nome} al cursore`, 'ok', 1000); } },
      }, h('div', { class: 'gen-anteprima ' + anteprima }), h('div', { class: 'bin-testo' }, h('b', null, nome), h('span', null, desc)));
      if (!extra) trascinabile(el, () => 'g:' + kind, () => '📺 ' + nome);
      return el;
    };
    const titolo = (stile: 'fisso' | 'sottopancia' | 'rullo' | 'crawl', testo: string) => () => {
      const ids = inserisciGeneratore('title');
      store.edit('Stile titolo', (p) => { for (const c of p.clips) if (ids.includes(c.id) && c.gen?.title) { c.gen.title.style = stile; c.gen.title.text = testo; if (stile === 'sottopancia') { c.gen.title.size = 56; c.gen.title.align = 'left'; } if (stile === 'rullo') { c.len = c.len * 3; c.gen.title.size = 64; } if (stile === 'crawl') { c.len = c.len * 2; c.gen.title.size = 50; c.gen.title.y = 0.9; c.gen.title.box = true; } } });
    };
    return h('div', { class: 'bin-pagina gen-lista' },
      h('p', { class: 'nota' }, 'Le macchine della sala: clic per metterle al cursore, o trascinale nella timeline.'),
      g('bars', 'Barre colore + tono', 'SMPTE con tono 1 kHz a −18 dBFS, per tarare monitor e livelli', 'barre'),
      g('countdown', 'Countdown da pellicola', 'da 8 a 2 con il "2-pop", come l\'academy leader', 'countdown'),
      g('nero', 'Nero', 'cinque secondi di nero (per il fondo o le pause)', 'nero'),
      g('color', 'Colore pieno', 'fondo colorato (il colore si cambia nelle proprietà)', 'colore'),
      h('h4', null, 'Titolatrice'),
      g('title', 'Titolo', 'testo fisso al centro', 'titolo'),
      g('title', 'Sottopancia', 'nome e ruolo in basso a sinistra, stile TG', 'sottopancia', titolo('sottopancia', 'Mario Rossi\nregista')),
      g('title', 'Rullo titoli', 'i titoli di coda che salgono', 'rullo', titolo('rullo', 'DaProd Video\n\nMontaggio\nDaProd\n\nMusica\nDaProd\n\nGrazie per la visione')),
      g('title', 'Crawl', 'la scritta che scorre in basso (ticker)', 'crawl', titolo('crawl', 'ULTIM\'ORA · DaProd Video: il montaggio vecchio stile, moderno dentro · ')),
    );
  }

  private paginaTransizioni(): HTMLElement {
    const t = (id: string, nome: string, desc: string, pat?: number) => {
      const cv = h('canvas', { class: 'tr-anteprima', width: 96, height: 54 });
      anteprimaTransizione(cv, id, pat);
      const el = h('div', {
        class: 'gen-voce', title: 'Trascina sul taglio · clic: sul taglio sotto il cursore o sulla clip selezionata',
        on: {
          click: () => {
            if (id === 'mix') esegui('dissolvenza');
            else if (id === 'dip') esegui('passaggioNero');
            else {
              esegui('tendina');
              store.edit('Tendina', (p) => { for (const c of p.clips) if (c.trIn?.type === 'wipe' && (store.sel.has(c.id) || Math.abs(c.start - store.head) < 13)) c.trIn.pattern = pat ?? 1; });
            }
          },
        },
      }, cv, h('div', { class: 'bin-testo' }, h('b', null, nome), h('span', null, desc)));
      trascinabile(el, () => 't:' + (id === 'wipe' ? 'wipe:' + pat : id), () => '✦ ' + nome);
      return el;
    };
    return h('div', { class: 'bin-pagina gen-lista' },
      h('p', { class: 'nota' }, 'Come sul mixer video: trascina sul taglio fra due clip. Durata e bordo si cambiano nelle proprietà.'),
      t('mix', 'Dissolvenza incrociata', 'il MIX classico · tasto 5'),
      t('dip', 'Passaggio al nero', 'si scende al nero e si risale · tasto 7'),
      h('h4', null, 'Tendine SMPTE'),
      t('wipe', '1 · Orizzontale', 'da sinistra a destra · tasto 6', 1),
      t('wipe', '2 · Verticale', 'dall\'alto in basso', 2),
      t('wipe', '3 · Angolo', 'dall\'angolo in alto a sinistra', 3),
      t('wipe', '21 · Porta', 'si apre dal centro in orizzontale', 21),
      t('wipe', '22 · Porta orizzontale', 'si apre dal centro in verticale', 22),
      t('wipe', '41 · Diagonale', 'di traverso', 41),
      t('wipe', '101 · Scatola', 'un quadrato che cresce dal centro', 101),
      t('wipe', '102 · Rombo', 'un diamante dal centro', 102),
      t('wipe', '119 · Iride', 'il cerchio del cinema muto', 119),
      t('wipe', '201 · Orologio', 'la lancetta che gira', 201),
      t('wipe', '7 · Veneziana', 'a strisce', 7),
    );
  }
}

/** piccola anteprima animata della tendina, calcolata come nello shader */
function anteprimaTransizione(cv: HTMLCanvasElement, id: string, pat?: number) {
  const ctx = cv.getContext('2d')!;
  const W = cv.width, H = cv.height;
  const img = ctx.createImageData(W, H);
  let t = Math.random();
  const campo = (u: number, v: number): number => {
    const cx = u - 0.5, cy = v - 0.5;
    switch (pat) {
      case 2: return v;
      case 3: return Math.max(u, v);
      case 21: return Math.abs(cx) * 2;
      case 22: return Math.abs(cy) * 2;
      case 41: return (u + v) / 2;
      case 101: return Math.max(Math.abs(cx), Math.abs(cy)) * 2;
      case 102: return Math.abs(cx) + Math.abs(cy);
      case 119: return Math.hypot(cx * W / H, cy) / Math.hypot(0.5 * W / H, 0.5);
      case 201: return ((Math.atan2(cx, -cy) / (Math.PI * 2)) + 1) % 1;
      case 7: return (u * 8) % 1;
      default: return u;
    }
  };
  const disegna = () => {
    t = (t + 0.012) % 1.3;
    const p = Math.min(1, t);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H;
      let k: number;
      if (id === 'mix') k = p;
      else if (id === 'dip') k = p < 0.5 ? -1 + p * 2 : (p - 0.5) * 2;
      else k = campo(u, v) < p ? 1 : 0;
      const i = (y * W + x) * 4;
      // A = blu DaProd, B = oro
      const a = [40, 70, 150], b = [255, 205, 70];
      let c: number[];
      if (id === 'dip') c = k < 0 ? a.map((z) => z * -k) : b.map((z) => z * k);
      else c = a.map((z, j) => z + (b[j] - z) * k);
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };
  disegna();
  let raf = 0;
  cv.addEventListener('pointerenter', () => { const go = () => { disegna(); raf = requestAnimationFrame(go); }; go(); });
  cv.addEventListener('pointerleave', () => cancelAnimationFrame(raf));
}
