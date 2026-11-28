import React, { useRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieceType, UIStone } from '../types/game';
import { color, radius, space, type } from '../theme';
import { Stone } from './Stone';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const IconButton: React.FC<{
  icon: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
}> = ({ icon, label, onPress, active, disabled }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ selected: active, disabled }}
    onPress={onPress}
    disabled={disabled}
    hitSlop={4}
    android_ripple={{ color: color.line, borderless: true, radius: 24 }}
    style={({ pressed }) => [styles.iconButton, active && styles.iconButtonActive, (pressed || disabled) && styles.dim]}
  >
    <MaterialCommunityIcons name={icon} size={24} color={active ? color.onAccent : color.text} />
  </Pressable>
);

export const TextButton: React.FC<{
  label: string;
  onPress: () => void;
  primary?: boolean;
  icon?: IconName;
  disabled?: boolean;
}> = ({ label, onPress, primary, icon, disabled }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [styles.textButton, primary && styles.textButtonPrimary, (pressed || disabled) && styles.dim]}
  >
    {icon ? <MaterialCommunityIcons name={icon} size={20} color={primary ? color.onAccent : color.text} /> : null}
    <Text style={[styles.textButtonLabel, primary && { color: color.onAccent }]}>{label}</Text>
  </Pressable>
);

export const PlayerBar: React.FC<{
  player: number;
  name: string;
  flats: number;
  caps: number;
  onBoard: number;
  toMove: boolean;
  thinking?: boolean;
  mine?: boolean;
}> = ({ player, name, flats, caps, onBoard, toMove, thinking, mine }) => (
  <View
    style={[styles.player, toMove && styles.playerToMove]}
    accessible
    accessibilityLabel={`${name}, ${flats} stones and ${caps} capstones in reserve, ${onBoard} flats on top${toMove ? ', to move' : ''}`}
  >
    <Stone player={player} type="F" size={22} />
    <View style={styles.playerName}>
      <Text style={type.body} numberOfLines={1}>
        {name}
      </Text>
      {toMove ? (
        <View style={styles.toMove}>
          {thinking ? (
            <ActivityIndicator size="small" color={color.textDim} />
          ) : (
            <View style={[styles.toMoveDot, { backgroundColor: mine ? color.accent : color.textDim }]} />
          )}
          <Text style={[type.small, { color: mine ? color.accent : color.textDim }]}>{thinking ? 'Thinking' : 'To move'}</Text>
        </View>
      ) : null}
    </View>
    <Stat value={flats} label="stones" />
    <Stat value={caps} label="caps" />
    <Stat value={onBoard} label="flats" strong />
  </View>
);

const Stat: React.FC<{ value: number; label: string; strong?: boolean }> = ({ value, label, strong }) => (
  <View style={styles.stat}>
    <Text style={[styles.statValue, strong && { color: color.text }]}>{value}</Text>
    <Text style={type.small}>{label}</Text>
  </View>
);

const PIECES: { type: PieceType; code: string; label: string }[] = [
  { type: 'flat', code: 'F', label: 'Flat' },
  { type: 'standing', code: 'S', label: 'Wall' },
  { type: 'capstone', code: 'C', label: 'Cap' },
];

