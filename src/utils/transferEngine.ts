import { type GameState, type Club, type Player, type TransferBid, type League } from '../types/game';

export const processAITransfers = (state: GameState): Partial<GameState> => {
  const { currentWeek, currentSeason, clubs, players, leagues, transferBids, isTransferWindowOpen, userClubId } = state;

  if (!isTransferWindowOpen) return {};

  const newBids: TransferBid[] = [...transferBids];
  const updatedPlayers = [...players];
  const updatedClubs = [...clubs];

  // 1. Process existing pending bids (AI to AI)
  newBids.forEach(bid => {
    if (bid.status !== 'PENDING') return;
    if (bid.toClubId === userClubId) return; // Wait for user response

    const toClub = updatedClubs.find(c => c.id === bid.toClubId);
    const fromClub = updatedClubs.find(c => c.id === bid.fromClubId);
    const player = updatedPlayers.find(p => p.id === bid.playerId);

    if (!toClub || !fromClub || !player) return;

    // AI logic to accept/reject
    const valuation = player.value * (1 + (player.potentialRating / 100));
    const isGoodDeal = bid.amount >= valuation;
    
    if (isGoodDeal || (toClub.finances.balance < 0 && bid.amount > player.value * 0.8)) {
      // Accept deal
      bid.status = 'ACCEPTED';
      
      // Execute Transfer
      player.clubId = bid.fromClubId;
      toClub.finances.balance += bid.amount;
      fromClub.finances.balance -= bid.amount;
      
      // Update history
      toClub.history.push(`Sold ${player.lastName} to ${fromClub.name} for £${(bid.amount / 1000000).toFixed(1)}M`);
      fromClub.history.push(`Signed ${player.lastName} from ${toClub.name} for £${(bid.amount / 1000000).toFixed(1)}M`);
    } else {
      bid.status = 'REJECTED';
    }
  });

  // 2. Generate New AI Bids
  clubs.forEach(club => {
    if (club.isUserControlled) return;
    if (club.finances.balance < 5000000) return; // Need some cash to bid

    // Logic for "Elite" vs "Small" clubs
    const isElite = club.reputation > 80;
    const isSmall = club.reputation < 40;

    // Search for targets
    let target: Player | undefined;

    if (isElite) {
      // Elite clubs poach wonderkids from lower leagues
      target = updatedPlayers.find(p => 
        p.clubId !== club.id && 
        p.potentialRating > 85 && 
        p.age < 21 &&
        !newBids.some(b => b.playerId === p.id && b.status === 'PENDING')
      );
    } else if (isSmall) {
      // Small clubs look for cheap veterans or transfer listed
      target = updatedPlayers.find(p => 
        p.clubId !== club.id && 
        (p.isTransferListed || p.age > 30) && 
        p.value < club.finances.balance * 0.2
      );
    } else {
      // Mid-table logic
      target = updatedPlayers.find(p => 
        p.clubId !== club.id && 
        p.overallRating > 75 && 
        p.value < club.finances.balance * 0.4
      );
    }

    if (target && Math.random() > 0.95) { // Small chance each week
      const bidAmount = target.value * (1.1 + Math.random() * 0.4);
      newBids.push({
        id: Math.random().toString(36).substr(2, 9),
        playerId: target.id,
        fromClubId: club.id,
        toClubId: target.clubId,
        amount: bidAmount,
        status: 'PENDING',
        week: currentWeek,
        season: currentSeason,
        isPlayerInterested: true
      });
    }
  });

  return { transferBids: newBids, players: updatedPlayers, clubs: updatedClubs };
};
