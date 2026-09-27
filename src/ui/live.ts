// La pagina LIVE: registra lo schermo (o una finestra, o una scheda) con un tasto solo. REGISTRA, PAUSA, FERMA:
// quando fermi, la registrazione finisce nel contenitore (cartella Registrazioni) e, se vuoi, in fondo alla timeline.
// Col microfono e con l'audio del computer, mescolati in una traccia, e con la webcam: registrata a parte (file suo)
// e posata sulla traccia sopra come bolla in un angolo, così dopo si sposta, si ingrandisce o si toglie. Prima di
// partire il conto 3-2-1; mentre registri M mette un segno (diventa un marcatore); il telecomando resta sopra alle
// altre finestre (Document Picture-in-Picture nel browser, la finestra piccola e in primo piano nell'app).
// Sotto c'è il motore del browser (getDisplayMedia, getUserMedia e MediaRecorder).
// La PAUSA chiude un pezzo e RIPRENDI ne apre un altro (la pausa di MediaRecorder non la tratta uguale ogni browser:
// alcuni lasciano il buco nel file); alla fine Mediabunny cuce i pezzi uno dopo l'altro in un file solo, con durata
// e indice giusti, così si taglia e si sposta come gli altri.
// Non ci si fida nemmeno della consegna finale di MediaRecorder (con alcuni Chromium quello che arriva allo stop si
// perde): i dati escono a pezzetti di un quarto di secondo, e alla PAUSA il registratore va avanti ancora un attimo
// prima di fermarsi; quel pezzetto in più poi si taglia via cucendo, al punto esatto in cui hai premuto.
import {
  ALL_FORMATS, BlobSource, BufferTarget, Conversion, EncodedAudioPacketSource, EncodedPacketSink, EncodedVideoPacketSource,
  Input, Mp4OutputFormat, Output, WebMOutputFormat,
} from 'mediabunny';
import { store } from '../core/store';
import { newClip, newTrack, nextTrackName, projectEnd, uid } from '../core/progetto';
import { fps } from '../core/timecode';
import * as M from '../core/montaggio';
import { ANGOLI, bolla, presentazione, SFONDI, type Angolo } from '../core/cornici';
import type { MediaItem } from '../core/tipi';
import { importaFile } from '../progetti';
import { invoke, isAndroid, isTauri } from '../platform';
import { motore } from '../motore';
import { avviso, h, icona } from './dom';

/** da dove arriva l'immagine: di solito la scelta del sistema; le prove ne mettono una finta (anche microfono e webcam) */
type Sorgente = (conAudio: boolean) => Promise<MediaStream>;
let sorgenteProva: Sorgente | null = null;
let microfonoProva: (() => Promise<MediaStream>) | null = null;
let webcamProva: (() => Promise<MediaStream>) | null = null;
export const impostaSorgenteLive = (s: Sorgente | null, mic: (() => Promise<MediaStream>) | null = null, cam: (() => Promise<MediaStream>) | null = null) => {
  sorgenteProva = s; microfonoProva = mic; webcamProva = cam;
};

const puoRegistrare = () => !!sorgenteProva || (!!navigator.mediaDevices?.getDisplayMedia && typeof MediaRecorder !== 'undefined' && !isAndroid);

function formato(soloVideo = false): string {
  const lista = soloVideo
    ? ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4;codecs=avc1', 'video/mp4']
    : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4;codecs=avc1,mp4a', 'video/mp4'];
  for (const m of lista) if (MediaRecorder.isTypeSupported(m)) return m;
  return '';
}

const due = (n: number) => String(n).padStart(2, '0');
const orologio = (ms: number) => { const s = Math.floor(ms / 1000); return `${due(Math.floor(s / 3600))}:${due(Math.floor(s / 60) % 60)}:${due(s % 60)}`; };

/** quanto il registratore va avanti dopo PAUSA e FERMA (quel tratto poi si taglia), e ogni quanto consegna i dati */
const GRAZIA = 600;
const FETTA = 250;

/** un tratto registrato fra una pausa e l'altra: il file e dove tagliarlo (secondi dal suo inizio) */
interface Tratto { blob: Blob; taglio: number; nota: string }

/** i pezzi fra una pausa e l'altra, cuciti uno dopo l'altro in un file solo, senza ricodificare, ognuno tagliato
 *  dove si è premuto PAUSA o FERMA (null se non si riesce: allora si prova pezzo per pezzo) */
async function cuci(tratti: Tratto[], mp4: boolean, note: string[]): Promise<Blob | null> {
  const ingressi = tratti.map((x) => new Input({ source: new BlobSource(x.blob), formats: ALL_FORMATS }));
  try {
    const v0 = await ingressi[0].getPrimaryVideoTrack();
    const a0 = await ingressi[0].getPrimaryAudioTrack();
    if (!v0?.codec) return null;
    const output = new Output({ format: mp4 ? new Mp4OutputFormat({ fastStart: 'in-memory' }) : new WebMOutputFormat(), target: new BufferTarget() });
    const sv = new EncodedVideoPacketSource(v0.codec);
    output.addVideoTrack(sv);
    const sa = a0?.codec ? new EncodedAudioPacketSource(a0.codec) : null;
    if (sa) output.addAudioTrack(sa);
    await output.start();
    const cv = await v0.getDecoderConfig();
    const ca = await a0?.getDecoderConfig();
    let primoV = true, primoA = true;
    /** dove comincia il pezzo nel file cucito, in secondi */
    let inizio = 0;
    for (const [i, inp] of ingressi.entries()) {
      const v = await inp.getPrimaryVideoTrack();
      const a = sa ? await inp.getPrimaryAudioTrack() : null;
      if (!v) { note.push(`pezzo ${i + 1}: niente video`); continue; }
      // video e audio del pezzo partono insieme: si toglie a tutti e due lo stesso inizio
      const base = Math.min(await v.getFirstTimestamp(), a ? await a.getFirstTimestamp() : Infinity);
      const taglio = tratti[i].taglio;
      let fine = inizio, nv = 0, na = 0, via = 0;
      for await (const pk of new EncodedPacketSink(v).packets()) {
        // dopo il taglio c'è il tratto di grazia: via (togliere la coda non rovina i fotogrammi prima)
        if (pk.timestamp - base > taglio) { via++; continue; }
        nv++;
        const t = inizio + Math.max(0, pk.timestamp - base);
        fine = Math.max(fine, t + (pk.duration || 1 / 30));
        await sv.add(pk.clone({ timestamp: t }), primoV && cv ? { decoderConfig: cv } : undefined);
        primoV = false;
      }
      if (a && sa) {
        let ultimo = -1;
        for await (const pk of new EncodedPacketSink(a).packets()) {
          if (pk.timestamp - base > taglio) { via++; continue; }
          na++;
          const t = Math.max(ultimo, inizio + Math.max(0, pk.timestamp - base));
          ultimo = t;
          fine = Math.max(fine, t + (pk.duration || 0.02));
          await sa.add(pk.clone({ timestamp: t }), primoA && ca ? { decoderConfig: ca } : undefined);
          primoA = false;
        }
      }
      note.push(`pezzo ${i + 1}: ${nv} fotogrammi e ${na} pacchetti audio, ${(fine - inizio).toFixed(2)} s (taglio ${taglio.toFixed(2)} s, ${via} via)`);
      inizio = fine;
    }
    await output.finalize();
    const buf = (output.target as BufferTarget).buffer;
    return buf ? new Blob([buf], { type: mp4 ? 'video/mp4' : 'video/webm' }) : null;
  } catch {
    return null;
  } finally {
    for (const i of ingressi) i.dispose();
  }
}

