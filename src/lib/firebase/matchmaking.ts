
import { database } from './firebase';
import { ref, set, onValue, off, remove, push, get } from 'firebase/database';
import { useAuth } from './AuthContext';

// Interface for a match request
interface MatchRequest {
  userId: string;
  displayName: string;
  gameId: string;
  stake: number;
  timestamp: number;
  skill?: number; // ELO or skill rating for matchmaking
}

// Interface for a match
export interface Match {
  id: string;
  gameId: string;
  players: {
    [userId: string]: {
      displayName: string;
      skill?: number;
    };
  };
  stake: number;
  status: 'waiting' | 'matched' | 'in-progress' | 'completed';
  startTime?: number;
  endTime?: number;
  winner?: string;
}

// Create a match request
export const createMatchRequest = async (
  gameId: string, 
  stake: number, 
  skill?: number
): Promise<string> => {
  const auth = useAuth();
  
  if (!auth.user) {
    throw new Error('User must be logged in to create a match request');
  }
  
  const matchRequestRef = push(ref(database, 'matchRequests'));
  const matchRequest: MatchRequest = {
    userId: auth.user.uid,
    displayName: auth.user.displayName || 'Unknown Player',
    gameId,
    stake,
    timestamp: Date.now(),
    skill
  };
  
  await set(matchRequestRef, matchRequest);
  return matchRequestRef.key || '';
};

// Listen for match
export const listenForMatch = (
  requestId: string,
  onMatched: (match: Match) => void
): () => void => {
  const matchRef = ref(database, `matches/${requestId}`);
  
  const handleMatch = (snapshot: any) => {
    const match = snapshot.val();
    if (match && match.status === 'matched') {
      onMatched(match);
    }
  };
  
  onValue(matchRef, handleMatch);
  
  // Return a function to unsubscribe
  return () => off(matchRef, 'value', handleMatch);
};

// Cancel a match request
export const cancelMatchRequest = async (requestId: string): Promise<void> => {
  const auth = useAuth();
  
  if (!auth.user) {
    throw new Error('User must be logged in to cancel a match request');
  }
  
  const requestRef = ref(database, `matchRequests/${requestId}`);
  const snapshot = await get(requestRef);
  const request = snapshot.val();
  
  if (!request || request.userId !== auth.user.uid) {
    throw new Error('Cannot cancel: request not found or not owned by user');
  }
  
  await remove(requestRef);
};

// Update match status
export const updateMatchStatus = async (
  matchId: string, 
  status: Match['status'],
  winner?: string
): Promise<void> => {
  const auth = useAuth();
  
  if (!auth.user) {
    throw new Error('User must be logged in to update a match');
  }
  
  const matchRef = ref(database, `matches/${matchId}`);
  
  // First, get the current match data
  const snapshot = await get(matchRef);
  const match: Match = snapshot.val();
  
  if (!match) {
    throw new Error('Match not found');
  }
  
  // Check if user is part of this match
  if (!match.players[auth.user.uid]) {
    throw new Error('User is not a participant in this match');
  }
  
  // Update the match status and other relevant fields
  const updates: Partial<Match> = { status };
  
  if (status === 'in-progress' && !match.startTime) {
    updates.startTime = Date.now();
  }
  
  if (status === 'completed') {
    updates.endTime = Date.now();
    if (winner) {
      updates.winner = winner;
    }
  }
  
  await set(matchRef, { ...match, ...updates });
};
