import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Share,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { GameState, PieceType } from '../types/game';
import { gotakAPI } from '../services/api';
import { IsometricBoard } from '../components/IsometricBoard';
import { PieceInventory } from '../components/PieceInventory';
import { isAxiosError } from 'axios';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

interface Props {
  navigation: GameScreenNavigationProp;
  route: GameScreenRouteProp;
}

export const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPieceType, setSelectedPieceType] = useState<PieceType | undefined>(undefined);

  const initializeGame = useCallback(async () => {
    try {
      setLoading(true);
      const gameSlug = route.params?.gameId;

      // Test connection first
      const isConnected = await gotakAPI.testConnection();
      if (!isConnected) {
        Alert.alert('Connection Error', 'Cannot connect to the game server. Please check your internet connection and try again.');
        return;
      }

      let game: GameState;
      if (gameSlug) {
        game = await gotakAPI.getGame(gameSlug);
      } else {
        game = await gotakAPI.createGame(5);
      }

      // Debug logging to see the board structure
      console.log('Game loaded:', game);
      console.log('Board size:', game.board.size);
      console.log('Board squares:', game.board.squares);
      console.log('Sample square data:', Object.entries(game.board.squares).slice(0, 3));

      setGameState(game);
    } catch (error) {
      console.error('Game initialization error:', error);

      let errorMessage = 'Failed to initialize game';
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) {
          errorMessage = 'Game not found. Please check the game ID.';
        } else if (status && status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Server error: ${status} - ${error.response?.data?.message || error.message}`;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [route.params?.gameId]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleShareGame = async () => {
    if (!gameState) return;

    try {
      const gameLink = await gotakAPI.getGameLink(gameState.slug);
      await Share.share({
        message: `Join my Tak game: ${gameLink}`,
        url: gameLink,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handlePlacePiece = async (x: number, y: number, pieceType: PieceType) => {
    if (!gameState) {
      console.log('No game state available');
      return;
    }

    console.log('Attempting to place piece:', { x, y, pieceType, selectedPieceType });

    try {
      // Convert coordinates to chess notation (e.g., "c3")
      const file = String.fromCharCode(97 + x); // 'a' starts at 97
      const rank = y + 1;
      const square = `${file}${rank}`;

      // Determine current player (1 for white, 2 for black)
      const currentTurn = (gameState.turns?.length || 0) + 1;
      const currentPlayer = currentTurn % 2 === 1 ? 1 : 2;

      // Convert piece type to API format
      let stoneType = 'flat';
      if (pieceType === 'standing') {
        stoneType = 'wall';
      } else if (pieceType === 'capstone') {
        stoneType = 'capstone';
      }

      console.log('Making move:', { square, currentPlayer, currentTurn, stoneType });

      const updatedGame = await gotakAPI.makeMove(gameState.slug, square, currentPlayer, currentTurn, stoneType);
      console.log('Move successful, updated game:', updatedGame);
      setGameState(updatedGame);
      setSelectedPieceType(undefined);
    } catch (error) {
      console.error('Place piece error:', error);
      Alert.alert('Error', 'Failed to place piece. Please try again.');
    }
  };

  // Helper function to get current player color
  const getCurrentPlayerColor = () => {
    if (!gameState) return 'white';
    const currentTurn = (gameState.turns?.length || 0) + 1;
    return currentTurn % 2 === 1 ? 'white' : 'black';
  };

  // Helper function to get game status
  const getGameStatus = () => {
    if (!gameState) return 'loading';
    if (!gameState.turns || gameState.turns.length === 0) return 'waiting';
    const lastTurn = gameState.turns[gameState.turns.length - 1];
    if (lastTurn.result) return 'finished';
    return 'active';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!gameState) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load game</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeGame}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.gameTitle}>Tak Game</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareGame}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameInfo}>
        <Text style={styles.currentPlayer}>
          Current Player: {getCurrentPlayerColor()}
        </Text>
        <Text style={styles.gameStatus}>
          Status: {getGameStatus()}
        </Text>
        <Text style={styles.turnInfo}>
          Turn: {(gameState.turns?.length || 0) + 1}
        </Text>
        <Text style={styles.debugInfo}>
          Board Size: {gameState.board.size} | Squares: {Object.keys(gameState.board.squares).length}
        </Text>
        <Text style={styles.debugInfo}>
          Sample Squares: {Object.keys(gameState.board.squares).slice(0, 3).join(', ')}
        </Text>
      </View>

      <View style={styles.gameArea}>
        <IsometricBoard
          board={gameState.board}
          selectedPieceType={selectedPieceType}
          onSquarePress={(x, y) => {
            if (selectedPieceType) {
              handlePlacePiece(x, y, selectedPieceType);
            }
          }}
        />

        <PieceInventory
          pieces={{
            flat: 21, // Default piece counts for 5x5 board
            standing: 1,
            capstone: 1,
          }}
          color="white"
          selectedPieceType={selectedPieceType}
          onPieceSelect={(pieceType) => {
            console.log('Piece selected:', pieceType);
            setSelectedPieceType(selectedPieceType === pieceType ? undefined : pieceType);
          }}
        />

        {selectedPieceType && (
          <View style={styles.selectedPieceIndicator}>
            <Text style={styles.selectedPieceText}>
              Selected: {selectedPieceType} piece
            </Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSelectedPieceType(undefined)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  shareButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  gameInfo: {
    padding: 16,
    backgroundColor: '#34495e',
  },
  currentPlayer: {
    color: '#ecf0f1',
    fontSize: 16,
    marginBottom: 4,
  },
  gameStatus: {
    color: '#bdc3c7',
    fontSize: 14,
  },
  turnInfo: {
    color: '#ecf0f1',
    fontSize: 14,
    marginTop: 4,
  },
  gameArea: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ecf0f1',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 18,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedPieceIndicator: {
    backgroundColor: '#34495e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
  },
  selectedPieceText: {
    color: '#ecf0f1',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugInfo: {
    color: '#95a5a6',
    fontSize: 12,
    marginTop: 4,
  },
});