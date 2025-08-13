import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';
import { Board, Square, PieceType } from '../types/game';

interface Props {
  board: Board;
  onSquarePress: (x: number, y: number) => void;
  selectedPieceType?: PieceType;
}

export const IsometricBoard: React.FC<Props> = ({ board, onSquarePress, selectedPieceType }) => {
  const screenWidth = Dimensions.get('window').width;
  const boardSize = Math.min(screenWidth - 32, 400);
  const squareSize = boardSize / (board.size * 1.2);

  const getIsometricCoordinates = (x: number, y: number) => {
    const centerX = boardSize / 2;
    const centerY = boardSize / 2;
    
    const isoX = centerX + (x - y) * squareSize * 0.5;
    const isoY = centerY + (x + y) * squareSize * 0.25;
    
    return { x: isoX, y: isoY };
  };

  const renderSquare = (square: Square) => {
    const { x: isoX, y: isoY } = getIsometricCoordinates(square.x, square.y);
    const size = squareSize * 0.8;
    
    const topLeft = { x: isoX - size / 2, y: isoY - size / 4 };
    const topRight = { x: isoX + size / 2, y: isoY - size / 4 };
    const bottomRight = { x: isoX + size / 2, y: isoY + size / 4 };
    const bottomLeft = { x: isoX - size / 2, y: isoY + size / 4 };
    
    const points = `${topLeft.x},${topLeft.y} ${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomLeft.x},${bottomLeft.y}`;
    
    const canPlacePiece = selectedPieceType && square.pieces.length === 0;
    const squareColor = canPlacePiece ? "#a0522d" : "#8b4513";
    const strokeColor = canPlacePiece ? "#deb887" : "#654321";
    
    return (
      <TouchableOpacity
        key={`square-${square.x}-${square.y}`}
        style={StyleSheet.absoluteFillObject}
        onPress={() => onSquarePress(square.x, square.y)}
      >
        <Svg>
          <Polygon
            points={points}
            fill={squareColor}
            stroke={strokeColor}
            strokeWidth={canPlacePiece ? "2" : "1"}
          />
          {square.pieces.map((piece, stackIndex) => 
            renderPiece(piece, isoX, isoY - (stackIndex * 6), stackIndex)
          )}
        </Svg>
      </TouchableOpacity>
    );
  };

  const renderPiece = (piece: any, x: number, y: number, stackIndex: number) => {
    const pieceSize = squareSize * 0.3;
    const color = piece.color === 'white' ? '#f8f9fa' : '#2c3e50';
    const strokeColor = piece.color === 'white' ? '#dee2e6' : '#1a252f';
    
    if (piece.type === 'standing') {
      const height = pieceSize * 1.5;
      const width = pieceSize * 0.6;
      const topLeft = { x: x - width / 2, y: y - height / 2 };
      const topRight = { x: x + width / 2, y: y - height / 2 };
      const bottomRight = { x: x + width / 2, y: y + height / 2 };
      const bottomLeft = { x: x - width / 2, y: y + height / 2 };
      
      const points = `${topLeft.x},${topLeft.y} ${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomLeft.x},${bottomLeft.y}`;
      
      return (
        <Polygon
          key={`piece-${piece.id}-${stackIndex}`}
          points={points}
          fill={color}
          stroke={strokeColor}
          strokeWidth="1"
        />
      );
    } else if (piece.type === 'capstone') {
      return (
        <Circle
          key={`piece-${piece.id}-${stackIndex}`}
          cx={x}
          cy={y}
          r={pieceSize * 0.6}
          fill={color}
          stroke={strokeColor}
          strokeWidth="2"
        />
      );
    } else {
      return (
        <Circle
          key={`piece-${piece.id}-${stackIndex}`}
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
      <Svg width={boardSize} height={boardSize}>
        {board.squares.flat().map(square => (
          <React.Fragment key={`square-${square.x}-${square.y}`}>
            {renderSquare(square)}
          </React.Fragment>
        ))}
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
  },
});