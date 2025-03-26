
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Games from "./pages/Games";
import GameDetails from "./pages/GameDetails";
import TicTacToeGame from "./games/TicTacToe/TicTacToeGame";
import ChessGame from "./games/Chess/ChessGame";
import CheckersGame from "./games/Checkers/CheckersGame";
import ConnectFourGame from "./games/ConnectFour/ConnectFourGame";
import SudokuGame from "./games/Sudoku/SudokuGame";
import EightBallPoolGame from "./games/EightBallPool/EightBallPoolGame";
import SnakeGame from "./games/Snake/SnakeGame";
import TetrisGame from "./games/Tetris/TetrisGame";
import DiceGame from "./games/Dice/DiceGame";
import CrashGame from "./games/Crash/CrashGame";
import SlotsGame from "./games/Slots/SlotsGame";
import RockPaperScissorsGame from "./games/RockPaperScissors/RockPaperScissorsGame";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./lib/firebase/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<GameDetails />} />
            <Route path="/games/tic-tac-toe/play" element={<TicTacToeGame />} />
            <Route path="/games/tic-tac-toe/match/:matchId" element={<TicTacToeGame />} />
            <Route path="/games/chess/play" element={<ChessGame />} />
            <Route path="/games/chess/match/:matchId" element={<ChessGame />} />
            <Route path="/games/checkers/play" element={<CheckersGame />} />
            <Route path="/games/checkers/match/:matchId" element={<CheckersGame />} />
            <Route path="/games/connect-four/play" element={<ConnectFourGame />} />
            <Route path="/games/connect-four/match/:matchId" element={<ConnectFourGame />} />
            <Route path="/games/sudoku/play" element={<SudokuGame />} />
            <Route path="/games/sudoku/match/:matchId" element={<SudokuGame />} />
            <Route path="/games/8-ball-pool/play" element={<EightBallPoolGame />} />
            <Route path="/games/8-ball-pool/match/:matchId" element={<EightBallPoolGame />} />
            <Route path="/games/snake/play" element={<SnakeGame />} />
            <Route path="/games/snake/match/:matchId" element={<SnakeGame />} />
            <Route path="/games/tetris/play" element={<TetrisGame />} />
            <Route path="/games/tetris/match/:matchId" element={<TetrisGame />} />
            <Route path="/games/dice/play" element={<DiceGame />} />
            <Route path="/games/dice/match/:matchId" element={<DiceGame />} />
            <Route path="/games/crash/play" element={<CrashGame />} />
            <Route path="/games/crash/match/:matchId" element={<CrashGame />} />
            <Route path="/games/slots/play" element={<SlotsGame />} />
            <Route path="/games/slots/match/:matchId" element={<SlotsGame />} />
            <Route path="/games/rps/play" element={<RockPaperScissorsGame />} />
            <Route path="/games/rps/match/:matchId" element={<RockPaperScissorsGame />} />
            <Route path="/games/category/:category" element={<Games />} />
            <Route path="/tournaments" element={<Index />} />
            <Route path="/leaderboard" element={<Index />} />
            <Route path="/wallet" element={<Index />} />
            <Route path="/about" element={<Index />} />
            <Route path="/register" element={<Index />} />
            <Route path="/login" element={<Index />} />
            <Route path="/profile" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
