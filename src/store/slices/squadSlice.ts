import type { StateCreator } from 'zustand';
import type { Player, Manager, Staff, StaffRole, TransferBid, TransferRequest } from '../../types/game';

export interface SquadSlice {
  players: Player[];
  shortlist: string[];
  managers: Manager[];
  staff: Staff[];
  transferBids: TransferBid[];
  transferRequests: TransferRequest[];
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  sackManager: (managerId: string) => void;
  hireManager: (clubId: string, manager: Manager) => void;
  hireStaff: (clubId: string, staffMember: Staff) => void;
  dismissStaff: (staffId: string) => void;
  hireStaffApplicant: (clubId: string, applicantId: string) => void;
  advertiseStaffRole: (clubId: string, role: StaffRole) => void;
  toggleTransferList: (playerId: string) => void;
  toggleLoanList: (playerId: string) => void;
  releasePlayer: (playerId: string) => void;
  toggleShortlist: (playerId: string) => void;
  clearScoutAssignment: (clubId: string, scoutId: string) => void;
  assignScout: (clubId: string, scoutId: string, region: string) => void;
  respondToTransferRequest: (requestId: string, status: 'APPROVED' | 'REJECTED' | 'DELAYED', budgetLimit?: number) => void;
  makeTransferBid: (playerId: string, clubId: string, amount: number) => void;
  respondToTransferBid: (bidId: string, status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED') => void;
  negotiateBid: (bidId: string, counterAmount: number) => void;
  finalizeTransfer: (bidId: string) => void;
}

export const createSquadSlice: StateCreator<
  SquadSlice & any,
  [],
  [],
  SquadSlice
> = (set, get) => ({
  players: [],
  shortlist: [],
  managers: [],
  staff: [],
  transferBids: [],
  transferRequests: [],

  updatePlayer: (playerId, updates) =>
    set((state) => ({
      players: state.players.map((player) => player.id === playerId ? { ...player, ...updates } : player),
    })),

  sackManager: (managerId) => {
    const state = get();
    const manager = state.managers.find(m => m.id === managerId);
    if (!manager || !manager.clubId) return;

    const club = state.clubs.find(c => c.id === manager.clubId);
    if (!club) return;

    // Calculate compensation: remaining contract weeks * weekly salary
    const weeklySalary = manager.salary;
    const compensationCost = manager.contractWeeksRemaining * weeklySalary;
    const newBalance = club.finances.balance - compensationCost;

    // Block sacking if it would exceed overdraft limit
    if (newBalance < -500000) return;

    // Generate news story
    const newsItem = {
      id: Math.random().toString(36).substring(2, 11),
      title: `${club.name} Sack ${manager.name}`,
      content: `${manager.name} has been sacked as manager of ${club.name}. Compensation of $${compensationCost.toLocaleString()} was paid for the remaining contract.`,
      category: 'CLUB' as const,
      importance: 'HIGH' as const,
      clubId: club.id,
      week: state.currentWeek,
      season: state.currentSeason
    };

    set((s) => ({
      managers: s.managers.map((m) => m.id === managerId ? { ...m, clubId: '', relationshipWithChairman: 0, wantsToLeave: false } : m),
      clubs: s.clubs.map(c => c.id === manager.clubId ? {
        ...c,
        history: [...c.history, `Manager sacked by the chairman - compensation paid: $${compensationCost.toLocaleString()}`],
        finances: { ...c.finances, balance: newBalance }
      } : c),
      news: [newsItem, ...s.news].slice(0, 100)
    }));
  },

  hireManager: (clubId, manager) =>
    set((state) => {
      const exists = state.managers.some(m => m.id === manager.id);
      const updatedManagers = exists
        ? state.managers.map((m) => m.id === manager.id ? { ...m, clubId, relationshipWithChairman: 70, wantsToLeave: false } : m)
        : [...state.managers, { ...manager, clubId, relationshipWithChairman: 70, wantsToLeave: false }];

      return {
        managers: updatedManagers,
        clubs: state.clubs.map(c => c.id === clubId ? {
          ...c,
          history: [...c.history, `Hired new manager: ${manager.name}`],
          formation: manager.preferredFormation,
          tactics: manager.preferredStyle
        } : c)
      };
    }),

  hireStaff: (clubId, staffMember) =>
    set((state) => {
      const newStaff = [...state.staff.filter(s => s.id !== staffMember.id), { ...staffMember, clubId }];
      const clubStaffWages = newStaff.filter(s => s.clubId === clubId).reduce((sum, s) => sum + (s.salary || 0), 0);
      return {
        staff: newStaff,
        clubs: state.clubs.map(c => c.id === clubId ? { ...c, finances: { ...c.finances, weeklyStaffWages: clubStaffWages } } : c)
      };
    }),


  dismissStaff: (staffId) =>
    set((state) => ({
      staff: state.staff.filter(s => s.id !== staffId)
    })),

  hireStaffApplicant: (clubId, applicantId) => {
    const state = get();
    const club = state.clubs.find(c => c.id === clubId);
    if (!club) return;
    const applicant = club.staffApplicants.find(a => a.id === applicantId);
    if (!applicant) return;

    const newStaff = [...state.staff.filter(s => s.id !== applicant.id), { ...applicant, clubId, isApplicant: false }];
    const clubStaffWages = newStaff.filter(s => s.clubId === clubId).reduce((sum, s) => sum + (s.salary || 0), 0);

    set({
      staff: newStaff,
      clubs: state.clubs.map(c => c.id === clubId ? {
        ...c,
        finances: { ...c.finances, weeklyStaffWages: clubStaffWages },
        staffApplicants: (c.staffApplicants || []).filter(a => a.id !== applicantId)
      } : c)
    });

  },

  advertiseStaffRole: (clubId, role) => {
    const state = get();
    const club = state.clubs.find(c => c.id === clubId);
    if (!club) return;

    const adCost = 10000;
    if (club.finances.balance < adCost) return;

    set({
      clubs: state.clubs.map(c => c.id === clubId ? {
        ...c,
        finances: { ...c.finances, balance: c.finances.balance - adCost },
        staffAds: [...c.staffAds, { id: Math.random().toString(36).substring(2, 11), role, weeksRemaining: 2, cost: adCost }]
      } : c)
    });
  },

  toggleTransferList: (playerId) =>
    set((state) => ({
      players: state.players.map(p => p.id === playerId ? { ...p, isTransferListed: !p.isTransferListed } : p)
    })),

  toggleLoanList: (playerId) =>
    set((state) => ({
      players: state.players.map(p => p.id === playerId ? { ...p, isLoanListed: !p.isLoanListed } : p)
    })),

  toggleShortlist: (playerId) =>
    set((state) => ({
      shortlist: state.shortlist?.includes(playerId)
        ? state.shortlist.filter(id => id !== playerId)
        : [...(state.shortlist || []), playerId]
    })),

  clearScoutAssignment: (clubId, scoutId) =>
    set((state) => ({
      clubs: state.clubs.map(c => c.id === clubId ? {
        ...c,
        scoutAssignments: (c.scoutAssignments || []).filter(a => a.scoutId !== scoutId)
      } : c)
    })),

  releasePlayer: (playerId) =>
    set((state) => {
      const player = state.players.find(p => p.id === playerId);
      if (!player) return state;
      return {
        players: state.players.map(p => p.id === playerId ? { ...p, clubId: '', isTransferListed: false, contractYears: 0 } : p),
        clubs: state.clubs.map(c => c.id === player.clubId ? {
          ...c,
          finances: { ...c.finances, weeklyWages: Math.max(0, (c.finances.weeklyWages || 0) - (player.wage || 0)) },
          history: [...c.history, `Released ${player.firstName} ${player.lastName} from contract.`]
        } : c)
      };
    }),

  assignScout: (clubId, scoutId, region) => {
    set((state) => ({
      clubs: state.clubs.map(c => c.id === clubId ? {
        ...c,
        scoutAssignments: [...c.scoutAssignments, { scoutId, region, progress: 0, playersFound: [] }]
      } : c)
    }));
  },

  respondToTransferRequest: (requestId, status, budgetLimit) => {
    const state = get();
    const request = state.transferRequests.find(r => r.id === requestId);
    if (!request) return;

    const club = state.clubs.find(c => c.id === request.clubId);
    const manager = state.managers.find(m => m.clubId === request.clubId);
    if (!club || !manager) return;

    // Calculate relationship change
    let relationshipChange = 0;
    if (status === 'APPROVED') {
      relationshipChange = 8;
    } else if (status === 'REJECTED') {
      relationshipChange = -12;
    } else if (status === 'DELAYED') {
      relationshipChange = -4;
    }

    set({
      transferRequests: state.transferRequests.map(r => r.id === requestId ? { ...r, status, budgetLimit } : r),
      managers: state.managers.map(m => m.id === manager.id ? {
        ...m,
        relationshipWithChairman: Math.max(0, Math.min(100, m.relationshipWithChairman + relationshipChange))
      } : m)
    });
  },

  makeTransferBid: (playerId, clubId, amount) => {
    const state = get();
    const player = state.players.find(p => p.id === playerId);
    const club = state.clubs.find(c => c.id === clubId);
    if (!player || !club) return;

    const sportingDirector = state.staff.find(s => s.clubId === clubId && s.role === 'SPORTING_DIRECTOR');
    const finalAmount = sportingDirector && sportingDirector.rating > 60
      ? Math.max(0, Math.round(amount * (1 - sportingDirector.rating / 1500)))
      : amount;

    // Check budget for user clubs — use balance if no warchest has been set
    const effectiveBudget = (club.transferBudget && club.transferBudget > 0)
      ? club.transferBudget
      : club.finances.balance;
    if (club.isUserControlled && finalAmount > effectiveBudget) {
      return;
    }

    const bid: TransferBid = {
      id: Math.random().toString(36).substring(2, 11),
      playerId,
      fromClubId: clubId,
      toClubId: player.clubId,
      amount: finalAmount,
      status: 'PENDING',
      week: state.currentWeek,
      season: state.currentSeason,
      isPlayerInterested: true,
      negotiationCount: 0
    };

    set({ transferBids: [...state.transferBids, bid] });
  },


  respondToTransferBid: (bidId, status) => {
    set((state) => ({
      transferBids: state.transferBids.map(b => b.id === bidId ? { ...b, status } : b)
    }));
  },

  negotiateBid: (bidId, counterAmount) => {
    set((state) => ({
      transferBids: state.transferBids.map(b => b.id === bidId ? {
        ...b,
        amount: counterAmount,
        negotiationCount: b.negotiationCount + 1
      } : b)
    }));
  },

  finalizeTransfer: (bidId) => {
    const state = get();
    const bid = state.transferBids.find(b => b.id === bidId);
    if (!bid || bid.status !== 'ACCEPTED') return;

    const player = state.players.find(p => p.id === bid.playerId);
    const seller = state.clubs.find(c => c.id === bid.toClubId);
    const buyer = state.clubs.find(c => c.id === bid.fromClubId);
    if (!player || !buyer) return;

    set({
      players: state.players.map(p => p.id === bid.playerId ? { ...p, clubId: bid.fromClubId, isTransferListed: false } : p),
      clubs: state.clubs.map(c => {
        if (c.id === buyer.id) {
          return {
            ...c,
            finances: { ...c.finances, balance: c.finances.balance - bid.amount },
            history: [...c.history, `Signed ${player.firstName} ${player.lastName} for £${(bid.amount / 1000000).toFixed(1)}M`]
          };
        }
        if (seller && c.id === seller.id) {
          return {
            ...c,
            finances: { ...c.finances, balance: c.finances.balance + bid.amount },
            history: [...c.history, `Sold ${player.firstName} ${player.lastName} for £${(bid.amount / 1000000).toFixed(1)}M`]
          };
        }
        return c;
      }),
      transferBids: state.transferBids.filter(b => b.id !== bidId)
    });
  },
});