/** il file del MediaRecorder non sa quanto dura e non ha l'indice: lo si ricopia com'è (senza ricodificare) */
async function rimetteInOrdine(blob: Blob, mp4: boolean): Promise<Blob> {
  try {
    const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
    const output = new Output({ format: mp4 ? new Mp4OutputFormat({ fastStart: 'in-memory' }) : new WebMOutputFormat(), target: new BufferTarget() });
    const conv = await Conversion.init({ input, output });
    if (!conv.isValid) return blob;
    await conv.execute();
    input.dispose();
    const buf = (output.target as BufferTarget).buffer;
    return buf ? new Blob([buf], { type: mp4 ? 'video/mp4' : 'video/webm' }) : blob;
  } catch {
    return blob;
  }
}

/** nell'app la registrazione va sul disco (Video/DaProd Video), così il progetto la ritrova sempre */
async function salvaSulDisco(nome: string, blob: Blob): Promise<string | undefined> {
  if (!isTauri) return undefined;
  try {
    const path = await invoke<string>('registrazione_percorso', { name: nome });
    const id = await invoke<number>('export_apri', { path });
    const PEZZO = 8 << 20;
    for (let pos = 0; pos < blob.size; pos += PEZZO) {
      const b = new Uint8Array(await blob.slice(pos, pos + PEZZO).arrayBuffer());
      await invoke('export_scrivi', b, { headers: { 'x-id': String(id), 'x-pos': String(pos) } });
    }
    await invoke('export_chiudi', { id });
    return path;
  } catch {
    return undefined;
  }
}


/** le scelte di LIVE: restano da una volta all'altra */
interface Opzioni {
  mic: boolean;
  micId: string;
  sistema: boolean;
  cam: boolean;
  camId: string;
  camAngolo: Angolo;
  camTonda: boolean;
  /** l'altezza che si chiede allo schermo: 720, 1080, 1440, 2160 */
  qualita: number;
  fps: number;
  cursore: boolean;
  conto: boolean;
  timeline: boolean;
  presentazione: boolean;
  sfondo: string;
}
const OPZ0: Opzioni = {
  mic: true, micId: '', sistema: true, cam: false, camId: '', camAngolo: 'bd', camTonda: true,
  qualita: 1080, fps: 30, cursore: true, conto: true, timeline: true, presentazione: false, sfondo: 'notte',
};
function leggiOpzioni(): Opzioni {
  try { return { ...OPZ0, ...JSON.parse(localStorage.getItem('dpv-live') || '{}') }; } catch { return { ...OPZ0 }; }
}
const QUALITA: [number, string][] = [[720, '720p'], [1080, '1080p'], [1440, '1440p'], [2160, '4K']];
/** quanti bit al secondo per lo schermo: il testo piccolo vuole spazio, i 60 fps un po' di più */
const bitrate = (q: number, f: number) => Math.round((q <= 720 ? 5 : q <= 1080 ? 8 : q <= 1440 ? 14 : 26) * (f > 30 ? 1.5 : 1) * 1e6);

/** un registratore: parte subito, su copie delle tracce tutte sue (così uno non disturba l'altro); ferma(taglio)
 *  segna dove tagliare e lo spegne dopo la grazia */
interface Nastro { fatto: Promise<Tratto>; ferma: (taglio: number) => void }
function nastro(flusso: MediaStream, tipo: string, vbps: number): Nastro {
  const tracce = flusso.getTracks().map((t) => t.clone());
  const rec = new MediaRecorder(new MediaStream(tracce), { mimeType: tipo || undefined, videoBitsPerSecond: vbps, audioBitsPerSecond: 192_000 });
  const dati: Blob[] = [];
  let taglio = Infinity, fermo = false, tardivi = 0, attesa = 0;
  const fatto = new Promise<Tratto>((ok) => {
    const chiudi = () => {
      for (const t of tracce) t.stop();
      ok({ blob: new Blob(dati, { type: rec.mimeType || tipo || 'video/webm' }), taglio, nota: `${dati.length} fette, ${tardivi} dopo lo stop` });
    };
    // finito lo stop si aspetta ancora un attimo: qualche Chromium consegna gli ultimi dati dopo
    const aspetta = () => { clearTimeout(attesa); attesa = window.setTimeout(chiudi, 300); };
    rec.ondataavailable = (e) => { if (e.data.size) dati.push(e.data); if (fermo) { tardivi++; aspetta(); } };
    rec.onstop = () => { fermo = true; aspetta(); };
  });
  try {
    rec.start(FETTA);
  } catch (e) {
    for (const t of tracce) t.stop();
    throw e;
  }
  return {
    fatto,
    // il taglio è adesso, ma il registratore si ferma un po' dopo (così niente resta nel tubo)
    ferma: (t) => { taglio = t; window.setTimeout(() => { try { rec.requestData(); rec.stop(); } catch { /* già fermo */ } }, GRAZIA); },
  };
}

type Fase = 'fermo' | 'conto' | 'registra' | 'pausa';

export class Live {
  el: HTMLElement;
  opz: Opzioni = leggiOpzioni();
  private video: HTMLVideoElement;
  private camVideo: HTMLVideoElement;
  private contoEl: HTMLElement;
  private tempo: HTMLElement;
  private stato: HTMLElement;
  private info: HTMLElement;
  private bReg: HTMLButtonElement;
  private bPausa: HTMLButtonElement;
  private bFerma: HTMLButtonElement;
  private bSegna: HTMLButtonElement;
  private lista: HTMLElement;
  private vu: HTMLCanvasElement;
  private vuNome: HTMLElement;
  private selMic: HTMLSelectElement;
  private selCam: HTMLSelectElement;
  /** il telecomando: tempo, pausa, segno, ferma (nella finestrella sopra le altre, o nell'app diventata piccola) */
  private mini: HTMLElement;
  private miniTempo: HTMLElement;
  private miniPausa: HTMLButtonElement;
  private pip: Window | null = null;
  private miniApp = false;
  private primaMini: { max: boolean; w: number; h: number } | null = null;
  /** chi rimette a posto interruttori e chip quando le scelte cambiano */
  private sinc: (() => void)[] = [];
  private flussi: MediaStream[] = [];
  /** quello che si registra (schermo + audio) e come */
  private flusso: MediaStream | null = null;
  /** la webcam: la stessa per l'anteprima e per la registrazione */
  private cam: MediaStream | null = null;
  /** il microfono aperto solo per provarlo (il VU prima di partire) */
  private micProva: MediaStream | null = null;
  private tipo = '';
  private tipoCam = '';
  private fase: Fase = 'fermo';
  /** il pezzo che si sta registrando adesso, e i tratti (uno per ogni pezzo fra le pause), dello schermo e della webcam */
  private pezzo: { chiudi: () => void } | null = null;
  private pezzi: Promise<Tratto>[] = [];
  private pezziCam: Promise<Tratto>[] = [];
  private audioCtx: AudioContext | null = null;
  private vuCtx: AudioContext | null = null;
  private vuSorgente: MediaStreamAudioSourceNode | null = null;
  private analisi: AnalyserNode | null = null;
  private vuGiro = 0;
  private picco = 0;
  /** millisecondi registrati (senza le pause) e da quando si sta registrando adesso */
  private fatto = 0;
  private da = 0;
  private giro = 0;
  /** i segni messi col tasto M, in secondi di registrazione */
  private segni: number[] = [];
  private annullaConto: (() => void) | null = null;
  private visibile = false;
  /** quanto è durata l'ultima registrazione, pause escluse (in millisecondi), e com'è andata la cucitura */
  durataUltima = 0;
  diagnosi: string[] = [];
  /** finisce quando la registrazione è stata messa nel contenitore (per le prove) */
  ultima: Promise<void> = Promise.resolve();

