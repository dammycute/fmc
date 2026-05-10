import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  type GameState, type Club, type Player, type Match, 
  type Manager, type Staff, type StaffRole, 
  type SeasonTarget, type TransferBid, type NewsStory,
  type Sponsor
} from '../types/game';
import { simulateMatch } from '../utils/matchEngine';
import { generateInitialData } from '../utils/dataGenerator';
import { processAITransfers } from '../utils/transferEngine';

const randomId = (length = 9) => Math.random().toString(36).substring(2, 2 + length);
const isTransferWindowOpen = (date: string) => {
  const month = new Date(date).getMonth() + 1; // 1-12
  return (month >= 1 && month <= 2) || (month >= 7 && month <= 9);
};
const calcSponsorDailyIncome = (sponsors: Sponsor[]) => sponsors
  .filter((s) => s.status === 'ACTIVE')
  .reduce((sum, sponsor) => sum + sponsor.amount / Math.max(1, sponsor.duration) / 38 / 7, 0);

interface GameStore extends GameState {
  initializeGame: () => void;
  setGameState: (state: Partial<GameState>) => void;
  updateClub: (clubId: string, updates: Partial<Club>) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  advanceDay: () => void;
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
  finalizeTransfer: (bidId: string) => void;
  makeTransferBid: (playerId: string, clubId: string, amount: number) => void;
  prepareMatchday: () => Match | null;
  finalizeMatchday: (userMatch: Match) => void;
  setSeasonTarget: (clubId: string, target: SeasonTarget) => void;
  setTransferBudget: (clubId: string, amount: number) => void;
  acceptSponsor: (clubId: string, sponsorId: string) => void;
  buyClub: (clubId: string) => void;
  sellClub: (clubId: string) => void;
  renameClub: (clubId: string, newName: string) => void;
  skipWeeks: (weeks: number) => void;  setFormation: (clubId: string, formation: Formation) => void;  resetGame: () => void;
}

