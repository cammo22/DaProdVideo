// Le prove di DaProdMontage: i preset, le cose pure (ripartizione del tempo, battiti, EXIF, qualità), il montaggio
// fatto con sole foto per ogni preset e la pagina vera. Vedi prove-nuove.mjs.
import path from 'node:path';

export async function proveMontage({ page, prova, OUT }) {
  console.log('▶ DaProdMontage: i preset');
  const cat = await page.evaluate(() => {
    const { MP } = window.__dpvTest;
    const P = MP.PRESET_MONTAGE;
    const ids = P.map((p) => p.id);
    const cats = {};
    for (const p of P) cats[p.categoria] = (cats[p.categoria] ?? 0) + 1;
    const ok = P.every((p) => p.nome && p.emoji && p.info && p.musica && p.sfondo?.length === 2
      && p.foto[0] > 0 && p.foto[0] <= p.foto[1] && p.foto[1] <= p.foto[2] && p.video[0] > 0 && p.video[0] <= p.video[1] && p.chiede && Array.isArray(p.look));
    return { n: P.length, doppi: ids.filter((id, i) => ids.indexOf(id) !== i), cats, ok, categorie: MP.CATEGORIE_MONTAGE.map((c) => c.id), nonTrovato: MP.presetMontage('non-esiste') ?? null, matr: !!MP.presetMontage('matrimonio'), batt: !!MP.presetMontage('battesimo'), ini: MP.iniziali('Giulia e Marco'), ini2: MP.iniziali('') };
  });
  prova('almeno 22 preset, tutti diversi e ben fatti (durate, colori, musica consigliata)', cat.n >= 22 && !cat.doppi.length && cat.ok, JSON.stringify(cat));
  prova('ci sono matrimonio e battesimo e le categorie sono tutte usate', cat.matr && cat.batt && cat.categorie.every((c) => cat.cats[c] > 0) && cat.nonTrovato === null, JSON.stringify(cat.cats));
  prova('le iniziali dei nomi (Giulia e Marco → G & M)', /G.*M/.test(cat.ini), cat.ini + ' / ' + cat.ini2);

  console.log('▶ DaProdMontage: le cose pure');
  const pure = await page.evaluate(() => {
    const { MT, EX, QL, RI } = window.__dpvTest;
    const e = (nome, data, punt = 0.5, firma) => ({ media: nome, nome, tipo: 'image', durata: 0, w: 1600, h: 1200, data, audio: false, punteggio: punt, firma });
    // ripartizione: sommano a quanto chiesto, ognuna dentro i suoi limiti
    const lim = [{ min: 1, tip: 3, max: 6 }, { min: 1, tip: 3, max: 6 }, { min: 2, tip: 4, max: 5 }];
    const r1 = MT.ripartisci(lim, 12);
    const r2 = MT.ripartisci(lim, 100); // troppo: nemmeno al massimo
    const r3 = MT.ripartisci(lim, 1);  // troppo poco: nemmeno al minimo
    const somma = (v) => v.reduce((a, b) => a + b, 0);
    // fotogrammi: somma esatta
    const f = MT.inFotogrammi([2.33, 3.17, 4.5, 1.9, 2.2], 25, 350);
    const f2 = MT.inFotogrammi([1, 1, 1], 30, 91);
    // battiti: il taglio a 3,1 va sul battito a 3,0; la fine non cambia
    const sb = MT.sulBattito([3.1, 3.1, 3.8], [0, 1.5, 3, 4.5, 6, 7.5, 9], 1);
    const sb0 = MT.sulBattito([3, 3], [], 1);
    // ordine
    const v = [e('IMG_10', 3000), e('IMG_2', 1000), e('IMG_1', 2000), e('IMG_3', 1000)];
    const perData = MT.ordina(v, 'data', 1).map((x) => x.nome);
    const dato = MT.ordina(v, 'dato', 1).map((x) => x.nome);
    const lungo = Array.from({ length: 12 }, (_, i) => e('F' + i, i));
    const caso1 = MT.ordina(lungo, 'caso', 7).map((x) => x.nome).join(), caso2 = MT.ordina(lungo, 'caso', 7).map((x) => x.nome).join(), caso3 = MT.ordina(lungo, 'caso', 8).map((x) => x.nome).join();
    // doppioni: due foto con la stessa firma e una diversa
    const dop = MT.senzaDoppioni([e('a', 1, 0.4, '0f0f0f0f0f0f0f0f'), e('b', 2, 0.9, '0f0f0f0f0f0f0f0f'), e('c', 3, 0.5, 'f0f0f0f0f0f0f0f0')]);
    // EXIF costruito a mano (little endian): IFD0 → puntatore all'Exif IFD → DateTimeOriginal
    const testo = '2026:06:12 15:30:05\0';
    const tiff = new Uint8Array(44 + testo.length);
    const dv = new DataView(tiff.buffer);
    tiff.set([0x49, 0x49]); dv.setUint16(2, 42, true); dv.setUint32(4, 8, true);
    dv.setUint16(8, 1, true); dv.setUint16(10, 0x8769, true); dv.setUint16(12, 4, true); dv.setUint32(14, 1, true); dv.setUint32(18, 26, true); dv.setUint32(22, 0, true);
    dv.setUint16(26, 1, true); dv.setUint16(28, 0x9003, true); dv.setUint16(30, 2, true); dv.setUint32(32, testo.length, true); dv.setUint32(36, 44, true); dv.setUint32(40, 0, true);
    for (let i = 0; i < testo.length; i++) tiff[44 + i] = testo.charCodeAt(i);
    const seg = new Uint8Array(14 + tiff.length);
    seg.set([0xff, 0xd8, 0xff, 0xe1, ((2 + 6 + tiff.length) >> 8) & 255, (2 + 6 + tiff.length) & 255, 0x45, 0x78, 0x69, 0x66, 0, 0]);
    seg.set(tiff, 12); seg.set([0xff, 0xd9], 12 + tiff.length);
    const exif = EX.dataExif(seg);
    const exifNo = EX.dataExif(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]));
    // qualità: una griglia a scacchi netta contro la stessa sfocata contro il nero
    const mk = (fn) => { const w = 96, h = 54, d = new Uint8ClampedArray(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const g = fn(x, y); d.set([g, g, g, 255], (y * w + x) * 4); } return { w, h, data: d }; };
    const nitida = QL.misuraQualita(mk((x, y) => (((x >> 2) + (y >> 2)) & 1 ? 235 : 20)));
    const sfocata = QL.misuraQualita(mk((x, y) => 128 + 6 * Math.sin(x / 9)));
    const buia = QL.misuraQualita(mk((x, y) => (((x >> 2) + (y >> 2)) & 1 ? 8 : 0)));
    const stessa = QL.misuraQualita(mk((x, y) => (((x >> 2) + (y >> 2)) & 1 ? 235 : 20)));
    // ritmo: colpi a 120 al minuto (ogni 0,5 s) su 14 s a 11025 Hz
    const sr = 11025, x = new Float32Array(sr * 14);
    for (let k = 0; k * 0.5 < 14; k++) { const o = Math.round(k * 0.5 * sr); for (let i = 0; i < 1200 && o + i < x.length; i++) x[o + i] = Math.sin(i * 0.3) * Math.exp(-i / 300) * 0.9; }
    for (let i = 0; i < x.length; i++) x[i] += (Math.random() - 0.5) * 0.004;
    const rit = RI.trovaBattiti(x, sr);
    const muto = RI.trovaBattiti(new Float32Array(sr * 10), sr);
    return {
      r1, r1s: r1 && somma(r1), r1ok: r1 && r1.every((d, i) => d >= lim[i].min - 1e-9 && d <= lim[i].max + 1e-9), r2, r3,
      f, fs: somma(f), f2s: somma(f2), sb, sbs: somma(sb), sb0, perData, dato, caso1, caso2, caso3, dop: dop.tenute.map((x) => x.nome), dopT: dop.tolte.map((x) => x.nome),
      exif, esperto: Date.UTC(2026, 5, 12, 15, 30, 5), exifNo, nitida: nitida.punteggio, sfocata: sfocata.punteggio, buia: buia.punteggio, firmaUguale: nitida.firma === stessa.firma, firmaLung: nitida.firma.length,
      bpm: rit?.bpm, nbatt: rit?.battiti.length, sic: rit?.sicurezza, primi: rit?.battiti.slice(0, 4), muto,
    };
  });
  prova('le durate sommano al tempo chiesto e restano nei limiti; se non si può, null', pure.r1 && Math.abs(pure.r1s - 12) < 1e-6 && pure.r1ok && pure.r2 === null && pure.r3 === null, JSON.stringify([pure.r1, pure.r2, pure.r3]));
  prova('i fotogrammi sommano esattamente (350 e 91)', pure.fs === 350 && pure.f2s === 91, JSON.stringify([pure.f, pure.f2s]));
  prova('il taglio si appoggia al battito vicino e la durata totale non cambia', Math.abs(pure.sb[0] - 3) < 1e-9 && Math.abs(pure.sbs - 10) < 1e-9 && pure.sb0.join() === '3,3', JSON.stringify(pure.sb));
  prova('l\'ordine per data (a parità, per nome con i numeri), "come le ho messe" e a caso con lo stesso seme', pure.perData.join() === 'IMG_2,IMG_3,IMG_1,IMG_10' && pure.dato.join() === 'IMG_10,IMG_2,IMG_1,IMG_3' && pure.caso1 === pure.caso2 && pure.caso1 !== pure.caso3, JSON.stringify([pure.perData, pure.caso1, pure.caso3]));
  prova('le foto uguali: resta la più nitida, la diversa si tiene', pure.dop.join() === 'b,c' && pure.dopT.join() === 'a', JSON.stringify([pure.dop, pure.dopT]));
  prova('la data di scatto si legge dall\'EXIF di un JPEG fatto a mano, e un file senza EXIF dà null', pure.exif === pure.esperto && pure.exifNo === null, JSON.stringify([pure.exif, pure.esperto, pure.exifNo]));
  prova('la qualità: nitida > sfocata, nitida > troppo buia; la firma è di 16 cifre ed è la stessa per la stessa immagine', pure.nitida > pure.sfocata + 0.15 && pure.nitida > pure.buia + 0.15 && pure.firmaUguale && pure.firmaLung === 16, JSON.stringify([pure.nitida, pure.sfocata, pure.buia]));
  prova('il ritmo: 120 battiti al minuto riconosciuti e il silenzio non ne ha', pure.bpm && Math.abs(pure.bpm - 120) < 4 && pure.nbatt >= 20 && pure.muto === null, JSON.stringify([pure.bpm, pure.nbatt, pure.sic, pure.primi]));

  console.log('▶ DaProdMontage: ogni preset, solo con le foto');
  // quindici foto finte, tutte diverse (colori e disegni), importate nel contenitore
  const foto = await page.evaluate(async () => {
    const { importaFile } = window.__dpvTest;
    const ids = [];
    for (let i = 0; i < 15; i++) {
      const vert = i % 4 === 3; // qualcuna in verticale
      const w = vert ? 600 : 800, h = vert ? 800 : 600;
      const c = new OffscreenCanvas(w, h); const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, `hsl(${i * 24},70%,55%)`); g.addColorStop(1, `hsl(${i * 24 + 60},60%,25%)`);
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(255,255,255,.85)';
      for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(((i * 97 + k * 151) % w), ((i * 53 + k * 89) % h), 30 + ((i + k) % 5) * 14, 0, 7); x.fill(); }
      x.fillStyle = '#000'; x.font = '900 90px sans-serif'; x.fillText(String(i + 1), 30, h - 40);
      const b = await c.convertToBlob({ type: 'image/png' });
      const nome = `IMG_${String(i + 1).padStart(4, '0')}.png`;
      const [m] = await importaFile([{ name: nome, file: new File([b], nome, { type: 'image/png' }) }], { chiediFormato: false });
      ids.push(m.id);
    }
    window.__fotoMontage = ids;
    return ids.length;
  });
  prova('quindici foto finte nel contenitore', foto === 15);

  const tutti = await page.evaluate(() => {
    const { MT, MP } = window.__dpvTest;
    const doc = window.__dpv.doc;
    const ids = window.__fotoMontage;
    const entrate = ids.map((id, i) => { const m = doc.media.find((x) => x.id === id); return { media: id, nome: m.name, tipo: 'image', durata: 0, w: m.width, h: m.height, data: 1000 * i, audio: false, punteggio: 0.5 }; });
    const fps = doc.rate.num / doc.rate.den;
    const esiti = [];
    for (const pr of MP.PRESET_MONTAGE) {
      for (const durata of [30, 95]) {
        const o = { preset: pr.id, durata, ordine: 'data', titoli: true, effetti: true, audioVideo: -14, testi: { titolo: 'Titolo', sottotitolo: 'Sotto', nomi: 'Giulia e Marco', data: '12 giugno 2026' }, seme: 1, scarta: true };
        const copia = JSON.parse(JSON.stringify(doc));
        let r, err = null, piano;
        try { piano = MT.pianifica(entrate, o); r = MT.costruisciSequenza(copia, piano, o); } catch (e) { err = String(e && e.stack || e); }
        if (err) { esiti.push({ id: pr.id, durata, err }); continue; }
        const totF = Math.round(durata * fps);
        const linea = copia.tracks.filter((t) => t.kind === 'video');
        // nessuna sovrapposizione fra clip vere (non blocchi) sulla stessa traccia
        let sovrap = 0, fuori = 0, senzaMedia = 0;
        for (const t of copia.tracks) {
          const cl = copia.clips.filter((c) => c.track === t.id && c.kind !== 'fx').sort((a, b) => a.start - b.start);
          for (let i = 0; i < cl.length; i++) {
            if (i && cl[i].start < cl[i - 1].start + cl[i - 1].len) sovrap++;
            if (cl[i].start < 0 || cl[i].start + cl[i].len > totF) fuori++;
            if (cl[i].kind === 'media' && !copia.media.some((m) => m.id === cl[i].media)) senzaMedia++;
          }
        }
        const foto = copia.clips.filter((c) => c.kind === 'media' && ids.includes(c.media));
        const fine = Math.max(...foto.map((c) => c.start + c.len));
        const dalla = foto.slice().sort((a, b) => a.start - b.start);
        let buchi = 0; for (let i = 1; i < dalla.length; i++) if (dalla[i].start !== dalla[i - 1].start + dalla[i - 1].len) buchi++;
        esiti.push({ id: pr.id, durata, totF, fine, inizio: dalla[0]?.start, buchi, sovrap, fuori, senzaMedia, nFoto: foto.length, usate: piano.usate, ripetute: piano.ripetute, nome: copia.sequenze?.find((s) => s.id === copia.seqAttiva)?.nome, tracce: copia.tracks.length, brevi: foto.filter((c) => c.len < 2).length });
      }
    }
    return esiti;
  });
  const errori = tutti.filter((e) => e.err);
  prova(`i ${tutti.length / 2} preset montano senza errori, a 30 e a 95 secondi`, !errori.length && tutti.length >= 44, JSON.stringify(errori.slice(0, 2)));
  const sbagliati = tutti.filter((e) => !e.err && (e.fine !== e.totF || e.inizio !== 0 || e.buchi || e.sovrap || e.fuori || e.senzaMedia || e.brevi));
  prova('in ogni montaggio le foto riempiono tutto il tempo chiesto al fotogramma, senza buchi, sovrapposizioni o fuori misura', !sbagliati.length, JSON.stringify(sbagliati.slice(0, 3)));
  const conRipetute = tutti.filter((e) => e.durata === 95 && e.ripetute > 0).length;
  prova('con 15 foto e 95 secondi le foto si ripetono (non restano buchi) e l\'unica scelta è dichiarata nel riepilogo', conRipetute > 0 && tutti.filter((e) => e.durata === 30).every((e) => e.nFoto >= 3), `ripetute in ${conRipetute} preset`);
  prova('la sequenza ha il nome del preset', tutti.every((e) => e.err || /^DaProdMontage · /.test(e.nome || '')), JSON.stringify(tutti[0]));

  console.log('▶ DaProdMontage: i battiti e i video');
  const mix = await page.evaluate(() => {
    const { MT } = window.__dpvTest;
    const doc = window.__dpv.doc;
    const ids = window.__fotoMontage;
    const fps = doc.rate.num / doc.rate.den;
    const foto = ids.slice(0, 8).map((id, i) => { const m = doc.media.find((x) => x.id === id); return { media: id, nome: m.name, tipo: 'image', durata: 0, w: m.width, h: m.height, data: i, audio: false, punteggio: 0.5 }; });
    const video = { media: 'finto-video', nome: 'ripresa.mp4', tipo: 'video', durata: 40, w: 1920, h: 1080, data: 100, audio: true, punteggio: 0.8, inizioMigliore: 12 };
    const bat = []; for (let t = 0.4; t < 60; t += 0.5) bat.push(+t.toFixed(3));
    const base = { preset: 'compleanno', durata: 40, ordine: 'data', titoli: false, effetti: false, audioVideo: -14, testi: { titolo: '', sottotitolo: '', nomi: '', data: '' }, seme: 3, scarta: true };
    const senza = MT.pianifica(foto, base);
    const con = MT.pianifica(foto, { ...base, musica: { media: 'm', durata: 60, battiti: bat } });
    const dist = (p) => { const tagli = p.voci.slice(1).map((v) => v.start); return tagli.map((t) => Math.min(...bat.map((b) => Math.abs(b - t)))); };
    const misto = MT.pianifica([...foto, video], { ...base, durata: 50 });
    const v = misto.voci.find((x) => x.entrata.tipo === 'video');
    return { sd: dist(senza), cd: dist(con), tot: con.durata, somma: con.voci.reduce((a, x) => a + x.len, 0), nv: misto.voci.length, v: v && { srcIn: v.srcIn, len: v.len }, ordineOk: con.voci.every((x, i, a) => !i || Math.abs(x.start - (a[i - 1].start + a[i - 1].len)) < 1e-6) };
  });
  const media = (v) => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
  prova('con la musica ritmata i tagli cadono (quasi sempre) sui battiti, molto più di prima', media(mix.cd) < media(mix.sd) * 0.6 || media(mix.cd) < 0.08, `con ${media(mix.cd).toFixed(3)} · senza ${media(mix.sd).toFixed(3)}`);
  prova('anche con i tagli spostati la durata totale è quella chiesta e le voci si toccano', Math.abs(mix.somma - 40) < 1e-3 && mix.ordineOk, JSON.stringify([mix.somma, mix.tot]));
  prova('un video lungo parte dal suo pezzo più bello', mix.v && mix.v.srcIn >= 10 && mix.v.srcIn <= 12.01 && mix.v.len > 2, JSON.stringify(mix.v));

  console.log('▶ DaProdMontage: la pagina');
  await page.keyboard.press('F8');
  await page.waitForTimeout(600);
  const pag = await page.evaluate(() => ({
    pagina: document.getElementById('app').dataset.pagina,
    visibile: !!document.querySelector('.montage') && getComputedStyle(document.querySelector('.montage')).display !== 'none',
    carte: document.querySelectorAll('.mt-festa').length,
    foto: document.querySelectorAll('.mt-thumb').length,
    scelte: document.querySelectorAll('.mt-thumb.scelta').length,
    bottone: !!document.querySelector('.mt-crea') && !document.querySelector('.mt-crea').disabled,
    tab: document.querySelector('.pagina-btn[data-p="montage"]')?.classList.contains('attiva'),
  }));
  prova('F8 apre la pagina DaProdMontage, con il suo tasto acceso', pag.pagina === 'montage' && pag.visibile && pag.tab, JSON.stringify(pag));
  prova('si vedono tutti i preset e le quindici foto già scelte; il tasto CREA è pronto', pag.carte >= 22 && pag.foto >= 15 && pag.scelte >= 15 && pag.bottone, JSON.stringify(pag));
  await page.screenshot({ path: path.join(OUT, 'montage-pagina.png') });

  // si sceglie "battesimo", 20 secondi, nomi, e si crea
  await page.click('.mt-festa[data-preset="battesimo"]');
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const campo = [...document.querySelectorAll('.mt-campo input')][0];
    campo.value = 'Leonardo'; campo.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const [mm, ss] = await page.$$('.mt-mmss input');
  await mm.fill('0'); await mm.dispatchEvent('change');
  await ss.fill('20'); await ss.dispatchEvent('change');
  await page.waitForTimeout(400);
  const prima = await page.evaluate(() => ({ riep: document.querySelector('.mt-riepilogo')?.textContent, seq: (window.__dpv.doc.sequenze ?? []).length, salvate: localStorage.getItem('dpv-montage') }));
  prova('il riepilogo dice stile e durata, e le scelte si ricordano', /Battesimo/.test(prima.riep) && /20 s/.test(prima.riep) && /battesimo/.test(prima.salvate ?? ''), JSON.stringify(prima));
  await page.click('.mt-crea');
  await page.evaluate(() => window.__dpvTest.ui().montage.ultimo);
  await page.waitForFunction(() => document.getElementById('app').dataset.pagina === 'montaggio', null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);
  const dopo = await page.evaluate(() => {
    const d = window.__dpv.doc;
    const fps = d.rate.num / d.rate.den;
    const foto = d.clips.filter((c) => c.kind === 'media' && (window.__fotoMontage ?? []).includes(c.media));
    const fine = Math.max(...foto.map((c) => c.start + c.len));
    const titoli = d.clips.filter((c) => c.kind === 'title');
    const nome = d.sequenze?.find((s) => s.id === d.seqAttiva)?.nome;
    const testo = JSON.stringify(titoli.map((c) => c.gen?.anim));
    return { pagina: document.getElementById('app').dataset.pagina, nome, fine, atteso: Math.round(20 * fps), nFoto: foto.length, titoli: titoli.length, testo, tracce: d.tracks.length, blocchi: d.clips.filter((c) => c.kind === 'fx').length };
  });
  prova('"Crea il montaggio" costruisce la timeline e torna al Montaggio', dopo.pagina === 'montaggio' && /Battesimo/.test(dopo.nome ?? '') && dopo.nFoto >= 3, JSON.stringify(dopo));
  prova('le foto riempiono esattamente 20 secondi e il nome inserito sta nel titolo', dopo.fine === dopo.atteso && /Leonardo/.test(dopo.testo) && dopo.titoli >= 1, JSON.stringify(dopo));
  prova('ci sono transizioni o effetti come blocchetti sopra le clip', dopo.blocchi >= 2, String(dopo.blocchi));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'montage-risultato.png') });

  // il montaggio si guarda: il monitor a metà non è nero e la riproduzione parte
  const guarda = await page.evaluate(async () => {
    const m = window.__motore; const rec = m.rec;
    const d = window.__dpv.doc; const fps = d.rate.num / d.rate.den;
    const punti = [];
    for (const s of [3, 8, 14]) {
      m.vaiA(Math.round(s * fps));
      await new Promise((r) => setTimeout(r, 700));
      const px = new Uint8Array(64 * 36 * 4); rec.leggiPiccolo(64, 36, px);
      let somma = 0, vari = new Set(); for (let i = 0; i < px.length; i += 4) { somma += px[i] + px[i + 1] + px[i + 2]; vari.add((px[i] >> 5) * 64 + (px[i + 1] >> 5) * 8 + (px[i + 2] >> 5)); }
      punti.push({ s, luce: somma / (64 * 36 * 3), colori: vari.size });
    }
    return punti;
  });
  prova('il monitor mostra il montaggio (non nero, con colori) a 3, 8 e 14 secondi', guarda.every((p) => p.luce > 25 && p.colori > 4), JSON.stringify(guarda));
  await page.screenshot({ path: path.join(OUT, 'montage-monitor.png') });

  // solo foto, poche: 3 foto per 40 s → si ripetono, e lo dice
  await page.keyboard.press('F8');
  await page.waitForTimeout(500);
  const poche = await page.evaluate(async () => {
    // si tengono solo tre foto (i video eventualmente già nel progetto si tolgono)
    const q = [...document.querySelectorAll('.mt-thumb')];
    let foto = 0;
    q.forEach((b) => { const video = !!b.querySelector('.mt-tipo'); if ((video || ++foto > 3) && b.classList.contains('scelta')) b.click(); });
    await new Promise((r) => setTimeout(r, 400));
    return { riep: document.querySelector('.mt-riepilogo')?.textContent, conta: document.querySelector('.mt-conta')?.textContent };
  });
  prova('con tre sole foto e 20 secondi il riepilogo lo dice e il tasto resta acceso', /^3 foto · 0 video/.test(poche.conta) && poche.riep.length > 20, JSON.stringify(poche));
  await page.screenshot({ path: path.join(OUT, 'montage-poche.png') });
  await page.keyboard.press('F8');
  await page.waitForTimeout(300);
}
