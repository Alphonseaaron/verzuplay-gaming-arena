
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/firebase/AuthContext';
import { createMatchRequest, createGameInvite } from '@/lib/firebase/matchmaking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlassMorphicContainer from '@/components/GlassMorphicContainer';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  Brain, 
  UserPlus, 
  Info, 
  DollarSign,
  Loader2
} from 'lucide-react';

// Game data mapping
const GAMES = {
  'tic-tac-toe': {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    category: 'Board',
    description: 'The quick, simple game of X and O with infinite rounds',
    imageSrc: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=600&auto=format&fit=crop',
    playerCount: '4,120 online',
    minStake: 1,
    rules: [
      'Players take turns placing X or O on a 3x3 grid',
      'First player to get 3 in a row (horizontally, vertically, or diagonally) wins',
      'If all spaces are filled with no winner, the game is a draw'
    ],
    skillBased: true
  },
  'chess': {
    id: 'chess',
    title: 'Chess',
    category: 'Board',
    description: 'The classic strategy game with ELO ranking and global tournaments',
    imageSrc: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=600&auto=format&fit=crop',
    playerCount: '10,240 online',
    minStake: 5,
    rules: [
      'Players take turns moving their pieces on an 8x8 grid',
      'Each piece has its own movement pattern',
      'Capture opponent pieces by landing on their square',
      'Game ends when a player\'s king is in checkmate'
    ],
    skillBased: true
  },
  'connect-four': {
    id: 'connect-four',
    title: 'Connect Four',
    category: 'Board',
    description: 'Connect four of your discs in a row while preventing your opponent from doing the same',
    imageSrc: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=600&auto=format&fit=crop',
    playerCount: '3,560 online',
    minStake: 2,
    rules: [
      'Players take turns dropping colored discs into a 7x6 grid',
      'Discs fall to the lowest available space in each column',
      'First player to connect four discs in a row (horizontally, vertically, or diagonally) wins',
      'If the grid fills up with no winner, the game is a draw'
    ],
    skillBased: true
  }
};

const GameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [stake, setStake] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  
  // Get game data
  const game = id ? GAMES[id as keyof typeof GAMES] : null;
  
  if (!game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Game Not Found</h1>
            <p className="text-verzus-text-secondary mb-6">The game you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/games')}>Back to Games</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Handle play against AI
  const handlePlayAI = () => {
    navigate(`/games/${id}/play`);
  };
  
  // Handle find match
  const handleFindMatch = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to find a match.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCreatingMatch(true);
      const matchRequestId = await createMatchRequest(id!, stake);
      
      toast({
        title: "Looking for a match",
        description: "We'll notify you when we find an opponent.",
      });
      
      // Navigate to waiting room (to be implemented)
      navigate(`/games/${id}/match/${matchRequestId}`);
    } catch (error) {
      console.error("Error creating match request:", error);
      toast({
        title: "Error",
        description: "Failed to create match request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingMatch(false);
    }
  };
  
  // Handle invite friend
  const handleInviteFriend = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to invite a friend.",
        variant: "destructive",
      });
      return;
    }
    
    if (!inviteEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your friend's email address.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSendingInvite(true);
      const inviteId = await createGameInvite(id!, stake, inviteEmail);
      
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}. We'll notify you when they respond.`,
      });
      
      setInviteEmail('');
    } catch (error) {
      console.error("Error sending game invite:", error);
      toast({
        title: "Error",
        description: "Failed to send game invite. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingInvite(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Game Info */}
          <div className="md:col-span-2">
            <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden mb-6">
              <img 
                src={game.imageSrc} 
                alt={game.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-verzus-background to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-xs font-medium text-verzus-text-secondary bg-verzus-background-light/70 backdrop-blur-sm px-2 py-0.5 rounded-full mb-2 inline-block">
                  {game.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{game.title}</h1>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <GlassMorphicContainer className="p-4 flex items-center">
                <Users className="w-5 h-5 text-verzus-primary mr-3" />
                <div>
                  <p className="text-xs text-verzus-text-secondary">Players</p>
                  <p className="text-white font-medium">{game.playerCount}</p>
                </div>
              </GlassMorphicContainer>
              
              <GlassMorphicContainer className="p-4 flex items-center">
                <DollarSign className="w-5 h-5 text-verzus-primary mr-3" />
                <div>
                  <p className="text-xs text-verzus-text-secondary">Min Stake</p>
                  <p className="text-white font-medium">${game.minStake}</p>
                </div>
              </GlassMorphicContainer>
              
              <GlassMorphicContainer className="p-4 flex items-center">
                {game.skillBased ? (
                  <Brain className="w-5 h-5 text-verzus-primary mr-3" />
                ) : (
                  <Zap className="w-5 h-5 text-verzus-primary mr-3" />
                )}
                <div>
                  <p className="text-xs text-verzus-text-secondary">Game Type</p>
                  <p className="text-white font-medium">{game.skillBased ? 'Skill-Based' : 'Luck-Based'}</p>
                </div>
              </GlassMorphicContainer>
            </div>
            
            <GlassMorphicContainer className="p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">About {game.title}</h2>
              <p className="text-verzus-text-secondary mb-6">{game.description}</p>
              
              <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Rules
              </h3>
              <ul className="list-disc list-inside text-verzus-text-secondary space-y-1">
                {game.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </GlassMorphicContainer>
          </div>
          
          {/* Play Options */}
          <div>
            <GlassMorphicContainer className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Play Options</h2>
              
              <div className="space-y-6">
                <div>
                  <Button
                    onClick={handlePlayAI}
                    className="w-full flex items-center justify-center gap-2 mb-2"
                  >
                    <Brain size={18} />
                    Play Against AI
                  </Button>
                  <p className="text-xs text-verzus-text-secondary text-center">
                    Practice mode with no stakes
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-2">Find a Match</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="stake" className="text-verzus-text-secondary mb-1 block">
                        Stake Amount ($)
                      </Label>
                      <Input
                        id="stake"
                        type="number"
                        min={game.minStake}
                        value={stake}
                        onChange={e => setStake(Number(e.target.value))}
                        className="bg-verzus-background-light text-white border-verzus-border"
                      />
                    </div>
                    <Button
                      onClick={handleFindMatch}
                      className="w-full flex items-center justify-center gap-2"
                      disabled={isCreatingMatch || !user}
                    >
                      {isCreatingMatch ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Users size={18} />
                      )}
                      Find Opponent
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-2">Invite a Friend</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="email" className="text-verzus-text-secondary mb-1 block">
                        Friend's Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="friend@example.com"
                        className="bg-verzus-background-light text-white border-verzus-border"
                      />
                    </div>
                    <Button
                      onClick={handleInviteFriend}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      disabled={isSendingInvite || !user}
                    >
                      {isSendingInvite ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <UserPlus size={18} />
                      )}
                      Send Invite
                    </Button>
                  </div>
                </div>
                
                {!user && (
                  <div className="bg-verzus-primary/10 border border-verzus-primary/20 rounded-lg p-3">
                    <p className="text-sm text-center text-verzus-text-primary">
                      Please <span className="text-verzus-primary font-medium cursor-pointer" onClick={() => navigate('/login')}>login</span> or <span className="text-verzus-primary font-medium cursor-pointer" onClick={() => navigate('/register')}>register</span> to play with real stakes
                    </p>
                  </div>
                )}
              </div>
            </GlassMorphicContainer>
            
            <GlassMorphicContainer className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Leaderboard</h2>
              <p className="text-verzus-text-secondary text-center">
                Leaderboard will be available soon.
              </p>
            </GlassMorphicContainer>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default GameDetails;