  constructor() {
    this.video = h('video', { class: 'live-video', muted: true, autoplay: true, playsinline: true }) as HTMLVideoElement;
    this.video.muted = true;
    this.camVideo = h('video', { class: 'live-cam', muted: true, autoplay: true, playsinline: true }) as HTMLVideoElement;
    this.camVideo.muted = true;
    this.contoEl = h('div', { class: 'live-conto' });
    this.tempo = h('div', { class: 'live-tempo' }, '00:00:00');
    this.stato = h('div', { class: 'live-stato' }, 'Pronto');
    this.info = h('div', { class: 'live-info' });
    this.bReg = h('button', { class: 'live-btn reg', title: 'Scegli cosa registrare e parti (R)', on: { click: () => void this.registra() } }, h('i', { class: 'live-punto' }), 'REGISTRA') as HTMLButtonElement;
    this.bPausa = h('button', { class: 'live-btn', disabled: true, title: 'Pausa e riprendi (Spazio o P)', on: { click: () => this.pausa() } }, '❚❚ PAUSA') as HTMLButtonElement;
    this.bFerma = h('button', { class: 'live-btn ferma', disabled: true, title: 'Ferma: finisce nel contenitore (F)', on: { click: () => this.ferma() } }, '■ FERMA') as HTMLButtonElement;
    this.bSegna = h('button', { class: 'live-btn segna', disabled: true, title: 'Un segno qui: nella timeline diventa un marcatore (M)', on: { click: () => this.segna() } }, icona('marcatore', 14), 'SEGNA') as HTMLButtonElement;
    const bTele = h('button', { class: 'live-btn tele', title: 'Il telecomando resta sopra le altre finestre mentre registri', on: { click: () => void this.apriTelecomando() } }, icona('telecomando', 15), 'TELECOMANDO');
    this.lista = h('div', { class: 'live-lista' }, h('p', { class: 'nota' }, 'Le registrazioni di oggi compaiono qui (e nel contenitore, cartella Registrazioni).'));
    this.vu = h('canvas', { class: 'live-vu', width: 300, height: 12, title: 'Clic: prova il microfono' }) as HTMLCanvasElement;
    this.vu.addEventListener('click', () => void this.provaMic());
    this.vuNome = h('span', { class: 'live-vu-nome' }, 'clic per provare');

    // ——— le scelte ———
    const salva = () => { try { localStorage.setItem('dpv-live', JSON.stringify(this.opz)); } catch { /* niente */ } };
    const fisse = new Set<keyof Opzioni>(['mic', 'sistema', 'cam', 'qualita', 'fps', 'cursore', 'micId', 'camId']);
    const cambia = <K extends keyof Opzioni>(k: K, v: Opzioni[K]) => {
      if (this.fase !== 'fermo' && fisse.has(k)) { avviso('Questo si cambia prima di registrare', 'info'); this.sinc.forEach((f) => f()); return false; }
      this.opz[k] = v;
      salva();
      this.sinc.forEach((f) => f());
      return true;
    };
    const interruttore = (k: 'mic' | 'sistema' | 'cam' | 'cursore' | 'conto' | 'timeline' | 'presentazione', ic: string | null, testo: string, info: string, dopo?: () => void) => {
      const led = h('span', { class: 'led' });
      const b = h('button', { class: 'fin-interruttore', title: info, on: { click: () => { if (cambia(k, !this.opz[k])) dopo?.(); } } },
        led, ic ? icona(ic, 14) : null, h('span', { class: 'fin-int-testo' }, testo));
      this.sinc.push(() => { b.classList.toggle('acceso', this.opz[k]); led.classList.toggle('acceso', this.opz[k]); });
      return b;
    };
    const chips = <K extends 'qualita' | 'fps' | 'camAngolo' | 'camTonda' | 'sfondo'>(k: K, lista: [Opzioni[K], string, string?][], dopo?: () => void) => {
      const bb = lista.map(([v, testo, tit]) => {
        const b = h('button', { class: 'chip', title: tit ?? '', on: { click: () => { if (cambia(k, v)) dopo?.(); } } }, testo);
        this.sinc.push(() => b.classList.toggle('acceso', this.opz[k] === v));
        return b;
      });
      return h('div', { class: 'live-chips' }, bb);
    };
    this.selMic = h('select', { class: 'live-sel', title: 'Quale microfono', on: { change: () => { cambia('micId', this.selMic.value); if (this.micProva) { this.fermaProvaMic(); void this.provaMic(); } } } }, h('option', { value: '' }, 'Predefinito')) as HTMLSelectElement;
    this.selCam = h('select', { class: 'live-sel', title: 'Quale webcam', on: { change: () => { if (cambia('camId', this.selCam.value) && this.opz.cam) { this.chiudiCam(); void this.apriCam(); } } } }, h('option', { value: '' }, 'Predefinita')) as HTMLSelectElement;
    const sfondi = h('div', { class: 'live-sfondi' }, SFONDI.map((x) => {
      const b = h('button', { class: 'live-sfondo', title: x.nome, style: `background: linear-gradient(135deg, ${x.a}, ${x.b})`, on: { click: () => cambia('sfondo', x.id) } });
      this.sinc.push(() => b.classList.toggle('acceso', this.opz.sfondo === x.id));
      return b;
    }));
    this.sinc.push(() => {
      this.camVideo.dataset.angolo = this.opz.camAngolo;
      this.camVideo.classList.toggle('tonda', this.opz.camTonda);
      this.el?.classList.toggle('con-presentazione', this.opz.presentazione);
      sfondi.classList.toggle('via', !this.opz.presentazione);
      const sf = SFONDI.find((x) => x.id === this.opz.sfondo) ?? SFONDI[0];
      this.el?.style.setProperty('--live-sfondo', `linear-gradient(135deg, ${sf.a}, ${sf.b})`);
    });

    // ——— il telecomando ———
    this.miniTempo = h('span', { class: 'live-mini-tempo' }, '00:00:00');
    this.miniPausa = h('button', { class: 'live-btn', on: { click: () => this.pausa() } }, '❚❚') as HTMLButtonElement;
    this.mini = h('div', { class: 'live-mini' },
      h('i', { class: 'live-mini-punto' }), this.miniTempo, this.miniPausa,
      h('button', { class: 'live-btn segna', title: 'Segno (M)', on: { click: () => this.segna() } }, icona('marcatore', 14)),
      h('button', { class: 'live-btn ferma', title: 'Ferma (F)', on: { click: () => this.ferma() } }, '■'),
      h('button', { class: 'live-btn', title: 'Torna alla finestra grande', on: { click: () => void this.chiudiTelecomando() } }, '⤢'));
    document.body.append(this.mini);

    const vuoto = h('div', { class: 'live-vuoto' }, icona('schermo', 54), h('b', null, 'Premi REGISTRA'), h('span', null, 'scegli lo schermo, una finestra o una scheda: qui vedi quello che registri'));
    const sezione = (t: string) => h('h4', { class: 'live-sez' }, t);
    this.el = h('section', { class: 'pannello live' },
      h('header', { class: 'fin-testa' }, h('span', { class: 'live-marchio' }, h('i'), 'LIVE'), h('span', null, 'registra lo schermo e mettilo nel montaggio'),
        h('span', { class: 'live-tastiera' }, h('kbd', null, 'R'), ' registra ', h('kbd', null, 'Spazio'), ' pausa ', h('kbd', null, 'M'), ' segno ', h('kbd', null, 'F'), ' ferma')),
      h('div', { class: 'live-dentro' },
        h('div', { class: 'live-schermo' }, h('div', { class: 'live-quadro' }, vuoto, this.video), this.camVideo, this.contoEl),
        h('div', { class: 'live-comandi' },
          h('div', { class: 'live-regia' },
            this.tempo, this.stato, this.info,
            h('div', { class: 'live-tasti' }, this.bReg, this.bPausa, this.bFerma),
            h('div', { class: 'live-tasti due' }, this.bSegna, bTele),
            h('div', { class: 'live-vu-riga' }, icona('mic', 13), this.vu, this.vuNome)),
          sezione('Cosa registro'),
          h('div', { class: 'live-riga' }, interruttore('mic', 'mic', 'Microfono', 'La tua voce mentre registri'), this.selMic),
          interruttore('sistema', 'altoparlante', 'Audio del computer', 'Il suono di quello che registri (dove il sistema lo permette)'),
          h('div', { class: 'live-riga' }, interruttore('cam', 'webcam', 'Webcam', 'La tua faccia in un angolo: registrata a parte, va sulla traccia sopra', () => { if (this.opz.cam) void this.apriCam(); else this.chiudiCam(); }), this.selCam),
          h('div', { class: 'live-riga cam-scelte' },
            chips('camAngolo', ANGOLI.map(([a, s]): [Angolo, string, string] => [a, s, 'La webcam in questo angolo'])),
            chips('camTonda', [[true, 'Bolla', 'Tonda'], [false, 'Riquadro', 'Un riquadro con gli angoli tondi']])),
          sezione('Qualità'),
          chips('qualita', QUALITA.map(([q, n]): [number, string] => [q, n])),
          h('div', { class: 'live-riga' }, chips('fps', [[30, '30 fps'], [60, '60 fps', 'Più fluido (giochi, animazioni): file più grandi']]),
            interruttore('cursore', null, 'Cursore', 'Il puntatore del mouse nella registrazione (dove il sistema lo permette)')),
          sezione('Partenza e arrivo'),
          interruttore('conto', null, 'Conto alla rovescia 3-2-1', 'Tre secondi per sistemarti prima che parta'),
          interruttore('timeline', null, 'Mettila in fondo alla timeline', 'Quando fermi, la registrazione va anche in coda al montaggio'),
          interruttore('presentazione', null, 'Stile presentazione', 'Lo schermo un po\' più piccolo, angoli tondi e ombra, sopra uno sfondo sfumato (si cambia dopo nelle proprietà)'),
          sfondi,
          sezione('Registrate'),
          this.lista,
          h('p', { class: 'nota' }, puoRegistrare()
            ? 'Il sistema chiede ogni volta cosa registrare. La pausa non lascia buchi: il file riprende da dove eri. Su Windows e nel browser Chrome/Edge c\'è anche l\'audio del computer.'
            : 'Qui non si può registrare lo schermo: su Android il sistema non lo permette alle app come questa. Usa la versione per Windows o Mac, o Chrome/Edge sul computer.'))));
    this.video.addEventListener('loadedmetadata', () => vuoto.classList.add('via'));
    this.video.addEventListener('emptied', () => vuoto.classList.remove('via'));
    if (!puoRegistrare()) this.bReg.disabled = true;
    this.sinc.forEach((f) => f());
    this.disegnaVu();
    // i tasti di LIVE valgono sulla pagina LIVE e sul telecomando, prima di quelli del montaggio
    addEventListener('keydown', (e) => this.tasto(e), true);
    navigator.mediaDevices?.addEventListener?.('devicechange', () => void this.aggiornaDispositivi());
  }

