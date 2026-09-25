# Changelog DaProd Video 🎬

Tutte le versioni notevoli del banco di montaggio. Le date sono in formato AAAA-MM-GG.
Ogni versione pubblicata ha la sua [release GitHub](https://github.com/cammo22/DaProdVideo/releases) con le app
per Windows (portatile e installabile), Mac e Android, e va online su [GitHub Pages](https://cammo22.github.io/DaProdVideo/) come versione prova.

## [1.0.5] — 2026-09-25 · FX sopra le clip, coi loro suoni, e i sottotitoli che li scrive l'AI ✨

### Gli FX stanno sopra le clip (niente più corsia a parte)
- **Effetti e transizioni sono blocchetti sulla traccia video**, in una striscia sottile in basso sulla clip. La corsia FX in cima non c'è più: i progetti di prima si sistemano da soli all'apertura.
- **Si attaccano da soli**: lasci un effetto vicino all'inizio della clip e parte con lei, vicino alla fine e finisce con lei, proprio sul taglio fra due clip e si centra lì. Lontano dai bordi resta dove l'hai lasciato. Mentre lo trascini vedi dove va ("all'inizio della clip", "sul taglio"…).
- **Poi si allunga dai bordi** per sistemare i tempi. Anche spostandolo si aggancia a inizio, fine e tagli.
- **Seguono la clip**: sposti la clip (anche su un'altra traccia) e i suoi FX vanno con lei; la elimini e se ne vanno con lei; tagli l'inizio o la fine e quello attaccato al bordo resta attaccato.
- **Non occupano posto**: due FX sullo stesso punto si mettono uno sopra l'altro, e non spostano mai una clip.
- **Valgono per la loro traccia e per quelle sotto**: uno zoom lento sulla V1 muove la ripresa ma non il titolo sulla V2; un lampo sulla V2 illumina tutto.

### Gli FX hanno il loro suono 🔊
- **Tredici suoni fatti apposta**, dentro il programma (niente file, niente diritti): whoosh, swish rapido, impatto, colpo secco, zap di luce, glitch, scatto della macchina foto, salita, discesa, nastro che si ferma, battito, campanella, piatto al contrario.
- **Ogni FX ha già quello giusto**: il cubo e le spinte col whoosh, le tendine con lo swish, il lampo con lo zap, la scossa con l'impatto, il glitch col glitch, "al bianco" con la salita… (le dissolvenze e gli effetti lunghi restano muti).
- **Il colpo cade sul punto giusto**: sul taglio, sul lampo, alla fine di chi sale.
- **L'altoparlante sul blocco**: un clic lo spegne, un altro lo riaccende (e te lo fa sentire). **Tasto destro → Suono**: scegline un altro, o piano / medio / normale / forte. Anche nelle proprietà del blocco, con "▶ Ascolta".
- Si sentono nel monitor e **finiscono nell'export**.

### La timeline
- **Si parte con 2 tracce video e 2 audio** (le altre si aggiungono da sole quando servono, o col "+").
- **La barra a destra** per scorrere su e giù fra le tracce, sempre lì: trascinala, o clic per saltare.
- **Alt+Shift+trascina** (come in EDIUS): sposti la clip **e tutto quello che viene dopo, su tutte le tracce**, insieme. Per fare spazio o stringere in un colpo solo.
- **Tasto V: timeline stretta**. Proprietà, mixer e VU scendono fino in fondo a destra e la timeline si stringe; di nuovo V e torna larga. C'è anche il tasto nell'angolo della timeline e in *Vista*.

### I sottotitoli li scrive l'AI 💬
- **Finale → Sottotitoli → "✨ Scrivi i sottotitoli con l'AI"**: Whisper ascolta la presa diretta (non la musica) e scrive le righe **coi loro tempi**.
- **Italiano o inglese**, e da un parlato italiano **direttamente in inglese**.
- **Tre modelli**: Veloce (40 MB), Buono (80 MB), Preciso (250 MB). Si scarica **una volta sola** da Hugging Face e poi resta sul computer; va con la scheda video se può.
- **L'audio non esce mai dal computer**: il lavoro si fa tutto lì.
- Le frasi lunghe si spezzano in righe che si leggono in fretta, "[Musica]" e simili si saltano. Si vede a che punto è, si può fermare, e Ctrl+Z torna a prima.
- In *Lingue e AI* i tasti ora funzionano (resta "in arrivo" solo la voce in un'altra lingua).

### Aggiornamenti e novità
- **Nell'app c'è il tasto Aggiornamenti** in alto: controlla se è uscita una versione nuova, ti fa leggere le novità e con un clic **scarica e apre** il file giusto (il setup per chi ha installato, l'exe portatile accanto a quello vecchio, il DMG sul Mac, l'APK sul telefono). Una volta al giorno controlla da solo e, se c'è, il tasto si accende.
- **Dopo un aggiornamento**, alla prima apertura, compaiono le **novità** della versione. Sempre anche da *Aiuto → Novità*.

## [1.0.4] — 2026-09-25 · La corsia FX, i proxy e il Finale con tutto al suo posto 🚀

### Il player non si blocca più
- **Trovato il colpevole**: premendo play a metà di una ripresa coi fotogrammi chiave radi (i video dei telefoni e dei generatori AI), il decoder ripartiva da capo a ogni fotogramma e l'immagine restava ferma fino al taglio dopo. Ora parte e va.
- **Il play aspetta un attimo il primo fotogramma** (al massimo un istante) e poi fa partire audio e video insieme: niente più partenze a scatti.
- **Proxy automatici**: appena una ripresa pesante entra nel contenitore (più grande di 720p, HEVC, o coi fotogrammi chiave lontani) il programma ne fa **da solo** una copia leggera per i monitor (al massimo 960 pixel, un fotogramma chiave ogni mezzo secondo). Si fa dietro le quinte, si mette in pausa mentre suoni, e si ricorda per la volta dopo. Da fermo, se il monitor è grande, arriva il fotogramma nitido dell'originale. **L'export usa sempre gli originali.**
- **La rotella in avanti costa un fotogramma solo**: il decoder continua da dove era invece di ripartire.
- L'audio delle riprese non accende più un decoder video che non serve.

### La corsia FX: effetti e transizioni a blocchetti
- In cima alla timeline c'è la **corsia FX**, **alta la metà del video**: ci stanno i **blocchetti**, facili da mettere in fila, allungare e spostare.
- **Effetti a tempo (magenta)**: trascinali **sopra le clip** o **proprio su un taglio** e valgono per tutto quello che ci sta sotto, per la durata del blocco.
  - **Rapidi**: lampo, lampo nero, scossa, zoom colpo, glitch, colori sdoppiati, negativo, stroboscopio, pixel, messa a fuoco, sfoca.
  - **Lunghi**: dal nero, al nero, dal bianco, al bianco, zoom lento, camera a mano, battito (a tempo di musica), luce calda, bande cinema, bianco e nero, torna il colore, disturbo VHS.
  - **Vicino a un taglio il lampo scoppia proprio lì**: il blocco si centra da solo sul taglio.
- **Transizioni (turchesi)**: il blocco sta sopra un taglio e passa da una clip all'altra. **Più è lungo, più è lenta.** Trascinala vicino a un taglio e si centra da sola. Sopra una transizione che c'è già, la cambia. **Le clip non cambiano mai durata.**
- **La durata** si sceglie coi chip nel contenitore (**Auto · 0,5 · 1 · 2 · 5 · 10 s**), poi si allunga o si accorcia dai bordi del blocco.
- **Tasto destro sul blocco**: durata, centra sul taglio, cambia effetto o transizione, colore del lampo, forza, "ripeti subito dopo".
- **Niente si copre**: se la corsia è occupata se ne apre un'altra (FX1, FX2…). L'occhio della corsia spegne tutti i suoi effetti.
- Nelle proprietà di una clip video, la sezione **Transizioni** mostra cosa c'è all'inizio e alla fine, e la mette con un clic.
- **L'audio legato si incrocia da solo** sotto la transizione. Tasti 5, 6, 7 come prima: dissolvenza, tendina, passaggio al nero sul taglio (di nuovo = la togli).
- **I progetti di prima si aggiornano da soli**: le transizioni attaccate alle clip diventano blocchetti.
- Nel contenitore ogni effetto ha la sua **anteprima animata** al passaggio del mouse.

### Audio al volo
- **Fade in, Fade out, Incrocio** (sul taglio fra due audio), **Eco** e **Ovattato**: trascinali sopra una clip audio, con la durata dei chip.
- **Le maniglie delle dissolvenze**: i quadratini in alto agli angoli di ogni clip. **Tirali verso l'interno** e la clip entra o esce in dissolvenza (video dal trasparente, audio dal silenzio).

### La timeline
- **La barra in fondo è un navigatore**: tutto il montaggio in piccolo e la finestra gialla di quello che vedi. **Trascina la finestra** per scorrere, **tira i suoi bordi** per lo zoom, clic fuori per andare lì.
- **Testate strette**: via manopole e decibel, resta il **misuratore che si muove** (una colonnina sul bordo). Il volume delle tracce sta nel mixer. Un tasto **"+"** aggiunge traccia video, audio o corsia FX.

### Il banco come lo vuoi tu
- **All'apertura**: contenitore largo a sinistra, monitor al centro, proprietà a destra, timeline sotto.
- **Pagina Finale**: monitor a sinistra, ritocchi larghi a destra, timeline sotto, e **un menu a destra** con le sue pagine:
  - **Colore**: colore automatico, look e ritocchi.
  - **Audio**: volume finale, limitatore, livella tutto.
  - **Sottotitoli**: "**Prepara i tempi dai dialoghi**" (il programma ascolta dove si parla e mette le righe vuote al punto giusto: tu scrivi e basta), "+ Riga al cursore", **importa ed esporta .srt**, grandezza, posizione, fascia. Scritti nel video, nel monitor e nell'export.
  - **Logo**: un'immagine del contenitore sempre in vista in un angolo, con grandezza e opacità (non prende il colore finale).
  - **Apertura**: una piccola clip all'inizio o alla fine, titolo d'apertura, titoli di coda, entra dal nero e chiudi nel nero (anche l'audio).
  - **Lingue e AI**: la lingua dei sottotitoli e, **predisposti**, i sottotitoli scritti dall'AI, la traduzione e il doppiaggio (in arrivo).
  - **Esporta**: il master, la EDL, il fotogramma e i sottotitoli .srt.

## [1.0.3] — 2026-09-25 · Un monitor solo, il contenitore nuovo e la pagina Finale 🎬

### Il banco rifatto
- **Un monitor solo**: mostra il montaggio (PROGRAMMA). Doppio clic su un file del contenitore e mostra la **SORGENTE**, con attacco, stacco e i tasti INS/SOVR; **Tab** o "⟵ MONTAGGIO" torna al programma.
- **Tutto si ridimensiona**: trascina i bordi fra contenitore, monitor, proprietà e timeline (doppio clic sul bordo chiude o riapre il pannello). Il banco si ricorda come l'hai sistemato; *Vista → Rimetti il banco come all'inizio* torna com'era.
- **Doppio clic sull'immagine = schermo intero**, con sotto la **timeline in piccolo** (clic per andare in un punto), il timecode, il play e i **VU a barre**.

### Il contenitore nuovo
- **Tutto in un posto, in ordine**: Tutto · Video · Musica · Immagini · Transizioni · Titoli · Effetti.
- Schede grandi con la locandina, la durata e quante volte la usi. **Passa il mouse su un video e scorre avanti e indietro** col puntatore: vedi al volo se è quello giusto.
- **"+" sulla scheda** la mette al cursore e porta il cursore alla fine: "+", "+", "+" e hai la scaletta.

### La timeline
- **Tracce più spesse**: l'audio più alto (si vede bene l'onda), il video più basso. I progetti di prima si aggiornano da soli.
- **Via i cursori a sinistra**: testate nuove con il nome grande, i tasti occhio/muto/solo/lucchetto e una **manopola** per trasparenza o volume della traccia (trascina su e giù, doppio clic = zero). Sulle tracce audio c'è la lucina del livello.
- **Tracce accese**: clic sul nome di una o più tracce e **il taglio (1) tocca solo quelle**, le altre restano intatte. Le tracce accese ricevono anche il montaggio dal monitor. Alt+clic = solo quella.
- **Il volume sempre in vista** sulle clip audio: la **linea gialla**. Trascinala su e giù; **doppio clic** mette un punto (doppio clic sul punto lo toglie); tasto destro → **"Abbassa qui"** o **"Alza qui"** fa la conca per due secondi e poi torna normale; "Volume normale" toglie tutto.
- **"fx" in fondo a ogni clip**: gli effetti al volo con la spunta, e un puntino per ogni effetto acceso.
- **Rotella = un fotogramma per scatto, col suono** (per tagliare sulla sillaba). **Ctrl+rotella** zoom, **Shift+rotella** scorre, **Alt+rotella** su e giù fra le tracce. Anche le frecce e il cursore trascinato fanno sentire l'audio.

### Il montaggio non mangia più niente
- **Spostare una clip non copre le altre**: si ferma attaccata alla vicina, come due mattoncini. La calamita resta. Anche i bordi (trim) si fermano contro la clip accanto.
- **Una ripresa lasciata dove è occupato va su una traccia libera** (o su una nuova, se servono): niente viene tagliato. Lo stesso per titoli, generatori e incolla. Solo **SOVR** dal monitor copre, come sulle centraline.
- Il modo della pulsantiera ora è **LIBERO / INSERISCI** (Ins).

### I tasti
- **S separa o unisce**: un gruppo scelto si separa (audio e video per conto loro); più clip o più gruppi scelti diventano **un gruppo solo** che si muove insieme. Anche **4** come prima.
- **1 taglia e sceglie il pezzo più corto** (quasi sempre lo scarto): premi **2** e sparisce.
- **2 elimina e passa alla clip dopo**: 2, 2, 2 pulisce di seguito.
- **Q** e **W**: via lo **scarto a sinistra** o **a destra** del cursore. Anche col tasto destro sulla clip, proprio nel punto dove clicchi.
- **F9**: pagina Montaggio ↔ pagina Finale. **Shift+Q** segna attacco e stacco sulla clip (prima era Q). Le frecce ↑↓ e PagSu/PagGiù vanno ai tagli (A e S non più).

### Transizioni che si mettono come i generatori
- **Clic sulla transizione** e va sul taglio più vicino al cursore, anche se non ci sei proprio sopra.
- **Trascinala** su un taglio, **su una clip** (va sul bordo più vicino) o **sul bordo libero** di una clip: all'inizio entra da quello che c'è sotto, alla fine **esce** (transizione in coda, nuova). Mentre la trascini si accende il punto dove cadrà.
- **Le clip non cambiano durata**: la transizione vive dentro la clip.

### Proprietà semplici
- In alto il **riassunto** (tipo, dove sta, quanto dura, da che file viene). Poi gli **effetti al volo** come interruttori: colore automatico, vivace, più luce, caldo, freddo, bianco e nero, seppia, pellicola, VHS, tubo catodico, vignetta, **zoom lento**, specchia, entra ed esce. Per l'audio: **livella il volume**, **voce chiara**, taglia bassi, radio/telefono, entra ed esce, muto.
- Poche regolazioni: opacità, zoom, luce, contrasto, saturazione, temperatura, volume, durata, transizioni in testa e in coda (½ s, 1 s, 2 s). Posizione, ritaglio e chiave sono in "Avanzate", chiuse.
- Gli stessi effetti sono nel contenitore (sezione Effetti): clic sulle clip scelte o **trascinali sopra una clip**.

### La pagina Finale
- Il montaggio intero nel monitor grande, la timeline sotto, e a destra i ritocchi che valgono per **tutto**:
  - **Riepilogo**: durata, quante clip, e cosa non va (file da ricollegare, **buchi neri**: clic e ci vai).
  - **Colore automatico** su tutte le riprese (acceso di serie): ogni ripresa viene misurata e nero, bianco e luce si sistemano da soli, così le clip si somigliano. Con la forza regolabile; una clip può fare eccezione dal suo "fx".
  - **Look**: naturale, cinema, caldo, freddo, vivace, vintage, bianco e nero, pellicola, notte, con l'intensità.
  - **Ritocchi**: luce, contrasto, saturazione, temperatura, tinta, vignetta, grana.
  - **PRIMA | DOPO**: a sinistra com'era, a destra col colore finale.
  - **Audio finale**: volume e **limitatore** (niente distorsione), e "Livella il volume di tutte le clip".
  - **Esporta**: formato, qualità e misura con un clic, poi ESPORTA IL MASTER. EDL e fotogramma PNG a portata di mano.
- Il colore finale e l'audio finale escono uguali nei monitor e nel file esportato.

### Correzioni
- **L'audio si abbassava piano piano fino alla fine della clip** (il "fade out automatico"): era un errore nell'inviluppo del volume, sistemato sia in riproduzione sia nell'export.
- Le clip audio non vengono più scambiate per video (nelle proprietà di un audio uscivano i comandi del video).
- Il fotogramma dell'anteprima nel contenitore si libera appena togli il mouse.

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
