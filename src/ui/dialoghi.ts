// Le finestre: esporta, impostazioni del progetto, tasti, informazioni.
import { store } from '../core/store';
import { FORMATI } from '../core/tipi';
import { projectEnd } from '../core/progetto';
import { frameToTc, durataUmana, f2s } from '../core/timecode';
import { azioni } from '../azioni';
import { esporta, fotogrammaPng, scegliCodec, type Formato, type Qualita } from '../export/esporta';
import { creaEdl } from '../export/edl';
import { dialogoSalva, edizione, invoke, isTauri, salvaTesto, scarica, apriLink } from '../platform';
import { avviso, dialogo, h } from './dom';
import { motore } from '../motore';

declare const __VERSIONE__: string;
export const VERSIONE = __VERSIONE__;

export function finestraEsporta() {
  const p = store.doc;
  motore.stop();
  const fine = projectEnd(p);
  if (!fine) { avviso('La timeline è vuota: prima monta qualcosa', 'info'); return; }
  const d = dialogo('Esporta il master', { largo: true });
  const nome = h('input', { class: 'campo-testo', value: p.name.replace(/[\\/:*?"<>|]/g, '_') }) as HTMLInputElement;
  const formato = h('select', { class: 'mini-select' },
    h('option', { value: 'mp4' }, 'MP4 · H.264 + AAC (va ovunque)'),
    h('option', { value: 'mov' }, 'MOV · QuickTime'),
    h('option', { value: 'webm' }, 'WebM · VP9 + Opus (web)'),
    h('option', { value: 'wav' }, 'WAV · solo audio 48 kHz')) as HTMLSelectElement;
  const misura = h('select', { class: 'mini-select' },
    h('option', { value: '1' }, `Come il progetto · ${p.w}×${p.h}`),
    h('option', { value: '0.5' }, `Metà · ${Math.round(p.w / 2)}×${Math.round(p.h / 2)}`),
    p.h > 720 ? h('option', { value: String(720 / p.h) }, `720p · ${Math.round(p.w * 720 / p.h)}×720`) : null,
    p.h < 2160 ? h('option', { value: String(2160 / p.h) }, `4K · ${Math.round(p.w * 2160 / p.h)}×2160`) : null) as HTMLSelectElement;
  const qualita = h('select', { class: 'mini-select' },
    h('option', { value: 'media' }, 'Media (file leggero)'),
    h('option', { value: 'alta', selected: true }, 'Alta (consigliata)'),
    h('option', { value: 'altissima' }, 'Altissima (master)'),
    h('option', { value: 'bassa' }, 'Bassa (anteprima)')) as HTMLSelectElement;
  const haInOut = p.inF !== null && p.outF !== null;
  const soloInOut = h('input', { type: 'checkbox', checked: haInOut, disabled: !haInOut }) as HTMLInputElement;
  const codec = h('span', { class: 'nota' }, 'controllo i codec…');
  const aggCodec = async () => {
    const k = Number(misura.value);
    const c = await scegliCodec(formato.value as Formato, Math.round(p.w * k / 2) * 2, Math.round(p.h * k / 2) * 2);
    codec.textContent = formato.value === 'wav' ? 'Audio PCM 16 bit' : c.v ? `Video ${c.v.toUpperCase()} · audio ${c.a ? c.a.toUpperCase() : 'nessuno'}` : '⚠ questo sistema non codifica questo formato';
  };
  formato.addEventListener('change', aggCodec);
  misura.addEventListener('change', aggCodec);
  void aggCodec();
  const barra = h('div', { class: 'barra-avanz' }, h('i'));
  const stato = h('div', { class: 'export-stato' }, `Durata ${frameToTc(haInOut ? p.outF! - p.inF! : fine, p.rate, p.drop)} · ${durataUmana(f2s(haInOut ? p.outF! - p.inF! : fine, p.rate))}`);
  d.corpo.append(
    h('div', { class: 'form' },
      h('label', null, 'Nome del file'), nome,
      h('label', null, 'Formato'), formato,
      h('label', null, 'Dimensione'), misura,
      h('label', null, 'Qualità'), qualita,
      h('label', null, 'Solo attacco–stacco'), h('span', null, soloInOut, haInOut ? ` ${frameToTc(p.inF!, p.rate, p.drop)} → ${frameToTc(p.outF!, p.rate, p.drop)}` : ' (segna I e O sulla timeline)'),
      h('label', null, 'Codec'), codec),
    stato, barra);
  let annulla = false;
  let lavorando = false;
  const vai = h('button', { class: 'btn primario' }, 'Esporta') as HTMLButtonElement;
  const chiudi = h('button', { class: 'btn', on: { click: () => { if (lavorando) annulla = true; else d.chiudi(); } } }, 'Annulla');
  vai.addEventListener('click', async () => {
    const k = Number(misura.value);
    lavorando = true;
    vai.disabled = true;
    d.el.classList.add('lavora');
    const f = formato.value as Formato;
    try {
      const file = await esporta(p, {
        formato: f, w: Math.round(p.w * k), h: Math.round(p.h * k), qualita: qualita.value as Qualita, soloInOut: soloInOut.checked,
        nome: (nome.value || 'montaggio') + '.' + f,
      }, (a) => {
        (barra.firstChild as HTMLElement).style.width = (a.fatti / a.totale) * 100 + '%';
        stato.textContent = a.fase === 'video'
          ? `Video: ${frameToTc(Math.round(a.fatti), p.rate, p.drop)} di ${frameToTc(a.totale, p.rate, p.drop)} · ${a.fpsResa.toFixed(0)} fps${a.fpsResa > 0 ? ' · mancano ' + durataUmana((a.totale - a.fatti) / a.fpsResa) : ''}`
          : a.fase === 'audio' ? 'Audio…' : 'Chiudo il file…';
      }, () => annulla);
      lavorando = false;
      if (file) {
        avviso(`🎬 Esportato: ${file.split(/[\\/]/).pop()}`, 'ok', 5000);
        stato.textContent = `Fatto! ${file}`;
        (barra.firstChild as HTMLElement).style.width = '100%';
        vai.textContent = 'Fatto';
        chiudi.textContent = 'Chiudi';
        vai.onclick = () => d.chiudi();
        vai.disabled = false;
      } else { d.chiudi(); avviso('Export annullato', 'info'); }
    } catch (e) {
      lavorando = false;
      vai.disabled = false;
      d.el.classList.remove('lavora');
      stato.textContent = '⚠ ' + (e instanceof Error ? e.message : String(e));
      avviso('Export non riuscito', 'errore');
    }
  });
  d.piede.append(
    h('button', { class: 'btn', title: 'La lista di montaggio per Resolve, Avid, Premiere, EDIUS', on: { click: () => esportaEdl() } }, 'EDL CMX3600'),
    h('button', { class: 'btn', title: 'Il fotogramma sotto il cursore, a piena risoluzione', on: { click: () => esportaFotogramma() } }, 'Fotogramma PNG'),
    h('span', { class: 'spazio' }), chiudi, vai);
}

export async function esportaEdl() {
  const p = store.doc;
  const r = await salvaTesto(p.name.replace(/[\\/:*?"<>|]/g, '_') + '.edl', creaEdl(p), 'edl');
  if (r) avviso('📋 EDL salvata', 'ok');
}

export async function esportaFotogramma() {
  const p = store.doc;
  const f = Math.round(store.head);
  const blob = await fotogrammaPng(p, f);
  const nome = `${p.name.replace(/[\\/:*?"<>|]/g, '_')}_${frameToTc(f, p.rate, p.drop).replace(/[:;]/g, '-')}.png`;
  if (isTauri) {
    const path = await dialogoSalva(nome, 'png', 'image/png');
    if (!path) return;
    const id = await invoke<number>('export_apri', { path });
    await invoke('export_scrivi', new Uint8Array(await blob.arrayBuffer()), { headers: { 'x-id': String(id), 'x-pos': '0' } });
    await invoke('export_chiudi', { id });
  } else scarica(blob, nome);
  avviso('🖼 Fotogramma salvato', 'ok');
}

export function finestraProgetto() {
  const p = store.doc;
  const d = dialogo('Impostazioni del progetto');
  const nome = h('input', { class: 'campo-testo', value: p.name }) as HTMLInputElement;
  const attuale = FORMATI.find((f) => f.w === p.w && f.h === p.h && f.rate.num === p.rate.num && f.rate.den === p.rate.den);
  const fmt = h('select', { class: 'mini-select' },
    FORMATI.map((f) => h('option', { value: f.id, selected: f === attuale }, f.nome)),
    attuale ? null : h('option', { value: 'attuale', selected: true }, `Attuale · ${p.w}×${p.h} ${(p.rate.num / p.rate.den).toFixed(2)}`)) as HTMLSelectElement;
  const pre = h('input', { type: 'number', class: 'num', min: 0, max: 10, step: 0.5, value: String(p.preroll) }) as HTMLInputElement;
  d.corpo.append(h('div', { class: 'form' },
    h('label', null, 'Nome'), nome,
    h('label', null, 'Formato'), fmt,
    h('label', null, 'Preroll (s)'), pre),
  h('p', { class: 'nota' }, 'Cambiare il formato non tocca le clip: il timecode si ricalcola alla nuova cadenza. Il preroll è quanto il REVIEW parte prima del taglio.'));
  d.piede.append(h('button', { class: 'btn', on: { click: d.chiudi } }, 'Annulla'), h('button', {
    class: 'btn primario', on: {
      click: () => {
        const f = FORMATI.find((x) => x.id === fmt.value);
        store.edit('Impostazioni progetto', (pp) => {
          pp.name = nome.value || pp.name;
          pp.preroll = Number(pre.value) || 0;
          if (f) {
            // le posizioni restano nello stesso istante: si convertono i fotogrammi
            const k = (f.rate.num / f.rate.den) / (pp.rate.num / pp.rate.den);
            if (Math.abs(k - 1) > 1e-6) {
              for (const c of pp.clips) { const e = Math.round((c.start + c.len) * k); c.start = Math.round(c.start * k); c.len = Math.max(1, e - c.start); c.fadeIn = Math.round(c.fadeIn * k); c.fadeOut = Math.round(c.fadeOut * k); if (c.trIn) c.trIn.len = Math.max(1, Math.round(c.trIn.len * k)); c.opKeys.forEach((x) => { x.f = Math.round(x.f * k); }); c.gainKeys.forEach((x) => { x.f = Math.round(x.f * k); }); }
              for (const m of pp.markers) m.f = Math.round(m.f * k);
              if (pp.inF !== null) pp.inF = Math.round(pp.inF * k);
              if (pp.outF !== null) pp.outF = Math.round(pp.outF * k);
            }
            pp.w = f.w; pp.h = f.h; pp.rate = { ...f.rate }; pp.drop = f.drop;
          }
        });
        d.chiudi();
      },
    },
  }, 'Applica'));
}

export function finestraTasti() {
  const d = dialogo('Tasti della centralina', { largo: true });
  const gruppi = new Map<string, HTMLElement[]>();
  for (const a of azioni.values()) {
    if (!a.tasti?.length) continue;
    if (!gruppi.has(a.gruppo)) gruppi.set(a.gruppo, []);
    gruppi.get(a.gruppo)!.push(h('div', { class: 'tasto-riga' }, h('span', { class: 'tasti' }, a.tasti.map((t) => h('kbd', null, t.replace('ArrowLeft', '←').replace('ArrowRight', '→').replace('ArrowUp', '↑').replace('ArrowDown', '↓').replace('Space', 'Spazio')))), h('span', null, a.nome, a.info ? h('small', null, a.info) : null)));
  }
  d.corpo.append(h('p', { class: 'nota' }, 'I numeri in alto (1-8) sono i tasti di montaggio. Il tastierino numerico scrive il timecode sul monitor attivo, come in EDIUS. Tab passa fra Player e Recorder.'),
    h('div', { class: 'tasti-griglia' }, [...gruppi].map(([g, righe]) => h('section', null, h('h4', null, g), righe))));
  d.piede.append(h('button', { class: 'btn primario', on: { click: d.chiudi } }, 'OK'));
}

export function finestraInfo() {
  const d = dialogo('DaProd Video');
  d.corpo.append(
    h('div', { class: 'info-logo' }, h('span', { class: 'marchio-grande' }, 'Da', h('b', null, 'Prod'), ' Video')),
    h('p', null, `Versione ${VERSIONE} · ${edizione}`),
    h('p', null, 'Il montaggio vecchio stile, moderno dentro: due monitor, la centralina, i VU a lancetta, le tendine SMPTE e la EDL. Sotto il cofano WebCodecs, WebGL2, Web Audio e Mediabunny; l\'app è Tauri 2 (Rust).'),
    h('p', { class: 'nota' }, 'Open source, licenza MIT. Font DSEG (OFL), Orbitron e Rajdhani (OFL). Mediabunny (MPL-2.0).'));
  d.piede.append(
    h('button', { class: 'btn', on: { click: () => apriLink('https://github.com/cammo22/DaProdVideo') } }, 'Codice su GitHub'),
    h('button', { class: 'btn', on: { click: () => apriLink('https://github.com/cammo22/DaProdVideo/releases/latest') } }, 'Ultima versione'),
    h('button', { class: 'btn primario', on: { click: d.chiudi } }, 'OK'));
}
