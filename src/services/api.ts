import axios, { isAxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api';
import { AuthResponse, AuthUser, GameMode, GameState, Replay } from '../types/game';
import { logDebug, logError, logException } from '../utils/logger';

type UnauthorizedHandler = () => void;

class GotakAPI {
  private client: AxiosInstance;
  private token: string | null = null;
  private onUnauthorized: UnauthorizedHandler | null = null;

  constructor() {
    // eslint-disable-next-line import/no-named-as-default-member -- axios.create is the documented factory
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: API_CONFIG.TIMEOUT,
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          this.onUnauthorized?.();
        }
        return Promise.reject(error);
      },
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
    this.onUnauthorized = handler;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/healthz');
      return response.status === 200;
    } catch (error) {
      logException(error instanceof Error ? error : new Error(String(error)), {
        method: 'testConnection',
      });
      return false;
    }
  }

  async register(email: string, password: string, name: string): Promise<void> {
    await this.client.post('/auth/register', { email, password, name });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return {
      token: response.data.token,
      user: this.normalizeUser(response.data.user),
    };
  }

  async getProfile(): Promise<AuthUser> {
    const response = await this.client.get('/auth/profile');
    return this.normalizeUser(response.data);
  }

  async createGame(boardSize: number, mode: GameMode = 'human'): Promise<GameState> {
    logDebug('Creating game', { boardSize, mode });
    const response = await this.client.post(
      '/game/new',
      { size: boardSize.toString(), mode },
      { headers: { Accept: 'application/json' } },
    );
    return this.normalizeGame(response.data);
  }

  async joinGame(slug: string): Promise<void> {
    await this.client.post(`/game/${slug}/join`);
  }

  async getGame(slug: string): Promise<GameState> {
    const response = await this.client.get(`/game/${slug}`);
    return this.normalizeGame(response.data);
  }

  async makeMove(
    slug: string,
    move: string,
    player: number,
    turn: number,
  ): Promise<GameState> {
    logDebug('Making move', { slug, move, player, turn });
    const response = await this.client.post(`/game/${slug}/move`, {
      player,
      move,
      turn,
    });
    return this.normalizeGame(response.data);
  }

  async requestAiMove(
    slug: string,
    level = 'intermediate',
    style = 'balanced',
    timeLimitNs = 10_000_000_000,
  ): Promise<GameState> {
    const response = await this.client.post(`/game/${slug}/ai-move`, {
      level,
      style,
      time_limit: timeLimitNs,
    }, { timeout: timeLimitNs / 1_000_000 + 20_000 });
    return this.normalizeGame(response.data);
  }

  openSpectate(slug: string): WebSocket {
    const url = `${API_CONFIG.BASE_URL.replace(/^http/, 'ws')}/game/${slug}/spectate`;
    // Players send their token so the server leaves them out of the spectator count.
    // React Native takes headers as a third argument; the DOM typings in scope only know two.
    const RNWebSocket = WebSocket as unknown as new (u: string, p: null, o: { headers: Record<string, string> }) => WebSocket;
    return new RNWebSocket(url, null, { headers: this.token ? { Authorization: `Bearer ${this.token}` } : {} });
  }

  async getReplay(slug: string): Promise<Replay> {
    const response = await this.client.get<Replay>(`/game/${slug}/replay`);
    return { slug: response.data.slug, size: response.data.size, steps: response.data.steps ?? [] };
  }

  getGameLink(slug: string): string {
    return `${API_CONFIG.BASE_URL}/game/${slug}`;
  }

  private normalizeUser(raw: any): AuthUser {
    return {
      id: raw.id ?? raw.ID,
      email: raw.email ?? raw.Email ?? '',
      name: raw.name ?? raw.Name ?? '',
    };
  }

  normalizeGame(raw: any): GameState {
    if (!raw) {
      throw new Error('empty game response');
    }

    const board = raw.Board ?? raw.board;
    if (!board) {
      throw new Error('game response missing board');
    }

    return {
      ID: raw.ID ?? raw.id,
      Slug: raw.Slug ?? raw.slug,
      Board: {
        Size: board.Size ?? board.size,
        Squares: board.Squares ?? board.squares ?? {},
      },
      Turns: raw.Turns ?? raw.turns ?? [],
      Meta: raw.Meta ?? raw.meta ?? [],
      current_player: raw.current_player ?? 1,
      status: raw.status ?? 'waiting',
      winner: raw.winner ?? 0,
      white_player_id: raw.white_player_id,
      black_player_id: raw.black_player_id,
      mode: (raw.mode as GameMode) || 'human',
    };
  }

  formatError(error: unknown, fallback: string): string {
    if (isAxiosError(error) && !error.response) {
      return 'Could not reach the server. Check your connection and try again.';
    }
    if (isAxiosError(error) && error.response?.status === 404) {
      return fallback;
    }
    if (isAxiosError(error)) {
      const data = error.response?.data as { error?: string; message?: string } | undefined;
      return data?.error || data?.message || error.message || fallback;
    }
    if (error instanceof Error) {
      return error.message;
    }
    logError(fallback, { error: String(error) });
    return fallback;
  }
}

export const gotakAPI = new GotakAPI();
