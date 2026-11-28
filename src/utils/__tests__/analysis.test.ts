import { clampScore, formatScore, parseTps } from '../analysis';

describe('parseTps', () => {
  it('reads rows from the top rank and stacks bottom to top', () => {
    const board = parseTps('x5/x5/x5/2,2,x3/1,1,1,1,x 1 5');
    expect(board.size).toBe(5);
    expect(board.squares).toEqual({
      a2: [{ player: 2, type: 'F' }],
      b2: [{ player: 2, type: 'F' }],
      a1: [{ player: 1, type: 'F' }],
      b1: [{ player: 1, type: 'F' }],
      c1: [{ player: 1, type: 'F' }],
      d1: [{ player: 1, type: 'F' }],
    });
  });

  it('applies wall and cap to the top stone', () => {
    const board = parseTps('x3,12S/x,2C,x2/x4/x4 2 7');
    expect(board.squares.d4).toEqual([{ player: 1, type: 'F' }, { player: 2, type: 'S' }]);
    expect(board.squares.b3).toEqual([{ player: 2, type: 'C' }]);
  });

  it('rejects rows of the wrong width', () => {
    expect(() => parseTps('x5/x4 1 1')).toThrow();
  });
});

describe('scores', () => {
  it('formats flats and forced wins', () => {
    expect(formatScore(800)).toBe('+2.0');
    expect(formatScore(-200)).toBe('-0.5');
    expect(formatScore(100000)).toBe('White wins');
    expect(formatScore(-100000)).toBe('Black wins');
    expect(formatScore(60000)).toBe('+150.0');
  });

  it('clamps for the graph', () => {
    expect(clampScore(100000)).toBe(3000);
    expect(clampScore(-5000)).toBe(-3000);
    expect(clampScore(120)).toBe(120);
  });
});
