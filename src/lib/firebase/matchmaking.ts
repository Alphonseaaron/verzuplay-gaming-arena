
import { database } from './firebase';
import { ref, set, onValue, off, remove, push, get, update } from 'firebase/database';
import { useAuth } from './AuthContext';

// Interface for a match request
export interface MatchRequest {
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
  gameState?: any; // Game-specific state
  currentTurn?: string; // User ID of the player whose turn it is
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

// Create a direct game invite
export const createGameInvite = async (
  gameId: string,
  stake: number,
  inviteeEmail: string
): Promise<string> => {
  const auth = useAuth();
  
  if (!auth.user) {
    throw new Error('User must be logged in to create a game invite');
  }
  
  const inviteRef = push(ref(database, 'gameInvites'));
  const invite = {
    senderId: auth.user.uid,
    senderName: auth.user.displayName || 'Unknown Player',
    inviteeEmail,
    gameId,
    stake,
    timestamp: Date.now(),
    status: 'pending'
  };
  
  await set(inviteRef, invite);
  return inviteRef.key || '';
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

// Listen for game invites
export const listenForGameInvites = (
  onInvite: (invite: any) => void
): () => void => {
  const auth = useAuth();
  
  if (!auth.user) {
    throw new Error('User must be logged in to listen for game invites');
  }
  
  // Query invites where inviteeEmail matches user email
  const invitesRef = ref(database, 'gameInvites');
  
  const handleInvites = (snapshot: any) => {
    const invites = snapshot.val();
    if (invites) {
      Object.entries(invites).forEach(([key, invite]: [string, any]) => {
        if (invite.inviteeEmail === auth.user?.email && invite.status === 'pending') {
          onInvite({ ...invite, id: key });
        }
      });
    }
  };
  
  onValue(invitesRef, handleInvites);
  
  // Return a function to unsubscribe
  return () => off(invitesRef, 'value', handleInvites);
};

// Accept a game invite
export const acceptGameInvite = async (inviteId: string): Promise<string> => {
  const auth = useAuth();
  
  if (!auth.user) {
    throw new Error('User must be logged in to accept a game invite');
  }
  
  // Get the invite
  const inviteRef = ref(database, `gameInvites/${inviteId}`);
  const snapshot = await get(inviteRef);
  const invite = snapshot.val();
  
  if (!invite || invite.inviteeEmail !== auth.user.email) {
    throw new Error('Invite not found or not for this user');
  }
  
  // Update invite status
  await update(inviteRef, { status: 'accepted' });
  
  // Create a new match
  const matchRef = push(ref(database, 'matches'));
  const match: Match = {
    id: matchRef.key || '',
    gameId: invite.gameId,
    players: {
      [invite.senderId]: {
        displayName: invite.senderName,
      },
      [auth.user.uid]: {
        displayName: auth.user.displayName || 'Unknown Player',
      }
    },
    stake: invite.stake,
    status: 'matched',
    startTime: Date.now(),
    currentTurn: invite.senderId // Sender goes first
  };
  
  await set(matchRef, match);
  return matchRef.key || '';
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
  
  await update(matchRef, updates);
};

// Update game state
export const updateGameState = async (
  matchId: string,
  gameState: any,
  nextTurn?: string
): Promise<void> => {
  const auth = useAuth();
  
  if (!auth.user) {
    throw new Error('User must be logged in to update game state');
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
  
  // Check if it's the user's turn
  if (match.currentTurn !== auth.user.uid) {
    throw new Error('Not your turn');
  }
  
  // Update the game state
  const updates: Partial<Match> = { 
    gameState,
    currentTurn: nextTurn
  };
  
  await update(matchRef, updates);
};

// Listen for game updates
export const listenForGameUpdates = (
  matchId: string,
  onUpdate: (match: Match) => void
): () => void => {
  const matchRef = ref(database, `matches/${matchId}`);
  
  const handleUpdate = (snapshot: any) => {
    const match = snapshot.val();
    if (match) {
      onUpdate(match);
    }
  };
  
  onValue(matchRef, handleUpdate);
  
  // Return a function to unsubscribe
  return () => off(matchRef, 'value', handleUpdate);
};
