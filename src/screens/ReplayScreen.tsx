import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Replay, normalizeBoard } from '../types/game';
import { gotakAPI } from '../services/api';
import { SPEEDS, stepDelay } from '../utils/replay';
import { logException } from '../utils/logger';
import { Board } from '../components/Board';
import { Banner, IconButton, TextButton } from '../components/GamePanels';
import { color, playerName, radius, space, type } from '../theme';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Replay'>;
  route: RouteProp<RootStackParamList, 'Replay'>;
}

const NO_MARKS = { targets: [], last: [] };

/** Drag or tap along the bar to pick a step; adjustable for screen readers. */
const Scrubber: React.FC<{ at: number; max: number; onChange: (at: number) => void }> = ({ at, max, onChange }) => {
  const [width, setWidth] = useState(1);
  const pick = (x: number) => onChange(Math.round(Math.min(1, Math.max(0, x / width)) * max));
  const fill = max ? at / max : 0;
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Move"
      accessibilityValue={{ min: 0, max, now: at }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(Math.min(max, Math.max(0, at + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width || 1)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => pick(e.nativeEvent.locationX)}
      onResponderMove={(e) => pick(e.nativeEvent.locationX)}
      style={styles.scrubber}
    >
      <View pointerEvents="none" style={styles.track}>
        <View style={[styles.trackFill, { width: `${fill * 100}%` }]} />
      </View>
      <View pointerEvents="none" style={[styles.thumb, { left: `${fill * 100}%` }]} />
    </View>
  );
};

export const ReplayScreen: React.FC<Props> = ({ navigation, route }) => {
  const { width, height } = useWindowDimensions();
  const slug = route.params.gameId;
  const [replay, setReplay] = useState<Replay | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 0 is the empty start position; n shows the board after steps[n - 1].
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [real, setReal] = useState(false);

  const load = useCallback(async () => {
    try {
      setReplay(await gotakAPI.getReplay(slug));
      setError(null);
    } catch (e) {
      logException(e instanceof Error ? e : new Error(String(e)), { method: 'getReplay' });
      setError(gotakAPI.formatError(e, 'Could not load the replay.'));
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; setState runs after await
    void load();
  }, [load]);

  const steps = useMemo(() => replay?.steps ?? [], [replay]);
  const last = steps.length;

  useEffect(() => {
    if (!playing) return;
    if (at >= last) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- playback stops on reaching the end
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setAt((n) => Math.min(last, n + 1)), stepDelay(steps, at, speed, real));
    return () => clearTimeout(id);
  }, [playing, at, last, steps, speed, real]);

  const board = useMemo(() => {
    if (!replay) return null;
    return normalizeBoard({ Size: replay.size, Squares: at > 0 ? steps[at - 1].board : {} });
  }, [replay, steps, at]);

  if (!replay || !board) {
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
          <ActivityIndicator color={color.accent} size="large" />
        )}
      </SafeAreaView>
    );
  }

  const step = at > 0 ? steps[at - 1] : null;
  const boardWidth = Math.max(260, Math.min(width - space.lg, height - 360, 600));
  const seek = (n: number) => {
    setPlaying(false);
    setAt(n);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" label="Back to game" onPress={() => navigation.goBack()} />
        <View style={styles.headerTitle}>
          <Text style={type.title}>Replay</Text>
          <Text style={type.small}>
            {replay.size}×{replay.size} · {slug}
          </Text>
        </View>
      </View>

      <View style={styles.middle}>
        <Board board={board} width={boardWidth} tilt={false} marks={NO_MARKS} onPress={() => {}} onLongPress={() => {}} />
        <Text style={[type.body, styles.caption]} accessibilityLiveRegion="polite">
          {step ? `Turn ${step.turn} · ${playerName(step.player)} · ${step.move}` : 'Start'}
          <Text style={type.label}>{`  ${at} / ${last}`}</Text>
        </Text>
        {step?.comment ? (
          <ScrollView key={at} style={styles.comment}>
            <Banner text={step.comment} />
          </ScrollView>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <Scrubber at={at} max={last} onChange={seek} />
        <View style={styles.controls}>
          <IconButton icon="skip-previous" label="Jump to start" disabled={at === 0} onPress={() => seek(0)} />
          <IconButton icon="step-backward" label="Previous move" disabled={at === 0} onPress={() => seek(at - 1)} />
          <IconButton
            icon={playing ? 'pause' : 'play'}
            label={playing ? 'Pause' : 'Play'}
            active={playing}
            disabled={!last}
            onPress={() => {
              if (!playing && at >= last) setAt(0);
              setPlaying(!playing);
            }}
          />
          <IconButton icon="step-forward" label="Next move" disabled={at >= last} onPress={() => seek(at + 1)} />
          <IconButton icon="skip-next" label="Jump to end" disabled={at >= last} onPress={() => seek(last)} />
        </View>
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Speed ${speed}x`}
            onPress={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
            style={({ pressed }) => [styles.chip, pressed && styles.dim]}
          >
            <Text style={styles.chipText}>{speed}×</Text>
          </Pressable>
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="Pace by real move times"
            accessibilityState={{ checked: real }}
            onPress={() => setReal(!real)}
            style={({ pressed }) => [styles.chip, real && styles.chipOn, pressed && styles.dim]}
          >
            <Text style={[styles.chipText, real && { color: color.onAccent }]}>Real timing</Text>
          </Pressable>
        </View>
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
  comment: { flexGrow: 0, maxHeight: 96 },
  caption: { textAlign: 'center', fontVariant: ['tabular-nums'] },
  bottom: { gap: space.sm, paddingBottom: space.xs },
  controls: { flexDirection: 'row', justifyContent: 'space-around' },
  row: { flexDirection: 'row', gap: space.sm, justifyContent: 'center' },
  scrubber: { height: 48, justifyContent: 'center', marginHorizontal: space.md },
  track: { height: 4, borderRadius: 2, backgroundColor: color.line, overflow: 'hidden' },
  trackFill: { height: 4, backgroundColor: color.accent },
  thumb: { position: 'absolute', width: 20, height: 20, marginLeft: -10, borderRadius: 10, backgroundColor: color.accent },
  chip: {
    minHeight: 48,
    minWidth: 64,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: color.accent },
  chipText: { fontSize: 14, fontWeight: '600', color: color.text, fontVariant: ['tabular-nums'] },
  dim: { opacity: 0.45 },
});
