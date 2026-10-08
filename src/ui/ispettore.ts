// Le proprietà della clip scelta, semplici: un riassunto in alto, gli effetti al volo come interruttori,
// poche regolazioni che servono davvero (opacità, zoom, colore, volume, durata, transizioni) e il resto
// chiuso in "Avanzate". Il colore di tutto il montaggio sta nella pagina Finale.
import { store } from '../core/store';
import type { Clip, TitleSpec } from '../core/tipi';
import { clipById, end, isVideoClip, mediaOf, trackOf, TF0, FX0 } from '../core/progetto';
import { frameToTc, fps } from '../core/timecode';
import { avviso, h, evidenzia } from './dom';
import * as M from '../core/montaggio';
import { esegui, modi, mettiBlocco, inserisciGeneratore } from '../azioni';
import { ATTACCHI, attacca, attaccatiA } from './attacca';
import { apriDialogoScritto } from './dialogo';
import { DIREZIONALI, EFFETTI, TENDINE } from '../render/transizioni';
import { oggettoSulQuadro, tracciate } from '../core/traccia';
import type { Project } from '../core/tipi';
import { EFFETTI_AUDIO, EFFETTI_VIDEO, adatte, alternaEffetto } from '../effetti';
import { cambiaModello, durataDelBlocco, EFFETTI_TEMPO, effettoTempo, haCentro, nomeBlocco, nuovoBlocco, posaBlocco, taglioDelBlocco, taglioVicino, transizioneSul } from '../core/blocchi';
import { SUONI } from '../core/suoni';
import { ascoltaSuono } from '../media/audio';
import { bolla, MOVIMENTI, MOVIMENTI_3D, movimento3D, movimentoPronto, presentazione, SFONDI } from '../core/cornici';
import { ANIMAZIONI as CATALOGO_ANIM, GRUPPI_ANIM, animazione, nuovaAnim, valoriDi, type CampoAnim } from '../core/animazioni';
import { CHIAVI, coloriChiave, QUALITA_RITAGLIO, SPILL0 } from '../core/sfondo';
import { modelliPer, modelloRitaglio, maschereAggiornate } from '../media/ritaglio';
import { azzeraPunti, elaboraClip, fermaClip, impostaModo, lavoroDi, modiPossibili, modoSfondo, NOMI_MODO, provaOggetto, scegliColore, scegliOggetto, statoMaschere, togliColoreExtra, togliPunto, trovaColore } from './sfondo';

type Campo = { el: HTMLElement; aggiorna: () => void };

/** tutti gli stili della titolatrice (l'elenco delle proprietà) */
const STILI_TITOLO: [string, string][] = [
  ['fisso', 'Fisso'], ['sottopancia', 'Sottopancia'], ['notiziario', 'Notiziario (due targhe)'], ['rullo', 'Rullo (sale)'], ['crawl', 'Crawl (scorre)'],
  ['neon', 'Neon (si accende)'], ['cinema', 'Cinema (si avvicina)'], ['macchina', 'Macchina da scrivere'], ['rimbalzo', 'Rimbalzo'],
  ['social', 'Social (fascia)'], ['citazione', 'Citazione'], ['gradiente', 'Sfumato'], ['etichetta', 'Etichetta'], ['rivela', 'Rivela'],
  ['glitch', 'Glitch'], ['grande', 'Grande'], ['cascata', 'Cascata (lettere che cadono)'], ['assembla', 'Si compone (lettere da lontano)'],
  ['onda', 'Onda (lettere che ondeggiano)'], ['evidenzia', 'Evidenziatore'], ['karaoke', 'Karaoke'], ['estruso', '3D (lettere con spessore)'],
  ['ombraLunga', 'Ombra lunga'], ['contorno', 'Solo contorno'],
];
const ANIMAZIONI: [string, string][] = [['', 'Come lo stile'], ['dissolve', 'Dissolve'], ['sale', 'Sale'], ['scende', 'Scende'], ['sinistra', 'Da sinistra'], ['destra', 'Da destra'], ['zoom', 'Zoom'], ['rimbalza', 'Rimbalza']];

/** le icone delle animazioni Retro 3D nei pulsanti */
const ICONE_RETRO: Record<string, string> = { 'r3-logo': '🥇', 'r3-wordart': '🌈', 'r3-tubi': '🧪', 'r3-warp': '🌠', 'r3-griglia': '🌅', 'r3-cubo': '🧊', 'r3-crawl': '📜', 'r3-tunnel': '🌀', 'r3-terreno': '🏔', 'r3-pianeta': '🪐' };

/** le sezioni del pannello: l'icona del pulsante, cosa c'è dentro (una riga), il colore della striscia */
const SEZIONI: Record<string, { icona: string; cosa: string; tinta: string }> = {
  fxv: { icona: '⚡', cosa: 'vivace, cinema, pellicola, vignetta… un clic', tinta: '#ffd54a' },
  fxa: { icona: '🎚', cosa: 'voce chiara, radio, eco, ovattato… un clic', tinta: '#ffd54a' },
  immagine: { icona: '🖼', cosa: 'grandezza, riquadro, bolla, movimento', tinta: '#35e8ff' },
  sfondo: { icona: '✂️', cosa: 'green screen o AI: persona, soggetto, oggetto', tinta: '#5dffb4' },
  segui: { icona: '🎯', cosa: 'traccia un oggetto e attaccaci testo ed effetti', tinta: '#ff3df2' },
  tre: { icona: '🧊', cosa: 'giri, ribaltoni, voli e animazioni 3D anni \'90', tinta: '#8f7bff' },
  voce: { icona: '🎙', cosa: 'dialoghi, voce fuori campo, sottotitoli', tinta: '#ff8a3d' },
  colore: { icona: '🎨', cosa: 'luce, contrasto, saturazione, temperatura', tinta: '#ff6b9e' },
  audio: { icona: '🔊', cosa: 'volume e panorama', tinta: '#5dffb4' },
  durata: { icona: '⏱', cosa: 'quanto dura, velocità', tinta: '#a19db0' },
  trclip: { icona: '🔀', cosa: 'all\'inizio e alla fine della clip', tinta: '#35e8ff' },
  generatore: { icona: '🎛', cosa: 'colore, barre, tono', tinta: '#a19db0' },
  animazione: { icona: '✨', cosa: 'testi, colori e numeri dell\'animazione', tinta: '#ff3df2' },
  titolo: { icona: '🅣', cosa: 'testo, stile, carattere, entrata', tinta: '#ff3df2' },
  csuono: { icona: '🔔', cosa: 'un suono che parte con la clip', tinta: '#ffd54a' },
  avanzate: { icona: '⚙️', cosa: 'posizione al pixel, rotazione, ritaglio, tinta', tinta: '#6f6b7d' },
  bdurata: { icona: '⏱', cosa: 'più lungo = più lento', tinta: '#a19db0' },
  btipo: { icona: '✨', cosa: 'quale, forza, colore, centro', tinta: '#ff3df2' },
  bsuono: { icona: '🔔', cosa: 'whoosh, colpo, zap…', tinta: '#ffd54a' },
};

export class Ispettore {
  el: HTMLElement;
  private corpo: HTMLElement;
  private campi: Campo[] = [];
  private firma = '';
  /** le sezioni aperte (di partenza sono tutte chiuse; si ricorda finché il programma è aperto) */
  private aperti = new Set<string>();
  /** di che tipo è quello che si sta guardando (clip video, audio, titolo…): l'ordine delle sezioni si ricorda per ognuno */
  private chiave = '';

  constructor() {
    this.corpo = h('div', { class: 'isp-corpo' });
    this.el = h('div', { class: 'ispettore' }, this.corpo);
    store.on('sel', () => this.costruisci());
    store.on('doc', () => this.costruisci());
    // le maschere dell'AI sono pronte (o è cambiato il lavoro): il gruppo "Togli lo sfondo" si rifà
    const rifai = () => { this.firma = ''; this.costruisci(); };
    document.addEventListener('dpv:maschere', rifai);
    document.addEventListener('dpv:lavoro-sfondo', rifai);
    this.costruisci();
  }

  private sel(): Clip[] {
    return store.doc.clips.filter((c) => store.sel.has(c.id));
  }

