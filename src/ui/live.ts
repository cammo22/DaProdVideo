// La pagina LIVE: registra lo schermo (o una finestra, o una scheda) con un tasto solo. REGISTRA, PAUSA, FERMA:
// quando fermi, la registrazione finisce nel contenitore e, se vuoi, in fondo alla timeline. Col microfono e con
// l'audio del computer, mescolati in una traccia. Sotto c'è il motore del browser (getDisplayMedia e MediaRecorder).
// La PAUSA chiude un pezzo e RIPRENDI ne apre un altro (la pausa di MediaRecorder non la tratta uguale ogni browser:
// alcuni lasciano il buco nel file); alla fine Mediabunny cuce i pezzi uno dopo l'altro in un file solo, con durata
// e indice giusti, così si taglia e si sposta come gli altri.
import {
  ALL_FORMATS, BlobSource, BufferTarget, Conversion, EncodedAudioPacketSource, EncodedPacketSink, EncodedVideoPacketSource,
  Input, Mp4OutputFormat, Output, WebMOutputFormat,
} from 'mediabunny';
import { store } from '../core/store';
import { projectEnd } from '../core/progetto';
import * as M from '../core/montaggio';
import { importaFile } from '../progetti';
import { invoke, isAndroid, isTauri } from '../platform';
import { motore } from '../motore';
import { avviso, h, icona } from './dom';

/** da dove arriva l'immagine: di solito la scelta del sistema; le prove ne mettono una finta */
type Sorgente = (conAudio: boolean) => Promise<MediaStream>;
let sorgenteProva: Sorgente | null = null;
let microfonoProva: (() => Promise<MediaStream>) | null = null;
export const impostaSorgenteLive = (s: Sorgente | null, mic: (() => Promise<MediaStream>) | null = null) => { sorgenteProva = s; microfonoProva = mic; };

const puoRegistrare = () => !!sorgenteProva || (!!navigator.mediaDevices?.getDisplayMedia && typeof MediaRecorder !== 'undefined' && !isAndroid);

