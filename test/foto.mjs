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
