// Le tendine di DaProd Video. Al posto della tendina del sistema (piccola, grigia, diversa su ogni computer, senza
// ricerca) ogni <select> del programma diventa un pulsante grande col valore scritto bene; un clic apre un pannello
// con le voci a gruppi, la descrizione sotto il nome, la ricerca (scrivi e filtra) e i tasti (frecce, Invio, Esc).
// Il <select> vero resta nella pagina, invisibile: tiene il valore, manda "change" come prima, e chi lo usava (il
// pannello, il Finale, LIVE, le prove automatiche con selectOption) non si accorge di niente. Si attacca da solo a
// ogni <select> che compare (MutationObserver), tranne quelli con data-nativa.
//
// Come si leggono le voci:
//  · <optgroup label="…"> → un gruppo;
//  · "Gruppo · Nome" → il gruppo prima del punto (le animazioni: "Sottopancia · Barra pulita");
//  · "Nome — descrizione" o "Nome (descrizione)" → il nome grande e la descrizione piccola sotto.

interface Voce { valore: string; nome: string; info: string; gruppo: string; disabilitata: boolean; indice: number }

const FATTE = new WeakSet<HTMLSelectElement>();
const valoreNativo = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!;
const indiceNativo = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex')!;

/** "Gruppo · Nome — info" → le tre parti */
export function leggiVoce(testo: string): { gruppo: string; nome: string; info: string } {
  let gruppo = '';
  let resto = testo.trim();
  const punto = resto.indexOf(' · ');
  // il punto separa il gruppo solo se il gruppo è corto (non "1920×1080 · 25 fps")
  if (punto > 0 && punto <= 28 && !/\d/.test(resto.slice(0, punto))) { gruppo = resto.slice(0, punto); resto = resto.slice(punto + 3); }
  let nome = resto, info = '';
  const trattino = resto.search(/ [—–] /);
  if (trattino > 0) { nome = resto.slice(0, trattino); info = resto.slice(trattino + 3); }
  else {
    const par = /^(.{2,40}?) \(([^()]{3,})\)$/.exec(resto);
    if (par) { nome = par[1]; info = par[2]; }
  }
  return { gruppo, nome: nome.trim(), info: info.trim() };
}

function voci(s: HTMLSelectElement): Voce[] {
  return Array.from(s.options).map((o, indice) => {
    const og = o.parentElement instanceof HTMLOptGroupElement ? o.parentElement.label : '';
    const v = leggiVoce(o.textContent ?? '');
    return { valore: o.value, nome: v.nome || o.value, info: v.info, gruppo: og || v.gruppo, disabilitata: o.disabled, indice };
  });
}

/** senza accenti e minuscolo: "Città" si trova scrivendo "citta" */
const piano = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

let aperta: { chiudi: () => void } | null = null;
export const chiudiTendina = () => aperta?.chiudi();

/** trasforma un <select> nella tendina DaProd (una volta sola) */
export function tendina(s: HTMLSelectElement) {
  if (FATTE.has(s) || s.multiple || s.dataset.nativa !== undefined) return;
  FATTE.add(s);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tendina ' + s.className.replace(/\bmini-select\b/, '').trim();
  btn.setAttribute('aria-haspopup', 'listbox');
  const etichetta = document.createElement('span');
  etichetta.className = 'tendina-valore';
  const freccia = document.createElement('span');
  freccia.className = 'tendina-freccia';
  freccia.textContent = '▾';
  btn.append(etichetta, freccia);
  if (s.title) btn.title = s.title;

  const scrivi = () => {
    const o = s.options[indiceNativo.get!.call(s) as number];
    const v = o ? leggiVoce(o.textContent ?? '') : null;
    etichetta.textContent = v ? v.nome : '—';
    btn.title = s.title || (o?.textContent ?? '');
    btn.disabled = s.disabled;
  };
  // chi cambia il valore da codice (s.value = …) aggiorna anche il pulsante
  Object.defineProperty(s, 'value', {
    configurable: true,
    get() { return valoreNativo.get!.call(this); },
    set(v) { valoreNativo.set!.call(this, v); scrivi(); },
  });
  Object.defineProperty(s, 'selectedIndex', {
    configurable: true,
    get() { return indiceNativo.get!.call(this); },
    set(v) { indiceNativo.set!.call(this, v); scrivi(); },
  });
  s.addEventListener('change', scrivi);
  // le opzioni possono cambiare dopo (elenchi che si riempiono): si riscrive
  new MutationObserver(scrivi).observe(s, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'label'] });

  s.classList.add('tendina-nativa');
  s.tabIndex = -1;
  s.after(btn);
  scrivi();

  btn.addEventListener('click', (e) => { e.stopPropagation(); apri(s, btn); });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apri(s, btn); }
  });
}