function formato(): string {
  for (const m of ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4;codecs=avc1,mp4a', 'video/mp4']) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

const due = (n: number) => String(n).padStart(2, '0');
const orologio = (ms: number) => { const s = Math.floor(ms / 1000); return `${due(Math.floor(s / 3600))}:${due(Math.floor(s / 60) % 60)}:${due(s % 60)}`; };

/** i pezzi fra una pausa e l'altra, cuciti uno dopo l'altro in un file solo, senza ricodificare
 *  (null se non si riesce: allora si prova pezzo per pezzo) */
async function cuci(pezzi: Blob[], mp4: boolean): Promise<Blob | null> {
  const ingressi = pezzi.map((b) => new Input({ source: new BlobSource(b), formats: ALL_FORMATS }));
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
    for (const inp of ingressi) {
      const v = await inp.getPrimaryVideoTrack();
      const a = sa ? await inp.getPrimaryAudioTrack() : null;
      if (!v) continue;
      // video e audio del pezzo partono insieme: si toglie a tutti e due lo stesso inizio
      const base = Math.min(await v.getFirstTimestamp(), a ? await a.getFirstTimestamp() : Infinity);
      let fine = inizio;
      for await (const pk of new EncodedPacketSink(v).packets()) {
        const t = inizio + Math.max(0, pk.timestamp - base);
        fine = Math.max(fine, t + (pk.duration || 1 / 30));
        await sv.add(pk.clone({ timestamp: t }), primoV && cv ? { decoderConfig: cv } : undefined);
        primoV = false;
      }
      if (a && sa) {
        let ultimo = -1;
        for await (const pk of new EncodedPacketSink(a).packets()) {
          const t = Math.max(ultimo, inizio + Math.max(0, pk.timestamp - base));
          ultimo = t;
          fine = Math.max(fine, t + (pk.duration || 0.02));
          await sa.add(pk.clone({ timestamp: t }), primoA && ca ? { decoderConfig: ca } : undefined);
          primoA = false;
        }
      }
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

export class Live {
  el: HTMLElement;
  private video: HTMLVideoElement;
  private tempo: HTMLElement;
  private stato: HTMLElement;
  private bReg: HTMLButtonElement;
  private bPausa: HTMLButtonElement;
  private bFerma: HTMLButtonElement;
  private lista: HTMLElement;
  private opz = { mic: true, sistema: true, timeline: true };
  private flussi: MediaStream[] = [];
  /** quello che si registra (schermo + audio) e come */
  private flusso: MediaStream | null = null;
  private tipo = '';
  private fase: 'fermo' | 'registra' | 'pausa' = 'fermo';
  /** il pezzo che si sta registrando adesso, e i pezzi (uno per ogni tratto fra le pause) */
  private rec: MediaRecorder | null = null;
  private pezzi: Promise<Blob>[] = [];
  private audioCtx: AudioContext | null = null;
  /** millisecondi registrati (senza le pause) e da quando si sta registrando adesso */
  private fatto = 0;
  private da = 0;
  private giro = 0;
  /** quanto è durata l'ultima registrazione, pause escluse (in millisecondi) */
  durataUltima = 0;
  /** finisce quando la registrazione è stata messa nel contenitore (per le prove) */
  ultima: Promise<void> = Promise.resolve();

  constructor() {
    this.video = h('video', { class: 'live-video', muted: true, autoplay: true, playsinline: true }) as HTMLVideoElement;
    this.video.muted = true;
    this.tempo = h('div', { class: 'live-tempo' }, '00:00:00');
    this.stato = h('div', { class: 'live-stato' }, 'Pronto');
    this.bReg = h('button', { class: 'live-btn reg', title: 'Scegli cosa registrare e parti', on: { click: () => void this.registra() } }, h('i', { class: 'live-punto' }), 'REGISTRA') as HTMLButtonElement;
    this.bPausa = h('button', { class: 'live-btn', disabled: true, on: { click: () => this.pausa() } }, '❚❚ PAUSA') as HTMLButtonElement;
    this.bFerma = h('button', { class: 'live-btn ferma', disabled: true, on: { click: () => this.ferma() } }, '■ FERMA') as HTMLButtonElement;
    this.lista = h('div', { class: 'live-lista' }, h('p', { class: 'nota' }, 'Le registrazioni di oggi compaiono qui (e nel contenitore).'));
    const interruttore = (chiave: keyof Live['opz'], testo: string, info: string) => {
      const b = h('button', { class: 'fin-interruttore' + (this.opz[chiave] ? ' acceso' : ''), title: info, on: {
        click: () => { if (this.fase !== 'fermo' && chiave !== 'timeline') { avviso('Si cambia prima di registrare', 'info'); return; } this.opz[chiave] = !this.opz[chiave]; b.classList.toggle('acceso', this.opz[chiave]); b.querySelector('.led')!.classList.toggle('acceso', this.opz[chiave]); },
      } }, h('span', { class: 'led' + (this.opz[chiave] ? ' acceso' : '') }), h('span', { class: 'fin-int-testo' }, testo));
      return b;
    };
    const vuoto = h('div', { class: 'live-vuoto' }, icona('schermo', 54), h('b', null, 'Premi REGISTRA'), h('span', null, 'scegli lo schermo, una finestra o una scheda: qui vedi quello che registri'));
    this.el = h('section', { class: 'pannello live' },
      h('header', { class: 'fin-testa' }, h('span', { class: 'live-marchio' }, h('i'), 'LIVE'), h('span', null, 'registra lo schermo e mettilo nel montaggio')),
      h('div', { class: 'live-dentro' },
        h('div', { class: 'live-schermo' }, vuoto, this.video),
        h('div', { class: 'live-comandi' },
          this.tempo, this.stato,
          h('div', { class: 'live-tasti' }, this.bReg, this.bPausa, this.bFerma),
          interruttore('mic', 'Microfono', 'La tua voce mentre registri'),
          interruttore('sistema', 'Audio del computer', 'Il suono di quello che registri (dove il sistema lo permette)'),
          interruttore('timeline', 'Mettila in fondo alla timeline', 'Quando fermi, la registrazione va anche in coda al montaggio'),
          h('h4', { class: 'bin-sezione' }, 'Registrate'),
          this.lista,
          h('p', { class: 'nota' }, puoRegistrare()
            ? 'Il sistema chiede ogni volta cosa registrare. La pausa non lascia buchi: il file riprende da dove eri. Su Windows e nel browser Chrome/Edge c\'è anche l\'audio del computer.'
            : 'Qui non si può registrare lo schermo: su Android il sistema non lo permette alle app come questa. Usa la versione per Windows o Mac, o Chrome/Edge sul computer.'))));
    this.video.addEventListener('loadedmetadata', () => vuoto.classList.add('via'));
    this.video.addEventListener('emptied', () => vuoto.classList.remove('via'));
    if (!puoRegistrare()) this.bReg.disabled = true;
  }

  get registrando() { return this.fase !== 'fermo'; }

  private aggiornaTempo() {
    const ms = this.fatto + (this.fase === 'registra' ? performance.now() - this.da : 0);
    this.tempo.textContent = orologio(ms);
  }

  /** un pezzo nuovo: parte subito e, quando si ferma, diventa un Blob */
  private nuovoPezzo() {
    const rec = new MediaRecorder(this.flusso!, { mimeType: this.tipo || undefined, videoBitsPerSecond: 8_000_000, audioBitsPerSecond: 160_000 });
    const dati: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) dati.push(e.data); };
    this.pezzi.push(new Promise<Blob>((fatto) => { rec.onstop = () => fatto(new Blob(dati, { type: rec.mimeType || this.tipo || 'video/webm' })); }));
    rec.start(1000);
    this.rec = rec;
  }

  async registra() {
    // bReg spento = la scelta dello schermo è già aperta (niente due finestre col doppio clic)
    if (this.fase !== 'fermo' || this.bReg.disabled) return;
    if (!puoRegistrare()) { avviso('Qui non si può registrare lo schermo', 'info'); return; }
    this.bReg.disabled = true;
    motore.stop();
    let schermo: MediaStream;
    try {
      schermo = sorgenteProva ? await sorgenteProva(this.opz.sistema) : await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: this.opz.sistema,
        // Chrome: niente "questa scheda" in cima, l'audio del sistema se c'è
        ...({ selfBrowserSurface: 'exclude', systemAudio: 'include', surfaceSwitching: 'include' } as object),
      } as DisplayMediaStreamOptions);
    } catch {
      this.stato.textContent = 'Registrazione annullata';
      this.bReg.disabled = false;
      return;
    }
    this.flussi = [schermo];
    const tracce: MediaStreamTrack[] = [...schermo.getVideoTracks()];
    // l'audio: il microfono e quello del computer, mescolati in una traccia sola
    const audio: MediaStream[] = [];
    if (schermo.getAudioTracks().length) audio.push(new MediaStream(schermo.getAudioTracks()));
    if (this.opz.mic) {
      try {
        const mic = microfonoProva ? await microfonoProva() : await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        this.flussi.push(mic);
        audio.push(mic);
      } catch { avviso('Il microfono non si apre: registro senza', 'info', 2400); }
    }
    if (audio.length === 1) tracce.push(...audio[0].getAudioTracks());
    else if (audio.length > 1) {
      const ctx = new AudioContext();
      this.audioCtx = ctx;
      const dest = ctx.createMediaStreamDestination();
      for (const a of audio) ctx.createMediaStreamSource(a).connect(dest);
      tracce.push(...dest.stream.getAudioTracks());
    }
    this.flusso = new MediaStream(tracce);
    this.tipo = formato();
    this.pezzi = [];
    try {
      this.nuovoPezzo();
    } catch (e) {
      this.chiudiFlussi();
      this.bReg.disabled = false;
      avviso('Non riesco a registrare: ' + String(e), 'errore', 4000);
      return;
    }
    this.fase = 'registra';
    this.fatto = 0;
    this.da = performance.now();
    this.video.srcObject = schermo;
    void this.video.play().catch(() => {});
    // se si ferma la condivisione dalla barra del sistema, è come premere FERMA
    schermo.getVideoTracks()[0]?.addEventListener('ended', () => this.ferma());
    this.el.classList.add('in-onda');
    this.bReg.disabled = true;
    this.bPausa.disabled = false;
    this.bFerma.disabled = false;
    this.stato.textContent = '● Sto registrando';
    this.giro = window.setInterval(() => this.aggiornaTempo(), 250);
    avviso('● Registro: PAUSA quando vuoi, FERMA e finisce nel contenitore', 'ok', 2200);
  }

  pausa() {
    if (this.fase === 'registra') {
      // la pausa chiude il pezzo: nel file finale la pausa non c'è proprio
      this.rec?.stop();
      this.rec = null;
      this.fase = 'pausa';
      this.fatto += performance.now() - this.da;
      this.bPausa.textContent = '▶ RIPRENDI';
      this.stato.textContent = '❚❚ In pausa';
      this.el.classList.add('in-pausa');
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
      this.bPausa.textContent = '❚❚ PAUSA';
      this.stato.textContent = '● Sto registrando';
      this.el.classList.remove('in-pausa');
    }
    this.aggiornaTempo();
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

  ferma() {
    if (this.fase === 'fermo') return;
    if (this.fase === 'registra') this.fatto += performance.now() - this.da;
    this.rec?.stop();
    this.rec = null;
    this.fase = 'fermo';
    clearInterval(this.giro);
    this.aggiornaTempo();
    this.el.classList.remove('in-onda', 'in-pausa');
    this.bReg.disabled = !puoRegistrare();
    this.bPausa.disabled = true;
    this.bPausa.textContent = '❚❚ PAUSA';
    this.bFerma.disabled = true;
    this.stato.textContent = 'Metto in ordine la registrazione…';
    const durata = this.durataUltima = this.fatto;
    const pezzi = this.pezzi, flussi = this.flussi, ctx = this.audioCtx;
    this.pezzi = [];
    this.flussi = [];
    this.audioCtx = null;
    this.flusso = null;
    this.ultima = (async () => {
      // i flussi si spengono solo quando l'ultimo pezzo ha dato tutto
      const blobs = (await Promise.all(pezzi)).filter((b) => b.size);
      this.chiudiFlussi(flussi, ctx);
      if (this.fase === 'fermo') this.video.srcObject = null;
      await this.consegna(blobs, durata);
    })().catch((e) => {
      this.stato.textContent = 'Non sono riuscito a mettere via la registrazione';
      avviso('La registrazione non si salva: ' + String(e), 'errore', 4000);
    });
  }

  /** la registrazione finita: cucita, sul disco (nell'app), nel contenitore e in fondo alla timeline */
  private async consegna(blobs: Blob[], durata: number) {
    if (!blobs.length) { this.stato.textContent = 'La registrazione è vuota'; return; }
    const mp4 = /mp4/.test(blobs[0].type);
    // di solito un file solo; se la cucitura non riesce, i pezzi vanno uno dopo l'altro (sempre senza buchi)
    const cucito = await cuci(blobs, mp4);
    const files = cucito ? [cucito] : await Promise.all(blobs.map((b) => rimetteInOrdine(b, mp4)));
    const ora = new Date();
    const radice = `Registrazione ${ora.getFullYear()}-${due(ora.getMonth() + 1)}-${due(ora.getDate())} ${due(ora.getHours())}.${due(ora.getMinutes())}.${due(ora.getSeconds())}`;
    const ids: string[] = [];
    let primo: { id: string; nome: string } | null = null;
    for (const [i, blob] of files.entries()) {
      const nome = `${radice}${files.length > 1 ? ` parte ${i + 1}` : ''}.${mp4 ? 'mp4' : 'webm'}`;
      const path = await salvaSulDisco(nome, blob);
      const file = new File([blob], nome, { type: blob.type });
      const [m] = await importaFile([{ name: nome, path, file: path ? undefined : file }], { chiediFormato: store.doc.clips.length === 0 });
      if (!m) continue;
      primo ??= { id: m.id, nome };
      if (this.opz.timeline) {
        const p = store.doc;
        const v = p.tracks.filter((t) => t.kind === 'video' && !t.lock).pop()?.id ?? null;
        const a = p.tracks.find((t) => t.kind === 'audio' && !t.lock)?.id;
        const inizio = projectEnd(p);
        ids.push(...store.edit('Registrazione in timeline', (pp) => M.placeSource(pp, { mediaId: m.id, srcIn: m.t0 || 0, srcOut: m.duration }, inizio, null, { video: v, audio: a ? [a] : [] }, 'libero')));
      }
    }
    if (!primo) { this.stato.textContent = 'Non sono riuscito a leggere la registrazione'; return; }
    if (ids.length) store.select(ids);
    const { id, nome } = primo;
    this.stato.textContent = `Fatto: ${nome}`;
    const riga = h('button', { class: 'live-voce', title: 'Aprila nel monitor', on: { click: () => { motore.caricaPlayer(id); motore.setMonitor('player'); document.dispatchEvent(new CustomEvent('dpv:pagina', { detail: 'montaggio' })); } } },
      icona('video', 14), h('span', null, nome), h('small', null, orologio(durata)));
    if (this.lista.querySelector('.nota')) this.lista.replaceChildren();
    this.lista.prepend(riga);
    avviso(`🎬 ${nome}: nel contenitore${this.opz.timeline ? ' e in fondo alla timeline' : ''}`, 'ok', 3200);
  }
}
