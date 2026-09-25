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
  prova('otto clip nella timeline', d.clips.length === 8, d.clips.length);
  prova('video e audio legati', d.clips.filter((c) => c.link).length === 6);
  prova('una dissolvenza e una tendina a iride', d.clips.some((c) => c.trIn?.type === 'mix') && d.clips.some((c) => c.trIn?.pattern === 119));
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
    const yV1 = await page.evaluate(() => { const t = window.__dpv.doc.tracks; const i = t.findIndex((x) => x.name === 'V1'); return 34 + t.slice(0, i).reduce((s, x) => s + x.height, 0) + t[i].height / 2; });
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
    const dopoV = d.clips.filter((c) => d.tracks.find((t) => t.id === c.track).name === 'V1' && c.start >= 60).sort((a, b) => a.start - b.start)[0];
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
  const primoV = d.clips.filter((c) => c.track === v1).sort((a, b) => a.start - b.start)[0];
  const secondoV = d.clips.filter((c) => c.track === v1).sort((a, b) => a.start - b.start)[1];
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
  const taglio = d.clips.filter((c) => c.track === v1 && !c.trIn).sort((a, b) => a.start - b.start).find((c) => c.start > 0 && d.clips.some((x) => x.track === v1 && x.start + x.len === c.start));
  await page.evaluate(() => window.__dpv.select([]));
  await page.evaluate((f) => window.__motore.vaiA(f), taglio.start);
  await tasto('5');
  d = await doc();
  prova('5 mette la dissolvenza sul taglio sotto il cursore', d.clips.find((c) => c.id === taglio.id)?.trIn?.type === 'mix');

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
    const cubo = dd.clips.find((c) => c.id === taglio2.id);
    prova('clic su "Cubo 3D": effetto digitale sul taglio', cubo.trIn?.type === 'dve' && cubo.trIn?.pattern === 401, JSON.stringify(cubo.trIn));
    await page.evaluate((f) => window.__motore.vaiA(f), taglio2.start + Math.round(cubo.trIn.len / 2));
    let lum = 0;
    for (let i = 0; i < 25 && lum <= 8; i++) {
      await page.waitForTimeout(200);
      lum = await page.evaluate(() => { const px = new Uint8Array(64 * 36 * 4); window.__motore.rec.leggiPiccolo(64, 36, px); let s = 0; for (let i = 0; i < px.length; i += 4) s += px[i] + px[i + 1] + px[i + 2]; return s / (64 * 36 * 3); });
    }
    prova('a metà del cubo il Recorder mostra le due facce', lum > 8, lum.toFixed(1));
    await page.locator('.gen-voce', { hasText: '121 · Cuore' }).click();
    dd = await doc();
    prova('clic su "Cuore": diventa una tendina 121', dd.clips.find((c) => c.id === taglio2.id).trIn?.pattern === 121 && dd.clips.find((c) => c.id === taglio2.id).trIn?.type === 'wipe');
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
    const [c1, c2] = dd.clips.filter((c) => c.track === tv1).sort((x, y) => x.start - y.start);
    const n0 = dd.clips.length;
    // c2 spostata di 40 fotogrammi indietro, dentro c1: si ferma attaccata a c1
    await page.evaluate(({ id }) => window.__dpv.edit('prova libero', (p) => window.__dpvTest.M.moveClips(p, window.__dpvTest.M.withLinked(p, [id]), -40, 0, 'video', 'libero')), { id: c2.id });
    dd = await doc();
    const c2b = dd.clips.find((c) => c.id === c2.id);
    const sovrapposte = dd.clips.some((x) => dd.clips.some((y) => x !== y && x.track === y.track && x.start < y.start + y.len && y.start < x.start + x.len));
    prova('spostando una clip sopra un\'altra non si mangia niente', dd.clips.length === n0 && !sovrapposte && c2b.start === c1.start + c1.len, `start ${c2b.start}`);
    await tasto('Control+z');
    // una ripresa lasciata dove è occupato va su una traccia libera
    const m = dd.media[0];
    const nt = dd.tracks.length;
    await page.evaluate(({ id, f }) => { window.__dpv.edit('prova posa', (p) => window.__dpvTest.M.placeSource(p, { mediaId: id, srcIn: 0, srcOut: 2 }, f, null, { video: p.tracks.find((t) => t.name === 'V1').id, audio: [p.tracks.find((t) => t.name === 'A1').id] }, 'libero')); }, { id: m.id, f: 10 });
    dd = await doc();
    const nuoveV = dd.clips.filter((c) => c.start === 10 && c.media === m.id);
    const sovr2 = dd.clips.some((x) => dd.clips.some((y) => x !== y && x.track === y.track && x.start < y.start + y.len && y.start < x.start + x.len));
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
      let y = 34 - tl.scrollY, prima = null, riga = null;
      for (const t of d.tracks) { if (prima && prima.kind === 'video' && t.kind === 'audio') y += 10; if (t.name === 'A1') { riga = { y, h: t.height, id: t.id }; break; } y += t.height; prima = t; }
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
      let y = 34 - tl.scrollY;
      for (const t of d.tracks) { if (t.name === 'V1') { y += t.height / 2; break; } y += t.height; }
      const v1 = d.tracks.find((t) => t.name === 'V1').id;
      const c = d.clips.filter((x) => x.track === v1).sort((a, b) => b.start - a.start)[0];
      return { x: (c.start + c.len * 0.9 - tl.scrollF) * tl.ppf, y, id: c.id };
    });
    await page.mouse.move(carta.x + carta.width / 2, carta.y + carta.height / 2);
    await page.mouse.down();
    await page.mouse.move(carta.x + 60, carta.y + 30, { steps: 4 });
    await page.mouse.move(box.x + dove.x, box.y + dove.y, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(200);
    dd = await doc();
    prova('transizione trascinata sulla coda di una clip: esce in dissolvenza', dd.clips.find((c) => c.id === dove.id).trOut?.type === 'mix', JSON.stringify(dd.clips.find((c) => c.id === dove.id).trOut));
    await tasto('Control+z');
    await page.click('.bin-cat[data-c=tutto]');
  }

  console.log('▶ Transizione in coda ed effetti');
  {
    let dd = await doc();
    const tv1 = dd.tracks.find((t) => t.name === 'V1').id;
    const ultima = dd.clips.filter((c) => c.track === tv1).sort((x, y) => y.start - x.start)[0];
    const len0 = ultima.len;
    await page.evaluate((id) => window.__dpvTest.Z.applicaTransizione('dve', 301, { clipId: id, lato: 'out' }), ultima.id);
    dd = await doc();
    const u2 = dd.clips.find((c) => c.id === ultima.id);
    prova('transizione in coda sull\'ultima clip, senza cambiarne la durata', u2.trOut?.type === 'dve' && u2.len === len0);
    const strati = await page.evaluate(({ f }) => window.__dpvTest.pianoVideo(window.__dpv.doc, f).map((s) => ({ a: !!s.a, b: !!s.b, tr: !!s.tr })), { f: u2.start + u2.len - 3 });
    prova('in coda la clip esce su quello che c\'è sotto', strati.some((s) => s.a && !s.b && s.tr), JSON.stringify(strati));
    await tasto('Control+z');
    // effetto dal contenitore sulla clip scelta
    await page.evaluate((id) => window.__dpv.select([id]), ultima.id);
    await page.click('.bin-cat[data-c=effetti]');
    await page.locator('.carta.fx', { hasText: 'Bianco e nero' }).click();
    dd = await doc();
    prova('effetto dal contenitore: Bianco e nero sulla clip scelta', dd.clips.find((c) => c.id === ultima.id).fx.look === 'bn');
    const accesa = await page.waitForSelector('.carta.fx.acceso:has-text("Bianco e nero")', { timeout: 3000 }).then(() => true, () => false);
    prova('la carta dell\'effetto si accende', accesa);
    await tasto('Control+z');
    await page.click('.bin-cat[data-c=tutto]');
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
