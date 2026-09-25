// La pagina Finale: la schermata dove si guarda il montaggio intero, si fanno i ritocchi che valgono per
// tutto (colore automatico, look, luce e colore, audio finale) e si esporta. Il monitor è lo stesso del
// montaggio (con il "prima | dopo"), la timeline resta sotto per spostarsi al volo.
import { store } from '../core/store';
import type { LookFinale, Master, Project } from '../core/tipi';
import { MASTER0, end, isVideoClip, masterDi, projectEnd, trackOf } from '../core/progetto';
import { durataUmana, f2s, fps, frameToTc } from '../core/timecode';
import { LOOKS } from '../render/colore';
import { mediaRT } from '../media/libreria';
import { motore } from '../motore';
import { volumeLivellato } from '../effetti';
import { finestraEsporta, esportaEdl, esportaFotogramma } from './dialoghi';
import { avviso, clamp, h, icona } from './dom';

type Campo = { aggiorna: () => void };

/** i buchi neri: dove nessuna traccia video mostra qualcosa, fra l'inizio e la fine del montaggio */
function buchi(p: Project): [number, number][] {
  const fine = projectEnd(p);
  const iv = p.clips
    .filter((c) => isVideoClip(c) && c.kind !== 'title' && !trackOf(p, c.track).mute)
    .map((c) => [c.start, end(c)] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  let x = 0;
  for (const [a, b] of iv) {
    if (a > x) out.push([x, a]);
    x = Math.max(x, b);
  }
  if (iv.length && x < fine) out.push([x, fine]);
  return out.filter(([a, b]) => b - a >= 1);
}

export class Finale {
  el: HTMLElement;
  private corpo: HTMLElement;
  private riepilogo: HTMLElement;
  private campi: Campo[] = [];
  private formato = 'mp4';
  private qualita = 'alta';
  private misura = '1';

  constructor() {
    this.riepilogo = h('div', { class: 'fin-riepilogo' });
    this.corpo = h('div', { class: 'fin-corpo' });
    this.el = h('section', { class: 'pannello finale' },
      h('header', { class: 'fin-testa' }, icona('finale', 18), h('b', null, 'FINALE'), h('span', null, 'ritocchi su tutto il montaggio, poi esporta')),
      this.corpo);
    this.costruisci();
    store.on('doc', () => { this.aggiornaRiepilogo(); for (const c of this.campi) c.aggiorna(); });
  }

  private m(): Master { return masterDi(store.doc); }

  /** modifica annullabile dei ritocchi finali */
  private cambia(label: string, fn: (m: Master) => void) {
    store.edit(label, (p) => { p.master = { ...MASTER0, ...(p.master ?? {}) }; fn(p.master); });
  }

  private costruisci() {
    this.campi = [];
    const sez = (titolo: string, ic: string, ...figli: (HTMLElement | null)[]) => h('div', { class: 'fin-sezione' }, h('h4', null, icona(ic, 14), titolo), ...figli.filter(Boolean) as HTMLElement[]);

    // colore automatico: un interruttore grande e la forza
    const auto = h('button', { class: 'fin-interruttore', on: { click: () => this.cambia(this.m().auto ? 'Colore automatico spento' : 'Colore automatico acceso', (m) => { m.auto = !m.auto; }) } },
      h('span', { class: 'led' }), h('span', { class: 'fin-int-testo' }, 'Colore automatico su tutte le riprese'));
    this.campi.push({ aggiorna: () => { auto.classList.toggle('acceso', this.m().auto); auto.querySelector('.led')!.classList.toggle('acceso', this.m().auto); } });

    // i look: carte con i tre colori
    const looks = h('div', { class: 'fin-looks' }, LOOKS.map((l) => {
      const b = h('button', { class: 'fin-look', title: l.info, on: { click: () => this.cambia(`Look ${l.nome}`, (m) => { m.look = l.id as LookFinale; if (!m.intensita) m.intensita = 1; }) } },
        h('span', { class: 'fin-look-col', style: `background: linear-gradient(90deg, ${l.colori[0]} 0 33%, ${l.colori[1]} 0 66%, ${l.colori[2]} 0)` }),
        h('b', null, l.nome), h('small', null, l.info));
      this.campi.push({ aggiorna: () => b.classList.toggle('acceso', this.m().look === l.id) });
      return b;
    }));

    const esporta = h('div', { class: 'fin-esporta' },
      this.scelte('Formato', [['mp4', 'MP4'], ['mov', 'MOV'], ['webm', 'WebM'], ['wav', 'Solo audio']], () => this.formato, (v) => { this.formato = v; }),
      this.scelte('Qualità', [['media', 'Leggera'], ['alta', 'Alta'], ['altissima', 'Master']], () => this.qualita, (v) => { this.qualita = v; }),
      this.scelte('Misura', [['1', 'Come il progetto'], ['0.5', 'Metà']], () => this.misura, (v) => { this.misura = v; }),
      h('button', { class: 'btn primario fin-vai', on: { click: () => finestraEsporta({ formato: this.formato, qualita: this.qualita, misura: this.misura }) } }, icona('esporta', 18), 'ESPORTA IL MASTER'),
      h('div', { class: 'fin-altri' },
        h('button', { class: 'btn piccolo', title: 'La lista di montaggio per Resolve, Avid, Premiere, EDIUS', on: { click: () => esportaEdl() } }, 'EDL CMX3600'),
        h('button', { class: 'btn piccolo', title: 'Il fotogramma sotto il cursore, con il colore finale', on: { click: () => esportaFotogramma() } }, 'Fotogramma PNG')));

    this.corpo.replaceChildren(
      sez('Riepilogo', 'info', this.riepilogo),
      sez('Colore automatico', 'effetti', auto,
        this.cursore('Forza', 0, 100, (m) => Math.round(m.autoK * 100), (m, v) => { m.autoK = v / 100; }, '%'),
        h('p', { class: 'nota' }, 'Ogni ripresa viene misurata: nero, bianco e luce si sistemano da soli, così le clip si somigliano. Una clip può fare eccezione dal suo tasto "fx".')),
      sez('Look di tutto il montaggio', 'immagine', looks,
        this.cursore('Intensità', 0, 100, (m) => Math.round(m.intensita * 100), (m, v) => { m.intensita = v / 100; }, '%')),
      sez('Ritocchi', 'ingranaggio',
        this.cursore('Luce', -100, 100, (m) => Math.round(m.bright * 100), (m, v) => { m.bright = v / 100; }, ''),
        this.cursore('Contrasto', 50, 150, (m) => Math.round(m.contrast * 100), (m, v) => { m.contrast = v / 100; }, '%'),
        this.cursore('Saturazione', 0, 200, (m) => Math.round(m.sat * 100), (m, v) => { m.sat = v / 100; }, '%'),
        this.cursore('Temperatura', -100, 100, (m) => Math.round(m.temp * 100), (m, v) => { m.temp = v / 100; }, ''),
        this.cursore('Tinta', -100, 100, (m) => Math.round(m.tint * 100), (m, v) => { m.tint = v / 100; }, ''),
        this.cursore('Vignetta', 0, 100, (m) => Math.round(m.vignette * 100), (m, v) => { m.vignette = v / 100; }, ''),
        this.cursore('Grana', 0, 100, (m) => Math.round(m.grain * 100), (m, v) => { m.grain = v / 100; }, ''),
        h('div', { class: 'isp-pulsanti' },
          h('button', { class: 'btn-mini', on: { click: () => this.cambia('Azzera ritocchi', (m) => { Object.assign(m, { look: 'nessuno', intensita: 1, bright: 0, contrast: 1, sat: 1, temp: 0, tint: 0, vignette: 0, grain: 0 }); }) } }, 'Azzera look e ritocchi'),
          h('button', { class: 'btn-mini prima-dopo-fin', on: { click: () => (document.querySelector('.monitor .prima-dopo') as HTMLElement | null)?.click() } }, 'Prima | dopo'))),
      sez('Audio finale', 'altoparlante',
        this.cursore('Volume finale', -24, 12, (m) => m.volume, (m, v) => { m.volume = v; }, 'dB', 0.5),
        this.spunta('Limitatore (niente distorsione)', (m) => m.limiter, (m, v) => { m.limiter = v; }),
        h('div', { class: 'isp-pulsanti' },
          h('button', { class: 'btn-mini', title: 'Porta ogni clip audio a un livello simile (si annulla con Ctrl+Z)', on: { click: () => this.livellaTutto() } }, 'Livella il volume di tutte le clip'))),
      sez('Esporta', 'esporta', esporta),
    );
    this.aggiornaRiepilogo();
    for (const c of this.campi) c.aggiorna();
  }

  /** porta tutte le clip audio a un livello comodo (come l'effetto "Livella" clip per clip) */
  private livellaTutto() {
    const p = store.doc;
    const quali = p.clips.filter((c) => c.kind === 'media' && trackOf(p, c.track).kind === 'audio');
    let n = 0, attesa = 0;
    store.edit('Livella il volume', (pp) => {
      for (const c of pp.clips) {
        if (!quali.some((q) => q.id === c.id)) continue;
        const g = volumeLivellato(pp, c);
        if (g === null) { attesa++; continue; }
        c.afx = { ...c.afx, norm: c.afx?.norm ?? c.gain };
        c.gain = g;
        c.gainKeys = [];
        n++;
      }
    });
    avviso(n ? `🔊 ${n} clip livellate${attesa ? ` (${attesa} ancora da leggere)` : ''}` : 'Nessuna clip audio da livellare', n ? 'ok' : 'info', 2400);
  }

  private aggiornaRiepilogo() {
    const p = store.doc;
    const fine = projectEnd(p);
    const r = fps(p.rate);
    const video = p.clips.filter((c) => c.kind === 'media' && isVideoClip(c)).length;
    const audio = p.clips.filter((c) => !isVideoClip(c)).length;
    const titoli = p.clips.filter((c) => c.kind === 'title').length;
    const tr = p.clips.filter((c) => c.trIn || c.trOut).length;
    const offline = p.media.filter((m) => mediaRT(m.id)?.stato !== 'ok').length;
    const vuoti = buchi(p);
    const avvisi: HTMLElement[] = [];
    if (!fine) avvisi.push(h('li', { class: 'fin-info' }, 'La timeline è vuota: prima monta qualcosa.'));
    if (offline) avvisi.push(h('li', { class: 'fin-male' }, `${offline} file da ricollegare (File → Ricollega media)`));
    for (const [a, b] of vuoti.slice(0, 4)) {
      avvisi.push(h('li', { class: 'fin-attento' }, h('button', { class: 'link', on: { click: () => { motore.setMonitor('recorder'); motore.vaiA(a); } } }, `Nero di ${((b - a) / r).toFixed(1).replace('.', ',')} s a ${frameToTc(a, p.rate, p.drop)}`)));
    }
    if (vuoti.length > 4) avvisi.push(h('li', { class: 'fin-attento' }, `…e altri ${vuoti.length - 4} buchi neri`));
    if (fine && !avvisi.length) avvisi.push(h('li', { class: 'fin-bene' }, '✓ Tutto a posto: niente buchi neri, tutti i file ci sono.'));
    this.riepilogo.replaceChildren(
      h('div', { class: 'fin-numeri' },
        h('div', null, h('b', null, fine ? durataUmana(f2s(fine, p.rate)) : '—'), h('small', null, 'durata')),
        h('div', null, h('b', null, String(video)), h('small', null, 'video')),
        h('div', null, h('b', null, String(audio)), h('small', null, 'audio')),
        h('div', null, h('b', null, String(titoli)), h('small', null, 'titoli')),
        h('div', null, h('b', null, String(tr)), h('small', null, 'transizioni'))),
      h('div', { class: 'fin-formato' }, `${p.w}×${p.h} · ${(p.rate.num / p.rate.den).toFixed(p.rate.den === 1 ? 0 : 2)} fps${p.drop ? ' DF' : ''} · ${p.sampleRate / 1000} kHz`),
      h('ul', { class: 'fin-avvisi' }, avvisi));
  }

  // ——— mattoncini ———
  private cursore(nome: string, min: number, max: number, get: (m: Master) => number, put: (m: Master, v: number) => void, unita: string, step = 1): HTMLElement {
    const r = h('input', { type: 'range', min, max, step }) as HTMLInputElement;
    const n = h('span', { class: 'fin-val' });
    const agg = () => { const v = get(this.m()); r.value = String(v); n.textContent = `${v > 0 && min < 0 ? '+' : ''}${v}${unita ? ' ' + unita : ''}`; };
    agg();
    let vivo = false;
    r.addEventListener('input', () => {
      if (!vivo) { store.begin(nome); vivo = true; }
      const p = store.doc;
      p.master = { ...MASTER0, ...(p.master ?? {}) };
      put(p.master, clamp(Number(r.value), min, max));
      store.liveChange();
      agg();
    });
    r.addEventListener('change', () => { if (vivo) store.commit(true); vivo = false; });
    r.addEventListener('dblclick', () => {
      const def = get(MASTER0);
      this.cambia(nome, (m) => put(m, def));
    });
    this.campi.push({ aggiorna: agg });
    return h('label', { class: 'fin-riga' }, h('span', null, nome), r, n);
  }

  private spunta(nome: string, get: (m: Master) => boolean, put: (m: Master, v: boolean) => void): HTMLElement {
    const i = h('input', { type: 'checkbox' }) as HTMLInputElement;
    const agg = () => { i.checked = get(this.m()); };
    agg();
    i.addEventListener('change', () => this.cambia(nome, (m) => put(m, i.checked)));
    this.campi.push({ aggiorna: agg });
    return h('label', { class: 'isp-riga spunta' }, i, h('span', null, nome));
  }

  private scelte(nome: string, opzioni: [string, string][], get: () => string, put: (v: string) => void): HTMLElement {
    const bottoni = opzioni.map(([v, t]) => h('button', { class: 'chip' + (get() === v ? ' acceso' : ''), 'data-v': v, on: { click: () => { put(v); bottoni.forEach((b) => b.classList.toggle('acceso', b.dataset.v === v)); } } }, t));
    return h('div', { class: 'fin-scelte' }, h('span', null, nome), h('div', { class: 'isp-chips' }, bottoni));
  }
}
