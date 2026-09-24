// Il banco di montaggio: mette insieme menu, contenitore, monitor, pulsantiera, timeline e strumenti.
import { store } from '../core/store';
import { motore } from '../motore';
import { azioni, esegui, modi } from '../azioni';
import { Timeline } from './timeline';
import { PannelloMonitor } from './monitor';
import { Contenitore } from './contenitore';
import { Pulsantiera } from './pulsantiera';
import { Ispettore } from './ispettore';
import { Mixer, VuMetri } from './mixer';
import { Scopi } from './scopi';
import { costruisciMenu, h, icona, avviso, chiudiMenu, type VoceMenu } from './dom';
import { installaTastiera } from './tastiera';
import { finestraEsporta, finestraInfo, finestraProgetto, finestraTasti, esportaEdl, esportaFotogramma, VERSIONE } from './dialoghi';
import { apri, autosalva, importaDaDrop, importaDialogo, importaFile, nuovo, ricollega, riprendi, salva } from '../progetti';
import { edizione, isAndroid, isTauri, apriLink, schermoIntero } from '../platform';
import { montaggioDimostrativo } from '../demo';
import { FORMATI } from '../core/tipi';
import { statoDecoder } from '../media/fotogrammi';
import { banco } from '../media/audio';

export function avvia(radice: HTMLElement) {
  const tl = new Timeline();
  const player = new PannelloMonitor('player');
  const recorder = new PannelloMonitor('recorder');
  const bin = new Contenitore();
  const puls = new Pulsantiera(tl);
  const isp = new Ispettore();
  const vu = new VuMetri();
  const mixer = new Mixer();
  const scopi = new Scopi();

  // ——— pannello laterale a schede ———
  type Lato = 'clip' | 'mixer' | 'scopi';
  const lato: Record<Lato, HTMLElement> = { clip: isp.el, mixer: mixer.el, scopi: scopi.el };
  const latoCorpo = h('div', { class: 'lato-corpo' }, isp.el);
  const mostraLato = (s: Lato) => {
    latoCorpo.replaceChildren(lato[s]);
    scopi.attiva(s === 'scopi');
    radice.querySelectorAll('.lato .scheda').forEach((b) => b.classList.toggle('attiva', (b as HTMLElement).dataset.s === s));
  };
  const tab = (s: Lato, n: string) => h('button', { class: 'scheda' + (s === 'clip' ? ' attiva' : ''), 'data-s': s, on: { click: () => mostraLato(s) } }, n);
  const pannelloLato = h('section', { class: 'pannello lato' },
    h('div', { class: 'vu-cornice' }, vu.el),
    h('header', { class: 'schede' }, tab('clip', 'Proprietà'), tab('mixer', 'Mixer'), tab('scopi', 'Strumenti')),
    latoCorpo);
  document.addEventListener('dpv:ispettore', () => { mostraLato('clip'); apriFoglio('lato'); });

  // ——— menu ———
  const voce = (id: string, extra: Partial<VoceMenu> = {}): VoceMenu => {
    const a = azioni.get(id)!;
    return { nome: a.nome, tasto: a.tasti?.[0]?.replace('ArrowLeft', '←').replace('ArrowRight', '→').replace('ArrowUp', '↑').replace('ArrowDown', '↓').replace('Space', 'Spazio'), fn: a.fn, ...extra };
  };
  const menus: [string, () => VoceMenu[]][] = [
    ['File', () => [
      { nome: 'Nuovo progetto', tasto: 'Ctrl+N', sotto: FORMATI.map((f) => ({ nome: f.nome, fn: () => nuovo(f) })) },
      { nome: 'Apri progetto…', tasto: 'Ctrl+O', fn: () => apri() },
      { nome: 'Salva', tasto: 'Ctrl+S', fn: () => salva() },
      { nome: 'Salva come…', tasto: 'Ctrl+Shift+S', fn: () => salva(true) },
      { sep: true },
      { nome: 'Importa video, audio, immagini…', tasto: 'Ctrl+I', fn: () => importaDialogo() },
      { nome: 'Ricollega media mancanti…', fn: () => ricollega() },
      { nome: 'Montaggio dimostrativo', fn: () => montaggioDimostrativo() },
      { sep: true },
      { nome: 'Esporta il master…', tasto: 'Ctrl+M', fn: () => finestraEsporta() },
      { nome: 'Esporta EDL CMX3600…', fn: () => esportaEdl() },
      { nome: 'Esporta fotogramma PNG', fn: () => esportaFotogramma() },
      { sep: true },
      { nome: 'Impostazioni del progetto…', fn: () => finestraProgetto() },
    ]],
    ['Modifica', () => [
      voce('annulla', { nome: 'Annulla' + (store.canUndo() ? ': ' + store.undoLabel() : ''), disattiva: !store.canUndo() }),
      voce('ripeti', { nome: 'Ripeti' + (store.canRedo() ? ': ' + store.redoLabel() : ''), disattiva: !store.canRedo() }),
      { sep: true }, voce('tagliaAppunti'), voce('copia'), voce('incolla'), { sep: true }, voce('tutto'), voce('selezionaDopo'), voce('deseleziona'),
    ]],
    ['Montaggio', () => [
      voce('taglia'), voce('elimina'), voce('eliminaChiudi'), voce('separa'), { sep: true },
      voce('dissolvenza'), voce('tendina'), voce('passaggioNero'), voce('dissolviInOut'), { sep: true },
      voce('inserisci'), voce('sovrascrivi'), voce('solleva'), voce('estrai'), voce('rivedi'), voce('abbina'), voce('estendi'), { sep: true },
      voce('istantanea'), voce('fermoImmagine'), { sep: true },
      voce('modoInserisci', { spunta: modi.inserisci, nome: 'Modo inserisci' }), voce('ripple', { spunta: modi.ripple }), voce('snap', { spunta: modi.snap }), voce('elastico', { spunta: modi.elastico }),
      { sep: true }, voce('tracciaV'), voce('tracciaA'),
    ]],
    ['Generatori', () => [voce('genBarre'), voce('genCountdown'), voce('genNero'), voce('genColore'), voce('genTitolo')]],
    ['Vista', () => [
      { nome: 'Monitor singolo', spunta: radice.classList.contains('singolo'), fn: () => { radice.classList.toggle('singolo'); setTimeout(() => { player.adatta(); recorder.adatta(); }, 50); } },
      { nome: 'Zone di sicurezza', spunta: modi.zoneSicure, fn: () => { modi.zoneSicure = !modi.zoneSicure; recorder.disegnaSopra(); } },
      { nome: 'Tutto il montaggio nella finestra', tasto: '\\', fn: () => tl.adattaTutto() },
      { nome: 'Schermo intero', tasto: 'F11', fn: () => void schermoIntero() },
      { sep: true },
      { nome: 'Strumenti di misura', fn: () => mostraLato('scopi') },
      { nome: 'Mixer', fn: () => mostraLato('mixer') },
    ]],
    ['Aiuto', () => [
      { nome: 'Tasti della centralina', tasto: 'F1', fn: () => finestraTasti() },
      { nome: 'Novità (changelog)', fn: () => apriLink('https://github.com/cammo22/DaProdVideo/blob/main/CHANGELOG.md') },
      { nome: 'Scarica le app (Windows, Mac, Android)', fn: () => apriLink('https://github.com/cammo22/DaProdVideo/releases/latest') },
      { nome: 'Informazioni su DaProd Video', fn: () => finestraInfo() },
    ]],
  ];
  const barraMenu = h('nav', { class: 'menu' });
  let menuAperto: HTMLElement | null = null;
  const chiudiTendina = () => { menuAperto?.remove(); menuAperto = null; barraMenu.querySelectorAll('.voce-menu').forEach((b) => b.classList.remove('aperto')); };
  for (const [nome, voci] of menus) {
    const b = h('button', { class: 'voce-menu' }, nome);
    const apriTendina = () => {
      chiudiTendina();
      chiudiMenu();
      const m = costruisciMenu(voci());
      m.classList.add('tendina');
      const r = b.getBoundingClientRect();
      m.style.left = Math.min(r.left, innerWidth - 260) + 'px';
      m.style.top = r.bottom + 2 + 'px';
      m.addEventListener('click', (e) => { if (!(e.target as HTMLElement).closest('.ha-sotto')) chiudiTendina(); });
      document.body.appendChild(m);
      menuAperto = m;
      b.classList.add('aperto');
    };
    b.addEventListener('click', (e) => { e.stopPropagation(); if (b.classList.contains('aperto')) chiudiTendina(); else apriTendina(); });
    b.addEventListener('pointerenter', () => { if (menuAperto && !b.classList.contains('aperto')) apriTendina(); });
    barraMenu.appendChild(b);
  }
  document.addEventListener('pointerdown', (e) => { if (menuAperto && !menuAperto.contains(e.target as Node) && !barraMenu.contains(e.target as Node)) chiudiTendina(); });

  const nomeProgetto = h('button', { class: 'nome-progetto', title: 'Impostazioni del progetto', on: { click: () => finestraProgetto() } });
  const formato = h('span', { class: 'badge formato' });
  const aggTesta = () => {
    const p = store.doc;
    nomeProgetto.replaceChildren(...(store.dirty ? [h('span', { class: 'punto-modifica', title: 'Modifiche non salvate' })] : []), p.name);
    formato.textContent = `${p.w}×${p.h} · ${(p.rate.num / p.rate.den).toFixed(p.rate.den === 1 ? 0 : 2)}${p.drop ? ' DF' : ''}`;
  };
  store.on('doc', aggTesta);
  store.on('status', aggTesta);

  const testa = h('header', { class: 'testata' },
    h('button', { class: 'marchio', title: 'DaProd Video', on: { click: () => finestraInfo() } },
      h('span', { class: 'moneta' }, 'D'), h('span', { class: 'scritta' }, 'Da', h('b', null, 'Prod'), h('i', null, ' VIDEO'))),
    barraMenu,
    h('div', { class: 'testata-destra' },
      nomeProgetto, formato,
      h('span', { class: 'badge edizione' + (isTauri ? '' : ' prova') }, isTauri ? edizione : 'VERSIONE PROVA · WEB'),
      h('button', { class: 'btn-icona', title: 'Importa (Ctrl+I)', on: { click: () => importaDialogo() } }, icona('importa', 18)),
      h('button', { class: 'btn-icona', title: 'Salva (Ctrl+S)', on: { click: () => salva() } }, icona('salva', 18)),
      h('button', { class: 'btn primario piccolo', title: 'Esporta il master (Ctrl+M)', on: { click: () => finestraEsporta() } }, icona('esporta', 15), 'Esporta')));

  // ——— barra di stato ———
  const msg = h('span', { class: 'stato-msg' }, 'Pronto. 1 = taglia · 2 = elimina · Spazio = play · J K L = shuttle · I/O = attacco/stacco · F1 = tutti i tasti');
  const dec = h('span', { class: 'stato-dec' });
  const statoBar = h('footer', { class: 'stato' }, msg, dec, h('span', { class: 'stato-ver' }, `DaProd Video ${VERSIONE}`));
  motore.ogniGiro(() => {
    if (Math.random() > 0.05) return;
    const s = statoDecoder();
    dec.textContent = `${motore.fpsMisurati} fps · decoder ${s.flussi + s.ricerche}`;
  });

  // ——— fogli per il telefono ———
  const apriFoglio = (f: 'bin' | 'lato' | 'nessuno') => {
    if (!radice.classList.contains('stretto')) return;
    radice.dataset.foglio = radice.dataset.foglio === f ? 'nessuno' : f;
  };
  const barraTel = h('nav', { class: 'barra-tel' },
    h('button', { on: { click: () => apriFoglio('bin') } }, icona('apri', 18), h('span', null, 'Contenitore')),
    h('button', { on: { click: () => { motore.setMonitor(motore.attivo === 'player' ? 'recorder' : 'player'); } } }, icona('schermo', 18), h('span', null, 'Player/Rec')),
    h('button', { on: { click: () => apriFoglio('lato') } }, icona('ingranaggio', 18), h('span', null, 'Proprietà')),
    h('button', { on: { click: () => finestraEsporta() } }, icona('esporta', 18), h('span', null, 'Esporta')));

  const monitor = h('div', { class: 'monitor-zona' }, player.el, recorder.el);
  const divisore = h('div', { class: 'divisore', title: 'Trascina per dare più spazio ai monitor o alla timeline' });
  radice.append(testa, bin.el, monitor, pannelloLato, puls.el, divisore, tl.el, statoBar, barraTel);

  divisore.addEventListener('pointerdown', (e) => {
    const y0 = e.clientY;
    const h0 = monitor.getBoundingClientRect().height;
    divisore.setPointerCapture(e.pointerId);
    const mv = (ev: PointerEvent) => { radice.style.setProperty('--alto', Math.max(160, Math.min(innerHeight - 260, h0 + ev.clientY - y0)) + 'px'); };
    const up = () => { divisore.removeEventListener('pointermove', mv); divisore.removeEventListener('pointerup', up); try { localStorage.setItem('dpv-alto', radice.style.getPropertyValue('--alto')); } catch { /* niente */ } };
    divisore.addEventListener('pointermove', mv);
    divisore.addEventListener('pointerup', up);
  });
  try { const a = localStorage.getItem('dpv-alto'); if (a) radice.style.setProperty('--alto', a); } catch { /* niente */ }

  // il monitor attivo si vede anche nella vista singola
  store.on('status', () => { radice.dataset.monitor = motore.attivo; });
  radice.dataset.monitor = motore.attivo;

  const larghezza = () => {
    const stretto = innerWidth < 900;
    radice.classList.toggle('stretto', stretto);
    if (stretto) radice.classList.add('singolo');
  };
  addEventListener('resize', larghezza);
  larghezza();

  // ——— tastiera, trascinamenti, audio ———
  installaTastiera();
  const extra: Record<string, () => void> = {
    'ctrl+s': () => salva(), 'ctrl+shift+s': () => salva(true), 'ctrl+o': () => apri(), 'ctrl+i': () => importaDialogo(),
    'ctrl+m': () => finestraEsporta(), 'ctrl+n': () => nuovo(), f1: () => finestraTasti(), '+': () => tl.zoom(1.5), '-': () => tl.zoom(1 / 1.5),
    '\\': () => tl.adattaTutto(), g: () => { modi.zoneSicure = !modi.zoneSicure; recorder.disegnaSopra(); },
    f11: () => void schermoIntero(),
  };
  addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if (document.querySelector('.velo')) return;
    const k = [(e.ctrlKey || e.metaKey) ? 'ctrl' : '', e.shiftKey && e.key.length > 1 || (e.shiftKey && /^[a-z]$/i.test(e.key)) ? 'shift' : '', e.key.toLowerCase()].filter(Boolean).join('+');
    const fn = extra[k];
    if (fn) { e.preventDefault(); fn(); }
  });
  const sveglia = () => banco.sveglia();
  addEventListener('pointerdown', sveglia, { once: true });
  addEventListener('keydown', sveglia, { once: true });

  // file dal sistema lasciati cadere ovunque
  addEventListener('dragover', (e) => { if (e.dataTransfer?.types.includes('Files')) e.preventDefault(); });
  addEventListener('drop', (e) => { if (e.dataTransfer?.files.length) { e.preventDefault(); void importaDaDrop(e.dataTransfer); } });
  if (isTauri && !isAndroid) {
    // nell'app il sistema consegna i percorsi veri: così il progetto li ritrova alla prossima apertura
    import('@tauri-apps/api/webview').then(({ getCurrentWebview }) => getCurrentWebview().onDragDropEvent((ev) => {
      if (ev.payload.type === 'drop') void importaFile(ev.payload.paths.map((p) => ({ name: p.split(/[\\/]/).pop() || p, path: p })));
    })).catch(() => {});
  }

  document.addEventListener('dpv:demo', () => montaggioDimostrativo());
  document.addEventListener('dpv:adatta', () => tl.adattaTutto());
  document.addEventListener('dpv:mancano', () => avviso('Alcuni file vanno ricollegati: File → Ricollega media', 'info', 6000));

  // autosalvataggio ogni 15 secondi e quando la finestra si chiude o si nasconde
  setInterval(() => void autosalva(), 15000);
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void autosalva(); });
  addEventListener('beforeunload', (e) => {
    void autosalva();
    if (store.dirty && store.doc.clips.length && !isTauri) { e.preventDefault(); }
  });

  // messaggi nella barra di stato per le azioni
  store.on('sel', () => {
    const n = store.sel.size;
    if (n) msg.textContent = `${n} clip selezionat${n === 1 ? 'a' : 'e'} · 1 taglia · 2 elimina · 3 elimina e chiudi · 4 separa audio · Alt ↑↓ trasparenza · trascina per spostare`;
  });

  aggTesta();
  void riprendi().then((ok) => { if (ok) setTimeout(() => tl.adattaTutto(), 200); });
  setTimeout(() => { player.adatta(); recorder.adatta(); tl.adattaTutto(); }, 60);
  void esegui;
  return { tl, player, recorder };
}
