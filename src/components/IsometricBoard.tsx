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
  const squareSize = boardSize / board.size; // Simple grid layout

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

  const getIsometricCoordinates = (x: number, y: number) => {
    const centerX = boardSize / 2;
    const centerY = boardSize / 2;

    // Simple isometric projection
    const isoX = centerX + (x - y) * squareSize * 0.6;
    const isoY = centerY + (x + y) * squareSize * 0.3;

    return { x: isoX, y: isoY };
  };

  const renderSquare = (x: number, y: number, stones: Stone[]) => {
    // Use simple grid coordinates for now
    const squareX = x * squareSize;
    const squareY = y * squareSize;
    const size = squareSize * 0.9;

    const canPlacePiece = selectedPieceType && stones.length === 0;
    const squareColor = canPlacePiece ? "#d2691e" : "#8b4513";
    const strokeColor = canPlacePiece ? "#ffd700" : "#654321";

    // Add a test piece to the center square if board is empty (for debugging)
    const showTestPiece = Object.values(board.squares).every(s => s.length === 0) &&
      x === Math.floor(board.size / 2) && y === Math.floor(board.size / 2);

    // Add a test piece to show rendering works
    const showDebugPiece = x === 1 && y === 1; // Show in square (1,1) which should be b2

    // Add pieces to corners to help visualize the board
    const showCornerPiece = (x === 0 && y === 0) || (x === 4 && y === 0) || (x === 0 && y === 4) || (x === 4 && y === 4);

    return (
      <View
        key={`square-${x}-${y}`}
        style={[
          styles.square,
          {
            position: 'absolute',
            left: squareX,
            top: squareY,
            width: size,
            height: size,
            backgroundColor: squareColor,
            borderWidth: canPlacePiece ? 3 : 1,
            borderColor: strokeColor,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.squareTouchable}
          onPress={() => {
            console.log('Square pressed:', x, y);
            onSquarePress(x, y);
          }}
        >
          {/* Render stones on top of the square */}
          {stones.map((stone, stackIndex) => {
            console.log(`Rendering stone ${stackIndex} in square ${x},${y}:`, stone);
            return renderStone(stone, size / 2, size / 2 - (stackIndex * 6), stackIndex);
          })}

          {/* Test piece for debugging */}
          {showTestPiece && (
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#ff0000',
                borderWidth: 2,
                borderColor: '#000',
                position: 'absolute',
                left: size / 2 - 10,
                top: size / 2 - 10,
                zIndex: 20,
              }}
            />
          )}

          {/* Debug piece to verify rendering works */}
          {showDebugPiece && (
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: '#00ff00',
                borderWidth: 2,
                borderColor: '#000',
                position: 'absolute',
                left: size / 2 - 15,
                top: size / 2 - 15,
                zIndex: 20,
              }}
            />
          )}

          {/* Corner pieces to help visualize board */}
          {showCornerPiece && (
            <View
              style={{
                width: 25,
                height: 25,
                borderRadius: 12.5,
                backgroundColor: '#0000ff',
                borderWidth: 2,
                borderColor: '#fff',
                position: 'absolute',
                left: size / 2 - 12.5,
                top: size / 2 - 12.5,
                zIndex: 20,
              }}
            />
          )}
        </TouchableOpacity>
      </View>
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
              left: x - width / 2,
              top: y - height / 2,
              zIndex: 10, // Ensure stones are on top
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
              left: x - radius,
              top: y - radius,
              zIndex: 10,
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
              left: x - radius,
              top: y - radius,
              zIndex: 10,
            }
          ]}
        />
      );
    }
  };

  const squares = getSquaresArray();

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize }]}>
      {/* Background board */}
      <View style={[styles.boardBackground, { width: boardSize, height: boardSize }]}>
        {/* Simple border for debugging */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: boardSize,
            height: boardSize,
            borderWidth: 2,
            borderColor: '#fff',
          }}
        />

        {/* Grid lines for debugging */}
        {Array.from({ length: board.size + 1 }, (_, i) => (
          <React.Fragment key={`grid-${i}`}>
            <View
              style={{
                position: 'absolute',
                left: i * squareSize,
                top: 0,
                width: 1,
                height: boardSize,
                backgroundColor: '#555',
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: i * squareSize,
                width: boardSize,
                height: 1,
                backgroundColor: '#555',
              }}
            />
          </React.Fragment>
        ))}
      </View>

      {/* Squares */}
      {squares.map(({ x, y, stones }) => {
        console.log(`Rendering square ${x},${y} with ${stones.length} stones:`, stones);
        return renderSquare(x, y, stones);
      })}

      {/* Debug info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Board: {board.size}x{board.size}</Text>
        <Text style={styles.debugText}>Squares: {squares.length}</Text>
        <Text style={styles.debugText}>Selected: {selectedPieceType || 'none'}</Text>
        <Text style={styles.debugText}>Pieces: {Object.values(board.squares).flat().length}</Text>
        <Text style={styles.debugText}>Sample: {JSON.stringify(Object.entries(board.squares).slice(0, 2))}</Text>
        <Text style={styles.debugText}>Center: {Math.floor(board.size / 2)},{Math.floor(board.size / 2)}</Text>
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
  },
  boardBackground: {
    position: 'absolute',
    backgroundColor: '#34495e',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#555',
  },
  square: {
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