  private costruisci() {
    const cs = this.sel();
    // si ricostruisce se cambia la scelta o se cambiano i blocchi FX (le transizioni della clip scelta)
    const firma = cs.map((c) => c.id + c.kind + (c.fxb ? c.fxb.id : '') + ':' + c.fx.key + (c.fx.keyColori?.length ?? 0) + (c.gen?.anim?.id ?? '') + (c.ritaglio ? c.ritaglio.modo + (c.ritaglio.punti?.length ?? 0) + (maschereAggiornate(c) ? 'ok' : 'no') : ''))
      .join(',') + '|' + store.doc.clips.filter((c) => c.kind === 'fx').map((c) => c.id + c.start + ':' + c.len + (c.fxb?.id ?? '')).join(',');
    if (firma === this.firma && this.campi.length) { for (const c of this.campi) c.aggiorna(); return; }
    this.firma = firma;
    this.campi = [];
    if (!cs.length) {
      this.corpo.replaceChildren(h('div', { class: 'isp-vuoto' },
        h('b', null, 'Nessuna clip scelta'),
        h('p', null, 'Clicca una clip nella timeline: qui trovi il riassunto, gli effetti al volo e le poche regolazioni che servono. Il colore di tutto il montaggio si fa nella pagina Finale.'),
        h('ul', { class: 'isp-tasti' },
          h('li', null, h('kbd', null, '1'), ' taglia (le tracce accese) e sceglie il pezzo più corto'),
          h('li', null, h('kbd', null, '2'), ' elimina e passa alla clip dopo'),
          h('li', null, h('kbd', null, 'S'), ' separa o unisce i gruppi di clip'),
          h('li', null, h('kbd', null, 'Q'), ' / ', h('kbd', null, 'W'), ' via lo scarto a sinistra / a destra'),
          h('li', null, h('kbd', null, 'rotella'), ' un fotogramma alla volta, col suono'),
          h('li', null, h('kbd', null, 'Ctrl'), '+', h('kbd', null, 'rotella'), ' zoom della timeline')),
        // da qui si arriva a tutto il resto: la ricerca dei comandi e la guida
        h('div', { class: 'isp-aiuti' },
          h('button', { class: 'btn', on: { click: () => document.dispatchEvent(new CustomEvent('dpv:cerca')) } }, '🔍 Cerca un comando ', h('kbd', null, 'Ctrl K')),
          h('button', { class: 'btn', on: { click: () => document.dispatchEvent(new CustomEvent('dpv:guida')) } }, '📖 Come si fa ', h('kbd', null, 'F1')))));
      return;
    }
    const blocchi = cs.filter((c) => c.kind === 'fx');
    if (blocchi.length === cs.length) { const tr = blocchi[0].fxb?.tipo === 'transizione'; this.corpo.replaceChildren(...this.conOrdine(tr ? 'blocco:transizione' : 'blocco:effetto', this.blocchi(blocchi))); return; }
    const video = cs.filter(isVideoClip);
    const audio = cs.filter((c) => !isVideoClip(c) && c.kind !== 'fx');
    const primo = video[0] ?? audio[0];
    const p = store.doc;
    const r = fps(p.rate);
    const m = mediaOf(p, primo);
    const out: HTMLElement[] = [];
    // ——— il riassunto: cos'è, dove sta, da dove viene
    const tipo = primo.kind === 'title' ? (primo.gen?.anim ? 'Animazione' : 'Titolo') : primo.kind === 'media' ? (m?.type === 'image' ? 'Immagine' : isVideoClip(primo) ? 'Video' : 'Audio') : 'Generatore';
    const legate = primo.link ? p.clips.filter((c) => c.link === primo.link).length - 1 : 0;
    out.push(h('div', { class: 'isp-testa' },
      h('input', {
        class: 'isp-nome', value: cs.length > 1 ? `${cs.length} clip scelte` : primo.name, disabled: cs.length > 1,
        on: { change: (e: Event) => store.edit('Rinomina clip', () => { for (const c of this.sel()) c.name = (e.target as HTMLInputElement).value; }) },
      }),
      h('div', { class: 'isp-riassunto' },
        h('span', { class: 'chip-tipo' }, tipo),
        h('span', null, 'da ', h('b', { class: 'tc-testo' }, frameToTc(primo.start, p.rate, p.drop))),
        h('span', null, 'dura ', h('b', null, (primo.len / r).toFixed(2).replace('.', ',') + ' s')),
        legate ? h('span', { class: 'chip-link' }, `⛓ +${legate}`) : null,
        m && m.type !== 'audio' && m.width ? h('span', null, `${m.width}×${m.height}${m.fps ? ' · ' + Math.round(m.fps * 100) / 100 + ' fps' : ''}`) : null,
        m ? h('span', { class: 'isp-sorgente' }, m.name) : h('span', null, trackOf(p, primo.track).name))));

    // ——— gli effetti al volo: interruttori, niente cursori
    const chips = (lista: typeof EFFETTI_VIDEO, quali: Clip[]) => h('div', { class: 'isp-chips' }, lista.filter((e) => adatte(e, quali).length).map((e) => {
      const b = h('button', { class: 'chip', title: e.info, on: { click: () => alternaEffetto(e.id, adatte(e, this.sel()).map((c) => c.id)) } }, e.nome);
      const agg = () => { const q = adatte(e, this.sel()); b.classList.toggle('acceso', q.length > 0 && q.every((c) => e.acceso(c, store.doc))); };
      agg();
      this.campi.push({ el: b, aggiorna: agg });
      return b;
    }));
    // ——— i pulsanti grandi: le cose che si fanno di più, a un clic
    const ripresa = video.find((c) => c.kind === 'media' && mediaOf(p, c)?.type === 'video');
    const evento = (n: string, d?: string) => document.dispatchEvent(new CustomEvent(n, { detail: d }));
    if (video.length && primo.kind === 'media') {
      out.push(this.azioniRapide([
        ...(ripresa ? [['🎯', primo.traccia ? 'Attacca all\'oggetto' : 'Segui un oggetto', 'Segna un oggetto e attaccaci scritte, frecce, censura, faretto…', () => { this.vai('segui'); if (!primo.traccia) evento('dpv:mira'); }] as [string, string, string, () => void]] : []),
        ['✂️', 'Scontorna', 'Togli lo sfondo: green screen o AI', () => this.vai('sfondo')],
        ['🧊', '3D e animazioni', 'Giri, voli e animazioni 3D anni \'90', () => this.vai('tre')],
        ['💬', 'Testo sopra', 'Un titolo sopra la clip, dal suo inizio', () => { inserisciGeneratore('title', primo.start); }],
        ['🎙', 'Dialogo / voce', 'Scrivi un dialogo: sottotitoli e voci AI', () => apriDialogoScritto()],
        ['⏩', 'Velocità', 'Rallenta o velocizza (Alt+E)', () => esegui('velocita')],
        ...(!ripresa ? [['🎨', 'Colore', 'Luce, contrasto, saturazione', () => this.vai('colore')] as [string, string, string, () => void]] : []),
      ]));
    } else if (video.length) {
      out.push(this.azioniRapide([
        ['🎯', 'Segui un oggetto', 'Fa seguire a questa clip un oggetto tracciato', () => this.vai('segui')],
        ['🧊', '3D e animazioni', 'Giri, voli e animazioni 3D anni \'90', () => this.vai('tre')],
        ['⏩', 'Velocità', 'Rallenta o velocizza (Alt+E)', () => esegui('velocita')],
      ]));
    } else if (audio.length) {
      out.push(this.azioniRapide([
        ['🔊', 'Volume', 'Volume e panorama', () => this.vai('audio')],
        ['🎚', 'Effetti', 'Voce chiara, radio, eco…', () => this.vai('fxa')],
        ['⏩', 'Velocità', 'Rallenta o velocizza col tono giusto', () => esegui('velocita')],
        ['🎙', 'Dialogo / voce', 'Scrivi un dialogo: sottotitoli e voci AI', () => apriDialogoScritto()],
        ['📝', 'Sottotitoli AI', 'L\'AI ascolta e scrive i sottotitoli', () => evento('dpv:finale', 'sottotitoli')],
        ['🗣', 'Fai parlare', 'La voce AI legge i sottotitoli', () => evento('dpv:fai-parlare')],
      ]));
    }

    const accesi = (lista: typeof EFFETTI_VIDEO, quali: Clip[]) => lista.filter((e) => { const q = adatte(e, quali); return q.length > 0 && q.every((c) => e.acceso(c, p)); }).length;
    const nAcc = (lista: typeof EFFETTI_VIDEO, quali: Clip[]) => { const n = accesi(lista, quali); return n ? `${n} ${n === 1 ? 'acceso' : 'accesi'}` : undefined; };
    if (video.length) out.push(this.gruppo('fxv', 'Effetti al volo', [chips(EFFETTI_VIDEO, video)], nAcc(EFFETTI_VIDEO, video)));
    if (audio.length) out.push(this.gruppo('fxa', video.length ? 'Effetti audio' : 'Effetti al volo', [chips(EFFETTI_AUDIO, audio)], nAcc(EFFETTI_AUDIO, audio)));

    if (video.length) {
      out.push(this.gruppo('immagine', 'Immagine', [
        this.cursore('Opacità', 0, 100, 1, (c) => Math.round(c.opacity * 100), (c, v) => { c.opacity = v / 100; c.opKeys = []; }, '%', video),
        this.cursore('Zoom', 20, 300, 1, (c) => Math.round(c.tf.scale * 100), (c, v) => { c.tf.scale = v / 100; }, '%', video),
        this.cursore('Larghezza (stira)', 20, 300, 1, (c) => Math.round((c.tf.sx ?? 1) * 100), (c, v) => { c.tf.sx = v / 100; }, '%', video),
        this.pulsanti([
          ['Adatta', () => store.edit('Adatta', () => { for (const c of video) c.tf = { ...TF0 }; })],
          ['Riempi', () => store.edit('Riempi', () => { for (const c of video) { const mm = mediaOf(p, c); if (mm?.width) { const w = mm.rotation % 180 ? mm.height : mm.width, hh = mm.rotation % 180 ? mm.width : mm.height; const kf = Math.min(p.w / w, p.h / hh), kc = Math.max(p.w / w, p.h / hh); c.tf.scale = kc / kf; } } })],
          ['Riquadro ↘', () => store.edit('Riquadro', () => { for (const c of video) c.tf = { ...TF0, scale: 0.33, x: p.w * 0.3, y: p.h * 0.28 }; })],
          ['Riquadro ↖', () => store.edit('Riquadro', () => { for (const c of video) c.tf = { ...TF0, scale: 0.33, x: -p.w * 0.3, y: -p.h * 0.28 }; })],
          ['Bolla ↘', () => store.edit('Bolla', () => { for (const c of video) c.tf = bolla(p, mediaOf(p, c), 'bd'); })],
          ['Presentazione', () => store.edit('Presentazione', () => { for (const c of video) c.tf = presentazione(); })],
        ]),
        h('p', { class: 'nota' }, 'Sull\'immagine del monitor: trascina per spostare, tira un angolo per ingrandire (Maiusc: stira, Ctrl: dal centro), tira un lato per stirare da una parte sola, il pallino in alto la gira. Ctrl+clic sceglie quella che sta sotto. ✂ Ritaglia: i lati ritagliano.'),
        h('div', { class: 'isp-riga' }, h('label', null, 'Movimento'),
          h('div', { class: 'isp-chips' }, MOVIMENTI.map((m) => h('button', {
            class: 'chip' + ((m.id === 'fermo') === !video[0].tfFine && m.id === 'fermo' ? ' acceso' : ''),
            title: m.id === 'fermo' ? 'Resta dov\'è' : 'Dall\'inizio alla fine della clip, partendo (o arrivando) dove sta adesso',
            on: { click: () => store.edit('Movimento: ' + m.nome, (pp) => { for (const c of video) { const x = clipById(pp, c.id); if (x) movimentoPronto(pp, x, m.id); } }) },
          }, m.nome)))),
        video[0].tfFine ? h('p', { class: 'nota' }, `Si muove: parte da dove l'hai messa all'inizio, passa da ${(video[0].via ?? []).length ? (video[0].via ?? []).length + ' tappe di mezzo e ' : 'nessuna tappa di mezzo, '}arriva dove l'hai messa alla fine. Sul monitor: ◀ Inizio / Fine ▶, ＋ Tappa; o ferma il cursore fra due tappe e muovi: ne nasce una.`) : null,
        this.cursore('Angoli tondi', 0, 100, 1, (c) => Math.round((c.tf.angoli ?? 0) * 100), (c, v) => { c.tf.angoli = v / 100; }, '%', video),
        this.cursore('Ombra', 0, 100, 1, (c) => Math.round((c.tf.ombra ?? 0) * 100), (c, v) => { c.tf.ombra = v / 100; }, '%', video),
        video.some((c) => c.opKeys.length) ? h('p', { class: 'nota' }, 'Questa clip ha una linea elastica: la trasparenza cambia nel tempo. Muovere l\'opacità la toglie.') : null,
      ]));
      out.push(this.sfondoGruppo(video));
      const sg = this.seguiGruppo(video);
      if (sg) out.push(sg);
      out.push(this.treGruppo(video));
      const v0 = video[0].fx;
      const ritoccato = v0.bright !== 0 || v0.contrast !== 1 || v0.sat !== 1 || (v0.temp ?? 0) !== 0 || v0.hue !== 0;
      out.push(this.gruppo('colore', 'Colore della clip', [
        this.cursore('Luce', -50, 50, 1, (c) => Math.round(c.fx.bright * 100), (c, v) => { c.fx.bright = v / 100; }, '', video),
        this.cursore('Contrasto', 50, 150, 1, (c) => Math.round(c.fx.contrast * 100), (c, v) => { c.fx.contrast = v / 100; }, '%', video),
        this.cursore('Saturazione', 0, 200, 1, (c) => Math.round(c.fx.sat * 100), (c, v) => { c.fx.sat = v / 100; }, '%', video),
        this.cursore('Temperatura', -100, 100, 1, (c) => Math.round((c.fx.temp ?? 0) * 100), (c, v) => { c.fx.temp = v / 100; }, '', video),
        this.pulsanti([['Azzera', () => store.edit('Azzera colore', () => { for (const c of video) { c.fx.bright = 0; c.fx.contrast = 1; c.fx.sat = 1; c.fx.hue = 0; c.fx.temp = 0; c.fx.look = 'none'; c.fx.effetti = undefined; } })]]),
        h('p', { class: 'nota' }, 'Il colore automatico e il look di tutto il montaggio sono nella pagina Finale.'),
      ], ritoccato ? 'ritoccato' : undefined));
    }
    if (audio.length) {
      out.push(this.gruppo('audio', 'Volume', [
        this.cursore('Volume', -40, 12, 0.5, (c) => c.gain, (c, v) => { c.gain = v; c.gainKeys = []; }, 'dB', audio),
        this.pulsanti([['−6', () => store.edit('Volume', () => { for (const c of audio) { c.gain = -6; c.gainKeys = []; } })], ['0 dB', () => store.edit('Volume', () => { for (const c of audio) { c.gain = 0; c.gainKeys = []; } })], ['+6', () => store.edit('Volume', () => { for (const c of audio) { c.gain = 6; c.gainKeys = []; } })], ['Muto', () => store.edit('Volume', () => { for (const c of audio) { c.gain = -60; c.gainKeys = []; } })]]),
        this.cursore('Panorama', -100, 100, 1, (c) => Math.round(c.pan * 100), (c, v) => { c.pan = v / 100; }, '', audio),
        h('p', { class: 'nota' }, 'Nella timeline la linea gialla è il volume: trascinala, doppio clic per un punto, tasto destro → "Abbassa qui".'),
      ]));
    }
    if (video.some((c) => c.kind === 'media') || audio.length) out.push(this.voceGruppo());
    out.push(this.gruppo('durata', 'Durata', [this.durata(cs.filter((c) => c.kind !== 'fx'))]));
    if (video.length) out.push(this.transizioniClip(video[0]));
    const gen = cs.filter((c) => c.kind === 'color' || c.kind === 'bars' || c.kind === 'tone' || c.kind === 'beep');
    if (gen.length) {
      const g0 = gen[0];
      const righe: HTMLElement[] = [];
      if (g0.kind === 'color') {
        righe.push(this.colore('Colore', (c) => c.gen?.color ?? '#000', (c, v) => { c.gen = { ...c.gen, color: v }; }, gen));
        righe.push(this.colore('Sfuma verso', (c) => c.gen?.color2 ?? c.gen?.color ?? '#000', (c, v) => { c.gen = { ...c.gen, color2: v }; }, gen));
        righe.push(this.pulsanti([
          ...SFONDI.map((x): [string, () => void] => [x.nome, () => store.edit('Sfondo ' + x.nome, () => { for (const c of gen) c.gen = { ...c.gen, color: x.a, color2: x.b }; })]),
          ['Pieno', () => store.edit('Colore pieno', () => { for (const c of gen) { const g = { ...c.gen }; delete g.color2; c.gen = g; } })],
        ]));
      }
      if (g0.kind === 'bars') righe.push(this.scelta('Barre', [['smpte', 'SMPTE (NTSC)'], ['ebu', 'EBU 100/75 (PAL)']], (c) => c.gen?.bars ?? 'smpte', (c, v) => { c.gen = { ...c.gen, bars: v as 'smpte' }; }, gen));
      if (g0.kind === 'tone' || g0.kind === 'beep') {
        righe.push(this.cursore('Frequenza', 100, 10000, 10, (c) => c.gen?.freq ?? 1000, (c, v) => { c.gen = { ...c.gen, freq: v }; }, 'Hz', gen));
        righe.push(this.cursore('Livello', -40, 0, 1, (c) => c.gen?.level ?? -18, (c, v) => { c.gen = { ...c.gen, level: v }; }, 'dBFS', gen));
      }
      out.push(this.gruppo('generatore', 'Generatore', righe));
    }
    const animati = cs.filter((c) => c.kind === 'title' && c.gen?.anim);
    const titoli = cs.filter((c) => c.kind === 'title' && !c.gen?.anim);
    if (animati.length) out.push(this.animatrice(animati));
    if (titoli.length) out.push(this.titolatrice(titoli));
    // il suono dentro titoli, countdown e colori: niente clip audio a parte, sta tutto su una riga
    const sonore = cs.filter((c) => c.kind === 'title' || c.kind === 'countdown' || c.kind === 'color');
    if (sonore.length) {
      const s0 = sonore[0].sfx ?? {};
      const suoni: [string, string][] = [['', 'Nessun suono'], ...SUONI.map((x) => [x.id, x.nome] as [string, string])];
      out.push(this.gruppo('csuono', 'Suono della clip', [
        this.spunta('Suono acceso', (c) => !!c.sfx?.audio && !!c.sfx.suono, (c, v) => { c.sfx ??= {}; if (c.sfx.suono) c.sfx.audio = v; }, sonore),
        this.scelta('Suono', suoni, (c) => c.sfx?.suono ?? '', (c, v) => { c.sfx ??= {}; c.sfx.suono = v || undefined; c.sfx.audio = !!v; if (v && c.id === sonore[0].id) ascoltaSuono(v, c.sfx.volume ?? 0); }, sonore),
        this.cursore('Volume', -24, 6, 1, (c) => c.sfx?.volume ?? 0, (c, v) => { c.sfx ??= {}; c.sfx.volume = v; }, ' dB', sonore),
        h('div', { class: 'isp-chips' }, h('button', { class: 'chip', disabled: !s0.suono, on: { click: () => { if (s0.suono) ascoltaSuono(s0.suono, s0.volume ?? 0); } } }, '▶ Ascolta')),
        h('p', { class: 'nota' }, sonore[0].kind === 'countdown' ? 'Il countdown fa un bip a ogni numero (scegli "Bip" per quello classico).' : 'Parte con la clip. Si accende anche dall\'altoparlante sulla clip nella timeline.'),
      ]));
    }
    if (video.length) {
      out.push(this.gruppo('avanzate', 'Avanzate (posizione e ritaglio)', [
        this.cursore('Orizzontale', -p.w, p.w, 1, (c) => Math.round(c.tf.x), (c, v) => { c.tf.x = v; }, 'px', video),
        this.cursore('Verticale', -p.h, p.h, 1, (c) => Math.round(c.tf.y), (c, v) => { c.tf.y = v; }, 'px', video),
        this.cursore('Rotazione', -180, 180, 0.5, (c) => c.tf.rot, (c, v) => { c.tf.rot = v; }, '°', video),
        this.cursore('Ritaglio sinistra', 0, 50, 0.5, (c) => c.tf.cropL * 100, (c, v) => { c.tf.cropL = v / 100; }, '%', video),
        this.cursore('Ritaglio destra', 0, 50, 0.5, (c) => c.tf.cropR * 100, (c, v) => { c.tf.cropR = v / 100; }, '%', video),
        this.cursore('Ritaglio sopra', 0, 50, 0.5, (c) => c.tf.cropT * 100, (c, v) => { c.tf.cropT = v / 100; }, '%', video),
        this.cursore('Ritaglio sotto', 0, 50, 0.5, (c) => c.tf.cropB * 100, (c, v) => { c.tf.cropB = v / 100; }, '%', video),
        this.cursore('Tinta', -180, 180, 1, (c) => c.fx.hue, (c, v) => { c.fx.hue = v; }, '°', video),
      ]));
    }
    const chiaveClip = (primo.kind === 'title' ? (primo.gen?.anim ? 'animazione' : 'titolo') : primo.kind === 'media' ? (m?.type === 'image' ? 'immagine' : isVideoClip(primo) ? 'video' : 'audio') : 'generatore');
    this.corpo.replaceChildren(...this.conOrdine('clip:' + chiaveClip, out));
  }

