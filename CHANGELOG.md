# Changelog DaProd Video 🎬

Tutte le versioni notevoli del banco di montaggio. Le date sono in formato AAAA-MM-GG.
Ogni versione pubblicata ha la sua [release GitHub](https://github.com/cammo22/DaProdVideo/releases) con le app
per Windows (portatile e installabile), Mac e Android, e va online su [GitHub Pages](https://cammo22.github.io/DaProdVideo/) come versione prova.

## [1.0.2] — 2026-09-24 · Istantanee e transizioni da regia digitale 📸

### Istantanea del fotogramma
- **P** fotografa il fotogramma sotto il cursore e lo mette **nel contenitore come immagine** ("Istantanea 00.00.05.12.png"). Dal **Recorder** si fotografa il montaggio intero, con titoli, trasparenze ed effetti; dal **Player** la sorgente a piena risoluzione. Il monitor fa il lampo come una macchina fotografica.
- L'istantanea si trascina nella timeline e **si allunga quanto vuoi** dal bordo. Oppure, nelle proprietà, il gruppo **Durata**: scrivi i secondi o usa **+1 s**, **+5 s**, **−1 s** e **fino alla prossima** (riempie il buco fino alla clip dopo).
- **Shift+P** fa il **fermo immagine**: due secondi dell'istantanea entrano al cursore e il resto del montaggio scorre avanti.
- Pulsante **FOTO** sui due monitor e nella pulsantiera, e nel menu della timeline (tasto destro).
- Le istantanee restano: nell'app si salvano nella cartella dei dati, nel browser dentro il browser. Riaprendo il progetto ci sono ancora.

### Transizioni nuove
- **Effetti digitali (DVE)**: spinta nelle quattro direzioni, scivola, **zoom incrociato** con la scia, **mosaico** dei DVE anni '90, **onda**, **lampo** bianco, **luce di pellicola**, **glitch**, **vortice**, **sfocata**, **cubo 3D** e **girata** (la cartolina che si gira).
- **Tendine a sagoma**: **stella** (120) e **cuore** (121), con bordo morbido e colorato.
- Il pannello Transizioni ha le **anteprime vere**: le disegna lo stesso shader del Recorder, e si muovono quando ci passi sopra.
- Nelle proprietà un solo menu **Modello** per tendine ed effetti. Nella timeline gli effetti digitali sono magenta e hanno il nome scritto sopra. Nella EDL escono come dissolvenza con la nota `* EFFETTO`.
- Col cursore dentro una transizione già messa, un clic su un'altra la cambia al volo.
- Il bordo delle tendine è più netto di serie.

### Rifiniture
- Il primo fotogramma nel Recorder dopo un import arriva subito: le miniature della timeline aspettano che il monitor e la riproduzione abbiano finito col decoder.
- **Versione prova nel browser**: anche i file che non si possono ritrovare dal disco (Firefox, Safari, file trascinati, istantanee) fino a 300 MB restano nel browser, così il progetto riparte senza ricollegarli. Con "Nuovo progetto" lo spazio si libera.

## [1.0.1] — 2026-09-24 · Rifiniture: Android, Mac e la versione prova online 🔧

### Correzioni
- **Android**: se chiudi il selettore dei file senza scegliere niente non esce più un errore; il selettore mostra video, audio e foto (prima i filtri per estensione non li capiva).
- **Foto senza estensione** (su Android arrivano come `content://…`): ora si riconoscono lo stesso e vanno nel contenitore come immagini.
- **Tono delle barre e 2-pop del countdown** vanno sulla prima traccia audio libera da A1 in giù (prima finivano su A4).
- **Montaggio dal Player** (`,` e `.`): un solo passo di annulla invece di due.
- **F11 nell'app** mette a schermo intero la finestra vera (prima solo la pagina).

### Pages
- La versione prova ora si pubblica sul ramo `gh-pages` a ogni merge.

## [1.0.0] — 2026-09-24 · Si accende la sala di montaggio 🎬

La prima versione: un banco di montaggio vecchio stile, moderno dentro.

### Il banco
- **Due monitor come in regia**: a sinistra il **Player** (la sorgente), a destra il **Recorder** (il programma). Timecode a sette segmenti, attacco/stacco, durata, barra di posizione, zone di sicurezza e il 4:3 dentro il 16:9.
- **La pulsantiera** sotto i monitor: **1 taglia**, **2 elimina**, **3 elimina e chiude il buco**, **4 separa audio e video**, **5 dissolvenza**, **6 tendina**, **7 passaggio al nero**, **8 dissolvenza in apertura e chiusura**. Spie per inserisci/sovrascrivi, ripple, calamita e linee elastiche.
- **Trasporto da videoregistratore**: Spazio, shuttle **J K L** (ripeti per accelerare fino a ×16), passo a passo, manopola **jog/shuttle** con la molla, loop fra attacco e stacco.
- **Il tastierino numerico scrive il timecode** sul monitor attivo, come in EDIUS ("1000" = 10 secondi, "+25" = avanti di 25 fotogrammi). Drop-frame a 29,97.

### Il montaggio
- **Timeline su tela**: miniature, forme d'onda, dissolvenze e transizioni disegnate sul taglio, marcatori, zona attacco-stacco, cursore che gira pagina.
- Sposti le clip trascinandole (anche di traccia), con la **calamita** sui tagli e sul cursore; **trim** dai bordi, **roll** con Shift sul taglio, **slip** con Alt, **ripple** con R o Ctrl.
- **Montaggio a tre punti** dal Player: **,** inserisci e **.** sovrascrivi (anche **[** e **]** sulle tastiere americane), con la "patch" delle tracce di destinazione. **Solleva** (Z) ed **estrai** (X), **abbina fotogramma** (F), **rivedi** con il preroll (Shift+R).
- **Livelli al volo**: trasparenza della clip (Alt+↑↓ di 10 in 10) e della traccia intera, **linee elastiche** per trasparenza e volume nel tempo.
- Annulla e ripeti fino a 200 passi. Copia, taglia e incolla le clip.

### Video
- Mixer video in **WebGL2**: livelli con trasparenza, posizione, scala, rotazione, ritaglio, riquadro (PiP).
- **Proc amp** come sul TBC (nero, guadagno, croma, fase), **chiave** di luminanza e **green/blue screen** con pulizia dei bordi.
- **Look**: VHS, pellicola, tubo catodico, bianco e nero, seppia.
- **Transizioni**: dissolvenza, passaggio a colore e le **tendine SMPTE** (1, 2, 3, 4, 21, 22, 41, 101, 102, 119 iride, 201 orologio, 7 veneziana) con bordo morbido e colorato.
- **Generatori**: barre colore SMPTE/EBU con tono a 1 kHz, countdown da pellicola con il 2-pop, nero, colore pieno.
- **Titolatrice**: titolo fisso, **sottopancia** stile TG, **rullo** dei titoli di coda e **crawl**.

### Audio
- **VU a lancetta** con l'inerzia vera (0 VU = −18 dBFS), led di picco e barra digitale.
- **Mixer**: fader, panorama, muto e solo per ogni traccia, livelli video per traccia, ascolto generale.
- Dissolvenze incrociate sui tagli, fade in/out, volume e panorama per clip.

### Strumenti e uscita
- **Forma d'onda** (IRE) e **vettorscopio** col fosforo verde.
- **Export** MP4 (H.264/AAC), MOV, WebM (VP9/Opus) e WAV, a piena risoluzione, metà, 720p o 4K. Nell'app il file si scrive mentre esce, senza tenerlo in memoria.
- **EDL CMX3600** per Resolve, Avid, Premiere ed EDIUS. **Fotogramma PNG** a piena risoluzione.
- **Progetti .dpv** e **autosalvataggio**: riapri e riparti da dove eri.
- Import di MP4, MOV, MKV, WebM, **MTS/M2TS delle videocamere AVCHD** (anche con audio AC-3), MP3, WAV, AAC, FLAC, OGG e immagini.

### App e prova
- **App Tauri 2 (Rust)** per Windows (portatile e installabile), Mac (universale) e Android: i file si leggono e si scrivono dal lato Rust.
- **Versione prova nel browser** su GitHub Pages, con il **montaggio dimostrativo** generato al volo (tre riprese, titoli, dissolvenze, iride).
- Vista telefono con un monitor alla volta, pulsantiera grande e fogli a scomparsa.
- **Mac con Safari vecchio**: se WebKit non sa decodificare l'audio AAC/MP3/FLAC dei video, ci pensa Rust (Symphonia).
- **Trascina dal contenitore alla timeline anche col dito** (tieni premuto e trascina) e nell'app Windows.
- Prove automatiche (`test/prove.mjs`): il banco usato da solo in Chromium, dal taglio all'export riletto.

---

Confronto tra versioni: [tags](https://github.com/cammo22/DaProdVideo/tags) · [releases](https://github.com/cammo22/DaProdVideo/releases)
