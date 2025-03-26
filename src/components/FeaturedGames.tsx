
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import GameCard from './GameCard';

// Sample featured games data
const FEATURED_GAMES = [
  {
    id: 'chess',
    title: 'Chess',
    category: 'Board',
    description: 'The classic strategy game with ELO ranking and global tournaments',
    imageSrc: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=600&auto=format&fit=crop',
    playerCount: '10,240 online',
    minStake: 5,
    featured: true,
    skill: true
  },
  {
    id: 'crash',
    title: 'Crash',
    category: 'Casino',
    description: 'Risk it all in this high-stakes multiplier game',
    imageSrc: 'https://images.unsplash.com/photo-1502570149819-b2260483d302?q=80&w=600&auto=format&fit=crop',
    playerCount: '12,580 online',
    minStake: 1,
    featured: true
  },
  {
    id: '8-ball-pool',
    title: '8-Ball Pool',
    category: 'Skill',
    description: 'Show your skill on the virtual pool table and win big',
    imageSrc: 'https://images.unsplash.com/photo-1615722440048-da4fd9202590?q=80&w=600&auto=format&fit=crop',
    playerCount: '8,120 online',
    minStake: 2,
    featured: true,
    skill: true
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    category: 'Board',
    description: 'The quick, simple game of X and O with infinite rounds',
    imageSrc: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=600&auto=format&fit=crop',
    playerCount: '4,120 online',
    minStake: 1,
    featured: true,
    skill: true
  }
];

const FeaturedGames = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Games</h2>
            <p className="text-verzus-text-secondary mt-2">Play our most popular games with real stakes</p>
          </div>
          <Link
            to="/games"
            className="group inline-flex items-center text-verzus-text-accent hover:text-verzus-accent transition-colors duration-300"
          >
            <span>View All</span>
            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {FEATURED_GAMES.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGames;