  /** le animazioni del catalogo: quale, e tutti i campi che ha (testi, colori, numeri), con i loro valori */
  private animatrice(an: Clip[]): HTMLElement {
    const a0 = an[0].gen!.anim!;
    const def = animazione(a0.id);
    const righe: (HTMLElement | null)[] = [];
    righe.push(this.scelta('Animazione', GRUPPI_ANIM.flatMap((g) => CATALOGO_ANIM.filter((a) => a.gruppo === g.id).map((a) => [a.id, `${g.nome} · ${a.nome}`] as [string, string])),
      (c) => c.gen?.anim?.id ?? '', (c, v) => {
        if (!c.gen?.anim || c.gen.anim.id === v) return;
        // si cambia animazione tenendo i testi (nome, ruolo, titolo…) e dove sta e quanto è grande: i colori e il carattere sono quelli pensati per la nuova
        const vecchi = valoriDi(c.gen.anim);
        const nuova = nuovaAnim(v);
        const nuovoDef = animazione(v);
        for (const k of nuovoDef?.campi ?? []) {
          if ((k.tipo === 'testo' || k.tipo === 'lungo' || k.id === 'pos' || k.id === 'dim') && k.id in vecchi && typeof vecchi[k.id] === typeof k.def) nuova.v[k.id] = vecchi[k.id];
        }
        c.gen.anim = nuova;
        c.name = animazione(v)?.nome ?? c.name;
      }, an));
    if (def) righe.push(h('p', { class: 'nota' }, def.info + '.' + (def.fondo ? ' Riempie tutto il quadro: mettila su una traccia sotto le altre.' : '')));
    const v0 = () => valoriDi(store.doc.clips.find((c) => c.id === an[0].id)?.gen?.anim ?? a0);
    const metti = (id: string, valore: string | number | boolean) => store.edit('Animazione: ' + id, (pp) => { for (const x of an) { const z = pp.clips.find((c) => c.id === x.id); if (z?.gen?.anim) z.gen.anim.v[id] = valore; } });
    const valoreDi = (c: Clip, k: CampoAnim) => (c.gen?.anim?.v[k.id] ?? k.def);
    for (const k of def?.campi ?? []) {
      if (k.tipo === 'testo' || k.tipo === 'lungo') {
        const campo = (k.tipo === 'lungo' ? h('textarea', { class: 'campo-testo', rows: 4 }) : h('input', { class: 'campo-testo', type: 'text' })) as HTMLInputElement | HTMLTextAreaElement;
        campo.value = String(v0()[k.id] ?? '');
        let timer = 0;
        campo.addEventListener('input', () => { clearTimeout(timer); timer = window.setTimeout(() => metti(k.id, campo.value), 250); });
        this.campi.push({ el: campo, aggiorna: () => { if (document.activeElement !== campo) campo.value = String(v0()[k.id] ?? ''); } });
        righe.push(h('label', { class: 'etichetta' }, k.nome), campo);
      } else if (k.tipo === 'numero') {
        const min = k.min ?? 0, max = k.max ?? 100, step = k.step ?? 1;
        if (max - min > 1000) {
          const n = h('input', { type: 'number', class: 'num largo', min, max, step }) as HTMLInputElement;
          n.value = String(v0()[k.id] ?? k.def);
          n.addEventListener('change', () => metti(k.id, Math.max(min, Math.min(max, Number(n.value) || 0))));
          this.campi.push({ el: n, aggiorna: () => { if (document.activeElement !== n) n.value = String(v0()[k.id] ?? k.def); } });
          righe.push(h('div', { class: 'isp-riga' }, h('label', null, k.nome), n));
        } else righe.push(this.cursore(k.nome, min, max, step, (c) => Number(valoreDi(c, k)), (c, v) => { if (c.gen?.anim) c.gen.anim.v[k.id] = v; }, '', an));
      } else if (k.tipo === 'colore') righe.push(this.colore(k.nome, (c) => String(valoreDi(c, k)), (c, v) => { if (c.gen?.anim) c.gen.anim.v[k.id] = v; }, an));
      else if (k.tipo === 'scelta') righe.push(this.scelta(k.nome, k.scelte ?? [], (c) => String(valoreDi(c, k)), (c, v) => { if (c.gen?.anim) c.gen.anim.v[k.id] = v; }, an));
      else righe.push(this.spunta(k.nome, (c) => !!valoreDi(c, k), (c, v) => { if (c.gen?.anim) c.gen.anim.v[k.id] = v; }, an));
    }
    righe.push(h('p', { class: 'nota' }, 'Entra all\'inizio e nell\'ultimo mezzo secondo esce: allunga o accorcia la clip dalla timeline e l\'animazione si adatta. Sull\'immagine del monitor si sposta e si ingrandisce come ogni clip.'));
    return this.gruppo('animazione', 'Animazione', righe);
  }

