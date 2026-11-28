import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform, Share, StyleSheet, Text, useWindowDimensions, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { GameState, PieceType, normalizeBoard, remainingPieces, UIBoard } from '../types/game';
import { gotakAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSpectate } from '../hooks/useSpectate';
import { buildPlacementPtn } from '../utils/ptn';
import { Spread, legalTargets, previewBoard, remaining, spreadPtn, startSpread, tapSpread, undoSpread, currentSquare } from '../utils/spread';
import { flatCount, lastMoveSquares, moveList, turnNumber, winningRoad } from '../utils/board';
import { logException } from '../utils/logger';
import { Board } from '../components/Board';
import { Banner, HandBar, IconButton, MoveStrip, PlayerBar, StackInspector, StoneTray, TextButton } from '../components/GamePanels';
import { color, playerName, space, type } from '../theme';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
}

type BannerState = { text: string; tone?: 'info' | 'error'; action?: { label: string; onPress: () => void } } | null;

const PIECE_CODE: Record<PieceType, string> = { flat: 'F', standing: 'S', capstone: 'C' };

// shortcut: Vibration on iOS ignores duration and buzzes for 400ms, so haptics are Android-only until expo-haptics is added.
const tick = (ms = 8) => {
  if (Platform.OS === 'android') Vibration.vibrate(ms);
};

const TILT_KEY = 'gotak_board_tilt';
let tiltPreference: boolean | null = null;

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

