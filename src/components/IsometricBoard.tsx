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
  const squareSize = boardSize / board.size;

  // Debug logging
  console.log('IsometricBoard render:', { boardSize, squareSize, boardSizeValue: board.size, squares: Object.keys(board.squares) });

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

  const renderSquare = (x: number, y: number, stones: Stone[]) => {
    const squareX = x * squareSize;
    const squareY = y * squareSize;
    const size = squareSize * 0.9;

    const canPlacePiece = selectedPieceType && stones.length === 0;
    const squareColor = canPlacePiece ? "#d2691e" : "#8b4513";
    const strokeColor = canPlacePiece ? "#ffd700" : "#654321";

    // Add a test piece to the center square if board is empty (for debugging)
    const showTestPiece = Object.keys(board.squares).length === 0 && x === Math.floor(board.size / 2) && y === Math.floor(board.size / 2);

    return (
      <TouchableOpacity
        key={`square-${x}-${y}`}
        style={[StyleSheet.absoluteFillObject, { zIndex: 1 }]}
        onPress={() => onSquarePress(x, y)}
      >
        <Polygon
          points={`${squareX},${squareY} ${squareX + size},${squareY} ${squareX + size},${squareY + size} ${squareX},${squareY + size}`}
          fill={squareColor}
          stroke={strokeColor}
          strokeWidth={canPlacePiece ? "3" : "1"}
        />
        {showTestPiece && (
          <Circle
            cx={squareX + size / 2}
            cy={squareY + size / 2}
            r={size * 0.2}
            fill="#ff0000"
            stroke="#000"
            strokeWidth="2"
          />
        )}
        {stones.map((stone, stackIndex) =>
          renderStone(stone, squareX + size / 2, squareY + size / 2, stackIndex)
        )}
      </TouchableOpacity>
    );
  };

  const renderStone = (stone: Stone, x: number, y: number, stackIndex: number) => {
    const pieceSize = squareSize * 0.2;
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

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize }]}>
      <Svg width={boardSize} height={boardSize} style={styles.svg}>
        {/* Board border */}
        <Polygon
          points={`0,0 ${boardSize},0 ${boardSize},${boardSize} 0,${boardSize}`}
          fill="none"
          stroke="#fff"
          strokeWidth="2"
        />

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
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: '#34495e',
  },
  svg: {
    backgroundColor: 'transparent',
  },
});