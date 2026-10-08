// La finestra "Dialogo e voce fuori campo" (1.4.0): scrivi le battute ("Marco: Ciao!"), scegli la lingua, la velocità
// e la voce di ogni personaggio; diventano sottotitoli al cursore (o all'inizio della clip scelta) e, con un clic, la
// voce AI le dice ognuno con la sua voce. Una riga senza nome è del narratore: è la voce fuori campo.
import { store } from '../core/store';
import { uid } from '../core/progetto';
import { fps } from '../core/timecode';
import { LINGUE, SOTTO0, sottotitoliDi } from '../core/sottotitoli';
import { leggiDialogo, personaggi, righeDialogo, RITMI, scriviDialogo, vociPer, NARRATORE } from '../core/dialogo';
import { VOCI_MAGPIE, motoreNemo } from '../media/nemo';
import { avviso, dialogo, h } from './dom';

const ESEMPIO = `Narratore: Era una sera d'estate, e la sala di montaggio era ancora accesa.
Marco: Ci siamo quasi, manca solo la voce.
Giulia: Allora scriviamola qui, e la facciamo parlare.
Marco: Così? In un clic?
Giulia: In un clic.`;

const PAUSE: [string, number][] = [['Corta', 0.2], ['Normale', 0.4], ['Lunga', 0.8]];