const initialState: GameState = {
  currentDate: '2024-08-01',
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
  personalBalance: 500000,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeGame: () => {
        const data = generateInitialData();
        set({
          ...data,
          currentDate: '2024-08-01',
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

        const relationshipImpact = status === 'APPROVED' ? 10 : status === 'REJECTED' ? -15 : -2;

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
        const tier = state.leagues.find(l => l.id === club.leagueId)?.tier || 3;
        const tierMultiplier = tier === 1 ? 4 : tier === 2 ? 2.5 : tier === 3 ? 1.6 : 1.2;
        const upgradeCost = Math.floor(facility.upgradeCost * tierMultiplier);
        if (club.finances.balance < upgradeCost) return;

        set({
          clubs: state.clubs.map(c => c.id === clubId ? {
            ...c,
            finances: { ...c.finances, balance: c.finances.balance - upgradeCost },
            facilities: {
              ...c.facilities,
              [type]: {
                ...facility,
                level: facility.level + 1,
                upgradeCost: Math.floor(upgradeCost * 1.4),
                ...(type === 'stadium' ? { capacity: Math.floor(c.facilities.stadium.capacity * 1.15) } : {})
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

      advanceDay: () => {
        const state = get();
        const { currentDate, currentSeason, clubs, players, leagues, userClubId } = state;
        const transferWindowOpen = isTransferWindowOpen(currentDate);

        const transferUpdates = processAITransfers({ ...state, isTransferWindowOpen: transferWindowOpen });
        const clubsAfterTransfers = transferUpdates.clubs || clubs;
        const playersAfterTransfers = transferUpdates.players || players;

        // Check if there's a match today
        const todayMatch = state.matches.find(m => m.date === currentDate && !m.played);
        let playedMatches: Match[] = [];

        if (todayMatch) {
          const homeClub = clubsAfterTransfers.find(c => c.id === todayMatch.homeClubId)!;
          const awayClub = clubsAfterTransfers.find(c => c.id === todayMatch.awayClubId)!;
          const homePlayers = playersAfterTransfers.filter(p => p.clubId === homeClub.id);
          const awayPlayers = playersAfterTransfers.filter(p => p.clubId === awayClub.id);
          const result = simulateMatch(homeClub, awayClub, homePlayers, awayPlayers, 1, currentSeason); // week not used anymore
          playedMatches = [{ ...result, id: todayMatch.id, date: todayMatch.date, season: todayMatch.season, homeClubId: todayMatch.homeClubId, awayClubId: todayMatch.awayClubId, played: true }];
        }

        const matchResults = new Map(playedMatches.map(m => [m.id, m]));
        const updatedMatches = state.matches.map((fixture) => matchResults.has(fixture.id) ? matchResults.get(fixture.id)! : fixture);

        const updatedClubs = clubsAfterTransfers.map((club) => {
          const league = leagues.find((l) => l.id === club.leagueId);
          const tier = league?.tier || 3;
          const finances = { ...club.finances };
          const board = { ...club.board };
          let fanConfidence = club.fanConfidence;
          let boardConfidence = club.boardConfidence;
          const history = [...club.history];

          const sponsorIncome = calcSponsorDailyIncome(club.activeSponsors);
          finances.revenue.sponsorship = sponsorIncome;
          const tvRights = (tier === 1 ? 240000 : tier === 2 ? 120000 : tier === 3 ? 75000 : tier === 4 ? 42000 : 22000) / 7;
          finances.revenue.tvRights = tvRights;
          const merchandise = Math.max(0, Math.floor(club.reputation * 350 + (20 - tier) * 250)) / 7;
          finances.revenue.merchandise = merchandise;
          finances.revenue.prizeMoney = finances.revenue.prizeMoney || 0;

          const match = playedMatches.find((m) => m.homeClubId === club.id || m.awayClubId === club.id);
          const ticketPrice = tier === 1 ? 60 : tier === 2 ? 40 : 25;
          let ticketIncome = 0;

          if (match && match.homeClubId === club.id) {
            const won = match.homeScore > match.awayScore;
            const drew = match.homeScore === match.awayScore;
            const performanceBonus = won ? 1.2 : drew ? 1.0 : 0.7;
            ticketIncome = Math.min(club.facilities.stadium.capacity, club.reputation * 90 * performanceBonus + Math.random() * 1000) * ticketPrice;
            finances.revenue.tickets = ticketIncome;
          } else {
            finances.revenue.tickets = 0;
          }

          finances.balance += sponsorIncome + tvRights + merchandise + ticketIncome;
          finances.expenses.playerWages = finances.weeklyWages;
          finances.expenses.staffWages = finances.weeklyStaffWages;
          const maintenanceCost = (finances.expenses.facilityMaintenance || 5000) * (tier === 1 ? 2.8 : tier === 2 ? 2.0 : 1.3);
          const totalExpenses = finances.expenses.playerWages + finances.expenses.staffWages + maintenanceCost + (finances.expenses.loanRepayments || 0);
          finances.balance -= totalExpenses;

          if (match) {
            const isHome = match.homeClubId === club.id;
            const won = isHome ? match.homeScore > match.awayScore : match.awayScore > match.homeScore;
            const drew = match.homeScore === match.awayScore;
            const confidenceChange = won ? 5 : drew ? 1 : -8;
            fanConfidence = Math.max(0, Math.min(100, fanConfidence + confidenceChange));
            const impatienceMult = (100 - board.patience) / 50;
            boardConfidence = Math.max(0, Math.min(100, boardConfidence + confidenceChange * impatienceMult));
            if (fanConfidence < 20 && Math.random() < 0.1) {
              history.push(`FAN PROTEST: Supporters gather outside ${club.stadiumName} demanding change!`);
              boardConfidence = Math.max(0, boardConfidence - 5);
            }
          }

          board.confidence = boardConfidence;

          return { ...club, finances, board, fanConfidence, boardConfidence, history };
        });

        const updatedPlayers = playersAfterTransfers.map((player) => {
          const club = updatedClubs.find((c) => c.id === player.clubId);
          if (!club) return player;

          const updatedPlayer = { ...player };
          updatedPlayer.fatigue = Math.max(0, updatedPlayer.fatigue - 2);
          updatedPlayer.fitness = Math.min(100, updatedPlayer.fitness + 1.5);
          if (Math.random() < 0.01) updatedPlayer.overallRating = Math.min(updatedPlayer.potentialRating, updatedPlayer.overallRating + 0.2 / 7);

          if (updatedPlayer.form.length >= 5) {
            updatedPlayer.form = [...updatedPlayer.form.slice(1), 6 + Math.random() * 3];
          }

          const teammates = playersAfterTransfers.filter((p) => p.clubId === player.clubId && p.id !== player.id);
          teammates.forEach((tm) => {
            const currentChem = updatedPlayer.chemistry[tm.id] || 0;
            if (Math.random() < 0.08) updatedPlayer.chemistry[tm.id] = Math.min(100, currentChem + 1);
          });

          if (updatedPlayer.happiness.adaptation < 100) {
            updatedPlayer.happiness.adaptation += 1;
            if (updatedPlayer.happiness.adaptation < 50) updatedPlayer.morale = Math.max(0, updatedPlayer.morale - 5);
          }

          return updatedPlayer;
        });

        const pendingBids = new Set(state.transferBids.filter((b) => b.status === 'PENDING').map((b) => b.playerId));
        const newBids: TransferBid[] = [...state.transferBids];
        updatedPlayers.filter((p) => p.isTransferListed && !pendingBids.has(p.id)).forEach((player) => {
          const buyer = updatedClubs.find((c) => c.id !== player.clubId && c.finances.balance > player.value);
          if (buyer && Math.random() < 0.18) {
            newBids.push({
              id: randomId(),
              playerId: player.id,
              fromClubId: buyer.id,
              toClubId: player.clubId,
              amount: Math.floor(player.value * (0.8 + Math.random() * 0.3)),
              status: 'PENDING',
              week: currentWeek + 1,
              season: currentSeason,
              isPlayerInterested: true,
              negotiationCount: 0
            });
          }
        });

        const nextWeek = currentWeek < 38 ? currentWeek + 1 : 1;
        const nextSeason = currentWeek < 38 ? currentSeason : currentSeason + 1;
        const nextTransferWindowOpen = isTransferWindowWeek(nextWeek);
        const clubsAfterSponsorExpiry = nextWeek === 1 ? updatedClubs.map((club) => ({
          ...club,
          activeSponsors: club.activeSponsors
            .map((sponsor) => ({ ...sponsor, duration: sponsor.duration - 1 }))
            .filter((sponsor) => sponsor.duration > 0)
        })) : updatedClubs;

        set({
          currentWeek: nextWeek,
          currentSeason: nextSeason,
          isTransferWindowOpen: nextTransferWindowOpen,
          matches: updatedMatches,
          clubs: clubsAfterSponsorExpiry.map((club) => {
            if (nextWeek === 1) {
              return {
                ...club,
                availableSponsors: [
                  { id: `sp-${club.id}-${randomId()}`, name: 'Elite Motors', type: 'MAIN', amount: Math.max(200000, Math.floor(club.reputation * 15000)), duration: 2, reputationRequired: Math.max(15, club.reputation - 5), status: 'PENDING' },
                  { id: `sp-${club.id}-${randomId()}`, name: 'Peak Nutrition', type: 'SLEEVE', amount: Math.max(50000, Math.floor(club.reputation * 6000)), duration: 1, reputationRequired: Math.max(10, club.reputation - 10), status: 'PENDING' }
                ]
              };
            }
            return club;
          }),
          players: updatedPlayers,
          transferBids: newBids,
        });
      },

      prepareMatchday: () => {
        const state = get();
        const userClubId = state.userClubId;
        if (!userClubId) return null;

        const fixture = state.matches.find((m) =>
          (m.homeClubId === userClubId || m.awayClubId === userClubId) &&
          m.week === state.currentWeek &&
          !m.played
        );

        if (!fixture) return null;

        const homeClub = state.clubs.find((c) => c.id === fixture.homeClubId)!;
        const awayClub = state.clubs.find((c) => c.id === fixture.awayClubId)!;
        const homePlayers = state.players.filter((p) => p.clubId === homeClub.id);
        const awayPlayers = state.players.filter((p) => p.clubId === awayClub.id);

        const result = simulateMatch(homeClub, awayClub, homePlayers, awayPlayers, state.currentWeek, state.currentSeason);
        return {
          ...result,
          id: fixture.id,
          homeClubId: fixture.homeClubId,
          awayClubId: fixture.awayClubId,
          week: fixture.week,
          season: fixture.season,
          played: false,
        };
      },

      finalizeMatchday: (userMatch) => {
        const state = get();
        const { currentWeek, currentSeason, clubs, players, leagues, userClubId } = state;
        if (!userClubId) return;

        const transferWindowOpen = isTransferWindowWeek(currentWeek);
        const transferUpdates = processAITransfers({ ...state, isTransferWindowOpen: transferWindowOpen });
        const clubsAfterTransfers = transferUpdates.clubs || clubs;
        const playersAfterTransfers = transferUpdates.players || players;

        const weeklyFixtures = state.matches.filter((m) => m.week === currentWeek && !m.played && m.id !== userMatch.id);
        const results = weeklyFixtures.map((fixture) => {
          const homeClub = clubsAfterTransfers.find((c) => c.id === fixture.homeClubId)!;
          const awayClub = clubsAfterTransfers.find((c) => c.id === fixture.awayClubId)!;
          const homePlayers = playersAfterTransfers.filter((p) => p.clubId === homeClub.id);
          const awayPlayers = playersAfterTransfers.filter((p) => p.clubId === awayClub.id);
          const result = simulateMatch(homeClub, awayClub, homePlayers, awayPlayers, currentWeek, currentSeason);
          return {
            ...result,
            id: fixture.id,
            homeClubId: fixture.homeClubId,
            awayClubId: fixture.awayClubId,
            week: fixture.week,
            season: fixture.season,
            played: true,
          };
        });

        const matchResults = [
          { ...userMatch, played: true },
          ...results,
        ];

        const resultMap = new Map(matchResults.map((m) => [m.id, m]));
        const updatedMatches = state.matches.map((fixture) => resultMap.has(fixture.id) ? resultMap.get(fixture.id)! : fixture);

        const updatedClubs = clubsAfterTransfers.map((club) => {
          const league = leagues.find((l) => l.id === club.leagueId);
          const tier = league?.tier || 3;
          const finances = { ...club.finances };
          const board = { ...club.board };
          let fanConfidence = club.fanConfidence;
          let boardConfidence = club.boardConfidence;
          const history = [...club.history];

          const sponsorIncome = calcSponsorWeeklyIncome(club.activeSponsors);
          finances.revenue.sponsorship = sponsorIncome;
          const tvRights = tier === 1 ? 240000 : tier === 2 ? 120000 : tier === 3 ? 75000 : tier === 4 ? 42000 : 22000;
          finances.revenue.tvRights = tvRights;
          const merchandise = Math.max(0, Math.floor(club.reputation * 350 + (20 - tier) * 250));
          finances.revenue.merchandise = merchandise;
          finances.revenue.prizeMoney = finances.revenue.prizeMoney || 0;

          const match = matchResults.find((m) => m.homeClubId === club.id || m.awayClubId === club.id);
          const ticketPrice = tier === 1 ? 60 : tier === 2 ? 40 : 25;
          let ticketIncome = 0;

          if (match && match.homeClubId === club.id) {
            const won = match.homeScore > match.awayScore;
            const drew = match.homeScore === match.awayScore;
            const performanceBonus = won ? 1.2 : drew ? 1.0 : 0.7;
            ticketIncome = Math.min(club.facilities.stadium.capacity, club.reputation * 90 * performanceBonus + Math.random() * 1000) * ticketPrice;
            finances.revenue.tickets = ticketIncome;
          } else {
            finances.revenue.tickets = 0;
          }

          finances.balance += sponsorIncome + tvRights + merchandise + ticketIncome;
          finances.expenses.playerWages = finances.weeklyWages;
          finances.expenses.staffWages = finances.weeklyStaffWages;
          const maintenanceCost = (finances.expenses.facilityMaintenance || 5000) * (tier === 1 ? 2.8 : tier === 2 ? 2.0 : 1.3);
          const totalExpenses = finances.expenses.playerWages + finances.expenses.staffWages + maintenanceCost + (finances.expenses.loanRepayments || 0);
          finances.balance -= totalExpenses;

          if (match) {
            const isHome = match.homeClubId === club.id;
            const won = isHome ? match.homeScore > match.awayScore : match.awayScore > match.homeScore;
            const drew = match.homeScore === match.awayScore;
            const confidenceChange = won ? 5 : drew ? 1 : -8;
            fanConfidence = Math.max(0, Math.min(100, fanConfidence + confidenceChange));
            const impatienceMult = (100 - board.patience) / 50;
            boardConfidence = Math.max(0, Math.min(100, boardConfidence + confidenceChange * impatienceMult));
            if (fanConfidence < 20 && Math.random() < 0.1) {
              history.push(`FAN PROTEST: Supporters gather outside ${club.stadiumName} demanding change!`);
              boardConfidence = Math.max(0, boardConfidence - 5);
            }
          }

          board.confidence = boardConfidence;

          return { ...club, finances, board, fanConfidence, boardConfidence, history };
        });

        const updatedPlayers = playersAfterTransfers.map((player) => {
          const club = updatedClubs.find((c) => c.id === player.clubId);
          if (!club) return player;

          const updatedPlayer = { ...player };
          updatedPlayer.fatigue = Math.max(0, updatedPlayer.fatigue - 15);
          updatedPlayer.fitness = Math.min(100, updatedPlayer.fitness + 10);
          if (Math.random() < 0.06) updatedPlayer.overallRating = Math.min(updatedPlayer.potentialRating, updatedPlayer.overallRating + 0.2);

          if (updatedPlayer.form.length >= 5) {
            updatedPlayer.form = [...updatedPlayer.form.slice(1), 6 + Math.random() * 3];
          }

          const teammates = playersAfterTransfers.filter((p) => p.clubId === player.clubId && p.id !== player.id);
          teammates.forEach((tm) => {
            const currentChem = updatedPlayer.chemistry[tm.id] || 0;
            if (Math.random() < 0.08) updatedPlayer.chemistry[tm.id] = Math.min(100, currentChem + 1);
          });

          if (updatedPlayer.happiness.adaptation < 100) {
            updatedPlayer.happiness.adaptation += 1;
            if (updatedPlayer.happiness.adaptation < 50) updatedPlayer.morale = Math.max(0, updatedPlayer.morale - 5);
          }

          return updatedPlayer;
        });

        const pendingBids = new Set(state.transferBids.filter((b) => b.status === 'PENDING').map((b) => b.playerId));
        const newBids: TransferBid[] = [...state.transferBids];
        updatedPlayers.filter((p) => p.isTransferListed && !pendingBids.has(p.id)).forEach((player) => {
          const buyer = updatedClubs.find((c) => c.id !== player.clubId && c.finances.balance > player.value);
          if (buyer && Math.random() < 0.18) {
            newBids.push({
              id: randomId(),
              playerId: player.id,
              fromClubId: buyer.id,
              toClubId: player.clubId,
              amount: Math.floor(player.value * (0.8 + Math.random() * 0.3)),
              status: 'PENDING',
              week: currentWeek + 1,
              season: currentSeason,
              isPlayerInterested: true,
              negotiationCount: 0
            });
          }
        });

        const nextWeek = currentWeek < 38 ? currentWeek + 1 : 1;
        const nextSeason = currentWeek < 38 ? currentSeason : currentSeason + 1;
        const nextTransferWindowOpen = isTransferWindowWeek(nextWeek);
        const clubsAfterSponsorExpiry = nextWeek === 1 ? updatedClubs.map((club) => ({
          ...club,
          activeSponsors: club.activeSponsors
            .map((sponsor) => ({ ...sponsor, duration: sponsor.duration - 1 }))
            .filter((sponsor) => sponsor.duration > 0)
        })) : updatedClubs;

        set({
          currentWeek: nextWeek,
          currentSeason: nextSeason,
          isTransferWindowOpen: nextTransferWindowOpen,
          matches: updatedMatches,
          clubs: clubsAfterSponsorExpiry.map((club) => {
            if (nextWeek === 1) {
              return {
                ...club,
                availableSponsors: [
                  { id: `sp-${club.id}-${randomId()}`, name: 'Elite Motors', type: 'MAIN', amount: Math.max(200000, Math.floor(club.reputation * 15000)), duration: 2, reputationRequired: Math.max(15, club.reputation - 5), status: 'PENDING' },
                  { id: `sp-${club.id}-${randomId()}`, name: 'Peak Nutrition', type: 'SLEEVE', amount: Math.max(50000, Math.floor(club.reputation * 6000)), duration: 1, reputationRequired: Math.max(10, club.reputation - 10), status: 'PENDING' }
                ]
              };
            }
            return club;
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
        if (club.activeSponsors.length >= 3) return;
        if (club.reputation < sponsor.reputationRequired) return;

        const weeklySponsorship = sponsor.amount / Math.max(1, sponsor.duration) / 38;

        set({
          clubs: state.clubs.map(c => c.id === clubId ? {
            ...c,
            availableSponsors: c.availableSponsors.filter(s => s.id !== sponsorId),
            activeSponsors: [...c.activeSponsors, { ...sponsor, status: 'ACTIVE' }],
            finances: { 
              ...c.finances, 
              revenue: { ...c.finances.revenue, sponsorship: (c.finances.revenue.sponsorship || 0) + weeklySponsorship } 
            },
            history: [...c.history, `Signed sponsorship deal with ${sponsor.name}`]
          } : c)
        });
      },

      buyClub: (clubId) => {
        const state = get();
        const club = state.clubs.find(c => c.id === clubId);
        if (!club || state.personalBalance < club.valuation) return;

        const remainingBalance = state.personalBalance - club.valuation;

        set({
          userClubId: clubId,
          personalBalance: 0,
          clubs: state.clubs.map(c => c.id === clubId ? { 
            ...c, 
            isUserControlled: true, 
            finances: { ...c.finances, balance: c.finances.balance + remainingBalance },
            history: [...c.history, `Club acquired by new owner`] 
          } : c)
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
        if (!bid) return;
        if (bid.negotiationCount >= 3) {
          set({
            transferBids: state.transferBids.map(b => b.id === bidId ? { ...b, status: 'CANCELLED' } : b)
          });
          return;
        }

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

      respondToTransferBid: (bidId, status) => {
        set((state) => ({
          transferBids: state.transferBids.map(b => b.id === bidId ? { ...b, status } : b)
        }));
      },

      finalizeTransfer: (bidId) => {
        const state = get();
        const bid = state.transferBids.find(b => b.id === bidId);
        if (!bid || bid.status !== 'ACCEPTED') return;
        const player = state.players.find(p => p.id === bid.playerId);
        if (!player) return;

        set({
          transferBids: state.transferBids.filter(b => b.id !== bidId),
          players: state.players.map(p => p.id === bid.playerId ? { ...p, clubId: bid.fromClubId, isTransferListed: false } : p),
          clubs: state.clubs.map(c => {
            if (c.id === bid.fromClubId) {
              return { 
                ...c, 
                finances: { ...c.finances, balance: c.finances.balance - bid.amount },
                transferBudget: Math.max(0, c.transferBudget - bid.amount),
                history: [...c.history, `Signed ${player.firstName} ${player.lastName} for £${(bid.amount / 1000000).toFixed(1)}M`]
              };
            }
            if (c.id === bid.toClubId) {
              return { 
                ...c, 
                finances: { ...c.finances, balance: c.finances.balance + bid.amount },
                history: [...c.history, `Sold ${player.firstName} ${player.lastName} for £${(bid.amount / 1000000).toFixed(1)}M`]
              };
            }
            return c;
          })
        });
      },

      makeTransferBid: (playerId, clubId, amount) => {
        const state = get();
        const player = state.players.find(p => p.id === playerId);
        if (!player) return;
        const bid: TransferBid = {
          id: randomId(),
          playerId,
          fromClubId: clubId,
          toClubId: player.clubId,
          amount,
          status: 'PENDING',
          week: state.currentWeek,
          season: state.currentSeason,
          isPlayerInterested: true,
          negotiationCount: 0
        };
        set({
          transferBids: [...state.transferBids, bid]
        });
      },

      setFormation: (clubId, formation) => {
        set((state) => ({
          clubs: state.clubs.map(c => c.id === clubId ? { ...c, formation } : c)
        }));
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
