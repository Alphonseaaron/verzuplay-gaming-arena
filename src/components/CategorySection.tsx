
import React from 'react';
import { Link } from 'react-router-dom';
import GameCard from './GameCard';
import { ChevronRight } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  category: string;
  description: string;
  imageSrc: string;
  playerCount: string;
  minStake: number;
  featured?: boolean;
  skill?: boolean;
}

interface CategorySectionProps {
  title: string;
  description?: string;
  games: Game[];
  viewAllLink: string;
  className?: string;
}

const CategorySection = ({
  title,
  description,
  games,
  viewAllLink,
  className = '',
}: CategorySectionProps) => {
  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
            {description && (
              <p className="text-verzus-text-secondary mt-2 max-w-2xl">{description}</p>
            )}
          </div>
          <Link
            to={viewAllLink}
            className="group mt-4 md:mt-0 inline-flex items-center text-verzus-text-accent hover:text-verzus-accent transition-colors duration-300"
          >
            <span>View All</span>
            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
