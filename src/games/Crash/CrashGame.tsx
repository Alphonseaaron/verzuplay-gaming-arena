
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Zap, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const CrashGame = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [betAmount, setBetAmount] = useState(1);
  const [gameState, setGameState] = useState({
    status: 'waiting', // waiting, running, crashed
    multiplier: 1.00,
    betPlaced: false,
    cashoutMultiplier: 0,
    balance: 100,
    history: [] as number[]
  });
  
  // Refs for animation loop
  const multiplierRef = useRef(1.00);
  const statusRef = useRef('waiting');
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    // In a real app, we would connect to Firebase or another backend here
    if (matchId) {
      toast({
        title: "Match loaded",
        description: `You've joined match #${matchId}`,
      });
    }
    
    drawGraph();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [matchId]);
  
  useEffect(() => {
    statusRef.current = gameState.status;
  }, [gameState.status]);
  
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines (multiplier markers)
    for (let i = 1; i <= 5; i++) {
      const x = width * (i / 5);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Multiplier labels
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${i}x`, x, height - 5);
    }
    
    // Horizontal grid lines
    for (let i = 1; i < 5; i++) {
      const y = height * (i / 5);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw crash curve if game is running or crashed
    if (statusRef.current === 'running' || statusRef.current === 'crashed') {
      const maxMultiplier = Math.max(multiplierRef.current, 1.5); // At least show up to 1.5x
      const points = [];
      const pointCount = 100;
      
      // Generate curve points
      for (let i = 0; i <= pointCount; i++) {
        const progress = i / pointCount;
        const x = progress * width;
        
        // Exponential curve
        const curveMultiplier = 1 + (Math.pow(maxMultiplier - 1, progress) * (maxMultiplier - 1));
        const normalizedY = 1 - (curveMultiplier / maxMultiplier);
        const y = normalizedY * (height * 0.8);
        
        points.push({ x, y });
        
        // Stop at current multiplier if game is running
        if (statusRef.current === 'running' && curveMultiplier >= multiplierRef.current) {
          break;
        }
      }
      
      // Draw curve
      ctx.strokeStyle = statusRef.current === 'crashed' ? '#F44336' : '#4CAF50';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      if (points.length > 0) {
        ctx.moveTo(0, height * 0.8);
        
        for (const point of points) {
          ctx.lineTo(point.x, point.y);
        }
        
        ctx.stroke();
      }
      
      // Draw current multiplier
      ctx.fillStyle = statusRef.current === 'crashed' ? '#F44336' : '#4CAF50';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${multiplierRef.current.toFixed(2)}x`, width / 2, height / 2);
    } else {
      // Draw waiting message
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for next round...', width / 2, height / 2);
    }
  };
  
  const startGame = () => {
    // Reset game state
    setGameState(prev => ({
      ...prev,
      status: 'running',
      multiplier: 1.00,
      cashoutMultiplier: 0
    }));
    
    multiplierRef.current = 1.00;
    statusRef.current = 'running';
    startTimeRef.current = Date.now();
    
    // Start animation loop
    animateGame();
  };
  
  const animateGame = () => {
    if (!startTimeRef.current) return;
    
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    
    // Calculate new multiplier - exponential growth function
    // Adjust the growth rate to control how quickly the multiplier increases
    const growthRate = 0.07;
    const newMultiplier = Math.exp(growthRate * elapsed);
    multiplierRef.current = parseFloat(newMultiplier.toFixed(2));
    
    setGameState(prev => ({
      ...prev,
      multiplier: multiplierRef.current
    }));
    
    // Draw updated graph
    drawGraph();
    
    // Check for crash - random crash point between 1.1x and 10x
    // In a real game, this would be determined by the server
    const maxMultiplier = gameState.history.length === 0 ? 1.5 : 
                         (Math.random() * 8.9 + 1.1);
    
    if (multiplierRef.current >= maxMultiplier) {
      crashGame(multiplierRef.current);
      return;
    }
    
    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animateGame);
  };
  
  const crashGame = (finalMultiplier: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const roundedFinal = parseFloat(finalMultiplier.toFixed(2));
    
    setGameState(prev => {
      const newHistory = [roundedFinal, ...prev.history].slice(0, 10);
      
      return {
        ...prev,
        status: 'crashed',
        multiplier: roundedFinal,
        history: newHistory,
        betPlaced: prev.cashoutMultiplier === 0 ? false : prev.betPlaced
      };
    });
    
    statusRef.current = 'crashed';
    multiplierRef.current = roundedFinal;
    
    // Draw final state
    drawGraph();
    
    // Set timeout for next game
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        status: 'waiting',
        betPlaced: false,
        cashoutMultiplier: 0
      }));
      
      toast({
        title: "Game crashed",
        description: `The game crashed at ${roundedFinal}x`,
      });
      
      // Auto-start next game after a delay
      setTimeout(startGame, 3000);
    }, 2000);
  };
  
  const placeBet = () => {
    if (gameState.status !== 'waiting' || betAmount <= 0 || betAmount > gameState.balance) {
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      betPlaced: true,
      balance: prev.balance - betAmount
    }));
    
    toast({
      title: "Bet placed",
      description: `You bet $${betAmount}. Cash out before the crash!`,
    });
  };
  
  const cashOut = () => {
    if (gameState.status !== 'running' || !gameState.betPlaced || gameState.cashoutMultiplier > 0) {
      return;
    }
    
    const winnings = betAmount * multiplierRef.current;
    
    setGameState(prev => ({
      ...prev,
      cashoutMultiplier: multiplierRef.current,
      balance: prev.balance + winnings
    }));
    
    toast({
      title: "Cashed out!",
      description: `You cashed out at ${multiplierRef.current.toFixed(2)}x and won $${winnings.toFixed(2)}`,
    });
  };
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setBetAmount(value);
    }
  };
  
  const adjustBetAmount = (amount: number) => {
    setBetAmount(prev => Math.max(0, prev + amount));
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
            <h1 className="text-2xl font-bold text-white">Crash</h1>
            <Button variant="outline" onClick={handleExitGame}>Exit Game</Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Graph Section */}
            <div className="lg:col-span-3">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={400} 
                className="w-full h-auto bg-verzus-background-light border border-verzus-border rounded"
              />
            </div>
            
            {/* Controls Section */}
            <div className="lg:col-span-1">
              <div className="p-4 bg-verzus-background-light border border-verzus-border rounded mb-4">
                <h3 className="text-white font-bold mb-2">Your Balance</h3>
                <p className="text-2xl text-verzus-accent font-bold">${gameState.balance.toFixed(2)}</p>
              </div>
              
              <div className="p-4 bg-verzus-background-light border border-verzus-border rounded mb-4">
                <h3 className="text-white font-bold mb-4">Place Your Bet</h3>
                
                <div className="flex items-center mb-4">
                  <div className="flex-1 relative">
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={handleBetAmountChange}
                      disabled={gameState.betPlaced}
                      className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-verzus-text-secondary">
                      <Zap size={16} />
                    </span>
                  </div>
                  
                  <div className="flex flex-col ml-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mb-1 px-2 h-6"
                      onClick={() => adjustBetAmount(1)}
                      disabled={gameState.betPlaced}
                    >
                      <ChevronUp size={14} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="px-2 h-6"
                      onClick={() => adjustBetAmount(-1)}
                      disabled={gameState.betPlaced}
                    >
                      <ChevronDown size={14} />
                    </Button>
                  </div>
                </div>
                
                {gameState.betPlaced ? (
                  gameState.cashoutMultiplier > 0 ? (
                    <div className="p-3 bg-verzus-primary/20 rounded text-center">
                      <p className="text-white text-sm">Cashed out at</p>
                      <p className="text-2xl font-bold text-verzus-primary">{gameState.cashoutMultiplier.toFixed(2)}x</p>
                      <p className="text-verzus-accent">+${(betAmount * gameState.cashoutMultiplier).toFixed(2)}</p>
                    </div>
                  ) : (
                    gameState.status === 'running' ? (
                      <Button 
                        className="w-full bg-verzus-accent hover:bg-verzus-accent/80"
                        onClick={cashOut}
                      >
                        Cash Out ({(betAmount * gameState.multiplier).toFixed(2)})
                      </Button>
                    ) : (
                      gameState.status === 'crashed' ? (
                        <div className="p-3 bg-red-500/20 rounded text-center">
                          <p className="text-white text-sm">Crashed at</p>
                          <p className="text-2xl font-bold text-red-500">{gameState.multiplier.toFixed(2)}x</p>
                          <p className="text-red-300">-${betAmount.toFixed(2)}</p>
                        </div>
                      ) : (
                        <p className="text-center text-verzus-text-secondary">Waiting for next round...</p>
                      )
                    )
                  )
                ) : (
                  <Button 
                    className="w-full"
                    onClick={placeBet}
                    disabled={gameState.status !== 'waiting' || betAmount <= 0 || betAmount > gameState.balance}
                  >
                    Place Bet
                  </Button>
                )}
              </div>
              
              <div className="p-4 bg-verzus-background-light border border-verzus-border rounded">
                <h3 className="text-white font-bold mb-2">Previous Crashes</h3>
                <div className="flex flex-wrap gap-2">
                  {gameState.history.map((multi, index) => (
                    <div 
                      key={index}
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        multi < 2 ? 'bg-red-500/20 text-red-300' : 
                        multi < 4 ? 'bg-yellow-500/20 text-yellow-300' : 
                        'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {multi.toFixed(2)}x
                    </div>
                  ))}
                  {gameState.history.length === 0 && (
                    <p className="text-verzus-text-secondary text-sm">No previous games</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-verzus-text-secondary">
              Place a bet and cash out before the multiplier crashes! The longer you wait, the higher the potential payout.
            </p>
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default CrashGame;
