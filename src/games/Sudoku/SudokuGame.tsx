
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const SudokuGame = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  
  // Sample initial board with some numbers filled in
  const initialBoard = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];
  
  // Create a copy of the initial board to track which cells are pre-filled
  const fixedCells = initialBoard.map(row => 
    row.map(cell => cell !== 0)
  );
  
  const [board, setBoard] = useState(initialBoard);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [gameState, setGameState] = useState({
    status: 'playing',
    startTime: new Date(),
    errors: 0
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
        description: "Starting a new Sudoku game",
      });
    }
  }, [matchId]);

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!fixedCells[rowIndex][colIndex]) {
      setSelectedCell([rowIndex, colIndex]);
    }
  };

  const handleNumberInput = (number: number) => {
    if (!selectedCell) return;
    
    const [rowIndex, colIndex] = selectedCell;
    const newBoard = [...board.map(row => [...row])];
    newBoard[rowIndex][colIndex] = number;
    setBoard(newBoard);
  };

  const handleClearCell = () => {
    if (!selectedCell) return;
    
    const [rowIndex, colIndex] = selectedCell;
    if (fixedCells[rowIndex][colIndex]) return;
    
    const newBoard = [...board.map(row => [...row])];
    newBoard[rowIndex][colIndex] = 0;
    setBoard(newBoard);
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
            <h1 className="text-2xl font-bold text-white">Sudoku</h1>
            <Button variant="outline" onClick={handleExitGame}>Exit Game</Button>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="sudoku-board border-2 border-verzus-border rounded overflow-hidden">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div 
                      key={`${rowIndex}-${colIndex}`} 
                      className={`w-10 h-10 flex items-center justify-center border border-verzus-border text-lg font-medium
                        ${fixedCells[rowIndex][colIndex] ? 'bg-verzus-background-light text-white' : 'bg-verzus-background text-verzus-text-secondary'}
                        ${selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex ? 'bg-verzus-primary/20' : ''}
                        ${(Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 === 0 ? 'bg-opacity-10' : 'bg-opacity-5'}
                      `}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell !== 0 ? cell : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <Button 
                  key={num} 
                  variant="outline" 
                  onClick={() => handleNumberInput(num)}
                  className="w-10 h-10 p-0"
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={handleClearCell}
                className="w-10 h-10 p-0"
              >
                C
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-verzus-text-secondary">
              Select a cell and use the number buttons to fill in the puzzle.
              The goal is to fill each row, column, and 3x3 box with digits 1-9 without repetition.
            </p>
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default SudokuGame;
