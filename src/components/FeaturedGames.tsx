
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GlassMorphicContainer from './GlassMorphicContainer';
import { ChevronLeft, ChevronRight, Users, Trophy, Zap } from 'lucide-react';

interface FeaturedGame {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  playerCount: string;
  tournaments: number;
  minStake: number;
}

const FEATURED_GAMES: FeaturedGame[] = [
  {
    id: 'chess',
    title: 'Chess',
    description: 'Compete in the classic game of strategy with ELO-based matchmaking',
    imageSrc: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=1200&auto=format&fit=crop',
    playerCount: '10,240 playing',
    tournaments: 8,
    minStake: 5
  },
  {
    id: '8ball',
    title: '8-Ball Pool',
    description: 'Show your skills in the virtual pool table and win big',
    imageSrc: 'https://images.unsplash.com/photo-1615722440048-da4fd9202590?q=80&w=1200&auto=format&fit=crop',
    playerCount: '8,120 playing',
    tournaments: 5,
    minStake: 2
  },
  {
    id: 'crash',
    title: 'Crash',
    description: 'Risk it all in this high-stakes multiplier game',
    imageSrc: 'https://images.unsplash.com/photo-1502570149819-b2260483d302?q=80&w=1200&auto=format&fit=crop',
    playerCount: '12,580 playing',
    tournaments: 3,
    minStake: 1
  }
];

const FeaturedGames = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToPrevSlide = () => {
    const newIndex = activeIndex === 0 ? FEATURED_GAMES.length - 1 : activeIndex - 1;
    goToSlide(newIndex);
  };

  const goToNextSlide = () => {
    const newIndex = activeIndex === FEATURED_GAMES.length - 1 ? 0 : activeIndex + 1;
    goToSlide(newIndex);
  };

  useEffect(() => {
    intervalRef.current = setInterval(goToNextSlide, 6000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeIndex]);

  const resetInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(goToNextSlide, 6000);
    }
  };

  const handlePrevClick = () => {
    goToPrevSlide();
    resetInterval();
  };

  const handleNextClick = () => {
    goToNextSlide();
    resetInterval();
  };

  return (
    <section className="py-16 pb-20 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Games</h2>
            <p className="text-verzus-text-secondary mt-2 max-w-2xl">
              Experience our most popular competitive games with real-money stakes
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button 
              onClick={handlePrevClick}
              className="p-2 rounded-full bg-verzus-background-light text-verzus-text-primary hover:text-verzus-accent hover:bg-verzus-background transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNextClick}
              className="p-2 rounded-full bg-verzus-background-light text-verzus-text-primary hover:text-verzus-accent hover:bg-verzus-background transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="relative h-[500px] overflow-hidden rounded-2xl">
          {FEATURED_GAMES.map((game, index) => (
            <div
              key={game.id}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${game.imageSrc})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-verzus-background via-verzus-background/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="max-w-3xl">
                    <div className="mb-4 flex items-center space-x-4">
                      <span className="bg-verzus-primary/90 text-white text-sm font-bold px-3 py-1 rounded-md backdrop-blur-sm">
                        Featured
                      </span>
                      <span className="flex items-center text-verzus-text-secondary text-sm">
                        <Users size={16} className="mr-2" />
                        {game.playerCount}
                      </span>
                    </div>
                    
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-3">{game.title}</h3>
                    <p className="text-lg text-verzus-text-primary mb-6">{game.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mb-8">
                      <GlassMorphicContainer className="px-4 py-2 flex items-center">
                        <Trophy size={16} className="text-verzus-accent mr-2" />
                        <span className="text-sm">
                          <span className="font-bold text-white">{game.tournaments}</span> Active Tournaments
                        </span>
                      </GlassMorphicContainer>
                      
                      <GlassMorphicContainer className="px-4 py-2 flex items-center">
                        <Zap size={16} className="text-verzus-accent mr-2" />
                        <span className="text-sm">
                          <span className="font-bold text-white">${game.minStake}</span> Minimum Stake
                        </span>
                      </GlassMorphicContainer>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <Link to={`/games/${game.id}`} className="btn-primary">
                        Play Now
                      </Link>
                      <Link to={`/games/${game.id}/tournaments`} className="btn-outline">
                        View Tournaments
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-6">
          {FEATURED_GAMES.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                goToSlide(index);
                resetInterval();
              }}
              className={`w-3 h-3 mx-1 rounded-full transition-colors duration-300 ${
                index === activeIndex ? 'bg-verzus-accent' : 'bg-verzus-text-secondary/30 hover:bg-verzus-text-secondary/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGames;
