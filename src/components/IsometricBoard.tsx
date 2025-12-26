import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import { Board, Stone, PieceType } from '../types/game';

interface Props {
  board: Board;
  onSquarePress: (x: number, y: number) => void;
  selectedPieceType?: PieceType;
}

export const IsometricBoard: React.FC<Props> = ({ board, onSquarePress, selectedPieceType }) => {
  const screenWidth = Dimensions.get('window').width;
  const boardSize = Math.min(screenWidth - 32, 400);

  // Isometric projection constants
  const tileWidth = boardSize / (board.size + 1);
  const tileHeight = tileWidth * 0.6; // Isometric height ratio
  const pieceHeight = tileHeight * 0.25; // Height of each piece in the stack

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

  // Convert grid coordinates to isometric coordinates
  const gridToIsometric = (x: number, y: number) => {
    // Center the board
    const centerX = boardSize / 2;
    const centerY = boardSize * 0.4;

    // Isometric projection
    const isoX = centerX + (x - y) * tileWidth * 0.5;
    const isoY = centerY + (x + y) * tileHeight * 0.5;
    return { x: isoX, y: isoY };
  };

  const renderSquare = (x: number, y: number, stones: Stone[]) => {
    const isoPos = gridToIsometric(x, y);
    const canPlacePiece = selectedPieceType && stones.length === 0;

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
            backgroundColor: canPlacePiece ? 'rgba(255, 215, 0, 0.4)' : 'rgba(210, 180, 140, 0.4)',
            borderWidth: canPlacePiece ? 2 : 1,
            borderColor: canPlacePiece ? '#ffd700' : '#8b4513',
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 3,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.squareTouchable}
          onPress={() => {
            console.log('Square pressed:', x, y);
            onSquarePress(x, y);
          }}
        />
      </View>
    );
  };

  const renderStone = (stone: Stone, x: number, y: number, stackIndex: number) => {
    const isoPos = gridToIsometric(x, y);
    const stackHeight = stackIndex * pieceHeight;
    const pieceSize = tileWidth * 0.35;
    const color = stone.player === 1 ? '#f8f9fa' : '#2c3e50'; // 1 = white, 2 = black
    const strokeColor = stone.player === 1 ? '#dee2e6' : '#1a252f';

    // Handle different possible type values from the API
    const stoneType = stone.type?.toLowerCase() || 'flat';

    if (stoneType === 'wall' || stoneType === 'standing') {
      // Standing piece - render as a tall rectangle
      const height = pieceHeight * 1.5;
      const width = pieceSize * 0.7;

      return (
        <View
          key={`stone-${stackIndex}`}
          style={[
            styles.stone,
            {
              width: width,
              height: height,
              backgroundColor: color,
              borderWidth: 1,
              borderColor: strokeColor,
              position: 'absolute',
              left: isoPos.x - width / 2,
              top: isoPos.y - tileHeight / 2 - stackHeight - height,
              zIndex: 100 + stackIndex,
              shadowColor: '#000',
              shadowOffset: { width: 1, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 2,
              elevation: 5,
            }
          ]}
        />
      );
    } else if (stoneType === 'capstone') {
      // Capstone - render as a larger circle with special styling
      const radius = pieceSize * 0.6;

      return (
        <View
          key={`stone-${stackIndex}`}
          style={[
            styles.stone,
            {
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              backgroundColor: color,
              borderWidth: 3,
              borderColor: strokeColor,
              position: 'absolute',
              left: isoPos.x - radius,
              top: isoPos.y - tileHeight / 2 - stackHeight - radius * 2,
              zIndex: 100 + stackIndex,
              shadowColor: '#000',
              shadowOffset: { width: 1, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 3,
              elevation: 6,
            }
          ]}
        />
      );
    } else {
      // Flat stone - render as a regular circle
      const radius = pieceSize * 0.4;

      return (
        <View
          key={`stone-${stackIndex}`}
          style={[
            styles.stone,
            {
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              backgroundColor: color,
              borderWidth: 1,
              borderColor: strokeColor,
              position: 'absolute',
              left: isoPos.x - radius,
              top: isoPos.y - tileHeight / 2 - stackHeight - radius * 2,
              zIndex: 100 + stackIndex,
              shadowColor: '#000',
              shadowOffset: { width: 1, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              elevation: 4,
            }
          ]}
        />
      );
    }
  };

  const renderGridLines = () => {
    const lines = [];

    // Vertical lines
    for (let x = 0; x <= board.size; x++) {
      const startPos = gridToIsometric(x, 0);
      const endPos = gridToIsometric(x, board.size);

      lines.push(
        <View
          key={`vline-${x}`}
          style={{
            position: 'absolute',
            left: startPos.x,
            top: startPos.y,
            width: 1,
            height: Math.abs(endPos.y - startPos.y),
            backgroundColor: 'rgba(139, 69, 19, 0.6)',
            zIndex: 50,
          }}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= board.size; y++) {
      const startPos = gridToIsometric(0, y);
      const endPos = gridToIsometric(board.size, y);

      lines.push(
        <View
          key={`hline-${y}`}
          style={{
            position: 'absolute',
            left: startPos.x,
            top: startPos.y,
            width: Math.abs(endPos.x - startPos.x),
            height: 1,
            backgroundColor: 'rgba(139, 69, 19, 0.6)',
            zIndex: 50,
          }}
        />
      );
    }

    return lines;
  };

  const squares = getSquaresArray();

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize * 0.8 }]}>
      {/* Background board */}
      <View style={[styles.boardBackground, { width: boardSize, height: boardSize * 0.8 }]}>
        {/* Board border */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: boardSize,
            height: boardSize * 0.8,
            borderWidth: 3,
            borderColor: '#8b4513',
            backgroundColor: 'rgba(139, 69, 19, 0.1)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
        />
      </View>

      {/* Grid lines */}
      {renderGridLines()}

      {/* Squares */}
      {squares.map(({ x, y, stones }) => {
        return renderSquare(x, y, stones);
      })}

      {/* Stones - render on top of squares */}
      {squares.map(({ x, y, stones }) => {
        return stones.map((stone, stackIndex) =>
          renderStone(stone, x, y, stackIndex)
        );
      })}

      {/* Debug info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Board: {board.size}x{board.size}</Text>
        <Text style={styles.debugText}>Squares: {squares.length}</Text>
        <Text style={styles.debugText}>Selected: {selectedPieceType || 'none'}</Text>
        <Text style={styles.debugText}>Pieces: {Object.values(board.squares).flat().length}</Text>
      </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  boardBackground: {
    position: 'absolute',
    backgroundColor: '#34495e',
  },
  isometricSquare: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
  },
  stone: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
