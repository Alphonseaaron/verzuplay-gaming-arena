
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FeaturedGames from '@/components/FeaturedGames';
import CategorySection from '@/components/CategorySection';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import WalletPreview from '@/components/WalletPreview';
import UserProfilePreview from '@/components/UserProfilePreview';
import { ChevronRight, Gamepad2, Trophy, Users, Zap, Shield, BarChart3 } from 'lucide-react';

// Sample game data
const BOARD_GAMES = [
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
    id: 'ludo',
    title: 'Ludo',
    category: 'Board',
    description: 'Race to the finish in this multiplayer dice-based board game',
    imageSrc: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=600&auto=format&fit=crop',
    playerCount: '7,340 online',
    minStake: 1
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    category: 'Board',
    description: 'The quick, simple game of X and O with infinite rounds',
    imageSrc: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=600&auto=format&fit=crop',
    playerCount: '4,120 online',
    minStake: 1
  }
];

const SKILL_GAMES = [
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
    id: 'temple-run',
    title: 'Temple Run',
    category: 'Skill',
    description: 'Run, jump and slide to escape the temple and set high scores',
    imageSrc: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    playerCount: '5,280 online',
    minStake: 2,
    skill: true
  }
];

const CASINO_GAMES = [
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
    id: 'dice',
    title: 'Roll Dice',
    category: 'Casino',
    description: 'Roll to 50 points but know when to hold your winnings',
    imageSrc: 'https://images.unsplash.com/photo-1595933164690-5ee7e11099a5?q=80&w=600&auto=format&fit=crop',
    playerCount: '6,120 online',
    minStake: 1
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

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-verzus-primary opacity-5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-verzus-accent opacity-5 blur-3xl rounded-full"></div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="animate-slide-up">
                <div className="inline-block bg-verzus-accent/10 text-verzus-accent px-3 py-1 rounded-full text-sm font-medium mb-6">
                  Play. Compete. Win.
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Compete in <span className="text-gradient">Skill-Based</span> Games with Real Stakes
                </h1>
                
                <p className="text-lg text-verzus-text-secondary mb-8 max-w-2xl">
                  VerzusPlay brings together competitive gaming and real-money stakes in one unified platform. Play 20+ games, join tournaments, and win big.
                </p>
                
                <div className="flex flex-wrap gap-4 mb-10">
                  <Link to="/games" className="btn-primary">
                    Explore Games
                  </Link>
                  <Link to="/about" className="btn-outline">
                    Learn More
                  </Link>
                </div>
                
                <div className="flex flex-wrap gap-8">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-verzus-primary/10 flex items-center justify-center mr-3">
                      <Gamepad2 className="text-verzus-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">20+ Games</h3>
                      <p className="text-xs text-verzus-text-secondary">Board, Skill & Casino</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-verzus-primary/10 flex items-center justify-center mr-3">
                      <Trophy className="text-verzus-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Tournaments</h3>
                      <p className="text-xs text-verzus-text-secondary">Daily & Weekly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-verzus-primary/10 flex items-center justify-center mr-3">
                      <Shield className="text-verzus-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Secure Play</h3>
                      <p className="text-xs text-verzus-text-secondary">Fair & Transparent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="animate-slide-down" style={{ animationDelay: '0.2s' }}>
                <UserProfilePreview />
              </div>
              <div className="animate-slide-down" style={{ animationDelay: '0.4s' }}>
                <WalletPreview />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Games */}
      <FeaturedGames />
      
      {/* Game Categories */}
      <CategorySection 
        title="Board & Strategy Games" 
        description="Classic board games with a competitive edge. Test your strategic thinking and planning capabilities."
        games={BOARD_GAMES}
        viewAllLink="/games/category/board"
      />
      
      <CategorySection 
        title="Skill-Based Games" 
        description="Games where your skill makes all the difference. Practice, improve, and win."
        games={SKILL_GAMES}
        viewAllLink="/games/category/skill"
        className="bg-verzus-background-light/50"
      />
      
      <CategorySection 
        title="Casino & Luck Games" 
        description="Try your luck with these casino-style games. Quick play, big rewards."
        games={CASINO_GAMES}
        viewAllLink="/games/category/casino"
      />
      
      {/* How It Works */}
      <section className="py-16 bg-verzus-background-light/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-verzus-accent opacity-5 blur-3xl rounded-full"></div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How VerzusPlay Works</h2>
            <p className="text-verzus-text-secondary max-w-2xl mx-auto">
              VerzusPlay makes competitive gaming simple, fair, and rewarding. Here's how to get started:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassMorphicContainer className="p-6">
              <div className="w-12 h-12 rounded-full bg-verzus-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Users className="text-verzus-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">1. Create Account</h3>
              <p className="text-sm text-verzus-text-secondary text-center">
                Sign up and create your gaming profile to track your stats and earnings.
              </p>
            </GlassMorphicContainer>
            
            <GlassMorphicContainer className="p-6">
              <div className="w-12 h-12 rounded-full bg-verzus-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Wallet className="text-verzus-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">2. Deposit Funds</h3>
              <p className="text-sm text-verzus-text-secondary text-center">
                Add funds to your wallet to start playing for real stakes across all games.
              </p>
            </GlassMorphicContainer>
            
            <GlassMorphicContainer className="p-6">
              <div className="w-12 h-12 rounded-full bg-verzus-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Gamepad2 className="text-verzus-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">3. Choose Games</h3>
              <p className="text-sm text-verzus-text-secondary text-center">
                Pick from our wide selection of games based on your interests and skill level.
              </p>
            </GlassMorphicContainer>
            
            <GlassMorphicContainer className="p-6">
              <div className="w-12 h-12 rounded-full bg-verzus-primary/10 flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="text-verzus-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">4. Win & Withdraw</h3>
              <p className="text-sm text-verzus-text-secondary text-center">
                Win games, climb the leaderboard, and withdraw your earnings anytime.
              </p>
            </GlassMorphicContainer>
          </div>
          
          <div className="text-center mt-10">
            <Link to="/register" className="btn-primary inline-flex items-center">
              Get Started
              <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-verzus-primary/20 to-verzus-accent/10 opacity-60"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Test Your Skills?</h2>
            <p className="text-lg text-verzus-text-primary mb-8">
              Join thousands of players competing in skill-based games with real stakes. Play now and see if you have what it takes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="btn-primary">
                Create Account
              </Link>
              <Link to="/games" className="btn-outline">
                Browse Games
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
