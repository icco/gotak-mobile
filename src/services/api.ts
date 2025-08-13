import axios from 'axios';
import { GameState, Move } from '../types/game';

const API_BASE_URL = 'https://gotak.app';

class GotakAPI {
  private client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async createGame(boardSize: number = 5): Promise<GameState> {
    const response = await this.client.post('/games', {
      size: boardSize,
    });
    return response.data;
  }

  async getGame(gameId: string): Promise<GameState> {
    const response = await this.client.get(`/games/${gameId}`);
    return response.data;
  }

  async makeMove(gameId: string, move: Move): Promise<GameState> {
    const response = await this.client.post(`/games/${gameId}/moves`, move);
    return response.data;
  }

  async joinGame(gameId: string, playerName: string): Promise<GameState> {
    const response = await this.client.post(`/games/${gameId}/join`, {
      name: playerName,
    });
    return response.data;
  }

  async getGameLink(gameId: string): Promise<string> {
    return `${API_BASE_URL}/games/${gameId}`;
  }
}

export const gotakAPI = new GotakAPI();