
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/firebase/AuthContext';
import { listenForGameUpdates, updateGameState, updateMatchStatus } from '@/lib/firebase/matchmaking';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';

interface TicTacToeState {
  board: string[][];
  currentPlayer: 'X' | 'O';
  winner: string | null;
  gameOver: boolean;
}

const initialState: TicTacToeState = {
  board: [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ],
  currentPlayer: 'X',
  winner: null,
  gameOver: false
};

const TicTacToeGame = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<TicTacToeState>(initialState);
  const [gameMode, setGameMode] = useState<'ai' | 'multiplayer' | null>(null);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<any>(null);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O'>('X');
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  
  // Initialize the game
  useEffect(() => {
    if (!id) {
      // Local play against AI
      setGameMode('ai');
      setLoading(false);
      return;
    }
    
    // Multiplayer game
    setGameMode('multiplayer');
    
    const unsubscribe = listenForGameUpdates(id, (matchData) => {
      setMatch(matchData);
      
      if (matchData.gameState) {
        setGameState(matchData.gameState);
      }
      
      if (user && matchData.players) {
        // Determine player symbol
        const playerIds = Object.keys(matchData.players);
        setPlayerSymbol(playerIds[0] === user.uid ? 'X' : 'O');
      }
      
      setWaitingForOpponent(false);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [id, user]);
  
  // Check if it's the current user's turn in multiplayer mode
  const isPlayerTurn = () => {
    if (gameMode === 'ai') {
      return gameState.currentPlayer === 'X';
    }
    
    if (gameMode === 'multiplayer' && match) {
      return match.currentTurn === user?.uid;
    }
    
    return false;
  };
  
  // Make a move
  const makeMove = async (row: number, col: number) => {
    if (
      gameState.board[row][col] !== '' || 
      gameState.gameOver || 
      (gameMode === 'multiplayer' && !isPlayerTurn())
    ) {
      return;
    }
    
    // Clone the board
    const newBoard = [...gameState.board.map(row => [...row])];
    newBoard[row][col] = gameState.currentPlayer;
    
    // Check if the game is over
    const winner = checkWinner(newBoard);
    const isDraw = checkDraw(newBoard);
    const gameOver = winner !== null || isDraw;
    
    // Update the game state
    const nextPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    const newGameState = {
      board: newBoard,
      currentPlayer: nextPlayer,
      winner,
      gameOver
    };
    
    if (gameMode === 'multiplayer' && match && user) {
      try {
        // Find the other player
        const playerIds = Object.keys(match.players);
        const opponentId = playerIds.find(id => id !== user.uid);
        
        setWaitingForOpponent(true);
        
        // Update the game state in Firebase
        await updateGameState(id!, newGameState, opponentId);
        
        // If game over, update match status
        if (gameOver) {
          await updateMatchStatus(id!, 'completed', winner === playerSymbol ? user.uid : opponentId);
          
          if (winner === playerSymbol) {
            toast({
              title: "You won!",
              description: "Congratulations on your victory!",
              variant: "default",
            });
          } else if (winner) {
            toast({
              title: "You lost!",
              description: "Better luck next time!",
              variant: "destructive",
            });
          } else {
            toast({
              title: "It's a draw!",
              description: "No winner this time.",
              variant: "default",
            });
          }
        }
      } catch (error) {
        console.error("Error updating game state:", error);
        toast({
          title: "Error",
          description: "Failed to update game state. Please try again.",
          variant: "destructive",
        });
        setWaitingForOpponent(false);
      }
    } else {
      // Local game
      setGameState(newGameState);
      
      // If playing against AI and it's AI's turn
      if (gameMode === 'ai' && nextPlayer === 'O' && !gameOver) {
        setTimeout(() => {
          makeAIMove(newBoard);
        }, 500);
      }
    }
  };
  
  // AI move
  const makeAIMove = (board: string[][]) => {
    // Create a copy of the board
    const newBoard = [...board.map(row => [...row])];
    
    // First, check if AI can win in the next move
    const winMove = findWinningMove(newBoard, 'O');
    if (winMove) {
      newBoard[winMove.row][winMove.col] = 'O';
    } 
    // Second, check if player can win in the next move and block it
    else {
      const blockMove = findWinningMove(newBoard, 'X');
      if (blockMove) {
        newBoard[blockMove.row][blockMove.col] = 'O';
      } 
      // Third, try to take the center
      else if (newBoard[1][1] === '') {
        newBoard[1][1] = 'O';
      } 
      // Fourth, try to take a corner
      else {
        const corners = [
          { row: 0, col: 0 },
          { row: 0, col: 2 },
          { row: 2, col: 0 },
          { row: 2, col: 2 }
        ];
        
        const emptyCorners = corners.filter(corner => 
          newBoard[corner.row][corner.col] === ''
        );
        
        if (emptyCorners.length > 0) {
          const randomCorner = emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
          newBoard[randomCorner.row][randomCorner.col] = 'O';
        } 
        // Lastly, take any available spot
        else {
          const emptySpots = [];
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              if (newBoard[r][c] === '') {
                emptySpots.push({ row: r, col: c });
              }
            }
          }
          
          if (emptySpots.length > 0) {
            const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            newBoard[randomSpot.row][randomSpot.col] = 'O';
          }
        }
      }
    }
    
    // Check if the game is over
    const winner = checkWinner(newBoard);
    const isDraw = checkDraw(newBoard);
    const gameOver = winner !== null || isDraw;
    
    // Update the game state
    setGameState({
      board: newBoard,
      currentPlayer: 'X',
      winner,
      gameOver
    });
    
    if (gameOver) {
      if (winner === 'O') {
        toast({
          title: "You lost!",
          description: "The AI has won. Better luck next time!",
          variant: "destructive",
        });
      } else if (isDraw) {
        toast({
          title: "It's a draw!",
          description: "No winner this time.",
          variant: "default",
        });
      }
    }
  };
  
  // Find a winning move for the given player
  const findWinningMove = (board: string[][], player: string) => {
    // Check rows
    for (let row = 0; row < 3; row++) {
      const rowValues = board[row];
      const playerCount = rowValues.filter(cell => cell === player).length;
      const emptyCount = rowValues.filter(cell => cell === '').length;
      
      if (playerCount === 2 && emptyCount === 1) {
        const col = rowValues.findIndex(cell => cell === '');
        return { row, col };
      }
    }
    
    // Check columns
    for (let col = 0; col < 3; col++) {
      const colValues = [board[0][col], board[1][col], board[2][col]];
      const playerCount = colValues.filter(cell => cell === player).length;
      const emptyCount = colValues.filter(cell => cell === '').length;
      
      if (playerCount === 2 && emptyCount === 1) {
        const row = colValues.findIndex(cell => cell === '');
        return { row, col };
      }
    }
    
    // Check diagonals
    const diagonal1 = [board[0][0], board[1][1], board[2][2]];
    const diagonal2 = [board[0][2], board[1][1], board[2][0]];
    
    const d1PlayerCount = diagonal1.filter(cell => cell === player).length;
    const d1EmptyCount = diagonal1.filter(cell => cell === '').length;
    
    if (d1PlayerCount === 2 && d1EmptyCount === 1) {
      const index = diagonal1.findIndex(cell => cell === '');
      return { row: index, col: index };
    }
    
    const d2PlayerCount = diagonal2.filter(cell => cell === player).length;
    const d2EmptyCount = diagonal2.filter(cell => cell === '').length;
    
    if (d2PlayerCount === 2 && d2EmptyCount === 1) {
      const index = diagonal2.findIndex(cell => cell === '');
      return { row: index, col: 2 - index };
    }
    
    return null;
  };
  
  // Check if there's a winner
  const checkWinner = (board: string[][]) => {
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (
        board[row][0] !== '' &&
        board[row][0] === board[row][1] &&
        board[row][1] === board[row][2]
      ) {
        return board[row][0];
      }
    }
    
    // Check columns
    for (let col = 0; col < 3; col++) {
      if (
        board[0][col] !== '' &&
        board[0][col] === board[1][col] &&
        board[1][col] === board[2][col]
      ) {
        return board[0][col];
      }
    }
    
    // Check diagonals
    if (
      board[0][0] !== '' &&
      board[0][0] === board[1][1] &&
      board[1][1] === board[2][2]
    ) {
      return board[0][0];
    }
    
    if (
      board[0][2] !== '' &&
      board[0][2] === board[1][1] &&
      board[1][1] === board[2][0]
    ) {
      return board[0][2];
    }
    
    return null;
  };
  
  // Check if the game is a draw
  const checkDraw = (board: string[][]) => {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === '') {
          return false;
        }
      }
    }
    
    return checkWinner(board) === null;
  };
  
  // Restart the game
  const restartGame = () => {
    setGameState(initialState);
  };
  
  // Return to the game list
  const goToGameList = () => {
    navigate('/games');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-verzus-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Tic-Tac-Toe</h1>
      
      {waitingForOpponent && (
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-verzus-primary mr-2" />
          <p className="text-verzus-text-secondary">Waiting for your opponent...</p>
        </div>
      )}
      
      {gameMode === 'multiplayer' && match && (
        <div className="w-full mb-4">
          <GlassMorphicContainer className="p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white">Your Symbol: <span className="font-bold">{playerSymbol}</span></p>
                <p className="text-verzus-text-secondary text-sm">
                  {isPlayerTurn() ? "Your turn" : "Opponent's turn"}
                </p>
              </div>
              <div>
                <p className="text-white">Stake: <span className="font-bold">${match.stake}</span></p>
              </div>
            </div>
          </GlassMorphicContainer>
        </div>
      )}
      
      <GlassMorphicContainer className="p-6 w-full mb-6">
        <div className="grid grid-cols-3 gap-2">
          {gameState.board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`w-full aspect-square flex items-center justify-center text-3xl font-bold rounded transition-all ${
                  cell === 'X' ? 'text-verzus-primary bg-verzus-primary/10' :
                  cell === 'O' ? 'text-verzus-accent bg-verzus-accent/10' :
                  'text-white bg-verzus-background-light/30 hover:bg-verzus-background-light/50'
                } ${!isPlayerTurn() || gameState.gameOver ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => makeMove(rowIndex, colIndex)}
                disabled={!isPlayerTurn() || gameState.gameOver || cell !== ''}
              >
                {cell}
              </button>
            ))
          ))}
        </div>
      </GlassMorphicContainer>
      
      {gameState.gameOver && (
        <div className="text-center mb-6">
          {gameState.winner ? (
            <p className="text-xl font-bold text-white">
              {gameMode === 'ai' ? 
                (gameState.winner === 'X' ? "You won!" : "AI won!") : 
                (gameState.winner === playerSymbol ? "You won!" : "Opponent won!")}
            </p>
          ) : (
            <p className="text-xl font-bold text-white">It's a draw!</p>
          )}
        </div>
      )}
      
      <div className="flex gap-4">
        {gameMode === 'ai' && (
          <Button onClick={restartGame} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Play Again
          </Button>
        )}
        <Button onClick={goToGameList} variant="outline">
          Back to Games
        </Button>
      </div>
    </div>
  );
};

export default TicTacToeGame;
