
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Zap, ChevronUp, ChevronDown } from 'lucide-react';

type Symbol = '🍒' | '🍋' | '🍊' | '🍇' | '🔔' | '💎' | '7️⃣' | '🍀';

interface ReelSymbol {
  symbol: Symbol;
  multiplier: number;
}

const SYMBOLS: ReelSymbol[] = [
  { symbol: '🍒', multiplier: 0.5 },
  { symbol: '🍋', multiplier: 0.5 },
  { symbol: '🍊', multiplier: 1 },
  { symbol: '🍇', multiplier: 1.5 },
  { symbol: '🔔', multiplier: 2 },
  { symbol: '🍀', multiplier: 2.5 },
  { symbol: '💎', multiplier: 5 },
  { symbol: '7️⃣', multiplier: 10 }
];

// Probability-weighted symbols (more common symbols appear more frequently)
const REEL_SYMBOLS: Symbol[] = [
  ...Array(20).fill('🍒'),
  ...Array(20).fill('🍋'),
  ...Array(15).fill('🍊'),
  ...Array(15).fill('🍇'),
  ...Array(10).fill('🔔'),
  ...Array(10).fill('🍀'),
  ...Array(5).fill('💎'),
  ...Array(5).fill('7️⃣')
];

const REELS_COUNT = 3;
const VISIBLE_SYMBOLS = 3;

// Paylines (each array represents positions to check [row, col])
const PAYLINES = [
  [[0, 0], [0, 1], [0, 2]], // Top horizontal
  [[1, 0], [1, 1], [1, 2]], // Middle horizontal
  [[2, 0], [2, 1], [2, 2]], // Bottom horizontal
  [[0, 0], [1, 1], [2, 2]], // Diagonal top-left to bottom-right
  [[2, 0], [1, 1], [0, 2]]  // Diagonal bottom-left to top-right
];

