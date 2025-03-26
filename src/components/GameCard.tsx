
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassMorphicContainer from './GlassMorphicContainer';
import { Users, Award, Zap } from 'lucide-react';

interface GameCardProps {
  id: string;
  title: string;
  category: string;
  description: string;
  imageSrc: string;
  playerCount: string;
  minStake: number;
  featured?: boolean;
  skill?: boolean;
  type?: 'vertical' | 'horizontal';
}

const GameCard = ({
  id,
  title,
  category,
  description,
  imageSrc,
  playerCount,
  minStake,
  featured = false,
  skill = false,
  type = 'vertical'
}: GameCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  if (type === 'horizontal') {
    return (
      <Link to={`/games/${id}`}>
        <GlassMorphicContainer 
          className="flex h-32 overflow-hidden transition-all duration-300 hover:shadow-card-hover"
          hoverEffect
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="w-1/3 bg-cover bg-center" 
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
          <div className="w-2/3 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-verzus-text-secondary bg-verzus-background-light px-2 py-0.5 rounded-full">
                  {category}
                </span>
                {skill && (
                  <span className="text-xs font-medium flex items-center gap-1 text-yellow-400">
                    <Award size={12} /> Skill
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-white">{title}</h3>
              <p className="text-xs text-verzus-text-secondary truncate-2 mt-1">{description}</p>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center text-xs text-verzus-text-secondary">
                <Users size={12} className="mr-1" />
                <span>{playerCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={14} className="text-verzus-accent" />
                <span className="text-verzus-text-accent font-medium">${minStake}</span>
              </div>
            </div>
          </div>
        </GlassMorphicContainer>
      </Link>
    );
  }

  return (
    <Link to={`/games/${id}`}>
      <GlassMorphicContainer 
        className="overflow-hidden transition-all duration-300 hover:shadow-card-hover"
        hoverEffect
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageSrc} 
            alt={title} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          {featured && (
            <div className="absolute top-3 left-3 bg-verzus-primary/90 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
              Featured
            </div>
          )}
          {skill && (
            <div className="absolute top-3 right-3 bg-yellow-500/90 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
              <Award size={12} /> Skill
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white">{title}</h3>
            <span className="text-xs font-medium text-verzus-text-secondary bg-verzus-background-light px-2 py-0.5 rounded-full">
              {category}
            </span>
          </div>
          <p className="text-sm text-verzus-text-secondary truncate-2 mb-3">{description}</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-verzus-text-secondary">
              <Users size={12} className="mr-1" />
              <span>{playerCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={14} className="text-verzus-accent" />
              <span className="text-verzus-text-accent font-medium">${minStake}</span>
            </div>
          </div>
        </div>
      </GlassMorphicContainer>
    </Link>
  );
};

export default GameCard;
