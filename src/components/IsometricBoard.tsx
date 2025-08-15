import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';
import { Board, Stone, PieceType } from '../types/game';

interface Props {
  board: Board;
  onSquarePress: (x: number, y: number) => void;
  selectedPieceType?: PieceType;
}

export const IsometricBoard: React.FC<Props> = ({ board, onSquarePress, selectedPieceType }) => {
  const screenWidth = Dimensions.get('window').width;
  const boardSize = Math.min(screenWidth - 32, 400);
  const squareSize = boardSize / (board.size * 1.2);

  // Debug logging
  console.log('IsometricBoard render:', { boardSize, squareSize, boardSizeValue: board.size, squares: Object.keys(board.squares) });

  const getIsometricCoordinates = (x: number, y: number) => {
    const centerX = boardSize / 2;
    const centerY = boardSize / 2;

    const isoX = centerX + (x - y) * squareSize * 0.5;
    const isoY = centerY + (x + y) * squareSize * 0.25;

    return { x: isoX, y: isoY };
  };

  const renderSquare = (x: number, y: number, stones: Stone[]) => {
    const { x: isoX, y: isoY } = getIsometricCoordinates(x, y);
    const size = squareSize * 0.8;

    const topLeft = { x: isoX - size / 2, y: isoY - size / 4 };
    const topRight = { x: isoX + size / 2, y: isoY - size / 4 };
    const bottomRight = { x: isoX + size / 2, y: isoY + size / 4 };
    const bottomLeft = { x: isoX - size / 2, y: isoY + size / 4 };

    const points = `${topLeft.x},${topLeft.y} ${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomLeft.x},${bottomLeft.y}`;

    const canPlacePiece = selectedPieceType && stones.length === 0;
    const squareColor = canPlacePiece ? "#d2691e" : "#8b4513"; // More visible when selectable
    const strokeColor = canPlacePiece ? "#ffd700" : "#654321"; // Gold border when selectable

    return (
      <TouchableOpacity
        key={`square-${x}-${y}`}
        style={[StyleSheet.absoluteFillObject, { zIndex: 1 }]}
        onPress={() => onSquarePress(x, y)}
      >
        <Polygon
          points={points}
          fill={squareColor}
          stroke={strokeColor}
          strokeWidth={canPlacePiece ? "3" : "1"}
        />
        {stones.map((stone, stackIndex) =>
          renderStone(stone, isoX, isoY - (stackIndex * 6), stackIndex)
        )}
      </TouchableOpacity>
    );
  };

  const renderStone = (stone: Stone, x: number, y: number, stackIndex: number) => {
    const pieceSize = squareSize * 0.3;
    const color = stone.player === 1 ? '#f8f9fa' : '#2c3e50'; // 1 = white, 2 = black
    const strokeColor = stone.player === 1 ? '#dee2e6' : '#1a252f';

    // Handle different possible type values from the API
    const stoneType = stone.type?.toLowerCase() || 'flat';

    if (stoneType === 'wall' || stoneType === 'standing') {
      // Standing piece - render as a tall rectangle
      const height = pieceSize * 1.5;
      const width = pieceSize * 0.6;
      const topLeft = { x: x - width / 2, y: y - height / 2 };
      const topRight = { x: x + width / 2, y: y - height / 2 };
      const bottomRight = { x: x + width / 2, y: y + height / 2 };
      const bottomLeft = { x: x - width / 2, y: y + height / 2 };

      const points = `${topLeft.x},${topLeft.y} ${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomLeft.x},${bottomLeft.y}`;

      return (
        <Polygon
          key={`stone-${stackIndex}`}
          points={points}
          fill={color}
          stroke={strokeColor}
          strokeWidth="1"
        />
      );
    } else if (stoneType === 'capstone') {
      // Capstone - render as a larger circle with special styling
      return (
        <Circle
          key={`stone-${stackIndex}`}
          cx={x}
          cy={y}
          r={pieceSize * 0.6}
          fill={color}
          stroke={strokeColor}
          strokeWidth="3"
        />
      );
    } else {
      // Flat stone - render as a regular circle
      return (
        <Circle
          key={`stone-${stackIndex}`}
          cx={x}
          cy={y}
          r={pieceSize * 0.4}
          fill={color}
          stroke={strokeColor}
          strokeWidth="1"
        />
      );
    }
  };

  // Convert board.squares object to array of squares with coordinates
  const getSquaresArray = () => {
    const squares: { x: number; y: number; stones: Stone[] }[] = [];

    for (let y = 0; y < board.size; y++) {
      for (let x = 0; x < board.size; x++) {
        const file = String.fromCharCode(97 + x); // 'a' starts at 97
        const rank = y + 1;
        const key = `${file}${rank}`;
        const stones = board.squares[key] || [];
        squares.push({ x, y, stones });
      }
    }

    return squares;
  };

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize }]}>
      <Svg width={boardSize} height={boardSize} style={styles.svg}>
        {/* Background isometric grid for debugging */}
        {Array.from({ length: board.size }, (_, i) => {
          const { x: isoX1, y: isoY1 } = getIsometricCoordinates(0, i);
          const { x: isoX2, y: isoY2 } = getIsometricCoordinates(board.size - 1, i);
          const { x: isoX3, y: isoY3 } = getIsometricCoordinates(i, 0);
          const { x: isoX4, y: isoY4 } = getIsometricCoordinates(i, board.size - 1);

          return (
            <React.Fragment key={`grid-${i}`}>
              {/* Horizontal isometric lines */}
              <Polygon
                points={`${isoX1},${isoY1} ${isoX2},${isoY2}`}
                stroke="#555"
                strokeWidth="1"
                fill="none"
              />
              {/* Vertical isometric lines */}
              <Polygon
                points={`${isoX3},${isoY3} ${isoX4},${isoY4}`}
                stroke="#555"
                strokeWidth="1"
                fill="none"
              />
            </React.Fragment>
          );
        })}

        {getSquaresArray().map(({ x, y, stones }) =>
          renderSquare(x, y, stones)
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: '#34495e',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  svg: {
    backgroundColor: 'transparent',
  },
});