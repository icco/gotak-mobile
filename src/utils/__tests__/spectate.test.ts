import { backoff, parseSlug, parseSpectateMessage } from '../spectate';

describe('spectate', () => {
  it('backs off exponentially up to 30s', () => {
    expect([0, 1, 2, 5, 10].map(backoff)).toEqual([1000, 2000, 4000, 30000, 30000]);
  });

  it('takes a code or a link', () => {
    expect(parseSlug(' abc123 ')).toBe('abc123');
    expect(parseSlug('https://gotak.app/game/abc123')).toBe('abc123');
    expect(parseSlug('Play Tak with me: https://gotak.app/game/abc123/spectate (game abc123)')).toBe('abc123');
  });

  it('parses state and count messages and ignores others', () => {
    expect(parseSpectateMessage('{"type":"state","game":{"Slug":"a"},"spectators":2}')).toEqual({
      type: 'state',
      game: { Slug: 'a' },
      spectators: 2,
    });
    expect(parseSpectateMessage('{"type":"spectators","count":3}')).toEqual({ type: 'spectators', count: 3 });
    expect(parseSpectateMessage('{"type":"ping"}')).toBeNull();
  });
});
