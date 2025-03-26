import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Dice5 } from 'lucide-react';

const DiceGame = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  
  const [gameState, setGameState] = useState({
    playerScore: 0,
    opponentScore: 0,
    currentRoll: 0,
    tempScore: 0,
    playerTurn: true,
    gameOver: false,
    winner: '',
    rollHistory: [] as number[]
  });
  
  const [isRolling, setIsRolling] = useState(false);
  
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
        description: "Starting a new Dice game",
      });
    }
  }, [matchId]);
  
  useEffect(() => {
    // Check for win condition
    if (gameState.playerScore >= 50) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        winner: 'player'
      }));
      
      toast({
        title: "You win!",
        description: "Congratulations, you reached 50 points first!",
      });
    } else if (gameState.opponentScore >= 50) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        winner: 'opponent'
      }));
      
      toast({
        title: "Opponent wins",
        description: "Your opponent reached 50 points first.",
      });
    }
  }, [gameState.playerScore, gameState.opponentScore]);
  
  // AI opponent turn
  useEffect(() => {
    if (!gameState.playerTurn && !gameState.gameOver) {
      const aiTurnTimeout = setTimeout(() => {
        aiTurn();
      }, 1500);
      
      return () => clearTimeout(aiTurnTimeout);
    }
  }, [gameState.playerTurn, gameState.gameOver]);
  
  const rollDice = () => {
    if (gameState.gameOver) return;
    
    setIsRolling(true);
    
    // Simulate dice roll animation
    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
      const randomRoll = Math.floor(Math.random() * 6) + 1;
      setGameState(prev => ({ ...prev, currentRoll: randomRoll }));
      
      rollCount++;
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        setIsRolling(false);
        
        // Final roll
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        
        setGameState(prev => {
          const newHistory = [...prev.rollHistory, finalRoll];
          
          // If roll is 1, player loses their turn and all accumulated points
          if (finalRoll === 1) {
            toast({
              title: "Rolled a 1!",
              description: "You lose your turn and temporary points.",
            });
            
            return {
              ...prev,
              currentRoll: finalRoll,
              tempScore: 0,
              playerTurn: false,
              rollHistory: newHistory
            };
          }
          
          // Otherwise, add to temporary score
          return {
            ...prev,
            currentRoll: finalRoll,
            tempScore: prev.tempScore + finalRoll,
            rollHistory: newHistory
          };
        });
      }
    }, 100);
  };
  
  const holdScore = () => {
    if (gameState.gameOver || isRolling) return;
    
    setGameState(prev => ({
      ...prev,
      playerScore: prev.playerScore + prev.tempScore,
      tempScore: 0,
      playerTurn: false
    }));
    
    toast({
      title: "Points banked",
      description: `You added ${gameState.tempScore} points to your score.`,
    });
  };
  
  const aiTurn = () => {
    let aiTempScore = 0;
    let continueTurn = true;
    let aiRolls = [];
    
    // AI decision making - will roll until it gets about 15 points or rolls a 1
    while (continueTurn) {
      const roll = Math.floor(Math.random() * 6) + 1;
      aiRolls.push(roll);
      
      if (roll === 1) {
        aiTempScore = 0;
        continueTurn = false;
        
        toast({
          title: "Opponent rolled a 1",
          description: "They lost their temporary score.",
        });
      } else {
        aiTempScore += roll;
        
        // AI will hold if it has more than 15 points or if holding would win
        if (aiTempScore >= 15 || (gameState.opponentScore + aiTempScore >= 50)) {
          continueTurn = false;
        }
      }
    }
    
    // Update game state after AI turn
    setGameState(prev => ({
      ...prev,
      opponentScore: prev.opponentScore + aiTempScore,
      currentRoll: aiRolls[aiRolls.length - 1],
      playerTurn: true,
      rollHistory: [...prev.rollHistory, ...aiRolls]
    }));
    
    if (aiTempScore > 0) {
      toast({
        title: "Opponent's turn ended",
        description: `They added ${aiTempScore} points to their score.`,
      });
    }
  };
  
  const resetGame = () => {
    setGameState({
      playerScore: 0,
      opponentScore: 0,
      currentRoll: 0,
      tempScore: 0,
      playerTurn: true,
      gameOver: false,
      winner: '',
      rollHistory: []
    });
    
    toast({
      title: "New game",
      description: "The game has been reset.",
    });
  };
  
  const handleExitGame = () => {
    navigate(`/games/${id}`);
  };
  
  // Render dice face based on current roll
  const renderDiceFace = (value: number) => {
    switch (value) {
      case 1:
        return (
          <div className="grid place-items-center h-full w-full">
            <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-2 h-full w-full p-4">
            <div className="flex justify-start items-start">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-end items-end">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-3 grid-rows-3 h-full w-full p-4">
            <div className="flex justify-start items-start">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="col-start-2 row-start-2 flex justify-center items-center">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="col-start-3 row-start-3 flex justify-end items-end">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 grid-rows-2 h-full w-full p-4">
            <div className="flex justify-start items-start">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-end items-start">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-start items-end">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-end items-end">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="grid grid-cols-3 grid-rows-3 h-full w-full p-4">
            <div className="flex justify-start items-start">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-end items-start col-start-3">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="col-start-2 row-start-2 flex justify-center items-center">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-start items-end row-start-3">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-end items-end col-start-3 row-start-3">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-2 grid-rows-3 h-full w-full p-4">
            <div className="flex justify-start items-start">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-end items-start">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-start items-center">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-end items-center">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-start items-end">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
            <div className="flex justify-end items-end">
              <div className="bg-verzus-text-primary rounded-full w-5 h-5"></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <GlassMorphicContainer className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Roll Dice</h1>
            <Button variant="outline" onClick={handleExitGame}>Exit Game</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Player Section */}
            <div className={`p-6 rounded-lg border-2 ${gameState.playerTurn ? 'border-verzus-primary' : 'border-verzus-border'}`}>
              <h2 className="text-xl font-bold text-white mb-4">You</h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-verzus-text-secondary">Total Score</p>
                  <p className="text-3xl font-bold text-white">{gameState.playerScore}</p>
                </div>
                <div>
                  <p className="text-verzus-text-secondary">Current Round</p>
                  <p className="text-3xl font-bold text-verzus-accent">+{gameState.tempScore}</p>
                </div>
              </div>
              
              {gameState.playerTurn && !gameState.gameOver && (
                <div className="space-y-4">
                  <Button 
                    onClick={rollDice} 
                    disabled={isRolling}
                    className="w-full"
                  >
                    {isRolling ? 'Rolling...' : 'Roll Dice'}
                  </Button>
                  <Button 
                    onClick={holdScore} 
                    disabled={gameState.tempScore === 0 || isRolling}
                    variant="outline"
                    className="w-full"
                  >
                    Hold ({gameState.tempScore} points)
                  </Button>
                </div>
              )}
            </div>
            
            {/* Opponent Section */}
            <div className={`p-6 rounded-lg border-2 ${!gameState.playerTurn ? 'border-verzus-primary' : 'border-verzus-border'}`}>
              <h2 className="text-xl font-bold text-white mb-4">Opponent</h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-verzus-text-secondary">Total Score</p>
                  <p className="text-3xl font-bold text-white">{gameState.opponentScore}</p>
                </div>
                {!gameState.playerTurn && !gameState.gameOver && (
                  <div>
                    <p className="text-verzus-text-secondary">Opponent's Turn</p>
                    <p className="text-sm text-verzus-text-secondary">AI is making decisions...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Dice Display */}
          <div className="flex justify-center mb-8">
            <div className={`w-32 h-32 bg-white rounded-lg shadow-lg transition-all duration-300 ${isRolling ? 'animate-bounce' : ''}`}>
              {gameState.currentRoll > 0 ? (
                renderDiceFace(gameState.currentRoll)
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Dice5 size={48} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          {/* Game Information */}
          <div className="text-center mb-6">
            {gameState.gameOver ? (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {gameState.winner === 'player' ? 'You Win!' : 'Opponent Wins!'}
                </h2>
                <p className="text-verzus-text-secondary mb-4">
                  Final Score: You {gameState.playerScore} - {gameState.opponentScore} Opponent
                </p>
                <Button onClick={resetGame}>Play Again</Button>
              </div>
            ) : (
              <div>
                <p className="text-verzus-text-secondary mb-2">
                  {gameState.playerTurn ? 'Your turn' : 'Opponent\'s turn'}
                </p>
                <p className="text-verzus-text-secondary">
                  First to reach 50 points wins. Roll a 1 and lose all points for that turn!
                </p>
              </div>
            )}
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default DiceGame;
