
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';

const EightBallPoolGame = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(0);
  const [gameState, setGameState] = useState({
    status: 'playing',
    currentPlayer: 'player1',
    balls: [
      { id: 'cue', x: 150, y: 300, color: 'white', pocketed: false },
      { id: '1', x: 450, y: 280, color: 'yellow', pocketed: false },
      { id: '2', x: 480, y: 300, color: 'blue', pocketed: false },
      { id: '3', x: 450, y: 320, color: 'red', pocketed: false },
      { id: '4', x: 480, y: 260, color: 'purple', pocketed: false },
      { id: '5', x: 480, y: 340, color: 'orange', pocketed: false },
      { id: '8', x: 510, y: 300, color: 'black', pocketed: false }
    ]
  });
  
  useEffect(() => {
    // In a real app, we would connect to Firebase or another backend here
    if (matchId) {
      toast({
        title: "Match loaded",
        description: `You've joined match #${matchId}`,
      });
    } else {
      toast({
        title: "New game",
        description: "Starting a new 8-Ball Pool game",
      });
    }
    
    renderPoolTable();
  }, [matchId, gameState]);
  
  const renderPoolTable = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pool table
    ctx.fillStyle = '#0a5c36';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pockets
    const pockets = [
      { x: 20, y: 20 }, { x: canvas.width/2, y: 15 }, { x: canvas.width - 20, y: 20 },
      { x: 20, y: canvas.height - 20 }, { x: canvas.width/2, y: canvas.height - 15 }, { x: canvas.width - 20, y: canvas.height - 20 }
    ];
    
    pockets.forEach(pocket => {
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();
    });
    
    // Draw balls
    gameState.balls.forEach(ball => {
      if (!ball.pocketed) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Add number to balls except cue ball
        if (ball.id !== 'cue') {
          ctx.fillStyle = ball.id === '8' ? 'white' : 'black';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ball.id, ball.x, ball.y);
        }
      }
    });
    
    // Draw cue stick direction
    const cueBall = gameState.balls.find(ball => ball.id === 'cue');
    if (cueBall && !cueBall.pocketed) {
      const angleRadians = angle * Math.PI / 180;
      const lineLength = 80;
      
      ctx.beginPath();
      ctx.moveTo(cueBall.x, cueBall.y);
      ctx.lineTo(
        cueBall.x + Math.cos(angleRadians) * lineLength,
        cueBall.y + Math.sin(angleRadians) * lineLength
      );
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const handleShot = () => {
    toast({
      title: "Shot taken!",
      description: `Power: ${power}%, Angle: ${angle}°`
    });
    
    // In a real implementation, this would apply physics to move the balls
    // For now, we'll just simulate a basic shot by updating the cue ball position
    const newBalls = [...gameState.balls];
    const cueBallIndex = newBalls.findIndex(ball => ball.id === 'cue');
    
    if (cueBallIndex !== -1) {
      const angleRadians = angle * Math.PI / 180;
      const distance = power;
      
      newBalls[cueBallIndex] = {
        ...newBalls[cueBallIndex],
        x: Math.max(20, Math.min(680, newBalls[cueBallIndex].x + Math.cos(angleRadians) * distance)),
        y: Math.max(20, Math.min(380, newBalls[cueBallIndex].y + Math.sin(angleRadians) * distance))
      };
      
      setGameState({
        ...gameState,
        balls: newBalls,
        currentPlayer: gameState.currentPlayer === 'player1' ? 'player2' : 'player1'
      });
    }
  };

  const handleAngleChange = (newAngle: number) => {
    setAngle(newAngle);
    renderPoolTable();
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
            <h1 className="text-2xl font-bold text-white">8-Ball Pool</h1>
            <Button variant="outline" onClick={handleExitGame}>Exit Game</Button>
          </div>
          
          <div className="flex justify-center mb-6">
            <canvas 
              ref={canvasRef} 
              width={700} 
              height={400} 
              className="border-2 border-verzus-border rounded"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-white mb-2">Shot Power: {power}%</p>
              <Slider
                value={[power]}
                min={10}
                max={100}
                step={5}
                onValueChange={(values) => setPower(values[0])}
                className="mb-4"
              />
              
              <p className="text-white mb-2">Shot Angle: {angle}°</p>
              <Slider
                value={[angle]}
                min={0}
                max={359}
                step={5}
                onValueChange={(values) => handleAngleChange(values[0])}
              />
            </div>
            
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-verzus-text-secondary mb-2">
                  Current turn: <span className="font-bold text-white capitalize">{gameState.currentPlayer}</span>
                </p>
                <p className="text-verzus-text-secondary mb-4">
                  Adjust power and angle, then take your shot!
                </p>
              </div>
              
              <Button onClick={handleShot} className="w-full">Take Shot</Button>
            </div>
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default EightBallPoolGame;
