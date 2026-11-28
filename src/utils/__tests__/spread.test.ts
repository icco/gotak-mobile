import { UIBoard } from '../../types/game';
import { legalTargets, previewBoard, spreadPtn, startSpread, tapSpread, undoSpread } from '../spread';
import { lastMoveSquares } from '../board';

const W = (type = 'F') => ({ player: 1, type });
const B = (type = 'F') => ({ player: 2, type });

function board(squares: UIBoard['squares'], size = 5): UIBoard {
  return { size, squares };
}

describe('spread', () => {
  it('picks up the whole stack and drops one stone per tap in a locked direction', () => {
    const b = board({ c3: [B(), W(), W()] });
    let s = startSpread(b, 'c3', 1)!;
    expect(s.hand).toHaveLength(3);
    s = tapSpread(b, s, 'd3', 1)!;
    expect(legalTargets(b, s, 1).sort()).toEqual(['d3', 'e3']);
    s = tapSpread(b, s, 'd3', 1)!;
    s = tapSpread(b, s, 'e3', 1)!;
    expect(spreadPtn(s)).toBe('3c3>21');
  });

  it('tapping the origin carries one fewer, then cancels', () => {
    const b = board({ a1: [W(), W()] });
    let s = startSpread(b, 'a1', 1)!;
    s = tapSpread(b, s, 'a1', 1)!;
    expect(s.hand).toHaveLength(1);
    expect(tapSpread(b, s, 'a1', 1)).toBeNull();
  });

  it('emits short PTN for single stones and full drops', () => {
    const b = board({ a1: [W()], b2: [W(), W()] });
    expect(spreadPtn(tapSpread(b, startSpread(b, 'a1', 1)!, 'a2', 1)!)).toBe('a1+');
    let s = tapSpread(b, startSpread(b, 'b2', 1)!, 'b1', 1)!;
    s = tapSpread(b, s, 'b1', 1)!;
    expect(spreadPtn(s)).toBe('2b2-');
  });

  it('respects the carry limit', () => {
    const b = board({ a1: [W(), W(), W(), W()] }, 3);
    expect(startSpread(b, 'a1', 1)!.hand).toHaveLength(3);
  });

  it('only lets a lone capstone flatten an opponent wall', () => {
    const b = board({ a1: [W(), W('C')], b1: [B('S')], a2: [W('S')], c1: [B('C')] });
    let s = startSpread(b, 'a1', 1)!;
    expect(legalTargets(b, s, 1)).toEqual([]);
    s = tapSpread(b, s, 'a1', 1)!;
    expect(legalTargets(b, s, 1)).toEqual(['b1']);
    s = tapSpread(b, s, 'b1', 1)!;
    expect(spreadPtn(s)).toBe('a1>');
    expect(previewBoard(b, s).squares.b1).toEqual([B('F'), W('C')]);
  });

  it('cannot start on an opponent stack and undo steps back', () => {
    const b = board({ a1: [B()], b1: [W(), W()] });
    expect(startSpread(b, 'a1', 1)).toBeNull();
    let s = tapSpread(b, startSpread(b, 'b1', 1)!, 'c1', 1)!;
    s = undoSpread(s)!;
    expect(s.dir).toBeNull();
    expect(undoSpread(s)).toBeNull();
  });
});

describe('lastMoveSquares', () => {
  it('covers the origin and every drop square', () => {
    const turns = [
      { Number: 1, First: { Square: 'a1' }, Second: { Square: 'c3', MoveDirection: '>', MoveDropCounts: [2, 1] } },
    ];
    expect(lastMoveSquares(turns, 5)).toEqual(['c3', 'd3', 'e3']);
  });
});
