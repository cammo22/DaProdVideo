// Le prove di DaProd Video: il banco di montaggio usato da solo in Chromium.
//   npm run build && node test/prove.mjs
// Genera il montaggio dimostrativo (riprese create al volo), poi taglia, elimina, annulla, separa,
// dissolve, estrae, suona ed esporta un WebM che viene riletto e controllato.
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { servi } from './servi.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(DIST, 'app/index.html'))) { console.error('manca dist/: prima npm run build'); process.exit(1); }
const OUT = path.join(ROOT, 'test/.out');
fs.mkdirSync(OUT, { recursive: true });

let ok = 0, ko = 0;
const prova = (nome, cond, info = '') => {
  if (cond) { ok++; console.log('  ✓', nome); }
  else { ko++; console.log('  ✗', nome, info); }
};

const srv = await servi(DIST);
const exe = process.env.CHROME || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 950 }, acceptDownloads: true });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });

const doc = () => page.evaluate(() => window.__dpv.doc);
const conta = () => page.evaluate(() => window.__dpv.doc.clips.length);
/** il blocchetto transizione che sta sul fotogramma f */
const bloccoSul = (d, f) => d.clips.find((c) => c.kind === 'fx' && c.fxb?.tipo === 'transizione' && c.start <= f && c.start + c.len >= f);
/** le clip vere di una traccia (i blocchetti FX stanno sopra, non contano) */
const solide = (d, track) => d.clips.filter((c) => c.track === track && c.kind !== 'fx');
/** due clip vere si coprono? */
const coperte = (d) => d.clips.some((x) => x.kind !== 'fx' && d.clips.some((y) => y !== x && y.kind !== 'fx' && x.track === y.track && x.start < y.start + y.len && y.start < x.start + x.len));
const tasto = async (k) => { await page.keyboard.press(k); await page.waitForTimeout(120); };