  /** "Togli lo sfondo": il colore (green screen), la luce, o l'AI che lo toglie da sola (persona, soggetto, oggetti coi clic) */
  private sfondoGruppo(video: Clip[]): HTMLElement {
    const c0 = video[0];
    const ids = video.map((c) => c.id);
    const modo = modoSfondo(c0);
    const righe: (HTMLElement | null)[] = [];
    righe.push(h('div', { class: 'isp-chips' }, modiPossibili(c0).map((m) => h('button', {
      class: 'chip' + (m === modo ? ' acceso' : ''), title: NOMI_MODO[m], on: { click: () => { if (m !== modo) impostaModo(ids, m); } },
    }, NOMI_MODO[m]))));
    if (modo === 'nessuno') {
      righe.push(h('p', { class: 'nota' }, 'Scegli come togliere lo sfondo: col colore se hai girato su un fondale verde o blu, con la luce per un fondo nero o bianco, oppure lascia fare all\'AI (una persona, un soggetto qualunque, o l\'oggetto che clicchi). Quello che togli diventa trasparente: metti un\'altra clip sotto.'));
    }
    if (modo === 'colori') {
      const colori = coloriChiave(c0.fx);
      righe.push(h('div', { class: 'sf-colori' },
        this.colore('Colore da togliere', (c) => c.fx.keyColor, (c, v) => { c.fx.keyColor = v; }, video),
        ...colori.slice(1).map((col, i) => h('div', { class: 'isp-riga sf-extra' },
          h('label', null, 'Altro colore'),
          h('input', { type: 'color', value: col, on: { change: (e: Event) => store.edit('Colore da togliere', (pp) => { const z = clipById(pp, c0.id); if (z?.fx.keyColori) z.fx.keyColori[i] = (e.target as HTMLInputElement).value; }) } }),
          h('button', { class: 'btn-mini', title: 'Toglie questo colore', on: { click: () => togliColoreExtra(c0.id, i) } }, '✕')))));
      righe.push(this.pulsanti([
        ['💧 Contagocce sul monitor', () => scegliColore(c0.id, false)],
        ...(colori.length < 3 ? [['＋ Un altro colore', () => scegliColore(c0.id, true)] as [string, () => void]] : []),
        ['✨ Trovalo da solo', () => void trovaColore(c0.id)],
      ]));
      righe.push(this.pulsanti(CHIAVI.map((k): [string, () => void] => [k.nome, () => store.edit('Chiave ' + k.nome, () => { for (const c of video) { c.fx.key = 'chroma'; c.fx.keyColor = k.colore; delete c.fx.keyColori; } })])));
      righe.push(
        this.cursore('Soglia', 0, 100, 1, (c) => Math.round(c.fx.keyLevel * 100), (c, v) => { c.fx.keyLevel = v / 100; }, '', video),
        this.cursore('Morbidezza', 0, 50, 1, (c) => Math.round(c.fx.keySoft * 100), (c, v) => { c.fx.keySoft = v / 100; }, '', video),
        this.cursore('Bordo', -100, 100, 1, (c) => Math.round((c.fx.keyBordo ?? 0) * 100), (c, v) => { c.fx.keyBordo = v / 100; }, '', video),
        this.cursore('Sfuma il bordo', 0, 100, 1, (c) => Math.round((c.fx.keySfuma ?? 0) * 100), (c, v) => { c.fx.keySfuma = v / 100; }, '', video),
        this.cursore('Pulisci', 0, 100, 1, (c) => Math.round((c.fx.keyPulisci ?? 0) * 100), (c, v) => { c.fx.keyPulisci = v / 100; }, '', video),
        this.cursore('Via il riflesso', 0, 100, 1, (c) => Math.round((c.fx.keySpill ?? SPILL0) * 100), (c, v) => { c.fx.keySpill = v / 100; }, '', video),
        this.spunta('Inverti: tieni il fondale', (c) => c.fx.keyInvert, (c, v) => { c.fx.keyInvert = v; }, video),
        h('p', { class: 'nota' }, 'Guarda il risultato col tasto SFONDO sopra il monitor: la maschera (bianco = resta) o il soggetto sugli scacchi. Bordo: − stringe il soggetto, + lo allarga. Pulisci toglie i puntini; "Via il riflesso" toglie dal bordo il colore del fondale. Se restano aloni alza la Soglia; se il soggetto si mangia, abbassala.'));
    }
    if (modo === 'luma') {
      righe.push(
        this.cursore('Soglia', 0, 100, 1, (c) => Math.round(c.fx.keyLevel * 100), (c, v) => { c.fx.keyLevel = v / 100; }, '', video),
        this.cursore('Morbidezza', 0, 50, 1, (c) => Math.round(c.fx.keySoft * 100), (c, v) => { c.fx.keySoft = v / 100; }, '', video),
        this.spunta('Inverti: toglie il bianco', (c) => c.fx.keyInvert, (c, v) => { c.fx.keyInvert = v; }, video));
    }
    if (modo === 'persona' || modo === 'soggetto' || modo === 'oggetti') {
      const r = c0.ritaglio!;
      const mod = modelloRitaglio(r.modello);
      righe.push(
        this.scelta('Modello', modelliPer(modo).map((m) => [m.id, `${m.nome} — ${m.info}`] as [string, string]), (c) => c.ritaglio?.modello ?? '', (c, v) => { if (c.ritaglio) c.ritaglio.modello = v; }, video),
        this.scelta('Precisione', QUALITA_RITAGLIO.map((q, i) => [String(i), `${q.nome} (${q.hz} fotogrammi al secondo)`] as [string, string]), (c) => String(c.ritaglio?.qualita ?? 1), (c, v) => { if (c.ritaglio) c.ritaglio.qualita = Number(v); }, video));
      if (modo === 'oggetti') {
        const punti = r.punti ?? [];
        righe.push(this.pulsanti([
          ['🖱 Clicca l\'oggetto sul monitor', () => scegliOggetto(c0.id)],
          ['Prova su questo fotogramma', () => void provaOggetto(c0.id)],
          ...(punti.length ? [['Toglie i clic', () => azzeraPunti(c0.id)] as [string, () => void]] : []),
        ]));
        righe.push(punti.length
          ? h('div', { class: 'isp-chips' }, punti.map((q, i) => h('button', { class: 'chip ' + (q.dentro ? 'acceso' : ''), title: 'Clic: toglie questo punto', on: { click: () => togliPunto(c0.id, i) } }, (q.dentro ? '＋ ' : '－ ') + (i + 1))))
          : h('p', { class: 'nota' }, 'Metti il cursore su un fotogramma dove l\'oggetto si vede bene, premi "Clicca l\'oggetto" e clicca sopra (più clic se serve). Alt+clic su una parte che NON è l\'oggetto.'));
        righe.push(this.spunta('Segui l\'oggetto nel video', (c) => c.ritaglio?.segui !== false, (c, v) => { if (c.ritaglio) c.ritaglio.segui = v; }, video));
      }
      const lav = lavoroDi(c0.id);
      const inCorso = !!lav && !lav.finito;
      righe.push(this.pulsanti([
        [inCorso ? '⏹ Ferma' : '✂ Togli lo sfondo', () => { if (inCorso) fermaClip(c0.id); else void elaboraClip(c0.id); }],
      ]));
      if (lav) righe.push(h('div', { class: 'sf-lavoro' }, ...lav.barra.elementi));
      const st = statoMaschere(c0);
      righe.push(h('p', { class: 'nota' + (st.ok ? ' ok' : '') }, st.testo));
      righe.push(
        this.cursore('Bordo', -100, 100, 1, (c) => Math.round((c.ritaglio?.bordo ?? 0) * 100), (c, v) => { if (c.ritaglio) c.ritaglio.bordo = v / 100; }, '', video),
        this.cursore('Morbidezza', 0, 100, 1, (c) => Math.round((c.ritaglio?.morbido ?? 0) * 100), (c, v) => { if (c.ritaglio) c.ritaglio.morbido = v / 100; }, '', video),
        this.spunta('Inverti: tieni lo sfondo', (c) => !!c.ritaglio?.inverti, (c, v) => { if (c.ritaglio) c.ritaglio.inverti = v || undefined; }, video),
        h('p', { class: 'nota' }, `Il modello${mod ? ' ' + mod.nome + ' (licenza ' + mod.licenza + ')' : ''} si scarica da Hugging Face la prima volta e poi resta nel computer; le immagini non escono mai. Guarda il risultato col tasto SFONDO sopra il monitor. La velocità dipende dalla scheda video: senza, scegli "Veloce".`));
    }
    return this.gruppo('sfondo', 'Togli lo sfondo', righe, modo !== 'nessuno' ? NOMI_MODO[modo] : undefined);
  }

