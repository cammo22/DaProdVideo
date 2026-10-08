// Il catalogo delle animazioni: sottopancia, testi che si muovono, numeri e grafici, social, fondi e luci,
// e quelle per le cerimonie. Qui ci sono solo i dati (nome, campi da compilare, durata); come si disegnano sta in
// src/render/animazioni.ts. Il disegno è un'altra cosa: ogni animazione è una funzione del tempo, senza stato.
// Molte nascono dal catalogo di HyperFrames (HeyGen, Apache-2.0, https://github.com/heygen-com/hyperframes): le
// stesse idee di movimento (entrata, tenuta, uscita), ridisegnate per questo programma. Vedi THIRD-PARTY.md.
import type { AnimSpec } from './tipi';

export type TipoCampo = 'testo' | 'lungo' | 'numero' | 'colore' | 'scelta' | 'spunta';
export interface CampoAnim {
  id: string;
  nome: string;
  tipo: TipoCampo;
  def: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  scelte?: [string, string][];
}

export type GruppoAnim = 'sottopancia' | 'testo' | 'dati' | 'social' | 'fondi' | 'cerimonia' | 'retro3d' | 'oggetto';

export interface Anim {
  id: string;
  nome: string;
  gruppo: GruppoAnim;
  info: string;
  /** durata di partenza in secondi */
  durata: number;
  campi: CampoAnim[];
  /** riempie tutto il quadro (un fondo): niente trasparenza */
  fondo?: boolean;
}

export const GRUPPI_ANIM: { id: GruppoAnim; nome: string; info: string }[] = [
  { id: 'sottopancia', nome: 'Sottopancia', info: 'nome e ruolo, in dieci modi' },
  { id: 'testo', nome: 'Testi che si muovono', info: 'parole che salgono, si decodificano, cambiano' },
  { id: 'dati', nome: 'Numeri e grafici', info: 'contatori, anelli, barre' },
  { id: 'social', nome: 'Social e chiusure', info: 'segui, iscriviti, post, notifiche, chat' },
  { id: 'fondi', nome: 'Fondi e luci', info: 'aurora, stelle, neve, bokeh, perdite di luce, HUD' },
  { id: 'cerimonia', nome: 'Cerimonie e feste', info: 'monogramma, cornici, cuori, petali, palloncini' },
  { id: 'retro3d', nome: 'Retro 3D', info: 'logo cromato, testo che gira, tubi, warp, synthwave: i segreti degli anni \'90' },
  { id: 'oggetto', nome: 'Sull\'oggetto', info: 'cerchio, freccia, etichetta, mirino, emoji: si attaccano a un oggetto tracciato' },
];

// ——— i campi ———
const T = (id: string, nome: string, def: string): CampoAnim => ({ id, nome, tipo: 'testo', def });
const L = (id: string, nome: string, def: string): CampoAnim => ({ id, nome, tipo: 'lungo', def });
const N = (id: string, nome: string, def: number, min: number, max: number, step = 1): CampoAnim => ({ id, nome, tipo: 'numero', def, min, max, step });
const C = (id: string, nome: string, def: string): CampoAnim => ({ id, nome, tipo: 'colore', def });
const S = (id: string, nome: string, def: string, scelte: [string, string][]): CampoAnim => ({ id, nome, tipo: 'scelta', def, scelte });

const POS = S('pos', 'Dove sta', 'sinistra', [['sinistra', 'A sinistra'], ['centro', 'Al centro'], ['destra', 'A destra']]);
const DIM = N('dim', 'Grandezza', 100, 50, 200, 5);
const FONT_SCELTE: [string, string][] = [['montserrat', 'Montserrat (pulito)'], ['oswald', 'Oswald (stretto)'], ['archivo', 'Archivo Black (pesante)'], ['bebas', 'Bebas Neue (titoli)'],
  ['playfair', 'Playfair (elegante)'], ['cormorant', 'Cormorant (raffinato)'], ['vibes', 'Great Vibes (corsivo)'], ['caveat', 'Caveat (a mano)'], ['mono', 'Space Mono (macchina)'], ['rajdhani', 'Rajdhani'], ['orbitron', 'Orbitron (digitale)']];
const FONT = (def = 'montserrat'): CampoAnim => ({ id: 'font', nome: 'Carattere', tipo: 'scelta', def, scelte: FONT_SCELTE });

