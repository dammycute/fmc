import { type GameState, type Player, type TransferBid } from '../types/game';

const getRandomElement = <T>(arr: T[]): T | undefined => arr[Math.floor(Math.random() * arr.length)];

export const processAITransfers = (state: GameState): Partial<GameState> => {
  const { currentWeek, currentSeason, clubs, players, transferBids, isTransferWindowOpen, userClubId } = state;

  if (!isTransferWindowOpen) return {};

  const newBids: TransferBid[] = [...transferBids];
  const updatedPlayers = players.map(p => ({ ...p }));
  const updatedClubs = clubs.map(c => ({ ...c, finances: { ...c.finances } }));

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
      bid.status = 'ACCEPTED';
      
      // Execute transfer and keep wage obligations accurate.
      const oldClub = toClub;
      const newClub = fromClub;
      player.clubId = bid.fromClubId;
      oldClub.finances.balance += bid.amount;
      newClub.finances.balance -= bid.amount;

      oldClub.finances.weeklyWages = Math.max(0, oldClub.finances.weeklyWages - player.wage);
      oldClub.finances.expenses.playerWages = oldClub.finances.weeklyWages;
      newClub.finances.weeklyWages += player.wage;
      newClub.finances.expenses.playerWages = newClub.finances.weeklyWages;
      
      oldClub.history.push(`Sold ${player.lastName} to ${newClub.name} for £${(bid.amount / 1000000).toFixed(1)}M`);
      newClub.history.push(`Signed ${player.lastName} from ${oldClub.name} for £${(bid.amount / 1000000).toFixed(1)}M`);
    } else {
      bid.status = 'REJECTED';
    }
  });

  // 2. Generate new AI bids using broader target pools and preventing repeated targeting.
  clubs.forEach(club => {
    if (club.isUserControlled) return;
    if (club.finances.balance < 5000000) return;

    const pendingPlayerIds = new Set(newBids.filter(b => b.status === 'PENDING').map(b => b.playerId));
    const candidatePool = updatedPlayers.filter(p => p.clubId !== club.id && !pendingPlayerIds.has(p.id));
    if (!candidatePool.length) return;

    const isElite = club.reputation > 80;
    const isSmall = club.reputation < 40;

    let targets: Player[] = [];
    if (isElite) {
      targets = candidatePool.filter(p => p.potentialRating > 84 && p.age < 22 && p.value < club.finances.balance * 0.6);
    } else if (isSmall) {
      targets = candidatePool.filter(p => (p.isTransferListed || p.age > 30) && p.value < club.finances.balance * 0.25);
    } else {
      targets = candidatePool.filter(p => p.overallRating > 72 && p.value < club.finances.balance * 0.4);
    }

    const target = getRandomElement(targets);
    if (target && Math.random() > 0.92) {
      const bidAmount = Math.floor(target.value * (1.05 + Math.random() * 0.3));
      newBids.push({
        id: Math.random().toString(36).substring(2, 11),
        playerId: target.id,
        fromClubId: club.id,
        toClubId: target.clubId,
        amount: bidAmount,
        status: 'PENDING',
        week: currentWeek,
        season: currentSeason,
        isPlayerInterested: true,
        negotiationCount: 0
      });
    }
  });

  return { transferBids: newBids, players: updatedPlayers, clubs: updatedClubs };
};