  /** "Segui": un oggetto tracciato in una ripresa (1 segna, 2 controlla, 3 attacca) e chi lo segue */
  private seguiGruppo(cs: Clip[]): HTMLElement | null {
    const p = store.doc;
    const c0 = cs[0];
    const righe: HTMLElement[] = [];
    let stato: string | undefined;
    if (c0.kind === 'media' && isVideoClip(c0, p) && mediaOf(p, c0)?.type === 'video') {
      const tr = c0.traccia;
      const attaccati = attaccatiA(p, c0.id);
      const passo = (n: string, fatto: boolean, ora: boolean) => h('div', { class: 'isp-passo' + (fatto ? ' fatto' : ora ? ' ora' : '') }, n);
      righe.push(h('div', { class: 'isp-passi' },
        passo('1 · Segna', !!tr, !tr), passo('2 · Controlla', !!tr, false), passo('3 · Attacca', attaccati.length > 0, !!tr && !attaccati.length)));
      righe.push(this.pulsanti([[tr ? '🎯 Rifai il tracking' : '🎯 Segna un oggetto sul monitor', () => document.dispatchEvent(new CustomEvent('dpv:mira'))]]));
      if (tr) {
        stato = `${Math.round(tr.fiducia * 100)}%`;
        righe.push(h('p', { class: 'nota' + (tr.fiducia > 0.6 ? ' ok' : '') }, `Oggetto seguito per ${tr.punti.length} punti, sicurezza ${Math.round(tr.fiducia * 100)}%: il percorso azzurro sul monitor. ${tr.fiducia < 0.6 ? 'Se in qualche punto lo perde, rifai il tracking partendo da dove si vede meglio.' : 'Ora attaccaci qualcosa:'}`));
        // ——— 3 · Attacca: un clic e la cosa segue l'oggetto per tutta la ripresa
        righe.push(h('label', { class: 'etichetta' }, 'Attacca all\'oggetto'));
        righe.push(h('div', { class: 'isp-schede' }, ATTACCHI.map((a) => h('button', {
          class: 'isp-scheda', title: a.info, 'data-attacca': a.id,
          on: { click: () => { const id = attacca(c0.id, a); if (id) avviso(`${a.icona} ${a.nome}: segue l'oggetto. Cambiala dal pannello, spostala sul monitor`, 'ok', 2600); } },
        }, h('span', { class: 'ico' }, a.icona), a.nome))));
        if (attaccati.length) {
          righe.push(h('label', { class: 'etichetta' }, `Già attaccati (${attaccati.length})`));
          righe.push(h('div', { class: 'isp-chips' }, attaccati.map((x) => h('span', { class: 'chip-gruppo' },
            h('button', { class: 'chip acceso', title: 'Sceglila per cambiarla', on: { click: () => store.select([x.id]) } }, x.kind === 'fx' ? nomeBlocco(x.fxb!) : x.name.split(' · ')[0]),
            h('button', { class: 'chip', title: 'Togli', on: { click: () => store.edit('Togli', (pp) => { pp.clips = pp.clips.filter((z) => z.id !== x.id); }) } }, '✕')))));
        }
        righe.push(this.spunta('Tieni ferma la ripresa sull\'oggetto (stabilizza)', (c) => !!c.stabilizza, (c, v) => { c.stabilizza = v || undefined; }, [c0]));
        righe.push(this.pulsanti([['Togli il tracking', () => store.edit('Toglie il tracking', (pp) => { for (const z of pp.clips) { if (z.id === c0.id) { delete z.traccia; delete z.stabilizza; } if (z.segue === c0.id) delete z.segue; if (z.fxb?.segue === c0.id) delete z.fxb.segue; } })]]));
      } else righe.push(h('p', { class: 'nota' }, 'Metti il cursore dove l\'oggetto si vede bene, premi il tasto e trascina il mirino sopra: il programma lo segue per tutta la ripresa. Poi un clic e ci attacchi una scritta, una freccia, una censura, un faretto…'));
    }
    const seguibili = tracciate(p).filter((x) => x.id !== c0.id);
    const get = (c: Clip) => (c.kind === 'fx' ? c.fxb?.segue : c.segue) ?? '';
    if (seguibili.length) {
      const opz: [string, string][] = [['', 'Nessuno (sta fermo)'], ...seguibili.map((x) => [x.id, x.name] as [string, string])];
      righe.push(this.scelta('Segue', opz, get, (c, v) => agganciaSegue(store.doc, c, v), cs));
      if (get(c0)) { stato ??= 'segue'; righe.push(h('p', { class: 'nota' }, 'Segue l\'oggetto: trascinandolo sul monitor lo sposti rispetto a lui (lo scarto).')); }
    }
    return righe.length ? this.gruppo('segui', 'Segui un oggetto', righe, stato) : null;
  }

  /** "3D e animazioni": i movimenti 2,5D della clip e le animazioni Retro 3D da mettere sopra */
  private treGruppo(video: Clip[]): HTMLElement {
    const ids = video.map((c) => c.id);
    const c0 = video[0];
    const tutte = (nome: string, fn: (pp: Project, c: Clip) => void) => store.edit(nome, (pp) => { for (const id of ids) { const c = clipById(pp, id); if (c) fn(pp, c); } });
    const retro = CATALOGO_ANIM.filter((a) => a.gruppo === 'retro3d');
    const righe: HTMLElement[] = [
      h('label', { class: 'etichetta' }, 'La clip si muove in 3D'),
      h('div', { class: 'isp-schede' }, MOVIMENTI_3D.map((m) => h('button', {
        class: 'isp-scheda', title: m.info, on: { click: () => tutte('3D: ' + m.nome.slice(2).trim(), (pp, c) => movimento3D(pp, c, m.id)) },
      }, h('span', { class: 'ico' }, m.nome.slice(0, 2).trim()), m.nome.slice(2).trim()))),
      c0.tfFine ? this.pulsanti([['■ Ferma: togli il movimento', () => tutte('Togli il movimento', (_pp, c) => { delete c.tfFine; delete c.via; })]]) : null,
      h('p', { class: 'nota' }, 'Il trucco degli anni \'90: niente prospettiva vera, la clip si stringe di taglio, rimpicciolisce da lontano e gira, con le tappe nel tempo. Dopo lo sistemi dal monitor come ogni movimento (◀ Inizio / Fine ▶, ＋ Tappa).'),
      h('label', { class: 'etichetta' }, 'Animazioni Retro 3D (sopra la clip, dal suo inizio)'),
      h('div', { class: 'isp-schede' }, retro.map((a) => h('button', {
        class: 'isp-scheda', title: a.info,
        on: { click: () => { inserisciGeneratore('anim', c0.start, undefined, { anim: a.id }); avviso(`🧊 ${a.nome}: cambia testo e colori qui nel pannello`, 'ok', 2400); } },
      }, h('span', { class: 'ico' }, ICONE_RETRO[a.id] ?? '🧊'), a.nome))),
    ].filter(Boolean) as HTMLElement[];
    return this.gruppo('tre', '3D e animazioni', righe, c0.tfFine ? 'si muove' : undefined);
  }

  /** "Voce e dialoghi": scrivere un dialogo o una voce fuori campo, i sottotitoli dell'AI, la voce AI */
  private voceGruppo(): HTMLElement {
    const s = store.doc.sottotitoli;
    const dialogo = s?.righe.filter((x) => x.chi).length ?? 0;
    const evento = (n: string, d?: string) => document.dispatchEvent(new CustomEvent(n, { detail: d }));
    return this.gruppo('voce', 'Voce e dialoghi', [
      h('div', { class: 'isp-schede' },
        h('button', { class: 'isp-scheda', title: 'Scrivi le battute: diventano sottotitoli e la voce AI le dice', on: { click: () => apriDialogoScritto() } }, h('span', { class: 'ico' }, '💬'), 'Dialogo / voce fuori campo'),
        h('button', { class: 'isp-scheda', title: 'L\'AI ascolta e scrive i sottotitoli', on: { click: () => evento('dpv:finale', 'sottotitoli') } }, h('span', { class: 'ico' }, '📝'), 'Sottotitoli AI'),
        h('button', { class: 'isp-scheda', title: 'La voce AI legge i sottotitoli', on: { click: () => evento('dpv:fai-parlare') } }, h('span', { class: 'ico' }, '🗣'), 'Fai parlare'),
        h('button', { class: 'isp-scheda', title: 'Traduci i sottotitoli in un\'altra lingua', on: { click: () => evento('dpv:finale', 'lingue') } }, h('span', { class: 'ico' }, '🌍'), 'Traduci')),
      h('p', { class: 'nota' }, dialogo
        ? `Nel montaggio c'è un dialogo di ${dialogo} righe: riaprilo con "Dialogo" per correggerlo.`
        : 'Scrivi "Nome: battuta", una per riga, nella lingua che vuoi: ogni personaggio avrà la sua voce. Le righe senza nome sono la voce fuori campo.'),
    ], dialogo ? `${dialogo} righe` : undefined);
  }

