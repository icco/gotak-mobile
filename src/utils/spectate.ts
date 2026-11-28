/** Reconnect delay: 1s, 2s, 4s... capped at 30s. */
export const backoff = (attempt: number) => Math.min(30_000, 1000 * 2 ** attempt);

/** Accepts a bare game code or a pasted game link. */
export function parseSlug(input: string): string {
  const trimmed = input.trim();
  return trimmed.match(/\/game\/([^/?#\s]+)/)?.[1] ?? trimmed;
}

export type SpectateMessage = { type: 'state'; game: unknown; spectators: number } | { type: 'spectators'; count: number };

export function parseSpectateMessage(data: string): SpectateMessage | null {
  const msg = JSON.parse(data);
  if (msg?.type === 'state' && msg.game) return msg;
  if (msg?.type === 'spectators' && typeof msg.count === 'number') return msg;
  return null;
}
