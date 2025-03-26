
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const CheckersGame = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  const [gameState, setGameState] = useState({
    board: [
      ['', 'b', '', 'b', '', 'b', '', 'b'],
      ['b', '', 'b', '', 'b', '', 'b', ''],
      ['', 'b', '', 'b', '', 'b', '', 'b'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['r', '', 'r', '', 'r', '', 'r', ''],
      ['', 'r', '', 'r', '', 'r', '', 'r'],
      ['r', '', 'r', '', 'r', '', 'r', '']
    ],
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
        description: "Starting a new Checkers game",
      });
    }
  }, [matchId]);

  const handleExitGame = () => {
    navigate(`/games/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <GlassMorphicContainer className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Checkers</h1>
            <Button variant="outline" onClick={handleExitGame}>Exit Game</Button>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="checkers-board border border-verzus-border rounded overflow-hidden">
              {gameState.board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((piece, colIndex) => (
                    <div 
                      key={`${rowIndex}-${colIndex}`} 
                      className={`w-12 h-12 flex items-center justify-center ${
                        (rowIndex + colIndex) % 2 === 0 ? 'bg-gray-400' : 'bg-gray-900'
                      }`}
                    >
                      {piece && (
                        <div className={`w-8 h-8 rounded-full ${
                          piece === 'r' ? 'bg-red-500' : 'bg-black'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-verzus-text-secondary mb-2">
              Current turn: <span className="font-bold text-white">{gameState.currentPlayer}</span>
            </p>
            <p className="text-verzus-text-secondary">
              This is a simplified checkers implementation. In a real app, we would add move validation, 
              piece capturing, king promotion, and multiplayer functionality.
            </p>
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckersGame;