  /** le transizioni all'inizio e alla fine della clip: i blocchetti che stanno su quei bordi */
  private transizioniClip(v: Clip): HTMLElement {
    const p = store.doc;
    const r = fps(p.rate);
    const sulBordo = (f: number) => { const tg = taglioVicino(p, f, 0, v.track); return tg ? transizioneSul(p, tg) : undefined; };
    const riga = (nome: string, f: number) => {
      const b = sulBordo(f);
      return h('div', { class: 'isp-riga' }, h('label', null, nome),
        b
          ? h('div', { class: 'isp-chips' },
            h('button', { class: 'chip acceso tr', title: 'Scegli il blocco per cambiarlo', on: { click: () => store.select([b.id]) } }, `${nomeBlocco(b.fxb!)} · ${(b.len / r).toFixed(1).replace('.', ',')} s`),
            h('button', { class: 'chip', title: 'Togli', on: { click: () => store.edit('Togli transizione', (pp) => { pp.clips = pp.clips.filter((z) => z.id !== b.id); }) } }, '✕'))
          : h('div', { class: 'isp-chips' }, ['mix', 'dip', 'dve:301', 'dve:401'].map((id) => h('button', {
            class: 'chip', on: { click: () => { store.select([]); mettiBlocco('transizione', id, f, v.track); } },
          }, nomeBlocco(nuovoBlocco('transizione', id))))));
    };
    return this.gruppo('trclip', 'Transizioni', [
      riga('All\'inizio', v.start),
      riga('Alla fine', end(v)),
      h('p', { class: 'nota' }, 'Sono i blocchetti turchesi in basso sulla clip: più lunghi = più lente. Trascinali su un altro taglio quando vuoi.'),
    ]);
  }

  /** le proprietà dei blocchetti FX scelti: durata, tipo, forza, colore */
  private blocchi(bs: Clip[]): HTMLElement[] {
    const p = store.doc;
    const r = fps(p.rate);
    const b0 = bs[0];
    const fb = b0.fxb!;
    const tr = fb.tipo === 'transizione';
    const tg = tr ? taglioDelBlocco(p, b0) : null;
    const out: HTMLElement[] = [];
    const sec = (len: number) => (len / r).toFixed(2).replace('.', ',').replace(/,?0+$/, '') + ' s';
    out.push(h('div', { class: 'isp-testa' },
      h('input', { class: 'isp-nome', value: bs.length > 1 ? `${bs.length} blocchi scelti` : nomeBlocco(fb), disabled: true }),
      h('div', { class: 'isp-riassunto' },
        h('span', { class: 'chip-tipo ' + (tr ? 'tr' : 'fx') }, tr ? 'Transizione' : 'Effetto a tempo'),
        h('span', null, 'da ', h('b', { class: 'tc-testo' }, frameToTc(b0.start, p.rate, p.drop))),
        h('span', null, 'dura ', h('b', null, sec(b0.len))),
        tr ? h('span', { class: tg ? '' : 'avviso-rosso' }, tg ? `sul taglio a ${frameToTc(tg.f, p.rate, p.drop)} (${trackOf(p, tg.track).name})` : 'nessun taglio sotto: spostala sopra un taglio') : h('span', null, effettoTempo(fb.id)?.info ?? ''))));
    const ids = bs.map((c) => c.id);
    const tutti = (label: string, fn: (c: Clip) => void) => store.edit(label, (pp) => { for (const id of ids) { const c = clipById(pp, id); if (c) fn(c); } });
    // durata: i chip fanno prima dei numeri (più corto = più rapido)
    const durate = [0.25, 0.5, 1, 2, 3, 5, 10];
    const n = h('input', { type: 'number', class: 'num largo', min: 0.08, step: 0.04, value: (b0.len / r).toFixed(2) }) as HTMLInputElement;
    n.addEventListener('change', () => store.edit('Durata', (pp) => { for (const id of ids) durataDelBlocco(pp, clipById(pp, id)!, Math.max(0.08, Number(n.value) || 1) * r); }));
    out.push(this.gruppo('bdurata', tr ? 'Durata (più lunga = più lenta)' : 'Durata', [
      h('div', { class: 'isp-chips' }, durate.map((d) => h('button', {
        class: 'chip' + (Math.round(d * r) === b0.len ? ' acceso' : ''),
        on: { click: () => store.edit('Durata', (pp) => { for (const id of ids) durataDelBlocco(pp, clipById(pp, id)!, d * r); }) },
      }, String(d).replace('.', ',') + ' s'))),
      h('div', { class: 'isp-riga' }, h('label', null, 'Secondi'), n),
    ]));
    if (tr) {
      const opz: [string, string][] = [['mix', 'Dissolvenza incrociata'], ['dip', 'Passaggio a colore'], ...EFFETTI.map((m) => ['dve:' + m.p, 'Effetto · ' + m.nome] as [string, string]), ...TENDINE.map((m) => ['wipe:' + m.p, 'Tendina ' + m.nome] as [string, string])];
      const trDi = (c: Clip) => c.fxb!.tr!;
      const tipo = fb.tr?.type;
      const dve = tipo === 'dve', wipe = tipo === 'wipe';
      out.push(this.gruppo('btipo', 'Transizione', [
        this.scelta('Modello', opz, (c) => c.fxb?.id ?? 'mix', (c, v) => { c.fxb = cambiaModello(c.fxb!, v); c.name = nomeBlocco(c.fxb); }, bs),
        this.scelta('Come corre', [['', 'Come vuole l\'effetto'], ['dolce', 'Dolce (parte e arriva piano)'], ['entra', 'Parte piano, poi corre'], ['esce', 'Corre, poi arriva piano']], (c) => trDi(c)?.curva ?? '', (c, v) => { trDi(c).curva = (v || undefined) as 'dolce'; }, bs),
        dve ? this.cursore('Intensità', 20, 200, 5, (c) => Math.round((trDi(c)?.forza ?? c.fxb?.forza ?? 1) * 100), (c, v) => { trDi(c).forza = v / 100; }, '%', bs) : null,
        dve && DIREZIONALI.has(fb.tr!.pattern) ? this.scelta('Direzione', [['0', 'Come sta'], ['1', 'Ruotata di 90°'], ['2', 'Ruotata di 180°'], ['3', 'Ruotata di 270°']], (c) => String(trDi(c)?.dir ?? 0), (c, v) => { trDi(c).dir = Number(v) || undefined; }, bs) : null,
        this.spunta('Al contrario', (c) => !!trDi(c)?.reverse, (c, v) => { trDi(c).reverse = v; }, bs),
        wipe || tipo === 'dip' ? this.colore(tipo === 'dip' ? 'Colore del passaggio' : 'Colore del bordo', (c) => (trDi(c)?.type === 'dip' ? trDi(c).color : trDi(c)?.borderColor ?? '#ffd54a'), (c, v) => { const t = trDi(c); if (t.type === 'dip') t.color = v; else t.borderColor = v; }, bs) : null,
        wipe ? this.cursore('Bordo', 0, 20, 0.5, (c) => (trDi(c)?.border ?? 0) * 100, (c, v) => { trDi(c).border = v / 100; }, '', bs) : null,
        wipe ? this.cursore('Morbidezza', 0, 30, 0.5, (c) => (trDi(c)?.soft ?? 0) * 100, (c, v) => { trDi(c).soft = v / 100; }, '', bs) : null,
      ]));
    } else {
      const colori = ['flash', 'lampoNero', 'strobo', 'dalNero', 'alNero', 'dalBianco', 'alBianco', 'duotone', 'bokeh', 'scintille'].includes(fb.id);
      const centro = haCentro(fb.id);
      const segue = !!fb.segue;
      out.push(this.gruppo('btipo', 'Effetto', [
        this.scelta('Effetto', EFFETTI_TEMPO.map((e) => [e.id, `${e.nome} · ${e.info}`] as [string, string]), (c) => c.fxb?.id ?? 'flash', (c, v) => { c.fxb = cambiaModello(c.fxb!, v); c.name = effettoTempo(v)!.nome; }, bs),
        this.cursore('Forza', 10, 150, 1, (c) => Math.round((c.fxb?.forza ?? 1) * 100), (c, v) => { c.fxb!.forza = v / 100; }, '%', bs),
        this.cursore('Si ripete', 1, 12, 1, (c) => c.fxb?.ripeti ?? 1, (c, v) => { c.fxb!.ripeti = v > 1 ? v : undefined; }, 'volte', bs),
        colori ? this.colore('Colore', (c) => c.fxb?.colore ?? '#ffffff', (c, v) => { c.fxb!.colore = v; }, bs) : null,
        centro ? h('p', { class: 'nota' }, 'Il centro dell\'effetto è il mirino sul monitor: trascinalo dove vuoi. Con "Movimento" parte da un punto e arriva a un altro, e passa da tutte le tappe che aggiungi (＋ Tappa, o fermati fra due tappe e muovi il mirino).') : null,
        centro ? this.pulsanti([
          [fb.posFine ? 'Movimento spento' : 'Movimento', () => store.edit('Movimento dell\'effetto', () => { for (const c of bs) { if (c.fxb!.posFine) { delete c.fxb!.posFine; delete c.fxb!.via; } else { c.fxb!.pos ??= [0.5, 0.5]; c.fxb!.posFine = [...c.fxb!.pos] as [number, number]; } } })],
          ['Al centro', () => store.edit('Effetto al centro', () => { for (const c of bs) { delete c.fxb!.pos; delete c.fxb!.posFine; delete c.fxb!.via; delete c.fxb!.segue; } })],
        ]) : null,
        centro && tracciate(p).length ? this.scelta('Segue', [['', 'Nessuno (sta dove l\'hai messo)'], ...tracciate(p).map((x) => [x.id, x.name] as [string, string])], (c) => c.fxb?.segue ?? '', (c, v) => agganciaSegue(store.doc, c, v), bs) : null,
        segue ? h('p', { class: 'nota' }, 'Il centro segue l\'oggetto tracciato: il mirino sul monitor sposta lo scarto.') : null,
      ]));
    }
    // il suono dentro l'FX: acceso/spento, quale, quanto forte
    const suoni: [string, string][] = [['', 'Nessun suono'], ...SUONI.map((x) => [x.id, x.nome] as [string, string])];
    out.push(this.gruppo('bsuono', 'Suono dell\'FX', [
      this.spunta('Suono acceso', (c) => !!c.fxb?.audio && !!c.fxb.suono, (c, v) => { if (c.fxb?.suono) c.fxb.audio = v; }, bs),
      this.scelta('Suono', suoni, (c) => c.fxb?.suono ?? '', (c, v) => { c.fxb!.suono = v || undefined; c.fxb!.audio = !!v; if (v && c.id === b0.id) ascoltaSuono(v, c.fxb!.volume ?? 0); }, bs),
      this.cursore('Volume', -24, 6, 1, (c) => c.fxb?.volume ?? 0, (c, v) => { c.fxb!.volume = v; }, ' dB', bs),
      h('div', { class: 'isp-chips' }, h('button', { class: 'chip', disabled: !fb.suono, on: { click: () => { if (fb.suono) ascoltaSuono(fb.suono, fb.volume ?? 0); } } }, '▶ Ascolta')),
    ]));
    out.push(this.pulsanti([
      ['Centra sul taglio', () => {
        const tg2 = taglioVicino(store.doc, b0.start + b0.len / 2, Math.round(r * 5), b0.track);
        if (!tg2) { avviso('Non c\'è un taglio qui vicino', 'info'); return; }
        tutti('Sul taglio', (c) => { c.start = Math.max(0, Math.round(tg2.f - c.len / 2)); });
      }],
      ['Ripeti dopo', () => { const nb = store.edit('Ripeti blocco', (pp) => posaBlocco(pp, fb, end(b0), b0.len, b0.track)); store.select([nb.id]); }],
      ['Elimina', () => esegui('elimina')],
    ]));
    out.push(h('p', { class: 'nota' }, tr
      ? 'Il blocco lavora sul taglio che ha sotto: si vedono tutte e due le clip, e nessuna cambia durata.'
      : 'L\'effetto vale per la sua traccia e per tutto quello che sta sotto. Allungalo dai bordi, o mettine un altro subito dopo.'));
    return out;
  }

