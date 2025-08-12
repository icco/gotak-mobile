import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { GameState, PieceType } from '../types/game';
import { gotakAPI } from '../services/api';
import { IsometricBoard } from '../components/IsometricBoard';
import { PieceInventory } from '../components/PieceInventory';
import { Share } from 'react-native';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

interface Props {
  navigation: GameScreenNavigationProp;
  route: GameScreenRouteProp;
}

export const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPieceType, setSelectedPieceType] = useState<PieceType | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      setLoading(true);
      const gameId = route.params?.gameId;
      
      let game: GameState;
      if (gameId) {
        game = await gotakAPI.getGame(gameId);
      } else {
        game = await gotakAPI.createGame(5);
      }
      
      setGameState(game);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize game');
      console.error('Game initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareGame = async () => {
    if (!gameState) return;
    
    try {
      const gameLink = await gotakAPI.getGameLink(gameState.id);
      await Share.share({
        message: `Join my Tak game: ${gameLink}`,
        url: gameLink,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handlePlacePiece = async (x: number, y: number, pieceType: PieceType) => {
    if (!gameState) return;

    try {
      const move = {
        to: { x, y, stackIndex: 0 },
        piece: {
          id: `temp-${Date.now()}`,
          type: pieceType,
          color: 'white' as const,
        },
        moveType: 'place' as const,
      };

      const updatedGame = await gotakAPI.makeMove(gameState.id, move);
      setGameState(updatedGame);
      setSelectedPieceType(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to place piece');
      console.error('Place piece error:', error);
    }
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
          Current Player: {gameState.currentPlayer}
        </Text>
        <Text style={styles.gameStatus}>
          Status: {gameState.gameStatus}
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
          pieces={gameState.players.white.pieces}
          color="white"
          onPieceSelect={(pieceType) => {
            setSelectedPieceType(selectedPieceType === pieceType ? null : pieceType);
          }}
        />
        
        {selectedPieceType && (
          <View style={styles.selectedPieceIndicator}>
            <Text style={styles.selectedPieceText}>
              Selected: {selectedPieceType} piece
            </Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSelectedPieceType(null)}
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
});