import axios, { isAxiosError } from 'axios';
import { GameState } from '../types/game';
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

      // Transform API response to match our expected structure
      const apiData = response.data;
      return {
        id: apiData.ID,
        slug: apiData.Slug,
        board: {
          size: apiData.Board.Size,
          squares: apiData.Board.Squares,
        },
        turns: apiData.Turns || [],
        meta: apiData.Meta || [],
      };
    } catch (error) {
      console.error('Error creating game:', error);
      if (isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Response headers:', error.response?.headers);
      }
      throw error;
    }
  }

  async getGame(slug: string): Promise<GameState> {
    const response = await this.client.get(`/game/${slug}`);
    const apiData = response.data;

    // Transform API response to match our expected structure
    return {
      id: apiData.ID,
      slug: apiData.Slug,
      board: {
        size: apiData.Board.Size,
        squares: apiData.Board.Squares,
      },
      turns: apiData.Turns || [],
      meta: apiData.Meta || [],
    };
  }

  async makeMove(slug: string, move: string, player: number, turn: number, stoneType: string = 'flat'): Promise<GameState> {
    console.log('Making move request:', { slug, move, player, turn, stoneType });
    
    // According to the GoTak documentation, the move should be just the square
    // The stone type is determined by the game logic, not specified in the request
    const moveData = {
      player,
      move: move, // Just the square like "b5"
      turn,
    };
    
    console.log('Move data being sent:', moveData);
    
    const response = await this.client.post(`/game/${slug}/move`, moveData);
    
    console.log('Raw API response:', response.data);
    console.log('Raw API response (stringified):', JSON.stringify(response.data, null, 2));
    const apiData = response.data;

    // Transform API response to match our expected structure
    const transformedGame = {
      id: apiData.ID,
      slug: apiData.Slug,
      board: {
        size: apiData.Board.Size,
        squares: apiData.Board.Squares,
      },
      turns: apiData.Turns || [],
      meta: apiData.Meta || [],
    };
    
    console.log('Transformed game:', transformedGame);
    console.log('Board squares after transform:', transformedGame.board.squares);

    return transformedGame;
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