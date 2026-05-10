import type { StateCreator } from 'zustand';
import type { Club, SeasonTarget } from '../../types/game';
import { autoPickLineup } from '../../utils/dataGenerator';

export interface ClubSlice {
  clubs: Club[];
  updateClub: (clubId: string, updates: Partial<Club>) => void;
  upgradeFacility: (clubId: string, facilityType: 'stadium' | 'trainingGround' | 'medicalCenter' | 'youthAcademy') => void;
  buyClub: (clubId: string) => void;
  sellClub: (clubId: string) => void;
  renameClub: (clubId: string, newName: string) => void;
  acceptSponsor: (clubId: string, sponsorId: string) => void;
  setSeasonTarget: (clubId: string, target: SeasonTarget) => void;
  setTransferBudget: (clubId: string, amount: number) => void;
  setFormation: (clubId: string, formation: string) => void;
  setTactics: (clubId: string, tactics: string) => void;
}


export const createClubSlice: StateCreator<
  ClubSlice & any,
  [],
  [],
  ClubSlice
> = (set, get) => ({
  clubs: [],

  updateClub: (clubId, updates) =>
    set((state) => ({
      clubs: state.clubs.map((club) => club.id === clubId ? { ...club, ...updates } : club),
    })),

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

  buyClub: (clubId) => {
    const state = get();
    const club = state.clubs.find(c => c.id === clubId);
    if (!club || state.personalBalance < club.valuation) return;

    const remainingBalance = state.personalBalance - club.valuation;

    set({
      userClubId: clubId,
      personalBalance: remainingBalance,
      managers: state.managers.filter(m => m.clubId !== clubId),
      clubs: state.clubs.map(c => c.id === clubId ? {
        ...c,
        isUserControlled: true,
        finances: { ...c.finances, balance: c.finances.balance + remainingBalance },
        history: [...c.history, `Club acquired by new owner`, `Previous manager departed following takeover`]
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

  setFormation: (clubId, formation) => {
    const state = get();
    const players = (state.players || []).filter(p => p.clubId === clubId);
    
    set((state) => ({
      clubs: state.clubs.map(c => c.id === clubId ? { 
        ...c, 
        formation: formation as any,
        startingLineup: autoPickLineup(formation as any, players)
      } : c)
    }));
  },


  setTactics: (clubId, tactics) => {
    set((state) => ({
      clubs: state.clubs.map(c => c.id === clubId ? { ...c, tactics } : c)
    }));
  },
});
