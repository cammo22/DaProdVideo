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

  console.log('▶ Recorder');
  await page.evaluate(() => window.__motore.vaiA(60));
  await page.waitForTimeout(900);
  const luce = await page.evaluate(() => {
    const px = new Uint8Array(64 * 36 * 4);
    window.__motore.rec.leggiPiccolo(64, 36, px);
    let s = 0; for (let i = 0; i < px.length; i += 4) s += px[i] + px[i + 1] + px[i + 2];
    return s / (64 * 36 * 3);
  });
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

  console.log('▶ Tasto 2: elimina');
  await page.evaluate((id) => window.__dpv.select([id]), sx.id);
  await tasto('2');
  d = await doc();
  prova('2 elimina la clip selezionata e la sua audio', d.clips.length === prima + 1 && !d.clips.some((c) => c.id === sx.id), d.clips.length);
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
