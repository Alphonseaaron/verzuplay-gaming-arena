
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Crown } from 'lucide-react';

// Types for pieces and game state
type Piece = '' | 'r' | 'b' | 'R' | 'B'; // R and B are kings
type Player = 'red' | 'black';
type GameStatus = 'playing' | 'gameOver';

interface CheckersProps {
  board: Piece[][];
  currentPlayer: Player;
  status: GameStatus;
  selectedPiece: [number, number] | null;
  winner: Player | null;
  availableMoves: [number, number][];
}

const CheckersGame: React.FC = () => {
  const navigate = useNavigate();
  const { id, matchId } = useParams();
  
  // Initial game state
  const [gameState, setGameState] = useState<CheckersProps>({
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
    status: 'playing',
    selectedPiece: null,
    winner: null,
    availableMoves: []
  });
  
  const [aiThinking, setAiThinking] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  
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

  // AI move timing based on difficulty
  const getAiDelay = () => {
    switch (difficultyLevel) {
      case 'easy': return 800;
      case 'medium': return 1200;
      case 'hard': return 1800;
      default: return 1200;
    }
  };

  // Check if it's AI's turn (black player)
  useEffect(() => {
    if (gameState.currentPlayer === 'black' && gameState.status === 'playing') {
      makeAiMove();
    }
  }, [gameState.currentPlayer, gameState.status]);

  // Finding valid moves for a piece
  const findValidMoves = useCallback((rowIndex: number, colIndex: number, board: Piece[][]): [number, number][] => {
    const piece = board[rowIndex][colIndex];
    if (piece === '') return [];
    
    const isRed = piece.toLowerCase() === 'r';
    const isKing = piece === 'R' || piece === 'B';
    const directions: [number, number][] = [];
    
    // Regular move directions based on piece color
    if (isRed) directions.push([-1, -1], [-1, 1]); // Red moves up
    else directions.push([1, -1], [1, 1]); // Black moves down
    
    // Kings can move in all four diagonal directions
    if (isKing) {
      if (isRed) directions.push([1, -1], [1, 1]); // Add downward moves for red king
      else directions.push([-1, -1], [-1, 1]); // Add upward moves for black king
    }
    
    const validMoves: [number, number][] = [];
    const jumpMoves: [number, number][] = [];
    
    // Check each direction for moves
    directions.forEach(([dr, dc]) => {
      // Regular move (one step)
      const r = rowIndex + dr;
      const c = colIndex + dc;
      
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board[r][c] === '') {
          validMoves.push([r, c]);
        } 
        // Jump move (capture)
        else if (
          (isRed && board[r][c].toLowerCase() === 'b') || 
          (!isRed && board[r][c].toLowerCase() === 'r')
        ) {
          const jumpR = r + dr;
          const jumpC = c + dc;
          
          if (
            jumpR >= 0 && jumpR < 8 && 
            jumpC >= 0 && jumpC < 8 && 
            board[jumpR][jumpC] === ''
          ) {
            jumpMoves.push([jumpR, jumpC]);
          }
        }
      }
    });
    
    // Prioritize jumps if available
    return jumpMoves.length > 0 ? jumpMoves : validMoves;
  }, []);

  // Select a piece to move
  const selectPiece = (rowIndex: number, colIndex: number) => {
    if (gameState.status === 'gameOver' || gameState.currentPlayer === 'black') return;
    
    const piece = gameState.board[rowIndex][colIndex];
    const isCurrentPlayerPiece = 
      (gameState.currentPlayer === 'red' && piece.toLowerCase() === 'r') ||
      (gameState.currentPlayer === 'black' && piece.toLowerCase() === 'b');
    
    if (isCurrentPlayerPiece) {
      const availableMoves = findValidMoves(rowIndex, colIndex, gameState.board);
      
      setGameState({
        ...gameState,
        selectedPiece: [rowIndex, colIndex],
        availableMoves
      });
    } else if (gameState.selectedPiece) {
      // Check if clicked position is in available moves
      const isValidMove = gameState.availableMoves.some(
        ([r, c]) => r === rowIndex && c === colIndex
      );
      
      if (isValidMove) {
        movePiece(rowIndex, colIndex);
      }
    }
  };

  // Move a piece
  const movePiece = (toRow: number, toCol: number) => {
    if (!gameState.selectedPiece) return;
    
    const [fromRow, fromCol] = gameState.selectedPiece;
    const piece = gameState.board[fromRow][fromCol];
    
    // Create a new board with the move
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[fromRow][fromCol] = '';
    
    // Check if this is a jump (capture) move
    const isJump = Math.abs(fromRow - toRow) === 2;
    
    if (isJump) {
      const captureRow = (fromRow + toRow) / 2;
      const captureCol = (fromCol + toCol) / 2;
      newBoard[captureRow][captureCol] = '';
    }
    
    // Check if piece becomes a king
    let newPiece = piece;
    if (piece === 'r' && toRow === 0) newPiece = 'R'; // Red reaches top
    if (piece === 'b' && toRow === 7) newPiece = 'B'; // Black reaches bottom
    
    newBoard[toRow][toCol] = newPiece;
    
    // Check for winner
    const blackRemaining = newBoard.flat().filter(p => p.toLowerCase() === 'b').length;
    const redRemaining = newBoard.flat().filter(p => p.toLowerCase() === 'r').length;
    
    let status = gameState.status;
    let winner = gameState.winner;
    
    if (blackRemaining === 0) {
      status = 'gameOver';
      winner = 'red';
      toast({
        title: "Game Over",
        description: "Red wins! Black has no pieces left.",
      });
    } else if (redRemaining === 0) {
      status = 'gameOver';
      winner = 'black';
      toast({
        title: "Game Over",
        description: "Black wins! Red has no pieces left.",
      });
    }
    
    // After making a move, check if this piece can jump again
    const canJumpAgain = isJump && findValidMoves(toRow, toCol, newBoard).some(
      ([r, c]) => Math.abs(r - toRow) === 2
    );
    
    setGameState({
      ...gameState,
      board: newBoard,
      currentPlayer: canJumpAgain ? gameState.currentPlayer : (gameState.currentPlayer === 'red' ? 'black' : 'red'),
      selectedPiece: null,
      availableMoves: [],
      status,
      winner
    });
  };

  // AI Move Logic
  const makeAiMove = () => {
    if (gameState.status !== 'playing' || gameState.currentPlayer !== 'black') return;
    
    setAiThinking(true);
    
    setTimeout(() => {
      // 1. Find all pieces that can move
      const movablePieces: Array<[number, number, [number, number][]]> = [];
      
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = gameState.board[r][c];
          if (piece.toLowerCase() === 'b') {
            const moves = findValidMoves(r, c, gameState.board);
            if (moves.length > 0) {
              movablePieces.push([r, c, moves]);
            }
          }
        }
      }
      
      if (movablePieces.length === 0) {
        // Black has no moves, red wins
        setGameState({
          ...gameState,
          status: 'gameOver',
          winner: 'red'
        });
        
        toast({
          title: "Game Over",
          description: "Red wins! Black has no valid moves.",
        });
        
        setAiThinking(false);
        return;
      }
      
      // 2. Prioritize jump moves
      const jumpMoves = movablePieces.filter(([r, c, moves]) => 
        moves.some(([mr, mc]) => Math.abs(mr - r) === 2)
      );
      
      const movesToConsider = jumpMoves.length > 0 ? jumpMoves : movablePieces;
      
      // 3. Add AI difficulty - higher difficulty has better piece selection strategy
      let selectedMove: [number, number, [number, number]] | null = null;
      
      if (difficultyLevel === 'easy') {
        // Random selection for easy
        const randomPieceIndex = Math.floor(Math.random() * movesToConsider.length);
        const [r, c, moves] = movesToConsider[randomPieceIndex];
        const randomMoveIndex = Math.floor(Math.random() * moves.length);
        selectedMove = [r, c, moves[randomMoveIndex]];
      } 
      else if (difficultyLevel === 'medium') {
        // Medium prefers kings and captures, but sometimes makes random moves
        const kingsWithMoves = movesToConsider.filter(([r, c]) => gameState.board[r][c] === 'B');
        
        if (kingsWithMoves.length > 0 && Math.random() > 0.3) {
          const randomKingIndex = Math.floor(Math.random() * kingsWithMoves.length);
          const [r, c, moves] = kingsWithMoves[randomKingIndex];
          const randomMoveIndex = Math.floor(Math.random() * moves.length);
          selectedMove = [r, c, moves[randomMoveIndex]];
        } else {
          const randomPieceIndex = Math.floor(Math.random() * movesToConsider.length);
          const [r, c, moves] = movesToConsider[randomPieceIndex];
          const randomMoveIndex = Math.floor(Math.random() * moves.length);
          selectedMove = [r, c, moves[randomMoveIndex]];
        }
      }
      else { // hard
        // Hard prioritizes kings, captures, and advancing to become kings
        const kingsWithMoves = movesToConsider.filter(([r, c]) => gameState.board[r][c] === 'B');
        
        if (kingsWithMoves.length > 0) {
          // Use kings when available
          const randomKingIndex = Math.floor(Math.random() * kingsWithMoves.length);
          const [r, c, moves] = kingsWithMoves[randomKingIndex];
          const randomMoveIndex = Math.floor(Math.random() * moves.length);
          selectedMove = [r, c, moves[randomMoveIndex]];
        } 
        else if (jumpMoves.length > 0) {
          // Prioritize jump moves
          const randomJumpIndex = Math.floor(Math.random() * jumpMoves.length);
          const [r, c, moves] = jumpMoves[randomJumpIndex];
          
          // Find jump moves specifically
          const jumps = moves.filter(([mr, mc]) => Math.abs(mr - r) === 2);
          const randomJump = jumps[Math.floor(Math.random() * jumps.length)];
          
          selectedMove = [r, c, randomJump];
        } 
        else {
          // Look for pieces close to promotion
          const piecesNearPromotion = movesToConsider.filter(([r]) => r >= 5);
          
          if (piecesNearPromotion.length > 0) {
            const randomPieceIndex = Math.floor(Math.random() * piecesNearPromotion.length);
            const [r, c, moves] = piecesNearPromotion[randomPieceIndex];
            
            // Prefer moves that advance further
            const sortedMoves = [...moves].sort(([r1], [r2]) => r2 - r1);
            selectedMove = [r, c, sortedMoves[0]];
          } else {
            // Fall back to random selection
            const randomPieceIndex = Math.floor(Math.random() * movesToConsider.length);
            const [r, c, moves] = movesToConsider[randomPieceIndex];
            const randomMoveIndex = Math.floor(Math.random() * moves.length);
            selectedMove = [r, c, moves[randomMoveIndex]];
          }
        }
      }
      
      if (selectedMove) {
        const [fromRow, fromCol, [toRow, toCol]] = selectedMove;
        
        // Make the AI's move
        const piece = gameState.board[fromRow][fromCol];
        const newBoard = gameState.board.map(row => [...row]);
        newBoard[fromRow][fromCol] = '';
        
        // Check if this is a jump (capture) move
        const isJump = Math.abs(fromRow - toRow) === 2;
        
        if (isJump) {
          const captureRow = (fromRow + toRow) / 2;
          const captureCol = (fromCol + toCol) / 2;
          newBoard[captureRow][captureCol] = '';
        }
        
        // Check if piece becomes a king
        let newPiece = piece;
        if (piece === 'b' && toRow === 7) newPiece = 'B'; // Black reaches bottom
        
        newBoard[toRow][toCol] = newPiece;
        
        // Check for winner
        const redRemaining = newBoard.flat().filter(p => p.toLowerCase() === 'r').length;
        
        let status = gameState.status;
        let winner = gameState.winner;
        
        if (redRemaining === 0) {
          status = 'gameOver';
          winner = 'black';
          toast({
            title: "Game Over",
            description: "Black wins! Red has no pieces left.",
          });
        }
        
        // Check if AI can jump again
        const canJumpAgain = isJump && findValidMoves(toRow, toCol, newBoard).some(
          ([r, c]) => Math.abs(r - toRow) === 2
        );
        
        setGameState({
          ...gameState,
          board: newBoard,
          currentPlayer: canJumpAgain ? 'black' : 'red',
          status,
          winner
        });
      }
      
      setAiThinking(false);
    }, getAiDelay());
  };

  const resetGame = () => {
    setGameState({
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
      status: 'playing',
      selectedPiece: null,
      winner: null,
      availableMoves: []
    });
    
    toast({
      title: "New game",
      description: "Starting a new Checkers game",
    });
  };

  const handleDifficultyChange = (level: 'easy' | 'medium' | 'hard') => {
    setDifficultyLevel(level);
    
    toast({
      title: "Difficulty changed",
      description: `AI difficulty set to ${level}`,
    });
  };

  const handleExitGame = () => {
    navigate(`/games/${id}`);
  };

  // Helper to determine cell styling
  const getCellClass = (rowIndex: number, colIndex: number) => {
    const isBlackCell = (rowIndex + colIndex) % 2 === 1;
    const isSelected = gameState.selectedPiece && 
                      gameState.selectedPiece[0] === rowIndex && 
                      gameState.selectedPiece[1] === colIndex;
    const isValidMove = gameState.availableMoves.some(
      ([r, c]) => r === rowIndex && c === colIndex
    );
    
    if (isSelected) return 'bg-verzus-primary/40';
    if (isValidMove) return 'bg-verzus-accent/30 cursor-pointer';
    return isBlackCell ? 'bg-gray-900' : 'bg-gray-400';
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
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex justify-center mb-4">
                <div className="checkers-board border border-verzus-border rounded overflow-hidden">
                  {gameState.board.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      {row.map((piece, colIndex) => (
                        <div 
                          key={`${rowIndex}-${colIndex}`} 
                          className={`w-12 h-12 flex items-center justify-center ${getCellClass(rowIndex, colIndex)}`}
                          onClick={() => selectPiece(rowIndex, colIndex)}
                        >
                          {piece && (
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center
                                ${piece.toLowerCase() === 'r' ? 'bg-red-600' : 'bg-black'}
                                ${gameState.currentPlayer === (piece.toLowerCase() === 'r' ? 'red' : 'black') 
                                  ? 'ring-2 ring-white/50' : ''}
                              `}
                            >
                              {(piece === 'R' || piece === 'B') && (
                                <Crown className="text-white h-6 w-6" />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <div className="bg-verzus-background-light p-4 rounded-lg mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Game Info</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-verzus-text-secondary mb-1">Current Turn:</p>
                    <p className={`text-lg font-bold ${
                      gameState.currentPlayer === 'red' ? 'text-red-500' : 'text-gray-300'
                    }`}>
                      {gameState.currentPlayer === 'red' ? 'Your Turn (Red)' : 'AI Turn (Black)'}
                      {aiThinking && gameState.currentPlayer === 'black' && ' - Thinking...'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-verzus-text-secondary mb-1">Status:</p>
                    <p className="text-lg font-bold text-white">
                      {gameState.status === 'gameOver' 
                        ? `Game Over - ${gameState.winner === 'red' ? 'You Win!' : 'AI Wins!'}`
                        : 'In Progress'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-verzus-text-secondary mb-1">AI Difficulty:</p>
                    <div className="flex space-x-2 mt-2">
                      <Button 
                        size="sm"
                        variant={difficultyLevel === 'easy' ? 'default' : 'outline'}
                        onClick={() => handleDifficultyChange('easy')}
                        className={difficultyLevel === 'easy' ? 'bg-green-600' : ''}
                      >
                        Easy
                      </Button>
                      <Button 
                        size="sm"
                        variant={difficultyLevel === 'medium' ? 'default' : 'outline'}
                        onClick={() => handleDifficultyChange('medium')}
                        className={difficultyLevel === 'medium' ? 'bg-yellow-600' : ''}
                      >
                        Medium
                      </Button>
                      <Button 
                        size="sm"
                        variant={difficultyLevel === 'hard' ? 'default' : 'outline'}
                        onClick={() => handleDifficultyChange('hard')}
                        className={difficultyLevel === 'hard' ? 'bg-red-600' : ''}
                      >
                        Hard
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-verzus-background-light p-4 rounded-lg mb-6">
                <h2 className="text-xl font-bold text-white mb-4">How to Play</h2>
                <ul className="list-disc list-inside text-verzus-text-secondary space-y-2">
                  <li>Click on your red pieces to select them</li>
                  <li>Click on highlighted squares to move</li>
                  <li>Capture opponent pieces by jumping over them</li>
                  <li>Reach the opposite end of the board to crown your piece as a king</li>
                  <li>Kings can move forward and backward</li>
                  <li>Capture all opponent pieces to win</li>
                </ul>
              </div>
              
              <Button 
                onClick={resetGame} 
                className="w-full mb-2"
                disabled={aiThinking}
              >
                Start New Game
              </Button>
            </div>
          </div>
        </GlassMorphicContainer>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckersGame;
