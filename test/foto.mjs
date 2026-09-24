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
    await p.locator('.monitor.recorder .schermo').screenshot({ path: path.join(OUT, nome + '-iride.png') });
    await p.click('text=Strumenti');
    await p.waitForTimeout(800);
    await p.locator('.lato').screenshot({ path: path.join(OUT, nome + '-strumenti.png') });
  }
  await p.close();
}

await scatta('computer', { width: 1600, height: 950 });
await scatta('telefono', { width: 400, height: 860 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const h = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await h.goto(srv.url + '/');
await h.waitForTimeout(1200);
await h.screenshot({ path: path.join(OUT, 'home.png'), fullPage: true });
await browser.close();
srv.chiudi();
console.log('foto in', OUT);
