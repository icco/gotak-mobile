import axios from 'axios';
import { GameState, Move } from '../types/game';
import { API_CONFIG } from '../config/api';

class GotakAPI {
  private client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: API_CONFIG.TIMEOUT,
  });

  // Test method to check if the server is reachable
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection to:', API_CONFIG.BASE_URL);
      const response = await this.client.get('/');
      console.log('Server is reachable, status:', response.status);
      return true;
    } catch (error) {
      console.error('Server connection test failed:', error);
      return false;
    }
  }

  async createGame(boardSize: number = 5): Promise<GameState> {
    try {
      console.log(`Creating game with board size: ${boardSize}`);
      console.log(`Making POST request to: ${this.client.defaults.baseURL}/games`);

      const response = await this.client.post('/games', {
        size: boardSize,
      });

      console.log('Game created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Response headers:', error.response?.headers);
      }
      throw error;
    }
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
    return `${API_CONFIG.BASE_URL}/games/${gameId}`;
  }
}

export const gotakAPI = new GotakAPI();