export function apriDialogoScritto() {
  const p = store.doc;
  const s0 = sottotitoliDi(p);
  const r = fps(p.rate);
  // se c'è già un dialogo lo si riapre per correggerlo
  const giaDialogo = s0.righe.filter((x) => x.chi);
  const sel = p.clips.find((c) => store.sel.has(c.id) && c.kind !== 'fx');
  const stato = {
    lingua: s0.lingua || 'it',
    ritmo: 'normale',
    pausa: 0.4,
    da: (sel ? 'clip' : 'cursore') as 'cursore' | 'clip' | 'dopo',
    voci: { ...(s0.voci ?? {}) } as Record<string, number>,
    nomi: !!s0.nomi,
  };
  const d = dialogo('💬 Dialogo e voce fuori campo', { largo: true });
  const testo = h('textarea', { class: 'campo-testo dlg-dialogo', rows: 10, spellcheck: true, placeholder: ESEMPIO }) as HTMLTextAreaElement;
  testo.value = giaDialogo.length ? scriviDialogo(giaDialogo) : '';
  // le lettere vanno nel testo, non al banco (1 = taglia!)
  testo.addEventListener('keydown', (e) => e.stopPropagation());

  const chips = <T extends string | number>(voci: [string, T][], get: () => T, put: (v: T) => void) => {
    const b = voci.map(([n, v]) => h('button', { class: 'chip', on: { click: () => { put(v); agg(); } } }, n));
    const agg = () => b.forEach((x, i) => x.classList.toggle('acceso', voci[i][1] === get()));
    agg();
    return { el: h('div', { class: 'isp-chips' }, b), agg };
  };
  const lingua = h('select', { class: 'mini-select largo' }, LINGUE.map(([v, n]) => h('option', { value: v, selected: v === stato.lingua }, n))) as HTMLSelectElement;
  lingua.addEventListener('change', () => { stato.lingua = lingua.value; });
  const ritmo = chips(RITMI.map((x) => [x.nome, x.id] as [string, string]), () => stato.ritmo, (v) => { stato.ritmo = v; riassumi(); });
  const pausa = chips(PAUSE.map(([n, v]) => [n, v] as [string, number]), () => stato.pausa, (v) => { stato.pausa = v; riassumi(); });
  const daDove = chips<typeof stato.da>([['Al cursore', 'cursore'], ...(sel ? [['Dall\'inizio della clip scelta', 'clip'] as [string, typeof stato.da]] : []), ['Dopo l\'ultimo sottotitolo', 'dopo']], () => stato.da, (v) => { stato.da = v; });
  const nomi = h('input', { type: 'checkbox', checked: stato.nomi }) as HTMLInputElement;
  nomi.addEventListener('change', () => { stato.nomi = nomi.checked; });

  const cast = h('div', { class: 'dlg-cast' });
  const riassunto = h('p', { class: 'nota' });
  const riassumi = () => {
    const b = leggiDialogo(testo.value || '');
    const chi = personaggi(b);
    stato.voci = vociPer(chi, stato.voci, VOCI_MAGPIE.length);
    cast.replaceChildren(...chi.map((nome) => h('div', { class: 'dlg-personaggio' },
      h('b', null, nome === NARRATORE ? '🎙 ' + nome : '🗣 ' + nome),
      chips(VOCI_MAGPIE.map((v, i) => [v, i] as [string, number]), () => stato.voci[nome], (v) => { stato.voci[nome] = v; }).el)));
    if (!chi.length) cast.append(h('p', { class: 'nota' }, 'Scrivi una battuta per riga: "Nome: cosa dice". Le righe senza nome sono la voce fuori campo (il narratore).'));
    const cps = RITMI.find((x) => x.id === stato.ritmo)?.cps ?? 15;
    const righe = righeDialogo(b, 0, r, { cps, pausa: stato.pausa }, () => 'x');
    const dura = righe.length ? righe[righe.length - 1].a / r : 0;
    riassunto.textContent = righe.length
      ? `${b.filter((x) => x.testo).length} battute · ${chi.length} ${chi.length === 1 ? 'voce' : 'voci'} · ${righe.length} righe di sottotitoli · circa ${dura.toFixed(1).replace('.', ',')} s`
      : 'Ancora niente da dire.';
  };
  let timer = 0;
  testo.addEventListener('input', () => { clearTimeout(timer); timer = window.setTimeout(riassumi, 200); });
  riassumi();

  d.corpo.append(
    h('p', { class: 'nota' }, 'Una battuta per riga: "Nome: cosa dice". Le righe senza nome sono la voce fuori campo. "(pausa)" da solo fa una pausa. I tempi si stimano da quanto è lunga ogni battuta: poi li sistemi nella riga SOTT della timeline.'),
    testo,
    h('div', { class: 'dlg-griglia' },
      h('div', null, h('label', { class: 'etichetta' }, 'Lingua delle battute'), lingua),
      h('div', null, h('label', { class: 'etichetta' }, 'Ritmo'), ritmo.el),
      h('div', null, h('label', { class: 'etichetta' }, 'Pausa fra le battute'), pausa.el),
      h('div', null, h('label', { class: 'etichetta' }, 'Da dove parte'), daDove.el)),
    h('label', { class: 'etichetta' }, 'Le voci (voce AI di NVIDIA, una per personaggio)'),
    cast,
    h('label', { class: 'spunta-riga' }, nomi, ' scrivi nel video anche chi parla ("Marco: …")'),
    riassunto,
    ...(motoreNemo() ? [] : [h('p', { class: 'nota' }, 'La voce AI gira nell\'app per Windows e Mac. Nel browser il dialogo diventa sottotitoli, e la voce la fai nell\'app.')]));

  const metti = (parla: boolean) => {
    const b = leggiDialogo(testo.value || '');
    if (!b.some((x) => x.testo)) { avviso('Scrivi almeno una battuta', 'info'); return; }
    const pp0 = store.doc;
    const ultimo = Math.max(0, ...sottotitoliDi(pp0).righe.map((x) => x.a));
    const f0 = stato.da === 'clip' && sel ? sel.start : stato.da === 'dopo' ? ultimo + Math.round(r * 0.5) : Math.round(store.head);
    const cps = RITMI.find((x) => x.id === stato.ritmo)?.cps ?? 15;
    const nuove = righeDialogo(b, f0, r, { cps, pausa: stato.pausa }, () => uid('s'));
    const a0 = nuove[0].da, a1 = nuove[nuove.length - 1].a;
    let tolte = 0;
    store.edit('Dialogo', (pp) => {
      const s = (pp.sottotitoli ??= { ...SOTTO0, righe: [] });
      // le righe che stavano proprio lì (e le vecchie righe del dialogo che si sta correggendo) lasciano il posto
      const prima = s.righe.length;
      const correggo = giaDialogo.length > 0 && testo.value.trim() !== '';
      s.righe = s.righe.filter((x) => !(x.a > a0 && x.da < a1) && !(correggo && x.chi));
      tolte = prima - s.righe.length;
      s.righe.push(...nuove);
      s.righe.sort((x, y) => x.da - y.da);
      s.lingua = stato.lingua;
      s.voci = { ...(s.voci ?? {}), ...stato.voci };
      s.nomi = stato.nomi || undefined;
      s.nelVideo = true;
    });
    d.chiudi();
    avviso(`💬 ${nuove.length} righe del dialogo nella riga SOTT${tolte ? ` (al posto di ${tolte} vecchie)` : ''}`, 'ok', 3200);
    if (parla) document.dispatchEvent(new CustomEvent('dpv:fai-parlare'));
  };
  d.piede.append(
    h('button', { class: 'btn', on: { click: () => d.chiudi() } }, 'Annulla'),
    h('button', { class: 'btn', title: 'Diventano sottotitoli, ai loro tempi', on: { click: () => metti(false) } }, '📝 Metti i sottotitoli'),
    h('button', { class: 'btn primario', title: 'Sottotitoli e poi la voce AI, ogni personaggio con la sua', on: { click: () => metti(true) } }, '🎙 Metti e fai le voci'));
  setTimeout(() => testo.focus(), 50);
}
