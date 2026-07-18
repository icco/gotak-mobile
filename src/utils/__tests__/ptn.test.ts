import {
  buildPlacementPtn,
  buildStackSlidePtn,
  coordsToSquare,
  directionBetween,
  isAdjacent,
  squareToCoords,
} from '../ptn';

describe('ptn helpers', () => {
  it('builds placement PTN', () => {
    expect(buildPlacementPtn('c3', 'flat')).toBe('c3');
    expect(buildPlacementPtn('c3', 'standing')).toBe('Sc3');
    expect(buildPlacementPtn('c3', 'capstone')).toBe('Cc3');
  });

  it('converts coordinates', () => {
    expect(coordsToSquare(0, 0)).toBe('a1');
    expect(coordsToSquare(2, 4)).toBe('c5');
    expect(squareToCoords('c5')).toEqual({ x: 2, y: 4 });
  });

  it('detects adjacency and direction', () => {
    expect(directionBetween('a1', 'b1')).toBe('>');
    expect(directionBetween('b1', 'a1')).toBe('<');
    expect(directionBetween('a1', 'a2')).toBe('+');
    expect(directionBetween('a2', 'a1')).toBe('-');
    expect(isAdjacent('a1', 'c1')).toBe(false);
  });

  it('builds stack slide PTN', () => {
    expect(buildStackSlidePtn('a1', '>', 1)).toBe('a1>');
    expect(buildStackSlidePtn('a1', '>', 3)).toBe('3a1>3');
  });
});