function scegli(s: HTMLSelectElement, valore: string) {
  if (valoreNativo.get!.call(s) === valore) return;
  s.value = valore;
  s.dispatchEvent(new Event('input', { bubbles: true }));
  s.dispatchEvent(new Event('change', { bubbles: true }));
}

function apri(s: HTMLSelectElement, btn: HTMLButtonElement) {
  if (s.disabled) return;
  aperta?.chiudi();
  const tutte = voci(s);
  const conRicerca = tutte.length > 8;
  const pan = document.createElement('div');
  pan.className = 'tendina-pannello';
  pan.setAttribute('role', 'listbox');
  const cerca = document.createElement('input');
  cerca.className = 'tendina-cerca';
  cerca.placeholder = '🔍 Scrivi per cercare…';
  cerca.spellcheck = false;
  const lista = document.createElement('div');
  lista.className = 'tendina-lista';
  if (conRicerca) pan.append(cerca);
  pan.append(lista);
  document.body.appendChild(pan);
  btn.classList.add('aperta');

  let attiva = Math.max(0, tutte.findIndex((v) => v.valore === valoreNativo.get!.call(s)));
  let visibili: Voce[] = tutte;

  const disegna = () => {
    const q = piano(cerca.value.trim());
    visibili = q ? tutte.filter((v) => piano(v.nome + ' ' + v.info + ' ' + v.gruppo).includes(q)) : tutte;
    lista.replaceChildren();
    if (!visibili.length) {
      const vuoto = document.createElement('div');
      vuoto.className = 'tendina-vuota';
      vuoto.textContent = 'Niente con queste lettere';
      lista.append(vuoto);
      return;
    }
    if (!visibili.some((v) => v.indice === attiva)) attiva = visibili[0].indice;
    let gruppo = '\u0000';
    for (const v of visibili) {
      if (v.gruppo !== gruppo) {
        gruppo = v.gruppo;
        if (gruppo) {
          const g = document.createElement('div');
          g.className = 'tendina-gruppo';
          g.textContent = gruppo;
          lista.append(g);
        }
      }
      const r = document.createElement('div');
      r.className = 'tendina-voce' + (v.valore === valoreNativo.get!.call(s) ? ' scelta' : '') + (v.indice === attiva ? ' attiva' : '') + (v.disabilitata ? ' spenta' : '');
      r.setAttribute('role', 'option');
      r.dataset.valore = v.valore;
      r.dataset.i = String(v.indice);
      const n = document.createElement('span');
      n.className = 'tendina-nome';
      n.textContent = v.nome;
      r.append(n);
      if (v.info) {
        const i = document.createElement('span');
        i.className = 'tendina-info';
        i.textContent = v.info;
        r.append(i);
      }
      if (!v.disabilitata) {
        r.addEventListener('pointerdown', (e) => e.preventDefault());
        r.addEventListener('click', () => { scegli(s, v.valore); chiudi(); });
        r.addEventListener('pointerenter', () => { attiva = v.indice; segna(); });
      }
      lista.append(r);
    }
  };
  const segna = () => {
    for (const el of lista.querySelectorAll<HTMLElement>('.tendina-voce')) el.classList.toggle('attiva', Number(el.dataset.i) === attiva);
  };
  const mostraAttiva = () => lista.querySelector<HTMLElement>(`.tendina-voce[data-i="${attiva}"]`)?.scrollIntoView({ block: 'nearest' });

  const posiziona = () => {
    const r = btn.getBoundingClientRect();
    const larga = Math.max(r.width, conRicerca ? 300 : 220);
    pan.style.minWidth = Math.min(larga, innerWidth - 12) + 'px';
    pan.style.maxWidth = Math.min(Math.max(larga, 420), innerWidth - 12) + 'px';
    const sotto = innerHeight - r.bottom - 8;
    const sopra = r.top - 8;
    const giu = sotto >= 260 || sotto >= sopra;
    pan.style.maxHeight = Math.max(160, Math.min(520, giu ? sotto : sopra)) + 'px';
    const ph = pan.getBoundingClientRect().height;
    pan.style.top = (giu ? r.bottom + 4 : r.top - ph - 4) + 'px';
    const w = pan.getBoundingClientRect().width;
    pan.style.left = Math.max(6, Math.min(r.left, innerWidth - w - 6)) + 'px';
  };

  const fuori = (e: Event) => { if (!pan.contains(e.target as Node) && e.target !== btn && !btn.contains(e.target as Node)) chiudi(); };
  const scorre = (e: Event) => { if (!pan.contains(e.target as Node)) chiudi(); };
  const tasti = (e: KeyboardEvent) => {
    const i = visibili.findIndex((v) => v.indice === attiva);
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); chiudi(); btn.focus(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); e.stopPropagation();
      let j = i;
      do j = Math.max(0, Math.min(visibili.length - 1, j + (e.key === 'ArrowDown' ? 1 : -1)));
      while (visibili[j]?.disabilitata && j > 0 && j < visibili.length - 1);
      if (visibili[j]) { attiva = visibili[j].indice; segna(); mostraAttiva(); }
    } else if (e.key === 'Enter') {
      e.preventDefault(); e.stopPropagation();
      const v = visibili[i];
      if (v && !v.disabilitata) { scegli(s, v.valore); chiudi(); btn.focus(); }
    } else if (!conRicerca) {
      // senza casella: la prima lettera salta alla voce che comincia così
      if (e.key.length === 1) {
        const k = piano(e.key);
        const v = visibili.find((x) => piano(x.nome).startsWith(k) && x.indice > attiva) ?? visibili.find((x) => piano(x.nome).startsWith(k));
        if (v) { attiva = v.indice; segna(); mostraAttiva(); }
      }
    } else e.stopPropagation(); // le lettere vanno alla ricerca, non al banco (1 = taglia!)
  };
  function chiudi() {
    pan.remove();
    btn.classList.remove('aperta');
    document.removeEventListener('pointerdown', fuori, true);
    document.removeEventListener('keydown', tasti, true);
    window.removeEventListener('resize', chiudi);
    document.removeEventListener('scroll', scorre, true);
    if (aperta?.chiudi === chiudi) aperta = null;
  }
  aperta = { chiudi };
  cerca.addEventListener('input', () => { disegna(); posiziona(); });
  disegna();
  posiziona();
  mostraAttiva();
  if (conRicerca) cerca.focus();
  else { pan.tabIndex = -1; pan.focus(); }
  setTimeout(() => {
    document.addEventListener('pointerdown', fuori, true);
    document.addEventListener('keydown', tasti, true);
    window.addEventListener('resize', chiudi);
    document.addEventListener('scroll', scorre, true);
  });
}

/** da chiamare una volta: ogni <select> della pagina, presente e futuro, diventa una tendina DaProd */
export function attivaTendine(radice: ParentNode = document) {
  for (const s of radice.querySelectorAll('select')) tendina(s as HTMLSelectElement);
  const mo = new MutationObserver((cambi) => {
    for (const c of cambi) {
      for (const n of c.addedNodes) {
        if (n instanceof HTMLSelectElement) tendina(n);
        else if (n instanceof HTMLElement) for (const s of n.querySelectorAll('select')) tendina(s as HTMLSelectElement);
      }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}
