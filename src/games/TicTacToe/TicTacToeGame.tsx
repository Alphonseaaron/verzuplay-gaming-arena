import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database } from '@/lib/firebase/firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { useAuth } from '@/lib/firebase/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Copy, RefreshCw, ArrowLeft, X, Circle } from 'lucide-react';

interface TicTacToeState {
  board: string[][];
  currentPlayer: "X" | "O";
  winner: string;
  gameOver: boolean;
}

const TicTacToeGame = () => {
  const { id, matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<TicTacToeState>({
    board: [['', '', ''], ['', '', ''], ['', '', '']],
    currentPlayer: "X",
    winner: '',
    gameOver: false
  });
  const [isMultiplayer, setIsMultiplayer] = useState(!!matchId);
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O">("X");
  const [opponent, setOpponent] = useState<string>("");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [invitation, setInvitation] = useState("");

  useEffect(() => {
    if (matchId) {
      // Connect to the Firebase match
      const matchRef = ref(database, `matches/${matchId}`);
      
      onValue(matchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGameState({
            board: data.board || [['', '', ''], ['', '', ''], ['', '', '']],
            currentPlayer: data.currentPlayer || "X",
            winner: data.winner || '',
            gameOver: data.gameOver || false
          });
          
          if (user) {
            // Determine player's symbol
            if (data.playerX === user.uid) {
              setPlayerSymbol("X");
              setOpponent(data.playerO || "Waiting for opponent");
              setIsPlayerTurn(data.currentPlayer === "X");
            } else if (data.playerO === user.uid) {
              setPlayerSymbol("O");
              setOpponent(data.playerX || "Unknown");
              setIsPlayerTurn(data.currentPlayer === "O");
            }
          }
        }
      });
      
      // Generate invite link
      const inviteUrl = `${window.location.origin}/games/${id}/match/${matchId}`;
      setInvitation(inviteUrl);
    }
  }, [matchId, user, id]);
  
  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // If the cell is already occupied, game is over, or not player's turn in multiplayer
    if (gameState.board[row][col] || gameState.gameOver || (isMultiplayer && !isPlayerTurn)) {
      return;
    }
    
    const newBoard = [...gameState.board.map(r => [...r])];
    newBoard[row][col] = isMultiplayer ? playerSymbol : gameState.currentPlayer;
    
    // In multiplayer, update Firebase
    if (isMultiplayer && matchId) {
      const nextPlayer: "X" | "O" = playerSymbol === "X" ? "O" : "X";
      
      const matchRef = ref(database, `matches/${matchId}`);
      get(matchRef).then((snapshot) => {
        const data = snapshot.val();
        if (data) {
          const updatedState = {
            ...data,
            board: newBoard,
            currentPlayer: nextPlayer,
          };
          
          // Check for winner
          const winner = checkWinner(newBoard);
          if (winner) {
            updatedState.winner = winner;
            updatedState.gameOver = true;
          } else if (isBoardFull(newBoard)) {
            updatedState.gameOver = true;
          }
          
          set(matchRef, updatedState);
        }
      });
    } else {
      // Single player mode
      const nextPlayer: "X" | "O" = gameState.currentPlayer === "X" ? "O" : "X";
      
      setGameState(prevState => ({
        ...prevState,
        board: newBoard,
        currentPlayer: nextPlayer
      }));
      
      // Check for winner
      const winner = checkWinner(newBoard);
      if (winner) {
        setGameState(prevState => ({
          ...prevState,
          winner,
          gameOver: true
        }));
        return;
      }
      
      // Check for draw
      if (isBoardFull(newBoard)) {
        setGameState(prevState => ({
          ...prevState,
          gameOver: true
        }));
        return;
      }
      
      // AI move
      if (!isMultiplayer) {
        setTimeout(() => {
          const aiMove = findBestMove(newBoard);
          if (aiMove) {
            const aiBoard = [...newBoard.map(r => [...r])];
            aiBoard[aiMove.row][aiMove.col] = nextPlayer;
            
            const aiNextPlayer: "X" | "O" = nextPlayer === "X" ? "O" : "X";
            
            setGameState({
              board: aiBoard,
              currentPlayer: aiNextPlayer,
              winner: checkWinner(aiBoard) || '',
              gameOver: checkWinner(aiBoard) ? true : isBoardFull(aiBoard)
            });
          }
        }, 500);
      }
    }
  };
  
  // Reset the game
  const resetGame = () => {
    if (isMultiplayer && matchId) {
      const matchRef = ref(database, `matches/${matchId}`);
      set(matchRef, {
        board: [['', '', ''], ['', '', ''], ['', '', '']],
        currentPlayer: "X",
        winner: '',
        gameOver: false,
        playerX: user?.uid,
        playerO: opponent === "Waiting for opponent" ? null : opponent
      });
    } else {
      setGameState({
        board: [['', '', ''], ['', '', ''], ['', '', '']],
        currentPlayer: "X",
        winner: '',
        gameOver: false
      });
    }
  };
  
  // Copy invitation link
  const copyInvite = () => {
    navigator.clipboard.writeText(invitation);
    toast({
      title: "Invitation copied!",
      description: "Share this link with a friend to play together.",
    });
  };
  
  // AI functions
  function findBestMove(board: string[][]): { row: number, col: number } | null {
    let bestScore = -Infinity;
    let move = null;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === '') {
          board[i][j] = 'O'; // AI is O
          let score = minimax(board, 0, false);
          board[i][j] = ''; // Undo the move
          
          if (score > bestScore) {
            bestScore = score;
            move = { row: i, col: j };
          }
        }
      }
    }
    
    return move;
  }
  
  function minimax(board: string[][], depth: number, isMaximizing: boolean): number {
    const winner = checkWinner(board);
    
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (isBoardFull(board)) return 0;
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === '') {
            board[i][j] = 'O';
            let score = minimax(board, depth + 1, false);
            board[i][j] = '';
            bestScore = Math.max(score, bestScore);
          }
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === '') {
            board[i][j] = 'X';
            let score = minimax(board, depth + 1, true);
            board[i][j] = '';
            bestScore = Math.min(score, bestScore);
          }
        }
      }
      return bestScore;
    }
  }
  
  // Check if there's a winner
  function checkWinner(board: string[][]): string {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
        return board[i][0];
      }
    }
    
    // Check columns
    for (let j = 0; j < 3; j++) {
      if (board[0][j] && board[0][j] === board[1][j] && board[0][j] === board[2][j]) {
        return board[0][j];
      }
    }
    
    // Check diagonals
    if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
      return board[0][0];
    }
    
    if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
      return board[0][2];
    }
    
    return '';
  }
  
  // Check if the board is full (draw)
  function isBoardFull(board: string[][]): boolean {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === '') {
          return false;
        }
      }
    }
    return true;
  }
  
  // Render cell content with better visuals
  const renderCellContent = (cell: string) => {
    if (cell === 'X') {
      return <X className="h-10 w-10 text-verzus-accent stroke-[3]" />;
    } else if (cell === 'O') {
      return <Circle className="h-10 w-10 text-verzus-warning stroke-[3]" />;
    }
    return null;
  };
  
  // Helper function to determine if a cell is part of the winning line
  function isPartOfWinningLine(row: number, col: number, board: string[][]): boolean {
    const symbol = board[row][col];
    if (!symbol) return false;
    
    // Check row
    if (board[row][0] === symbol && board[row][1] === symbol && board[row][2] === symbol) {
      return true;
    }
    
    // Check column
    if (board[0][col] === symbol && board[1][col] === symbol && board[2][col] === symbol) {
      return true;
    }
    
    // Check diagonals
    if (row === col && board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) {
      return true;
    }
    
    if (row + col === 2 && board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol) {
      return true;
    }
    
    return false;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <Button 
          variant="outline" 
          onClick={() => navigate('/games')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <GlassMorphicContainer className="p-8">
              <h1 className="text-3xl font-bold mb-6 text-center text-white">Tic-Tac-Toe</h1>
              
              <div className="w-full max-w-xs mx-auto">
                <div className="grid grid-cols-3 gap-4">
                  {gameState.board.map((row, rowIndex) => (
                    row.map((cell, colIndex) => {
                      // Determine if this cell is part of the winning line
                      const isWinningCell = gameState.winner && isPartOfWinningLine(rowIndex, colIndex, gameState.board);
                      
                      return (
                        <div 
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            aspect-square flex items-center justify-center 
                            text-4xl font-bold rounded-lg border-2
                            ${isWinningCell ? 'border-verzus-success bg-verzus-success/20' : 'border-verzus-background-light'}
                            ${cell ? 'bg-verzus-background-secondary/70' : 'bg-verzus-background-secondary hover:bg-verzus-background-light/50 cursor-pointer'}
                            ${(!isPlayerTurn && isMultiplayer && !cell) ? 'cursor-not-allowed' : ''}
                            transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1
                          `}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {renderCellContent(cell)}
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>
              
              {gameState.gameOver && (
                <div className="mt-8 text-center animate-slide-up">
                  <h2 className="text-2xl font-bold mb-4 text-white">
                    {gameState.winner ? (
                      <span className="text-gradient">
                        {gameState.winner === 'X' ? (
                          <span className="text-verzus-accent">X</span>
                        ) : (
                          <span className="text-verzus-warning">O</span>
                        )} Wins!
                      </span>
                    ) : (
                      <span className="text-verzus-text-primary">It's a Draw!</span>
                    )}
                  </h2>
                  <Button onClick={resetGame} className="flex items-center bg-verzus-primary hover:bg-verzus-primary/80">
                    <RefreshCw className="mr-2 h-4 w-4" /> Play Again
                  </Button>
                </div>
              )}
              
              {!gameState.gameOver && (
                <div className="mt-6 text-center text-white">
                  <div className="flex items-center justify-center gap-2 font-bold">
                    {isMultiplayer ? (
                      isPlayerTurn ? (
                        <div className="bg-verzus-primary/20 py-2 px-4 rounded-full animate-pulse-soft">
                          Your turn
                        </div>
                      ) : (
                        <div className="bg-verzus-background-light/40 py-2 px-4 rounded-full">
                          Opponent's turn
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2">
                        Current turn: 
                        <span className={gameState.currentPlayer === 'X' ? 'text-verzus-accent' : 'text-verzus-warning'}>
                          {gameState.currentPlayer === 'X' ? (
                            <X className="h-5 w-5 inline-block stroke-[3]" />
                          ) : (
                            <Circle className="h-5 w-5 inline-block stroke-[3]" />
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </GlassMorphicContainer>
          </div>
          
          <div>
            <GlassMorphicContainer className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-white">Game Info</h2>
              
              {isMultiplayer ? (
                <>
                  <div className="mb-4">
                    <p className="text-verzus-text-secondary mb-1">Your symbol</p>
                    <p className="text-white font-bold text-xl flex items-center">
                      {playerSymbol === 'X' ? (
                        <X className="h-6 w-6 text-verzus-accent stroke-[3] mr-2" />
                      ) : (
                        <Circle className="h-6 w-6 text-verzus-warning stroke-[3] mr-2" />
                      )}
                      {playerSymbol}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-verzus-text-secondary mb-1">Opponent</p>
                    <p className="text-white">{opponent}</p>
                  </div>
                  
                  {opponent === "Waiting for opponent" && (
                    <div className="mt-4">
                      <p className="text-verzus-text-secondary mb-2">Invite a friend:</p>
                      <div className="flex">
                        <Button variant="outline" className="w-full mr-2 text-sm truncate" disabled>
                          {invitation.slice(0, 20)}...
                        </Button>
                        <Button onClick={copyInvite} variant="default" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-verzus-text-secondary mb-4">
                    You're playing against an unbeatable AI. 
                    Good luck trying to win!
                  </p>
                  
                  <div className="mb-4">
                    <p className="text-verzus-text-secondary mb-1">Your symbol</p>
                    <p className="text-white font-bold text-xl flex items-center">
                      <X className="h-6 w-6 text-verzus-accent stroke-[3] mr-2" />
                      X
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-verzus-text-secondary mb-1">AI symbol</p>
                    <p className="text-white font-bold text-xl flex items-center">
                      <Circle className="h-6 w-6 text-verzus-warning stroke-[3] mr-2" />
                      O
                    </p>
                  </div>
                </>
              )}
            </GlassMorphicContainer>
            
            <GlassMorphicContainer className="p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Rules</h2>
              <ul className="list-disc list-inside text-verzus-text-secondary space-y-2">
                <li>Get three of your symbols in a row (horizontally, vertically, or diagonally) to win</li>
                <li>X always goes first</li>
                <li>If all cells are filled and no one has won, the game is a draw</li>
              </ul>
            </GlassMorphicContainer>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TicTacToeGame;
