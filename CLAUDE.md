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
- **Effetti a tempo e transizioni sono blocchetti** nella corsia FX (traccia `fx`, in cima, alta metà del video):
  catalogo, calcolo per fotogramma e regole per posarli in `src/core/blocchi.ts`. Le transizioni lavorano sul
  taglio sotto il blocco (una transizione, un taglio); le `trIn/trOut` delle clip video restano solo per i progetti
  vecchi, che si migrano all'apertura. L'audio legato si incrocia da solo (`conIncroci` in `src/media/audio.ts`).
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
