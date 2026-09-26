// Foto del banco di montaggio (computer e telefono) in test/.out/: servono al README e a controllare a occhio.
//   npm run build && node test/foto.mjs
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { servi } from './servi.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'test/.out');
fs.mkdirSync(OUT, { recursive: true });
const srv = await servi(path.join(ROOT, 'dist'));
const exe = process.env.CHROME || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function scatta(nome, viewport, extra = {}) {
  const p = await browser.newPage({ viewport, ...extra });
  await p.goto(srv.url + '/app/');
  await p.waitForSelector('.pulsantiera');
  await p.waitForTimeout(1500);
  await p.evaluate(() => document.dispatchEvent(new CustomEvent('dpv:demo')));
  await p.waitForFunction(() => window.__dpv.doc.clips.length >= 8, null, { timeout: 90000 });
  await p.waitForTimeout(1200);
  await p.addStyleTag({ content: '.avvisi{display:none!important}' });
  await p.evaluate(() => { window.__motore.vaiA(163); const c = window.__dpv.doc.clips.find((x) => x.name === 'Sottopancia'); if (c) window.__dpv.select([c.id]); });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(OUT, nome + '.png') });
  if (viewport.width > 1000) {
    await p.evaluate(() => window.__motore.vaiA(312));
    await p.waitForTimeout(1200);
    await p.locator('.monitor .schermo').screenshot({ path: path.join(OUT, nome + '-iride.png') });
    await p.click('text=Strumenti');
    await p.waitForTimeout(800);
    await p.locator('.lato').screenshot({ path: path.join(OUT, nome + '-strumenti.png') });
    await p.click('.lato .scheda[data-s=clip]');
    // il contenitore: gli effetti a blocchetti, col mouse sopra al lampo (l'anteprima si anima)
    await p.click('.bin-cat[data-c=effetti]');
    await p.waitForTimeout(400);
    const fx = await p.locator('.carta.fxt[data-fx=flash] .carta-img').boundingBox();
    await p.mouse.move(fx.x + fx.width / 2, fx.y + fx.height / 2);
    await p.waitForTimeout(500);
    await p.locator('.contenitore').screenshot({ path: path.join(OUT, nome + '-contenitore.png') });
    await p.click('.bin-cat[data-c=tutto]');
    // la pagina Finale: il look Cinema, un sottotitolo e il menu a destra
    await p.evaluate(() => { window.__motore.vaiA(210); window.__dpv.select([]); });
    await p.click('.pagina-btn[data-p=finale]');
    await p.locator('.fin-look', { hasText: 'Cinema' }).click();
    await p.click('.fin-voce[data-s=sottotitoli]');
    await p.click('text=+ Riga al cursore');
    await p.waitForTimeout(200);
    await p.locator('.sott-testo').first().fill('Napoli di notte, le luci della città');
    await p.waitForTimeout(700);
    await p.click('.fin-voce[data-s=colore]');
    await p.mouse.move(5, 5);
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(OUT, nome + '-finale.png') });
    // i sottotitoli scritti dall'AI
    await p.click('.fin-voce[data-s=sottotitoli]');
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(OUT, nome + '-sottotitoli.png') });
    await p.click('.fin-voce[data-s=colore]');
    await p.click('.pagina-btn[data-p=montaggio]');
    await p.waitForTimeout(600);
    // un blocchetto FX scelto: le sue proprietà, col suono
    await p.evaluate(() => { const c = window.__dpv.doc.clips.find((x) => x.fxb?.id === 'wipe:119'); if (c) window.__dpv.select([c.id]); window.__motore.vaiA(c ? c.start + 6 : 250); });
    await p.waitForTimeout(900);
    await p.locator('.lato').screenshot({ path: path.join(OUT, nome + '-blocco.png') });
    // la timeline stretta (tasto V)
    await p.keyboard.press('v');
    await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(OUT, nome + '-stretta.png') });
    await p.keyboard.press('v');
    // i sottotitoli nella timeline e le schede delle timeline
    await p.evaluate(() => window.__dpv.edit('sottotitoli', (pp) => { pp.sottotitoli = { righe: [{ id: 'f1', da: 30, a: 95, testo: 'Napoli di notte' }, { id: 'f2', da: 110, a: 190, testo: 'le luci della città' }, { id: 'f3', da: 205, a: 300, testo: '' }], nelVideo: true, dimensione: 46, fascia: true, alto: false, lingua: 'it' }; }));
    await p.evaluate(() => { window.__dpv.edit('seconda timeline', (pp) => { window.__dpvTest.SQ.nuovaSequenza(pp, true, 'Trailer 30 s'); window.__dpvTest.SQ.passaA(pp, pp.sequenze[0].id); }); document.dispatchEvent(new CustomEvent('dpv:adatta')); });
    await p.waitForTimeout(800);
    await p.locator('.timeline').screenshot({ path: path.join(OUT, nome + '-timeline.png') });
    // la pagina LIVE, con uno schermo finto
    await p.evaluate(() => {
      window.__dpvTest.LV.impostaSorgenteLive(async () => {
        const c = document.createElement('canvas'); c.width = 1280; c.height = 720;
        const x = c.getContext('2d'); let n = 0;
        setInterval(() => {
          n++;
          const g = x.createLinearGradient(0, 0, 1280, 720); g.addColorStop(0, '#1b2a4a'); g.addColorStop(1, '#3a1c52');
          x.fillStyle = g; x.fillRect(0, 0, 1280, 720);
          x.fillStyle = '#2b2940'; x.fillRect(60, 60, 1160, 600);
          x.fillStyle = '#ffd54a'; x.font = '700 54px sans-serif'; x.fillText('Il mio tutorial', 110, 160);
          x.fillStyle = '#c9c5d8'; x.font = '32px sans-serif';
          ['1. Apri il progetto', '2. Premi REGISTRA', '3. Spiega con calma'].forEach((t, i) => x.fillText(t, 110, 250 + i * 60));
          x.fillStyle = '#ff4d6d'; x.beginPath(); x.arc(900 + Math.sin(n / 10) * 120, 420 + Math.cos(n / 13) * 80, 18, 0, 7); x.fill();
        }, 33);
        return c.captureStream(30);
      }, async () => { const ctx = new AudioContext(); const d = ctx.createMediaStreamDestination(); return d.stream; });
    });
    await p.click('.pagina-btn[data-p=live]');
    await p.click('.live-btn.reg');
    await p.waitForTimeout(3300);
    await p.mouse.move(5, 5);
    await p.screenshot({ path: path.join(OUT, nome + '-live.png') });
    await p.click('.live-btn.ferma');
    await p.evaluate(() => window.__dpvTest.ui().live.ultima);
    await p.click('.pagina-btn[data-p=montaggio]');
    await p.waitForTimeout(600);
    // le novità della versione
    await p.click('.voce-menu:has-text("Aiuto")');
    await p.click('.tendina .voce:has-text("Novità della")');
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(OUT, nome + '-novita.png') });
  }
  await p.close();
}

await scatta('computer', { width: 1920, height: 1009 });
await scatta('telefono', { width: 400, height: 860 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const h = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await h.goto(srv.url + '/');
await h.waitForTimeout(1200);
await h.screenshot({ path: path.join(OUT, 'home.png'), fullPage: true });
await browser.close();
srv.chiudi();
console.log('foto in', OUT);