const sotto = (id: string, nome: string, info: string, colore: string, secondo: CampoAnim = T('ruolo', 'Ruolo', 'Conduttrice · Neuroscienziata')): Anim => ({
  id, nome, gruppo: 'sottopancia', info, durata: 5, campi: [T('nome', 'Nome', 'Maya Chen'), secondo, C('colore', 'Colore', colore), POS, DIM],
});

export const ANIMAZIONI: Anim[] = [
  // ——— sottopancia (dai blocchi lt-* di HyperFrames) ———
  sotto('lt-barra', 'Barra pulita', 'scheda bianca con linguetta colorata', '#ff5a36'),
  sotto('lt-sottolinea', 'Sottolineatura', 'nome grande con la riga che si allunga', '#46e5b7'),
  sotto('lt-blocco', 'Blocco con etichetta', 'blocco scuro che si scopre, etichetta gialla', '#ffd23f', T('etichetta', 'Etichetta', 'Ospite')),
  sotto('lt-colore', 'Blocco colore', 'un blocco di colore che entra di lato', '#2756ff'),
  sotto('lt-scheda', 'Scheda scura', 'scheda scura con la riga sotto il nome', '#f5b942'),
  sotto('lt-kicker', 'Etichetta e nome', 'la targhetta cade, poi il nome', '#46e5b7', T('etichetta', 'Etichetta', 'In studio')),
  sotto('lt-maschera', 'Scoperta a barra', 'una barra scopre il nome da sinistra', '#ffd23f'),
  sotto('lt-neon', 'Bordo neon', 'una cornice al neon si disegna attorno', '#35e8ff'),
  sotto('lt-linea', 'Linea laterale', 'una riga verticale e il testo che scivola', '#46e5b7'),
  sotto('lt-pillola', 'Pillola', 'pillola bianca con il pallino colorato', '#ff5a36'),
  sotto('lt-barre', 'Barre impilate', 'due barre, nome e ruolo, si aprono in senso opposto', '#ffd23f'),

  // ——— testi ———
  { id: 'tx-parole', nome: 'Parole che salgono', gruppo: 'testo', info: 'ogni parola sale da sfocata a nitida', durata: 5,
    campi: [L('testo', 'Testo', 'Un giorno speciale, insieme'), C('colore', 'Colore', '#ffffff'), S('unita', 'Sale', 'parola', [['parola', 'Una parola alla volta'], ['lettera', 'Una lettera alla volta']]), FONT('montserrat'), DIM] },
  { id: 'tx-decodifica', nome: 'Decodifica', gruppo: 'testo', info: 'le lettere girano e si fermano una a una', durata: 4,
    campi: [T('testo', 'Testo', 'DA PROD VIDEO'), C('colore', 'Colore', '#46e5b7'), S('stile', 'Stile', 'terminale', [['terminale', 'Terminale (con cornice)'], ['pulito', 'Pulito']]), DIM] },
  { id: 'tx-cambia', nome: 'Parola che cambia', gruppo: 'testo', info: 'una parola gira fra le alternative e si ferma sull\'ultima', durata: 5,
    campi: [T('prima', 'Prima', 'Montaggio'), T('opzioni', 'Alternative (virgole)', 'più veloce,più bello,davvero tuo'), T('dopo', 'Dopo', ''), C('colore', 'Colore della parola', '#ffd23f'), FONT('montserrat'), DIM] },
  { id: 'tx-colpo', nome: 'Parole a colpo', gruppo: 'testo', info: 'ogni parola arriva sbattendo, come un titolo da trailer', durata: 4,
    campi: [T('testo', 'Testo', 'È ARRIVATO IL MOMENTO'), C('colore', 'Colore', '#ffffff'), C('evidenzia', 'Parola in evidenza', '#ffd23f'), FONT('archivo'), DIM] },
  { id: 'tx-penna', nome: 'Evidenziatore a mano', gruppo: 'testo', info: 'il pennarello passa sulla parola importante', durata: 4,
    campi: [T('testo', 'Frase', 'La cosa più importante è esserci'), T('parola', 'Parola evidenziata', 'importante'), C('colore', 'Colore del testo', '#ffffff'), C('pennarello', 'Colore del pennarello', '#ffd23f'), FONT('montserrat'), DIM] },
  { id: 'tx-titolo', nome: 'Titolo con riga', gruppo: 'testo', info: 'titolo, riga che si apre e sottotitolo', durata: 5,
    campi: [T('titolo', 'Titolo', 'Una storia lunga un giorno'), T('sottotitolo', 'Sottotitolo', 'Napoli · 12 giugno 2026'), C('colore', 'Colore', '#ffffff'), C('accento', 'Colore della riga', '#ffd23f'), FONT('playfair'), DIM] },
  { id: 'tx-scrivi', nome: 'Scritta a mano', gruppo: 'testo', info: 'si scrive da sola, da sinistra a destra, con la sottolineatura', durata: 4,
    campi: [T('testo', 'Testo', 'Grazie di cuore'), C('colore', 'Colore', '#ffffff'), C('accento', 'Sottolineatura', '#ff4d6d'), FONT('caveat'), DIM] },

  // ——— numeri e grafici ———
  { id: 'dt-contatore', nome: 'Contatore', gruppo: 'dati', info: 'un numero che sale fino al valore e si ferma con un colpo', durata: 5,
    campi: [N('valore', 'Valore', 1250, 0, 1000000000, 1), T('prefisso', 'Prima del numero', ''), T('suffisso', 'Dopo il numero', '+'), T('etichetta', 'Etichetta', 'invitati'), C('colore', 'Colore', '#ffd23f'), FONT('montserrat'), DIM] },
  { id: 'dt-anello', nome: 'Anello di avanzamento', gruppo: 'dati', info: 'un anello che si riempie fino alla percentuale', durata: 5,
    campi: [N('percento', 'Percentuale', 75, 0, 100, 1), T('etichetta', 'Etichetta', 'completato'), C('colore', 'Colore', '#46e5b7'), FONT('montserrat'), DIM] },
  { id: 'dt-barre', nome: 'Grafico a barre', gruppo: 'dati', info: 'le barre crescono una dopo l\'altra', durata: 6,
    campi: [T('titolo', 'Titolo', 'Dove andiamo in vacanza'), L('voci', 'Voci (nome:valore, una per riga)', 'Mare:80\nMontagna:55\nCittà:35\nCampagna:20'), C('colore', 'Colore', '#35e8ff'), FONT('montserrat'), DIM] },
  { id: 'dt-linea', nome: 'Grafico a linea', gruppo: 'dati', info: 'la linea si disegna e i punti si accendono', durata: 6,
    campi: [T('titolo', 'Titolo', 'Una bella crescita'), T('punti', 'Valori (virgole)', '10,25,18,40,35,60,80'), C('colore', 'Colore', '#ff4d6d'), FONT('montserrat'), DIM] },
  { id: 'dt-progresso', nome: 'Barra di avanzamento', gruppo: 'dati', info: 'una barra che si riempie con la percentuale sopra', durata: 5,
    campi: [T('etichetta', 'Etichetta', 'Obiettivo raggiunto'), N('percento', 'Percentuale', 68, 0, 100, 1), C('colore', 'Colore', '#ffd23f'), FONT('montserrat'), DIM] },

  // ——— social e chiusure ———
  { id: 'sc-segui', nome: 'Segui', gruppo: 'social', info: 'scheda con il pulsante che si preme e diventa "Segui già"', durata: 5,
    campi: [T('nome', 'Nome', '@daprod'), T('etichetta', 'Pulsante', 'Segui'), C('colore', 'Colore', '#ff2d6f'), POS, DIM] },
  { id: 'sc-iscriviti', nome: 'Iscriviti', gruppo: 'social', info: 'il pulsante rosso, il clic e la campanella che suona', durata: 5,
    campi: [T('etichetta', 'Pulsante', 'ISCRIVITI'), C('colore', 'Colore', '#ff0033'), POS, DIM] },
  { id: 'sc-chiusura', nome: 'Chiusura con invito', gruppo: 'social', info: 'grazie, un invito e il pulsante: per finire il video', durata: 6,
    campi: [T('titolo', 'Titolo', 'Grazie per la visione'), T('sotto', 'Riga sotto', 'Ci vediamo al prossimo video'), T('bottone', 'Pulsante', 'Iscriviti'), C('colore', 'Colore', '#ffd23f'), FONT('montserrat'), DIM] },
  { id: 'sc-post', nome: 'Post social', gruppo: 'social', info: 'una scheda stile post con avatar, testo e mi piace', durata: 6,
    campi: [T('nome', 'Nome', 'DaProd Video'), T('utente', 'Utente', '@daprod'), L('testo', 'Testo', 'Il montaggio vecchio stile, moderno dentro.'), N('mipiace', 'Mi piace', 12840, 0, 100000000, 1), C('colore', 'Colore', '#1d9bf0'), POS, DIM] },
  { id: 'sc-notifica', nome: 'Notifica del telefono', gruppo: 'social', info: 'un banner che scende dall\'alto come sul telefono', durata: 5,
    campi: [T('app', 'App', 'Messaggi'), T('titolo', 'Titolo', 'Anna'), T('testo', 'Testo', 'Sei pronto? Tra poco si parte!'), C('colore', 'Colore dell\'icona', '#34c759'), DIM] },
  { id: 'sc-chat', nome: 'Chat', gruppo: 'social', info: 'le bolle di una conversazione che arrivano una dopo l\'altra', durata: 7,
    campi: [L('righe', 'Messaggi (uno per riga; con ">" sono i tuoi)', 'Ciao! Ci sei domani?\n>Certo, a che ora?\nAlle 18, ti aspetto ❤\n>A presto!'), C('colore', 'Colore dei tuoi', '#0a84ff'), DIM] },

  // ——— fondi e luci ———
  { id: 'bg-aurora', nome: 'Aurora', gruppo: 'fondi', info: 'macchie di luce che si spostano piano', durata: 8, fondo: true,
    campi: [C('colore', 'Colore', '#46e5b7'), C('colore2', 'Secondo colore', '#7c5cff'), C('base', 'Fondo', '#0b0c12')] },
  { id: 'bg-stelle', nome: 'Stelle', gruppo: 'fondi', info: 'un cielo di stelle che scorre', durata: 8, fondo: true,
    campi: [C('colore', 'Colore', '#cfe3ff'), C('base', 'Fondo', '#05060f'), N('quante', 'Quante', 180, 20, 600, 10)] },
  { id: 'bg-neve', nome: 'Neve', gruppo: 'fondi', info: 'fiocchi che cadono sopra la ripresa', durata: 8,
    campi: [C('colore', 'Colore', '#ffffff'), N('quante', 'Quanti', 120, 10, 400, 10), N('vento', 'Vento', 30, -100, 100, 5)] },
  { id: 'bg-bokeh', nome: 'Bokeh', gruppo: 'fondi', info: 'cerchi di luce morbidi che galleggiano', durata: 8,
    campi: [C('colore', 'Colore', '#ffb347'), C('colore2', 'Secondo colore', '#ff7ab8'), N('quanti', 'Quanti', 22, 4, 80, 1)] },
  { id: 'bg-onde', nome: 'Onde', gruppo: 'fondi', info: 'onde colorate che ondeggiano', durata: 8, fondo: true,
    campi: [C('colore', 'Colore', '#35e8ff'), C('colore2', 'Secondo colore', '#7c5cff'), C('base', 'Fondo', '#08101f')] },
  { id: 'bg-impulso', nome: 'Impulso a tempo', gruppo: 'fondi', info: 'cerchi che pulsano a tempo di musica', durata: 8, fondo: true,
    campi: [C('colore', 'Colore', '#ff3df2'), C('base', 'Fondo', '#0a0612'), N('bpm', 'Battiti al minuto', 120, 60, 200, 1)] },
  { id: 'bg-luce', nome: 'Perdita di luce', gruppo: 'fondi', info: 'bagliori caldi come da una pellicola', durata: 4,
    campi: [C('colore', 'Colore', '#ff9a3d'), C('colore2', 'Secondo colore', '#ff4d6d')] },
  { id: 'hd-rec', nome: 'Videocamera REC', gruppo: 'fondi', info: 'il mirino di una videocamera: REC, batteria, data e tempo', durata: 8,
    campi: [T('data', 'Data', '12 GIU 2026'), T('modo', 'Modo', 'SP'), C('colore', 'Colore del REC', '#f12c2c')] },
  { id: 'hd-notizie', nome: 'Notiziario', gruppo: 'fondi', info: 'la fascia delle ultime notizie con il testo che scorre', durata: 8,
    campi: [T('marca', 'Sigla', 'DAPROD NEWS'), L('testo', 'Testo', 'Ultim\'ora: il montaggio è tutto un\'altra cosa · Nuove animazioni in arrivo · Ora anche senza sfondo'), C('colore', 'Colore', '#d2202a')] },
  { id: 'hd-mirino', nome: 'Mirino HUD', gruppo: 'fondi', info: 'angoli che si disegnano e numeri che scorrono', durata: 6,
    campi: [T('etichetta', 'Etichetta', 'SOGGETTO 01'), C('colore', 'Colore', '#35e8ff')] },

  // ——— cerimonie e feste ———
  { id: 'cr-monogramma', nome: 'Monogramma', gruppo: 'cerimonia', info: 'le iniziali dentro un cerchio dorato, i nomi e la data', durata: 7,
    campi: [T('iniziali', 'Iniziali', 'A & M'), T('nomi', 'Nomi', 'Anna e Marco'), T('data', 'Data', '12 giugno 2026'), C('colore', 'Colore', '#d4af37'), C('testo', 'Colore del testo', '#ffffff'), FONT('playfair')] },
  { id: 'cr-cornice', nome: 'Cornice dorata', gruppo: 'cerimonia', info: 'una cornice ornamentale che si disegna e il testo dentro', durata: 7,
    campi: [T('titolo', 'Titolo', 'Anna & Marco'), T('sotto', 'Riga sotto', 'si sposano · 12 giugno 2026'), C('colore', 'Colore', '#d4af37'), C('testo', 'Colore del testo', '#ffffff')] },
  { id: 'cr-dedica', nome: 'Dedica', gruppo: 'cerimonia', info: 'una frase elegante con due filetti e la firma', durata: 7,
    campi: [L('testo', 'Frase', 'Il giorno più bello\nè quello in cui\nsiamo stati insieme'), T('firma', 'Firma', '— Anna e Marco'), C('colore', 'Colore', '#ffffff'), C('accento', 'Filetti', '#d4af37'), FONT('cormorant')] },
  { id: 'cr-data', nome: 'Data grande', gruppo: 'cerimonia', info: 'giorno, mese e anno grandi, i nomi sotto', durata: 6,
    campi: [T('giorno', 'Giorno', '12'), T('mese', 'Mese', 'GIUGNO'), T('anno', 'Anno', '2026'), T('nomi', 'Nomi', 'Anna e Marco'), C('colore', 'Colore', '#ffffff'), C('accento', 'Accento', '#d4af37'), FONT('playfair')] },
  { id: 'cr-auguri', nome: 'Auguri con bandierine', gruppo: 'cerimonia', info: 'una ghirlanda di bandierine e la scritta di auguri', durata: 6,
    campi: [T('testo', 'Scritta', 'Buon Compleanno'), T('sotto', 'Riga sotto', 'Sofia · 18 anni'), C('colore', 'Colore', '#ffd23f'), C('colore2', 'Secondo colore', '#ff4d6d'), FONT('vibes')] },
  { id: 'cr-cuori', nome: 'Cuori che salgono', gruppo: 'cerimonia', info: 'cuori che salgono e ondeggiano sopra la ripresa', durata: 8,
    campi: [C('colore', 'Colore', '#ff4d6d'), C('colore2', 'Secondo colore', '#ffb3c6'), N('quanti', 'Quanti', 26, 4, 80, 1)] },
  { id: 'cr-petali', nome: 'Petali', gruppo: 'cerimonia', info: 'petali che cadono girando, come il riso e i fiori al matrimonio', durata: 8,
    campi: [C('colore', 'Colore', '#ffc2d1'), C('colore2', 'Secondo colore', '#ffffff'), N('quanti', 'Quanti', 40, 5, 150, 1)] },
  { id: 'cr-scintille', nome: 'Scintille dorate', gruppo: 'cerimonia', info: 'brillantini che cadono e scintillano', durata: 8,
    campi: [C('colore', 'Colore', '#ffd54a'), N('quante', 'Quante', 90, 10, 300, 5)] },
  { id: 'cr-palloncini', nome: 'Palloncini', gruppo: 'cerimonia', info: 'palloncini colorati che salgono', durata: 8,
    campi: [C('colore', 'Colore', '#ff4d6d'), C('colore2', 'Secondo colore', '#35e8ff'), C('colore3', 'Terzo colore', '#ffd23f'), N('quanti', 'Quanti', 14, 3, 40, 1)] },
  { id: 'cr-coriandoli', nome: 'Coriandoli', gruppo: 'cerimonia', info: 'uno scoppio di coriandoli colorati', durata: 5,
    campi: [C('colore', 'Colore', '#ff4d6d'), C('colore2', 'Secondo colore', '#ffd23f'), C('colore3', 'Terzo colore', '#35e8ff'), N('quanti', 'Quanti', 140, 20, 400, 10)] },

  // ——— retro 3D (1.4.0): i trucchi delle sigle e dei salvaschermi anni '90 e 2000 ———
  { id: 'r3-logo', nome: 'Logo cromato che vola', gruppo: 'retro3d', info: 'arriva da lontano girando, si ferma con il bagliore, riflesso che passa', durata: 6,
    campi: [T('testo', 'Testo', 'DAPROD'), T('sotto', 'Sotto', 'presenta'), S('cromo', 'Cromo', 'argento', [['argento', 'Argento'], ['oro', 'Oro'], ['neon', 'Neon'], ['rame', 'Rame']]), { id: 'scia', nome: 'Scia mentre arriva', tipo: 'spunta', def: true }, DIM] },
  { id: 'r3-wordart', nome: 'Testo 3D che gira', gruppo: 'retro3d', info: 'lettere arcobaleno con lo spessore che girano e saltano', durata: 5,
    campi: [T('testo', 'Testo', 'FANTASTICO!'), S('stile', 'Colori', 'arcobaleno', [['arcobaleno', 'Arcobaleno'], ['fuoco', 'Fuoco'], ['ghiaccio', 'Ghiaccio']]), N('giri', 'Giri', 2, 0, 8, 0.5), DIM] },
  { id: 'r3-tubi', nome: 'Tubi 3D (salvaschermo)', gruppo: 'retro3d', info: 'tubi colorati che crescono e girano ad angolo, con le giunture a palla', durata: 10,
    campi: [N('quanti', 'Quanti tubi', 4, 1, 8), N('velocita', 'Velocità', 6, 1, 20), { id: 'nero', nome: 'Fondo nero', tipo: 'spunta', def: false }] },
  { id: 'r3-warp', nome: 'Warp delle stelle', gruppo: 'retro3d', info: 'le stelle vengono incontro e diventano strisce: il salto nell\'iperspazio', durata: 6, fondo: true,
    campi: [C('colore', 'Colore', '#bfe3ff'), C('base', 'Fondo', '#02030a'), N('quanti', 'Quante stelle', 400, 50, 1200, 10)] },
  { id: 'r3-griglia', nome: 'Griglia synthwave', gruppo: 'retro3d', info: 'sole a righe, montagne di fil di ferro, pavimento a griglia che scorre', durata: 8, fondo: true,
    campi: [T('testo', 'Titolo (anche vuoto)', 'DAPROD'), C('colore', 'Colore', '#ff3df2'), C('colore2', 'Montagne', '#35e8ff'), N('velocita', 'Velocità', 1.2, 0, 5, 0.1)] },
  { id: 'r3-cubo', nome: 'Cubo che gira', gruppo: 'retro3d', info: 'un cubo con le facce in luce, gli spigoli al neon e la scritta sopra', durata: 6,
    campi: [T('testo', 'Scritta sulle facce', 'DAPROD'), C('colore', 'Colore', '#35e8ff'), DIM] },
  { id: 'r3-crawl', nome: 'Scritta che si allontana', gruppo: 'retro3d', info: 'righe gialle che scorrono verso le stelle, in prospettiva', durata: 14, fondo: true,
    campi: [T('titolo', 'Titolo', 'EPISODIO I'), L('testo', 'Testo', 'Tanto tempo fa, in una sala di montaggio\nnon troppo lontana, un videomaker\nscoprì i segreti del 3D anni \'90.'), C('colore', 'Colore', '#ffd54a'), N('velocita', 'Velocità', 60, 10, 200, 5)] },
  { id: 'r3-tunnel', nome: 'Tunnel della demoscene', gruppo: 'retro3d', info: 'anelli colorati che vengono incontro girando', durata: 8, fondo: true,
    campi: [S('forma', 'Forma', 'quadrati', [['quadrati', 'Quadrati'], ['esagoni', 'Esagoni'], ['cerchi', 'Cerchi']]), N('velocita', 'Velocità', 2, 0.2, 8, 0.1)] },
  { id: 'r3-terreno', nome: 'Volo sul terreno a poligoni', gruppo: 'retro3d', info: 'montagne a poligoni piatti al tramonto, come le prime console 3D', durata: 10, fondo: true,
    campi: [C('colore', 'Colore', '#5dffb4'), { id: 'fili', nome: 'Fil di ferro', tipo: 'spunta', def: true }, N('velocita', 'Velocità', 3, 0.5, 10, 0.5)] },
  { id: 'r3-pianeta', nome: 'Pianeta con l\'anello', gruppo: 'retro3d', info: 'un pianeta di fil di ferro con l\'anello che gira', durata: 8,
    campi: [T('testo', 'Scritta sotto', ''), C('colore', 'Colore', '#35e8ff'), C('colore2', 'Anello', '#ff3df2'), DIM] },

  // ——— sull'oggetto (1.4.0): disegnati attorno al centro, così seguono un oggetto tracciato ———
  { id: 'ob-cerchio', nome: 'Cerchio sull\'oggetto', gruppo: 'oggetto', info: 'un cerchio che si disegna attorno e pulsa', durata: 4,
    campi: [T('etichetta', 'Scritta sotto', ''), C('colore', 'Colore', '#ff3df2'), N('dim', 'Grandezza', 100, 30, 300, 5)] },
  { id: 'ob-freccia', nome: 'Freccia che indica', gruppo: 'oggetto', info: 'una freccia arriva e indica l\'oggetto, col testo', durata: 4,
    campi: [T('testo', 'Testo', 'GUARDA QUI'), S('da', 'Arriva da', 'sinistra', [['sinistra', 'Sinistra'], ['destra', 'Destra'], ['sopra', 'Sopra'], ['sotto', 'Sotto']]), C('colore', 'Colore', '#ffd54a'), N('dim', 'Distanza', 100, 30, 300, 5)] },
  { id: 'ob-etichetta', nome: 'Etichetta con la linea', gruppo: 'oggetto', info: 'un punto, una linea e il nome (come nei documentari)', durata: 4,
    campi: [T('titolo', 'Nome', 'Il protagonista'), T('sotto', 'Sotto', ''), S('verso', 'Verso', 'destra', [['destra', 'A destra'], ['sinistra', 'A sinistra']]), C('colore', 'Colore', '#35e8ff')] },
  { id: 'ob-aggancio', nome: 'Mirino che aggancia', gruppo: 'oggetto', info: 'quattro angoli si stringono sull\'oggetto: AGGANCIATO', durata: 4,
    campi: [T('etichetta', 'Scritta', 'AGGANCIATO'), C('colore', 'Colore', '#5dffb4'), N('dim', 'Grandezza', 100, 30, 300, 5)] },
  { id: 'ob-emoji', nome: 'Emoji sull\'oggetto', gruppo: 'oggetto', info: 'un\'emoji grande che rimbalza', durata: 3,
    campi: [T('emoji', 'Emoji (o parola)', '😂'), N('dim', 'Grandezza', 100, 30, 300, 5)] },
  { id: 'ob-riquadro', nome: 'Riquadro con etichetta', gruppo: 'oggetto', info: 'un riquadro che si disegna attorno, con l\'etichetta', durata: 4,
    campi: [T('etichetta', 'Etichetta', 'NUOVO'), C('colore', 'Colore', '#ffd54a'), N('dim', 'Grandezza', 100, 30, 300, 5)] },
];

export const animazione = (id: string) => ANIMAZIONI.find((a) => a.id === id);
export const animazioniDi = (g: GruppoAnim) => ANIMAZIONI.filter((a) => a.gruppo === g);

/** i valori di partenza di un'animazione */
export function valoriDiPartenza(a: Anim): Record<string, string | number | boolean> {
  return Object.fromEntries(a.campi.map((c) => [c.id, c.def]));
}

/** una specifica nuova (con i valori di partenza) */
export function nuovaAnim(id: string, v: Record<string, string | number | boolean> = {}): AnimSpec {
  const a = animazione(id) ?? ANIMAZIONI[0];
  return { id: a.id, v: { ...valoriDiPartenza(a), ...v } };
}

/** i valori completi di una specifica (quelli mancanti si prendono dai valori di partenza: i progetti vecchi reggono) */
export function valoriDi(spec: AnimSpec): Record<string, string | number | boolean> {
  const a = animazione(spec.id);
  return { ...(a ? valoriDiPartenza(a) : {}), ...spec.v };
}