try {
  console.log('▶ Avvio');
  await page.goto(srv.url + '/app/');
  await page.waitForSelector('.pulsantiera');
  await page.waitForTimeout(1200);
  prova('il banco si apre senza errori', errori.length === 0, errori.join(' | '));
  prova('il contenitore vuoto invita a importare', await page.isVisible('text=Trascina qui i tuoi video'));
  prova('un monitor solo, sul programma', (await page.locator('.monitor').count()) === 1 && (await page.textContent('.monitor .mon-testa b')) === 'PROGRAMMA');
  prova('la pulsantiera ha i tasti 1 e 2', (await page.textContent('.pulsantiera')).includes('TAGLIA') && (await page.textContent('.pulsantiera')).includes('ELIMINA'));

  console.log('▶ Timecode');
  const tc = await page.evaluate(() => {
    const { TC } = window.__dpvTest;
    const r25 = { num: 25, den: 1 }, r2997 = { num: 30000, den: 1001 };
    return {
      a: TC.frameToTc(90000, r25), b: TC.frameToTc(1800, r2997, true), c: TC.frameToTc(17982, r2997, true),
      d: TC.parseTc('1000', r25, false, 0), e: TC.parseTc('+25', r25, false, 100), f: TC.tcToFrame(0, 1, 0, 2, r2997, true),
    };
  });
  prova('01:00:00:00 a 25 fps', tc.a === '01:00:00:00', tc.a);
  prova('drop-frame: 1800 → 00:01:00;02', tc.b === '00:01:00;02', tc.b);
  prova('drop-frame: 17982 → 00:10:00;00', tc.c === '00:10:00;00', tc.c);
  prova('tastierino: "1000" = 10 secondi', tc.d === 250, tc.d);
  prova('timecode relativo "+25"', tc.e === 125, tc.e);
  prova('drop-frame all\'indietro', tc.f === 1800, tc.f);

  console.log('▶ Montaggio dimostrativo');
  await page.click('text=Prova con il montaggio dimostrativo');
  await page.waitForFunction(() => window.__dpv.doc.clips.length >= 8, null, { timeout: 90000 });
  await page.waitForTimeout(1500);
  let d = await doc();
  prova('tre riprese nel contenitore', d.media.length === 3, d.media.length);
  prova('otto clip nella timeline', d.clips.filter((c) => c.kind !== 'fx').length === 8, d.clips.length);
  prova('video e audio legati', d.clips.filter((c) => c.link).length === 6);
  prova('due tracce video e due audio, niente corsia FX a parte', d.tracks.map((t) => t.kind).join(',') === 'video,video,audio,audio', d.tracks.map((t) => t.name).join(','));
  prova('gli FX stanno sulle tracce video', d.clips.filter((c) => c.kind === 'fx').every((c) => d.tracks.find((t) => t.id === c.track).kind === 'video'));
  prova('una dissolvenza e una tendina a iride in blocchetti sul taglio', d.clips.some((c) => c.fxb?.id === 'mix') && d.clips.some((c) => c.fxb?.id === 'wipe:119'));
  prova('un lampo e uno zoom lento nella corsia FX', d.clips.some((c) => c.fxb?.id === 'flash') && d.clips.some((c) => c.fxb?.id === 'zoomLento'));
  await page.screenshot({ path: path.join(OUT, 'demo.png') });

  console.log('▶ Trascina dal contenitore alla timeline');
  {
    await page.evaluate(() => document.dispatchEvent(new CustomEvent('dpv:adatta')));
    await page.waitForTimeout(300);
    const n0 = await conta();
    const fine0 = await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc));
    const voce = await page.locator('.carta[data-id]').nth(1).boundingBox();
    const tela = await page.locator('.tl-tela').boundingBox();
    // la riga di V1: righello + le tracce video sopra + metà di V1
    const yV1 = await page.evaluate(() => { const r = window.__dpvTest.ui().tl.riga(window.__dpv.doc.tracks.find((x) => x.name === 'V1').id); return r.y + r.h / 2; });
    await page.mouse.move(voce.x + voce.width / 2, voce.y + voce.height / 2);
    await page.mouse.down();
    await page.mouse.move(voce.x + 60, voce.y + 40, { steps: 5 });
    await page.mouse.move(tela.x + tela.width - 12, tela.y + yV1, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(300);
    const dd = await doc();
    const aggiunte = dd.clips.filter((c) => c.start >= fine0);
    prova('trascinata col mouse: video e audio in coda', dd.clips.length === n0 + 2 && aggiunte.length === 2, `${n0} → ${dd.clips.length}`);
    await tasto('Control+z');
    prova('e si annulla', (await conta()) === n0);
  }

  console.log('▶ Recorder');
  await page.evaluate(() => window.__motore.vaiA(60));
  let luce = 0;
  for (let i = 0; i < 25 && luce <= 20; i++) {
    await page.waitForTimeout(200);
    luce = await page.evaluate(() => {
      const px = new Uint8Array(64 * 36 * 4);
      window.__motore.rec.leggiPiccolo(64, 36, px);
      let s = 0; for (let i = 0; i < px.length; i += 4) s += px[i] + px[i + 1] + px[i + 2];
      return s / (64 * 36 * 3);
    });
  }
  prova('il Recorder mostra l\'immagine (non nero)', luce > 20, luce.toFixed(1));

  console.log('▶ Tasto 1: taglia');
  const prima = await conta();
  await page.evaluate(() => { window.__dpv.select([]); window.__motore.vaiA(60); });
  await page.locator('.tl-tela').focus();
  await tasto('1');
  d = await doc();
  prova('1 taglia tutte le tracce sotto il cursore', d.clips.length === prima + 3, `${prima} → ${d.clips.length}`);
  prova('i pezzi si toccano al fotogramma 60', d.clips.filter((c) => c.start === 60).length === 3);
  const sx = d.clips.find((c) => c.start === 60 && c.kind === 'media' && d.tracks.find((t) => t.id === c.track).kind === 'video');
  prova('il pezzo di destra riparte dal punto giusto della sorgente', Math.abs(sx.srcIn - 60 / 25) < 1e-6, sx.srcIn);
  const pezzoA = d.clips.find((c) => c.start === 60 && d.tracks.find((t) => t.id === c.track).kind === 'audio');
  prova('audio e video tagliati restano legati fra loro', sx.link && sx.link === pezzoA.link);
  {
    const sel = await page.evaluate(() => [...window.__dpv.sel]);
    const sxV = d.clips.find((c) => c.start === 0 && c.len === 60 && d.tracks.find((t) => t.id === c.track).name === 'V1');
    prova('dopo il taglio è scelto il pezzo più corto (pronto per il 2)', !!sxV && sel.includes(sxV.id) && !sel.includes(sx.id), sel.join(','));
  }

  console.log('▶ Tasto 2: elimina');
  await page.evaluate((id) => window.__dpv.select([id]), sx.id);
  await tasto('2');
  d = await doc();
  prova('2 elimina la clip selezionata e la sua audio', d.clips.length === prima + 1 && !d.clips.some((c) => c.id === sx.id), d.clips.length);
  {
    const sel = await page.evaluate(() => [...window.__dpv.sel]);
    const dopoV = d.clips.filter((c) => c.kind !== 'fx' && d.tracks.find((t) => t.id === c.track).name === 'V1' && c.start >= 60).sort((a, b) => a.start - b.start)[0];
    prova('dopo il 2 è scelta la clip che viene dopo', !!dopoV && sel.includes(dopoV.id), sel.join(','));
  }
  prova('senza ripple resta il buco', !d.clips.some((c) => c.start === 60 && d.tracks.find((t) => t.id === c.track).name === 'V1'));
  await tasto('Control+z');
  prova('Ctrl+Z riporta le clip', (await conta()) === prima + 3);
  await tasto('Control+y');
  prova('Ctrl+Y le toglie di nuovo', (await conta()) === prima + 1);
  await tasto('Control+z');

  console.log('▶ Tasto 3: elimina e chiudi');
  d = await doc();
  const v1 = d.tracks.find((t) => t.name === 'V1').id;
  const primoV = solide(d, v1).sort((a, b) => a.start - b.start)[0];
  const secondoV = solide(d, v1).sort((a, b) => a.start - b.start)[1];
  await page.evaluate((id) => window.__dpv.select([id]), primoV.id);
  await tasto('3');
  d = await doc();
  const dopo = d.clips.find((c) => c.id === secondoV.id);
  prova('3 chiude il buco: la clip dopo scorre all\'inizio', dopo && dopo.start === 0, dopo?.start);
  await tasto('Control+z');

  console.log('▶ Tasto 4: separa audio');
  d = await doc();
  const legata = d.clips.find((c) => c.link && c.track === v1);
  await page.evaluate((id) => window.__dpv.select([id]), legata.id);
  await tasto('4');
  d = await doc();
  prova('4 separa audio e video', !d.clips.find((c) => c.id === legata.id).link);
  await page.evaluate((id) => {
    const { M } = window.__dpvTest;
    window.__dpv.edit('prova sposta', (p) => M.moveClips(p, new Set([id]), 10, 0, 'video', 'overwrite'));
  }, legata.id);
  d = await doc();
  const mossa = d.clips.find((c) => c.id === legata.id);
  const ferma = d.clips.find((c) => c.link === undefined && c.start === legata.start && c.id !== legata.id && d.tracks.find((t) => t.id === c.track).kind === 'audio');
  prova('dopo la separazione il video si sposta da solo', mossa.start === legata.start + 10 && !!ferma, `${mossa.start}`);
  await tasto('Control+z');
  await tasto('Control+z');

  console.log('▶ Tasto 5: dissolvenza');
  d = await doc();
  const taglio = solide(d, v1).sort((a, b) => a.start - b.start).find((c) => c.start > 0 && !bloccoSul(d, c.start) && solide(d, v1).some((x) => x.start + x.len === c.start));
  await page.evaluate(() => window.__dpv.select([]));
  await page.evaluate((f) => window.__motore.vaiA(f), taglio.start);
  await tasto('5');
  d = await doc();
  const b5 = bloccoSul(d, taglio.start);
  prova('5 mette la dissolvenza sul taglio sotto il cursore (centrata, sul girato)', b5?.fxb.id === 'mix' && b5.track === v1 && Math.abs(b5.start + b5.len / 2 - taglio.start) <= 1, JSON.stringify(b5 && { s: b5.start, l: b5.len, t: taglio.start }));
  prova('la dissolvenza non cambia la durata delle clip', d.clips.find((c) => c.id === taglio.id).len === taglio.len);
  const strati5 = await page.evaluate((f) => window.__dpvTest.pianoVideo(window.__dpv.doc, f).map((s) => ({ a: s.a?.clip.id, b: s.b?.clip.id, tr: !!s.tr })), taglio.start - 2);
  prova('prima del taglio si vedono tutte e due le clip', strati5.some((s) => s.tr && s.a && s.b === taglio.id), JSON.stringify(strati5));
  await tasto('5');
  d = await doc();
  prova('5 di nuovo toglie la dissolvenza', !bloccoSul(d, taglio.start));

  console.log('▶ Attacco, stacco, estrai');
  const fineP = await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc));
  await page.evaluate(() => window.__motore.vaiA(200));
  await tasto('i');
  await page.evaluate(() => window.__motore.vaiA(250));
  await tasto('o');
  d = await doc();
  prova('I e O segnano attacco e stacco', d.inF === 200 && d.outF === 250, `${d.inF}-${d.outF}`);
  await tasto('x');
  const fineDopo = await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc));
  prova('X estrae e accorcia il montaggio di 50 fotogrammi', fineDopo === fineP - 50, `${fineP} → ${fineDopo}`);
  await tasto('Control+z');
  await tasto('Control+z');
  await tasto('Control+z');

  console.log('▶ Montaggio a tre punti dal Player');
  d = await doc();
  const quanti = d.clips.length;
  await page.evaluate((id) => { window.__motore.caricaPlayer(id, 1); window.__motore.setMonitor('player'); }, d.media[2].id);
  await tasto('i');
  await page.evaluate(() => window.__motore.playerVaiA(3));
  await tasto('o');
  const fineTl = await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc));
  await page.evaluate((f) => { window.__motore.setMonitor('recorder'); window.__motore.vaiA(f); }, fineTl);
  await tasto('.');
  d = await doc();
  const nuove = d.clips.filter((c) => c.start === fineTl);
  prova('"." sovrascrive dal Player: video e audio, 2 secondi', d.clips.length === quanti + 2 && nuove.length === 2 && nuove.every((c) => c.len === 50), `${d.clips.length - quanti} clip, len ${nuove.map((c) => c.len)}`);
  prova('la sorgente entra dall\'attacco segnato', nuove.every((c) => Math.abs(c.srcIn - 1) < 1e-6));
  await tasto('Control+z');
  await tasto('Control+z');
  await tasto('Control+z');

  console.log('▶ Trasparenza al volo');
  d = await doc();
  const perOpac = d.clips.find((c) => c.track === v1);
  await page.evaluate((id) => window.__dpv.select([id]), perOpac.id);
  await tasto('Alt+ArrowDown');
  await tasto('Alt+ArrowDown');
  d = await doc();
  prova('Alt+↓ due volte = opacità 80%', Math.abs(d.clips.find((c) => c.id === perOpac.id).opacity - 0.8) < 1e-6);
  await tasto('Control+z'); await tasto('Control+z');

  console.log('▶ Istantanea e fermo immagine');
  {
    await page.evaluate(() => { window.__dpv.select([]); window.__motore.setMonitor('recorder'); window.__motore.vaiA(50); });
    await page.waitForTimeout(400);
    const m0 = (await doc()).media.length;
    await page.locator('.tl-tela').focus();
    await tasto('p');
    await page.waitForFunction((n) => window.__dpv.doc.media.length > n, m0, { timeout: 15000 });
    let dd = await doc();
    const foto = dd.media[dd.media.length - 1];
    prova('P: l\'istantanea finisce nel contenitore come immagine', foto.type === 'image' && foto.name.startsWith('Istantanea') && foto.width === dd.w && foto.height === dd.h, `${foto.type} ${foto.width}×${foto.height}`);
    // nella timeline e allungata di 5 secondi con il gruppo Durata delle proprietà
    const fine0 = await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc));
    await page.evaluate(({ id, f }) => { window.__motore.caricaPlayer(id); window.__dpv.edit('prova foto', (p) => window.__dpvTest.M.placeSource(p, { mediaId: id, srcIn: 0, srcOut: 2 }, f, null, { video: p.tracks.find((t) => t.name === 'V1').id, audio: [] }, 'overwrite')); }, { id: foto.id, f: fine0 });
    dd = await doc();
    const clipFoto = dd.clips.find((c) => c.media === foto.id);
    await page.evaluate((id) => window.__dpv.select([id]), clipFoto.id);
    await page.click('.lato .scheda[data-s=clip]');
    await page.waitForTimeout(200);
    await page.click('.isp-pulsanti button:has-text("+5 s")');
    dd = await doc();
    prova('l\'istantanea si allunga (+5 s dalle proprietà)', dd.clips.find((c) => c.id === clipFoto.id).len === 50 + 125, dd.clips.find((c) => c.id === clipFoto.id).len);
    await tasto('Control+z'); await tasto('Control+z');
    // fermo immagine al fotogramma 100: due secondi dentro, il resto scorre avanti di 50
    const fineA = await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc));
    await page.evaluate(() => { window.__dpv.select([]); window.__motore.vaiA(100); });
    await page.locator('.tl-tela').focus();
    const nClip = await conta();
    await tasto('Shift+P');
    await page.waitForFunction((n) => window.__dpv.doc.clips.length > n, nClip, { timeout: 15000 });
    const fineB = await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc));
    dd = await doc();
    const fermo = dd.clips.find((c) => c.start === 100 && dd.media.find((m) => m.id === c.media)?.type === 'image');
    prova('Shift+P: fermo immagine di 2 s al cursore, il resto scorre', !!fermo && fermo.len === 50 && fineB === fineA + 50, `${fermo?.len} · ${fineA} → ${fineB}`);
    await tasto('Control+z');
  }

  console.log('▶ Transizioni nuove');
  {
    await page.click('.bin-cat[data-c=transizioni]');
    await page.waitForTimeout(300);
    prova('il pannello ha gli effetti digitali e le tendine a sagoma', (await page.locator('.gen-lista .gen-voce').count()) >= 30);
    const v1b = (await doc()).tracks.find((t) => t.name === 'V1').id;
    const taglio2 = (await doc()).clips.filter((c) => c.track === v1b).sort((a, b) => a.start - b.start)[1];
    await page.evaluate((f) => { window.__dpv.select([]); window.__motore.vaiA(f); }, taglio2.start);
    await page.locator('.gen-voce', { hasText: 'Cubo 3D' }).click();
    let dd = await doc();
    const cubo = bloccoSul(dd, taglio2.start);
    prova('clic su "Cubo 3D": la transizione sul taglio diventa il cubo', cubo?.fxb.id === 'dve:401' && cubo.fxb.tr.pattern === 401, JSON.stringify(cubo?.fxb));
    await page.evaluate((f) => window.__motore.vaiA(f), taglio2.start);
    let lum = 0;
    for (let i = 0; i < 25 && lum <= 8; i++) {
      await page.waitForTimeout(200);
      lum = await page.evaluate(() => { const px = new Uint8Array(64 * 36 * 4); window.__motore.rec.leggiPiccolo(64, 36, px); let s = 0; for (let i = 0; i < px.length; i += 4) s += px[i] + px[i + 1] + px[i + 2]; return s / (64 * 36 * 3); });
    }
    prova('a metà del cubo il Recorder mostra le due facce', lum > 8, lum.toFixed(1));
    await page.locator('.gen-voce', { hasText: '121 · Cuore' }).click();
    dd = await doc();
    prova('clic su "Cuore": diventa una tendina 121', bloccoSul(dd, taglio2.start)?.fxb.tr.pattern === 121 && bloccoSul(dd, taglio2.start)?.fxb.tr.type === 'wipe');
    await page.locator('.gen-voce', { hasText: 'Mosaico' }).click();
    const edl2 = await page.evaluate(() => window.__dpvTest.creaEdl(window.__dpv.doc));
    prova('la EDL annota l\'effetto digitale', edl2.includes('* EFFETTO: Mosaico'));
    await tasto('Control+z'); await tasto('Control+z'); await tasto('Control+z');
    await page.click('.bin-cat[data-c=tutto]');
  }

  console.log('▶ Tasti nuovi: S, Q e W, tracce accese, rotella');
  {
    await page.evaluate(() => { window.__dpv.select([]); window.__motore.setMonitor('recorder'); });
    let dd = await doc();
    const tv1 = dd.tracks.find((t) => t.name === 'V1').id, ta1 = dd.tracks.find((t) => t.name === 'A1').id;
    // S separa un gruppo, poi con due clip scelte le riunisce
    const v = dd.clips.find((c) => c.track === tv1 && c.link);
    const a = dd.clips.find((c) => c.link === v.link && c.id !== v.id);
    await page.evaluate((ids) => window.__dpv.select(ids), [v.id, a.id]);
    await page.locator('.tl-tela').focus();
    await tasto('s');
    dd = await doc();
    prova('S separa il gruppo (audio e video vanno per conto loro)', !dd.clips.find((c) => c.id === v.id).link && !dd.clips.find((c) => c.id === a.id).link);
    await tasto('s');
    dd = await doc();
    const lv = dd.clips.find((c) => c.id === v.id).link;
    prova('S con due clip scelte le riunisce in un gruppo', !!lv && lv === dd.clips.find((c) => c.id === a.id).link);
    // Q: via lo scarto a sinistra del cursore (senza ripple resta il buco)
    const c0 = dd.clips.filter((c) => c.track === tv1).sort((x, y) => x.start - y.start)[0];
    await page.evaluate((f) => { window.__dpv.select([]); window.__motore.vaiA(f); }, c0.start + 20);
    await tasto('q');
    dd = await doc();
    const c0b = dd.clips.find((c) => c.id === c0.id);
    prova('Q toglie lo scarto a sinistra del cursore', c0b.start === c0.start + 20 && c0b.len === c0.len - 20, `${c0b.start}+${c0b.len}`);
    await tasto('Control+z');
    // W: via lo scarto a destra
    await page.evaluate((f) => window.__motore.vaiA(f), c0.start + 30);
    await tasto('w');
    dd = await doc();
    prova('W toglie lo scarto a destra del cursore', dd.clips.find((c) => c.id === c0.id).len === 30);
    await tasto('Control+z');
    // tracce accese: il taglio tocca solo V1
    const yV1 = await page.evaluate(() => { const t = window.__dpv.doc.tracks; const i = t.findIndex((x) => x.name === 'V1'); return i; });
    await page.locator('.tl-testata .tt-nome').nth(yV1).click();
    const n0 = (await doc()).clips.length;
    await page.evaluate((f) => window.__motore.vaiA(f), c0.start + 40);
    await page.locator('.tl-tela').focus();
    await tasto('1');
    dd = await doc();
    prova('con V1 accesa il taglio tocca solo V1 (l\'audio resta intero)', dd.clips.length === n0 + 1 && dd.clips.some((c) => c.track === tv1 && c.start === c0.start + 40) && !dd.clips.some((c) => c.track === ta1 && c.start === c0.start + 40), `${n0} → ${dd.clips.length}`);
    await tasto('Control+z');
    await page.locator('.tl-testata .tt-nome').nth(yV1).click();
    prova('la traccia si spegne con un altro clic', await page.evaluate(() => window.__dpvTest.Z.modi.attive.size === 0));
    // la rotella: un fotogramma per scatto
    await page.evaluate(() => window.__motore.vaiA(100));
    const box = await page.locator('.tl-tela').boundingBox();
    await page.mouse.move(box.x + 300, box.y + 120);
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(150);
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(150);
    prova('la rotella va avanti di un fotogramma per scatto', (await page.evaluate(() => window.__dpv.head)) === 102, await page.evaluate(() => window.__dpv.head));
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(150);
    prova('e torna indietro', (await page.evaluate(() => window.__dpv.head)) === 101);
  }

  console.log('▶ Niente viene coperto');
  {
    let dd = await doc();
    const tv1 = dd.tracks.find((t) => t.name === 'V1').id;
    const [c1, c2] = solide(dd, tv1).sort((x, y) => x.start - y.start);
    const n0 = dd.clips.length;
    // c2 spostata di 40 fotogrammi indietro, dentro c1: si ferma attaccata a c1
    await page.evaluate(({ id }) => window.__dpv.edit('prova libero', (p) => window.__dpvTest.M.moveClips(p, window.__dpvTest.M.withLinked(p, [id]), -40, 0, 'video', 'libero')), { id: c2.id });
    dd = await doc();
    const c2b = dd.clips.find((c) => c.id === c2.id);
    prova('spostando una clip sopra un\'altra non si mangia niente', dd.clips.length === n0 && !coperte(dd) && c2b.start === c1.start + c1.len, `start ${c2b.start}`);
    await tasto('Control+z');
    // una ripresa lasciata dove è occupato va su una traccia libera
    const m = dd.media[0];
    const nt = dd.tracks.length;
    await page.evaluate(({ id, f }) => { window.__dpv.edit('prova posa', (p) => window.__dpvTest.M.placeSource(p, { mediaId: id, srcIn: 0, srcOut: 2 }, f, null, { video: p.tracks.find((t) => t.name === 'V1').id, audio: [p.tracks.find((t) => t.name === 'A1').id] }, 'libero')); }, { id: m.id, f: 10 });
    dd = await doc();
    const nuoveV = dd.clips.filter((c) => c.start === 10 && c.media === m.id);
    const sovr2 = coperte(dd);
    prova('una ripresa lasciata su una traccia occupata va su una libera', nuoveV.length === 2 && !sovr2 && nuoveV.every((c) => c.track !== tv1), `${nuoveV.length} clip, tracce ${dd.tracks.length - nt} nuove`);
    await tasto('Control+z');
    // l'audio non si abbassa da solo verso la fine (il vecchio "fade out automatico")
    const g = await page.evaluate(() => {
      const c0 = window.__dpv.doc.clips.find((x) => x.kind === 'media' && window.__dpv.doc.tracks.find((t) => t.id === x.track).kind === 'audio');
      const c = { ...c0, fadeIn: 0, fadeOut: 0, trIn: undefined, trOut: undefined, gainKeys: [], gain: 0 };
      const G = window.__dpvTest.guadagnoClip;
      return [G(c, 0, 0), G(c, c.len / 2, 0), G(c, c.len - 1, 0), G(c, c.len, 0)];
    });
    prova('niente fade out automatico: il volume resta pieno fino alla fine', !!g && g.every((x) => Math.abs(x - 1) < 1e-6), JSON.stringify(g));
  }

  console.log('▶ Volume sulla clip audio e transizione trascinata');
  {
    await page.evaluate(() => { window.__dpv.select([]); document.dispatchEvent(new CustomEvent('dpv:adatta')); });
    await page.waitForTimeout(300);
    // dove sta la linea del volume della prima clip di A1 (stessa geometria della timeline)
    const punto = (k) => page.evaluate((k) => {
      const tl = window.__dpvTest.ui().tl, d = window.__dpv.doc;
      const a1 = d.tracks.find((t) => t.name === 'A1');
      const riga = { ...tl.riga(a1.id), id: a1.id };
      const c = d.clips.filter((x) => x.track === riga.id).sort((a, b) => a.start - b.start)[0];
      const top = riga.y + 2, alt = riga.h - 4, testa = Math.min(17, Math.round(alt * 0.34)), cy = top + testa, ch = alt - testa;
      const ly = cy + ch - ((c.gain + 40) / 52) * ch;
      return { x: (c.start + c.len * k - tl.scrollF) * tl.ppf, y: ly, id: c.id };
    }, k);
    const box = await page.locator('.tl-tela').boundingBox();
    const q = await punto(0.5);
    await page.mouse.move(box.x + q.x, box.y + q.y);
    await page.mouse.down();
    await page.mouse.move(box.x + q.x, box.y + q.y - 12, { steps: 4 });
    await page.mouse.up();
    let dd = await doc();
    const g1 = dd.clips.find((c) => c.id === q.id).gain;
    prova('trascinando la linea gialla il volume della clip sale', g1 > 0, g1);
    const q2 = await punto(0.3);
    await page.mouse.dblclick(box.x + q2.x, box.y + q2.y);
    dd = await doc();
    prova('doppio clic sulla linea mette un punto del volume', dd.clips.find((c) => c.id === q.id).gainKeys.length >= 3, dd.clips.find((c) => c.id === q.id).gainKeys.length);
    await tasto('Control+z'); await tasto('Control+z');
    // una dissolvenza trascinata sulla coda dell'ultima clip di V1: esce in dissolvenza
    await page.click('.bin-cat[data-c=transizioni]');
    await page.waitForTimeout(200);
    const carta = await page.locator('.carta.tr', { hasText: 'Dissolvenza incrociata' }).boundingBox();
    const dove = await page.evaluate(() => {
      const tl = window.__dpvTest.ui().tl, d = window.__dpv.doc;
      const v1 = d.tracks.find((t) => t.name === 'V1').id;
      const r = tl.riga(v1);
      const c = d.clips.filter((x) => x.track === v1 && x.kind !== 'fx').sort((a, b) => b.start - a.start)[0];
      return { x: (c.start + c.len * 0.97 - tl.scrollF) * tl.ppf, y: r.y + r.h / 2, id: c.id, fine: c.start + c.len, len: c.len };
    });
    await page.mouse.move(carta.x + carta.width / 2, carta.y + carta.height / 2);
    await page.mouse.down();
    await page.mouse.move(carta.x + 60, carta.y + 30, { steps: 4 });
    await page.mouse.move(box.x + dove.x, box.y + dove.y, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(200);
    dd = await doc();
    const bc = bloccoSul(dd, dove.fine - 1);
    prova('transizione trascinata sulla fine di una clip: un blocchetto che finisce con lei', bc?.fxb.id === 'mix' && bc.start + bc.len === dove.fine, JSON.stringify(bc && { s: bc.start, l: bc.len, fine: dove.fine }));
    prova('la clip non cambia durata', dd.clips.find((c) => c.id === dove.id).len === dove.len);
    await tasto('Control+z');
    await page.click('.bin-cat[data-c=tutto]');
  }

  console.log('▶ Transizione in coda ed effetti');
  {
    let dd = await doc();
    const tv1 = dd.tracks.find((t) => t.name === 'V1').id;
    const ultima = solide(dd, tv1).sort((x, y) => y.start - x.start)[0];
    const len0 = ultima.len;
    await page.evaluate((f) => { window.__dpv.select([]); window.__dpvTest.Z.mettiBlocco('transizione', 'dve:301', f); }, ultima.start + ultima.len);
    dd = await doc();
    const u2 = dd.clips.find((c) => c.id === ultima.id);
    const bu = bloccoSul(dd, u2.start + u2.len - 1);
    prova('transizione in coda sull\'ultima clip, senza cambiarne la durata', bu?.fxb.id === 'dve:301' && u2.len === len0);
    const strati = await page.evaluate(({ f }) => window.__dpvTest.pianoVideo(window.__dpv.doc, f).map((s) => ({ a: !!s.a, b: !!s.b, tr: !!s.tr })), { f: u2.start + u2.len - 3 });
    prova('in coda la clip esce su quello che c\'è sotto', strati.some((s) => s.a && !s.b && s.tr), JSON.stringify(strati));
    await tasto('Control+z');
    // effetto dal contenitore sulla clip scelta
    await page.evaluate((id) => window.__dpv.select([id]), ultima.id);
    await page.click('.bin-cat[data-c=effetti]');
    await page.locator('.carta.fx', { hasText: 'Bianco e nero' }).click();
    dd = await doc();
    prova('effetto dal contenitore: Bianco e nero sulla clip scelta', !!dd.clips.find((c) => c.id === ultima.id).fx.effetti?.includes('bn'));
    const accesa = await page.waitForSelector('.carta.fx.acceso:has-text("Bianco e nero")', { timeout: 3000 }).then(() => true, () => false);
    prova('la carta dell\'effetto si accende', accesa);
    await tasto('Control+z');
    await page.click('.bin-cat[data-c=tutto]');
  }


  console.log('▶ FX sulle clip: effetti a tempo trascinati, suoni, Alt+Shift');
  {
    await page.evaluate(() => { window.__dpv.select([]); document.dispatchEvent(new CustomEvent('dpv:adatta')); });
    await page.waitForTimeout(300);
    await page.click('.bin-cat[data-c=effetti]');
    await page.waitForTimeout(250);
    prova('il contenitore ha gli effetti rapidi e lunghi', (await page.locator('.carta.fxt').count()) >= 20);
    const box = await page.locator('.tl-tela').boundingBox();
    const xy = (f, nome) => page.evaluate(({ f, nome }) => { const tl = window.__dpvTest.ui().tl, d = window.__dpv.doc; const r = tl.riga(d.tracks.find((t) => t.name === nome).id); return { x: (f - tl.scrollF) * tl.ppf, y: r.y + r.h / 2 }; }, { f, nome });
    const trascina = async (sel, q) => {
      await page.locator(sel).first().scrollIntoViewIfNeeded();
      const c = await page.locator(sel).first().boundingBox();
      await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
      await page.mouse.down();
      await page.mouse.move(c.x + 60, c.y + 40, { steps: 4 });
      await page.mouse.move(box.x + q.x, box.y + q.y, { steps: 10 });
      await page.waitForTimeout(150);
      await page.mouse.up();
      await page.waitForTimeout(250);
    };
    const n0 = (await doc()).clips.length;
    // un punto lontano dai tagli (vicino a un taglio il blocco si centrerebbe lì)
    const lontano = await page.evaluate(() => {
      const d = window.__dpv.doc, video = new Set(d.tracks.filter((t) => t.kind === 'video').map((t) => t.id));
      const bordi = d.clips.filter((c) => video.has(c.track)).flatMap((c) => [c.start, c.start + c.len]);
      for (let f = 30; f < 400; f++) if (bordi.every((b) => Math.abs(b - f) > 18)) return f;
      return 60;
    });
    await trascina('.carta.fxt[data-fx=scossa]', await xy(lontano, 'V1'));
    let dd = await doc();
    const tv1 = dd.tracks.find((t) => t.name === 'V1').id;
    const scossa = dd.clips.find((c) => c.fxb?.id === 'scossa');
    prova('la scossa trascinata sulla clip diventa un blocchetto sopra la clip (sulla V1)', !!scossa && scossa.track === tv1 && Math.abs(scossa.start - lontano) <= 3 && scossa.len === 13 && dd.clips.length === n0 + 1, JSON.stringify(scossa && { s: scossa.start, l: scossa.len, f: lontano }));
    prova('la scossa ha il suo suono (impatto) pronto, ma spento: gli FX partono muti', scossa?.fxb.suono === 'impatto' && scossa.fxb.audio === false, JSON.stringify(scossa?.fxb));
    const st = await page.evaluate((f) => { const s = window.__dpvTest.B.statoEffetti(window.__dpv.doc, f, window.__dpv.doc.tracks.find((t) => t.name === 'V1').id); return s && { zoom: s.zoom, dx: s.dx }; }, scossa.start + 2);
    prova('sotto la scossa l\'immagine trema (e zooma per non mostrare i bordi)', !!st && st.zoom > 1 && st.dx !== 0, JSON.stringify(st));
    // l'altoparlante sul blocco: un clic lo spegne, un altro lo riaccende
    {
      const rb = await page.evaluate((id) => window.__dpvTest.ui().tl.rettBlocco(id), scossa.id);
      prova('il blocchetto sta in basso sulla riga, con l\'altoparlante', !!rb?.sp, JSON.stringify(rb));
      if (rb?.sp) {
        await page.mouse.click(box.x + rb.sp.x + rb.sp.s / 2, box.y + rb.sp.y + rb.sp.s / 2);
        await page.waitForTimeout(150);
        dd = await doc();
        const acceso = dd.clips.find((c) => c.id === scossa.id).fxb.audio === true;
        await page.mouse.click(box.x + rb.sp.x + rb.sp.s / 2, box.y + rb.sp.y + rb.sp.s / 2);
        await page.waitForTimeout(150);
        dd = await doc();
        prova('un clic sull\'altoparlante accende il suono dell\'FX, un altro lo rispegne', acceso && dd.clips.find((c) => c.id === scossa.id).fxb.audio === false && dd.clips.find((c) => c.id === scossa.id).start === scossa.start);
        // tasto destro sull'altoparlante: il menu piccolo dei suoni (passandoci sopra si sentono)
        await page.mouse.click(box.x + rb.sp.x + rb.sp.s / 2, box.y + rb.sp.y + rb.sp.s / 2, { button: 'right' });
        await page.waitForTimeout(200);
        const menuSuoni = await page.textContent('.menu-contesto').catch(() => '');
        await page.hover('.menu-contesto .voce:has-text("Whoosh")');
        await page.click('.menu-contesto .voce:has-text("Whoosh")');
        dd = await doc();
        const sc = dd.clips.find((c) => c.id === scossa.id).fxb;
        prova('tasto destro sull\'altoparlante: il menu dei suoni, e il suono scelto si accende', menuSuoni.includes('Campanella') && sc.suono === 'whoosh' && sc.audio === true, JSON.stringify(sc));
      }
    }
    // un lampo vicino al taglio dove c'è già la tendina: si centra sul taglio, sopra la tendina (non si coprono)
    const terza = solide(dd, tv1).sort((a, b) => a.start - b.start)[2];
    const fx0 = dd.clips.filter((c) => c.kind === 'fx').length;
    await trascina('.carta.fxt[data-fx=flash]', await xy(terza.start + 2, 'V1'));
    dd = await doc();
    const lampo = dd.clips.filter((c) => c.fxb?.id === 'flash').sort((a, b) => Math.abs(a.start + a.len / 2 - terza.start) - Math.abs(b.start + b.len / 2 - terza.start))[0];
    prova('il lampo vicino a un taglio si centra proprio lì', !!lampo && lampo.track === tv1 && Math.abs(lampo.start + lampo.len / 2 - terza.start) <= 1, JSON.stringify(lampo && { s: lampo.start, l: lampo.len, t: terza.start }));
    prova('il lampo e la tendina stanno tutti e due sul taglio (uno sopra l\'altro)', dd.clips.filter((c) => c.kind === 'fx').length === fx0 + 1 && !!bloccoSul(dd, terza.start));
    await tasto('Control+z');
    // "Al nero" lasciato verso la fine di una clip: finisce proprio con lei
    {
      const cl = solide(dd, tv1).sort((a, b) => a.start - b.start)[0];
      await trascina('.carta.fxt[data-fx=alNero]', await xy(cl.start + cl.len - 12, 'V1'));
      dd = await doc();
      const an = dd.clips.find((c) => c.fxb?.id === 'alNero');
      prova('"Al nero" vicino alla fine di una clip si attacca alla fine', !!an && an.start + an.len === cl.start + cl.len, JSON.stringify(an && { s: an.start, l: an.len, fine: cl.start + cl.len }));
      // spostando la clip il blocchetto la segue
      await page.evaluate(({ id }) => window.__dpv.edit('prova segui', (p) => window.__dpvTest.M.moveClips(p, window.__dpvTest.M.withLinked(p, [id]), 0, -1, 'video', 'libero')), { id: cl.id });
      dd = await doc();
      const an2 = dd.clips.find((c) => c.id === an?.id), cl2 = dd.clips.find((c) => c.id === cl.id);
      prova('spostando la clip su un\'altra traccia il suo FX la segue', !!an2 && an2.track === cl2.track && cl2.track !== tv1 && an2.start + an2.len === cl2.start + cl2.len, JSON.stringify({ an: an2 && [an2.track, an2.start], cl: [cl2.track, cl2.start] }));
      await tasto('Control+z'); await tasto('Control+z');
    }
    // Alt+Shift+trascina: la clip e tutto quello che viene dopo, su tutte le tracce, insieme
    {
      await page.evaluate(() => window.__dpv.select([]));
      dd = await doc();
      const seconda = solide(dd, tv1).sort((a, b) => a.start - b.start)[1];
      const dopo = dd.clips.filter((c) => (c.kind === 'fx' ? c.start + c.len / 2 : c.start) >= seconda.start).map((c) => [c.id, c.start]);
      const primaDi = dd.clips.filter((c) => c.kind !== 'fx' && c.start + c.len <= seconda.start).map((c) => [c.id, c.start]);
      const q = await xy(seconda.start + Math.round(seconda.len / 2), 'V1');
      const rv = await page.evaluate((id) => window.__dpvTest.ui().tl.riga(id), tv1);
      await page.keyboard.down('Alt'); await page.keyboard.down('Shift');
      await page.mouse.move(box.x + q.x, box.y + rv.y + 8);
      await page.mouse.down();
      await page.mouse.move(box.x + q.x + 60, box.y + rv.y + 8, { steps: 6 });
      await page.mouse.up();
      await page.keyboard.up('Shift'); await page.keyboard.up('Alt');
      dd = await doc();
      const dfs = new Set(dopo.map(([id, s0]) => dd.clips.find((c) => c.id === id).start - s0));
      const fermi = primaDi.every(([id, s0]) => dd.clips.find((c) => c.id === id).start === s0);
      const df = [...dfs][0];
      prova('Alt+Shift+trascina sposta la clip e tutto quello dopo, su tutte le tracce, insieme', dfs.size === 1 && df > 5 && fermi && dopo.length > 8, JSON.stringify({ dfs: [...dfs], n: dopo.length, fermi }));
      await tasto('Control+z');
    }
    // i suoni degli FX: ci sono tutti, e nel mixaggio si sentono solo se accesi
    {
      const buf = await page.evaluate(() => window.__dpvTest.SU.tuttiISuoni().map((x) => { const d = x.buf?.getChannelData(0); let pk = 0; if (d) for (const v of d) pk = Math.max(pk, Math.abs(v)); return [x.id, Math.round(pk * 100) / 100, x.buf?.duration ?? 0]; }));
      prova('tredici suoni per gli FX, tutti pronti e a −6 dB', buf.length === 13 && buf.every(([, pk, d]) => pk > 0.3 && pk <= 0.51 && d > 0.3), JSON.stringify(buf));
      const mix = await page.evaluate(async () => {
        const { SU, mixaggio } = window.__dpvTest;
        const d = structuredClone(window.__dpv.doc);
        for (const t of d.tracks) if (t.kind === 'audio') t.mute = true;
        const r = d.rate.num / d.rate.den;
        const fl = d.clips.find((c) => c.fxb?.id === 'flash');
        fl.fxb.audio = true;
        const e = SU.suoniFx(d).find((x) => x.id === fl.id);
        const rms = async (pp) => { let s = 0, n = 0; for await (const b of mixaggio(pp, Math.max(0, e.at), e.at + 0.5)) { const x = b.getChannelData(0); for (const v of x) { s += v * v; n++; } } return Math.sqrt(s / Math.max(1, n)); };
        const on = await rms(d);
        fl.fxb.audio = false;
        const off = await rms(d);
        return { on, off, at: e?.at, picco: (fl.start + fl.len * 0.06) / r };
      });
      prova('il suono del lampo finisce nel mixaggio (e spento non si sente)', mix.on > 0.02 && mix.off < 0.002, JSON.stringify(mix));
    }
    // i chip della durata
    await page.click('.bin-durate .chip[data-d="2"]');
    await page.evaluate(() => { window.__dpv.select([]); window.__motore.vaiA(20); });
    await page.locator('.carta.fxt[data-fx=zoomLento]').click();
    dd = await doc();
    prova('con il chip "2 s" il blocco dura due secondi', dd.clips.some((c) => c.fxb?.id === 'zoomLento' && c.start === 20 && c.len === 50), JSON.stringify(dd.clips.filter((c) => c.fxb?.id === 'zoomLento').map((c) => [c.start, c.len])));
    await tasto('Control+z');
    await page.click('.bin-durate .chip[data-d="0"]');
    // il lampo della demo si vede nel monitor
    const lumA = async (f) => { await page.evaluate((f) => window.__motore.vaiA(f), f); let v = -1, prima = -2; for (let i = 0; i < 12 && v !== prima; i++) { prima = v; await page.waitForTimeout(250); v = await page.evaluate(() => { const px = new Uint8Array(64 * 36 * 4); window.__motore.rec.leggiPiccolo(64, 36, px); let s = 0; for (let i = 0; i < px.length; i += 4) s += px[i] + px[i + 1] + px[i + 2]; return Math.round(s / (64 * 36 * 3)); }); } return v; };
    const demoLampo = dd.clips.find((c) => c.fxb?.id === 'flash');
    const conLampo = await lumA(demoLampo.start + 1), senza = await lumA(demoLampo.start + demoLampo.len + 8);
    prova('il lampo schiarisce il fotogramma nel monitor', conLampo > senza + 40, `${conLampo} vs ${senza}`);
    await page.click('.bin-cat[data-c=tutto]');
  }

  console.log('▶ Testate, navigatore, dissolvenze');
  {
    prova('le testate sono strette: niente manopole né decibel', (await page.locator('.tl-testata .manopola').count()) === 0 && (await page.locator('.tl-testata.audio .tt-misura').count()) >= 1 && (await page.evaluate(() => getComputedStyle(document.querySelector('.timeline')).gridTemplateColumns)).startsWith('124px'));
    // il navigatore: si trascina la finestra e la timeline scorre
    await page.evaluate(() => { const tl = window.__dpvTest.ui().tl; tl.adattaTutto(); tl.zoom(4, 0); });
    await page.waitForTimeout(200);
    const nav = await page.locator('.tl-nav').boundingBox();
    prova('il navigatore in fondo è alto e comodo', nav.height >= 22);
    const s0 = await page.evaluate(() => window.__dpvTest.ui().tl.scrollF);
    const fin = await page.evaluate(() => { const tl = window.__dpvTest.ui().tl; const k = (tl.W - 4) / tl.totaleNav(); return 2 + tl.scrollF * k + 20; });
    await page.mouse.move(nav.x + fin, nav.y + nav.height / 2);
    await page.mouse.down();
    await page.mouse.move(nav.x + fin + 150, nav.y + nav.height / 2, { steps: 6 });
    await page.mouse.up();
    const s1 = await page.evaluate(() => window.__dpvTest.ui().tl.scrollF);
    prova('trascinando la finestra del navigatore la timeline scorre', s1 > s0 + 20, `${s0.toFixed(0)} → ${s1.toFixed(0)}`);
    await page.evaluate(() => document.dispatchEvent(new CustomEvent('dpv:adatta')));
    await page.waitForTimeout(200);
    // la maniglia della dissolvenza sulla prima clip audio
    const box = await page.locator('.tl-tela').boundingBox();
    const q = await page.evaluate(() => { const tl = window.__dpvTest.ui().tl, d = window.__dpv.doc; const a1 = d.tracks.find((t) => t.name === 'A1'); const r = tl.riga(a1.id); const c = d.clips.filter((x) => x.track === a1.id).sort((a, b) => a.start - b.start)[1]; return { x: (c.start + c.fadeIn - tl.scrollF) * tl.ppf + (c.fadeIn ? 0 : 5), y: r.y + 2 + 5, id: c.id, f0: c.fadeIn }; });
    await page.mouse.move(box.x + q.x, box.y + q.y);
    await page.mouse.down();
    await page.mouse.move(box.x + q.x + 40, box.y + q.y, { steps: 5 });
    await page.mouse.up();
    let dd = await doc();
    prova('tirando il quadratino in alto la clip entra in dissolvenza', dd.clips.find((c) => c.id === q.id).fadeIn > q.f0 + 5, `${q.f0} → ${dd.clips.find((c) => c.id === q.id).fadeIn}`);
    await tasto('Control+z');
    // il fade out trascinato dal contenitore su una clip audio
    await page.click('.bin-cat[data-c=effetti]');
    await page.waitForTimeout(200);
    const c2 = await page.evaluate(() => { const tl = window.__dpvTest.ui().tl, d = window.__dpv.doc; const a1 = d.tracks.find((t) => t.name === 'A1'); const r = tl.riga(a1.id); const c = d.clips.filter((x) => x.track === a1.id).sort((a, b) => a.start - b.start)[1]; return { x: (c.start + c.len * 0.8 - tl.scrollF) * tl.ppf, y: r.y + r.h * 0.6, id: c.id }; });
    await page.locator('.carta.fx', { hasText: 'Fade out' }).first().scrollIntoViewIfNeeded();
    const carta = await page.locator('.carta.fx', { hasText: 'Fade out' }).first().boundingBox();
    await page.mouse.move(carta.x + carta.width / 2, carta.y + carta.height / 2);
    await page.mouse.down();
    await page.mouse.move(carta.x + 60, carta.y + 40, { steps: 4 });
    await page.mouse.move(box.x + c2.x, box.y + c2.y, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(200);
    dd = await doc();
    prova('"Fade out" trascinato sulla clip audio: esce piano (1 s)', dd.clips.find((c) => c.id === c2.id).fadeOut === 25, dd.clips.find((c) => c.id === c2.id).fadeOut);
    await tasto('Control+z');
    await page.click('.bin-cat[data-c=tutto]');
    // i progetti di prima: le transizioni delle clip diventano blocchetti, la corsia FX a parte sparisce
    const mig = await page.evaluate(() => {
      const { P, B } = window.__dpvTest;
      const p = P.newProject({ w: 1920, h: 1080, rate: { num: 25, den: 1 }, drop: false });
      const v1 = p.tracks.find((t) => t.name === 'V1');
      const a = P.newClip('color', v1.id, 0, 50), b = P.newClip('color', v1.id, 50, 50);
      b.trIn = P.newTransition('mix', 20);
      p.clips.push(a, b);
      // la corsia FX della 1.0.4, con un lampo sopra il taglio
      const fx = P.newTrack('fx', 'FX');
      p.tracks.unshift(fx);
      p.clips.push(P.newClip('fx', fx.id, 45, 10, { fxb: { tipo: 'effetto', id: 'flash', forza: 1, colore: '#ffffff' } }));
      B.migraBlocchi(p);
      const tr = p.clips.find((c) => c.fxb?.tipo === 'transizione'), fl = p.clips.find((c) => c.fxb?.id === 'flash');
      return { fx: p.tracks.some((t) => t.kind === 'fx'), tr: tr && [tr.start, tr.len, tr.fxb.id, tr.track === v1.id], fl: fl && [fl.track === v1.id, fl.fxb.suono, fl.fxb.audio], trIn: !!b.trIn };
    });
    prova('i progetti di prima: la transizione della clip diventa un blocchetto', !mig.trIn && mig.tr?.[0] === 50 && mig.tr[1] === 20 && mig.tr[2] === 'mix' && mig.tr[3], JSON.stringify(mig));
    prova('i progetti di prima: la corsia FX sparisce, il lampo scende sulla V1 col suono pronto ma spento', !mig.fx && mig.fl?.[0] === true && mig.fl[1] === 'zap' && mig.fl[2] === false, JSON.stringify(mig));
  }

  console.log('▶ Pagina Finale');
  {
    await page.click('.pagina-btn[data-p=finale]');
    await page.waitForTimeout(500);
    prova('la pagina Finale si apre col riepilogo', await page.isVisible('.finale .fin-riepilogo') && (await page.textContent('.fin-riepilogo')).includes('durata'));
    await page.locator('.fin-look', { hasText: 'Cinema' }).click();
    let dd = await doc();
    prova('il look Cinema vale per tutto il montaggio', dd.master?.look === 'cinema');
    let lum = 0;
    await page.evaluate(() => window.__motore.vaiA(60));
    for (let i = 0; i < 20 && lum <= 15; i++) {
      await page.waitForTimeout(200);
      lum = await page.evaluate(() => { const px = new Uint8Array(64 * 36 * 4); window.__motore.rec.leggiPiccolo(64, 36, px); let s = 0; for (let i = 0; i < px.length; i += 4) s += px[i] + px[i + 1] + px[i + 2]; return s / (64 * 36 * 3); });
    }
    prova('col colore finale il monitor mostra l\'immagine', lum > 15, lum.toFixed(1));
    await page.screenshot({ path: path.join(OUT, 'finale.png') });
    await tasto('Control+z');
    dd = await doc();
    prova('Ctrl+Z toglie anche il look', dd.master?.look === 'nessuno');
    // il menu a destra: sottotitoli
    prova('il Finale ha il menu a destra con sette pagine', (await page.locator('.fin-menu .fin-voce').count()) === 7);
    await page.click('.fin-voce[data-s=sottotitoli]');
    await page.waitForTimeout(200);
    await page.evaluate(() => window.__motore.vaiA(40));
    await page.click('text=+ Riga al cursore');
    await page.waitForTimeout(200);
    await page.locator('.sott-testo').first().fill('Ciao da Napoli');
    await page.waitForTimeout(600);
    dd = await doc();
    prova('una riga di sottotitolo al cursore, col testo scritto', dd.sottotitoli?.righe.length === 1 && dd.sottotitoli.righe[0].da === 40 && dd.sottotitoli.righe[0].testo === 'Ciao da Napoli');
    const srt = await page.evaluate(() => { const { S } = window.__dpvTest; const t = S.creaSrt(window.__dpv.doc); return { t, n: S.leggiSrt(t, window.__dpv.doc).length }; });
    prova('il .srt si scrive e si rilegge', srt.t.includes('00:00:01,600 --> ') && srt.t.includes('Ciao da Napoli') && srt.n === 1, srt.t.split('\n').slice(0, 3).join(' / '));
    await page.click('text=Prepara i tempi dai dialoghi');
    await page.waitForTimeout(300);
    dd = await doc();
    prova('i tempi dai dialoghi preparano le righe dove si sente l\'audio', dd.sottotitoli.righe.length > 1, dd.sottotitoli.righe.length);
    await page.screenshot({ path: path.join(OUT, 'finale-sottotitoli.png') });
    await tasto('Control+z');
    // i sottotitoli scritti dall'AI (qui con un Whisper finto: il modello vero si scarica da internet)
    await page.evaluate(() => {
      window.__sentito = [];
      window.__dpvTest.V.impostaTrascrittore({
        carica: async (modello, stato) => { stato('Scarico il modello: 1 di 2 MB', 0.5); window.__modello = modello; return 'wasm'; },
        trascrivi: async (audio, lingua, traduci) => {
          let e = 0; for (let i = 0; i < audio.length; i++) e += audio[i] * audio[i];
          window.__sentito.push({ n: audio.length, rms: Math.sqrt(e / Math.max(1, audio.length)), lingua, traduci });
          if (window.__sentito.length > 1) return [];
          return [
            { da: 0.5, a: 3, testo: ' Buonasera Napoli' },
            { da: 3.2, a: 3.9, testo: '[Musica]' },
            { da: 4, a: 14, testo: 'Questa è una frase lunga lunga che dura dieci secondi e non ci sta in una riga sola del sottotitolo, quindi va spezzata' },
          ];
        },
      });
    });
    await page.click('text=Scrivi i sottotitoli con l\'AI');
    await page.waitForTimeout(300);
    if (await page.isVisible('.velo')) await page.click('.velo >> text=Rifalle');
    await page.waitForFunction(() => (window.__dpv.doc.sottotitoli?.righe ?? []).some((r) => r.testo === 'Buonasera Napoli'), null, { timeout: 30000 }).catch(() => {});
    {
      dd = await doc();
      const ai = await page.evaluate(() => ({ sentito: window.__sentito, modello: window.__modello, fine: window.__dpvTest.P.projectEnd(window.__dpv.doc) / 25 }));
      const righe = dd.sottotitoli?.righe ?? [];
      const n16 = ai.sentito.reduce((s, x) => s + x.n, 0) / 16000;
      prova('l\'AI ascolta la presa diretta a 16 kHz (non muta, lunga quanto il montaggio)', ai.sentito.length >= 1 && Math.abs(n16 - ai.fine) < 0.6 && ai.sentito[0].rms > 0.005 && ai.sentito[0].lingua === 'it' && !ai.sentito[0].traduci && ai.modello === 'onnx-community/whisper-base', JSON.stringify({ ...ai, n16 }));
      prova('le parole diventano righe coi tempi giusti', righe[0]?.testo === 'Buonasera Napoli' && righe[0].da === 13 && righe[0].a === 75, JSON.stringify(righe.slice(0, 2)));
      prova('niente "[Musica]", e la frase lunga si spezza in più righe', !righe.some((r) => /musica/i.test(r.testo)) && righe.length >= 3 && righe.slice(1).every((r) => r.testo.length <= 90), righe.map((r) => r.testo).join(' | '));
    }
    await tasto('Control+z');
    await page.evaluate(() => window.__dpvTest.V.impostaTrascrittore(null));
    // il logo: un'immagine del contenitore nell'angolo
    await page.click('.fin-voce[data-s=logo]');
    await page.evaluate(async () => {
      const c = new OffscreenCanvas(200, 80); const x = c.getContext('2d'); x.fillStyle = '#ffd54a'; x.fillRect(0, 0, 200, 80);
      const b = await c.convertToBlob({ type: 'image/png' });
      await window.__dpvTest.importaFile([{ name: 'logo.png', file: new File([b], 'logo.png', { type: 'image/png' }) }], { chiediFormato: false });
    });
    await page.waitForTimeout(300);
    const idLogo = await page.evaluate(() => window.__dpv.doc.media.find((m) => m.name === 'logo.png').id);
    await page.selectOption('.fin-pagina[data-s=logo] select', idLogo);
    dd = await doc();
    prova('il logo scelto sta in un angolo', dd.master?.logo?.media === idLogo && dd.master.logo.pos === 'alto-dx');
    await tasto('Control+z');
    // apertura: il titolo d'apertura sposta avanti tutto di tre secondi
    await page.click('.fin-voce[data-s=apertura]');
    const fine0 = await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc));
    await page.click('text=Titolo d\'apertura');
    const fine1 = await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc));
    dd = await doc();
    prova('il titolo d\'apertura entra all\'inizio e sposta avanti il resto', fine1 === fine0 + 75 && dd.clips.some((c) => c.kind === 'title' && c.start === 0 && c.name.includes('apertura')), `${fine0} → ${fine1}`);
    await tasto('Control+z');
    await page.click('.fin-voce[data-s=lingue]');
    prova('Lingue e AI: i sottotitoli con l\'AI pronti (il doppiaggio arriverà)', (await page.locator('.fin-presto.pronto').count()) === 2 && (await page.locator('.fin-presto[disabled]').count()) === 1);
    // le novità della versione (dal CHANGELOG dentro l'app) e il confronto fra versioni
    {
      const cmp = await page.evaluate(() => { const { AG } = window.__dpvTest; return [AG.piuNuova('1.0.10', '1.0.9'), AG.piuNuova('1.0.5', '1.0.5'), AG.piuNuova('1.0.4', '1.0.5'), /proxy/i.test(AG.noteDi('1.0.4')?.note ?? '')]; });
      prova('le versioni si confrontano bene (1.0.10 dopo 1.0.9) e il CHANGELOG viaggia nell\'app', JSON.stringify(cmp) === '[true,false,false,true]', JSON.stringify(cmp));
      await page.click('.voce-menu:has-text("Aiuto")');
      await page.click('.tendina .voce:has-text("Novità della")');
      await page.waitForSelector('.dialogo.novita');
      const testo = await page.textContent('.dialogo.novita');
      prova('Aiuto → Novità: le novità della versione dal CHANGELOG', testo.includes('FX') && (await page.locator('.dialogo.novita li').count()) > 5, testo.slice(0, 120));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
    }
    await page.click('.fin-voce[data-s=colore]');
    await page.click('.pagina-btn[data-p=montaggio]');
    await page.waitForTimeout(300);
  }

  console.log('▶ 1.0.6: effetti che si sommano, menu, sottotitoli in timeline, timeline multiple, LIVE');
  {
    await page.evaluate(() => { window.__dpv.select([]); document.dispatchEvent(new CustomEvent('dpv:adatta')); });
    let dd = await doc();
    const tv1 = dd.tracks.find((t) => t.name === 'V1').id;
    const c0 = solide(dd, tv1).sort((a, b) => a.start - b.start)[0];
    // gli effetti al volo della clip si sommano: B/N e Caldo insieme, e un look vecchio resta
    await page.evaluate((id) => { window.__dpv.edit('look vecchio', (p) => { p.clips.find((c) => c.id === id).fx.look = 'vhs'; }); }, c0.id);
    await page.click('.bin-cat[data-c=effetti]');
    await page.waitForTimeout(200);
    await page.evaluate((id) => window.__dpv.select([id]), c0.id);
    for (const nome of ['Bianco e nero', 'Caldo']) { await page.locator('.carta.fx', { hasText: nome }).first().scrollIntoViewIfNeeded(); await page.locator('.carta.fx', { hasText: nome }).first().click(); await page.waitForTimeout(120); }
    dd = await doc();
    const fx0 = dd.clips.find((c) => c.id === c0.id).fx;
    const eff = await page.evaluate((fx) => window.__dpvTest.FE.fxEffettivo(fx), fx0);
    prova('gli effetti della clip si sommano: B/N + Caldo + il VHS di prima, tutti insieme', (fx0.effetti ?? []).includes('bn') && fx0.effetti.includes('caldo') && eff.looks === (1 | 4) && Math.abs(eff.temp - 0.4) < 1e-6, JSON.stringify({ e: fx0.effetti, looks: eff.looks, temp: eff.temp }));
    await tasto('Control+z'); await tasto('Control+z'); await tasto('Control+z');
    await page.click('.bin-cat[data-c=tutto]');
    // due lampi sullo stesso punto si fondono (più forti di uno solo)
    const due = await page.evaluate((tv1) => {
      const { P, B } = window.__dpvTest;
      const p = structuredClone(window.__dpv.doc);
      p.clips = p.clips.filter((c) => c.kind !== 'fx');
      const b1 = B.posaBlocco(p, { ...B.nuovoBlocco('effetto', 'flash'), forza: 0.5 }, 200, 20, tv1);
      const uno = B.statoEffetti(p, 205, tv1).flash;
      B.posaBlocco(p, { ...B.nuovoBlocco('effetto', 'flash'), forza: 0.5, colore: '#ff0000' }, 200, 20, tv1);
      const st = B.statoEffetti(p, 205, tv1);
      B.posaBlocco(p, B.nuovoBlocco('effetto', 'onda'), 200, 20, tv1);
      const conOnda = B.statoEffetti(p, 205, tv1);
      void b1; void P;
      return { uno, due: st.flash, rosso: st.flashCol[0] > st.flashCol[1], onda: conOnda.onda };
    }, tv1);
    prova('gli FX a blocchetti sullo stesso punto si sommano (due lampi più forti di uno, i colori si mescolano)', due.due > due.uno + 0.05 && due.rosso && due.onda > 0, JSON.stringify(due));
    // gli effetti nuovi (luci e distorsioni) e le transizioni nuove si disegnano senza errori
    const nErr = errori.length;
    for (const id of ['bagliore', 'flare', 'neon', 'caleido', 'vortice', 'zoomSfocato']) {
      await page.evaluate(({ id, tv1 }) => window.__dpv.edit('prova fx', (p) => { const c = window.__dpvTest.B.posaBlocco(p, window.__dpvTest.B.nuovoBlocco('effetto', id), 30, 40, tv1); c.name = '__prova'; }), { id, tv1 });
      await page.evaluate(() => window.__motore.vaiA(45));
      await page.waitForTimeout(250);
      await page.evaluate(() => window.__dpv.edit('via', (p) => { p.clips = p.clips.filter((c) => c.name !== '__prova'); }));
    }
    prova('ci sono le luci e le distorsioni nuove, e si disegnano', (await page.evaluate(() => window.__dpvTest.B.EFFETTI_TEMPO.length)) >= 36 && errori.length === nErr, errori.slice(nErr).join(' | '));
    const mt = await page.evaluate(() => {
      const G = window.__dpvTest.G;
      const spec = { text: 'Ciao Napoli', style: 'macchina', font: 'Rajdhani', size: 60, color: '#fff', outline: 'none', shadow: false, box: false, boxColor: '#000', align: 'center', y: 0.5 };
      return { parziale: G.specAlTempo(spec, 0.25).text, intero: G.specAlTempo(spec, 5).text, salto: G.motoTitolo({ ...spec, style: 'rimbalzo' }, 100, 100, 1920, 1080, 0.1, 4).scala, neon: G.motoTitolo({ ...spec, style: 'neon' }, 100, 100, 1920, 1080, 3, 4).alfa };
    });
    prova('i titoli nuovi si muovono: macchina da scrivere lettera per lettera, rimbalzo, neon', mt.parziale === 'Ciao' && mt.intero === 'Ciao Napoli' && mt.salto < 1 && mt.neon === 1, JSON.stringify(mt));
    // il menu col tasto destro resta dentro lo schermo (anche il sottomenu dei suoni)
    await page.setViewportSize({ width: 1600, height: 700 });
    await page.waitForTimeout(400);
    const bl = await page.evaluate(() => { const d = window.__dpv.doc; const b = d.clips.find((c) => c.kind === 'fx'); return b && window.__dpvTest.ui().tl.rettBlocco(b.id); });
    const box = await page.locator('.tl-tela').boundingBox();
    await page.mouse.click(box.x + bl.x + bl.w / 2 - 6, box.y + bl.y + bl.h / 2, { button: 'right' });
    await page.waitForTimeout(200);
    await page.hover('.menu-contesto .voce:has-text("Suono")');
    await page.waitForTimeout(250);
    const rm = await page.evaluate(() => { const r = [...document.querySelectorAll('.menu-contesto')].map((m) => m.getBoundingClientRect()).filter((r) => r.height > 0); return { fuori: r.filter((x) => x.bottom > innerHeight + 1 || x.right > innerWidth + 1).length, n: r.length }; });
    prova('il menu e il sottomenu dei suoni stanno dentro lo schermo (niente sotto la barra di Windows)', rm.n >= 2 && rm.fuori === 0, JSON.stringify(rm));
    await page.keyboard.press('Escape');
    await page.mouse.click(5, 5);
    await page.setViewportSize({ width: 1600, height: 950 });
    await page.waitForTimeout(400);
    // clic su una clip: le sue impostazioni nel pannello a destra (anche se era chiuso)
    await page.evaluate(() => document.querySelector('#app').classList.add('senza-lato'));
    const rv = await page.evaluate((id) => { const tl = window.__dpvTest.ui().tl; const d = window.__dpv.doc; const c = d.clips.find((x) => x.id === id); const r = tl.riga(c.track); return { x: (c.start + c.len * 0.5 - tl.scrollF) * tl.ppf, y: r.y + 8 }; }, c0.id);
    const box2 = await page.locator('.tl-tela').boundingBox();
    await page.mouse.click(box2.x + rv.x, box2.y + rv.y);
    await page.waitForTimeout(300);
    prova('clic su una clip: il pannello a destra si apre con le sue proprietà', await page.evaluate(() => !document.querySelector('#app').classList.contains('senza-lato') && document.querySelector('.lato .scheda.attiva')?.dataset.s === 'clip'));
    // i sottotitoli nella timeline: si trascinano, si uniscono, si dividono
    await page.evaluate(() => window.__dpv.edit('sottotitoli di prova', (p) => { p.sottotitoli = { righe: [{ id: 'sa', da: 50, a: 90, testo: 'Buonasera' }, { id: 'sb', da: 100, a: 140, testo: 'Napoli' }], nelVideo: true, dimensione: 46, fascia: true, alto: false, lingua: 'it' }; }));
    await page.waitForTimeout(300);
    const rs = await page.evaluate(() => { const tl = window.__dpvTest.ui().tl; tl.righe(window.__dpv.doc); return { rs: tl.rigaSott, x: (60 - tl.scrollF) * tl.ppf, ppf: tl.ppf }; });
    prova('la riga dei sottotitoli compare nella timeline', !!rs.rs && (await page.locator('.tl-testata.sott').count()) === 1, JSON.stringify(rs));
    const box3 = await page.locator('.tl-tela').boundingBox();
    await page.mouse.move(box3.x + rs.x + 3, box3.y + rs.rs.y + rs.rs.h / 2);
    await page.mouse.down();
    await page.mouse.move(box3.x + rs.x + 3 + 5 * rs.ppf, box3.y + rs.rs.y + rs.rs.h / 2, { steps: 4 });
    await page.mouse.up();
    dd = await doc();
    const sa = dd.sottotitoli.righe.find((r) => r.id === 'sa');
    prova('trascinando il sottotitolo nella timeline si sposta (senza entrare nel successivo)', sa.da > 50 && sa.a - sa.da === 40 && sa.a <= 100, JSON.stringify(sa));
    const uni = await page.evaluate(() => { const S = window.__dpvTest.SOT; const s = structuredClone(window.__dpv.doc.sottotitoli); const id = S.unisciRighe(s, ['sa']); const r = s.righe.find((x) => x.id === id); const testo = r.testo, n = s.righe.length; const d2 = S.dividiRiga(s, id, r.da + 20); return { testo, n, d2: !!d2, dopo: s.righe.length }; });
    prova('unire due righe le fa apparire insieme (a capo), dividerle le separa', uni.testo === 'Buonasera\nNapoli' && uni.n === 1 && uni.d2 && uni.dopo === 2, JSON.stringify(uni));
    await tasto('Control+z'); await tasto('Control+z');
    // più timeline: una nuova vuota, poi si torna alla prima com'era
    const n0 = (await doc()).clips.length;
    await page.click('.tl-scheda.piu');
    await page.click('.menu-contesto .voce:has-text("vuota")');
    const t0 = Date.now();
    await page.waitForFunction(() => document.querySelectorAll('.tl-scheda').length === 3, null, { timeout: 4000 }).catch(() => {});
    const attesa = Date.now() - t0;
    dd = await doc();
    const vuota = { attesa, clip: dd.clips.length, seq: dd.sequenze?.length, schede: await page.locator('.tl-scheda').count() };
    const nuovaVuota = vuota.clip === 0 && vuota.seq === 2 && vuota.schede === 3;
    await page.locator('.tl-scheda', { hasText: 'Montaggio 1' }).click();
    await page.waitForTimeout(300);
    dd = await doc();
    prova('più timeline: una nuova parte vuota, la prima torna com\'era', nuovaVuota && dd.clips.length === n0 && dd.seqAttiva === dd.sequenze[0].id, JSON.stringify({ n0, ora: dd.clips.length, seq: dd.sequenze?.map((s) => s.nome), vuota }));
    await tasto('Control+z'); await tasto('Control+z');
    dd = await doc();
    prova('annulla toglie la timeline nuova', (dd.sequenze?.length ?? 1) === 1 && dd.clips.length === n0);
    // LIVE: registra (con uno schermo finto), pausa, riprendi, ferma: finisce nel contenitore e in fondo alla timeline
    await page.evaluate(() => {
      window.__dpvTest.LV.impostaSorgenteLive(async () => {
        // la tela sta nella pagina (piccola in un angolo): staccata, Chromium smette presto di darne i fotogrammi
        const c = document.createElement('canvas'); c.width = 640; c.height = 360; c.className = 'tela-live-prova';
        c.style.cssText = 'position:fixed;left:0;top:0;width:64px;height:36px;z-index:9999;pointer-events:none';
        document.body.append(c);
        const x = c.getContext('2d'); let n = 0;
        window.__giroLive = setInterval(() => { n++; x.fillStyle = `hsl(${n * 4 % 360} 70% 45%)`; x.fillRect(0, 0, 640, 360); }, 33);
        return c.captureStream(30);
      }, async () => { const ctx = new AudioContext(); const o = ctx.createOscillator(); const d = ctx.createMediaStreamDestination(); o.connect(d); o.start(); return d.stream; });
    });
    const fineP = await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc));
    const nm = (await doc()).media.length;
    await page.click('.pagina-btn[data-p=live]');
    await page.click('.live-btn.reg');
    await page.waitForTimeout(1600);
    await page.click('.live-tasti .live-btn:nth-child(2)');
    await page.waitForTimeout(900);
    const inPausa = await page.evaluate(() => document.querySelector('.live').classList.contains('in-pausa'));
    await page.click('.live-tasti .live-btn:nth-child(2)');
    await page.waitForTimeout(900);
    await page.click('.live-btn.ferma');
    await page.evaluate(() => window.__dpvTest.ui().live.ultima);
    await page.evaluate(() => { clearInterval(window.__giroLive); document.querySelector('.tela-live-prova')?.remove(); });
    dd = await doc();
    const regs = dd.media.slice(nm).filter((m) => m.name.startsWith('Registrazione'));
    const reg = regs[0];
    // quanto ha registrato l'app (pause escluse): il file deve durare quello, non quello più la pausa (~0,9 s)
    const registrato = await page.evaluate(() => window.__dpvTest.ui().live.durataUltima / 1000);
    const tracce = reg && await page.evaluate(async (id) => { const r = window.__dpvTest.mediaRT(id); return { v: await r.v.computeDuration(), a: r.a ? await r.a.computeDuration() : 0 }; }, reg.id);
    const inTl = reg && dd.clips.some((c) => c.media === reg.id && c.start === fineP);
    prova('LIVE: registra, pausa (senza buchi), ferma: un file solo, nel contenitore e in fondo alla timeline',
      inPausa && regs.length === 1 && Math.abs(reg.duration - registrato) < 0.5 && tracce.v > reg.duration - 0.5 && reg.hasAudio && inTl,
      JSON.stringify({ reg: regs.map((m) => [m.name, m.duration, m.hasAudio]), registrato, tracce, fineP, inTl }));
    await page.click('.pagina-btn[data-p=montaggio]');
    await page.waitForTimeout(300);
  }

  console.log('▶ Riproduzione');
  await page.evaluate(() => { window.__dpv.select([]); window.__motore.setMonitor('recorder'); window.__motore.vaiA(0); });
  await tasto('Space');
  await page.waitForTimeout(2000);
  const h = await page.evaluate(() => window.__dpv.head);
  await tasto('Space');
  prova('Spazio suona: il cursore avanza col tempo', h > 25 && h < 80, h.toFixed(1));
  await page.screenshot({ path: path.join(OUT, 'suona.png') });


  console.log('▶ Riproduzione: ripresa coi fotogrammi chiave radi (e il suo proxy)');
  {
    const pg = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    pg.on('pageerror', (e) => errori.push(e.message));
    await pg.goto(srv.url + '/app/');
    await pg.waitForSelector('.pulsantiera');
    await pg.waitForTimeout(800);
    await pg.evaluate(async () => {
      const T = window.__dpvTest;
      const f = await T.ripresaDiProva(16, 16);
      const [m] = await T.importaFile([{ name: f.name, file: f }], { chiediFormato: false });
      window.__dpv.edit('prova', (p) => { const v1 = p.tracks.filter((t) => t.kind === 'video').slice(-1)[0]; p.clips.push(T.P.newClip('media', v1.id, 0, 400, { media: m.id, name: m.name })); });
    });
    const suona = (da) => pg.evaluate(async (da) => {
      const m = window.__dpvTest.motore;
      m.vaiA(da);
      await new Promise((ok) => setTimeout(ok, 1200));
      const n0 = window.__dpvTest.statoDecoder().nati;
      const buf = new Uint8Array(32 * 18 * 4);
      const hash = () => { m.rec.leggiPiccolo(32, 18, buf); let h = 0; for (let i = 0; i < buf.length; i++) h = (h * 31 + buf[i]) | 0; return h; };
      m.play(1);
      const hs = [];
      for (let i = 0; i < 8; i++) { await new Promise((ok) => setTimeout(ok, 250)); hs.push(hash()); }
      m.stop();
      return { nati: window.__dpvTest.statoDecoder().nati - n0, diversi: new Set(hs).size };
    }, da);
    const a = await suona(250);
    prova('play dal mezzo di una ripresa col GOP lungo: il video si muove', a.diversi >= 4 && a.nati <= 3, JSON.stringify(a));
    const pronto = await pg.waitForFunction(() => window.__dpvTest.proxyStato(window.__dpv.doc.media[0].id) === 'pronto', null, { timeout: 120000 }).then(() => true, () => false);
    const px = await pg.evaluate(() => { const r = window.__dpvTest.mediaRT(window.__dpv.doc.media[0].id); return r.proxy ? [r.proxy.w, r.proxy.h] : null; });
    prova('il proxy automatico si fa da solo dietro le quinte', pronto && !!px && px[0] <= 960, JSON.stringify(px));
    const b = await suona(300);
    // col proxy (un fotogramma chiave ogni mezzo secondo), su una macchina lenta il flusso rimasto indietro riparte dal
    // fotogramma chiave dopo per restare a tempo con l'audio: qualche ripartenza va bene, a raffica no (il vecchio
    // difetto ne faceva una a ogni giro dello schermo: decine in due secondi, e l'immagine ferma)
    prova('col proxy il play parte subito anche dal mezzo (e non riparte a raffica)', b.diversi >= 4 && b.nati <= 6, JSON.stringify(b));
    await pg.close();
  }

  console.log('▶ EDL');
  const edl = await page.evaluate(() => window.__dpvTest.creaEdl(window.__dpv.doc));
  prova('la EDL ha titolo, FCM ed eventi', edl.startsWith('TITLE:') && edl.includes('FCM: NON-DROP FRAME') && /^001 /m.test(edl));
  prova('la EDL segna la dissolvenza (D)', /^\d{3} .* D +\d{3} /m.test(edl));
  fs.writeFileSync(path.join(OUT, 'montaggio.edl'), edl);

  console.log('▶ Export WebM');
  const esito = await page.evaluate(async () => {
    delete window.showSaveFilePicker;
    const { esporta } = window.__dpvTest;
    const p = window.__dpv.doc;
    let blob = null;
    const vecchio = URL.createObjectURL;
    URL.createObjectURL = (b) => { blob = b; return vecchio.call(URL, b); };
    const t0 = performance.now();
    await esporta(p, { formato: 'webm', w: 640, h: 360, qualita: 'media', soloInOut: false, nome: 'prova.webm' }, () => {}, () => false);
    URL.createObjectURL = vecchio;
    const secondi = (performance.now() - t0) / 1000;
    return { size: blob?.size ?? 0, secondi, url: blob ? URL.createObjectURL(blob) : null };
  });
  prova('export WebM prodotto', esito.size > 50000, `${esito.size} byte in ${esito.secondi.toFixed(1)} s`);
  if (esito.url) {
    const info = await page.evaluate(async (url) => {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], 'prova.webm', { type: 'video/webm' });
      const v = document.createElement('video');
      v.src = URL.createObjectURL(file);
      await new Promise((ok, ko) => { v.onloadedmetadata = ok; v.onerror = ko; });
      return { durata: v.duration, w: v.videoWidth, h: v.videoHeight };
    }, esito.url);
    const attesa = (await page.evaluate(() => window.__dpvTest.P.projectEnd(window.__dpv.doc))) / 25;
    prova('il WebM si rilegge: 640×360', info.w === 640 && info.h === 360, `${info.w}×${info.h}`);
    prova('il WebM dura quanto il montaggio', Math.abs(info.durata - attesa) < 0.3, `${info.durata} vs ${attesa}`);
  }

  console.log('▶ Salva e riapri');
  const rt = await page.evaluate(() => {
    const t = JSON.stringify(window.__dpv.doc);
    const p = JSON.parse(t);
    return { ok: p.format === 'daprod-video' && p.clips.length === window.__dpv.doc.clips.length, kb: t.length / 1024 };
  });
  prova('il progetto si serializza (.dpv)', rt.ok, rt.kb.toFixed(1) + ' kB');

  console.log('▶ Telefono');
  const tel = await browser.newPage({ viewport: { width: 400, height: 860 }, isMobile: true, hasTouch: true });
  await tel.goto(srv.url + '/app/');
  await tel.waitForSelector('.pulsantiera');
  await tel.waitForTimeout(1200);
  prova('sul telefono c\'è la barra in basso', await tel.isVisible('.barra-tel'));
  await tel.screenshot({ path: path.join(OUT, 'telefono.png') });
  await tel.close();

  console.log('▶ Home');
  const home = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await home.goto(srv.url + '/');
  await home.waitForTimeout(800);
  prova('la home ha il link al banco', (await home.locator('a[href*="app/"]').count()) > 0);
  await home.screenshot({ path: path.join(OUT, 'home.png'), fullPage: false });
  await home.close();

  prova('nessun errore nella pagina', errori.length === 0, errori.slice(0, 5).join(' | '));
} catch (e) {
  ko++;
  console.log('  ✗ la prova si è fermata:', e.message);
  await page.screenshot({ path: path.join(OUT, 'errore.png') }).catch(() => {});
} finally {
  await browser.close();
  srv.chiudi();
}
console.log(`\n${ok} prove superate, ${ko} fallite`);
process.exit(ko ? 1 : 0);