export const StoneTray: React.FC<{
  player: number;
  counts: Record<PieceType, number>;
  selected: PieceType;
  onSelect: (t: PieceType) => void;
  flatOnly: boolean;
  disabled?: boolean;
}> = ({ player, counts, selected, onSelect, flatOnly, disabled: allOff }) => (
  <View style={styles.tray}>
    {PIECES.map((p) => {
      const disabled = !!allOff || counts[p.type] === 0 || (flatOnly && p.type !== 'flat');
      const on = selected === p.type && !disabled;
      return (
        <Pressable
          key={p.type}
          accessibilityRole="button"
          accessibilityLabel={`${p.label}, ${counts[p.type]} left`}
          accessibilityState={{ selected: on, disabled }}
          disabled={disabled}
          onPress={() => onSelect(p.type)}
          style={({ pressed }) => [styles.trayItem, on && styles.trayItemOn, (disabled || pressed) && styles.dim]}
        >
          <View style={styles.trayStone}>
            <Stone player={player} type={p.code} size={30} />
          </View>
          <Text style={[styles.trayLabel, on && { color: color.text }]}>{p.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

export const HandBar: React.FC<{
  hand: UIStone[];
  remaining: number;
  ptn: string;
  onUndo: () => void;
  onCancel: () => void;
}> = ({ hand, remaining, ptn, onUndo, onCancel }) => (
  <View style={styles.panel}>
    <View style={styles.handStones}>
      {hand.slice(hand.length - remaining).map((s, i) => (
        <View key={i} style={{ marginTop: 2 }}>
          <Stone player={s.player} type={s.type} size={34} side />
        </View>
      ))}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={type.body}>Carrying {remaining}</Text>
      <Text style={[type.label, styles.mono]}>{ptn}</Text>
    </View>
    <IconButton icon="undo" label="Undo last drop" onPress={onUndo} />
    <IconButton icon="close" label="Cancel move" onPress={onCancel} />
  </View>
);

export const StackInspector: React.FC<{
  square: string;
  stones: UIStone[];
  onClose: () => void;
}> = ({ square, stones, onClose }) => (
  <View style={styles.panel}>
    <View style={{ flex: 1 }}>
      <Text style={type.label}>
        {square} · {stones.length} {stones.length === 1 ? 'stone' : 'stones'}, bottom to top
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inspectRow}>
        {stones.length === 0 ? <Text style={type.label}>Empty</Text> : null}
        {stones.map((s, i) => (
          <Stone key={i} player={s.player} type={s.type} size={24} />
        ))}
      </ScrollView>
    </View>
    <IconButton icon="close" label="Close stack view" onPress={onClose} />
  </View>
);

export const Banner: React.FC<{ text: string; tone?: 'info' | 'error'; action?: { label: string; onPress: () => void } }> = ({
  text,
  tone = 'info',
  action,
}) => (
  <View
    accessibilityLiveRegion="polite"
    style={[styles.banner, tone === 'error' && { backgroundColor: 'rgba(242, 112, 106, 0.16)' }]}
  >
    <Text style={[type.label, { flex: 1, color: tone === 'error' ? color.danger : color.text }]}>{text}</Text>
    {action ? (
      <Pressable accessibilityRole="button" onPress={action.onPress} hitSlop={12}>
        <Text style={[type.label, { color: color.accent }]}>{action.label}</Text>
      </Pressable>
    ) : null}
  </View>
);

export const MoveStrip: React.FC<{ moves: { n: number; white?: string; black?: string }[] }> = ({ moves }) => {
  const ref = useRef<ScrollView>(null);
  if (!moves.length) return null;
  return (
    <ScrollView
      ref={ref}
      horizontal
      style={{ flexGrow: 0 }}
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={() => ref.current?.scrollToEnd({ animated: true })}
      contentContainerStyle={styles.moves}
    >
      {moves.map((m) => (
        <Text key={m.n} style={[type.label, styles.mono]}>
          <Text style={{ color: color.textDim, opacity: 0.7 }}>{m.n}. </Text>
          <Text style={{ color: color.text }}>{m.white ?? ''}</Text> <Text style={{ color: color.text }}>{m.black ?? ''}</Text>
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dim: { opacity: 0.45 },
  mono: { fontVariant: ['tabular-nums'], letterSpacing: 0.2 },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: { backgroundColor: color.accent },
  textButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: color.surfaceHigh,
    paddingHorizontal: space.lg,
  },
  textButtonPrimary: { backgroundColor: color.accent },
  textButtonLabel: { fontSize: 16, fontWeight: '600', color: color.text },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    minHeight: 56,
  },
  playerToMove: { backgroundColor: color.surface },
  playerName: { flex: 1 },
  toMove: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  toMoveDot: { width: 8, height: 8, borderRadius: 4 },
  stat: { alignItems: 'center', minWidth: 44 },
  statValue: { fontSize: 18, fontWeight: '600', color: color.textDim, fontVariant: ['tabular-nums'] },
  tray: { flexDirection: 'row', gap: space.sm },
  trayItem: {
    flex: 1,
    minHeight: 72,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  trayItemOn: { borderColor: color.accent, backgroundColor: color.surfaceHigh },
  trayStone: { height: 32, alignItems: 'center', justifyContent: 'center' },
  trayLabel: { fontSize: 13, fontWeight: '600', color: color.textDim },
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 72,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingLeft: space.lg,
    paddingRight: space.xs,
  },
  handStones: { flexDirection: 'column-reverse', alignItems: 'center', justifyContent: 'center', minWidth: 36 },
  inspectRow: { alignItems: 'flex-end', gap: 3, paddingVertical: space.sm, minHeight: 40 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.sm,
    backgroundColor: color.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    minHeight: 40,
  },
  moves: { gap: space.md, paddingHorizontal: space.xs, alignItems: 'center', minHeight: 28 },
});