  private titolatrice(tt: Clip[]): HTMLElement {
    const t0 = tt[0].gen!.title!;
    const set = (label: string, fn: (s: TitleSpec) => void) => store.edit(label, () => { for (const c of tt) if (c.gen?.title) fn(c.gen.title); });
    const testo = h('textarea', { class: 'campo-testo', rows: 3 }) as HTMLTextAreaElement;
    testo.value = t0.text;
    let timer = 0;
    testo.addEventListener('input', () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => set('Testo del titolo', (s) => { s.text = testo.value; }), 250);
    });
    const agg = () => { if (document.activeElement !== testo) testo.value = tt[0].gen?.title?.text ?? ''; };
    this.campi.push({ el: testo, aggiorna: agg });
    const sotto = h('textarea', { class: 'campo-testo', rows: 2 }) as HTMLTextAreaElement;
    sotto.value = t0.sotto ?? '';
    let timer2 = 0;
    sotto.addEventListener('input', () => {
      clearTimeout(timer2);
      timer2 = window.setTimeout(() => set('Sottotitolo del titolo', (s) => { s.sotto = sotto.value || undefined; }), 250);
    });
    this.campi.push({ el: sotto, aggiorna: () => { if (document.activeElement !== sotto) sotto.value = tt[0].gen?.title?.sotto ?? ''; } });
    const tsel = (nome: string, opts: [string, string][], get: (s: TitleSpec) => string, put: (s: TitleSpec, v: string) => void) =>
      this.scelta(nome, opts, (c) => get(c.gen!.title!), (c, v) => put(c.gen!.title!, v), tt);
    return this.gruppo('titolo', 'Titolatrice', [
      h('label', { class: 'etichetta' }, 'Testo (a capo per più righe)'), testo,
      tsel('Stile', STILI_TITOLO, (s) => s.style, (s, v) => { s.style = v as TitleSpec['style']; }),
      tsel('Carattere', [['Rajdhani', 'Rajdhani'], ['Orbitron', 'Orbitron'], ['Georgia', 'Georgia (graziato)'], ['Arial Black', 'Arial Black'], ['Courier New', 'Macchina da scrivere'], ['Impact', 'Impact']], (s) => s.font, (s, v) => { s.font = v; }),
      this.cursore('Dimensione', 16, 240, 1, (c) => c.gen!.title!.size, (c, v) => { c.gen!.title!.size = v; }, 'pt', tt),
      this.cursore('Altezza', 5, 95, 1, (c) => Math.round(c.gen!.title!.y * 100), (c, v) => { c.gen!.title!.y = v / 100; }, '%', tt),
      tsel('Allineamento', [['left', 'Sinistra'], ['center', 'Centro'], ['right', 'Destra']], (s) => s.align, (s, v) => { s.align = v as 'left'; }),
      this.colore('Colore', (c) => c.gen!.title!.color, (c, v) => { c.gen!.title!.color = v; }, tt),
      this.colore('Contorno', (c) => c.gen!.title!.outline === 'none' ? '#000000' : c.gen!.title!.outline, (c, v) => { c.gen!.title!.outline = v; }, tt),
      this.spunta('Ombra', (c) => c.gen!.title!.shadow, (c, v) => { c.gen!.title!.shadow = v; }, tt),
      this.spunta('Fascia dietro', (c) => c.gen!.title!.box, (c, v) => { c.gen!.title!.box = v; }, tt),
      this.colore('Colore fascia / secondo colore', (c) => c.gen!.title!.boxColor.slice(0, 7), (c, v) => { c.gen!.title!.boxColor = v + 'cc'; }, tt),
      h('label', { class: 'etichetta' }, 'Sottotitolo (la riga piccola sotto)'), sotto,
      tsel('Entra', ANIMAZIONI, (s) => s.ingresso ?? '', (s, v) => { s.ingresso = v || undefined; }),
      tsel('Esce', ANIMAZIONI, (s) => s.uscita ?? '', (s, v) => { s.uscita = v || undefined; }),
      this.cursore('Spazio fra le lettere', -5, 60, 1, (c) => Math.round((c.gen!.title!.spaziatura ?? 0) * 100), (c, v) => { c.gen!.title!.spaziatura = v / 100; }, '%', tt),
      tsel('Spessore', [['', 'Come lo stile'], ['400', 'Normale'], ['600', 'Medio'], ['700', 'Grassetto'], ['900', 'Nero']], (s) => (s.peso ? String(s.peso) : ''), (s, v) => { s.peso = v ? Number(v) : undefined; }),
    ]);
  }

  /** durata in secondi: si allunga o si accorcia dal bordo di uscita (con il ripple, se acceso) */
  private durata(cs: Clip[]): HTMLElement {
    const p0 = store.doc;
    const r = fps(p0.rate);
    // una sola clip per gruppo legato: il trim porta con sé anche l'audio o il video della stessa ripresa
    const scelte = () => {
      const visti = new Set<string>();
      return store.doc.clips.filter((c) => cs.some((x) => x.id === c.id)).filter((c) => { if (!c.link) return true; if (visti.has(c.link)) return false; visti.add(c.link); return true; });
    };
    const n = h('input', { type: 'number', class: 'num largo', min: 0.04, step: 0.04 }) as HTMLInputElement;
    const agg = () => { const c = scelte()[0]; if (c && document.activeElement !== n) n.value = (c.len / r).toFixed(2); };
    agg();
    const allunga = (label: string, fn: (c: Clip) => number) => {
      store.edit(label, (p) => {
        for (const c of scelte()) {
          const d = fn(c);
          if (d) M.trimClip(p, c.id, 'out', d, { ripple: modi.ripple, linked: true });
        }
      });
      agg();
    };
    n.addEventListener('change', () => allunga('Durata', (c) => Math.max(1, Math.round(Number(n.value) * r)) - c.len));
    const prossima = (c: Clip) => {
      const dopo = store.doc.clips.filter((x) => x.track === c.track && x.start >= c.start + c.len && x.id !== c.id).sort((a, b) => a.start - b.start)[0];
      return dopo ? dopo.start - (c.start + c.len) : 0;
    };
    const el = h('div', { class: 'isp-durata' },
      h('div', { class: 'isp-riga' }, h('label', null, 'Secondi'), n, h('small', { class: 'nota' }, modi.ripple ? 'ripple: sposta le clip dopo' : 'si ferma alla clip dopo')),
      this.pulsanti([
        ['+1 s', () => allunga('Allunga', () => Math.round(r))],
        ['+5 s', () => allunga('Allunga', () => Math.round(r * 5))],
        ['−1 s', () => allunga('Accorcia', (c) => -Math.min(c.len - 1, Math.round(r)))],
        ['↦ fino alla prossima', () => allunga('Allunga fino alla prossima', prossima)],
      ]),
      h('p', { class: 'nota' }, 'Le immagini e le istantanee si allungano quanto vuoi; i video fino alla fine della ripresa.'));
    this.campi.push({ el, aggiorna: agg });
    return el;
  }

  /**
   * Apre una sezione da fuori (la guida, la ricerca, il Centro AI: "porta dove si fa") e la mette in vista. Ritorna
   * false se per la clip scelta quella sezione non c'è (per esempio "Togli lo sfondo" su una clip audio).
   */
  apriSezione(id: string): boolean {
    this.aperti.add(id);
    this.firma = '';
    this.costruisci();
    const el = this.corpo.querySelector(`.isp-gruppo[data-g="${id}"]`) as HTMLDetailsElement | null;
    if (!el) return false;
    el.open = true;
    evidenzia(`.isp-gruppo[data-g="${id}"] > summary`, this.corpo);
    return true;
  }

  // ——— mattoncini ———
  /**
   * Una sezione del pannello: chiusa è un pulsante grande (icona, nome, cosa c'è dentro e com'è messa adesso),
   * aperta mostra i suoi comandi. Si trascina dalla maniglia ⠿ e l'ordine si ricorda.
   */
  private gruppo(id: string, titolo: string, righe: (HTMLElement | null)[], stato?: string): HTMLElement {
    const grip = h('span', { class: 'isp-grip', title: 'Trascina per spostare la sezione (l\'ordine si ricorda)' }, '⠿');
    const info = SEZIONI[id];
    const el = h('details', { class: 'isp-gruppo' + (stato ? ' con-stato' : ''), open: this.aperti.has(id), 'data-g': id, style: info ? `--tinta:${info.tinta}` : undefined },
      h('summary', null,
        h('span', { class: 'isp-icona' }, info?.icona ?? '•'),
        h('span', { class: 'isp-titolo' }, h('b', null, titolo), info ? h('small', null, info.cosa) : null),
        stato ? h('span', { class: 'isp-stato' }, stato) : null,
        grip),
      ...righe.filter(Boolean) as HTMLElement[]);
    el.addEventListener('toggle', () => { if ((el as HTMLDetailsElement).open) this.aperti.add(id); else this.aperti.delete(id); });
    // la maniglia non apre né chiude: serve solo a trascinare
    grip.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
    grip.addEventListener('pointerdown', (e) => this.trascina(el, e));
    return el;
  }

  /** i pulsanti grandi in cima: le cose che si fanno di più con questo tipo di clip, a un clic */
  private azioniRapide(lista: [string, string, string, () => void][]): HTMLElement {
    return h('div', { class: 'isp-rapide' }, lista.map(([icona, nome, info, fn]) => h('button', { class: 'isp-rapida', title: info, on: { click: fn } },
      h('span', { class: 'isp-rapida-icona' }, icona), h('span', null, nome))));
  }

  /** apre (e mette in vista) una sezione del pannello da un pulsante del pannello stesso */
  private vai(id: string) { this.apriSezione(id); }

  // ——— l'ordine delle sezioni: si riordinano trascinando la maniglia e l'ordine si salva per ogni tipo di elemento ———
  private ordiniSalvati(): Record<string, string[]> {
    try { return JSON.parse(localStorage.getItem('dpv-isp-ordine') ?? '{}') ?? {}; } catch { return {}; }
  }
  private scriviOrdini(o: Record<string, string[]>) {
    try { localStorage.setItem('dpv-isp-ordine', JSON.stringify(o)); } catch { /* niente */ }
  }

  /** rimette le sezioni nell'ordine salvato per questo tipo (quelle nuove o mai spostate vanno in fondo); il resto resta dov'è */
  private conOrdine(chiave: string, out: HTMLElement[]): HTMLElement[] {
    this.chiave = chiave;
    const posti = out.map((e, i) => (e.dataset?.g ? i : -1)).filter((i) => i >= 0);
    const gruppi = posti.map((i) => out[i]);
    const ids = gruppi.map((g) => g.dataset.g!);
    const salvato = this.ordiniSalvati()[chiave];
    if (!salvato?.length) return out;
    const ordine = [...salvato.filter((id) => ids.includes(id)), ...ids.filter((id) => !salvato.includes(id))];
    const per = new Map(gruppi.map((g) => [g.dataset.g!, g]));
    posti.forEach((i, k) => { out[i] = per.get(ordine[k])!; });
    out.push(h('button', { class: 'isp-ripristina', title: 'Rimette le sezioni nell\'ordine di partenza, per questo tipo di elemento', on: { click: () => { const o = this.ordiniSalvati(); delete o[chiave]; this.scriviOrdini(o); this.firma = ''; this.costruisci(); } } }, '↺ Ordine di partenza'));
    return out;
  }

  private trascina(el: HTMLElement, e: PointerEvent) {
    if (e.button !== 0 || !el.parentElement) return;
    e.preventDefault();
    const cont = el.parentElement;
    el.classList.add('trascinato');
    const muovi = (ev: PointerEvent) => {
      const altri = [...cont.children].filter((x) => x !== el && (x as HTMLElement).dataset?.g) as HTMLElement[];
      const dopo = altri.find((x) => { const b = x.getBoundingClientRect(); return ev.clientY < b.top + b.height / 2; });
      if (dopo) { if (el.nextElementSibling !== dopo) cont.insertBefore(el, dopo); }
      else { const ultimo = altri[altri.length - 1]; if (ultimo && ultimo.nextElementSibling !== el) cont.insertBefore(el, ultimo.nextSibling); }
    };
    const fine = () => {
      document.removeEventListener('pointermove', muovi);
      document.removeEventListener('pointerup', fine);
      document.removeEventListener('pointercancel', fine);
      el.classList.remove('trascinato');
      this.salvaOrdineDa(cont);
    };
    document.addEventListener('pointermove', muovi);
    document.addEventListener('pointerup', fine);
    document.addEventListener('pointercancel', fine);
  }

  /** salva l'ordine che si vede: le sezioni in quel momento nascoste restano dove stavano */
  private salvaOrdineDa(cont: HTMLElement) {
    if (!this.chiave) return;
    const visibili = [...cont.querySelectorAll(':scope > [data-g]')].map((x) => (x as HTMLElement).dataset.g!);
    const tutti = this.ordiniSalvati();
    const vecchio = tutti[this.chiave] ?? [];
    let k = 0;
    const nuovo = vecchio.map((id) => (visibili.includes(id) ? visibili[k++] : id));
    for (; k < visibili.length; k++) nuovo.push(visibili[k]);
    // chi non c'era ancora (mai spostato) va comunque nell'ordine che si vede
    const completo = [...new Set([...nuovo.filter((id) => visibili.includes(id) || vecchio.includes(id))])];
    for (const id of visibili) if (!completo.includes(id)) completo.push(id);
    tutti[this.chiave] = completo;
    this.scriviOrdini(tutti);
    // il bottone "Ordine di partenza" compare subito
    this.firma = ''; this.costruisci();
  }

  private cursore(nome: string, min: number, max: number, step: number, get: (c: Clip) => number, put: (c: Clip, v: number) => void, unita: string, quali: Clip[]): HTMLElement {
    const ids = quali.map((c) => c.id);
    const trova = () => store.doc.clips.filter((c) => ids.includes(c.id));
    const r = h('input', { type: 'range', min, max, step }) as HTMLInputElement;
    const n = h('input', { type: 'number', class: 'num', min, max, step }) as HTMLInputElement;
    const agg = () => { const c = trova()[0]; if (!c) return; const v = get(c); if (document.activeElement !== n) n.value = String(Math.round(v * 100) / 100); r.value = String(v); };
    agg();
    let vivo = false;
    const applica = (v: number) => {
      if (!vivo) { store.begin(nome); vivo = true; }
      for (const c of trova()) put(c, v);
      store.liveChange();
    };
    r.addEventListener('input', () => { applica(Number(r.value)); n.value = r.value; });
    r.addEventListener('change', () => { if (vivo) store.commit(true); vivo = false; });
    n.addEventListener('change', () => { const v = Math.max(min, Math.min(max, Number(n.value) || 0)); applica(v); store.commit(true); vivo = false; r.value = String(v); });
    r.addEventListener('dblclick', () => {
      // doppio clic = valore di partenza
      const def: Record<string, number> = { Opacità: 100, Zoom: 100, Orizzontale: 0, Verticale: 0, Rotazione: 0, Luce: 0, Contrasto: 100, Saturazione: 100, Temperatura: 0, Tinta: 0, Volume: 0, Panorama: 0 };
      if (nome in def) { applica(def[nome]); store.commit(true); vivo = false; agg(); }
    });
    const el = h('div', { class: 'isp-riga' }, h('label', null, nome), r, h('span', { class: 'isp-num' }, n, h('small', null, unita)));
    this.campi.push({ el, aggiorna: agg });
    return el;
  }

  private scelta(nome: string, opzioni: [string, string][], get: (c: Clip) => string, put: (c: Clip, v: string) => void, quali: Clip[]): HTMLElement {
    const ids = quali.map((c) => c.id);
    const s = h('select', { class: 'mini-select' }, opzioni.map(([v, t]) => h('option', { value: v }, t))) as HTMLSelectElement;
    const agg = () => { const c = store.doc.clips.find((x) => ids.includes(x.id)); if (c) s.value = get(c); };
    agg();
    s.addEventListener('change', () => store.edit(nome, () => { for (const c of store.doc.clips) if (ids.includes(c.id)) put(c, s.value); }));
    const el = h('div', { class: 'isp-riga' }, h('label', null, nome), s);
    this.campi.push({ el, aggiorna: agg });
    return el;
  }

  private colore(nome: string, get: (c: Clip) => string, put: (c: Clip, v: string) => void, quali: Clip[]): HTMLElement {
    const ids = quali.map((c) => c.id);
    const inp = h('input', { type: 'color' }) as HTMLInputElement;
    const agg = () => { const c = store.doc.clips.find((x) => ids.includes(x.id)); if (c) inp.value = get(c).slice(0, 7); };
    agg();
    let vivo = false;
    inp.addEventListener('input', () => { if (!vivo) { store.begin(nome); vivo = true; } for (const c of store.doc.clips) if (ids.includes(c.id)) put(c, inp.value); store.liveChange(); });
    inp.addEventListener('change', () => { if (vivo) store.commit(true); vivo = false; });
    const el = h('div', { class: 'isp-riga' }, h('label', null, nome), inp);
    this.campi.push({ el, aggiorna: agg });
    return el;
  }

  private spunta(nome: string, get: (c: Clip) => boolean, put: (c: Clip, v: boolean) => void, quali: Clip[]): HTMLElement {
    const ids = quali.map((c) => c.id);
    const inp = h('input', { type: 'checkbox' }) as HTMLInputElement;
    const agg = () => { const c = store.doc.clips.find((x) => ids.includes(x.id)); if (c) inp.checked = get(c); };
    agg();
    inp.addEventListener('change', () => store.edit(nome, () => { for (const c of store.doc.clips) if (ids.includes(c.id)) put(c, inp.checked); }));
    const el = h('label', { class: 'isp-riga spunta' }, inp, h('span', null, nome));
    this.campi.push({ el, aggiorna: agg });
    return el;
  }

  private pulsanti(lista: [string, () => void][]): HTMLElement {
    return h('div', { class: 'isp-pulsanti' }, lista.map(([n, fn]) => h('button', { class: 'btn-mini', on: { click: fn } }, n)));
  }
}