export const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const [game, setGame] = useState<GameState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PieceType>('flat');
  const [spread, setSpread] = useState<Spread | null>(null);
  const [pending, setPending] = useState<{ square: string; type: string; player: number } | null>(null);
  const [inspect, setInspect] = useState<string | null>(null);
  const [banner, setBanner] = useState<BannerState>(null);
  const [busy, setBusy] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiAttempt, setAiAttempt] = useState(0);
  const [tilt, setTilt] = useState(tiltPreference ?? false);
  const appActive = useRef(true);
  const requestingAi = useRef(false);
  const slug = route.params?.gameId;

  const live = useSpectate(slug);
  useEffect(() => {
    // Players get state from their own moves and the poll; only watchers follow the socket.
    const g = live.game;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors socket state into the screen's game
    if (g && user && g.white_player_id !== user.id && g.black_player_id !== user.id) setGame(g);
  }, [live.game, user]);

  const board: UIBoard | null = useMemo(() => (game ? normalizeBoard(game.Board) : null), [game]);

  const me = useMemo(() => {
    if (!game || !user) return null;
    if (game.white_player_id === user.id) return 1;
    if (game.black_player_id === user.id) return 2;
    return null;
  }, [game, user]);
  const them = me === 2 ? 1 : 2;

  const turn = game ? turnNumber(game.Turns) : 1;
  const firstTurn = turn === 1;
  const finished = game?.status === 'finished';
  const canAct =
    !!game && !!me && !finished && game.current_player === me && (game.mode === 'ai' || game.status === 'active');

  const loadGame = useCallback(async () => {
    if (!slug) {
      setLoadError('This game link is missing its id.');
      return;
    }
    try {
      setGame(await gotakAPI.getGame(slug));
      setLoadError(null);
    } catch (error) {
      logException(toError(error), { method: 'loadGame' });
      setLoadError(gotakAPI.formatError(error, 'Could not load the game.'));
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; setState runs after await
    void loadGame();
  }, [loadGame]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      appActive.current = next === 'active';
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!game || game.mode !== 'human' || finished) return;
    const waiting = game.status === 'waiting' || (me != null && game.current_player !== me);
    if (!waiting) return;
    const id = setInterval(() => {
      if (!appActive.current) return;
      gotakAPI
        .getGame(game.Slug)
        .then(setGame)
        .catch((error) => logException(toError(error), { method: 'pollGame' }));
    }, 2000);
    return () => clearInterval(id);
  }, [game, me, finished]);

  useEffect(() => {
    if (!game || game.mode !== 'ai' || finished || !me) return;
    if (game.current_player === me || requestingAi.current) return;
    requestingAi.current = true;
    setAiThinking(true);
    gotakAPI
      .requestAiMove(game.Slug)
      .then((updated) => {
        setGame(updated);
        tick(15);
      })
      .catch((error) => {
        logException(toError(error), { method: 'requestAiMove' });
        setBanner({
          text: gotakAPI.formatError(error, 'The AI did not answer.'),
          tone: 'error',
          action: { label: 'Retry', onPress: () => { setBanner(null); setAiAttempt((n) => n + 1); } },
        });
      })
      .finally(() => {
        requestingAi.current = false;
        setAiThinking(false);
      });
  }, [game, me, finished, aiAttempt]);

  const submit = async (ptn: string) => {
    if (!game || !me) return;
    setBusy(true);
    setBanner(null);
    try {
      const updated = await gotakAPI.makeMove(game.Slug, ptn, me, turn);
      setGame(updated);
      setSelected('flat');
      tick(20);
    } catch (error) {
      setBanner({ text: gotakAPI.formatError(error, 'The server rejected that move.'), tone: 'error' });
    } finally {
      setSpread(null);
      setPending(null);
      setBusy(false);
    }
  };

  const onPress = (square: string) => {
    if (!board) return;
    const stones = board.squares[square] ?? [];
    if (!canAct || busy || !me) {
      setInspect(stones.length && inspect !== square ? square : null);
      return;
    }
    if (spread) {
      const next = tapSpread(board, spread, square, me);
      if (next === spread) {
        setBanner({ text: 'Drop on a highlighted square, or tap Cancel.' });
        return;
      }
      setBanner(null);
      tick();
      if (!next) {
        setSpread(null);
        return;
      }
      setSpread(next);
      const ptn = spreadPtn(next);
      if (ptn) void submit(ptn);
      return;
    }
    setInspect(null);
    if (stones.length === 0) {
      const piece = firstTurn ? 'flat' : selected;
      setPending({ square, type: PIECE_CODE[piece], player: firstTurn ? them : me });
      tick();
      void submit(buildPlacementPtn(square, piece));
      return;
    }
    const started = firstTurn ? null : startSpread(board, square, me);
    if (started) {
      tick();
      setBanner(null);
      setSpread(started);
    } else {
      setInspect(square);
    }
  };

  useEffect(() => {
    if (tiltPreference !== null) return;
    SecureStore.getItemAsync(TILT_KEY)
      .then((v) => {
        if (tiltPreference !== null) return;
        tiltPreference = v === '1';
        setTilt(tiltPreference);
      })
      .catch((error) => logException(toError(error), { method: 'loadTilt' }));
  }, []);

  const toggleTilt = () => {
    tiltPreference = !tilt;
    setTilt(tiltPreference);
    SecureStore.setItemAsync(TILT_KEY, tiltPreference ? '1' : '0').catch((error) =>
      logException(toError(error), { method: 'saveTilt' }),
    );
  };

  const share = async () => {
    if (!game) return;
    try {
      const link = gotakAPI.getGameLink(game.Slug);
      await Share.share({ message: `Play Tak with me: ${link} (game ${game.Slug})`, url: link });
    } catch (error) {
      logException(toError(error), { method: 'share' });
    }
  };

  const rematch = async () => {
    if (!board || !game) return;
    setBusy(true);
    try {
      const next = await gotakAPI.createGame(board.size, game.mode);
      navigation.replace('Game', { gameId: next.Slug, mode: game.mode });
    } catch (error) {
      setBanner({ text: gotakAPI.formatError(error, 'Could not start a new game.'), tone: 'error' });
      setBusy(false);
    }
  };

  if (!game || !board) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        {loadError ? (
          <View style={styles.loadError}>
            <Text style={type.body}>{loadError}</Text>
            <View style={styles.actions}>
              <TextButton label="Back" onPress={() => navigation.goBack()} />
              <TextButton label="Try again" primary onPress={() => void loadGame()} />
            </View>
          </View>
        ) : (
          <ActivityIndicator color={color.accent} size="large" />
        )}
      </SafeAreaView>
    );
  }

  let shown = spread ? previewBoard(board, spread) : board;
  if (pending) {
    shown = { ...shown, squares: { ...shown.squares, [pending.square]: [{ player: pending.player, type: pending.type }] } };
  }
  const road = finished && game.winner ? winningRoad(board, game.winner) : [];
  const handSquare = spread ? (currentSquare(spread, board.size) ?? spread.origin) : undefined;
  const marks = {
    targets: spread && me ? legalTargets(board, spread, me) : [],
    origin: spread?.origin,
    inspect: inspect ?? undefined,
    last: lastMoveSquares(game.Turns, board.size),
    road,
    hand: spread && handSquare ? { square: handSquare, count: remaining(spread) } : undefined,
  };

  const mine = me ? remainingPieces(board, me) : null;
  const theirs = remainingPieces(board, them);
  const opponentName = game.mode === 'ai' ? 'Computer' : me ? 'Opponent' : playerName(them);
  const boardWidth = Math.max(260, Math.min(width - space.lg, height - 420, 600));

  let status: BannerState = banner;
  if (!status && game.status === 'waiting' && game.mode === 'human') {
    status = { text: 'Waiting for someone to join.', action: { label: 'Invite', onPress: () => void share() } };
  } else if (!status && !me) {
    status = { text: 'You are watching this game.' };
  } else if (!status && canAct && firstTurn) {
    status = { text: "First turn: place one of your opponent's flats." };
  } else if (!status && me && !canAct && !finished && game.mode === 'human' && game.status === 'active') {
    status = { text: 'Waiting for your opponent to move.' };
  } else if (!status && canAct && turn <= 3 && spread) {
    status = {
      text: spread.drops.length
        ? 'Tap a highlighted square to drop the next stone, or Undo to pick the last one back up.'
        : spread.hand.length > 1
          ? 'Tap a highlighted square to drop a stone. Tap the stack to carry one fewer.'
          : 'Tap a highlighted square to move the stone. Tap it again to cancel.',
    };
  } else if (!status && canAct && turn <= 3) {
    status = { text: 'Tap an empty square to place a stone, or tap your stack to move it. Connect two opposite edges to win.' };
  }

  const how = road.length ? ' by road' : ' on flats';
  const result = !finished
    ? null
    : game.winner === 0
      ? 'Draw'
      : (me ? (game.winner === me ? 'You won' : 'You lost') : `${playerName(game.winner)} wins`) + how;

  let panel: React.ReactNode;
  if (result) {
    panel = (
      <View style={styles.result}>
        <Text style={type.title}>{result}</Text>
        <View style={styles.actions}>
          <TextButton label="Home" onPress={() => navigation.goBack()} />
          {me ? <TextButton label="Rematch" primary onPress={() => void rematch()} /> : null}
        </View>
      </View>
    );
  } else if (spread) {
    panel = (
      <HandBar
        hand={spread.hand}
        remaining={remaining(spread)}
        ptn={`${spread.hand.length > 1 ? spread.hand.length : ''}${spread.origin}${spread.dir ?? ''}${spread.drops.join('')}`}
        onUndo={() => setSpread(undoSpread(spread))}
        onCancel={() => setSpread(null)}
      />
    );
  } else if (inspect) {
    panel = <StackInspector square={inspect} stones={board.squares[inspect] ?? []} onClose={() => setInspect(null)} />;
  } else if (me && mine) {
    panel = (
      <StoneTray
        player={firstTurn ? them : me}
        counts={{ flat: mine.flat, standing: mine.standing, capstone: mine.capstone }}
        selected={selected}
        onSelect={setSelected}
        flatOnly={firstTurn}
        disabled={!canAct || busy}
      />
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" label="Back to games" onPress={() => navigation.goBack()} />
        <View style={styles.headerTitle}>
          <Text style={type.title}>
            {board.size}×{board.size} {game.mode === 'ai' ? 'vs computer' : 'vs friend'}
          </Text>
          <Text style={type.small}>
            Turn {turn}
            {game.mode === 'human' ? ` · ${game.Slug}` : ''}
            {live.spectators ? ` · ${live.spectators} watching` : ''}
          </Text>
        </View>
        <IconButton icon="video-3d" label="3D board" active={tilt} onPress={toggleTilt} />
        {game.mode === 'human' ? <IconButton icon="share-variant" label="Share game" onPress={() => void share()} /> : null}
      </View>

      <PlayerBar
        player={them}
        name={opponentName}
        flats={theirs.flat}
        caps={theirs.capstone}
        onBoard={flatCount(board, them)}
        toMove={!finished && game.current_player === them}
        thinking={aiThinking}
      />

      <View style={styles.middle}>
        <Board board={shown} width={boardWidth} tilt={tilt} marks={marks} onPress={onPress} onLongPress={setInspect} />
        <MoveStrip moves={moveList(game.Turns)} />
      </View>

      <View style={styles.bottom}>
        {status ? <Banner {...status} /> : null}
        {panel}
        {me && mine ? (
          <PlayerBar
            player={me}
            name={user?.name || 'You'}
            flats={mine.flat}
            caps={mine.capstone}
            onBoard={flatCount(board, me)}
            toMove={!finished && game.current_player === me}
            mine
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ground, paddingHorizontal: space.sm },
  centered: { alignItems: 'center', justifyContent: 'center' },
  loadError: { gap: space.lg, padding: space.xl, alignSelf: 'stretch' },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: 56 },
  headerTitle: { flex: 1, paddingHorizontal: space.xs },
  middle: { flex: 1, justifyContent: 'center', gap: space.md },
  bottom: { gap: space.sm, paddingBottom: space.xs },
  result: { gap: space.md, alignItems: 'center', paddingVertical: space.sm },
  actions: { flexDirection: 'row', gap: space.sm, alignSelf: 'stretch' },
});