  get registrando() { return this.fase !== 'fermo'; }

  /** la pagina LIVE si vede o no: fuori da LIVE webcam e microfono di prova si spengono */
  mostrata(si: boolean) {
    this.visibile = si;
    if (si) {
      void this.aggiornaDispositivi();
      if (this.opz.cam && !this.cam) void this.apriCam();
    } else if (this.fase === 'fermo') {
      this.chiudiCam();
      this.fermaProvaMic();
    }
  }

  private tasto(e: KeyboardEvent) {
    if (!this.visibile && !this.pip && !this.miniApp) return;
    const t = e.target as HTMLElement;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (document.querySelector('.velo') || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    let preso = true;
    if (k === 'r' && this.fase === 'fermo') void this.registra();
    else if ((k === ' ' || k === 'p') && (this.fase === 'registra' || this.fase === 'pausa')) this.pausa();
    else if (k === 'm' && this.fase === 'registra') this.segna();
    else if ((k === 'f' || k === 'escape') && this.fase !== 'fermo') this.ferma();
    else preso = false;
    if (preso) {
      e.preventDefault();
      e.stopPropagation();
      // lo Spazio su un tasto appena cliccato lo premerebbe un'altra volta
      if (t instanceof HTMLButtonElement) t.blur();
    }
  }

  private async aggiornaDispositivi() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const d = await navigator.mediaDevices.enumerateDevices();
      const riempi = (sel: HTMLSelectElement, kind: MediaDeviceKind, scelto: string, nome: string, primo: string) => {
        const lista = d.filter((x) => x.kind === kind && x.deviceId && x.deviceId !== 'default' && x.deviceId !== 'communications');
        sel.replaceChildren(h('option', { value: '' }, primo), ...lista.map((x, i) => h('option', { value: x.deviceId }, x.label || `${nome} ${i + 1}`)));
        sel.value = lista.some((x) => x.deviceId === scelto) ? scelto : '';
      };
      riempi(this.selMic, 'audioinput', this.opz.micId, 'Microfono', 'Predefinito');
      riempi(this.selCam, 'videoinput', this.opz.camId, 'Webcam', 'Predefinita');
    } catch { /* niente elenco: resta il predefinito */ }
  }

  // ——— webcam e microfono ———
  private async apriCam(): Promise<MediaStream | null> {
    if (this.cam) return this.cam;
    try {
      const s = webcamProva ? await webcamProva() : await navigator.mediaDevices.getUserMedia({
        video: { deviceId: this.opz.camId ? { exact: this.opz.camId } : undefined, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
      });
      // nel frattempo l'hanno spenta
      if (!this.opz.cam) { for (const t of s.getTracks()) t.stop(); return null; }
      this.cam = s;
      this.camVideo.srcObject = s;
      void this.camVideo.play().catch(() => {});
      this.el.classList.add('con-cam');
      void this.aggiornaDispositivi();
      return s;
    } catch {
      avviso('La webcam non si apre (è usata da un altro programma o manca il permesso)', 'info', 3200);
      this.opz.cam = false;
      this.sinc.forEach((f) => f());
      return null;
    }
  }

  private chiudiCam() {
    for (const t of this.cam?.getTracks() ?? []) t.stop();
    this.cam = null;
    this.camVideo.srcObject = null;
    this.el.classList.remove('con-cam');
  }

  private async apriMic(): Promise<MediaStream> {
    if (microfonoProva) return microfonoProva();
    return navigator.mediaDevices.getUserMedia({ audio: { deviceId: this.opz.micId ? { exact: this.opz.micId } : undefined, echoCancellation: true, noiseSuppression: true } });
  }

  /** clic sul VU prima di registrare: il microfono si accende solo per vedere se arriva la voce */
  private async provaMic() {
    if (this.fase !== 'fermo') return;
    if (this.micProva) { this.fermaProvaMic(); return; }
    try {
      this.micProva = await this.apriMic();
      this.avviaVu(this.micProva, 'prova: parla');
      void this.aggiornaDispositivi();
    } catch {
      avviso('Il microfono non si apre', 'info');
    }
  }

  private fermaProvaMic() {
    if (!this.micProva) return;
    for (const t of this.micProva.getTracks()) t.stop();
    this.micProva = null;
    this.fermaVu();
  }

  private avviaVu(s: MediaStream, nome: string) {
    this.fermaVu();
    try {
      this.vuCtx ??= new AudioContext();
      void this.vuCtx.resume().catch(() => {});
      this.vuSorgente = this.vuCtx.createMediaStreamSource(s);
      this.analisi = this.vuCtx.createAnalyser();
      this.analisi.fftSize = 1024;
      this.vuSorgente.connect(this.analisi);
      this.vuNome.textContent = nome;
      const buf = new Float32Array(this.analisi.fftSize);
      const giro = () => {
        if (!this.analisi) return;
        this.analisi.getFloatTimeDomainData(buf);
        let p = 0;
        for (const x of buf) p = Math.max(p, Math.abs(x));
        // sale subito, scende piano (come l'ago)
        this.picco = Math.max(p, this.picco * 0.92);
        this.disegnaVu();
        this.vuGiro = requestAnimationFrame(giro);
      };
      giro();
    } catch { /* niente VU: si registra lo stesso */ }
  }

  private fermaVu() {
    cancelAnimationFrame(this.vuGiro);
    this.vuSorgente?.disconnect();
    this.vuSorgente = null;
    this.analisi = null;
    this.picco = 0;
    this.vuNome.textContent = this.fase === 'fermo' ? 'clic per provare' : '';
    this.disegnaVu();
  }

  /** la barra a LED del microfono: verde, giallo da −12 dB, rosso da −3 */
  private disegnaVu() {
    const x = this.vu.getContext('2d');
    if (!x) return;
    const W = this.vu.width, H = this.vu.height, N = 30, g = 2;
    const db = this.picco > 0 ? 20 * Math.log10(this.picco) : -60;
    const acceso = Math.round(Math.max(0, Math.min(1, (db + 48) / 48)) * N);
    x.clearRect(0, 0, W, H);
    const w = (W - g * (N - 1)) / N;
    for (let i = 0; i < N; i++) {
      const d = -48 + (i / N) * 48;
      const col = d > -3 ? '#ff4d6d' : d > -12 ? '#ffd54a' : '#4cd98a';
      x.globalAlpha = i < acceso ? 1 : 0.14;
      x.fillStyle = col;
      x.fillRect(i * (w + g), 0, w, H);
    }
    x.globalAlpha = 1;
  }

  private aggiornaTempo() {
    const ms = this.fatto + (this.fase === 'registra' ? performance.now() - this.da : 0);
    this.tempo.textContent = orologio(ms);
    this.miniTempo.textContent = orologio(ms);
  }

  /** i tasti e le spie secondo la fase */
  private aggiornaTasti() {
    const f = this.fase;
    this.bReg.disabled = f !== 'fermo' || !puoRegistrare();
    this.bPausa.disabled = f !== 'registra' && f !== 'pausa';
    this.bFerma.disabled = f === 'fermo';
    this.bSegna.disabled = f !== 'registra';
    this.bPausa.textContent = f === 'pausa' ? '▶ RIPRENDI' : '❚❚ PAUSA';
    this.miniPausa.textContent = f === 'pausa' ? '▶' : '❚❚';
    this.el.classList.toggle('in-onda', f === 'registra' || f === 'pausa');
    this.el.classList.toggle('in-pausa', f === 'pausa');
    this.mini.classList.toggle('in-pausa', f === 'pausa');
  }

  /** il 3-2-1 sopra l'anteprima, con un bip per numero; FERMA o Esc lo annullano */
  private conto(): Promise<boolean> {
    return new Promise((ok) => {
      let n = 3, timer = 0;
      const bip = () => {
        try {
          const ctx = this.vuCtx ??= new AudioContext();
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.frequency.value = 880;
          g.gain.setValueAtTime(0.16, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
          o.connect(g).connect(ctx.destination);
          o.start();
          o.stop(ctx.currentTime + 0.18);
        } catch { /* muto */ }
      };
      const fine = (si: boolean) => { clearTimeout(timer); this.annullaConto = null; this.contoEl.classList.remove('su', 'batti'); ok(si); };
      const passo = () => {
        if (n === 0) { fine(true); return; }
        this.contoEl.textContent = String(n);
        this.contoEl.classList.remove('batti');
        void this.contoEl.offsetWidth;
        this.contoEl.classList.add('batti');
        this.miniTempo.textContent = `… ${n}`;
        bip();
        n--;
        timer = window.setTimeout(passo, 1000);
      };
      this.annullaConto = () => fine(false);
      this.contoEl.classList.add('su');
      passo();
    });
  }

  /** un pezzo nuovo: lo schermo (con l'audio) e la webcam partono insieme e si fermano allo stesso taglio */
  private nuovoPezzo() {
    const t0 = performance.now();
    const n = nastro(this.flusso!, this.tipo, bitrate(this.opz.qualita, this.opz.fps));
    this.pezzi.push(n.fatto);
    let c: Nastro | null = null;
    if (this.cam) {
      try {
        c = nastro(this.cam, this.tipoCam, 4_000_000);
        this.pezziCam.push(c.fatto);
      } catch { /* la webcam no, lo schermo sì */ }
    }
    this.pezzo = { chiudi: () => { const t = (performance.now() - t0) / 1000; n.ferma(t); c?.ferma(t); } };
  }

  async registra() {
    // bReg spento = la scelta dello schermo è già aperta (niente due finestre col doppio clic)
    if (this.fase !== 'fermo' || this.bReg.disabled) return;
    if (!puoRegistrare()) { avviso('Qui non si può registrare lo schermo', 'info'); return; }
    this.bReg.disabled = true;
    motore.stop();
    this.fermaProvaMic();
    const o = this.opz;
    // il mixer dell'audio si accende adesso, col clic: dopo la scelta dello schermo il browser lo terrebbe spento
    // (e l'audio del computer mescolato al microfono usciva muto o a singhiozzo)
    let mixer: AudioContext | null = null;
    try { mixer = new AudioContext({ sampleRate: 48000, latencyHint: 'playback' }); void mixer.resume().catch(() => {}); } catch { mixer = null; }
    let schermo: MediaStream;
    try {
      schermo = sorgenteProva ? await sorgenteProva(o.sistema) : await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: o.fps }, height: { ideal: o.qualita }, width: { ideal: Math.round(o.qualita * 16 / 9) },
          ...({ cursor: o.cursore ? 'always' : 'never' } as object),
        },
        // l'audio del computer così com'è: niente cancellazione dell'eco, niente filtri anti-rumore, niente volume
        // automatico (sono fatti per la voce e rovinano musica e suoni), in stereo
        audio: o.sistema ? { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 2, sampleRate: 48000, ...({ suppressLocalAudioPlayback: false } as object) } as MediaTrackConstraints : false,
        // Chrome: niente "questa scheda" in cima, l'audio del sistema (anche registrando una finestra sola)
        ...({ selfBrowserSurface: 'exclude', systemAudio: 'include', windowAudio: 'system', surfaceSwitching: 'include' } as object),
      } as DisplayMediaStreamOptions);
    } catch {
      void mixer?.close().catch(() => {});
      this.stato.textContent = 'Registrazione annullata';
      this.aggiornaTasti();
      return;
    }
    this.flussi = [schermo];
    const tracce: MediaStreamTrack[] = [...schermo.getVideoTracks()];
    // l'audio: il microfono e quello del computer, mescolati in una traccia sola
    const audio: MediaStream[] = [];
    if (schermo.getAudioTracks().length) audio.push(new MediaStream(schermo.getAudioTracks()));
    let mic: MediaStream | null = null;
    if (o.mic) {
      try {
        mic = await this.apriMic();
        this.flussi.push(mic);
        audio.push(mic);
      } catch { avviso('Il microfono non si apre: registro senza', 'info', 2400); }
    }
    let mix: MediaStream | null = null;
    if (audio.length === 1) { tracce.push(...audio[0].getAudioTracks()); void mixer?.close().catch(() => {}); }
    else if (audio.length > 1) {
      const ctx = mixer ?? new AudioContext({ sampleRate: 48000 });
      void ctx.resume().catch(() => {});
      this.audioCtx = ctx;
      const dest = ctx.createMediaStreamDestination();
      dest.channelCount = 2;
      // un limitatore alla fine: voce e computer insieme non vanno mai in distorsione
      const lim = ctx.createDynamicsCompressor();
      lim.threshold.value = -3; lim.knee.value = 2; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.12;
      lim.connect(dest);
      for (const a of audio) {
        const g = ctx.createGain();
        // il microfono (mono) un filo più su, il computer com'è
        g.gain.value = a === mic ? 1.15 : 1;
        ctx.createMediaStreamSource(a).connect(g).connect(lim);
      }
      tracce.push(...dest.stream.getAudioTracks());
      mix = dest.stream;
    } else void mixer?.close().catch(() => {});
    if (o.cam && !this.cam) await this.apriCam();
    this.flusso = new MediaStream(tracce);
    this.tipo = formato();
    this.tipoCam = formato(true);
    this.video.srcObject = schermo;
    void this.video.play().catch(() => {});
    if (audio.length) this.avviaVu(mix ?? mic ?? audio[0], mix ? 'microfono + computer' : mic ? 'microfono' : 'audio del computer');
    const st = schermo.getVideoTracks()[0]?.getSettings?.() ?? {};
    this.info.textContent = [st.width && st.height ? `${st.width}×${st.height}` : '', st.frameRate ? `${Math.round(st.frameRate)} fps` : '', mic ? 'microfono' : '', schermo.getAudioTracks().length ? 'audio del computer' : '', this.cam ? 'webcam' : ''].filter(Boolean).join(' · ');
    // se si ferma la condivisione dalla barra del sistema, è come premere FERMA
    schermo.getVideoTracks()[0]?.addEventListener('ended', () => this.ferma());
    if (o.conto) {
      this.fase = 'conto';
      this.aggiornaTasti();
      this.stato.textContent = 'Si parte fra…';
      if (!(await this.conto())) {
        this.fase = 'fermo';
        this.fermaVu();
        this.chiudiFlussi();
        this.aggiornaTasti();
        this.stato.textContent = 'Partenza annullata';
        this.info.textContent = '';
        return;
      }
    }
    this.pezzi = [];
    this.pezziCam = [];
    this.segni = [];
    try {
      this.nuovoPezzo();
    } catch (e) {
      this.fase = 'fermo';
      this.fermaVu();
      this.chiudiFlussi();
      this.aggiornaTasti();
      avviso('Non riesco a registrare: ' + String(e), 'errore', 4000);
      return;
    }
    this.fase = 'registra';
    this.fatto = 0;
    this.da = performance.now();
    this.aggiornaTasti();
    this.stato.textContent = '● Sto registrando';
    this.giro = window.setInterval(() => this.aggiornaTempo(), 250);
    avviso('● Registro: PAUSA quando vuoi, M per un segno, FERMA e finisce nel contenitore', 'ok', 2400);
  }

  pausa() {
    if (this.fase === 'registra') {
      // la pausa chiude il pezzo: nel file finale la pausa non c'è proprio
      this.pezzo?.chiudi();
      this.pezzo = null;
      this.fase = 'pausa';
      this.fatto += performance.now() - this.da;
      this.stato.textContent = '❚❚ In pausa';
    } else if (this.fase === 'pausa') {
      try {
        this.nuovoPezzo();
      } catch (e) {
        avviso('Non riesco a riprendere: ' + String(e), 'errore', 4000);
        this.ferma();
        return;
      }
      this.fase = 'registra';
      this.da = performance.now();
      this.stato.textContent = '● Sto registrando';
    }
    this.aggiornaTasti();
    this.aggiornaTempo();
  }

  /** un segno adesso: quando la registrazione va in timeline diventa un marcatore rosso */
  segna() {
    if (this.fase !== 'registra') return;
    const t = (this.fatto + performance.now() - this.da) / 1000;
    this.segni.push(t);
    this.stato.textContent = `● Segno ${this.segni.length} a ${orologio(t * 1000)}`;
    this.el.classList.remove('lampo');
    void this.el.offsetWidth;
    this.el.classList.add('lampo');
  }

  /** spegne schermo, microfono e mixer (quelli di adesso, o quelli di una registrazione appena fermata) */
  private chiudiFlussi(flussi = this.flussi, ctx = this.audioCtx) {
    for (const f of flussi) for (const t of f.getTracks()) t.stop();
    void ctx?.close().catch(() => {});
    if (flussi !== this.flussi) return;
    this.flussi = [];
    this.audioCtx = null;
    this.flusso = null;
    this.video.srcObject = null;
  }

  /** la miniatura della registrazione: lo schermo, e la webcam nel suo angolo */
  private foto(): string {
    try {
      const c = document.createElement('canvas');
      c.width = 192; c.height = 108;
      const x = c.getContext('2d')!;
      x.fillStyle = '#000';
      x.fillRect(0, 0, 192, 108);
      const v = this.video;
      if (v.videoWidth) {
        const k = Math.min(192 / v.videoWidth, 108 / v.videoHeight);
        const w = v.videoWidth * k, hh = v.videoHeight * k;
        x.drawImage(v, (192 - w) / 2, (108 - hh) / 2, w, hh);
      }
      const cv = this.camVideo;
      if (this.cam && cv.videoWidth) {
        const d = 34, lato = Math.min(cv.videoWidth, cv.videoHeight);
        const dx = this.opz.camAngolo.endsWith('d') ? 192 - d - 5 : 5, dy = this.opz.camAngolo.startsWith('b') ? 108 - d - 5 : 5;
        x.save();
        x.beginPath();
        x.arc(dx + d / 2, dy + d / 2, d / 2, 0, Math.PI * 2);
        x.clip();
        x.drawImage(cv, (cv.videoWidth - lato) / 2, (cv.videoHeight - lato) / 2, lato, lato, dx, dy, d, d);
        x.restore();
      }
      return c.toDataURL('image/jpeg', 0.72);
    } catch {
      return '';
    }
  }

  ferma() {
    if (this.fase === 'conto') { this.annullaConto?.(); return; }
    if (this.fase === 'fermo') return;
    if (this.fase === 'registra') this.fatto += performance.now() - this.da;
    this.pezzo?.chiudi();
    this.pezzo = null;
    this.fase = 'fermo';
    clearInterval(this.giro);
    this.aggiornaTempo();
    this.aggiornaTasti();
    this.fermaVu();
    void this.chiudiTelecomando();
    this.stato.textContent = 'Metto in ordine la registrazione…';
    const foto = this.foto();
    const durata = this.durataUltima = this.fatto;
    const pezzi = this.pezzi, pezziCam = this.pezziCam, segni = this.segni, flussi = this.flussi, ctx = this.audioCtx;
    this.pezzi = [];
    this.pezziCam = [];
    this.segni = [];
    this.flussi = [];
    this.audioCtx = null;
    this.flusso = null;
    this.ultima = (async () => {
      // i flussi si spengono solo quando l'ultimo pezzo ha dato tutto
      const [tratti, trattiCam] = await Promise.all([Promise.all(pezzi), Promise.all(pezziCam)]);
      this.diagnosi = tratti.map((x, i) => `tratto ${i + 1}: ${Math.round(x.blob.size / 1024)} kB, ${x.nota}`);
      this.chiudiFlussi(flussi, ctx);
      if (this.fase === 'fermo') this.video.srcObject = null;
      // la webcam resta accesa per l'anteprima solo se si è ancora su LIVE
      if (!this.visibile) this.chiudiCam();
      await this.consegna(tratti.filter((x) => x.blob.size), trattiCam.filter((x) => x.blob.size), durata, segni, foto);
    })().catch((e) => {
      this.stato.textContent = 'Non sono riuscito a mettere via la registrazione';
      avviso('La registrazione non si salva: ' + String(e), 'errore', 4000);
    });
  }

  /** la cartella del contenitore dove vanno le registrazioni (si fa la prima volta) */
  private cartellaRegistrazioni(): string {
    const c = store.doc.cartelle?.find((x) => !x.genitore && x.nome === 'Registrazioni');
    if (c) return c.id;
    const id = uid('d');
    store.edit('Cartella Registrazioni', (p) => { (p.cartelle ??= []).push({ id, nome: 'Registrazioni' }); });
    return id;
  }

  /** la registrazione finita: cucita, sul disco (nell'app), nel contenitore e in fondo alla timeline */
  private async consegna(tratti: Tratto[], trattiCam: Tratto[], durata: number, segni: number[], foto: string) {
    if (!tratti.length) { this.stato.textContent = 'La registrazione è vuota'; return; }
    const mp4 = /mp4/.test(tratti[0].blob.type);
    // di solito un file solo; se la cucitura non riesce, i pezzi vanno uno dopo l'altro (sempre senza buchi)
    const cucito = await cuci(tratti, mp4, this.diagnosi);
    const files = cucito ? [cucito] : await Promise.all(tratti.map((x) => rimetteInOrdine(x.blob, mp4)));
    let camBlob: Blob | null = null;
    if (trattiCam.length) {
      const note: string[] = [];
      const camMp4 = /mp4/.test(trattiCam[0].blob.type);
      camBlob = await cuci(trattiCam, camMp4, note) ?? (trattiCam.length === 1 ? await rimetteInOrdine(trattiCam[0].blob, camMp4) : null);
      this.diagnosi.push(...note.map((x) => 'webcam ' + x));
    }
    const ora = new Date();
    const radice = `Registrazione ${ora.getFullYear()}-${due(ora.getMonth() + 1)}-${due(ora.getDate())} ${due(ora.getHours())}.${due(ora.getMinutes())}.${due(ora.getSeconds())}`;
    const cartella = this.cartellaRegistrazioni();
    const importa = async (nome: string, blob: Blob) => {
      const path = await salvaSulDisco(nome, blob);
      const file = new File([blob], nome, { type: blob.type });
      const [m] = await importaFile([{ name: nome, path, file: path ? undefined : file }], { chiediFormato: false, cartella });
      return m as MediaItem | undefined;
    };
    const schermi: MediaItem[] = [];
    for (const [i, blob] of files.entries()) {
      // il formato del progetto non si cambia per una registrazione (una finestra può avere una misura qualsiasi)
      const m = await importa(`${radice}${files.length > 1 ? ` parte ${i + 1}` : ''}.${mp4 ? 'mp4' : 'webm'}`, blob);
      if (m) schermi.push(m);
    }
    if (!schermi.length) { this.stato.textContent = 'Non sono riuscito a leggere la registrazione'; return; }
    const mCam = camBlob ? await importa(`${radice} webcam.${/mp4/.test(camBlob.type) ? 'mp4' : 'webm'}`, camBlob) : undefined;
    const ids = this.opz.timeline ? this.inTimeline(schermi, mCam ?? null, segni) : [];
    if (ids.length) store.select(ids);
    const { id, name: nome } = schermi[0];
    this.stato.textContent = `Fatto: ${nome}`;
    const riga = h('button', { class: 'live-voce', title: 'Aprila nel monitor', on: { click: () => { motore.caricaPlayer(id); motore.setMonitor('player'); document.dispatchEvent(new CustomEvent('dpv:pagina', { detail: 'montaggio' })); } } },
      foto ? h('img', { class: 'live-voce-foto', src: foto, alt: '' }) : icona('video', 14),
      h('span', { class: 'live-voce-testo' }, h('b', null, nome.replace(/\.(webm|mp4)$/, '')),
        h('small', null, [orologio(durata), mCam ? 'webcam' : '', segni.length ? `${segni.length} segni` : ''].filter(Boolean).join(' · '))));
    if (this.lista.querySelector('.nota')) this.lista.replaceChildren();
    this.lista.prepend(riga);
    avviso(`🎬 ${nome}: nel contenitore${this.opz.timeline ? ' e in fondo alla timeline' : ''}`, 'ok', 3200);
  }

  /**
   * In fondo alla timeline, dal basso: lo sfondo (stile presentazione), lo schermo, la webcam sopra. Se le tracce
   * video non bastano se ne aggiungono. Tutto legato insieme, così si sposta in un colpo; i segni diventano marcatori.
   */
  private inTimeline(schermi: MediaItem[], cam: MediaItem | null, segni: number[]): string[] {
    const o = this.opz;
    return store.edit('Registrazione in timeline', (p) => {
      const inizio = projectEnd(p);
      const vt = p.tracks.filter((t) => t.kind === 'video' && !t.lock);
      const servono = 1 + (o.presentazione ? 1 : 0) + (cam ? 1 : 0);
      while (vt.length < servono) {
        const nt = newTrack('video', nextTrackName(p, 'video'));
        p.tracks.unshift(nt);
        vt.unshift(nt);
      }
      const dalBasso = [...vt].reverse();
      let k = 0;
      const tSfondo = o.presentazione ? dalBasso[k++].id : null;
      const tSchermo = dalBasso[k++].id;
      const tCam = cam ? dalBasso[k++].id : null;
      const a = p.tracks.find((t) => t.kind === 'audio' && !t.lock)?.id;
      const ids: string[] = [];
      let f = inizio;
      let link: string | undefined;
      for (const m of schermi) {
        const nuovi = M.placeSource(p, { mediaId: m.id, srcIn: m.t0 || 0, srcOut: m.duration }, f, null, { video: tSchermo, audio: a ? [a] : [] }, 'libero');
        ids.push(...nuovi);
        const v = p.clips.find((c) => nuovi.includes(c.id) && c.track === tSchermo) ?? p.clips.find((c) => c.id === nuovi[0]);
        if (!v) continue;
        if (o.presentazione) v.tf = presentazione();
        link ??= v.link ?? (v.link = uid('l'));
        for (const c of p.clips) if (nuovi.includes(c.id)) c.link = link;
        f = Math.max(f, v.start + v.len);
      }
      if (tSfondo && f > inizio) {
        const sf = SFONDI.find((x) => x.id === o.sfondo) ?? SFONDI[0];
        const c = newClip('color', tSfondo, inizio, f - inizio, { name: 'Sfondo ' + sf.nome, gen: { color: sf.a, color2: sf.b }, link });
        p.clips.push(c);
        ids.push(c.id);
      }
      if (cam && tCam) {
        const nuovi = M.placeSource(p, { mediaId: cam.id, srcIn: cam.t0 || 0, srcOut: cam.duration }, inizio, null, { video: tCam, audio: [] }, 'libero');
        // la webcam finisce con lo schermo (il suo registratore consegna un fotogramma in più)
        for (const c of p.clips) if (nuovi.includes(c.id)) { c.tf = bolla(p, cam, o.camAngolo, 0.3, o.camTonda); c.link = link; if (f > inizio) c.len = Math.min(c.len, f - inizio); }
        ids.push(...nuovi);
      }
      const r = fps(p.rate);
      segni.forEach((t, i) => p.markers.push({ id: uid('k'), f: inizio + Math.round(t * r), name: `Segno ${i + 1}`, color: '#ff4d6d' }));
      return ids;
    });
  }

  // ——— il telecomando ———
  async apriTelecomando() {
    if (this.pip || this.miniApp) return;
    const dpip = (window as unknown as { documentPictureInPicture?: { requestWindow: (o: object) => Promise<Window> } }).documentPictureInPicture;
    if (dpip && !isTauri) {
      try {
        const w = await dpip.requestWindow({ width: 360, height: 72 });
        // gli stili della pagina, copiati nella finestrella (con la base giusta per i caratteri)
        w.document.head.append(h('base', { href: location.href }));
        for (const ss of [...document.styleSheets]) {
          try {
            w.document.head.append(h('style', null, [...ss.cssRules].map((r) => r.cssText).join('\n')));
          } catch {
            if (ss.href) w.document.head.append(h('link', { rel: 'stylesheet', href: ss.href }));
          }
        }
        w.document.body.className = 'pip-live';
        w.document.body.append(this.mini);
        this.mini.classList.add('su');
        w.addEventListener('keydown', (e) => this.tasto(e), true);
        w.addEventListener('pagehide', () => { this.pip = null; this.mini.classList.remove('su'); document.body.append(this.mini); });
        this.pip = w;
        this.aggiornaTempo();
        return;
      } catch { /* niente finestrella: si prova la finestra piccola */ }
    }
    if (isTauri && !isAndroid) { await this.finestraPiccola(true); return; }
    avviso('Il telecomando sopra le altre finestre c\'è in Chrome ed Edge e nell\'app per Windows e Mac', 'info', 3200);
  }

  async chiudiTelecomando() {
    if (this.pip) { this.pip.close(); this.pip = null; this.mini.classList.remove('su'); document.body.append(this.mini); }
    if (this.miniApp) await this.finestraPiccola(false);
  }

  /** nell'app: la finestra diventa una barretta sempre in primo piano (e poi torna com'era) */
  private async finestraPiccola(si: boolean) {
    try {
      const { getCurrentWindow, LogicalSize } = await import('@tauri-apps/api/window');
      const w = getCurrentWindow();
      if (si) {
        const k = await w.scaleFactor();
        const s = (await w.innerSize()).toLogical(k);
        this.primaMini = { max: await w.isMaximized(), w: s.width, h: s.height };
        if (this.primaMini.max) await w.unmaximize();
        await w.setMinSize(new LogicalSize(320, 64));
        await w.setSize(new LogicalSize(400, 72));
        await w.setAlwaysOnTop(true);
        document.documentElement.classList.add('mini-live');
        this.mini.classList.add('su');
        this.miniApp = true;
        this.aggiornaTempo();
      } else {
        this.miniApp = false;
        document.documentElement.classList.remove('mini-live');
        this.mini.classList.remove('su');
        await w.setAlwaysOnTop(false);
        await w.setMinSize(new LogicalSize(1000, 640));
        const pm = this.primaMini;
        if (pm) { await w.setSize(new LogicalSize(pm.w, pm.h)); if (pm.max) await w.maximize(); }
      }
    } catch (e) {
      avviso('Il telecomando non si apre: ' + String(e), 'info', 3200);
    }
  }
}
