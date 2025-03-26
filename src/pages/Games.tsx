import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GameCard from '@/components/GameCard';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Gamepad2, ChessKnight, Rows3, Trophy, Hash, Dice5, Joystick } from 'lucide-react';

// Sample game data
const ALL_GAMES = [
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    category: 'Board',
    description: 'The quick, simple game of X and O with infinite rounds',
    imageSrc: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=600&auto=format&fit=crop',
    playerCount: '4,120 online',
    minStake: 1,
    skill: true
  },
  {
    id: 'chess',
    title: 'Chess',
    category: 'Board',
    description: 'The classic strategy game with ELO ranking and global tournaments',
    imageSrc: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=600&auto=format&fit=crop',
    playerCount: '10,240 online',
    minStake: 5,
    skill: true
  },
  {
    id: 'checkers',
    title: 'Checkers',
    category: 'Board',
    description: 'Test your tactics in this fast-paced board game classic',
    imageSrc: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?q=80&w=600&auto=format&fit=crop',
    playerCount: '5,180 online',
    minStake: 2,
    skill: true
  },
  {
    id: 'connect-four',
    title: 'Connect Four',
    category: 'Board',
    description: 'Connect four of your discs in a row to win',
    imageSrc: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=600&auto=format&fit=crop',
    playerCount: '3,560 online',
    minStake: 2,
    skill: true
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    category: 'Board',
    description: 'Fill the grid with numbers, racing against your opponent',
    imageSrc: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=600&auto=format&fit=crop',
    playerCount: '2,890 online',
    minStake: 2,
    skill: true
  },
  {
    id: '8-ball-pool',
    title: '8-Ball Pool',
    category: 'Skill',
    description: 'Show your skill on the virtual pool table and win big',
    imageSrc: 'https://images.unsplash.com/photo-1615722440048-da4fd9202590?q=80&w=600&auto=format&fit=crop',
    playerCount: '8,120 online',
    minStake: 2,
    skill: true
  },
  {
    id: 'snake',
    title: 'Snake',
    category: 'Skill',
    description: 'Grow your snake and survive longer than your opponent',
    imageSrc: 'https://images.unsplash.com/photo-1642818656822-63900429a80f?q=80&w=600&auto=format&fit=crop',
    playerCount: '3,460 online',
    minStake: 1,
    skill: true
  },
  {
    id: 'tetris',
    title: 'Tetris',
    category: 'Skill',
    description: 'Stack blocks and clear lines to score points and survive',
    imageSrc: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?q=80&w=600&auto=format&fit=crop',
    playerCount: '6,970 online',
    minStake: 2,
    skill: true
  },
  {
    id: 'dice',
    title: 'Roll Dice',
    category: 'Casino',
    description: 'Roll to 50 points but know when to hold your winnings',
    imageSrc: 'https://images.unsplash.com/photo-1595933164690-5ee7e11099a5?q=80&w=600&auto=format&fit=crop',
    playerCount: '6,120 online',
    minStake: 1
  },
  {
    id: 'crash',
    title: 'Crash',
    category: 'Casino',
    description: 'Risk it all in this high-stakes multiplier game',
    imageSrc: 'https://images.unsplash.com/photo-1502570149819-b2260483d302?q=80&w=600&auto=format&fit=crop',
    playerCount: '12,580 online',
    minStake: 1
  },
  {
    id: 'slots',
    title: 'Slots',
    category: 'Casino',
    description: 'Classic slot machine with multiple paylines and bonus features',
    imageSrc: 'https://images.unsplash.com/photo-1619677104852-9108c06643a5?q=80&w=600&auto=format&fit=crop',
    playerCount: '9,760 online',
    minStake: 0.5
  },
  {
    id: 'rps',
    title: 'Rock Paper Scissors',
    category: 'Casino',
    description: 'The classic game of chance with a twist - best of 10 rounds',
    imageSrc: 'https://images.unsplash.com/photo-1509105494275-ec9d8b62pLg9?q=80&w=600&auto=format&fit=crop',
    playerCount: '4,350 online',
    minStake: 1
  }
];

// Game categories
const CATEGORIES = [
  { id: 'all', name: 'All Games', icon: Gamepad2 },
  { id: 'board', name: 'Board Games', icon: ChessKnight },
  { id: 'skill', name: 'Skill Games', icon: Trophy },
  { id: 'casino', name: 'Casino Games', icon: Dice5 },
  { id: 'new', name: 'New Games', icon: Joystick }
];

const Games = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter games based on active category and search query
  const filteredGames = ALL_GAMES.filter(game => {
    const matchesCategory = activeCategory === 'all' || 
                            game.category.toLowerCase() === activeCategory;
    
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Games</h1>
            <p className="text-verzus-text-secondary">Discover and play a variety of competitive games</p>
          </div>
          
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-verzus-background-light border-verzus-border pl-10 w-full md:w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-verzus-text-secondary w-4 h-4" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto mb-8">
          <div className="flex space-x-2 min-w-max">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon size={16} />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
        
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        ) : (
          <GlassMorphicContainer className="p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No games found</h3>
            <p className="text-verzus-text-secondary">
              Try adjusting your search or category filter
            </p>
          </GlassMorphicContainer>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Games;
