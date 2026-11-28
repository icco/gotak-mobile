import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Polyline } from 'react-native-svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { GameAnalysis, MoveAnalysis, MoveQuality, MoveScore, UIBoard } from '../types/game';
import { gotakAPI } from '../services/api';
import { GRAPH_CLAMP, FLAT, clampScore, formatScore, parseTps } from '../utils/analysis';
import { logException } from '../utils/logger';
import { Board, BoardMarks } from '../components/Board';
import { Banner, IconButton, TextButton } from '../components/GamePanels';
import { color, playerName, radius, space, type } from '../theme';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Analysis'>;
  route: RouteProp<RootStackParamList, 'Analysis'>;
}

const GRAPH_HEIGHT = 120;
const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

const QUALITY_COLOR: Record<MoveQuality, string> = {
  best: color.text,
  good: color.textDim,
  inaccuracy: color.accent,
  mistake: color.danger,
  blunder: color.danger,
};

/** score_after per move, White up; moves the engine could not score leave gaps. */
const EvalGraph: React.FC<{ moves: MoveAnalysis[]; width: number; selected: number; onSelect: (i: number) => void }> = ({
  moves,
  width,
  selected,
  onSelect,
}) => {
  const n = moves.length;
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * width : width / 2);
  const y = (score: number) => GRAPH_HEIGHT / 2 - (clampScore(score) / GRAPH_CLAMP) * (GRAPH_HEIGHT / 2 - 4);
  const runs: string[] = [];
  let run: string[] = [];
  moves.forEach((m, i) => {
    if (m.error) {
      if (run.length) runs.push(run.join(' '));
      run = [];
      return;
    }
    run.push(`${x(i)},${y(m.score_after)}`);
  });
  if (run.length) runs.push(run.join(' '));
  const pick = (px: number) => onSelect(Math.round(Math.min(1, Math.max(0, px / width)) * (n - 1)));
  const m = moves[selected];

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Evaluation graph"
      accessibilityValue={{ text: m ? `Move ${selected + 1}, ${m.error ? 'not scored' : formatScore(m.score_after)}` : undefined }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onSelect(Math.min(n - 1, Math.max(0, selected + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => pick(e.nativeEvent.locationX)}
      onResponderMove={(e) => pick(e.nativeEvent.locationX)}
      style={[styles.graph, { width, height: GRAPH_HEIGHT }]}
    >
      <Svg width={width} height={GRAPH_HEIGHT} pointerEvents="none">
        <Line x1={0} x2={width} y1={GRAPH_HEIGHT / 2} y2={GRAPH_HEIGHT / 2} stroke={color.line} strokeWidth={1} />
        {runs.map((points, i) =>
          points.includes(' ') ? (
            <Polyline key={i} points={points} fill="none" stroke={color.text} strokeWidth={2} />
          ) : null,
        )}
        <Line x1={x(selected)} x2={x(selected)} y1={0} y2={GRAPH_HEIGHT} stroke={color.accent} strokeWidth={2} />
      </Svg>
    </View>
  );
};

const moveLabel = (m: MoveAnalysis) => `${m.turn}.${m.player === 2 ? '..' : ''} ${m.played}`;

export const AnalysisScreen: React.FC<Props> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const slug = route.params.gameId;
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);
  const [showThreats, setShowThreats] = useState(false);
  const [threats, setThreats] = useState<BoardMarks['threats']>(undefined);
  const [heat, setHeat] = useState<Record<string, number> | null>(null);
  const [showHeat, setShowHeat] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [tryInput, setTryInput] = useState('');
  const [compared, setCompared] = useState<MoveScore[] | null>(null);
  const [comparing, setComparing] = useState(false);
  const threatCache = useRef(new Map<string, BoardMarks['threats']>());

  const load = useCallback(async () => {
    setError(null);
    try {
      setAnalysis(await gotakAPI.analyzeGame(slug));
    } catch (e) {
      logException(toError(e), { method: 'analyzeGame' });
      setError(gotakAPI.formatError(e, 'Could not analyze this game.'));
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; setState runs after await
    void load();
  }, [load]);

  const move = analysis?.moves[selected];
  const tps = move?.tps;

  const board: UIBoard | null = useMemo(() => {
    if (!tps) return null;
    try {
      return parseTps(tps);
    } catch (e) {
      logException(toError(e), { method: 'parseTps', tps });
      return null;
    }
  }, [tps]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new position clears the last comparison
    setCompared(null);
    if (!showThreats || !tps) return;
    const cached = threatCache.current.get(tps);
    if (cached) {
      setThreats(cached);
      return;
    }
    setThreats(undefined);
    let current = true;
    gotakAPI
      .analyzePosition(tps)
      .then((t) => {
        const marks: Record<string, number[]> = {};
        for (const sq of t.white) marks[sq] = [1];
        for (const sq of t.black) marks[sq] = [...(marks[sq] ?? []), 2];
        threatCache.current.set(tps, marks);
        if (current) setThreats(marks);
      })
      .catch((e) => {
        logException(toError(e), { method: 'analyzePosition' });
        if (current) setNotice(gotakAPI.formatError(e, 'Could not load road threats.'));
      });
    return () => {
      current = false;
    };
  }, [showThreats, tps]);

  const toggleHeat = async () => {
    if (showHeat || heat || !analysis) {
      setShowHeat(!showHeat);
      return;
    }
    try {
      const map = await gotakAPI.getHeatmap(analysis.size);
      const totals = Object.entries(map.squares).map(([sq, c]) => {
        const sum = (p: { flat: number; standing: number; capstone: number }) => p.flat + p.standing + p.capstone;
        return [sq, sum(c.white) + sum(c.black)] as const;
      });
      const max = Math.max(1, ...totals.map(([, t]) => t));
      setHeat(Object.fromEntries(totals.map(([sq, t]) => [sq, t / max])));
      setShowHeat(true);
    } catch (e) {
      logException(toError(e), { method: 'getHeatmap' });
      setNotice(gotakAPI.formatError(e, 'Could not load the heat map.'));
    }
  };

  const compare = async () => {
    if (!move?.tps) return;
    const typed = tryInput.split(/[\s,]+/).filter(Boolean);
    const moves = [...new Set([...typed, move.played, move.best].filter(Boolean))].slice(0, 16);
    setComparing(true);
    setNotice(null);
    try {
      setCompared(await gotakAPI.compareMoves(move.tps, moves));
    } catch (e) {
      logException(toError(e), { method: 'compareMoves' });
      setNotice(gotakAPI.formatError(e, 'Could not compare those moves.'));
    } finally {
      setComparing(false);
    }
  };

  if (!analysis) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        {error ? (
          <View style={styles.loadError}>
            <Text style={type.body}>{error}</Text>
            <View style={styles.row}>
              <TextButton label="Back" onPress={() => navigation.goBack()} />
              <TextButton label="Try again" primary onPress={() => void load()} />
            </View>
          </View>
        ) : (
          <View style={styles.loadError}>
            <ActivityIndicator color={color.accent} size="large" />
            <Text style={[type.label, { textAlign: 'center' }]}>The engine is reviewing every move. Long games can take a few minutes.</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const contentWidth = Math.min(width - space.lg, 600);
  const boardWidth = Math.max(240, Math.min(contentWidth, 420));
  const marks: BoardMarks = {
    targets: [],
    last: [],
    threats: showThreats ? threats : undefined,
    heat: showHeat && heat ? heat : undefined,
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" label="Back to game" onPress={() => navigation.goBack()} />
        <View style={styles.headerTitle}>
          <Text style={type.title}>Analysis</Text>
          <Text style={type.small}>
            {analysis.size}×{analysis.size} · {slug}
          </Text>
        </View>
        <IconButton icon="road-variant" label="Road threats" active={showThreats} onPress={() => setShowThreats(!showThreats)} />
        <IconButton icon="fire" label="Placement heat map" active={showHeat} onPress={() => void toggleHeat()} />
      </View>

      {!analysis.moves.length ? (
        <View style={[styles.centered, { flex: 1 }]}>
          <Text style={type.body}>No moves to analyze.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <EvalGraph moves={analysis.moves} width={contentWidth} selected={selected} onSelect={setSelected} />

          {analysis.critical_moments.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {analysis.critical_moments.map((c) => (
                <Pressable
                  key={c.index}
                  accessibilityRole="button"
                  accessibilityLabel={`Critical moment: turn ${c.turn}, ${playerName(c.player)} ${c.played}, ${c.quality}`}
                  onPress={() => setSelected(c.index)}
                  style={({ pressed }) => [styles.chip, selected === c.index && styles.chipOn, pressed && styles.dim]}
                >
                  <Text style={[styles.chipText, { color: selected === c.index ? color.onAccent : QUALITY_COLOR[c.quality] }]}>
                    {c.turn}. {c.played} {c.quality}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          {board ? (
            <Board board={board} width={boardWidth} tilt={false} marks={marks} onPress={() => {}} onLongPress={() => {}} />
          ) : (
            <Banner text="No position for this move." />
          )}

          {move ? (
            <View style={styles.panel} accessibilityLiveRegion="polite">
              <Text style={type.body}>
                Before {moveLabel(move)}
                {move.quality ? <Text style={{ color: QUALITY_COLOR[move.quality] }}>{`  ${move.quality}`}</Text> : null}
              </Text>
              {move.error ? (
                <Text style={type.label}>The engine could not score this move: {move.error}</Text>
              ) : (
                <>
                  <Text style={type.label}>
                    Eval {formatScore(move.score)} → {formatScore(move.score_after)}
                    {move.loss > 0 ? ` · cost ${(move.loss / FLAT).toFixed(1)} flats` : ''}
                  </Text>
                  {!move.agreed && move.best ? (
                    <Text style={type.label}>
                      Best {move.best}
                      {move.best_line?.length ? ` · line ${move.best_line.join(' ')}` : ''}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          ) : null}

          {notice ? <Banner text={notice} tone="error" /> : null}

          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Try a move, e.g. c3 or 3a1>"
              placeholderTextColor={color.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              value={tryInput}
              onChangeText={setTryInput}
              onSubmitEditing={() => void compare()}
            />
            <TextButton label={comparing ? 'Comparing' : 'Compare'} disabled={comparing || !move?.tps} onPress={() => void compare()} />
          </View>
          {compared ? (
            <View style={styles.panel}>
              {compared.map((c) => (
                <Text key={c.move} style={[type.label, styles.mono]}>
                  <Text style={{ color: color.text }}>{c.move}</Text>
                  {c.error ? `  ${c.error}` : `  ${formatScore(c.score)}${c.loss > 0 ? ` · -${(c.loss / FLAT).toFixed(1)}` : ''}${c.reply?.length ? ` · reply ${c.reply[0]}` : ''}`}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={styles.list}>
            {analysis.moves.map((m, i) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityState={{ selected: selected === i }}
                onPress={() => setSelected(i)}
                style={({ pressed }) => [styles.moveRow, selected === i && styles.moveRowOn, pressed && styles.dim]}
              >
                <Text style={[type.body, styles.mono, { flex: 1 }]}>{moveLabel(m)}</Text>
                {m.quality ? <Text style={[type.small, { color: QUALITY_COLOR[m.quality] }]}>{m.quality}</Text> : null}
                {!m.agreed && m.best ? <Text style={[type.small, styles.mono]}>best {m.best}</Text> : null}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ground, paddingHorizontal: space.sm },
  centered: { alignItems: 'center', justifyContent: 'center' },
  loadError: { gap: space.lg, padding: space.xl, alignSelf: 'stretch' },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: 56 },
  headerTitle: { flex: 1, paddingHorizontal: space.xs },
  content: { gap: space.md, paddingBottom: space.xl, alignItems: 'center' },
  graph: { backgroundColor: color.surface, borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', gap: space.sm, alignSelf: 'stretch' },
  chip: {
    minHeight: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: color.accent },
  chipText: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  panel: { alignSelf: 'stretch', gap: space.xs, backgroundColor: color.surface, borderRadius: radius.md, padding: space.lg },
  input: {
    flex: 2,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    color: color.text,
    paddingHorizontal: space.lg,
    fontSize: 16,
  },
  list: { alignSelf: 'stretch' },
  moveRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48, paddingHorizontal: space.md, borderRadius: radius.sm },
  moveRowOn: { backgroundColor: color.surfaceHigh },
  mono: { fontVariant: ['tabular-nums'] },
  dim: { opacity: 0.45 },
});
