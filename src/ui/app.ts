// Il banco di montaggio: mette insieme menu, contenitore, monitor, pulsantiera, timeline e strumenti.
// Due pagine: MONTAGGIO (contenitore, monitor, proprietà, timeline) e FINALE (monitor grande, ritocchi su
// tutto, esporta). Ogni bordo fra i pannelli si trascina: il banco lo sistemi come vuoi, e se lo ricorda.
import { store } from '../core/store';
import { motore } from '../motore';
import { azioni, esegui, modi } from '../azioni';
import { Timeline } from './timeline';
import { PannelloMonitor } from './monitor';
import { Finale } from './finale';
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
import { finestraAggiornamenti, finestraNovita, novitaDopoAggiornamento, tastoAggiornamenti } from './aggiornamenti';
import { montaggioDimostrativo } from '../demo';
import { FORMATI } from '../core/tipi';
import { statoDecoder } from '../media/fotogrammi';
import { statoProxy } from '../media/proxy';
import { mediaRT } from '../media/libreria';
import { banco } from '../media/audio';

export function avvia(radice: HTMLElement) {
  const tl = new Timeline();
  const monitor = new PannelloMonitor();
  const finale = new Finale();
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
  const vuCornice = h('div', { class: 'vu-cornice' }, vu.el);
  const pannelloLato = h('section', { class: 'pannello lato' },
    vuCornice,
    h('header', { class: 'schede' }, tab('clip', 'Proprietà'), tab('mixer', 'Mixer'), tab('scopi', 'Strumenti')),
    latoCorpo);
  document.addEventListener('dpv:ispettore', () => { pagina('montaggio'); mostraLato('clip'); apriFoglio('lato'); });

  // ——— le due pagine: Montaggio e Finale ———
  type Pagina = 'montaggio' | 'finale';
  const pagina = (pg: Pagina) => {
    if (radice.dataset.pagina === pg) return;
    radice.dataset.pagina = pg;
    // i VU vanno dove si guarda: nelle proprietà durante il montaggio, nel Finale alla fine
    if (pg === 'finale') finale.el.insertBefore(vuCornice, finale.el.children[1] ?? null);
    else pannelloLato.insertBefore(vuCornice, pannelloLato.firstChild);
    radice.querySelectorAll('.pagina-btn').forEach((b) => b.classList.toggle('attiva', (b as HTMLElement).dataset.p === pg));
    motore.setMonitor('recorder');
    if (pg === 'finale' && radice.classList.contains('stretto')) radice.dataset.foglio = 'finale';
    setTimeout(() => { monitor.adatta(); tl.adattaTutto(); }, 80);
  };
  const tastoPagina = (pg: Pagina, nome: string, ic: string, title: string) => h('button', { class: 'pagina-btn' + (pg === 'montaggio' ? ' attiva' : ''), 'data-p': pg, title, on: { click: () => pagina(pg) } }, icona(ic, 16), h('span', null, nome));

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
      { nome: 'Pagina Montaggio', spunta: radice.dataset.pagina !== 'finale', tasto: 'F9', fn: () => pagina('montaggio') },
      { nome: 'Pagina Finale (colore, audio, esporta)', spunta: radice.dataset.pagina === 'finale', tasto: 'F9', fn: () => pagina('finale') },
      { sep: true },
      { nome: 'Contenitore', spunta: !radice.classList.contains('senza-bin'), fn: () => { radice.classList.toggle('senza-bin'); salvaBanco(); setTimeout(() => monitor.adatta(), 50); } },
      { nome: 'Proprietà', spunta: !radice.classList.contains('senza-lato'), fn: () => { radice.classList.toggle('senza-lato'); salvaBanco(); setTimeout(() => monitor.adatta(), 50); } },
      { nome: 'Pulsantiera', spunta: !radice.classList.contains('senza-puls'), fn: () => { radice.classList.toggle('senza-puls'); salvaBanco(); } },
      { nome: 'Timeline stretta (proprietà e VU fino in fondo)', tasto: 'V', spunta: radice.classList.contains('lato-lungo'), fn: () => vistaStretta() },
      { nome: 'Rimetti il banco come all\'inizio', fn: () => rimettiBanco() },
      { sep: true },
      { nome: 'Monitor a schermo intero (con la timeline)', fn: () => monitor.pieno() },
      { nome: 'Zone di sicurezza', spunta: modi.zoneSicure, fn: () => { modi.zoneSicure = !modi.zoneSicure; monitor.disegnaSopra(); } },
      { nome: 'Tutto il montaggio nella finestra', tasto: '\\', fn: () => tl.adattaTutto() },
      { nome: 'Finestra a schermo intero', tasto: 'F11', fn: () => void schermoIntero() },
      { sep: true },
      { nome: 'Strumenti di misura', fn: () => { pagina('montaggio'); mostraLato('scopi'); } },
      { nome: 'Mixer', fn: () => { pagina('montaggio'); mostraLato('mixer'); } },
    ]],
    ['Aiuto', () => [
      { nome: 'Tasti della centralina', tasto: 'F1', fn: () => finestraTasti() },
      { nome: `Novità della ${VERSIONE}`, fn: () => finestraNovita() },
      ...(isTauri ? [{ nome: 'Aggiornamenti…', fn: () => void finestraAggiornamenti() }] : []),
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
    h('div', { class: 'pagine' },
      tastoPagina('montaggio', 'MONTAGGIO', 'montaggio', 'Il banco di montaggio (F9)'),
      tastoPagina('finale', 'FINALE', 'finale', 'Colore e audio su tutto il montaggio, poi esporta (F9)')),
    h('div', { class: 'testata-destra' },
      nomeProgetto, formato,
      h('span', { class: 'badge edizione' + (isTauri ? '' : ' prova') }, isTauri ? edizione : 'VERSIONE PROVA · WEB'),
      tastoAggiornamenti(icona),
      h('button', { class: 'btn-icona', title: 'Importa (Ctrl+I)', on: { click: () => importaDialogo() } }, icona('importa', 18)),
      h('button', { class: 'btn-icona', title: 'Salva (Ctrl+S)', on: { click: () => salva() } }, icona('salva', 18)),
      h('button', { class: 'btn primario piccolo', title: 'Esporta il master (Ctrl+M)', on: { click: () => finestraEsporta() } }, icona('esporta', 15), 'Esporta')));

  // ——— barra di stato ———
  const msg = h('span', { class: 'stato-msg' }, 'Pronto. 1 taglia · 2 elimina · S separa/unisci · rotella = un fotogramma · Q/W scarto a sinistra/destra · F9 Finale · F1 tutti i tasti');
  const dec = h('span', { class: 'stato-dec' });
  const statoBar = h('footer', { class: 'stato' }, msg, dec, h('span', { class: 'stato-ver' }, `DaProd Video ${VERSIONE}`));
  motore.ogniGiro(() => {
    if (Math.random() > 0.05) return;
    const s = statoDecoder();
    const px = statoProxy(store.doc.media.map((m) => mediaRT(m.id)).filter((r): r is NonNullable<typeof r> => !!r));
    const proxy = px.lavoro ? ` · proxy ${px.pronti}/${px.pronti + px.lavoro} (${Math.round(px.prog * 100)}%)` : px.pronti ? ` · proxy ${px.pronti} pronti` : '';
    dec.textContent = `${motore.fpsMisurati} fps · decoder ${s.flussi + s.ricerche}${proxy}`;
  });

  // ——— fogli per il telefono ———
  const apriFoglio = (f: 'bin' | 'lato' | 'finale' | 'nessuno') => {
    if (!radice.classList.contains('stretto')) return;
    radice.dataset.foglio = radice.dataset.foglio === f ? 'nessuno' : f;
  };
  const barraTel = h('nav', { class: 'barra-tel' },
    h('button', { on: { click: () => apriFoglio('bin') } }, icona('apri', 18), h('span', null, 'Contenitore')),
    h('button', { on: { click: () => apriFoglio('lato') } }, icona('ingranaggio', 18), h('span', null, 'Proprietà')),
    h('button', { on: { click: () => { pagina(radice.dataset.pagina === 'finale' ? 'montaggio' : 'finale'); } } }, icona('finale', 18), h('span', null, 'Finale')),
    h('button', { on: { click: () => finestraEsporta() } }, icona('esporta', 18), h('span', null, 'Esporta')));

  // ——— i bordi fra i pannelli si trascinano (doppio clic: chiude o riapre il pannello accanto) ———
  const divisore = h('div', { class: 'divisore', title: 'Trascina per dare più spazio al monitor o alla timeline' });
  const bordoBin = h('div', { class: 'bordo bordo-bin', title: 'Trascina per allargare il contenitore · doppio clic per chiuderlo/riaprirlo' });
  const bordoLato = h('div', { class: 'bordo bordo-lato', title: 'Trascina per allargare il pannello · doppio clic per chiuderlo/riaprirlo' });
  radice.dataset.pagina = 'montaggio';
  radice.append(testa, bin.el, bordoBin, monitor.el, bordoLato, pannelloLato, finale.el, puls.el, divisore, tl.el, statoBar, barraTel);

  const VARI = ['--alto', '--bin', '--lato', '--fin', '--tlfin'];
  const salvaBanco = () => {
    try {
      const o: Record<string, string> = {};
      for (const v of VARI) { const x = radice.style.getPropertyValue(v); if (x) o[v] = x; }
      localStorage.setItem('dpv-banco', JSON.stringify({ o, cls: ['senza-bin', 'senza-lato', 'senza-puls', 'lato-lungo'].filter((c) => radice.classList.contains(c)) }));
    } catch { /* niente */ }
  };
  const rimettiBanco = () => {
    for (const v of VARI) radice.style.removeProperty(v);
    radice.classList.remove('senza-bin', 'senza-lato', 'senza-puls', 'lato-lungo');
    salvaBanco();
    setTimeout(() => { monitor.adatta(); tl.adattaTutto(); }, 60);
  };
  try {
    const b = JSON.parse(localStorage.getItem('dpv-banco') ?? 'null') as { o: Record<string, string>; cls: string[] } | null;
    if (b) { for (const [k, v] of Object.entries(b.o)) radice.style.setProperty(k, v); for (const c of b.cls) radice.classList.add(c); }
  } catch { /* niente */ }
  /** un bordo trascinabile: cambia una variabile del banco (in pixel) */
  const trascinaBordo = (el: HTMLElement, calcola: (dx: number, dy: number, r0: DOMRect) => [string, number] | null, misura: () => DOMRect, chiudi?: string) => {
    el.addEventListener('pointerdown', (e) => {
      const x0 = e.clientX, y0 = e.clientY;
      const r0 = misura();
      el.setPointerCapture(e.pointerId);
      el.classList.add('preso');
      const mv = (ev: PointerEvent) => {
        const r = calcola(ev.clientX - x0, ev.clientY - y0, r0);
        if (r) radice.style.setProperty(r[0], Math.round(r[1]) + 'px');
      };
      const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.classList.remove('preso'); salvaBanco(); monitor.adatta(); };
      el.addEventListener('pointermove', mv);
      el.addEventListener('pointerup', up);
    });
    if (chiudi) el.addEventListener('dblclick', () => { radice.classList.toggle(chiudi); salvaBanco(); setTimeout(() => monitor.adatta(), 50); });
  };
  trascinaBordo(bordoBin, (dx, _dy, r0) => ['--bin', Math.max(180, Math.min(innerWidth * 0.5, r0.width + dx))], () => bin.el.getBoundingClientRect(), 'senza-bin');
  trascinaBordo(bordoLato, (dx, _dy, r0) => radice.dataset.pagina === 'finale'
    ? ['--fin', Math.max(300, Math.min(innerWidth * 0.72, r0.width - dx))]
    : ['--lato', Math.max(230, Math.min(innerWidth * 0.45, r0.width - dx))], () => (radice.dataset.pagina === 'finale' ? finale.el : pannelloLato).getBoundingClientRect(), 'senza-lato');
  trascinaBordo(divisore, (_dx, dy, r0) => radice.dataset.pagina === 'finale'
    ? ['--tlfin', Math.max(90, Math.min(innerHeight - 220, r0.height - dy))]
    : ['--alto', Math.max(160, Math.min(innerHeight - 220, r0.height + dy))], () => (radice.dataset.pagina === 'finale' ? tl.el : monitor.el).getBoundingClientRect());

  /** tasto V: la timeline si stringe e la colonna di destra (VU, proprietà, mixer) scende fino in fondo, o torna larga */
  const vistaStretta = () => {
    const on = radice.classList.toggle('lato-lungo');
    if (on) radice.classList.remove('senza-lato');
    salvaBanco();
    setTimeout(() => { monitor.adatta(); }, 60);
    avviso(on ? 'Timeline stretta: proprietà, mixer e VU fino in fondo (V per tornare)' : 'Timeline larga (V per stringerla)', 'info', 1400);
  };
  document.addEventListener('dpv:vista', vistaStretta);

  const larghezza = () => {
    const stretto = innerWidth < 900;
    radice.classList.toggle('stretto', stretto);
  };
  addEventListener('resize', larghezza);
  larghezza();

  // ——— tastiera, trascinamenti, audio ———
  installaTastiera();
  const extra: Record<string, () => void> = {
    'ctrl+s': () => salva(), 'ctrl+shift+s': () => salva(true), 'ctrl+o': () => apri(), 'ctrl+i': () => importaDialogo(),
    'ctrl+m': () => finestraEsporta(), 'ctrl+n': () => nuovo(), f1: () => finestraTasti(), '+': () => tl.zoom(1.5), '-': () => tl.zoom(1 / 1.5),
    '\\': () => tl.adattaTutto(), v: () => vistaStretta(), g: () => { modi.zoneSicure = !modi.zoneSicure; monitor.disegnaSopra(); },
    f11: () => void schermoIntero(), f9: () => pagina(radice.dataset.pagina === 'finale' ? 'montaggio' : 'finale'),
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
    if (n) msg.textContent = `${n} clip scelt${n === 1 ? 'a' : 'e'} · 2 elimina · 3 elimina e chiudi · S separa/unisci · fx in fondo alla clip = effetti · trascina per spostare (non copre niente)`;
  });

  aggTesta();
  novitaDopoAggiornamento();
  void riprendi().then((ok) => { if (ok) setTimeout(() => tl.adattaTutto(), 200); });
  setTimeout(() => { monitor.adatta(); tl.adattaTutto(); }, 60);
  void esegui;
  return { tl, monitor, finale };
}
