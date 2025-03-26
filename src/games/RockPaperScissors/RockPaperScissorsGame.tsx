
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

type Choice = 'rock' | 'paper' | 'scissors';

const RockPaperScissorsGame = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  
  const [gameState, setGameState] = useState({
    playerScore: 0,
    opponentScore: 0,
    round: 1,
    playerChoice: null as Choice | null,
    opponentChoice: null as Choice | null,
    roundResult: null as 'win' | 'lose' | 'draw' | null,
    gameOver: false,
    history: [] as { player: Choice, opponent: Choice, result: 'win' | 'lose' | 'draw' }[]
  });
  
  const [showResult, setShowResult] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
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
        description: "Starting a new Rock Paper Scissors game",
      });
    }
  }, [matchId]);
  
  const makeChoice = (choice: Choice) => {
    if (gameState.playerChoice || gameState.gameOver) return;
    
    setGameState(prev => ({
      ...prev,
      playerChoice: choice
    }));
    
    // Start countdown
    setCountdown(3);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          determineWinner(choice);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const determineWinner = (playerChoice: Choice) => {
    // AI makes a choice
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    const aiChoice = choices[Math.floor(Math.random() * choices.length)];
    
    // Determine winner
    let result: 'win' | 'lose' | 'draw';
    
    if (playerChoice === aiChoice) {
      result = 'draw';
    } else if (
      (playerChoice === 'rock' && aiChoice === 'scissors') ||
      (playerChoice === 'paper' && aiChoice === 'rock') ||
      (playerChoice === 'scissors' && aiChoice === 'paper')
    ) {
      result = 'win';
    } else {
      result = 'lose';
    }
    
    // Update game state
    setGameState(prev => {
      const newPlayerScore = result === 'win' ? prev.playerScore + 1 : prev.playerScore;
      const newOpponentScore = result === 'lose' ? prev.opponentScore + 1 : prev.opponentScore;
      const newHistory = [...prev.history, { player: playerChoice, opponent: aiChoice, result }];
      
      // Check if game is over (best of 10 rounds)
      const gameOver = newPlayerScore >= 6 || newOpponentScore >= 6;
      
      return {
        ...prev,
        playerChoice,
        opponentChoice: aiChoice,
        roundResult: result,
        playerScore: newPlayerScore,
        opponentScore: newOpponentScore,
        history: newHistory,
        gameOver,
        round: gameOver ? prev.round : prev.round + 1
      };
    });
    
    setShowResult(true);
    
    // Show result for 2 seconds then reset for next round
    setTimeout(() => {
      setShowResult(false);
      
      // If game is not over, reset choices for next round
      setGameState(prev => {
        if (!prev.gameOver) {
          return {
            ...prev,
            playerChoice: null,
            opponentChoice: null,
            roundResult: null
          };
        }
        return prev;
      });
    }, 2000);
  };
  
  const resetGame = () => {
    setGameState({
      playerScore: 0,
      opponentScore: 0,
      round: 1,
      playerChoice: null,
      opponentChoice: null,
      roundResult: null,
      gameOver: false,
      history: []
    });
    
    setShowResult(false);
    setCountdown(0);
    
    toast({
      title: "New game",
      description: "Starting a new Rock Paper Scissors game",
    });
  };
  
  const getChoiceEmoji = (choice: Choice | null) => {
    switch (choice) {
      case 'rock': return '✊';
      case 'paper': return '✋';
      case 'scissors': return '✌️';
      default: return '?';
    }
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
            <h1 className="text-2xl font-bold text-white">Rock Paper Scissors</h1>
            <Button variant="outline" onClick={handleExitGame}>Exit Game</Button>
          </div>
          
          <div className="text-center mb-6">
            <div className="inline-block bg-verzus-background-light px-4 py-2 rounded-full">
              <span className="text-verzus-text-secondary">Round {gameState.round} of 10</span>
              <span className="mx-4 text-white font-bold">{gameState.playerScore} - {gameState.opponentScore}</span>
              <span className="text-verzus-text-secondary">
                {gameState.gameOver ? 'Game Over' : 'First to 6 wins'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Player Choice */}
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold text-white mb-4">Your Choice</h2>
              
              <div className="w-36 h-36 rounded-full bg-verzus-background-light border-4 border-verzus-primary flex items-center justify-center mb-6">
                <span className="text-6xl">
                  {showResult 
                    ? getChoiceEmoji(gameState.playerChoice) 
                    : countdown > 0 
                      ? countdown 
                      : gameState.playerChoice 
                        ? getChoiceEmoji(gameState.playerChoice) 
                        : '?'}
                </span>
              </div>
              
              {!gameState.gameOver && !gameState.playerChoice && (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="h-16 w-16 text-2xl"
                    onClick={() => makeChoice('rock')}
                  >
                    ✊
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 w-16 text-2xl"
                    onClick={() => makeChoice('paper')}
                  >
                    ✋
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 w-16 text-2xl"
                    onClick={() => makeChoice('scissors')}
                  >
                    ✌️
                  </Button>
                </div>
              )}
            </div>
            
            {/* Opponent Choice */}
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold text-white mb-4">Opponent's Choice</h2>
              
              <div className="w-36 h-36 rounded-full bg-verzus-background-light border-4 border-verzus-accent flex items-center justify-center mb-6">
                <span className="text-6xl">
                  {showResult 
                    ? getChoiceEmoji(gameState.opponentChoice) 
                    : countdown > 0 
                      ? '?' 
                      : gameState.opponentChoice 
                        ? getChoiceEmoji(gameState.opponentChoice) 
                        : '?'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Result Display */}
          {showResult && (
            <div className="text-center mb-8">
              <div className={`text-2xl font-bold ${
                gameState.roundResult === 'win' 
                  ? 'text-green-500' 
                  : gameState.roundResult === 'lose' 
                    ? 'text-red-500' 
                    : 'text-yellow-500'
              }`}>
                {gameState.roundResult === 'win' 
                  ? 'You Win This Round!' 
                  : gameState.roundResult === 'lose' 
                    ? 'You Lose This Round!' 
                    : 'Draw!'}
              </div>
              <p className="text-verzus-text-secondary mt-2">
                {gameState.playerChoice} {gameState.roundResult === 'win' ? 'beats' : gameState.roundResult === 'lose' ? 'loses to' : 'ties with'} {gameState.opponentChoice}
              </p>
            </div>
          )}
          
          {/* Game Over */}
          {gameState.gameOver && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {gameState.playerScore > gameState.opponentScore 
                  ? 'You Win!' 
                  : 'You Lose!'}
              </h2>
              <p className="text-verzus-text-secondary mb-4">
                Final Score: {gameState.playerScore} - {gameState.opponentScore}
              </p>
              <Button onClick={resetGame}>Play Again</Button>
            </div>
          )}
          
          {/* Game History */}
          <div className="mt-8">
            <h3 className="text-white font-bold mb-4">Match History</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {gameState.history.map((round, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded text-center ${
                    round.result === 'win' 
                      ? 'bg-green-500/20 border border-green-500/40' 
                      : round.result === 'lose' 
                        ? 'bg-red-500/20 border border-red-500/40' 
                        : 'bg-yellow-500/20 border border-yellow-500/40'
                  }`}
                >
                  <div className="text-sm text-verzus-text-secondary">Round {index + 1}</div>
                  <div className="flex justify-center items-center my-1">
                    <span className="text-xl mr-2">{getChoiceEmoji(round.player)}</span>
                    <span className="text-xs mx-1">vs</span>
                    <span className="text-xl ml-2">{getChoiceEmoji(round.opponent)}</span>
                  </div>
                  <div className="text-sm capitalize">{round.result}</div>
                </div>
              ))}
              {gameState.history.length === 0 && (
                <div className="col-span-full text-center text-verzus-text-secondary">
                  No rounds played yet
                </div>
              )}
            </div>
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default RockPaperScissorsGame;
