import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  type GameState, type Club, type Player, type Match, 
  type Manager, type Staff, type StaffRole, 
  type SeasonTarget, type TransferBid, type NewsStory,
  type OwnershipType
} from '../types/game';
import { simulateMatch } from '../utils/matchEngine';
import { generateInitialData } from '../utils/dataGenerator';
import { processAITransfers } from '../utils/transferEngine';

interface GameStore extends GameState {
  initializeGame: () => void;
  setGameState: (state: Partial<GameState>) => void;
  updateClub: (clubId: string, updates: Partial<Club>) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  advanceWeek: () => void;
  respondToTransferRequest: (requestId: string, status: 'APPROVED' | 'REJECTED' | 'DELAYED', budgetLimit?: number) => void;
  sackManager: (managerId: string) => void;
  hireManager: (clubId: string, manager: Manager) => void;
  upgradeFacility: (clubId: string, facilityType: 'stadium' | 'trainingGround' | 'medicalCenter' | 'youthAcademy') => void;
  advertiseStaffRole: (clubId: string, role: StaffRole) => void;
  hireStaffApplicant: (clubId: string, applicantId: string) => void;
  hireStaff: (clubId: string, staffMember: Staff) => void; 
  dismissStaff: (staffId: string) => void;
  toggleTransferList: (playerId: string) => void;
  assignScout: (clubId: string, scoutId: string, region: string) => void;
  generateNews: (story: Omit<NewsStory, 'id' | 'date'>) => void;
  negotiateBid: (bidId: string, counterAmount: number) => void;
  respondToTransferBid: (bidId: string, status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED') => void;
  prepareMatchday: () => Match | null;
  finalizeMatchday: (userMatch: Match) => void;
  setSeasonTarget: (clubId: string, target: SeasonTarget) => void;
  setTransferBudget: (clubId: string, amount: number) => void;
  acceptSponsor: (clubId: string, sponsorId: string) => void;
  buyClub: (clubId: string) => void;
  sellClub: (clubId: string) => void;
  renameClub: (clubId: string, newName: string) => void;
  skipWeeks: (weeks: number) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  currentWeek: 0,
  currentSeason: 2024,
  isTransferWindowOpen: false,
  clubs: [],
  players: [],
  managers: [],
  staff: [],
  leagues: [],
  matches: [],
  transferRequests: [],
  transferBids: [],
  news: [],
  userClubId: null,
  personalBalance: 250000,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeGame: () => {
        const data = generateInitialData();
        set({
          ...data,
          currentWeek: 1,
          currentSeason: 2024,
          userClubId: data.clubs.find(c => c.isUserControlled)?.id || null,
        });
      },

      setGameState: (state) => set((prev) => ({ ...prev, ...state })),

      updateClub: (clubId, updates) =>
        set((state) => ({
          clubs: state.clubs.map((club) => club.id === clubId ? { ...club, ...updates } : club),
        })),

      updatePlayer: (playerId, updates) =>
        set((state) => ({
          players: state.players.map((player) => player.id === playerId ? { ...player, ...updates } : player),
        })),

      respondToTransferRequest: (requestId, status, budgetLimit) => {
        const state = get();
        const request = state.transferRequests.find(r => r.id === requestId);
        if (!request) return;

        const manager = state.managers.find(m => m.id === request.managerId);
        if (!manager) return;

        let relationshipImpact = status === 'APPROVED' ? 10 : status === 'REJECTED' ? -15 : -2;

        set({
          transferRequests: state.transferRequests.map(r => r.id === requestId ? { ...r, status, budgetLimit } : r),
          managers: state.managers.map(m => m.id === manager.id ? { ...m, relationshipWithChairman: Math.max(0, Math.min(100, m.relationshipWithChairman + relationshipImpact)) } : m),
          clubs: state.clubs.map(c => c.id === request.clubId && status === 'APPROVED' ? { ...c, history: [...c.history, `Approved ${request.type} request`] } : c)
        });
      },

      sackManager: (managerId) => {
        const state = get();
        const manager = state.managers.find(m => m.id === managerId);
        if (!manager) return;

        set({
          managers: state.managers.filter(m => m.id !== managerId),
          clubs: state.clubs.map(c => c.id === manager.clubId ? { ...c, boardConfidence: Math.max(0, c.boardConfidence - 10), history: [...c.history, `Sacked manager ${manager.name}`] } : c)
        });
      },

      hireManager: (clubId, manager) => {
        set((state) => ({
          managers: [...state.managers, { ...manager, clubId }],
          clubs: state.clubs.map(c => c.id === clubId ? { ...c, history: [...c.history, `Hired manager ${manager.name}`] } : c)
        }));
      },

      upgradeFacility: (clubId, type) => {
        const state = get();
        const club = state.clubs.find(c => c.id === clubId);
        if (!club) return;

        const facility = club.facilities[type];
        if (club.finances.balance < facility.upgradeCost) return;

        set({
          clubs: state.clubs.map(c => c.id === clubId ? {
            ...c,
            finances: { ...c.finances, balance: c.finances.balance - facility.upgradeCost },
            facilities: {
              ...c.facilities,
              [type]: {
                ...facility,
                level: facility.level + 1,
                upgradeCost: Math.floor(facility.upgradeCost * 1.5),
                ...(type === 'stadium' ? { capacity: Math.floor((facility as any).capacity * 1.1) } : {})
              }
            },
            history: [...c.history, `Upgraded ${type} to level ${facility.level + 1}`]
          } : c)
        });
      },

      advertiseStaffRole: (clubId, role) => {
        const state = get();
        const club = state.clubs.find(c => c.id === clubId);
        if (!club || club.finances.balance < 50000) return;

        set({
          clubs: state.clubs.map(c => c.id === clubId ? {
            ...c,
            finances: { ...c.finances, balance: c.finances.balance - 50000 },
            staffAds: [...(c.staffAds || []), {
              id: Math.random().toString(36).substr(2, 9),
              role,
              weeksRemaining: 2,
              cost: 50000
            }],
            history: [...c.history, `Advertised for a new ${role}`]
          } : c)
        });
      },

      hireStaffApplicant: (clubId, applicantId) => {
        const state = get();
        const club = state.clubs.find(c => c.id === clubId);
        const applicant = club?.staffApplicants.find(a => a.id === applicantId);
        if (!club || !applicant) return;

        set({
          staff: [...state.staff, { ...applicant, clubId, isApplicant: false }],
          clubs: state.clubs.map(c => c.id === clubId ? {
            ...c,
            staffApplicants: c.staffApplicants.filter(a => a.id !== applicantId),
            finances: { ...c.finances, weeklyStaffWages: c.finances.weeklyStaffWages + applicant.salary },
            history: [...c.history, `Hired ${applicant.name} as ${applicant.role}`]
          } : c)
        });
      },

      hireStaff: (clubId, staffMember) => {
        set((state) => ({
          staff: [...state.staff, { ...staffMember, clubId }],
          clubs: state.clubs.map(c => c.id === clubId ? {
            ...c,
            finances: { ...c.finances, weeklyStaffWages: c.finances.weeklyStaffWages + staffMember.salary },
            history: [...c.history, `Hired ${staffMember.name} as ${staffMember.role}`]
          } : c)
        }));
      },

      dismissStaff: (staffId) => {
        const state = get();
        const staffMember = state.staff.find(s => s.id === staffId);
        if (!staffMember) return;

        set({
          staff: state.staff.filter(s => s.id !== staffId),
          clubs: state.clubs.map(c => c.id === staffMember.clubId ? {
            ...c,
            finances: { ...c.finances, weeklyStaffWages: Math.max(0, c.finances.weeklyStaffWages - staffMember.salary) },
            history: [...c.history, `Dismissed ${staffMember.name}`]
          } : c)
        });
      },

      assignScout: (clubId, scoutId, region) => {
        set((state) => ({
          clubs: state.clubs.map(c => c.id === clubId ? {
            ...c,
            scoutAssignments: [
              ...(c.scoutAssignments || []).filter(a => a.scoutId !== scoutId),
              { scoutId, region, progress: 0, playersFound: [] }
            ]
          } : c)
        }));
      },

      generateNews: (story) => {
        const state = get();
        const newStory: NewsStory = {
          ...story,
          id: Math.random().toString(36).substr(2, 9),
          date: `Week ${state.currentWeek}, Season ${state.currentSeason}`
        };
        set({ news: [newStory, ...state.news].slice(0, 100) });
      },

      respondToTransferBid: (bidId, status) => {
        set((state) => ({
          transferBids: state.transferBids.map(b => b.id === bidId ? { ...b, status } : b)
        }));
      },

      toggleTransferList: (playerId) => {
        set((state) => ({
          players: state.players.map(p => p.id === playerId ? { ...p, isTransferListed: !p.isTransferListed } : p)
        }));
      },

      advanceWeek: () => {
        const state = get();
        const { currentWeek, currentSeason, clubs, players, leagues, managers } = state;

        const isTransferWindowOpen = (currentWeek >= 1 && currentWeek <= 4) || (currentWeek >= 20 && currentWeek <= 24);

        const transferUpdates = processAITransfers({ ...state, isTransferWindowOpen });
        const clubsAfterTransfers = transferUpdates.clubs || clubs;
        const playersAfterTransfers = transferUpdates.players || players;

        const newMatches: Match[] = [];
        leagues.forEach(league => {
          const leagueClubs = clubsAfterTransfers.filter(c => c.leagueId === league.id);
          const shuffledClubs = [...leagueClubs].sort(() => Math.random() - 0.5);
          for (let i = 0; i < shuffledClubs.length; i += 2) {
            const home = shuffledClubs[i];
            const away = shuffledClubs[i + 1];
            if (home && away) {
              const match = simulateMatch(home, away, playersAfterTransfers.filter(p => p.clubId === home.id), playersAfterTransfers.filter(p => p.clubId === away.id), currentWeek, currentSeason);
              newMatches.push(match);
            }
          }
        });

        const updatedClubs = clubsAfterTransfers.map(club => {
          const league = leagues.find(l => l.id === club.leagueId);
          const tier = league?.tier || 3;
          const tierMult = tier === 1 ? 5 : tier === 2 ? 2.5 : 1;

          const finances = { ...club.finances };
          const board = { ...club.board };
          let fanConfidence = club.fanConfidence;
          let boardConfidence = club.boardConfidence;
          let history = [...club.history];

          const maintenanceCost = (finances.expenses.facilityMaintenance || 5000) * tierMult;
          const totalExpenses = (finances.weeklyWages + finances.weeklyStaffWages + maintenanceCost);
          finances.balance -= totalExpenses;

          const baseSponsorship = (finances.revenue.sponsorship || 50000) * tierMult;
          finances.balance += (baseSponsorship / 4);

          const match = newMatches.find(m => m.homeClubId === club.id || m.awayClubId === club.id);

          if (match) {
            const isHome = match.homeClubId === club.id;
            const won = isHome ? match.homeScore > match.awayScore : match.awayScore > match.homeScore;
            const drew = match.homeScore === match.awayScore;

            if (isHome) {
              const ticketPrice = tier === 1 ? 60 : tier === 2 ? 40 : 25;
              const performanceBonus = won ? 1.2 : drew ? 1.0 : 0.7;
              const attendance = Math.min(club.facilities.stadium.capacity, (club.reputation * 100) * performanceBonus + (Math.random() * 1000));
              const ticketIncome = attendance * ticketPrice;
              finances.revenue.tickets = ticketIncome;
              finances.balance += ticketIncome;
            }

            const confidenceChange = won ? 5 : drew ? 1 : -8;
            fanConfidence = Math.max(0, Math.min(100, fanConfidence + confidenceChange));
            const impatienceMult = (100 - board.patience) / 50;
            boardConfidence = Math.max(0, Math.min(100, boardConfidence + (confidenceChange * impatienceMult)));

            if (fanConfidence < 20 && Math.random() < 0.1) {
              history.push(`FAN PROTEST: Supporters gather outside ${club.stadiumName} demanding change!`);
              boardConfidence -= 5;
            }
          }

          let staffApplicants = [...(club.staffApplicants || [])];
          let staffAds = (club.staffAds || []).map(ad => ({ ...ad, weeksRemaining: ad.weeksRemaining - 1 }));

          staffAds.forEach(ad => {
            if (ad.weeksRemaining <= 0) {
              const count = Math.floor(Math.random() * 3) + 1;
              for (let i = 0; i < count; i++) {
                const baseRating = Math.floor(club.reputation + (Math.random() * 20));
                staffApplicants.push({
                  id: Math.random().toString(36).substr(2, 9),
                  name: `Candidate ${Math.random().toString(36).substr(2, 4)}`,
                  role: ad.role,
                  rating: Math.min(99, baseRating),
                  salary: Math.floor(baseRating * 150),
                  clubId: club.id,
                  isApplicant: true
                });
              }
            }
          });
          staffAds = staffAds.filter(ad => ad.weeksRemaining > 0);

          let scoutAssignments = (club.scoutAssignments || []).map(a => {
            const progress = Math.min(100, a.progress + 15 + Math.random() * 10);
            const playersFound = [...a.playersFound];
            if (progress >= 100 && Math.random() < 0.4) {
              const potentialPlayer = playersAfterTransfers[Math.floor(Math.random() * playersAfterTransfers.length)];
              if (!playersFound.includes(potentialPlayer.id)) playersFound.push(potentialPlayer.id);
            }
            return { ...a, progress, playersFound };
          });

          if (Math.random() < 0.001) {
            const newType: OwnershipType = Math.random() > 0.7 ? 'BILLIONAIRE' : 'CORPORATE';
            board.type = newType;
            board.funds = newType === 'BILLIONAIRE' ? 100000000 : 0;
            board.patience = newType === 'BILLIONAIRE' ? 30 : 60;
            history.push(`TAKEOVER: ${club.name} has been acquired by a ${newType} consortium!`);
          }

          return { ...club, finances, board, fanConfidence, boardConfidence, history, staffAds, staffApplicants, scoutAssignments };
        });

        const updatedPlayers = playersAfterTransfers.map(player => {
          const club = updatedClubs.find(c => c.id === player.clubId);
          const manager = managers.find(m => m.clubId === player.clubId);
          if (!club) return player;

          let { overallRating, fitness, fatigue, morale, chemistry, potentialRating, hidden, happiness } = { ...player };

          const recoveryMod = (hidden.professionalism / 100) + 0.5;
          fatigue = Math.max(0, fatigue - (15 * recoveryMod));
          fitness = Math.min(100, fitness + (10 * recoveryMod));

          const teammates = updatedPlayers.filter(p => p.clubId === player.clubId && p.id !== player.id);
          teammates.forEach(tm => {
            const currentChem = chemistry[tm.id] || 0;
            if (Math.random() < 0.1) chemistry[tm.id] = Math.min(100, currentChem + 1);
          });

          if (happiness.adaptation < 100) {
            happiness.adaptation += 1;
            if (happiness.adaptation < 50) morale -= 5;
          }

          const coachingBonus = manager ? (manager.coachingAbility / 100) : 0.5;
          const trainingLevel = club.facilities.trainingGround.level;
          
          if (Math.random() < 0.05 * coachingBonus * (trainingLevel / 5)) {
            overallRating = Math.min(potentialRating, overallRating + 0.2);
          }

          return { ...player, overallRating, fitness, fatigue, morale, happiness, chemistry, potentialRating };
        });

        const newBids: TransferBid[] = [...state.transferBids];
        updatedPlayers.filter(p => p.isTransferListed).forEach(player => {
          const hasPending = newBids.some(b => b.playerId === player.id && b.status === 'PENDING');
          if (!hasPending && Math.random() < 0.2) {
            const buyer = updatedClubs.find(c => c.id !== player.clubId && c.finances.balance > player.value);
            if (buyer) {
              newBids.push({
                id: `bid-${Date.now()}-${player.id}`, playerId: player.id,
                fromClubId: buyer.id, toClubId: player.clubId,
                amount: Math.floor(player.value * (0.8 + Math.random() * 0.3)),
                status: 'PENDING', week: currentWeek + 1, season: currentSeason,
                isPlayerInterested: true, negotiationCount: 0
              });
            }
          }
        });

        set({
          currentWeek: currentWeek + 1,
          isTransferWindowOpen,
          matches: [...state.matches, ...newMatches],
          clubs: updatedClubs,
          players: updatedPlayers,
          transferBids: newBids,
        });

        if (currentWeek >= 38) {
          set({ currentWeek: 1, currentSeason: currentSeason + 1 });
        }
      },

      prepareMatchday: () => {
        const state = get();
        const userClubId = state.userClubId;
        if (!userClubId) return null;

        const userMatch = state.matches.find(m => 
          (m.homeClubId === userClubId || m.awayClubId === userClubId) && 
          m.week === state.currentWeek && 
          !m.played
        );

        if (!userMatch) return null;

        const homeClub = state.clubs.find(c => c.id === userMatch.homeClubId)!;
        const awayClub = state.clubs.find(c => c.id === userMatch.awayClubId)!;
        const homePlayers = state.players.filter(p => p.clubId === homeClub.id);
        const awayPlayers = state.players.filter(p => p.clubId === awayClub.id);

        return simulateMatch(homeClub, awayClub, homePlayers, awayPlayers, state.currentWeek, state.currentSeason);
      },

      finalizeMatchday: (userMatch) => {
        const state = get();
        const { currentWeek, currentSeason, clubs, players, leagues, userClubId } = state;
        if (!userClubId) return;

        const isTransferWindowOpen = (currentWeek >= 1 && currentWeek <= 4) || (currentWeek >= 20 && currentWeek <= 24);

        const transferUpdates = processAITransfers({ ...state, isTransferWindowOpen });
        const clubsAfterTransfers = transferUpdates.clubs || clubs;
        const playersAfterTransfers = transferUpdates.players || players;

        const weeklyMatches = state.matches.filter(m => m.week === currentWeek && m.id !== userMatch.id);
        const results = weeklyMatches.map(m => {
          const hClub = clubsAfterTransfers.find(c => c.id === m.homeClubId)!;
          const aClub = clubsAfterTransfers.find(c => c.id === m.awayClubId)!;
          return simulateMatch(hClub, aClub, playersAfterTransfers.filter(p => p.clubId === hClub.id), playersAfterTransfers.filter(p => p.clubId === aClub.id), currentWeek, currentSeason);
        });

        const matchResults = [userMatch, ...results];
        
        const updatedMatches = state.matches.map(m => {
          const result = matchResults.find(r => (r.homeClubId === m.homeClubId && r.awayClubId === m.awayClubId && r.week === m.week));
          return result ? { ...result, played: true } : m;
        });

        const updatedClubs = clubsAfterTransfers.map(club => {
          const league = leagues.find(l => l.id === club.leagueId);
          const tier = league?.tier || 3;
          const tierMult = tier === 1 ? 5 : tier === 2 ? 2.5 : 1;

          const finances = { ...club.finances };
          const board = { ...club.board };
          let fanConfidence = club.fanConfidence;
          let boardConfidence = club.boardConfidence;

          const maintenanceCost = (finances.expenses.facilityMaintenance || 5000) * tierMult;
          const totalExpenses = (finances.weeklyWages + finances.weeklyStaffWages + maintenanceCost);
          finances.balance -= totalExpenses;

          const baseSponsorship = (finances.revenue.sponsorship || 50000) * tierMult;
          finances.balance += (baseSponsorship / 4);

          const match = matchResults.find(m => m.homeClubId === club.id || m.awayClubId === club.id);

          if (match) {
            const isHome = match.homeClubId === club.id;
            const won = isHome ? match.homeScore > match.awayScore : match.awayScore > match.homeScore;
            const drew = match.homeScore === match.awayScore;

            if (isHome) {
              const ticketPrice = tier === 1 ? 60 : tier === 2 ? 40 : 25;
              const performanceBonus = won ? 1.2 : drew ? 1.0 : 0.7;
              const attendance = Math.min(club.facilities.stadium.capacity, (club.reputation * 100) * performanceBonus + (Math.random() * 1000));
              const ticketIncome = attendance * ticketPrice;
              finances.revenue.tickets = ticketIncome;
              finances.balance += ticketIncome;
            }

            const confidenceChange = won ? 5 : drew ? 1 : -8;
            fanConfidence = Math.max(0, Math.min(100, fanConfidence + confidenceChange));
            const impatienceMult = (100 - board.patience) / 50;
            boardConfidence = Math.max(0, Math.min(100, boardConfidence + (confidenceChange * impatienceMult)));
          }

          let staffApplicants = [...(club.staffApplicants || [])];
          let staffAds = (club.staffAds || []).map(ad => ({ ...ad, weeksRemaining: ad.weeksRemaining - 1 }));
          staffAds.forEach(ad => {
             if (ad.weeksRemaining <= 0) {
                for (let i = 0; i < (Math.floor(Math.random() * 3) + 1); i++) {
                  const baseRating = Math.floor(club.reputation + (Math.random() * 20));
                  staffApplicants.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: `Candidate ${Math.random().toString(36).substr(2, 4)}`,
                    role: ad.role, rating: Math.min(99, baseRating),
                    salary: Math.floor(baseRating * 150), clubId: club.id, isApplicant: true
                  });
                }
             }
          });
          staffAds = staffAds.filter(ad => ad.weeksRemaining > 0);

          let scoutAssignments = (club.scoutAssignments || []).map(a => {
            const progress = Math.min(100, a.progress + 15 + Math.random() * 10);
            const playersFound = [...a.playersFound];
            if (progress >= 100 && Math.random() < 0.4) {
              const potentialPlayer = playersAfterTransfers[Math.floor(Math.random() * playersAfterTransfers.length)];
              if (!playersFound.includes(potentialPlayer.id)) playersFound.push(potentialPlayer.id);
            }
            return { ...a, progress, playersFound };
          });

          return { ...club, finances, board, fanConfidence, boardConfidence, staffAds, staffApplicants, scoutAssignments };
        });

