import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { PieceType, PlayerColor } from '../types/game';

interface Props {
  pieces: {
    flat: number;
    standing: number;
    capstone: number;
  };
  color: PlayerColor;
  selectedPieceType?: PieceType;
  onPieceSelect: (pieceType: PieceType) => void;
}

export const PieceInventory: React.FC<Props> = ({ pieces, color, selectedPieceType, onPieceSelect }) => {
  const pieceColor = color === 'white' ? '#f8f9fa' : '#2c3e50';
  const strokeColor = color === 'white' ? '#dee2e6' : '#1a252f';

  const renderPieceIcon = (type: PieceType, size: number = 30) => {
    const centerX = size / 2;
    const centerY = size / 2;

    switch (type) {
      case 'flat':
        return (
          <Svg width={size} height={size}>
            <Circle
              cx={centerX}
              cy={centerY}
              r={size * 0.3}
              fill={pieceColor}
              stroke={strokeColor}
              strokeWidth="1"
            />
          </Svg>
        );
      case 'standing':
        const width = size * 0.4;
        const height = size * 0.8;
        const topLeft = { x: centerX - width / 2, y: centerY - height / 2 };
        const topRight = { x: centerX + width / 2, y: centerY - height / 2 };
        const bottomRight = { x: centerX + width / 2, y: centerY + height / 2 };
        const bottomLeft = { x: centerX - width / 2, y: centerY + height / 2 };

        const points = `${topLeft.x},${topLeft.y} ${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomLeft.x},${bottomLeft.y}`;

        return (
          <Svg width={size} height={size}>
            <Polygon
              points={points}
              fill={pieceColor}
              stroke={strokeColor}
              strokeWidth="1"
            />
          </Svg>
        );
      case 'capstone':
        return (
          <Svg width={size} height={size}>
            <Circle
              cx={centerX}
              cy={centerY}
              r={size * 0.35}
              fill={pieceColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
          </Svg>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{color} Pieces</Text>

      <View style={styles.piecesContainer}>
        <TouchableOpacity
          style={[
            styles.pieceButton,
            pieces.flat === 0 && styles.disabledButton,
            selectedPieceType === 'flat' && styles.selectedButton
          ]}
          onPress={() => pieces.flat > 0 && onPieceSelect('flat')}
          disabled={pieces.flat === 0}
        >
          {renderPieceIcon('flat', 40)}
          <Text style={styles.pieceCount}>{pieces.flat}</Text>
          <Text style={styles.pieceLabel}>Flat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.pieceButton,
            pieces.standing === 0 && styles.disabledButton,
            selectedPieceType === 'standing' && styles.selectedButton
          ]}
          onPress={() => pieces.standing > 0 && onPieceSelect('standing')}
          disabled={pieces.standing === 0}
        >
          {renderPieceIcon('standing', 40)}
          <Text style={styles.pieceCount}>{pieces.standing}</Text>
          <Text style={styles.pieceLabel}>Standing</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.pieceButton,
            pieces.capstone === 0 && styles.disabledButton,
            selectedPieceType === 'capstone' && styles.selectedButton
          ]}
          onPress={() => pieces.capstone > 0 && onPieceSelect('capstone')}
          disabled={pieces.capstone === 0}
        >
          {renderPieceIcon('capstone', 40)}
          <Text style={styles.pieceCount}>{pieces.capstone}</Text>
          <Text style={styles.pieceLabel}>Capstone</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#34495e',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  title: {
    color: '#ecf0f1',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  piecesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pieceButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2c3e50',
    minWidth: 80,
  },
  disabledButton: {
    opacity: 0.5,
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: '#3498db',
    backgroundColor: '#2980b9',
  },
  pieceCount: {
    color: '#ecf0f1',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  pieceLabel: {
    color: '#bdc3c7',
    fontSize: 12,
    marginTop: 2,
  },
});