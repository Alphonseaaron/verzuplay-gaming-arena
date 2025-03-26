
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ConnectFourGame = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  const [gameState, setGameState] = useState({
    board: Array(6).fill(null).map(() => Array(7).fill(null)),
    currentPlayer: 'red',
    status: 'playing'
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
        description: "Starting a new Connect Four game",
      });
    }
  }, [matchId]);

  const handleColumnClick = (colIndex: number) => {
    if (gameState.status !== 'playing') return;
    
    // Find the lowest empty cell in the column
    const boardCopy = [...gameState.board.map(row => [...row])];
    let rowIndex = -1;
    
    for (let i = 5; i >= 0; i--) {
      if (boardCopy[i][colIndex] === null) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) return; // Column is full
    
    boardCopy[rowIndex][colIndex] = gameState.currentPlayer;
    
    setGameState({
      board: boardCopy,
      currentPlayer: gameState.currentPlayer === 'red' ? 'yellow' : 'red',
      status: gameState.status
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
            <h1 className="text-2xl font-bold text-white">Connect Four</h1>
            <Button variant="outline" onClick={handleExitGame}>Exit Game</Button>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="connect-four-board bg-blue-700 p-2 rounded-lg">
              {gameState.board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div 
                      key={`${rowIndex}-${colIndex}`} 
                      className="w-12 h-12 p-1"
                      onClick={() => handleColumnClick(colIndex)}
                    >
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                        {cell && (
                          <div className={`w-10 h-10 rounded-full ${
                            cell === 'red' ? 'bg-red-500' : 'bg-yellow-400'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-verzus-text-secondary mb-2">
              Current turn: <span className="font-bold text-white capitalize">{gameState.currentPlayer}</span>
            </p>
            <p className="text-verzus-text-secondary">
              Click on a column to drop your piece. Connect four of your pieces 
              vertically, horizontally, or diagonally to win!
            </p>
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default ConnectFourGame;