const SlotsGame = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  
  const [betAmount, setBetAmount] = useState(1);
  const [balance, setBalance] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<Symbol[][]>(
    Array(REELS_COUNT).fill(null).map(() => 
      Array(VISIBLE_SYMBOLS).fill(null).map(() => 
        REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]
      )
    )
  );
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [winAmount, setWinAmount] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const [spinsHistory, setSpinsHistory] = useState<number[]>([]);
  
  const reelsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // In a real app, we would connect to Firebase or another backend here
    if (matchId) {
      toast({
        title: "Match loaded",
        description: `You've joined match #${matchId}`,
      });
    }
  }, [matchId]);
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0.5 && value <= 100) {
      setBetAmount(value);
    }
  };
  
  const adjustBetAmount = (amount: number) => {
    setBetAmount(prev => {
      const newAmount = Math.max(0.5, prev + amount);
      return Math.min(100, newAmount);
    });
  };
  
  const spin = async () => {
    if (isSpinning || balance < betAmount) return;
    
    setIsSpinning(true);
    setWinningLines([]);
    setWinAmount(0);
    
    // Deduct bet amount from balance
    setBalance(prev => prev - betAmount);
    
    // Generate new symbols for each reel with separate animations
    const reelAnimations = reels.map((_, reelIndex) => {
      return new Promise<void>(resolve => {
        // Longer delay for each successive reel
        setTimeout(() => {
          setReels(prevReels => {
            const newReels = [...prevReels];
            newReels[reelIndex] = Array(VISIBLE_SYMBOLS)
              .fill(null)
              .map(() => REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]);
            return newReels;
          });
          resolve();
        }, 400 * (reelIndex + 1)); // Stagger the reel stops
      });
    });
    
    // Wait for all reel animations to complete
    await Promise.all(reelAnimations);
    
    // Evaluate win after all reels have stopped
    setTimeout(() => {
      const { winningPaylines, totalWin } = evaluateWin();
      
      setWinningLines(winningPaylines);
      setWinAmount(totalWin);
      
      if (totalWin > 0) {
        // Add winnings to balance
        setBalance(prev => prev + totalWin);
        setLastWin(totalWin);
        
        toast({
          title: "You won!",
          description: `You won $${totalWin.toFixed(2)} on ${winningPaylines.length} payline${winningPaylines.length !== 1 ? 's' : ''}!`,
        });
      } else {
        setLastWin(0);
      }
      
      // Add to spins history
      setSpinsHistory(prev => {
        const newHistory = [totalWin, ...prev];
        return newHistory.slice(0, 10);
      });
      
      setIsSpinning(false);
    }, 500);
  };
  
  const evaluateWin = () => {
    const winningPaylines: number[] = [];
    let totalWin = 0;
    
    // Check each payline
    PAYLINES.forEach((payline, index) => {
      const symbols: Symbol[] = payline.map(([row, col]) => reels[col][row]);
      
      // Check if all symbols on the payline are the same
      if (symbols.every(s => s === symbols[0])) {
        winningPaylines.push(index);
        
        // Find the symbol's multiplier
        const symbolObj = SYMBOLS.find(s => s.symbol === symbols[0]);
        if (symbolObj) {
          totalWin += betAmount * symbolObj.multiplier;
        }
      }
    });
    
    return { winningPaylines, totalWin };
  };
  
  // Check if a position is part of a winning payline
  const isWinningPosition = (row: number, col: number) => {
    return winningLines.some(lineIndex => {
      return PAYLINES[lineIndex].some(([r, c]) => r === row && c === col);
    });
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
            <h1 className="text-2xl font-bold text-white">Slots</h1>
            <Button variant="outline" onClick={handleExitGame}>Exit Game</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Balance Section */}
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-verzus-background-light border border-verzus-border rounded">
                <h3 className="text-verzus-text-secondary mb-1">Your Balance</h3>
                <p className="text-2xl text-verzus-accent font-bold">${balance.toFixed(2)}</p>
              </div>
              
              {lastWin > 0 && (
                <div className="p-4 bg-verzus-primary/20 border border-verzus-border rounded">
                  <h3 className="text-verzus-text-secondary mb-1">Last Win</h3>
                  <p className="text-2xl text-verzus-primary font-bold">+${lastWin.toFixed(2)}</p>
                </div>
              )}
              
              <div className="p-4 bg-verzus-background-light border border-verzus-border rounded">
                <h3 className="text-verzus-text-secondary mb-2">Recent Spins</h3>
                <div className="flex flex-wrap gap-2">
                  {spinsHistory.map((win, index) => (
                    <div 
                      key={index}
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        win > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {win > 0 ? '+' : ''}{win.toFixed(2)}
                    </div>
                  ))}
                  {spinsHistory.length === 0 && (
                    <p className="text-verzus-text-secondary text-sm">No spins yet</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Slots Section */}
            <div>
              <div 
                ref={reelsRef}
                className="bg-verzus-background-dark border-4 border-yellow-600 rounded-lg p-4 overflow-hidden"
              >
                {/* Paylines indicators */}
                <div className="flex justify-between mb-2">
                  {[0, 1, 2].map(index => (
                    <div
                      key={`top-${index}`}
                      className={`w-4 h-4 rounded-full ${
                        winningLines.includes(0) ? 'bg-red-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Slot reels */}
                <div className="flex justify-center gap-2 mb-2">
                  {reels.map((reel, reelIndex) => (
                    <div 
                      key={`reel-${reelIndex}`} 
                      className="flex flex-col bg-gray-800 rounded p-2"
                    >
                      {reel.map((symbol, symbolIndex) => (
                        <div 
                          key={`symbol-${reelIndex}-${symbolIndex}`}
                          className={`text-4xl md:text-5xl lg:text-6xl p-2 flex items-center justify-center ${
                            isWinningPosition(symbolIndex, reelIndex) 
                              ? 'bg-yellow-500/30 rounded-lg animate-pulse' 
                              : ''
                          }`}
                        >
                          {symbol}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Bottom paylines indicators */}
                <div className="flex justify-between mt-2">
                  {[0, 1, 2].map(index => (
                    <div
                      key={`bottom-${index}`}
                      className={`w-4 h-4 rounded-full ${
                        winningLines.includes(2) ? 'bg-red-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Win display */}
              {winAmount > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-xl text-verzus-primary font-bold">You won ${winAmount.toFixed(2)}!</p>
                </div>
              )}
            </div>
            
            {/* Controls Section */}
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-verzus-background-light border border-verzus-border rounded">
                <h3 className="text-white font-bold mb-4">Bet Amount</h3>
                
                <div className="flex items-center mb-4">
                  <div className="flex-1 relative">
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={handleBetAmountChange}
                      disabled={isSpinning}
                      min={0.5}
                      max={100}
                      step={0.5}
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
                      onClick={() => adjustBetAmount(0.5)}
                      disabled={isSpinning}
                    >
                      <ChevronUp size={14} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="px-2 h-6"
                      onClick={() => adjustBetAmount(-0.5)}
                      disabled={isSpinning}
                    >
                      <ChevronDown size={14} />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-verzus-accent hover:bg-verzus-accent/80"
                  onClick={spin}
                  disabled={isSpinning || balance < betAmount}
                >
                  {isSpinning ? 'Spinning...' : 'SPIN'}
                </Button>
              </div>
              
              <div className="p-4 bg-verzus-background-light border border-verzus-border rounded">
                <h3 className="text-white font-bold mb-2">Payouts</h3>
                <div className="grid grid-cols-2 gap-2">
                  {SYMBOLS.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-xl mr-2">{item.symbol}</span>
                      <span className="text-verzus-text-secondary">{item.multiplier}x</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-verzus-text-secondary">
              Match symbols across paylines to win! The more valuable the symbol, the higher the payout.
            </p>
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default SlotsGame;
