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
  { p: 42, nome: '42 · Diagonale opposta', info: 'di traverso, dall\'altra parte' },
  { p: 61, nome: '61 · Freccia', info: 'una punta di freccia che avanza' },
  { p: 62, nome: '62 · Freccia rovesciata', info: 'la punta arriva dai lati' },
  { p: 103, nome: '103 · Croce', info: 'si apre lungo gli assi e poi negli angoli' },
  { p: 122, nome: '122 · Onda', info: 'il bordo della tendina ondeggia' },
  { p: 123, nome: '123 · Zigzag', info: 'il bordo è una sega' },
  { p: 202, nome: '202 · Ventaglio', info: 'tre lancette che girano insieme' },
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
  { p: 531, nome: 'Persiane', info: 'le stecche girano una dopo l\'altra' },
  { p: 541, nome: 'Scacchiera', info: 'le caselle si girano a caso' },
  { p: 551, nome: 'Tuffo', info: 'la vecchia si allontana girando, la nuova arriva da dietro' },
  { p: 561, nome: 'Inchiostro', info: 'la nuova si spande come una goccia nell\'acqua' },
  { p: 571, nome: 'Colori sdoppiati', info: 'entra di lato col rosso e il blu che scappano' },
  { p: 581, nome: 'Bolle', info: 'tanti cerchi si aprono e si uniscono' },
  { p: 591, nome: 'Rimbalzo', info: 'la nuova cade dall\'alto e rimbalza' },
  { p: 601, nome: 'Pagina', info: 'la pagina si solleva e si rovescia: sotto c\'è la nuova' },
  { p: 611, nome: 'Frantumi', info: 'le piastrelle si girano e si rimpiccioliscono una dopo l\'altra' },
  { p: 621, nome: 'Spinta veloce', info: 'la nuova spinge via la vecchia, con la scia del movimento' },
  { p: 631, nome: 'Fette', info: 'strisce che scorrono una a destra e una a sinistra' },
  { p: 641, nome: 'Alveare', info: 'esagoni che si chiudono su se stessi' },
  { p: 651, nome: 'Onda d\'urto', info: 'un anello si allarga dal centro e piega l\'immagine' },
  { p: 661, nome: 'Nuvole', info: 'un fumo denso scioglie la vecchia nella nuova' },
  { p: 671, nome: 'Fuoco', info: 'la vecchia brucia e i bordi diventano brace' },
  { p: 681, nome: 'Rullino', info: 'la pellicola scorre coi fori ai lati' },
  { p: 691, nome: 'Diaframma', info: 'le lamelle si chiudono e si riaprono sulla nuova' },
  { p: 701, nome: 'Punti', info: 'tanti cerchi crescono e si uniscono, come un retino' },
  { p: 711, nome: 'Spirale', info: 'il braccio di una spirale spazza via la vecchia' },
  { p: 721, nome: 'Doppia esposizione', info: 'le due immagini si sovrappongono come due pose sulla stessa pellicola' },
  { p: 731, nome: 'TV che si spegne', info: 'si schiaccia in una riga, un puntino, e la nuova si apre da lì' },
  { p: 801, nome: 'Portoni 3D', info: 'due battenti si aprono come porte' },
  { p: 741, nome: 'Pioggia digitale', info: 'colonne di luce verde cadono e lasciano la nuova' },
  { p: 751, nome: 'Strappo', info: 'la carta si strappa e sotto c\'è la nuova' },
  { p: 761, nome: 'Vetro rotto', info: 'crepe, poi i pezzi cadono e scoprono la nuova' },
  { p: 771, nome: 'Sipario', info: 'la vecchia si apre come una tenda a pieghe' },
  { p: 781, nome: 'Anelli', info: 'cerchi concentrici girano e cambiano l\'immagine' },
  { p: 791, nome: 'Segnale perso', info: 'righe strappate, barre e neve: torna la nuova' },
  { p: 811, nome: 'Cola', info: 'la vecchia si scioglie e cola verso il basso' },
  { p: 831, nome: 'Lente', info: 'una lente d\'ingrandimento cresce e mostra la nuova' },
  { p: 841, nome: 'Spettro', info: 'i colori se ne vanno uno per volta: rosso, verde, blu' },
  { p: 861, nome: 'Cerniera', info: 'si apre come una zip dall\'alto e mostra la nuova' },
];

/** gli effetti digitali che hanno un verso: si possono girare di quarti di giro (la direzione) */
export const DIREZIONALI = new Set([311, 401, 411, 431, 481, 531, 591, 601, 621, 631, 681, 801, 741, 751, 811, 841, 861]);

export const nomeModello = (tipo: string, p: number) =>
  tipo === 'mix' ? 'Dissolvenza' : tipo === 'dip' ? 'Passaggio a colore'
    : (tipo === 'dve' ? EFFETTI : TENDINE).find((m) => m.p === p)?.nome ?? (tipo === 'dve' ? 'Effetto' : 'Tendina');

/** il tipo giusto per un numero di modello: da 300 in su sono effetti digitali */
export const tipoDi = (p: number): 'wipe' | 'dve' => (p >= 300 ? 'dve' : 'wipe');
