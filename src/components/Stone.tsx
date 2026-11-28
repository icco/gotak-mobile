import React from 'react';
import { View, ViewStyle } from 'react-native';
import { stoneEdge, stoneFill } from '../theme';

interface Props {
  player: number;
  type: string;
  size: number;
  /** Side view draws flats as slabs, as in a stack seen from the edge. */
  side?: boolean;
}

export const Stone: React.FC<Props> = ({ player, type, size, side }) => {
  const base: ViewStyle = {
    backgroundColor: stoneFill(player),
    borderColor: stoneEdge(player),
    borderWidth: Math.max(1, size * 0.04),
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: size * 0.06,
    shadowOffset: { width: 0, height: size * 0.05 },
    elevation: 3,
  };
  if (type === 'S') {
    const shape = side
      ? { width: size * 0.3, height: size * 0.9, borderRadius: size * 0.06 }
      : { width: size * 0.32, height: size * 0.92, borderRadius: size * 0.08, transform: [{ rotate: '45deg' }] };
    return <View style={[base, shape]} />;
  }
  if (type === 'C') {
    const shape = side
      ? { width: size * 0.6, height: size * 0.8, borderTopLeftRadius: size * 0.3, borderTopRightRadius: size * 0.3, borderRadius: size * 0.08 }
      : { width: size * 0.72, height: size * 0.72, borderRadius: size };
    return <View style={[base, shape]} />;
  }
  const shape = side
    ? { width: size, height: size * 0.22, borderRadius: size * 0.08 }
    : { width: size, height: size, borderRadius: size * 0.16 };
  return <View style={[base, shape]} />;
};
