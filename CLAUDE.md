# DaProd Video — leggi questo per primo

Editor video "vecchio stile, moderno dentro" (ispirato a EDIUS e alle centraline a nastro). Interfaccia web
(TypeScript, niente framework) + app **Tauri 2 / Rust** per Windows, Mac e Android + versione prova su Pages.

- **Si scrive in italiano parlato**: commenti, CHANGELOG, README, messaggi dell'interfaccia. Nomi tecnici in inglese dove serve.
- **Una versione = `version` in `package.json` + voce in `CHANGELOG.md`.** Unita su `main`, la CI (`.github/workflows/app.yml`)
  compila EXE portatile e setup e il DMG e pubblica la release da sola (le prove girano ma non la fermano; **Android è in
  pausa**: il job c'è ma è spento con `if: false`). Il numero sale di 0.0.1 (1.0.9 → 1.1.0). Cammo vuole il push dritto su `main`.
- **Le prove si fanno girare**: `npm run build` e poi `node test/prove.mjs` (Chromium: WebM/VP9, niente H.264).
  `node test/foto.mjs` fa le foto in `test/.out/`: si guardano prima di pubblicare.
- I tasti numerici sono sacri: **1 taglia, 2 elimina** (li ha chiesti Cammo). **S** separa/unisce, **Q/W** tolgono lo scarto,
  la **rotella** va di un fotogramma col suono (Ctrl+rotella = zoom). Tutti i comandi stanno in `src/azioni.ts`.
- **Effetti a tempo e transizioni sono blocchetti sopra le clip**: clip `kind: 'fx'` sulle tracce video, disegnate
  in basso sulla riga, che **non occupano posto** (le regole "niente si copre" di `montaggio.ts` le saltano con
  `solida()`). Catalogo, calcolo per fotogramma e regole per posarli (`postoBlocco`: taglio, inizio, fine) in
  `src/core/blocchi.ts`; un blocco segue la clip su cui sta (`blocchiDi`). Gli effetti valgono per la loro traccia e
  per quelle sotto; le transizioni lavorano sul taglio della loro traccia (una transizione, un taglio). Ogni blocco
  può avere un **suono** (`fxb.suono`/`fxb.audio`, catalogo in `src/core/suoni.ts`, sintesi in `src/media/suoni.ts`)
  che suona nel monitor e nel mixaggio: **di partenza è spento** (`audio: false`), si accende dall'altoparlante;
  tasto destro sull'altoparlante = menu dei suoni, passandoci sopra si sentono (`VoceMenu.sopra`). La vecchia corsia
  `fx` e le `trIn/trOut` delle clip video si migrano all'apertura (`migraBlocchi`). L'audio legato si incrocia da
  solo (`conIncroci` in `src/media/audio.ts`).
- **Tutto si somma e si fonde**: più blocchi FX sullo stesso punto si combinano in `statoEffetti` (luce in "screen",
  zoom che si moltiplicano, distorsioni una dentro l'altra), e gli effetti della clip stanno in `fx.effetti` (una
  lista, non uno solo) e si sommano in `fxEffettivo` (`src/core/effettiClip.ts`; i look sono bit nello shader).
- **Menu e pannello**: i menu stanno sempre dentro lo schermo (`dentroLoSchermo` in `src/ui/dom.ts`, se no finiscono
  sotto la barra di Windows). Un clic su una clip o su un FX manda `dpv:proprieta` e il pannello di destra si apre;
  📌 lo tiene a tutta altezza (è la vista del tasto V, classe `lato-lungo`).
- **Più timeline** (`src/core/sequenze.ts`): quella aperta vive nei campi del progetto (tracce, clip, marcatori,
  attacco/stacco, sottotitoli) così tutto il resto non cambia; le altre aspettano in `p.sequenze`. Schede sopra la
  timeline. I sottotitoli hanno la loro riga **SOTT** fra video e audio (sposta, bordi, unisci, dividi:
  `src/core/sottotitoli.ts`).
- **LIVE** (`src/ui/live.ts`, F10): `getDisplayMedia` + microfono, `MediaRecorder` a pezzi (la PAUSA chiude un pezzo:
  non ci si fida della pausa del browser, alcuni lasciano il buco, né di quello che consegna allo stop: fette da
  250 ms e 600 ms di grazia, poi si taglia al punto premuto), Mediabunny cuce i pezzi in un file solo e l'app lo salva in Video/DaProd Video (`registrazione_percorso` in `lib.rs`; permessi del Mac in `src-tauri/Info.plist`). Nelle prove la sorgente è una tela finta (`impostaSorgenteLive(schermo, mic, webcam)`).
  La **webcam** ha il suo registratore (`nastro`), stesso taglio dello schermo, file suo, e va sulla traccia sopra
  come bolla (`bolla` in `src/core/cornici.ts`); sotto, con lo **stile presentazione**, un colore sfumato (`gen.color2`).
  Tasti R / Spazio / M (segni → marcatori) / F, presi prima di quelli del montaggio solo su LIVE; 3-2-1 (`opz.conto`,
  le prove vecchie lo spengono); telecomando = Document PiP nel browser, finestra piccola `setAlwaysOnTop` nell'app
  (permessi in `capabilities/default.json`). Le scelte stanno in localStorage `dpv-live`; le registrazioni vanno
  nella cartella *Registrazioni* e non propongono il formato del progetto.
- **Sposta e ingrandisci sull'immagine** (`src/ui/posiziona.ts`, dentro il monitor): clic sull'immagine sceglie la clip più
  in alto lì sotto (`riquadroClip` fa lo stesso conto del compositore; i titoli si stringono attorno alle lettere),
  trascina = sposta, angoli = grandezza, pallino = gira, aggancio al centro/bordi (Alt = libero). **Movimento**: `c.tfFine`
  = la posizione alla fine, `tfAl(c, lf)` in `src/core/progetto.ts` va da `tf` a `tfFine` con la S; movimenti pronti in
  `src/core/cornici.ts` (`movimentoPronto`). Gli **effetti col centro** (bolla, vortice, caleido, zoom, riflesso:
  `haCentro` in `blocchi.ts`) hanno `fxb.pos`/`fxb.posFine` (frazioni del quadro): il mirino sul monitor, `u_centro` e
  `u_sole` nello shader FX.
- **Transizioni che si sommano**: più blocchi sullo stesso taglio (`transizioniSul`) vanno in catena nel compositore
  (buffer 5 e 6): la prima fa A→B, le "effetto" (`eEffetto` in `piano.ts`: lampo, luce, onda, glitch…) si applicano sopra
  il risultato (vecchia = nuova = risultato), le altre vanno da A al risultato. `Strato.altre`.
- **Suono dentro le clip**: titoli, countdown e colori hanno `c.sfx` (come `fxb.suono/audio/volume`), suonato da
  `suoniFx` (il countdown con `bip` fa un colpo al secondo); in timeline l'altoparlante sulla clip (`altoparlanteClip`).
- **Angoli tondi e ombra** sono campi del Transform (`tf.angoli`, `tf.ombra`): lo shader del livello fa la distanza da
  un rettangolo arrotondato (`u_box`, `u_round`, `u_feather`) e l'ombra è una passata nera più grande prima della clip.
- **Contenitore a esplora risorse** (`src/ui/contenitore.ts`): albero a sinistra (`bin-cat[data-c]`: tutto, video,
  audio, immagini, `dir:<id>`, transizioni/`tr:*`, titoli/`tit:*`, effetti/`fx:*`), cartelle in `p.cartelle` e
  `m.cartella`; l'import va nella cartella aperta e da Video/Musica/Immagini filtra i file. Le anteprime al passaggio
  (`src/render/provino.ts`) usano i fotogrammi veri del cursore e del taglio dopo (canvas `.provino.vero`), fatti col
  montaggio "pulito" (solo riprese e colori: niente titoli, FX, transizioni, sottotitoli, logo); se lì è nero si prende
  il primo fotogramma buono più avanti. Le anteprime ferme delle transizioni si fermano dove si capisce (`anteprimaChiara`),
  quelle dei titoli sono il titolo vero disegnato piccolo. Titoli e
  countdown pronti in `src/core/generatori.ts`; il countdown conta N..1 (`numeroConto`) col bip legato.
- **Dissolvenze con la forma**: `c.curvaIn/curvaOut` (`Curva {k, s}`), `curvaFade`/`fadeAl`/`CURVE` in
  `src/core/progetto.ts`, uguali per volume e trasparenza; in timeline si piega la linea, tasto destro = menu.
- **.dpv e .daprod**: il .dpv è il progetto leggero (JSON, i media restano dove sono); il **.daprod** (`src/pacchetto.ts`)
  è uno zip stored (zip64 oltre i 4 GB) con `progetto.json`, `media/` e LEGGIMI. All'apertura i media si leggono da
  dentro lo zip (`m.dentro {off, len}` → `MediaRT.off/len`, `media_leggi` con l'offset); Rust copia i byte e il CRC
  (`pacchetto_copia`). Doppio clic sul file: `fileAssociations` + `file_di_avvio` / evento `apri-file`.
- **Tappe, stira, tracking (1.1.2)**: il movimento ha partenza (`tf`), arrivo (`tfFine`) e tappe di mezzo (`c.via`, `fxb.via`, t da 0 a 1);
  `tfAl`/`centroBlocco` passano da tutte con una Hermite monotona (`passaPer` in `progetto.ts`: con due tappe è la vecchia S).
  Fermo fra due tappe, trascinare sul monitor ne crea una (`Posiziona.creaTappa`). `Transform.sx` = larghezza stirata (shader:
  `u_size = dw*sx`); 8 maniglie in `posiziona.ts` (`ridimensiona`: il lato opposto resta fermo, Ctrl dal centro, Maiusc stira,
  `✂` ritaglia). **Tracking**: `src/media/traccia.ts` (correlazione normalizzata su 192 punti, ~20 Hz, avanti e indietro) mette
  `c.traccia`; `src/core/traccia.ts` dà `spostaTraccia`: `c.segue`/`fxb.segue` = la clip o il centro segue l'oggetto (tf è lo scarto),
  `c.stabilizza` = la ripresa si tiene ferma. `riquadroClip` e il compositore sommano lo stesso spostamento.
- **Effetti e transizioni nuovi (1.1.2)**: le quantità degli effetti nuovi sono `CAMPI_FX` in `blocchi.ts` (uniform `u_<nome>` in
  `FS_FX`); **sfocatura, scia e colori sdoppiati stanno nello stesso giro** (se no un effetto ne copre un altro: era il bug dei
  "sommati"). `fxb.ripeti` rifà l'inviluppo n volte. Transizioni digitali: `Transition.forza/dir/curva` (`u_forza`, `u_dir` gira
  l'effetto di quarti di giro con `gira()`, `u_curva`); i modelli con un verso sono in `DIREZIONALI` (`transizioni.ts`).
  Titoli: `sotto`, `ingresso/uscita` (in `motoTitolo`), `spaziatura`, `peso`; gli stili a lettere usano `rivela` come avanzamento.
- **LIVE con più finestre (1.1.2)**: `Regia` in `live.ts` disegna la finestra in onda (o due) in una tela di misura fissa con un
  Worker come battito e ne registra `captureStream`; `opz.finestre` (**di partenza spento**: `captureStream` di una tela dipende dalla pagina che disegna, e la registrazione diretta resta la strada provata), tasti N / 1-9 / L.
- **Timeline che cresce**: `kV()` in `src/ui/timeline.ts` (spazio libero × `zoomV`, Ctrl+Shift+rotella); nell'app
  Ctrl +/− fa `setZoom` della webview (nel browser lo zoom resta quello del browser: lo zoom CSS rompe i clic).
- TRASPARENZA (tasto B, era ELASTICO) = la linea gialla dell'opacità sui video; IN/OUT si vedono solo se ci sono (Alt+X o ✕).
- Si parte con **2 tracce video e 2 audio**. **Alt+Shift+trascina** = la clip e tutto quello dopo, su tutte le tracce.
  **V** = timeline stretta (la colonna di destra scende fino in fondo).
- **Sottotitoli AI**: Whisper via transformers.js in `src/media/voce.worker.ts` (libreria dalla CDN, modello da
  Hugging Face, entrambi al primo uso); `src/media/voce.ts` prende l'audio a 16 kHz e fa le righe. Nelle prove si usa
  un trascrittore finto (`impostaTrascrittore`): dal container non si raggiungono né la CDN né Hugging Face.
- **Aggiornamenti**: `src/ui/aggiornamenti.ts` (API delle release di GitHub, novità dal CHANGELOG che viaggia
  dentro l'app) e `src-tauri/src/aggiorna.rs` (scarica col `curl` di sistema e apre setup/portatile/DMG).
- **La riproduzione non deve mai bloccarsi**: `src/media/fotogrammi.ts` non butta un flusso che non ha ancora il primo
  fotogramma, e i proxy (`src/media/proxy.ts`) si fanno da soli per le riprese pesanti. L'export legge gli originali.
- **Il montaggio non copre mai niente** da solo: spostare, lasciare, incollare e i generatori usano il modo `libero`
  (`src/core/montaggio.ts`: si fermano contro le vicine o vanno su una traccia libera). Copre solo SOVR dal monitor.
  Le transizioni non cambiano la durata delle clip. Il taglio tocca solo le tracce accese (se ce ne sono).
- Una cosa sola, uguale ovunque: il piano del fotogramma (`src/render/piano.ts`) e il compositore (con il colore finale
  della pagina Finale, `src/render/colore.ts`) servono sia il monitor sia l'export; il grafo audio (`src/media/audio.ts`,
  con filtri e limitatore) sia la riproduzione sia il mixaggio.
- Il lato Rust (`src-tauri/src/lib.rs`) fa solo I/O: media a pezzi, export in streaming, progetti, autosalvataggio.
  Su Android i percorsi sono `content://` e passano da `tauri-plugin-fs`.
