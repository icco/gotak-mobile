import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { UIBoard, UIStone } from '../types/game';
import { coordsToSquare, squareToCoords } from '../utils/ptn';
import { roadLinks } from '../utils/board';
import { color, stoneFill } from '../theme';
import { Stone } from './Stone';

export interface BoardMarks {
  targets: string[];
  origin?: string;
  inspect?: string;
  last: string[];
  /** Squares of the winning road, highlighted when the game ends by road. */
  road?: string[];
  /** Square showing the floating hand, with the count still carried. */
  hand?: { square: string; count: number };
}

interface Props {
  board: UIBoard;
  width: number;
  tilt: boolean;
  marks: BoardMarks;
  onPress: (square: string) => void;
  onLongPress: (square: string) => void;
}

const GAP = 3;
const PAD = 6;
const UNDER_SHOWN = 8;

type Link = { dir: 'l' | 'r' | 'u' | 'd'; player: number; win: boolean };

const Square: React.FC<{
  square: string;
  stones: UIStone[];
  tile: number;
  file?: string;
  rank?: string;
  marks: BoardMarks;
  links: Link[];
  onPress: (square: string) => void;
  onLongPress: (square: string) => void;
}> = ({ square, stones, tile, file, rank, marks, links, onPress, onLongPress }) => {
  const top = stones[stones.length - 1];
  const under = stones.slice(0, -1).slice(-UNDER_SHOWN);
  const target = marks.targets.includes(square);
  const isOrigin = marks.origin === square;
  const last = marks.last.includes(square);
  const inspect = marks.inspect === square;
  const hand = marks.hand?.square === square ? marks.hand.count : 0;
  const bar = Math.max(4, tile * 0.08);
  const roadIndex = marks.road?.indexOf(square) ?? -1;
  const [sweep] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (roadIndex < 0) return;
    sweep.setValue(0);
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) {
        sweep.setValue(1);
        return;
      }
      Animated.timing(sweep, {
        toValue: 1,
        duration: 280,
        delay: roadIndex * 70,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    });
  }, [roadIndex, sweep]);

  const label = top
    ? `${square}, ${stones.length} stone${stones.length > 1 ? 's' : ''}, ${top.player === 1 ? 'white' : 'black'} ${top.type === 'S' ? 'wall' : top.type === 'C' ? 'capstone' : 'flat'} on top`
    : `${square}, empty`;
  const spoken = roadIndex >= 0 ? `${label}, part of the winning road` : label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityState={{ selected: isOrigin || inspect }}
      onPress={() => onPress(square)}
      onLongPress={() => onLongPress(square)}
      delayLongPress={300}
      style={({ pressed }) => [
        styles.tile,
        { width: tile, height: tile },
        pressed && styles.pressed,
      ]}
    >
      {last ? <View style={[StyleSheet.absoluteFill, styles.last]} /> : null}
      {isOrigin ? <View style={[StyleSheet.absoluteFill, styles.origin]} /> : null}
      {target ? <View style={[StyleSheet.absoluteFill, styles.target]} /> : null}
      {roadIndex >= 0 ? <Animated.View style={[StyleSheet.absoluteFill, styles.origin, { opacity: sweep }]} /> : null}
      {inspect ? <View style={[StyleSheet.absoluteFill, styles.inspect]} /> : null}

      {links.map((l) => {
        const t = Math.max(4, tile * (l.win ? 0.14 : 0.1));
        const h = l.dir === 'l' || l.dir === 'r';
        return (
          <Animated.View
            key={l.dir}
            style={{
              position: 'absolute',
              backgroundColor: l.win ? color.accent : stoneFill(l.player),
              opacity: l.win ? sweep : 0.8,
              ...(h
                ? { top: (tile - t) / 2, height: t, left: l.dir === 'r' ? tile / 2 : -1, right: l.dir === 'l' ? tile / 2 : -1 }
                : { left: (tile - t) / 2, width: t, top: l.dir === 'u' ? -1 : tile / 2, bottom: l.dir === 'd' ? -1 : tile / 2 }),
            }}
          />
        );
      })}

      {rank ? <Text style={[styles.coord, styles.rank]}>{rank}</Text> : null}
      {file ? <Text style={[styles.coord, styles.file]}>{file}</Text> : null}

      {under.length ? (
        <View style={[styles.under, { left: tile * 0.06, bottom: tile * 0.08 }]}>
          {under.map((s, i) => (
            <View
              key={i}
              style={{ width: tile * 0.2, height: bar, marginTop: 1, borderRadius: 1, backgroundColor: stoneFill(s.player) }}
            />
          ))}
        </View>
      ) : null}

      {top ? (
        <Stone player={top.player} type={top.type} size={tile * 0.6} />
      ) : target ? (
        <View style={[styles.dot, { width: tile * 0.22, height: tile * 0.22 }]} />
      ) : null}

      {stones.length > 1 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{stones.length}</Text>
        </View>
      ) : null}

      {hand ? (
        <View style={styles.hand}>
          <Text style={styles.handText}>{hand}</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

export const Board: React.FC<Props> = ({ board, width, tilt, marks, onPress, onLongPress }) => {
  const tile = (width - PAD * 2 - GAP * (board.size - 1)) / board.size;
  const links = new Map<string, Link[]>();
  const road = new Set(marks.road);
  const bridges = [];
  for (const { from, to, player } of roadLinks(board)) {
    const win = road.has(from) && road.has(to);
    const across = from[1] === to[1];
    links.set(from, [...(links.get(from) ?? []), { dir: across ? 'r' : 'u', player, win }]);
    links.set(to, [...(links.get(to) ?? []), { dir: across ? 'l' : 'd', player, win }]);
    // Tiles clip their own halves, so the gap between them gets its own piece.
    const c = squareToCoords(from)!;
    const t = Math.max(4, tile * (win ? 0.14 : 0.1));
    const step = tile + GAP;
    const top = PAD + (board.size - 1 - c.y) * step;
    const left = PAD + c.x * step;
    bridges.push(
      <View
        key={`${from}-${to}`}
        pointerEvents="none"
        style={{
          position: 'absolute',
          backgroundColor: win ? color.accent : stoneFill(player),
          opacity: win ? 1 : 0.8,
          ...(across
            ? { left: left + tile, width: GAP, top: top + (tile - t) / 2, height: t }
            : { top: top - GAP, height: GAP, left: left + (tile - t) / 2, width: t }),
        }}
      />,
    );
  }
  const rows = [];
  for (let y = board.size - 1; y >= 0; y--) {
    const cells = [];
    for (let x = 0; x < board.size; x++) {
      const sq = coordsToSquare(x, y);
      cells.push(
        <Square
          key={sq}
          square={sq}
          stones={board.squares[sq] ?? []}
          tile={tile}
          file={y === 0 ? sq[0] : undefined}
          rank={x === 0 ? String(y + 1) : undefined}
          marks={marks}
          links={links.get(sq) ?? []}
          onPress={onPress}
          onLongPress={onLongPress}
        />,
      );
    }
    rows.push(
      <View key={y} style={[styles.row, { gap: GAP }]}>
        {cells}
      </View>,
    );
  }
  return (
    <View
      style={[
        styles.board,
        { width, padding: PAD, gap: GAP },
        tilt && { transform: [{ perspective: 900 }, { rotateX: '34deg' }, { scale: 0.94 }], elevation: 0, shadowOpacity: 0 },
      ]}
    >
      {rows}
      {bridges}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: color.board,
    borderRadius: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  row: { flexDirection: 'row' },
  tile: {
    backgroundColor: color.tile,
    borderRadius: 4,
    borderBottomWidth: 2,
    borderBottomColor: color.tileEdge,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85 },
  last: { backgroundColor: color.lastMove },
  origin: { backgroundColor: color.accentSoft },
  target: { borderWidth: 3, borderColor: color.accent, borderRadius: 4 },
  inspect: { borderWidth: 2, borderColor: color.text, borderRadius: 4 },
  dot: { borderRadius: 999, backgroundColor: color.accent, opacity: 0.9 },
  coord: { position: 'absolute', fontSize: 11, fontWeight: '700', color: 'rgba(15, 21, 19, 0.8)' },
  rank: { top: 2, left: 4 },
  file: { bottom: 2, right: 4 },
  under: { position: 'absolute', flexDirection: 'column-reverse' },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: 'rgba(15, 21, 19, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: color.text, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  hand: {
    position: 'absolute',
    top: 3,
    alignSelf: 'center',
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handText: { color: color.onAccent, fontSize: 12, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
