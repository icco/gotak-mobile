import { useEffect, useState } from 'react';
import { GameState } from '../types/game';
import { gotakAPI } from '../services/api';
import { backoff, parseSpectateMessage } from '../utils/spectate';
import { logException } from '../utils/logger';

/** Live game state and spectator count from the server's spectate socket, reconnecting with backoff. */
export function useSpectate(slug: string | undefined) {
  const [game, setGame] = useState<GameState | null>(null);
  const [spectators, setSpectators] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    let ws: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let stopped = false;

    const connect = () => {
      ws = gotakAPI.openSpectate(slug);
      ws.onopen = () => {
        attempt = 0;
      };
      ws.onmessage = (e) => {
        try {
          const msg = parseSpectateMessage(String(e.data));
          if (msg?.type === 'state') {
            setGame(gotakAPI.normalizeGame(msg.game));
            setSpectators(msg.spectators);
          } else if (msg?.type === 'spectators') {
            setSpectators(msg.count);
          }
        } catch (error) {
          logException(error instanceof Error ? error : new Error(String(error)), { method: 'spectateMessage' });
        }
      };
      ws.onerror = () => logException(new Error('spectate socket error'), { method: 'spectate', slug });
      ws.onclose = () => {
        if (stopped) return;
        timer = setTimeout(connect, backoff(attempt++));
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(timer);
      ws?.close();
    };
  }, [slug]);

  return { game, spectators };
}
