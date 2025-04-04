import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Define types
type Grid = number[][];
type Piece = number[][];
type Position = { x: number; y: number };
type SetState = React.Dispatch<React.SetStateAction<GameState>>;

interface GameState {
  grid: Grid;
  piece: Piece;
  position: Position;
  rotation: number;
  nextPiece: Piece;
  isRunning: boolean;
  score: number;
  level: number;
  rowsCleared: number;
  gameOver: boolean;
}

// Tetromino shapes
const tetrominos: Piece[] = [
  [[1, 1], [1, 1]],             // Square
  [[0, 2, 0], [2, 2, 2]],       // T-shape
  [[0, 3, 3], [3, 3, 0]],       // Z-shape
  [[4, 4, 0], [0, 4, 4]],       // S-shape
  [[0, 0, 5, 0], [5, 5, 5, 5]], // I-shape
  [[0, 6, 0], [0, 6, 0], [6, 6, 0]],   // L-shape
  [[0, 7, 0], [0, 7, 0], [0, 7, 7]]    // J-shape
];

// Game component
const TetrisGame: React.FC = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();

  // Game settings
  const gridWidth = 12;
  const gridHeight = 20;

  // Initial game state
  const initialGameState: GameState = {
    grid: Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(0)),
    piece: tetrominos[Math.floor(Math.random() * tetrominos.length)],
    position: { x: 5, y: 0 },
    rotation: 0,
    nextPiece: tetrominos[Math.floor(Math.random() * tetrominos.length)],
    isRunning: false,
    score: 0,
    level: 1,
    rowsCleared: 0,
    gameOver: false,
  };

  const [state, setState] = useState<GameState>(initialGameState);
  const stateRef = useRef(state);

  // Update stateRef whenever state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Game loop interval
  const gameInterval = useRef<number | null>(null);

  // Initialize game
  useEffect(() => {
    if (matchId) {
      toast({
        title: "Match loaded",
        description: `You've joined match #${matchId}`,
      });
    } else {
      toast({
        title: "New game",
        description: "Starting a new Tetris game",
      });
    }
  }, [matchId]);

  // Generate random tetromino
  const getRandomTetromino = useCallback(() => {
    return tetrominos[Math.floor(Math.random() * tetrominos.length)];
  }, []);

  // Check collision
  const checkCollision = useCallback((
    grid: Grid,
    piece: Piece,
    position: Position,
    rotation: number
  ): boolean => {
    const rotatedPiece = rotatePiece(piece, rotation);
    for (let i = 0; i < rotatedPiece.length; i++) {
      for (let j = 0; j < rotatedPiece[i].length; j++) {
        if (rotatedPiece[i][j] !== 0) {
          let x = position.x + j;
          let y = position.y + i;

          if (x < 0 || x >= gridWidth || y >= gridHeight) {
            return true;
          }
          if (y < 0) {
            continue;
          }
          if (grid[y][x] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, [gridWidth, gridHeight]);

  // Rotate piece
  const rotatePiece = useCallback((piece: Piece, rotation: number): Piece => {
    const width = piece[0].length;
    const height = piece.length;
    const rotatedPiece: Grid = Array(width).fill(null).map(() => Array(height).fill(0));

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        switch (rotation % 4) {
          case 0:
            rotatedPiece[i][j] = piece[i][j];
            break;
          case 1:
            rotatedPiece[j][height - 1 - i] = piece[i][j];
            break;
          case 2:
            rotatedPiece[width - 1 - i][height - 1 - j] = piece[i][j];
            break;
          case 3:
            rotatedPiece[width - 1 - j][i] = piece[i][j];
            break;
        }
      }
    }
    return rotatedPiece;
  }, []);

  // Merge piece into grid
  const mergePiece = useCallback((grid: Grid, piece: Piece, position: Position, rotation: number): Grid => {
    const newGrid = grid.map(row => [...row]);
    const rotatedPiece = rotatePiece(piece, rotation);

    for (let i = 0; i < rotatedPiece.length; i++) {
      for (let j = 0; j < rotatedPiece[i].length; j++) {
        if (rotatedPiece[i][j] !== 0) {
          newGrid[position.y + i][position.x + j] = rotatedPiece[i][j];
        }
      }
    }
    return newGrid;
  }, [rotatePiece]);

  // Game over
  const handleGameOver = useCallback(() => {
    clearInterval(gameInterval.current || undefined);
    setState(prevState => ({ ...prevState, isRunning: false, gameOver: true }));
    toast({
      title: "Game Over",
      description: "Better luck next time!",
    });
  }, []);

  // Drop piece
  const dropPiece = useCallback(() => {
    if (!stateRef.current.isRunning || stateRef.current.gameOver) return;

    let newPosition = { ...stateRef.current.position };
    newPosition.y += 1;

    if (!checkCollision(stateRef.current.grid, stateRef.current.piece, newPosition, stateRef.current.rotation)) {
      setState(prevState => ({ ...prevState, position: newPosition }));
    } else {
      if (newPosition.y < 1) {
        handleGameOver();
        return;
      }

      const newGrid = mergePiece(stateRef.current.grid, stateRef.current.piece, stateRef.current.position, stateRef.current.rotation);
      clearRows(newGrid);

      setState(prevState => ({
        ...prevState,
        piece: stateRef.current.nextPiece,
        nextPiece: getRandomTetromino(),
        position: { x: 5, y: 0 },
        rotation: 0,
      }));
    }
  }, [checkCollision, mergePiece, getRandomTetromino, handleGameOver]);

  // Start game loop
  const startGameLoop = useCallback(() => {
    if (gameInterval.current) {
      clearInterval(gameInterval.current);
    }

    gameInterval.current = setInterval(() => {
      dropPiece();
    }, 1000 - (stateRef.current.level * 50));
  }, [dropPiece]);

  // Start game
  const startGame = () => {
    const initialGrid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(0));
    setState({
      ...initialGameState,
      grid: initialGrid,
      piece: getRandomTetromino(),
      nextPiece: getRandomTetromino(),
      isRunning: true,
      gameOver: false,
    });
    startGameLoop();
  };

  // Stop game
  const stopGame = () => {
    if (gameInterval.current) {
      clearInterval(gameInterval.current);
      gameInterval.current = null;
    }
    setState(prevState => ({ ...prevState, isRunning: false }));
  };

  // Move piece horizontally
  const movePieceHorizontal = (direction: number) => {
    if (!stateRef.current.isRunning || stateRef.current.gameOver) return;

    let newPosition = { ...stateRef.current.position };
    newPosition.x += direction;

    if (!checkCollision(stateRef.current.grid, stateRef.current.piece, newPosition, stateRef.current.rotation)) {
      setState(prevState => ({ ...prevState, position: newPosition }));
    }
  };

  // Rotate piece
  const rotate = () => {
    if (!stateRef.current.isRunning || stateRef.current.gameOver) return;

    let newRotation = stateRef.current.rotation + 1;
    if (!checkCollision(stateRef.current.grid, stateRef.current.piece, stateRef.current.position, newRotation)) {
      setState(prevState => ({ ...prevState, rotation: newRotation }));
    }
  };

  // Handle key press
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        movePieceHorizontal(-1);
        break;
      case 'ArrowRight':
        movePieceHorizontal(1);
        break;
      case 'ArrowDown':
        dropPiece();
        break;
      case 'ArrowUp':
        rotate();
        break;
      case ' ': // Spacebar
        event.preventDefault();
        dropPiece();
        break;
    }
  }, [dropPiece]);

  // Add and remove key press listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Clear rows
  const clearRows = (grid: Grid) => {
      const grid = [...stateRef.current.grid];
      for (let i = 0; i < grid.length; i++) {
        let allFilled = true;
        for (let j = 0; j < grid[0].length; j++) {
          if (grid[i][j] === 0) {
            allFilled = false;
            break;
          }
        }
        
        if (allFilled) {
          // Move all rows above this one down
          for (let k = i; k > 0; k--) {
            grid[k] = [...grid[k - 1]];
          }
          // Fill the top row with empty cells
          grid[0] = Array(grid[0].length).fill(0);
          
          // Update score and possibly level
          const newScore = stateRef.current.score + 100;
          const newLevel = Math.floor(newScore / 1000) + 1;
          
          setState({
            ...stateRef.current,
            grid,
            score: newScore,
            level: newLevel,
            rowsCleared: stateRef.current.rowsCleared + 1
          });
        }
      }
  };

  const handleExitGame = () => {
    stopGame();
    navigate(`/games/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="container mx-auto px-4 py-8 flex-1">
        <GlassMorphicContainer className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Tetris</h1>
            <Button variant="outline" onClick={handleExitGame}>Exit Game</Button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex justify-center mb-4">
                <div className="tetris-board border border-verzus-border rounded overflow-hidden shadow-xl">
                  {state.grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      {row.map((cell, colIndex) => {
                        let cellColor = 'bg-gray-900'; // Default empty cell color
                        if (cell === 1) cellColor = 'bg-yellow-500';
                        else if (cell === 2) cellColor = 'bg-red-500';
                        else if (cell === 3) cellColor = 'bg-green-500';
                        else if (cell === 4) cellColor = 'bg-purple-500';
                        else if (cell === 5) cellColor = 'bg-blue-500';
                        else if (cell === 6) cellColor = 'bg-orange-500';
                        else if (cell === 7) cellColor = 'bg-cyan-500';

                        // Overlay the current piece
                        let overlayColor = cellColor;
                        const rotatedPiece = rotatePiece(state.piece, state.rotation);
                        if (
                          rowIndex >= state.position.y &&
                          rowIndex < state.position.y + rotatedPiece.length
                        ) {
                          const pieceRowIndex = rowIndex - state.position.y;
                          if (
                            colIndex >= state.position.x &&
                            colIndex < state.position.x + rotatedPiece[0].length
                          ) {
                            const pieceColIndex = colIndex - state.position.x;
                            if (rotatedPiece[pieceRowIndex][pieceColIndex] !== 0) {
                              if (rotatedPiece[pieceRowIndex][pieceColIndex] === 1) overlayColor = 'bg-yellow-500';
                              else if (rotatedPiece[pieceRowIndex][pieceColIndex] === 2) overlayColor = 'bg-red-500';
                              else if (rotatedPiece[pieceRowIndex][pieceColIndex] === 3) overlayColor = 'bg-green-500';
                              else if (rotatedPiece[pieceRowIndex][pieceColIndex] === 4) overlayColor = 'bg-purple-500';
                              else if (rotatedPiece[pieceRowIndex][pieceColIndex] === 5) overlayColor = 'bg-blue-500';
                              else if (rotatedPiece[pieceRowIndex][pieceColIndex] === 6) overlayColor = 'bg-orange-500';
                              else if (rotatedPiece[pieceRowIndex][pieceColIndex] === 7) overlayColor = 'bg-cyan-500';
                            }
                          }
                        }

                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-6 h-6 flex items-center justify-center ${overlayColor}`}
                          >
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/3">
              <div className="bg-verzus-background-light p-4 rounded-lg mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Game Info</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-verzus-text-secondary mb-1">Score:</p>
                    <p className="text-lg font-bold text-white">{state.score}</p>
                  </div>

                  <div>
                    <p className="text-verzus-text-secondary mb-1">Level:</p>
                    <p className="text-lg font-bold text-white">{state.level}</p>
                  </div>

                  <div>
                    <p className="text-verzus-text-secondary mb-1">Rows Cleared:</p>
                    <p className="text-lg font-bold text-white">{state.rowsCleared}</p>
                  </div>

                  <div>
                    <p className="text-verzus-text-secondary mb-1">Status:</p>
                    <p className="text-lg font-bold text-white">
                      {state.gameOver
                        ? 'Game Over'
                        : state.isRunning
                          ? 'Playing'
                          : 'Paused'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-verzus-background-light p-4 rounded-lg mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Next Piece</h2>
                <div className="flex justify-center">
                  <div className="tetris-board border border-verzus-border rounded overflow-hidden shadow-md">
                    {Array(4).fill(null).map((_, rowIndex) => (
                      <div key={rowIndex} className="flex">
                        {Array(4).fill(null).map((_, colIndex) => {
                          let cellColor = 'bg-gray-900'; // Default empty cell color
                          if (
                            rowIndex < state.nextPiece.length &&
                            colIndex < state.nextPiece[0].length &&
                            state.nextPiece[rowIndex][colIndex] !== 0
                          ) {
                            if (state.nextPiece[rowIndex][colIndex] === 1) cellColor = 'bg-yellow-500';
                            else if (state.nextPiece[rowIndex][colIndex] === 2) cellColor = 'bg-red-500';
                            else if (state.nextPiece[rowIndex][colIndex] === 3) cellColor = 'bg-green-500';
                            else if (state.nextPiece[rowIndex][colIndex] === 4) cellColor = 'bg-purple-500';
                            else if (state.nextPiece[rowIndex][colIndex] === 5) cellColor = 'bg-blue-500';
                            else if (state.nextPiece[rowIndex][colIndex] === 6) cellColor = 'bg-orange-500';
                            else if (state.nextPiece[rowIndex][colIndex] === 7) cellColor = 'bg-cyan-500';
                          }
                          return (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={`w-6 h-6 flex items-center justify-center ${cellColor}`}
                            >
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-verzus-background-light p-4 rounded-lg mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Controls</h2>
                <ul className="list-disc list-inside text-verzus-text-secondary space-y-2">
                  <li>Left Arrow: Move left</li>
                  <li>Right Arrow: Move right</li>
                  <li>Up Arrow: Rotate</li>
                  <li>Down Arrow: Drop faster</li>
                  <li>Spacebar: Drop piece</li>
                </ul>
              </div>

              {!state.isRunning ? (
                <Button onClick={startGame} className="w-full mb-2">
                  Start Game
                </Button>
              ) : (
                <Button onClick={stopGame} className="w-full mb-2">
                  Stop Game
                </Button>
              )}
            </div>
          </div>
        </GlassMorphicContainer>
      </div>

      <Footer />
    </div>
  );
};

export default TetrisGame;
