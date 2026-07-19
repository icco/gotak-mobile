import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Share,
  AppState,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import {
  GameState,
  PieceType,
  normalizeBoard,
  remainingPieces,
  UIBoard,
} from '../types/game';
import { gotakAPI } from '../services/api';
import { IsometricBoard } from '../components/IsometricBoard';
import { PieceInventory } from '../components/PieceInventory';
import { useAuth } from '../context/AuthContext';
import {
  buildPlacementPtn,
  buildStackSlidePtn,
  coordsToSquare,
  directionBetween,
  isAdjacent,
} from '../utils/ptn';
import { logException } from '../utils/logger';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

interface Props {
  navigation: GameScreenNavigationProp;
  route: GameScreenRouteProp;
}

export const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPieceType, setSelectedPieceType] = useState<PieceType | undefined>();
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [stackCount, setStackCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const appActive = useRef(true);
  const requestingAi = useRef(false);

  const board: UIBoard | null = useMemo(
    () => (gameState ? normalizeBoard(gameState.Board) : null),
    [gameState],
  );

  const myPlayer = useMemo(() => {
    if (!gameState || !user) return null;
    if (gameState.white_player_id === user.id) return 1;
    if (gameState.black_player_id === user.id) return 2;
    // AI games: creator is white and black_player_id is unset
    if (gameState.mode === 'ai' && gameState.white_player_id === user.id) return 1;
    return null;
  }, [gameState, user]);

  const currentTurnNumber = useMemo(() => {
    if (!gameState?.Turns?.length) return 1;
    const last = gameState.Turns[gameState.Turns.length - 1];
    if (last.First && !last.Second) return last.Number;
    return last.Number + 1;
  }, [gameState]);

  const canAct =
    !!gameState &&
    !!myPlayer &&
    gameState.status !== 'finished' &&
    gameState.current_player === myPlayer &&
    (gameState.mode === 'ai' || gameState.status === 'active');

  const inventory = useMemo(() => {
    if (!board || !myPlayer) {
      return { flat: 0, standing: 0, capstone: 0 };
    }
    return remainingPieces(board, myPlayer);
  }, [board, myPlayer]);

  const loadGame = useCallback(async () => {
    const slug = route.params?.gameId;
    if (!slug) {
      Alert.alert('Error', 'Missing game id');
      navigation.goBack();
      return;
    }
    try {
      const game = await gotakAPI.getGame(slug);
      setGameState(game);
    } catch (error) {
      logException(error instanceof Error ? error : new Error(String(error)), {
        method: 'loadGame',
      });
      Alert.alert('Error', gotakAPI.formatError(error, 'Failed to load game'));
    } finally {
      setLoading(false);
    }
  }, [navigation, route.params?.gameId]);

  useEffect(() => {
    void loadGame();
  }, [loadGame]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      appActive.current = next === 'active';
    });
    return () => sub.remove();
  }, []);

  // Poll for opponent moves in human games
  useEffect(() => {
    if (!gameState || gameState.mode !== 'human') return;
    if (gameState.status === 'finished') return;

    const waitingForOpponent =
      gameState.status === 'waiting' ||
      (myPlayer != null && gameState.current_player !== myPlayer);

    if (!waitingForOpponent) return;

    const id = setInterval(() => {
      if (!appActive.current) return;
      void gotakAPI
        .getGame(gameState.Slug)
        .then(setGameState)
        .catch((error) => {
          logException(error instanceof Error ? error : new Error(String(error)), {
            method: 'pollGame',
          });
        });
    }, 2000);

    return () => clearInterval(id);
  }, [gameState, myPlayer]);

  // Trigger AI move when it's the AI's turn
  useEffect(() => {
    if (!gameState || gameState.mode !== 'ai') return;
    if (gameState.status === 'finished') return;
    if (!myPlayer) return;
    if (gameState.current_player === myPlayer) return;
    if (requestingAi.current) return;

    requestingAi.current = true;
    void gotakAPI
      .requestAiMove(gameState.Slug)
      .then((updated) => setGameState(updated))
      .catch((error) => {
        Alert.alert('AI Error', gotakAPI.formatError(error, 'AI move failed'));
      })
      .finally(() => {
        requestingAi.current = false;
      });
  }, [gameState, myPlayer]);

  const submitMove = async (ptn: string) => {
    if (!gameState || !myPlayer) return;
    setBusy(true);
    try {
      const updated = await gotakAPI.makeMove(
        gameState.Slug,
        ptn,
        myPlayer,
        currentTurnNumber,
      );
      setGameState(updated);
      setSelectedPieceType(undefined);
      setSelectedStack(null);
      setStackCount(1);
    } catch (error) {
      Alert.alert('Invalid move', gotakAPI.formatError(error, 'Move rejected'));
    } finally {
      setBusy(false);
    }
  };

  const handleSquarePress = (x: number, y: number) => {
    if (!board || !gameState || !myPlayer || !canAct || busy) return;
    const square = coordsToSquare(x, y);
    const stones = board.squares[square] || [];

    // Placement
    if (selectedPieceType) {
      if (stones.length > 0) {
        Alert.alert('Occupied', 'Choose an empty square to place a piece.');
        return;
      }
      void submitMove(buildPlacementPtn(square, selectedPieceType));
      return;
    }

    // Stack selection / slide
    if (selectedStack) {
      if (selectedStack === square) {
        setSelectedStack(null);
        return;
      }
      if (!isAdjacent(selectedStack, square)) {
        Alert.alert('Stack move', 'Tap an orthogonally adjacent square.');
        return;
      }
      const dir = directionBetween(selectedStack, square);
      if (!dir) return;
      void submitMove(buildStackSlidePtn(selectedStack, dir, stackCount));
      return;
    }

    // Select own stack (top stone must be ours)
    if (stones.length === 0) return;
    const top = stones[stones.length - 1];
    if (top.player !== myPlayer) return;
    const maxCarry = Math.min(stones.length, board.size);
    setSelectedStack(square);
    setStackCount(maxCarry);
    setSelectedPieceType(undefined);
  };

  const handleShareGame = async () => {
    if (!gameState) return;
    try {
      const link = gotakAPI.getGameLink(gameState.Slug);
      await Share.share({
        message: `Join my Tak game (${gameState.Slug}): ${link}`,
        url: link,
      });
    } catch (error) {
      logException(error instanceof Error ? error : new Error(String(error)), {
        method: 'handleShareGame',
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!gameState || !board) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Failed to load game</Text>
          <TouchableOpacity style={styles.shareButton} onPress={() => void loadGame()}>
            <Text style={styles.shareButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusLabel =
    gameState.status === 'finished'
      ? `Finished — winner: ${gameState.winner === 1 ? 'White' : gameState.winner === 2 ? 'Black' : 'draw/flat'}`
      : gameState.status === 'waiting'
        ? 'Waiting for opponent'
        : canAct
          ? 'Your turn'
          : 'Opponent turn';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.gameTitle}>{gameState.Slug}</Text>
        <TouchableOpacity style={styles.shareButton} onPress={() => void handleShareGame()}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameInfo}>
        <Text style={styles.infoText}>{statusLabel}</Text>
        <Text style={styles.infoText}>
          Mode: {gameState.mode} · You: {myPlayer === 1 ? 'White' : myPlayer === 2 ? 'Black' : '?'}
        </Text>
        <Text style={styles.infoText}>
          Turn {currentTurnNumber} · To move: {gameState.current_player === 1 ? 'White' : 'Black'}
        </Text>
        {selectedStack ? (
          <View style={styles.stackControls}>
            <Text style={styles.infoText}>Moving {stackCount} from {selectedStack}</Text>
            <View style={styles.stackButtons}>
              <TouchableOpacity
                style={styles.tinyButton}
                onPress={() => setStackCount((c) => Math.max(1, c - 1))}
              >
                <Text style={styles.tinyButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tinyButton}
                onPress={() => {
                  const stones = board.squares[selectedStack] || [];
                  const maxCarry = Math.min(stones.length, board.size);
                  setStackCount((c) => Math.min(maxCarry, c + 1));
                }}
              >
                <Text style={styles.tinyButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tinyButton}
                onPress={() => setSelectedStack(null)}
              >
                <Text style={styles.tinyButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.gameArea}>
        <IsometricBoard
          board={board}
          selectedPieceType={selectedPieceType}
          selectedSquare={selectedStack ?? undefined}
          onSquarePress={handleSquarePress}
        />

        <PieceInventory
          pieces={inventory}
          color={myPlayer === 2 ? 'black' : 'white'}
          selectedPieceType={selectedPieceType}
          onPieceSelect={(type) => {
            setSelectedPieceType(type);
            setSelectedStack(null);
          }}
        />
      </View>

      {busy ? (
        <View style={styles.busyOverlay}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ecf0f1',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: {
    color: '#3498db',
    fontSize: 16,
  },
  gameTitle: {
    color: '#ecf0f1',
    fontSize: 16,
    fontWeight: '600',
    maxWidth: '50%',
  },
  shareButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  gameInfo: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  infoText: {
    color: '#bdc3c7',
    marginBottom: 4,
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 8,
  },
  stackControls: {
    marginTop: 8,
  },
  stackButtons: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tinyButton: {
    backgroundColor: '#34495e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  tinyButtonText: {
    color: '#ecf0f1',
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
