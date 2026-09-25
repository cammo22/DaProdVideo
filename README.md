# DaProd · Video 🎬

[![▶ PROVA ORA](https://img.shields.io/badge/%E2%96%B6_PROVA_ORA-DaProd_Video-ffd54a?style=for-the-badge&labelColor=1a1428)](https://cammo22.github.io/DaProdVideo/app/)

[![Home](https://img.shields.io/badge/GitHub_Pages-la_home-success?style=flat-square)](https://cammo22.github.io/DaProdVideo/)
[![Release](https://img.shields.io/github/v/release/cammo22/DaProdVideo?style=flat-square&label=release&color=ff3df2)](https://github.com/cammo22/DaProdVideo/releases/latest)
[![Changelog](https://img.shields.io/badge/📅_Changelog-mantenuto-ffab00?style=flat-square)](CHANGELOG.md)
[![Tauri 2](https://img.shields.io/badge/Tauri_2-Rust-24c8db?style=flat-square&logo=tauri)](https://tauri.app/)
[![Licenza MIT](https://img.shields.io/badge/Licenza-MIT-blue?style=flat-square)](LICENSE)

Il **banco di montaggio DaProd**: vecchio stile, moderno dentro. Un monitor grande, il **contenitore** con
tutto in ordine (passa il mouse su un video e scorre), la **pulsantiera** con i tasti grandi, i **VU a
lancetta**, la **corsia FX** con effetti e transizioni a blocchetti, la titolatrice, i **proxy automatici** per
andare lisci anche coi file pesanti, la **pagina Finale** per colore, sottotitoli e logo su tutto il montaggio,
e la **EDL**. Cursore sul punto, premi **1** e tagli, premi **2** ed elimini. Gira su **Windows, Mac e
Android** e, in versione prova, **nel browser**.

![Il banco di montaggio](risorse/schermata.png)

| La pagina Finale: il menu a destra, colore, sottotitoli, logo | Il contenitore: effetti a blocchetti da trascinare |
| --- | --- |
| ![Pagina Finale](risorse/finale.png) | ![Contenitore](risorse/contenitore.png) |

| Il cubo 3D | Transizioni e proprietà |
| --- | --- |
| ![Cubo 3D](risorse/cubo.png) | ![Pannello Transizioni](risorse/schermata-transizioni.png) |

## ▶ Come si monta

1. **Importa** i video (pulsante *Importa*, `Ctrl+I`, o trascinali nel contenitore). Il primo video decide il formato del progetto.
2. Nel **contenitore** passa il mouse su un video: scorre avanti e indietro col puntatore. **Trascinalo** nella timeline, o premi **+** per metterlo al cursore (e il cursore va alla fine: +, +, + e hai la scaletta). Se lì è occupato va su una traccia libera: **niente viene coperto**.
3. Vuoi scegliere il pezzo? **Doppio clic**: si apre nel monitor come **sorgente**. Segna **attacco** (`I`) e **stacco** (`O`) e premi **`,`** (inserisci) o **`.`** (sovrascrivi). **Tab** torna al montaggio.
4. Cursore dove vuoi (la **rotella** va di un fotogramma alla volta, col suono) e **`1`**: taglio. Il pezzo più corto è già scelto: **`2`** e via, e si passa alla clip dopo. **`Q`** / **`W`** tolgono lo scarto a sinistra / a destra del cursore.
5. **Accendi le tracce** (clic sul nome) e il taglio tocca solo quelle. **`S`** separa l'audio dal video, o unisce più clip in un gruppo.
6. **Effetti e transizioni sono blocchetti** nella **corsia FX** in cima alla timeline (alta la metà del video). Trascina un **effetto** (lampo, scossa, zoom colpo, glitch, dal nero, zoom lento, camera a mano, bande cinema…) sopra le clip o su un taglio: vale per tutto quello che ci sta sotto. Trascina una **transizione** (dissolvenza, passaggio al nero, spinta, zoom, mosaico, **cubo 3D**, girata, onda, lampo, glitch, tendine SMPTE con stella e cuore) vicino a un taglio: si centra da sola, e **più è lunga più è lenta**. Le clip non cambiano mai durata. La durata si sceglie coi chip (Auto, 0,5 · 1 · 2 · 5 · 10 s) e poi si tira dai bordi.
7. Il **volume** è la linea gialla sulle clip audio: trascinala, doppio clic per un punto, tasto destro → *Abbassa qui*. I **quadratini in alto** agli angoli di ogni clip sono le dissolvenze: tirali verso l'interno. **Fade in, fade out, incrocio, eco, ovattato** si trascinano dal contenitore sulle clip audio. Il tasto **fx** in fondo alla clip accende gli effetti al volo.
8. **`F9`** apre la pagina **Finale**, col suo menu a destra: **colore** (automatico su tutto, look, ritocchi, prima/dopo), **audio** finale col limitatore, **sottotitoli** (i tempi li prepara il programma ascoltando dove si parla; importa ed esporta .srt), **logo** sempre in vista, **apertura** e chiusura (clip, titoli, dal nero e al nero), **lingue e AI** (predisposte) ed **esporta** (MP4, MOV, WebM, WAV, EDL, .srt).
9. **`P`** fa un'**istantanea** del fotogramma nel contenitore, da allungare quanto vuoi (**`Shift+P`**: fermo immagine al cursore).

### 🎛 La pulsantiera

| Tasto | Cosa fa | Tasto | Cosa fa |
| --- | --- | --- | --- |
| **1** | taglia al cursore (le tracce accese, o tutte) e sceglie il pezzo più corto | **5** | dissolvenza incrociata sul taglio più vicino |
| **2** | elimina la clip scelta (con la sua audio) e passa alla dopo | **6** | tendina sul taglio |
| **3** | elimina e chiude il buco (ripple) | **7** | passaggio al nero |
| **S** (o **4**) | separa un gruppo / unisce più clip in un gruppo | **8** | dissolvenza in apertura e chiusura |
| **Q** | via lo scarto a sinistra del cursore | **W** | via lo scarto a destra del cursore |

| Tasto | Cosa fa | Tasto | Cosa fa |
| --- | --- | --- | --- |
| `Spazio` | play / stop | `J` `K` `L` | shuttle indietro, fermo, avanti (ripeti: ×2 ×4 ×8 ×16) |
| `←` `→` rotella | un fotogramma, col suono (`Shift+←→`: un secondo) | `↑` `↓` | taglio precedente / successivo |
| `I` `O` | attacco e stacco (sul monitor) | `Shift+Q` | attacco e stacco sulla clip sotto il cursore |
| `,` `.` | inserisci / sovrascrivi dalla sorgente (`[` `]` su tastiera USA) | `E` `Invio` | EDIT nel modo attivo |
| `Z` `X` | solleva / estrai fra attacco e stacco | `Shift+R` | rivedi l'ultimo montaggio con il preroll |
| `Tab` | monitor: sorgente ↔ montaggio | `F` | abbina fotogramma (la sorgente nel monitor) |
| `Ins` | modo libero / inserisci | `R` `N` `B` | ripple, calamita, linee elastiche (trasparenza) |
| `F9` | pagina Montaggio ↔ pagina **Finale** | `G` | zone di sicurezza |
| `M` | marcatore | `T` | titolo al cursore |
| `P` | **istantanea** del fotogramma nel contenitore | `Shift+P` | **fermo immagine** di 2 s al cursore |
| `Ctrl+Z` `Ctrl+Y` | annulla / ripeti (200 passi) | `Ctrl+C` `X` `V` | copia, taglia, incolla le clip |
| tastierino `0-9` | scrive il timecode (`1000` = 10 s, `+25`) | `F1` | tutti i tasti |

Con il mouse: **trascina** per spostare (anche di traccia: si ferma contro le vicine, non copre niente), i
**bordi** per il trim, **Shift** sul taglio per il roll, **Alt** per lo slip, **Ctrl** per il trim ripple.
**Rotella** = un fotogramma per scatto col suono, **Ctrl+rotella** = zoom, **Shift+rotella** = scorri,
**Alt+rotella** = su e giù fra le tracce. **Tasto destro** sulla clip: elimina lo scarto a sinistra/destra di
quel punto, transizioni all'inizio e alla fine, effetti a tempo, *Abbassa qui*; sul **blocchetto FX**: durata,
centra sul taglio, cambia, colore, "ripeti subito dopo". La **barra in fondo è un navigatore**: trascina la
finestra gialla per scorrere, tira i suoi bordi per lo zoom. Ogni bordo fra i pannelli si trascina
(doppio clic lo chiude). **Doppio clic sull'immagine**: schermo intero con la timeline in piccolo e i VU.
Sul telefono: tocco = cursore, **tieni premuto** e trascina per spostare, **due dita** per lo zoom.

## 📥 App per Windows, Mac e Android

Ogni [release](https://github.com/cammo22/DaProdVideo/releases/latest) ha quattro file:

| | File | Come si usa |
| --- | --- | --- |
| 🪟 Windows | `DaProd-Video-X.Y.Z-portatile.exe` | niente installazione: doppio clic e parte. Se SmartScreen avvisa: *Ulteriori informazioni → Esegui comunque* |
| 💿 Windows | `DaProd-Video-X.Y.Z-setup.exe` | installa con il collegamento nel menu Start (senza permessi di amministratore) |
| 🍎 Mac | `DaProd-Video-X.Y.Z.dmg` | trascina in Applicazioni; la prima volta *tasto destro → Apri* (su Sequoia: *Impostazioni → Privacy e sicurezza → Apri comunque*) |
| 🤖 Android | `DaProd-Video-X.Y.Z.apk` | aprilo sul telefono e consenti l'installazione da origini sconosciute |

Le app sono fatte con **Tauri 2**: l'interfaccia gira nel motore web del sistema (WebView2 su Windows, WebKit
su Mac, Chromium su Android) e i file li legge e li scrive **Rust**. Pesano pochi MB, leggono ore di girato a
pezzi senza caricarle in memoria, scrivono l'export mentre esce e **riprendono il montaggio da dove eri**.
Requisiti: Windows 10/11, macOS 14 o più nuovo con Safari aggiornato (per l'audio serve WebKit 26), Android 8+.

**È tutto automatico** (`.github/workflows/app.yml`): quando su `main` arriva una versione nuova (il campo
`version` di `package.json`), GitHub Actions fa le prove, compila EXE, DMG e APK e pubblica da sola la release
`vX.Y.Z` con le note prese dal CHANGELOG. Per una versione nuova basta alzare `version`, scrivere la voce nel
CHANGELOG e unire.

Per firmare l'APK con una chiave tua aggiungi ai segreti del repository `ANDROID_KEYSTORE_BASE64`,
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD`. Senza, la CI usa una chiave che tiene
nella sua cache (resta uguale fra le release, così gli aggiornamenti si installano sopra).

## 🌐 La versione prova su GitHub Pages

[`cammo22.github.io/DaProdVideo`](https://cammo22.github.io/DaProdVideo/) è la home; il banco è in
[`/app/`](https://cammo22.github.io/DaProdVideo/app/). È **completo** (montaggio, effetti, export), con
il **montaggio dimostrativo** generato al volo per provarlo senza file. I limiti sono quelli del browser:

- serve **Chrome, Edge, Brave, Opera** (anche su Android) o **Safari 26**: il motore è WebCodecs;
- i file restano nel browser: riaprendo, Chrome ed Edge chiedono di ridare il permesso (*File → Ricollega media*), gli altri di sceglierli di nuovo;
- l'export senza "Salva con nome" (Firefox, Safari) passa dalla memoria: per montaggi lunghi meglio l'app.

Ogni merge su `main` ricompila la home e il banco e li mette sul ramo `gh-pages` (`.github/workflows/pages.yml`).
Se il sito non si accende da solo, una volta sola: *Settings → Pages → Deploy from a branch → `gh-pages` / (root)*.

## 🛠 Come è fatto

| Pezzo | Con cosa |
| --- | --- |
| Lettura e scrittura dei media | [Mediabunny](https://mediabunny.dev) (MP4, MOV, MKV, WebM, MPEG-TS/AVCHD, MP3, WAV, FLAC, OGG) su **WebCodecs**, decodifica e codifica hardware; AC-3 delle videocamere con il decoder WASM; **proxy automatici** (960 px, un fotogramma chiave ogni mezzo secondo) fatti dietro le quinte e conservati nel disco privato (OPFS) |
| Mixer video | **WebGL2**: un buffer per strato, trasformazioni, proc amp, chiave, look, tendine SMPTE, effetti digitali e dissolvenze negli shader; il passaggio degli **effetti a tempo** della corsia FX; colore automatico misurato su ogni ripresa, un passaggio finale per il colore di tutto il montaggio, e sopra a tutto logo e sottotitoli |
| Audio | **Web Audio**: volume e incroci come inviluppi, filtri per la voce, limitatore finale, audio a colpetti quando vai di fotogramma in fotogramma, VU dalla scheda audio, mixaggio dell'export a pezzi con `OfflineAudioContext` |
| Timeline | una sola **tela 2D** ridisegnata solo quando serve; miniature a potenze di due (zoomando si riusano) e forma d'onda a 100 picchi al secondo |
| Modello | fotogrammi interi sulla timeline (come le centraline a nastro), annulla a fotografie del progetto |
| App | **Tauri 2 / Rust**: `src-tauri/src/lib.rs` legge i media a pezzi, scrive l'export in streaming (anche `content://` su Android), salva progetti e autosalvataggio |

```bash
npm install
npm run dev            # il banco in http://localhost:5173/app/
npm run build          # dist/: home + banco (quello che va su Pages e dentro le app)
npm run tauri dev      # l'app desktop in sviluppo (serve Rust)
npm run tauri build    # l'app desktop di rilascio
```

### ✅ Controlli automatici

```bash
npm run build
npx playwright install chromium
node test/prove.mjs    # oltre 110 prove: timecode, 1 taglia (e sceglie il pezzo corto), 2 elimina (e passa alla
                       # dopo), S separa/unisce, Q e W, tracce accese, rotella, niente viene coperto, volume
                       # trascinato, corsia FX (effetti e transizioni a blocchetti), maniglie delle dissolvenze,
                       # navigatore, pagina Finale (sottotitoli, logo, apertura), istantanea, tre punti dalla
                       # sorgente, play dal mezzo di una ripresa col GOP lungo e proxy, EDL, export WebM riletto
node test/foto.mjs     # foto del banco (computer, Finale, contenitore, telefono) in test/.out/
```

### 📁 Dove sta cosa

- `src/core/` il modello: tipi, timecode (anche drop-frame), operazioni di montaggio, annulla, la corsia FX (`blocchi.ts`), i sottotitoli.
- `src/media/` Mediabunny: contenitore, fotogrammi (flusso e ricerca), proxy automatici, banco audio.
- `src/render/` il piano di ogni fotogramma e il mixer WebGL2 (effetti a tempo, colore automatico e colore finale, logo e sottotitoli), titolatrice e countdown.
- `src/ui/` timeline, monitor, pulsantiera, contenitore, proprietà, pagina Finale, mixer e VU, strumenti, finestre.
- `src/azioni.ts` tutti i comandi con i loro tasti · `src/effetti.ts` gli effetti al volo · `src/export/` export ed EDL · `src/demo.ts` il montaggio dimostrativo.
- `src-tauri/` l'app Rust, con `gen/android` per l'APK · `test/` le prove.