        const updatedPlayers = playersAfterTransfers.map(player => {
          const club = updatedClubs.find(c => c.id === player.clubId);
          if (!club) return player;
          let { overallRating, fitness, fatigue, morale, chemistry, potentialRating } = { ...player };
          fatigue = Math.max(0, fatigue - 15);
          fitness = Math.min(100, fitness + 10);
          if (Math.random() < 0.05) overallRating = Math.min(potentialRating, overallRating + 0.1);
          return { ...player, overallRating, fitness, fatigue, morale, chemistry, potentialRating };
        });

        const newBids: TransferBid[] = [...state.transferBids];
        updatedPlayers.filter(p => p.isTransferListed).forEach(player => {
          const hasPending = newBids.some(b => b.playerId === player.id && b.status === 'PENDING');
          if (!hasPending && Math.random() < 0.2) {
             const buyer = updatedClubs.find(c => c.id !== player.clubId && c.finances.balance > player.value);
             if (buyer) {
                newBids.push({
                  id: `bid-${Date.now()}-${player.id}`, playerId: player.id,
                  fromClubId: buyer.id, toClubId: player.clubId,
                  amount: Math.floor(player.value * (0.8 + Math.random() * 0.3)),
                  status: 'PENDING', week: currentWeek + 1, season: currentSeason,
                  isPlayerInterested: true, negotiationCount: 0
                });
             }
          }
        });

