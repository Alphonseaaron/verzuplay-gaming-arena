
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 25;

// Define Tetromino shapes
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00FFFF'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000FF'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#FF7F00'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#FFFF00'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00FF00'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#800080'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#FF0000'
  }
};

const TetrisGame = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  
  // Create a blank board
  const createEmptyBoard = () => {
    return Array.from({ length: GRID_HEIGHT }, () =>
      Array(GRID_WIDTH).fill(0)
    );
  };
  
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<any>(null);
  const [nextPiece, setNextPiece] = useState<any>(null);
  
  // Refs for game loop
  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const gameOverRef = useRef(gameOver);
  const isRunningRef = useRef(isRunning);
  
  useEffect(() => {
    // In a real app, we would connect to Firebase or another backend here
    if (matchId) {
      toast({
        title: "Match loaded",
        description: `You've joined match #${matchId}`,
      });
    }
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [matchId]);
  
  // Update refs when state changes
  useEffect(() => {
    boardRef.current = board;
  }, [board]);
  
  useEffect(() => {
    currentPieceRef.current = currentPiece;
  }, [currentPiece]);
  
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);
  
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  
  // Initialize game
  useEffect(() => {
    if (isRunning && !gameOver) {
      if (!currentPiece) {
        getNewPiece();
      }
      
      const canvas = canvasRef.current;
      if (canvas) {
        renderGame();
      }
      
      // Game loop
      const dropInterval = Math.max(200, 1000 - (level * 100));
      const gameLoop = setInterval(() => {
        if (isRunningRef.current && !gameOverRef.current) {
          movePiece(0, 1);
        }
      }, dropInterval);
      
      return () => {
        clearInterval(gameLoop);
      };
    }
  }, [isRunning, gameOver, currentPiece, level]);
  
  const getRandomTetromino = () => {
    const keys = Object.keys(TETROMINOES);
    const tetroName = keys[Math.floor(Math.random() * keys.length)] as keyof typeof TETROMINOES;
    const tetromino = TETROMINOES[tetroName];
    
    return {
      pos: { x: GRID_WIDTH / 2 - Math.ceil(tetromino.shape[0] / 2), y: 0 },
      shape: tetromino.shape,
      color: tetromino.color
    };
  };
  
  const getNewPiece = () => {
    if (nextPiece) {
      setCurrentPiece(nextPiece);
      currentPieceRef.current = nextPiece;
    } else {
      const newPiece = getRandomTetromino();
      setCurrentPiece(newPiece);
      currentPieceRef.current = newPiece;
    }
    
    const newNextPiece = getRandomTetromino();
    setNextPiece(newNextPiece);
    
    // Check if game over by seeing if new piece collides immediately
    if (checkCollision(currentPieceRef.current, 0, 0)) {
      setGameOver(true);
      gameOverRef.current = true;
      setIsRunning(false);
      isRunningRef.current = false;
    }
  };
  
  const checkCollision = (piece: any, moveX: number, moveY: number) => {
    if (!piece) return false;
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        // Skip empty cells
        if (piece.shape[y][x] === 0) continue;
        
        const newX = piece.pos.x + x + moveX;
        const newY = piece.pos.y + y + moveY;
        
        // Check collision with walls and floor
        if (
          newX < 0 || 
          newX >= GRID_WIDTH || 
          newY >= GRID_HEIGHT
        ) {
          return true;
        }
        
        // Check collision with board pieces
        if (newY >= 0 && boardRef.current[newY][newX] !== 0) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  const movePiece = (x: number, y: number) => {
    if (!currentPieceRef.current || gameOverRef.current) return;
    
    if (!checkCollision(currentPieceRef.current, x, y)) {
      setCurrentPiece(prev => {
        if (!prev) return null;
        return {
          ...prev,
          pos: {
            x: prev.pos.x + x,
            y: prev.pos.y + y
          }
        };
      });
    } else if (y > 0) {
      // Collision when moving down means piece is set
      mergePiece();
      clearRows();
      getNewPiece();
    }
  };
  
  const rotatePiece = () => {
    if (!currentPieceRef.current || gameOverRef.current) return;
    
    const piece = { ...currentPieceRef.current };
    
    // Create rotated shape
    const rotatedShape = piece.shape.map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    
    const rotatedPiece = {
      ...piece,
      shape: rotatedShape
    };
    
    // Only apply rotation if it doesn't cause a collision
    if (!checkCollision(rotatedPiece, 0, 0)) {
      setCurrentPiece(rotatedPiece);
    }
  };
  
  const mergePiece = () => {
    if (!currentPieceRef.current) return;
    
    const piece = currentPieceRef.current;
    const newBoard = [...boardRef.current];
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const boardY = piece.pos.y + y;
          const boardX = piece.pos.x + x;
          
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    
    setBoard(newBoard);
    boardRef.current = newBoard;
  };
  
  const clearRows = () => {
    let rowsCleared = 0;
    const newBoard = [...boardRef.current];
    
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      // Check if row is full
      if (newBoard[y].every(cell => cell !== 0)) {
        // Remove the row and add a new empty row at the top
        newBoard.splice(y, 1);
        newBoard.unshift(Array(GRID_WIDTH).fill(0));
        rowsCleared++;
        // Check the same row again after shifting
        y++;
      }
    }
    
    if (rowsCleared > 0) {
      // Update score based on rows cleared
      const points = [0, 100, 300, 500, 800][rowsCleared] * level;
      setScore(prev => prev + points);
      
      // Update level every 10 rows cleared
      const totalCleared = Math.floor((score + points) / 1000);
      const newLevel = Math.max(1, Math.min(10, Math.floor(totalCleared / 10) + 1));
      setLevel(newLevel);
      
      setBoard(newBoard);
      boardRef.current = newBoard;
    }
  };
  
  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isRunningRef.current || gameOverRef.current) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        movePiece(-1, 0);
        break;
      case 'ArrowRight':
        movePiece(1, 0);
        break;
      case 'ArrowDown':
        movePiece(0, 1);
        break;
      case 'ArrowUp':
        rotatePiece();
        break;
      case ' ':
        // Hard drop
        while (!checkCollision(currentPieceRef.current, 0, 1)) {
          movePiece(0, 1);
        }
        break;
    }
    
    renderGame();
  };
  
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw board background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
    
    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw board pieces
    for (let y = 0; y < boardRef.current.length; y++) {
      for (let x = 0; x < boardRef.current[y].length; x++) {
        if (boardRef.current[y][x] !== 0) {
          ctx.fillStyle = boardRef.current[y][x];
          ctx.fillRect(
            x * CELL_SIZE,
            y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
          
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            x * CELL_SIZE,
            y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
        }
      }
    }
    
    // Draw current piece
    if (currentPieceRef.current) {
      const piece = currentPieceRef.current;
      
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x] !== 0) {
            const pieceX = piece.pos.x + x;
            const pieceY = piece.pos.y + y;
            
            if (pieceY >= 0) {
              ctx.fillStyle = piece.color;
              ctx.fillRect(
                pieceX * CELL_SIZE,
                pieceY * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE
              );
              
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 1;
              ctx.strokeRect(
                pieceX * CELL_SIZE,
                pieceY * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE
              );
            }
          }
        }
      }
    }
    
    // Draw "Next Piece" preview
    if (nextPiece) {
      const previewX = GRID_WIDTH * CELL_SIZE + 20;
      const previewY = 20;
      
      ctx.fillStyle = '#222';
      ctx.fillRect(previewX, previewY, 6 * CELL_SIZE, 6 * CELL_SIZE);
      
      // Draw preview title
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('Next Piece', previewX + 10, previewY - 10);
      
      // Draw the next piece centered in the preview area
      for (let y = 0; y < nextPiece.shape.length; y++) {
        for (let x = 0; x < nextPiece.shape[y].length; x++) {
          if (nextPiece.shape[y][x] !== 0) {
            ctx.fillStyle = nextPiece.color;
            ctx.fillRect(
              previewX + (x + 1) * CELL_SIZE,
              previewY + (y + 1) * CELL_SIZE,
              CELL_SIZE,
              CELL_SIZE
            );
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(
              previewX + (x + 1) * CELL_SIZE,
              previewY + (y + 1) * CELL_SIZE,
              CELL_SIZE,
              CELL_SIZE
            );
          }
        }
      }
      
      // Draw game info
      const infoX = previewX;
      const infoY = previewY + 8 * CELL_SIZE;
      
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(`Score: ${score}`, infoX, infoY);
      ctx.fillText(`Level: ${level}`, infoX, infoY + 30);
    }
    
    // Draw game over message
    if (gameOverRef.current) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', GRID_WIDTH * CELL_SIZE / 2, GRID_HEIGHT * CELL_SIZE / 2 - 15);
      ctx.font = '16px Arial';
      ctx.fillText(`Score: ${score}`, GRID_WIDTH * CELL_SIZE / 2, GRID_HEIGHT * CELL_SIZE / 2 + 15);
      ctx.fillText('Press Start to Play Again', GRID_WIDTH * CELL_SIZE / 2, GRID_HEIGHT * CELL_SIZE / 2 + 45);
    }
  };
  
  const startGame = () => {
    // Reset game
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(1);
    setCurrentPiece(null);
    setNextPiece(null);
    setGameOver(false);
    setIsRunning(true);
    
    // Update refs
    boardRef.current = createEmptyBoard();
    currentPieceRef.current = null;
    gameOverRef.current = false;
    isRunningRef.current = true;
    
    getNewPiece();
  };
  
  const pauseGame = () => {
    setIsRunning(false);
  };
  
  const handleExitGame = () => {
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
          
          <div className="flex justify-center mb-6">
            <canvas 
              ref={canvasRef} 
              width={GRID_WIDTH * CELL_SIZE + 200} 
              height={GRID_HEIGHT * CELL_SIZE} 
              className="border-2 border-verzus-border rounded"
            />
          </div>
          
          <div className="flex justify-center gap-4 mb-4">
            {isRunning ? (
              <Button onClick={pauseGame}>Pause</Button>
            ) : (
              <Button onClick={startGame}>{gameOver ? 'Restart' : 'Start'}</Button>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-verzus-text-secondary">
              Controls: Arrow keys to move and rotate. Space for hard drop.
            </p>
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default TetrisGame;