/** sposta tutte le posizioni della clip (partenza, tappe, arrivo) dello stesso tanto */
function spostaChiavi(c: Clip, dx: number, dy: number) {
  const tutte = [c.tf, ...(c.tfFine ? [c.tfFine] : []), ...(c.via ?? []).map((v) => v.tf)];
  for (const t of tutte) { t.x = Math.round(t.x + dx); t.y = Math.round(t.y + dy); }
}

/** la clip (o il centro dell'effetto) comincia o smette di seguire un oggetto tracciato, senza che salti: resta dov'è adesso */
function agganciaSegue(p: Project, c: Clip, id: string) {
  const f = Math.max(c.start, Math.min(end(c) - 1, Math.floor(store.head + 1e-6)));
  const off = (sid?: string): [number, number] => {
    const sorg = sid ? p.clips.find((x) => x.id === sid) : undefined;
    return (sorg && oggettoSulQuadro(p, sorg, f)) || [0, 0];
  };
  if (c.kind === 'fx' && c.fxb) {
    const b = c.fxb;
    const vecchio = off(b.segue), nuovo = off(id || undefined);
    const dx = (vecchio[0] - nuovo[0]) / p.w, dy = (vecchio[1] - nuovo[1]) / p.h;
    b.pos = [(b.pos ?? [0.5, 0.5])[0] + dx, (b.pos ?? [0.5, 0.5])[1] + dy];
    if (b.posFine) b.posFine = [b.posFine[0] + dx, b.posFine[1] + dy];
    for (const v of b.via ?? []) v.pos = [v.pos[0] + dx, v.pos[1] + dy];
    if (id) b.segue = id; else delete b.segue;
    return;
  }
  const vecchio = off(c.segue), nuovo = off(id || undefined);
  spostaChiavi(c, vecchio[0] - nuovo[0], vecchio[1] - nuovo[1]);
  if (id) c.segue = id; else delete c.segue;
}

export { FX0 };
