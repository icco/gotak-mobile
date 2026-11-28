import { UIBoard } from '../../types/game';
import { roadLinks, winningRoad } from '../board';

const W = (type = 'F') => [{ player: 1, type }];
const B = (type = 'F') => [{ player: 2, type }];

describe('roads', () => {
  it('links adjacent flats and caps of one player, not walls', () => {
    const board: UIBoard = { size: 4, squares: { a1: W(), b1: W('C'), c1: W('S'), a2: B(), b2: W() } };
    expect(roadLinks(board)).toEqual([
      { from: 'a1', to: 'b1', player: 1 },
      { from: 'b1', to: 'b2', player: 1 },
    ]);
  });

  it('finds a bending edge-to-edge road and ignores walls', () => {
    const board: UIBoard = {
      size: 4,
      squares: { a2: W(), b2: W(), b3: W(), c3: W(), d3: W(), c2: W('S'), d2: W() },
    };
    expect(winningRoad(board, 1)).toEqual(['a2', 'b2', 'b3', 'c3', 'd3']);
    expect(winningRoad(board, 2)).toEqual([]);
  });

  it('finds a vertical road', () => {
    const board: UIBoard = { size: 4, squares: { c1: B(), c2: B(), c3: B('C'), c4: B() } };
    expect(winningRoad(board, 2)).toEqual(['c1', 'c2', 'c3', 'c4']);
  });
});
