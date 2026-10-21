// Everything on the Pawly page comes from the two Illustrator files (packaging for pawly.ai, logo pawly.ai):
// colours and fonts are read from the file's own swatches and text styles, sizes in pt are the artboard sizes,
// and the measurements are read from the dieline artboard at 1:1 (1 pt = 0.3528 mm).

const A = '/PAWLY/pawly';
export const IMG = {
  front: `${A}/front-panel.png`,
  back: `${A}/back-panel.png`,
  dieline: `${A}/dieline.png`,
  dielineSilhouette: `${A}/dieline-silhouette.png`, // just the die-cut outline, made from the dieline's outer edge
  mockup: `${A}/mockup.png`,
  salmon: `${A}/salmon-atop.png`,
  logoPrimary: `${A}/logo-primary.png`,
  logoInverse: `${A}/logo-inverse.png`,
  paw: `${A}/paw-mark.png`,
};

export const BEATS = [
  {
    id: 'product', label: 'The product',
    text: 'Pawly is a packaging design project for **dry salmon-based cat food**, made to make pet nutrition feel approachable and engaging for owners.',
  },
  {
    id: 'concept', label: 'The concept',
    text: 'The idea comes from **orange cats**, known for playful, expressive personalities. It shows up as warm tones, character-driven visuals and a lively composition.',
  },
];

export const PALETTE: { id: string; name: string; hex: string; cmyk: string; use: string; alt?: string[] }[] = [
  { id: 'orange', name: 'Pawly Orange', hex: '#F7923C', cmyk: '0 · 52 · 85 · 0', use: 'Main panel colour, the cat, SALMON, the icons, and the text on the cream panel.' },
  { id: 'coral', name: 'Coral', hex: '#F2643D', cmyk: '0 · 75 · 82 · 0', use: 'Stripes, cheeks and the inside of the mouth.' },
  { id: 'cream', name: 'Cream Board', hex: '#EBE7DD', cmyk: '7 · 7 · 12 · 0', use: 'The ingredients panel, the text on orange, and the paw on the pack.' },
  // the logo on the front panel prints a shade darker (#373230) than the one on the back (#494441)
  { id: 'charcoal', name: 'Charcoal', hex: '#494441', cmyk: '64 · 60 · 61 · 45', use: 'The logo lettering, and nothing else.', alt: ['#373230'] },
  { id: 'ink', name: 'Outline Brown', hex: '#26160F', cmyk: '46 · 75 · 84 · 71', use: 'Cat outline, eyes and whiskers.' },
];

export const FONTS = [
  { id: 'calibri', name: 'Calibri', rank: 'Primary font', role: 'Heading / Body', style: 'Body', pt: 7, where: 'Feeding notes, storage, manufacturer, ingredients. Table rows are 6 pt and the table header 5 pt.' },
  { id: 'helvetica', name: 'Helvetica Neue', rank: 'Secondary font', role: 'Labels', style: 'Labels', pt: 6.56, where: 'The four benefit labels under the icons.' },
] as const;

// Panels of the dieline, in % of the artwork (3508 × 3173 px) and in mm as measured on the 1:1 artboard.
export const PANELS = [
  { id: 'back', name: 'Back', box: { l: 8.2, t: 14.9, w: 30.2, h: 69.4 }, size: '89.5 × 186.3 mm', note: 'Feeding guide, ingredients, storage, barcode.' },
  { id: 'side-l', name: 'Side', box: { l: 38.4, t: 14.9, w: 15.1, h: 69.4 }, size: '44.8 × 186.3 mm', note: 'SALMON, running up the side.' },
  { id: 'front', name: 'Front + ears', box: { l: 53.6, t: 1.6, w: 30.0, h: 82.7 }, size: '89.5 × 223.0 mm', note: '186.3 mm body plus 36.7 mm of cat ears. The window sits in the body.' },
  { id: 'side-r', name: 'Side', box: { l: 83.6, t: 14.9, w: 15.1, h: 69.4 }, size: '44.3 × 186.3 mm', note: 'Four benefit icons.' },
  { id: 'tuck', name: 'Tuck flap', box: { l: 8.2, t: 2.7, w: 30.2, h: 12.2 }, size: '89.5 × 34.7 mm', note: 'Closes the top at the back.' },
  { id: 'dust-l', name: 'Dust flap', box: { l: 38.4, t: 11.2, w: 15.1, h: 3.7 }, size: '44.8 × 14.4 mm', note: 'Folds in at the top of the side.' },
  { id: 'dust-r', name: 'Dust flap', box: { l: 83.6, t: 11.2, w: 15.1, h: 3.7 }, size: '44.3 × 14.4 mm', note: 'Folds in at the top of the side.' },
  { id: 'bottom', name: 'Bottom flaps', box: { l: 8.2, t: 84.3, w: 90.5, h: 12.3 }, size: '33.2 mm deep', note: 'Four flaps folded flat under the base.' },
  { id: 'window', name: 'Window', box: { l: 57, t: 38.3, w: 23.3, h: 37 }, size: '68.9 × 99.1 mm', note: 'Clear film window onto the food, under the cat’s mouth.' },
] as const;

export const ICONS = [
  { id: 'immune', src: '/PAWLY/pawly/icon-immune.png', label: 'Immune enhancement', meaning: 'A shield around a cell. The claim is about keeping the cat’s defences strong.' },
  { id: 'hip', src: '/PAWLY/pawly/icon-hip.png', label: 'Hip & joint', meaning: 'A joint with movement marks. It speaks to mobility, which matters more as cats get older.' },
  { id: 'skin', src: '/PAWLY/pawly/icon-skin.png', label: 'Skin & hair', meaning: 'A single hair in the skin. It stands for coat and skin condition.' },
  { id: 'grain', src: '/PAWLY/pawly/icon-grain.png', label: 'Grain free', meaning: 'An ear of grain with a line through it. The shortest claim to read from a distance.' },
];