        const nextWeek = currentWeek < 38 ? currentWeek + 1 : 1;
        const nextSeason = currentWeek < 38 ? currentSeason : currentSeason + 1;

        set({
          currentWeek: nextWeek,
          currentSeason: nextSeason,
          isTransferWindowOpen,
          matches: updatedMatches,
          clubs: updatedClubs.map(c => {
            if (nextWeek === 1) {
               return {
                 ...c,
                 availableSponsors: [
                    { id: `sp-${c.id}-w1-${Date.now()}`, name: 'Elite Motors', type: 'MAIN', amount: Math.floor(c.reputation * 20000), duration: 2, reputationRequired: c.reputation - 5, status: 'PENDING' },
                    { id: `sp-${c.id}-w2-${Date.now()}`, name: 'Peak Nutrition', type: 'SLEEVE', amount: Math.floor(c.reputation * 5000), duration: 1, reputationRequired: c.reputation - 10, status: 'PENDING' },
                 ]
               };
            }
            return c;
          }),
          players: updatedPlayers,
          transferBids: newBids,
        });
      },

      setSeasonTarget: (clubId, target) => {
        set((state) => ({
          clubs: state.clubs.map(c => c.id === clubId ? { ...c, seasonTarget: target } : c)
        }));
      },

      setTransferBudget: (clubId, amount) => {
        set((state) => ({
          clubs: state.clubs.map(c => c.id === clubId ? { 
            ...c, 
            transferBudget: Math.min(c.finances.balance, amount) 
          } : c)
        }));
      },

      acceptSponsor: (clubId, sponsorId) => {
        const state = get();
        const club = state.clubs.find(c => c.id === clubId);
        const sponsor = club?.availableSponsors.find(s => s.id === sponsorId);
        if (!club || !sponsor) return;

        set({
          clubs: state.clubs.map(c => c.id === clubId ? {
            ...c,
            availableSponsors: c.availableSponsors.filter(s => s.id !== sponsorId),
            activeSponsors: [...c.activeSponsors, { ...sponsor, status: 'ACTIVE' }],
            finances: { 
              ...c.finances, 
              balance: c.finances.balance + sponsor.amount, 
              revenue: { ...c.finances.revenue, sponsorship: c.finances.revenue.sponsorship + (sponsor.amount / sponsor.duration / 38) } 
            },
            history: [...c.history, `Signed sponsorship deal with ${sponsor.name}`]
          } : c)
        });
      },

      buyClub: (clubId) => {
        const state = get();
        const club = state.clubs.find(c => c.id === clubId);
        if (!club || state.personalBalance < club.valuation) return;

        set({
          userClubId: clubId,
          personalBalance: state.personalBalance - club.valuation,
          clubs: state.clubs.map(c => c.id === clubId ? { ...c, isUserControlled: true, history: [...c.history, `Club acquired by new owner`] } : c)
        });
      },

      sellClub: (clubId) => {
        const state = get();
        const club = state.clubs.find(c => c.id === clubId);
        if (!club) return;

        set({
          userClubId: null,
          personalBalance: state.personalBalance + club.valuation,
          clubs: state.clubs.map(c => c.id === clubId ? { ...c, isUserControlled: false, history: [...c.history, `Club sold by owner`] } : c)
        });
      },

      renameClub: (clubId, newName) => {
        set((state) => ({
          clubs: state.clubs.map(c => c.id === clubId ? { ...c, name: newName } : c)
        }));
      },

      skipWeeks: (weeks) => {
        for (let i = 0; i < weeks; i++) {
          const match = get().prepareMatchday();
          if (match) {
             get().finalizeMatchday(match);
          } else {
             get().advanceWeek();
          }
        }
      },

      negotiateBid: (bidId, counterAmount) => {
        const state = get();
        const bid = state.transferBids.find(b => b.id === bidId);
        if (!bid || bid.negotiationCount >= 3) return;

        const player = state.players.find(p => p.id === bid.playerId);
        if (!player) return;

        const isRidiculous = counterAmount > (player.value * 1.5) || counterAmount > (bid.amount * 1.8);
        
        if (isRidiculous && Math.random() < 0.6) {
          set({
            transferBids: state.transferBids.map(b => b.id === bidId ? { ...b, status: 'CANCELLED' } : b)
          });
          get().generateNews({
            title: `Transfer Talks Collapse: ${player.lastName}`,
            content: `Negotiations between ${state.clubs.find(c => c.id === bid.fromClubId)?.name} and your club ended abruptly.`,
            category: 'TRANSFER',
            importance: 'MEDIUM'
          });
          return;
        }

        const willAccept = counterAmount <= (player.value * 1.05) && Math.random() > 0.4;
        
        if (willAccept) {
          set({
            transferBids: state.transferBids.map(b => b.id === bidId ? { ...b, amount: counterAmount, status: 'ACCEPTED' } : b)
          });
        } else {
          const newAiBid = Math.floor(bid.amount + (counterAmount - bid.amount) * 0.35);
          set({
            transferBids: state.transferBids.map(b => b.id === bidId ? { ...b, amount: newAiBid, negotiationCount: b.negotiationCount + 1 } : b)
          });
        }
      },

      resetGame: () => set(initialState),
    }),
    {
      name: 'football-chairman-storage',
      version: 11,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
