import { maxCapsForSize, maxFlatsForSize, remainingPieces } from '../../types/game';

describe('inventory helpers', () => {
  it('returns stone limits by size', () => {
    expect(maxFlatsForSize(5)).toBe(21);
    expect(maxCapsForSize(5)).toBe(1);
    expect(maxCapsForSize(8)).toBe(2);
  });

  it('counts remaining pieces from board', () => {
    const board = {
      size: 5,
      squares: {
        a1: [{ player: 1, type: 'F' }],
        b2: [{ player: 1, type: 'C' }],
        c3: [{ player: 2, type: 'F' }],
      },
    };
    expect(remainingPieces(board, 1)).toEqual({
      flat: 20,
      standing: 20,
      capstone: 0,
    });
    expect(remainingPieces(board, 2)).toEqual({
      flat: 20,
      standing: 20,
      capstone: 1,
    });
  });
});
