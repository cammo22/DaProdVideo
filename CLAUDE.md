# DaProd Video — leggi questo per primo

Editor video "vecchio stile, moderno dentro" (ispirato a EDIUS e alle centraline a nastro). Interfaccia web
(TypeScript, niente framework) + app **Tauri 2 / Rust** per Windows, Mac e Android + versione prova su Pages.

- **Si scrive in italiano parlato**: commenti, CHANGELOG, README, messaggi dell'interfaccia. Nomi tecnici in inglese dove serve.
- **Una versione = `version` in `package.json` + voce in `CHANGELOG.md`.** Unita su `main`, la CI (`.github/workflows/app.yml`)
  compila EXE portatile e setup, DMG, APK e pubblica la release da sola. Il numero sale di 0.0.1 (1.0.9 → 1.1.0).
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
  250 ms e 600 ms di grazia, poi si taglia al punto premuto), Mediabunny cuce i pezzi in un file solo e l'app lo salva in Video/DaProd Video (`registrazione_percorso` in `lib.rs`; permessi del Mac in `src-tauri/Info.plist`). Nelle prove la sorgente è una tela finta (`impostaSorgenteLive`).
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
