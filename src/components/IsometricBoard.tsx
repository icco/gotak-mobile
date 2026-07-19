import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { PieceType, UIBoard, UIStone } from '../types/game';

interface Props {
  board: UIBoard;
  onSquarePress: (x: number, y: number) => void;
  selectedPieceType?: PieceType;
  selectedSquare?: string;
}

export const IsometricBoard: React.FC<Props> = ({
  board,
  onSquarePress,
  selectedPieceType,
  selectedSquare,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const boardPixelSize = Math.min(screenWidth - 32, 400);

  const tileWidth = boardPixelSize / (board.size + 1);
  const tileHeight = tileWidth * 0.6;
  const pieceHeight = tileHeight * 0.25;

  const getSquaresArray = () => {
    const squares: { x: number; y: number; key: string; stones: UIStone[] }[] = [];
    for (let y = 0; y < board.size; y++) {
      for (let x = 0; x < board.size; x++) {
        const file = String.fromCharCode(97 + x);
        const rank = y + 1;
        const key = `${file}${rank}`;
        squares.push({ x, y, key, stones: board.squares[key] || [] });
      }
    }
    return squares;
  };

  const gridToIsometric = (x: number, y: number) => {
    const centerX = boardPixelSize / 2;
    const centerY = boardPixelSize * 0.4;
    const isoX = centerX + (x - y) * tileWidth * 0.5;
    const isoY = centerY + (x + y) * tileHeight * 0.5;
    return { x: isoX, y: isoY };
  };

  const renderSquare = (x: number, y: number, key: string, stones: UIStone[]) => {
    const isoPos = gridToIsometric(x, y);
    const canPlacePiece = Boolean(selectedPieceType && stones.length === 0);
    const isSelected = selectedSquare === key;

    return (
      <View
        key={`square-${x}-${y}`}
        style={[
          styles.isometricSquare,
          {
            position: 'absolute',
            left: isoPos.x - tileWidth / 2,
            top: isoPos.y - tileHeight / 2,
            width: tileWidth,
            height: tileHeight,
            backgroundColor: isSelected
              ? 'rgba(52, 152, 219, 0.5)'
              : canPlacePiece
                ? 'rgba(255, 215, 0, 0.4)'
                : 'rgba(210, 180, 140, 0.4)',
            borderWidth: canPlacePiece || isSelected ? 2 : 1,
            borderColor: isSelected ? '#3498db' : canPlacePiece ? '#ffd700' : '#8b4513',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.squareTouchable}
          onPress={() => onSquarePress(x, y)}
        />
      </View>
    );
  };

  const renderStone = (stone: UIStone, x: number, y: number, stackIndex: number) => {
    const isoPos = gridToIsometric(x, y);
    const stackHeight = stackIndex * pieceHeight;
    const pieceSize = tileWidth * 0.35;
    const color = stone.player === 1 ? '#f8f9fa' : '#2c3e50';
    const strokeColor = stone.player === 1 ? '#dee2e6' : '#1a252f';
    const stoneType = stone.type.toUpperCase();

    if (stoneType === 'S') {
      const height = pieceHeight * 1.5;
      const width = pieceSize * 0.7;
      return (
        <View
          key={`stone-${x}-${y}-${stackIndex}`}
          style={[
            styles.stone,
            {
              width,
              height,
              backgroundColor: color,
              borderWidth: 1,
              borderColor: strokeColor,
              position: 'absolute',
              left: isoPos.x - width / 2,
              top: isoPos.y - tileHeight / 2 - stackHeight - height,
              zIndex: 100 + stackIndex,
            },
          ]}
        />
      );
    }

    const radius = stoneType === 'C' ? pieceSize * 0.55 : pieceSize * 0.45;
    return (
      <View
        key={`stone-${x}-${y}-${stackIndex}`}
        style={[
          styles.stone,
          {
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            backgroundColor: color,
            borderWidth: stoneType === 'C' ? 2 : 1,
            borderColor: strokeColor,
            position: 'absolute',
            left: isoPos.x - radius,
            top: isoPos.y - tileHeight / 2 - stackHeight - radius * 2,
            zIndex: 100 + stackIndex,
          },
        ]}
      />
    );
  };

  const renderGridLines = () => {
    const lines = [];
    const stroke = 'rgba(139, 69, 19, 0.6)';

    for (let x = 0; x <= board.size; x++) {
      const a = gridToIsometric(x - 0.5, -0.5);
      const b = gridToIsometric(x - 0.5, board.size - 0.5);
      lines.push(
        <Line key={`vline-${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={1} />,
      );
    }

    for (let y = 0; y <= board.size; y++) {
      const a = gridToIsometric(-0.5, y - 0.5);
      const b = gridToIsometric(board.size - 0.5, y - 0.5);
      lines.push(
        <Line key={`hline-${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={1} />,
      );
    }

    return lines;
  };

  const squares = getSquaresArray();

  return (
    <View style={[styles.container, { width: boardPixelSize, height: boardPixelSize * 0.8 }]}>
      <Svg
        width={boardPixelSize}
        height={boardPixelSize * 0.8}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {renderGridLines()}
      </Svg>

      {squares.map(({ x, y, key, stones }) => renderSquare(x, y, key, stones))}
      {squares.map(({ x, y, stones }) =>
        stones.map((stone, stackIndex) => renderStone(stone, x, y, stackIndex)),
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: '#34495e',
  },
  isometricSquare: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareTouchable: {
    width: '100%',
    height: '100%',
  },
  stone: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
