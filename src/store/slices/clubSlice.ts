import type { StateCreator } from 'zustand';
import type { Club, SeasonTarget, Formation, TacticalPhilosophy, TrainingFocus } from '../../types/game';
import type { StoreState } from '../types';
import { autoPickLineup } from '../../utils/dataGenerator';
import { client } from '../../api/client';

export interface ClubSlice {
  clubs: Club[];
  updateClub: (clubId: string, updates: Partial<Club>) => void;
  upgradeFacility: (clubId: string, facilityType: 'stadium' | 'trainingGround' | 'medicalCenter' | 'youthAcademy') => Promise<void>;
  buyClub: (clubId: string, newName?: string) => Promise<void>;
  sellClub: (clubId: string) => Promise<void>;
  renameClub: (clubId: string, newName: string) => Promise<void>;
  acceptSponsor: (clubId: string, sponsorId: string) => Promise<void>;
  setSeasonTarget: (clubId: string, target: SeasonTarget) => Promise<void>;
  setTransferBudget: (clubId: string, amount: number) => Promise<void>;
  setFormation: (clubId: string, formation: string) => Promise<void>;
  setTactics: (clubId: string, tactics: string) => Promise<void>;
  setTrainingFocus: (clubId: string, focus: string) => Promise<void>;
}


export const createClubSlice: StateCreator<
  StoreState,
  [],
  [],
  ClubSlice
> = (set, get) => ({
  clubs: [],

  updateClub: (clubId, updates) =>
    set((state) => ({
      clubs: state.clubs.map((club) => club.id === clubId ? { ...club, ...updates } : club),
    })),

  upgradeFacility: async (clubId, type) => {
    const state = get();
    const club = state.clubs.find(c => c.id === clubId);
    if (!club) return;

    const facility = club.facilities[type];
    // Use the upgradeCost directly — it is already tier-scaled during data generation
    const upgradeCost = facility.upgradeCost;
    if (club.finances.balance < upgradeCost) return;

    const backendType = {
      stadium: 'stadium',
      trainingGround: 'training',
      medicalCenter: 'medical',
      youthAcademy: 'youth',
    }[type];

    try {
      await client.upgradeFacility(clubId, backendType);
      await get().syncData();
    } catch (error) {
      console.error('Failed to upgrade facility:', error);
    }
  },

  buyClub: async (clubId, newName) => {
    const state = get();
    const club = state.clubs.find(c => String(c.id) === String(clubId));
    if (!club || state.personalBalance == null || state.personalBalance < club.valuation) return;

    try {
      await client.buyClub(clubId, newName);
    } catch (error) {
      console.error('Failed to buy club:', error);
      return;
    }

    const remainingBalance = state.personalBalance - club.valuation;
    const clubName = newName?.trim() || club.name;

    set({
      userClubId: clubId,
      hasActiveSession: true,
      personalBalance: remainingBalance,
      managers: state.managers.filter(m => m.clubId !== clubId),
      clubs: state.clubs.map(c => c.id === clubId ? {
        ...c,
        name: clubName,
        isUserControlled: true,
        finances: { ...c.finances },
        history: [...c.history, `Club acquired by new owner`, `Previous manager departed following takeover`]
      } : c)
    });
  },

  sellClub: async (clubId) => {
    const state = get();
    const club = state.clubs.find(c => String(c.id) === String(clubId));
    if (!club) return;

    try {
      await client.updateClub(clubId, { is_user_controlled: false });
    } catch (error) {
      console.error('Failed to sell club:', error);
      return;
    }

    set({
      userClubId: null,
      hasActiveSession: false,
      personalBalance: state.personalBalance + club.valuation,
      clubs: state.clubs.map(c => String(c.id) === String(clubId) ? { ...c, isUserControlled: false, history: [...c.history, `Club sold by owner`] } : c)
    });
  },

  renameClub: async (clubId, newName) => {
    try {
      await client.updateClub(clubId, { name: newName });
      set((state) => ({
        clubs: state.clubs.map(c => c.id === clubId ? { ...c, name: newName } : c)
      }));
    } catch (error) {
      console.error('Failed to rename club:', error);
    }
  },

  acceptSponsor: async (clubId, sponsorId) => {
    const state = get();
    const club = state.clubs.find(c => c.id === clubId);
    const sponsor = club?.availableSponsors.find(s => s.id === sponsorId);
    if (!club || !sponsor) return;
    if (club.activeSponsors.length >= 3) return;
    if (club.reputation < sponsor.reputationRequired) return;

    try {
      await client.acceptSponsor(clubId, sponsorId);
    } catch (error) {
      console.error('Failed to accept sponsor:', error);
      return;
    }

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

  setSeasonTarget: async (clubId, target) => {
    try {
      await client.updateClub(clubId, { seasonTarget: target });
      set((state) => ({
        clubs: state.clubs.map(c => c.id === clubId ? { ...c, seasonTarget: target } : c)
      }));
    } catch (error) {
      console.error('Failed to update season target:', error);
    }
  },

  setTransferBudget: async (clubId, amount) => {
    try {
      await client.updateClub(clubId, { transferBudget: amount });
      set((state) => ({
        clubs: state.clubs.map(c => c.id === clubId ? {
          ...c,
          transferBudget: Math.min(c.finances.balance, amount)
        } : c)
      }));
    } catch (error) {
      console.error('Failed to update transfer budget:', error);
    }
  },

  setFormation: async (clubId, formation) => {
    const state = get();
    const players = (state.players || []).filter(p => p.clubId === clubId);
    const lineup = autoPickLineup(formation as Formation, players);

    try {
      await client.updateClub(clubId, { formation, startingLineup: lineup });
      set((state) => ({
        clubs: state.clubs.map(c => c.id === clubId ? {
          ...c,
          formation: formation as Formation,
          startingLineup: lineup
        } : c)
      }));
    } catch (error) {
      console.error('Failed to update formation:', error);
    }
  },


  setTactics: async (clubId, tactics) => {
    try {
      await client.updateClub(clubId, { tactics });
      set((state) => ({
        clubs: state.clubs.map(c => c.id === clubId ? { ...c, tactics: tactics as TacticalPhilosophy } : c)
      }));
    } catch (error) {
      console.error('Failed to update tactics:', error);
    }
  },

  setTrainingFocus: async (clubId, trainingFocus) => {
    try {
      await client.updateClub(clubId, { trainingFocus });
      set((state) => ({
        clubs: state.clubs.map(c => c.id === clubId ? { ...c, trainingFocus: trainingFocus as TrainingFocus } : c)
      }));
    } catch (error) {
      console.error('Failed to update training focus:', error);
    }
  },
});
