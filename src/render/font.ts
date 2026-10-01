// Nel canvas un carattere che non è ancora arrivato si disegna con quello di riserva: prima di disegnare le
// animazioni (monitor ed export) bisogna averli caricati. Qui si chiede al browser di caricarli tutti.
const FAMIGLIE = [
  '400 40px "Montserrat"', '500 40px "Montserrat"', '700 40px "Montserrat"', '900 40px "Montserrat"',
  '400 40px "Oswald"', '500 40px "Oswald"', '700 40px "Oswald"', '400 40px "Archivo Black"', '400 40px "Bebas Neue"',
  '400 40px "Space Mono"', '700 40px "Space Mono"', '400 40px "Playfair Display"', '700 40px "Playfair Display"', 'italic 400 40px "Playfair Display"',
  '400 40px "Cormorant Garamond"', '500 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"', '400 40px "Great Vibes"', '700 40px "Caveat"',
  '500 40px "Rajdhani"', '700 40px "Rajdhani"', '700 40px "Orbitron"',
];

let pronto: Promise<void> | null = null;

/** carica tutti i caratteri delle animazioni (una volta sola) */
export function caricaFontAnimazioni(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return Promise.resolve();
  pronto ??= Promise.all(FAMIGLIE.map((f) => document.fonts.load(f, 'AaÈèÀà&0123').catch(() => []))).then(() => undefined);
  return pronto;
}
