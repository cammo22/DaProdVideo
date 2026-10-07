// Il banco di montaggio: mette insieme menu, contenitore, monitor, pulsantiera, timeline e strumenti.
// Due pagine: MONTAGGIO (contenitore, monitor, proprietà, timeline) e FINALE (monitor grande, ritocchi su
// tutto, esporta). Ogni bordo fra i pannelli si trascina: il banco lo sistemi come vuoi, e se lo ricorda.
import { store } from '../core/store';
import { motore } from '../motore';
import { azioni, esegui, inserisciGeneratore, modi } from '../azioni';
import { animazioniDi, GRUPPI_ANIM } from '../core/animazioni';
import { Timeline } from './timeline';
import { PannelloMonitor } from './monitor';
import { Finale } from './finale';
import { Live } from './live';
import { Montage } from './montage';
import { Home } from './home';
import { Contenitore } from './contenitore';
import { Pulsantiera } from './pulsantiera';
import { Ispettore } from './ispettore';
import { Mixer, VuMetri } from './mixer';
import { Scopi } from './scopi';
import { costruisciMenu, h, icona, avviso, chiudiMenu, type VoceMenu } from './dom';
import { installaTastiera } from './tastiera';
import { finestraEsporta, finestraInfo, finestraProgetto, finestraTasti, esportaEdl, esportaFotogramma, VERSIONE } from './dialoghi';
import { apri, apriFile, salvaPacchetto, autosalva, importaDaDrop, importaDialogo, importaFile, nuovo, ricollega, riprendi, salva } from '../progetti';
import { edizione, invoke, isAndroid, isTauri, apriLink, schermoIntero, GRANDEZZE_UI, grandezzaUI, impostaGrandezzaUI } from '../platform';
import { finestraAggiornamenti, finestraNovita, novitaDopoAggiornamento, tastoAggiornamenti } from './aggiornamenti';
import { montaggioDimostrativo } from '../demo';
import { FORMATI } from '../core/tipi';
import { statoDecoder } from '../media/fotogrammi';
import { CentroAttivita } from './attivita';
import { impostaUsoMedia, risvegliaProxy } from '../media/libreria';
import { banco } from '../media/audio';
import { registra } from '../azioni';
import { apriCerca } from './cerca';
import './fontiCerca';
import { finestraGuida } from './guida';
import { finestraCentroAI, FUNZIONI_AI } from './centroAI';
import { modoProxy, impostaModoProxy, svuotaProxy } from '../media/proxy';
import { svuotaCache } from '../media/cache';

