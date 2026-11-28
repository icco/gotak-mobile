export const color = {
  ground: '#0F1513',
  surface: '#18211E',
  surfaceHigh: '#222D29',
  line: '#2E3A35',
  text: '#EEF2EF',
  textDim: '#A3B1AA',
  board: '#55665E',
  tile: '#8A9C92',
  tileEdge: '#6E8077',
  accent: '#F4B740',
  onAccent: '#1D1606',
  accentSoft: 'rgba(244, 183, 64, 0.30)',
  lastMove: 'rgba(238, 242, 239, 0.22)',
  danger: '#F2706A',
  white: '#F2EDE3',
  whiteEdge: '#B9B0A0',
  black: '#25282D',
  blackEdge: '#0B0C0E',
};

export const stoneFill = (player: number) => (player === 1 ? color.white : color.black);
export const stoneEdge = (player: number) => (player === 1 ? color.whiteEdge : color.blackEdge);
export const playerName = (player: number) => (player === 1 ? 'White' : 'Black');

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 6, md: 12 };

export const type = {
  title: { fontSize: 20, fontWeight: '600' as const, color: color.text },
  body: { fontSize: 16, color: color.text },
  label: { fontSize: 14, fontWeight: '500' as const, color: color.textDim },
  small: { fontSize: 12, fontWeight: '600' as const, color: color.textDim },
};
