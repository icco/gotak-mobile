import axios, { isAxiosError } from 'axios';
import { GameState } from '../types/game';
import { API_CONFIG } from '../config/api';
import { logDebug, logError, logException } from '../utils/logger';

class GotakAPI {
  private client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: API_CONFIG.TIMEOUT,
  });

  async testConnection(): Promise<boolean> {
    try {
      logDebug('Testing connection', { baseUrl: API_CONFIG.BASE_URL });
      const response = await this.client.get('/');
      logDebug('Server is reachable', { status: response.status });
      return true;
    } catch (error) {
      logException(
        error instanceof Error ? error : new Error(String(error)),
        { method: 'testConnection' },
      );
      return false;
    }
  }

  async createGame(boardSize: number = 5): Promise<GameState> {
    try {
      logDebug('Creating game', { boardSize });
      const response = await this.client.post('/game/new', {
        // API expects size as string
        size: boardSize.toString(),
      });
      const apiData = response.data;
      logDebug('Game created', { id: apiData.ID, slug: apiData.Slug });

      // For new games the board is empty so we trust the server's state.
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
      if (isAxiosError(error)) {
        logError('Error creating game', {
          status: error.response?.status,
          code: error.code,
          message: error.message,
        });
      } else {
        logException(error instanceof Error ? error : new Error(String(error)), {
          method: 'createGame',
        });
      }
      throw error;
    }
  }

  async getGame(slug: string): Promise<GameState> {
    const response = await this.client.get(`/game/${slug}`);
    const apiData = response.data;

    // Server stores moves but does not maintain board state, so reconstruct.
    const reconstructedBoard = this.reconstructBoardFromMoves(
      apiData.Turns || [],
      apiData.Board.Size,
    );
    logDebug('Reconstructed board in getGame', { slug, size: apiData.Board.Size });

    return {
      id: apiData.ID,
      slug: apiData.Slug,
      board: {
        size: apiData.Board.Size,
        squares: reconstructedBoard,
      },
      turns: apiData.Turns || [],
      meta: apiData.Meta || [],
    };
  }

  private reconstructBoardFromMoves(turns: any[], boardSize: number): { [key: string]: any[] } {
    const board: { [key: string]: any[] } = {};

    for (let y = 1; y <= boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const file = String.fromCharCode(97 + x);
        const square = `${file}${y}`;
        board[square] = [];
      }
    }

    turns.forEach((turn) => {
      if (turn.First) {
        const square = turn.First.Square;
        const stoneType =
          turn.First.Stone === 'F' ? 'flat' : turn.First.Stone === 'S' ? 'standing' : 'capstone';
        const player = 1;
        board[square].push({ player, type: stoneType });
      }
      if (turn.Second) {
        const square = turn.Second.Square;
        const stoneType =
          turn.Second.Stone === 'F' ? 'flat' : turn.Second.Stone === 'S' ? 'standing' : 'capstone';
        const player = 2;
        board[square].push({ player, type: stoneType });
      }
    });

    return board;
  }

  async makeMove(
    slug: string,
    move: string,
    player: number,
    turn: number,
    stoneType: string = 'flat',
  ): Promise<GameState> {
    logDebug('Making move', { slug, move, player, turn, stoneType });

    // Per gotak server docs the request only carries the square and player.
    // Stone type is derived server-side from game logic.
    const moveData = {
      player,
      move,
      turn,
    };

    const response = await this.client.post(`/game/${slug}/move`, moveData);
    const apiData = response.data;

    const reconstructedBoard = this.reconstructBoardFromMoves(
      apiData.Turns || [],
      apiData.Board.Size,
    );

    return {
      id: apiData.ID,
      slug: apiData.Slug,
      board: {
        size: apiData.Board.Size,
        squares: reconstructedBoard,
      },
      turns: apiData.Turns || [],
      meta: apiData.Meta || [],
    };
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
