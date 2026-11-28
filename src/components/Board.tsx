import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UIBoard, UIStone } from '../types/game';
import { coordsToSquare } from '../utils/ptn';
import { color, stoneFill } from '../theme';
import { Stone } from './Stone';

export interface BoardMarks {
  targets: string[];
  origin?: string;
  inspect?: string;
  last: string[];
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

const Square: React.FC<{
  square: string;
  stones: UIStone[];
  tile: number;
  file?: string;
  rank?: string;
  marks: BoardMarks;
  onPress: (square: string) => void;
  onLongPress: (square: string) => void;
}> = ({ square, stones, tile, file, rank, marks, onPress, onLongPress }) => {
  const top = stones[stones.length - 1];
  const under = stones.slice(0, -1).slice(-UNDER_SHOWN);
  const target = marks.targets.includes(square);
  const isOrigin = marks.origin === square;
  const last = marks.last.includes(square);
  const inspect = marks.inspect === square;
  const hand = marks.hand?.square === square ? marks.hand.count : 0;
  const bar = Math.max(4, tile * 0.08);

  const label = top
    ? `${square}, ${stones.length} stone${stones.length > 1 ? 's' : ''}, ${top.player === 1 ? 'white' : 'black'} ${top.type === 'S' ? 'wall' : top.type === 'C' ? 'capstone' : 'flat'} on top`
    : `${square}, empty`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
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
      {inspect ? <View style={[StyleSheet.absoluteFill, styles.inspect]} /> : null}

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
  coord: { position: 'absolute', fontSize: 10, fontWeight: '700', color: 'rgba(15, 21, 19, 0.55)' },
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
