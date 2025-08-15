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
      console.log(`Making POST request to: ${this.client.defaults.baseURL}/game/new`);

      const response = await this.client.post('/game/new', {
        size: boardSize.toString(), // API expects size as string
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

  async getGame(slug: string): Promise<GameState> {
    const response = await this.client.get(`/game/${slug}`);
    return response.data;
  }

  async makeMove(slug: string, move: string, player: number, turn: number): Promise<GameState> {
    const response = await this.client.post(`/game/${slug}/move`, {
      move,
      player,
      turn,
    });
    return response.data;
  }

  async getGameAtTurn(slug: string, turn: number): Promise<any> {
    const response = await this.client.get(`/game/${slug}/${turn}`);
    return response.data;
  }

  async getGameLink(slug: string): Promise<string> {
    return `${API_CONFIG.BASE_URL}/game/${slug}`;
  }
}

export const gotakAPI = new GotakAPI();