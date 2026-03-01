/**
 * Font loader utility for jsPDF - registers Cairo font for RTL Arabic text
 * Uses @fontsource/cairo via jsDelivr CDN for reliability
 */

const FONT_SOURCE_CDN = 'https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.2.7/files';
const FONTS = {
  regular: `${FONT_SOURCE_CDN}/cairo-arabic-400-normal.woff2`,
  semibold: `${FONT_SOURCE_CDN}/cairo-arabic-600-normal.woff2`,
  bold: `${FONT_SOURCE_CDN}/cairo-arabic-700-normal.woff2`,
};

let fontCache: Record<string, string> = {};

async function fetchFontAsBase64(url: string): Promise<string> {
  if (fontCache[url]) return fontCache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load font: ${url}`);
  const buf = await res.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), '')
  );
  fontCache[url] = base64;
  return base64;
}

/**
 * Register Cairo fonts with a jsPDF document instance
 * Call before adding any text with Cairo font
 */
export async function registerCairoFonts(doc: { addFileToVFS: (name: string, data: string) => void; addFont: (name: string, fontName: string, fontStyle: string) => void }): Promise<void> {
  const [regular, semibold, bold] = await Promise.all([
    fetchFontAsBase64(FONTS.regular),
    fetchFontAsBase64(FONTS.semibold),
    fetchFontAsBase64(FONTS.bold),
  ]);

  doc.addFileToVFS('Cairo-Regular.woff2', regular);
  doc.addFont('Cairo-Regular.woff2', 'Cairo', 'normal');

  doc.addFileToVFS('Cairo-SemiBold.woff2', semibold);
  doc.addFont('Cairo-SemiBold.woff2', 'Cairo', 'semibold');

  doc.addFileToVFS('Cairo-Bold.woff2', bold);
  doc.addFont('Cairo-Bold.woff2', 'Cairo', 'bold');
}

/**
 * Get font style string for jsPDF.setFont
 * Cairo supports: 'normal' | 'semibold' | 'bold'
 */
export function getCairoFontStyle(weight: 'normal' | 'semibold' | 'bold' = 'normal'): string {
  return weight;
}