export function avvia(radice: HTMLElement) {
  const tl = new Timeline();
  const monitor = new PannelloMonitor();
  const finale = new Finale();
  const live = new Live();
  const montage = new Montage();
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
  // il puntino: il pannello a destra sempre in vista, a tutta altezza (come il tasto V)
  const fissa = h('button', { class: 'scheda-fissa', title: 'Tieni il pannello sempre in vista, a tutta altezza (V)', on: { click: () => vistaStretta() } }, '📌');
  const pannelloLato = h('section', { class: 'pannello lato' },
    vuCornice,
    h('header', { class: 'schede' }, tab('clip', 'Proprietà'), tab('mixer', 'Mixer'), tab('scopi', 'Strumenti'), fissa),
    latoCorpo);
  // clic su una clip o su un FX: il pannello si apre (se era chiuso) e mostra le sue impostazioni
  document.addEventListener('dpv:proprieta', () => {
    if (radice.dataset.pagina !== 'montaggio' || radice.classList.contains('stretto')) return;
    if (radice.classList.contains('senza-lato')) { radice.classList.remove('senza-lato'); salvaBanco(); setTimeout(() => monitor.adatta(), 50); }
    mostraLato('clip');
  });
  document.addEventListener('dpv:ispettore', () => { pagina('montaggio'); mostraLato('clip'); apriFoglio('lato'); });
  // "porta dove si fa" (guida, ricerca, Centro AI): una sezione delle proprietà della clip scelta
  document.addEventListener('dpv:sezione', (e) => {
    const id = (e as CustomEvent).detail as string;
    pagina('montaggio');
    if (radice.classList.contains('senza-lato')) { radice.classList.remove('senza-lato'); salvaBanco(); setTimeout(() => monitor.adatta(), 50); }
    mostraLato('clip');
    apriFoglio('lato');
    if (!store.sel.size) { avviso('Scegli prima una clip nella timeline: qui compariranno le sue impostazioni', 'info', 3200); return; }
    setTimeout(() => { if (!isp.apriSezione(id)) avviso('Per la clip scelta questa impostazione non c\'è: scegli una clip video', 'info', 3000); }, 60);
  });

  // ——— le quattro pagine: Montaggio, Finale, LIVE e DaProdMontage ———
  type Pagina = 'montaggio' | 'finale' | 'live' | 'montage';
  const pagina = (pg: Pagina) => {
    if (radice.dataset.pagina === pg) return;
    if (radice.dataset.pagina === 'live' && live.registrando) avviso('La registrazione continua: torna su LIVE per fermarla', 'info', 2600);
    radice.dataset.pagina = pg;
    live.mostrata(pg === 'live');
    montage.mostrata(pg === 'montage');
    // i VU vanno dove si guarda: nelle proprietà durante il montaggio, nel Finale alla fine
    if (pg === 'finale') finale.el.insertBefore(vuCornice, finale.el.children[1] ?? null);
    else pannelloLato.insertBefore(vuCornice, pannelloLato.firstChild);
    radice.querySelectorAll('.pagina-btn').forEach((b) => b.classList.toggle('attiva', (b as HTMLElement).dataset.p === pg));
    motore.setMonitor('recorder');
    if (pg === 'finale' && radice.classList.contains('stretto')) radice.dataset.foglio = 'finale';
    setTimeout(() => { monitor.adatta(); tl.adattaTutto(); }, 80);
  };
  const home = new Home(() => pagina('montage'));
  document.addEventListener('dpv:home', () => home.mostra());
  const tastoPagina = (pg: Pagina, nome: string, ic: string, title: string) => h('button', { class: 'pagina-btn' + (pg === 'montaggio' ? ' attiva' : ''), 'data-p': pg, title, on: { click: () => pagina(pg) } }, icona(ic, 16), h('span', null, nome));

  // ——— menu ———
  const voce = (id: string, extra: Partial<VoceMenu> = {}): VoceMenu => {
    const a = azioni.get(id)!;
    return { nome: a.nome, tasto: a.tasti?.[0]?.replace('ArrowLeft', '←').replace('ArrowRight', '→').replace('ArrowUp', '↑').replace('ArrowDown', '↓').replace('Space', 'Spazio'), fn: a.fn, ...extra };
  };
  const menus: [string, () => VoceMenu[]][] = [
    ['File', () => [
      { nome: 'Pagina iniziale (progetti)', fn: () => home.mostra() },
      { sep: true },
      { nome: 'Nuovo progetto', tasto: 'Ctrl+N', sotto: FORMATI.map((f) => ({ nome: f.nome, fn: () => nuovo(f) })) },
      { nome: 'Apri progetto…', tasto: 'Ctrl+O', fn: () => apri() },
      { nome: 'Salva', tasto: 'Ctrl+S', fn: () => salva() },
      { nome: 'Salva come…', tasto: 'Ctrl+Shift+S', fn: () => salva(true) },
      { nome: 'Salva il pacchetto .daprod (con tutti i file)…', fn: () => void salvaPacchetto() },
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
    ['Generatori', () => [
      voce('genBarre'), voce('genCountdown'), voce('genNero'), voce('genColore'), voce('genTitolo'), { sep: true },
      { nome: 'Animazioni', sotto: GRUPPI_ANIM.map((g) => ({ nome: g.nome, sotto: animazioniDi(g.id).map((a) => ({ nome: a.nome, fn: () => { inserisciGeneratore('anim', undefined, undefined, { anim: a.id }); avviso(`${a.nome} al cursore`, 'ok', 1200); } })) })) },
      voce('genAnimazione'),
    ]],
    ['AI', () => [
      { nome: 'Centro AI (tutte le funzioni, come si usano)…', fn: () => finestraCentroAI() },
      { sep: true },
      ...FUNZIONI_AI.map((f) => ({ nome: `${f.icona} ${f.nome}`, fn: f.apri })),
      { sep: true },
      { nome: '🔍 Controlla l\'AI (se qualcosa non va)', fn: () => finestraCentroAI(true) },
      { nome: 'Se un\'AI non parte (guida)', fn: () => finestraGuida('problemi-ai') },
    ]],
    ['Vista', () => [
      { nome: 'Pagina Montaggio', spunta: radice.dataset.pagina === 'montaggio', tasto: 'F9', fn: () => pagina('montaggio') },
      { nome: 'Pagina Finale (colore, audio, esporta)', spunta: radice.dataset.pagina === 'finale', tasto: 'F9', fn: () => pagina('finale') },
      { nome: 'Pagina LIVE (registra lo schermo)', spunta: radice.dataset.pagina === 'live', tasto: 'F10', fn: () => pagina('live') },
      { nome: 'Pagina DaProdMontage (il montaggio automatico)', spunta: radice.dataset.pagina === 'montage', tasto: 'F8', fn: () => pagina('montage') },
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
      { nome: 'Tracce più alte', tasto: 'Ctrl+Shift+rotella', fn: () => tl.zoomVerticale(1.25) },
      { nome: 'Tracce più basse', fn: () => tl.zoomVerticale(0.8) },
      isTauri
        ? { nome: 'Grandezza dell\'interfaccia', sotto: GRANDEZZE_UI.map((k) => ({ nome: Math.round(k * 100) + '%', tasto: k === 1 ? 'Ctrl+0' : '', spunta: Math.abs(grandezzaUI() - k) < 0.01, fn: () => void impostaGrandezzaUI(k) })) }
        : { nome: 'Grandezza dell\'interfaccia', tasto: 'Ctrl + / Ctrl −', fn: () => avviso('Nel browser: Ctrl + e Ctrl − ingrandiscono tutto (Ctrl 0 torna com\'era)', 'info', 3500) },
      { nome: 'Finestra a schermo intero', tasto: 'F11', fn: () => void schermoIntero() },
      { sep: true },
      { nome: 'Strumenti di misura', fn: () => { pagina('montaggio'); mostraLato('scopi'); } },
      { nome: 'Mixer', fn: () => { pagina('montaggio'); mostraLato('mixer'); } },
      { sep: true },
      { nome: 'Copie leggere per il monitor (proxy)', sotto: [
        { nome: 'Da sole, per le riprese pesanti (consigliato)', spunta: modoProxy() === 'auto', fn: () => { impostaModoProxy('auto'); avviso('Copie leggere: da sole per le riprese pesanti in timeline', 'info'); } },
        { nome: 'Sempre (anche per i file leggeri)', spunta: modoProxy() === 'sempre', fn: () => { impostaModoProxy('sempre'); avviso('Copie leggere: sempre', 'info'); } },
        { nome: 'Mai (il monitor legge gli originali)', spunta: modoProxy() === 'mai', fn: () => { impostaModoProxy('mai'); avviso('Copie leggere spente: il monitor legge gli originali', 'info'); } },
        { sep: true },
        { nome: 'Svuota le copie leggere (si rifanno quando servono)', fn: async () => { await svuotaProxy(); avviso('Copie leggere tolte dal disco: si rifanno da sole quando servono', 'ok', 2600); } },
      ] },
      { nome: 'Svuota la memoria delle misure (forme d\'onda, colore, locandine)', fn: async () => { await svuotaCache(); avviso('Memoria delle misure svuotata: si rifanno alla prossima apertura dei file', 'ok', 2600); } },
    ]],
    ['Aiuto', () => [
      { nome: 'Come si fa (la guida)', tasto: 'F1', fn: () => finestraGuida() },
      { nome: 'Cerca un comando…', tasto: 'Ctrl+K', fn: () => apriCerca() },
      { nome: 'Tasti della centralina', fn: () => finestraTasti() },
      { nome: 'Centro AI…', fn: () => finestraCentroAI() },
      { sep: true },
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
    h('button', { class: 'btn-progetti', title: 'I tuoi progetti: nuovo, apri, recenti', on: { click: () => home.mostra() } }, icona('apri', 15), h('span', null, 'Progetti')),
    barraMenu,
    h('button', { class: 'btn-cerca', title: 'Cerca un comando, un effetto, una transizione, una funzione AI o una guida (Ctrl+K)', on: { click: () => apriCerca() } }, '🔍', h('span', null, 'Cerca'), h('kbd', null, 'Ctrl K')),
    h('button', { class: 'btn-ai', title: 'Centro AI: tutte le funzioni intelligenti, come si usano e se sono pronte', on: { click: () => finestraCentroAI() } }, '✨', h('span', null, 'AI')),
    h('div', { class: 'pagine' },
      tastoPagina('montaggio', 'MONTAGGIO', 'montaggio', 'Il banco di montaggio (F9)'),
      tastoPagina('finale', 'FINALE', 'finale', 'Colore e audio su tutto il montaggio, poi esporta (F9)'),
      tastoPagina('live', 'LIVE', 'live', 'Registra lo schermo e mettilo nel montaggio (F10)'),
      tastoPagina('montage', 'MONTAGE', 'automatico', 'DaProdMontage: butta dentro le foto e il programma monta da solo (F8)')),
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
  const centro = new CentroAttivita();
  const statoBar = h('footer', { class: 'stato' }, msg, dec, centro.el, h('span', { class: 'stato-ver' }, `DaProd Video ${VERSIONE}`));
  motore.ogniGiro(() => {
    if (Math.random() > 0.05) return;
    const s = statoDecoder();
    dec.textContent = `${motore.fpsMisurati} fps · decoder ${s.flussi + s.ricerche}`;
  });
  // chi sta in timeline passa avanti nelle code dei lavori di fondo; una ripresa appena messa in timeline si prende la sua copia leggera
  impostaUsoMedia((id) => {
    let n = 0;
    for (const c of store.doc.clips) if (c.media === id) n++;
    for (const q of store.doc.sequenze ?? []) for (const c of q.clips ?? []) if (c.media === id) n++;
    return n;
  });
  let svegliaProxy = 0;
  // si aspetta un attimo di calma (2 s dall'ultima modifica): appena messa una ripresa in timeline quasi sempre la si guarda, e la copia
  // leggera che parte subito ruberebbe il decoder proprio al primo play
  store.on('doc', () => { clearTimeout(svegliaProxy); svegliaProxy = window.setTimeout(() => { svegliaProxy = 0; risvegliaProxy(store.doc.media); }, 2000); });

  // ——— fogli per il telefono ———
  const apriFoglio = (f: 'bin' | 'lato' | 'finale' | 'nessuno') => {
    if (!radice.classList.contains('stretto')) return;
    radice.dataset.foglio = radice.dataset.foglio === f ? 'nessuno' : f;
  };
  const barraTel = h('nav', { class: 'barra-tel' },
    h('button', { on: { click: () => apriFoglio('bin') } }, icona('apri', 18), h('span', null, 'Contenitore')),
    h('button', { on: { click: () => apriFoglio('lato') } }, icona('ingranaggio', 18), h('span', null, 'Proprietà')),
    h('button', { on: { click: () => { pagina(radice.dataset.pagina === 'finale' ? 'montaggio' : 'finale'); } } }, icona('finale', 18), h('span', null, 'Finale')),
    h('button', { on: { click: () => pagina(radice.dataset.pagina === 'montage' ? 'montaggio' : 'montage') } }, icona('automatico', 18), h('span', null, 'Monta')),
    h('button', { on: { click: () => finestraEsporta() } }, icona('esporta', 18), h('span', null, 'Esporta')));

  // ——— i bordi fra i pannelli si trascinano (doppio clic: chiude o riapre il pannello accanto) ———
  const divisore = h('div', { class: 'divisore', title: 'Trascina per dare più spazio al monitor o alla timeline' });
  const bordoBin = h('div', { class: 'bordo bordo-bin', title: 'Trascina per allargare il contenitore · doppio clic per chiuderlo/riaprirlo' });
  const bordoLato = h('div', { class: 'bordo bordo-lato', title: 'Trascina per allargare il pannello · doppio clic per chiuderlo/riaprirlo' });
  // col pannello chiuso resta una linguetta sul bordo destro per riaprirlo
  const linguetta = h('button', { class: 'linguetta-lato', title: 'Riapri il pannello delle proprietà', on: { click: () => { radice.classList.remove('senza-lato'); salvaBanco(); setTimeout(() => monitor.adatta(), 50); } } }, '‹ Proprietà');
  radice.dataset.pagina = 'montaggio';
  radice.append(testa, bin.el, bordoBin, monitor.el, bordoLato, pannelloLato, finale.el, live.el, montage.el, home.el, puls.el, divisore, tl.el, statoBar, barraTel, linguetta);

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
  fissa.classList.toggle('acceso', radice.classList.contains('lato-lungo'));
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
    fissa.classList.toggle('acceso', on);
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
  if (isTauri && grandezzaUI() !== 1) void impostaGrandezzaUI(grandezzaUI());
  // i comandi del banco (file, pagine, vista, aiuto): stanno nel registro di src/azioni.ts come tutti gli altri, così
  // hanno un tasto solo, compaiono nella ricerca (Ctrl+K) e nella finestra dei tasti
  const cambiaPagina = (pg: Pagina) => pagina(radice.dataset.pagina === pg ? 'montaggio' : pg);
  for (const a of [
    { id: 'importa', nome: 'Importa video, audio, immagini…', gruppo: 'File', tasti: ['Ctrl+I'], fn: () => void importaDialogo() },
    { id: 'salva', nome: 'Salva il progetto', gruppo: 'File', tasti: ['Ctrl+S'], fn: () => void salva() },
    { id: 'salvaCome', nome: 'Salva come…', gruppo: 'File', tasti: ['Ctrl+Shift+S'], fn: () => void salva(true) },
    { id: 'apri', nome: 'Apri un progetto…', gruppo: 'File', tasti: ['Ctrl+O'], fn: () => { home.nascondi(); void apri(); } },
    { id: 'nuovo', nome: 'Nuovo progetto', gruppo: 'File', tasti: ['Ctrl+N'], fn: () => void nuovo() },
    { id: 'progetti', nome: 'Pagina iniziale (i progetti recenti)', gruppo: 'File', fn: () => home.mostra() },
    { id: 'pacchetto', nome: 'Salva il pacchetto .daprod (con tutti i file)…', gruppo: 'File', info: 'Il progetto e tutti i suoi file in un file solo, da aprire identico su un altro computer.', fn: () => void salvaPacchetto() },
    { id: 'ricollega', nome: 'Ricollega i file mancanti…', gruppo: 'File', fn: () => void ricollega() },
    { id: 'esporta', nome: 'Esporta il video (master)…', gruppo: 'File', tasti: ['Ctrl+M'], info: 'MP4, MOV, WebM o WAV; tutto il montaggio o solo fra attacco e stacco.', fn: () => finestraEsporta() },
    { id: 'esportaEdl', nome: 'Esporta la EDL (CMX3600)…', gruppo: 'File', fn: () => esportaEdl() },
    { id: 'esportaFotogramma', nome: 'Esporta il fotogramma in PNG', gruppo: 'File', fn: () => esportaFotogramma() },
    { id: 'impostazioniProgetto', nome: 'Impostazioni del progetto (misura, fotogrammi)…', gruppo: 'File', fn: () => finestraProgetto() },
    { id: 'demo', nome: 'Montaggio dimostrativo', gruppo: 'File', info: 'Un piccolo montaggio di prova, per vedere come funziona.', fn: () => montaggioDimostrativo() },
    { id: 'paginaFinale', nome: 'Pagina Finale ↔ Montaggio', gruppo: 'Pagine', tasti: ['F9'], fn: () => cambiaPagina('finale') },
    { id: 'paginaLive', nome: 'Pagina LIVE (registra lo schermo)', gruppo: 'Pagine', tasti: ['F10'], fn: () => cambiaPagina('live') },
    { id: 'paginaMontage', nome: 'DaProdMontage (montaggio automatico)', gruppo: 'Pagine', tasti: ['F8'], fn: () => cambiaPagina('montage') },
    { id: 'vistaStretta', nome: 'Timeline stretta ↔ larga (proprietà fino in fondo)', gruppo: 'Vista', tasti: ['V'], fn: () => vistaStretta() },
    { id: 'zoneSicure', nome: 'Zone di sicurezza sul monitor', gruppo: 'Vista', tasti: ['G'], fn: () => { modi.zoneSicure = !modi.zoneSicure; monitor.disegnaSopra(); } },
    { id: 'zoomPiu', nome: 'Zoom avanti sulla timeline', gruppo: 'Vista', tasti: ['+'], fn: () => tl.zoom(1.5) },
    { id: 'zoomMeno', nome: 'Zoom indietro sulla timeline', gruppo: 'Vista', tasti: ['-'], fn: () => tl.zoom(1 / 1.5) },
    { id: 'adatta', nome: 'Tutto il montaggio nella finestra', gruppo: 'Vista', tasti: ['\\'], fn: () => tl.adattaTutto() },
    { id: 'schermoIntero', nome: 'Finestra a schermo intero', gruppo: 'Vista', tasti: ['F11'], fn: () => void schermoIntero() },
    { id: 'guida', nome: 'Come si fa (la guida)', gruppo: 'Aiuto', tasti: ['F1'], info: 'I lavori principali in pochi passi, col pulsante che porta dove si fa.', fn: () => finestraGuida() },
    { id: 'cerca', nome: 'Cerca un comando', gruppo: 'Aiuto', tasti: ['Ctrl+K'], info: 'Scrivi cosa vuoi fare: comandi, effetti, transizioni, titoli, AI e guide.', fn: () => apriCerca() },
    { id: 'tasti', nome: 'Tutti i tasti della centralina', gruppo: 'Aiuto', fn: () => finestraTasti() },
    { id: 'centroAI', nome: 'Centro AI (tutte le funzioni intelligenti)', gruppo: 'AI', info: 'Sottotitoli, traduzione, voce, sfondo, segui un oggetto, montaggio automatico: cosa fanno e come si usano.', fn: () => finestraCentroAI() },
    { id: 'controllaAI', nome: 'Controlla l\'AI (se qualcosa non va)', gruppo: 'AI', fn: () => finestraCentroAI(true) },
  ]) registra(a);
  // la grandezza dell'interfaccia nell'app, un gradino alla volta (Ctrl 0 torna al 100%); nel browser fa il browser
  const zoomApp: Record<string, () => void> = isTauri ? {
    'ctrl++': () => void impostaGrandezzaUI(GRANDEZZE_UI.find((k) => k > grandezzaUI() + 0.01) ?? grandezzaUI()),
    'ctrl+=': () => void impostaGrandezzaUI(GRANDEZZE_UI.find((k) => k > grandezzaUI() + 0.01) ?? grandezzaUI()),
    'ctrl+-': () => void impostaGrandezzaUI([...GRANDEZZE_UI].reverse().find((k) => k < grandezzaUI() - 0.01) ?? grandezzaUI()),
    'ctrl+0': () => void impostaGrandezzaUI(1),
  } : {};
  addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if (document.querySelector('.velo')) return;
    const k = [(e.ctrlKey || e.metaKey) ? 'ctrl' : '', e.key.toLowerCase()].filter(Boolean).join('+');
    const fn = zoomApp[k] as (() => void) | undefined;
    if (!fn) return;
    e.preventDefault();
    fn();
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
  document.addEventListener('dpv:cerca', () => apriCerca());
  document.addEventListener('dpv:guida', (e) => finestraGuida((e as CustomEvent).detail as string | undefined));
  document.addEventListener('dpv:tasti', () => finestraTasti());
  document.addEventListener('dpv:centro-ai', () => finestraCentroAI());
  document.addEventListener('dpv:finale', (e) => { pagina('finale'); finale.mostra((e as CustomEvent).detail as Parameters<Finale['mostra']>[0]); });
  document.addEventListener('dpv:sottotitoli', () => { pagina('finale'); finale.mostra('sottotitoli'); });
  document.addEventListener('dpv:pagina', (e) => pagina((e as CustomEvent).detail as Pagina));
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
  // aperta col doppio clic su un progetto (.daprod o .dpv): si apre quello; se no si riprende da dove eri
  const daFile = isTauri ? invoke<string | null>('file_di_avvio').catch(() => null) : Promise.resolve(null);
  void daFile.then(async (f) => {
    if (f) { await apriFile({ path: f }); setTimeout(() => tl.adattaTutto(), 200); return; }
    if (await riprendi()) setTimeout(() => tl.adattaTutto(), 200);
    // all'apertura si parte dai progetti (non nelle prove automatiche: lì il banco deve essere subito libero)
    if (!navigator.webdriver) home.mostra();
  });
  // sul Mac, doppio clic su un progetto con l'app già aperta
  if (isTauri) void import('@tauri-apps/api/event').then(({ listen }) => listen<string>('apri-file', (e) => { void invoke<string | null>('file_di_avvio'); void apriFile({ path: e.payload }); })).catch(() => {});
  setTimeout(() => { monitor.adatta(); tl.adattaTutto(); }, 60);
  void esegui;
  return { tl, monitor, finale, live, montage, bin };
}
