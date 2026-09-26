// Il catalogo delle transizioni: le tendine SMPTE del mixer video e gli effetti digitali (il "DVE" delle
// regie). Un posto solo: lo usano lo shader, il pannello Transizioni, le proprietà, la timeline e la EDL.

export interface Modello { p: number; nome: string; info: string }

/** tendine: il numero è quello SMPTE (o quasi) */
export const TENDINE: Modello[] = [
  { p: 1, nome: '1 · Orizzontale', info: 'da sinistra a destra' },
  { p: 2, nome: '2 · Verticale', info: 'dall\'alto in basso' },
  { p: 3, nome: '3 · Angolo', info: 'dall\'angolo in alto a sinistra' },
  { p: 4, nome: '4 · Angolo destro', info: 'dall\'angolo in alto a destra' },
  { p: 21, nome: '21 · Porta', info: 'si apre dal centro in orizzontale' },
  { p: 22, nome: '22 · Porta orizzontale', info: 'si apre dal centro in verticale' },
  { p: 41, nome: '41 · Diagonale', info: 'di traverso' },
  { p: 101, nome: '101 · Scatola', info: 'un quadrato che cresce dal centro' },
  { p: 102, nome: '102 · Rombo', info: 'un diamante dal centro' },
  { p: 119, nome: '119 · Iride', info: 'il cerchio del cinema muto' },
  { p: 120, nome: '120 · Stella', info: 'una stella a cinque punte che cresce' },
  { p: 121, nome: '121 · Cuore', info: 'per i matrimoni, come si faceva una volta' },
  { p: 201, nome: '201 · Orologio', info: 'la lancetta che gira' },
  { p: 7, nome: '7 · Veneziana', info: 'a strisce' },
];

/** effetti digitali: la seconda immagine si muove, si piega, si scompone */
export const EFFETTI: Modello[] = [
  { p: 301, nome: 'Spinta ←', info: 'la nuova entra da destra e spinge via la vecchia' },
  { p: 302, nome: 'Spinta →', info: 'entra da sinistra e spinge' },
  { p: 303, nome: 'Spinta ↑', info: 'sale da sotto e spinge in alto' },
  { p: 304, nome: 'Spinta ↓', info: 'scende dall\'alto e spinge in basso' },
  { p: 311, nome: 'Scivola', info: 'la nuova scivola sopra la vecchia' },
  { p: 321, nome: 'Zoom incrociato', info: 'si entra dentro l\'immagine, con la scia' },
  { p: 331, nome: 'Mosaico', info: 'i quadratoni del DVE anni \'90' },
  { p: 341, nome: 'Onda', info: 'l\'immagine si increspa come l\'acqua' },
  { p: 351, nome: 'Lampo', info: 'un flash bianco sul taglio' },
  { p: 361, nome: 'Luce di pellicola', info: 'la bruciatura calda del film' },
  { p: 371, nome: 'Glitch', info: 'righe che saltano e colori che scappano' },
  { p: 381, nome: 'Vortice', info: 'gira come l\'acqua nel lavandino' },
  { p: 391, nome: 'Sfocata', info: 'si sfoca, cambia, torna a fuoco' },
  { p: 401, nome: 'Cubo 3D', info: 'le due immagini sono le facce di un cubo che ruota' },
  { p: 411, nome: 'Girata', info: 'la cartolina si gira: dietro c\'è la nuova' },
  { p: 421, nome: 'Zoom sfocato', info: 'si entra di corsa, con la scia' },
  { p: 431, nome: 'Frusta', info: 'la camera gira di scatto (whip pan)' },
  { p: 441, nome: 'Rotazione', info: 'la vecchia gira via, la nuova arriva girando' },
  { p: 451, nome: 'Lama di luce', info: 'una striscia bianca spazza via la vecchia' },
  { p: 461, nome: 'Caleidoscopio', info: 'si piega a spicchi e si riapre nuova' },
  { p: 471, nome: 'Aria calda', info: 'trema come l\'asfalto e si scioglie' },
  { p: 481, nome: 'Tenda', info: 'la vecchia si apre in due dal centro' },
  { p: 491, nome: 'Sovraesposta', info: 'un colpo di luce e sei dall\'altra parte' },
  { p: 521, nome: 'Polvere', info: 'la vecchia si sgretola in granelli' },
];

export const nomeModello = (tipo: string, p: number) =>
  tipo === 'mix' ? 'Dissolvenza' : tipo === 'dip' ? 'Passaggio a colore'
    : (tipo === 'dve' ? EFFETTI : TENDINE).find((m) => m.p === p)?.nome ?? (tipo === 'dve' ? 'Effetto' : 'Tendina');

/** il tipo giusto per un numero di modello: da 300 in su sono effetti digitali */
export const tipoDi = (p: number): 'wipe' | 'dve' => (p >= 300 ? 'dve' : 'wipe');
