// Quando è stata scattata una foto: la data nei dati EXIF di un JPEG (DateTimeOriginal). Serve a mettere le foto in
// ordine cronologico anche quando il file è stato copiato e la sua data è cambiata. Niente librerie: si legge
// l'intestazione TIFF dentro il segmento APP1 e si cerca l'etichetta giusta.

const SEGNO_EXIF = [0x45, 0x78, 0x69, 0x66, 0, 0];

/** "2026:06:12 15:30:05" → millisecondi (come se l'ora fosse UTC: conta solo l'ordine) */
function daTesto(s: string): number | null {
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(s);
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  return Number.isFinite(t) && +m[1] > 1970 ? t : null;
}

/** la data di scatto in un JPEG (primi byte del file), o null */
export function dataExif(b: Uint8Array): number | null {
  if (b.length < 12 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 4 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marcatore = b[i + 1], len = (b[i + 2] << 8) | b[i + 3];
    if (marcatore === 0xe1 && SEGNO_EXIF.every((x, k) => b[i + 4 + k] === x)) return leggiTiff(b, i + 10, Math.min(b.length, i + 2 + len));
    if (marcatore === 0xda || marcatore === 0xd9) break;
    i += 2 + Math.max(2, len);
  }
  return null;
}

function leggiTiff(b: Uint8Array, base: number, fine: number): number | null {
  if (base + 8 > fine) return null;
  const le = b[base] === 0x49 && b[base + 1] === 0x49;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const u16 = (o: number) => dv.getUint16(o, le);
  const u32 = (o: number) => dv.getUint32(o, le);
  if (u16(base + 2) !== 42) return null;
  const testo = (off: number, n: number) => { let s = ''; for (let k = 0; k < n - 1 && off + k < fine; k++) s += String.fromCharCode(b[off + k]); return s; };
  /** cerca un'etichetta in un IFD: ritorna [tipo, quanti, posto dei dati] */
  const cerca = (ifd: number, tag: number): [number, number, number] | null => {
    if (ifd + 2 > fine) return null;
    const n = u16(ifd);
    for (let k = 0; k < n; k++) {
      const e = ifd + 2 + k * 12;
      if (e + 12 > fine) return null;
      if (u16(e) === tag) return [u16(e + 2), u32(e + 4), e + 8];
    }
    return null;
  };
  const data = (e: [number, number, number] | null) => {
    if (!e || e[0] !== 2) return null;
    const off = e[1] > 4 ? base + u32(e[2]) : e[2];
    return daTesto(testo(off, e[1]));
  };
  const ifd0 = base + u32(base + 4);
  const exifPtr = cerca(ifd0, 0x8769);
  if (exifPtr) {
    const d = data(cerca(base + u32(exifPtr[2]), 0x9003)) ?? data(cerca(base + u32(exifPtr[2]), 0x9004));
    if (d !== null) return d;
  }
  return data(cerca(ifd0, 0x0132));
}

/** la data di scatto di un file (le prime 128 KB bastano), o null */
export async function dataDiScatto(blob: Blob): Promise<number | null> {
  try { return dataExif(new Uint8Array(await blob.slice(0, 131072).arrayBuffer())); } catch { return null; }
}
