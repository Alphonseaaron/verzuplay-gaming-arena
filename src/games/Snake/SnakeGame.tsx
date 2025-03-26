
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const GAME_SPEED = 150; // milliseconds

const SnakeGame = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const isRunningRef = useRef(isRunning);
  const gameOverRef = useRef(gameOver);
  
  useEffect(() => {
    // In a real app, we would connect to Firebase or another backend here
    if (matchId) {
      toast({
        title: "Match loaded",
        description: `You've joined match #${matchId}`,
      });
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up event listeners for keyboard controls
    window.addEventListener('keydown', handleKeyPress);
    
    // Initial game render
    renderGame();
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [matchId]);
  
  // Update refs when state changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);
  
  useEffect(() => {
    foodRef.current = food;
  }, [food]);
  
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);
  
  useEffect(() => {
    let gameLoop: number;
    
    if (isRunning && !gameOver) {
      gameLoop = window.setInterval(() => {
        updateGame();
      }, GAME_SPEED);
    }
    
    return () => {
      if (gameLoop) clearInterval(gameLoop);
    };
  }, [isRunning, gameOver]);
  
  const handleKeyPress = (e: KeyboardEvent) => {
    if (gameOverRef.current) return;
    
    switch (e.key) {
      case 'ArrowUp':
        if (directionRef.current !== 'DOWN') {
          setDirection('UP');
        }
        break;
      case 'ArrowDown':
        if (directionRef.current !== 'UP') {
          setDirection('DOWN');
        }
        break;
      case 'ArrowLeft':
        if (directionRef.current !== 'RIGHT') {
          setDirection('LEFT');
        }
        break;
      case 'ArrowRight':
        if (directionRef.current !== 'LEFT') {
          setDirection('RIGHT');
        }
        break;
      case ' ':
        // Space bar to start/pause
        setIsRunning(prev => !prev);
        break;
    }
  };
  
  const updateGame = () => {
    if (!isRunningRef.current || gameOverRef.current) return;
    
    // Move snake
    const newSnake = [...snakeRef.current];
    const head = { ...newSnake[0] };
    
    // Calculate new head position based on direction
    switch (directionRef.current) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }
    
    // Check for collisions with walls
    if (
      head.x < 0 || 
      head.x >= GRID_SIZE || 
      head.y < 0 || 
      head.y >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }
    
    // Check for collisions with self
    for (let i = 0; i < newSnake.length; i++) {
      if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
        setGameOver(true);
        return;
      }
    }
    
    // Check if snake eats food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      // Don't remove the tail if food is eaten
      setScore(prev => prev + 10);
      
      // Generate new food position
      const newFood = generateFood(newSnake);
      setFood(newFood);
      foodRef.current = newFood;
    } else {
      // Remove tail segment if no food eaten
      newSnake.pop();
    }
    
    // Add new head
    newSnake.unshift(head);
    setSnake(newSnake);
    
    // Render the game
    renderGame();
  };
  
  const generateFood = (snake: Position[]): Position => {
    let newFood: Position;
    let foodOnSnake = true;
    
    // Generate food until it's not on the snake
    while (foodOnSnake) {
      foodOnSnake = false;
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      
      // Check if food is on snake
      for (let segment of snake) {
        if (segment.x === newFood.x && segment.y === newFood.y) {
          foodOnSnake = true;
          break;
        }
      }
    }
    
    return newFood!;
  };
  
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const cellSize = canvas.width / GRID_SIZE;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (optional)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
    
    // Draw snake
    const currentSnake = snakeRef.current;
    ctx.fillStyle = '#4CAF50';
    
    for (let i = 0; i < currentSnake.length; i++) {
      ctx.fillRect(
        currentSnake[i].x * cellSize,
        currentSnake[i].y * cellSize,
        cellSize,
        cellSize
      );
      
      // Draw a darker border for each segment
      ctx.strokeStyle = '#388E3C';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        currentSnake[i].x * cellSize,
        currentSnake[i].y * cellSize,
        cellSize,
        cellSize
      );
    }
    
    // Draw snake head with a different color
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(
      currentSnake[0].x * cellSize,
      currentSnake[0].y * cellSize,
      cellSize,
      cellSize
    );
    
    // Draw food
    const currentFood = foodRef.current;
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(
      (currentFood.x * cellSize) + (cellSize / 2),
      (currentFood.y * cellSize) + (cellSize / 2),
      cellSize / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    
    // Draw game over message
    if (gameOverRef.current) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 15);
      ctx.font = '16px Arial';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
      ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 45);
    }
  };
  
  const startGame = () => {
    if (gameOver) {
      // Reset game
      setSnake([
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ]);
      setDirection('RIGHT');
      setFood(generateFood([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]));
      setGameOver(false);
      
      // Update high score if needed
      if (score > highScore) {
        setHighScore(score);
      }
      setScore(0);
    }
    
    setIsRunning(true);
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
            <h1 className="text-2xl font-bold text-white">Snake</h1>
            <Button variant="outline" onClick={handleExitGame}>Exit Game</Button>
          </div>
          
          <div className="flex justify-center mb-6">
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={400} 
              className="border-2 border-verzus-border rounded"
            />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex gap-6 mb-4 md:mb-0">
              <div>
                <p className="text-verzus-text-secondary">Score</p>
                <p className="text-2xl font-bold text-white">{score}</p>
              </div>
              <div>
                <p className="text-verzus-text-secondary">High Score</p>
                <p className="text-2xl font-bold text-white">{highScore}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              {isRunning ? (
                <Button onClick={pauseGame}>Pause</Button>
              ) : (
                <Button onClick={startGame}>{gameOver ? 'Restart' : 'Start'}</Button>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-verzus-text-secondary">
              Use arrow keys to control the snake. Eat the red food to grow and earn points.
              Avoid hitting the walls or yourself!
            </p>
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default SnakeGame;
