import type { StateCreator } from 'zustand';
import type { Club, SeasonTarget } from '../../types/game';
import { autoPickLineup } from '../../utils/dataGenerator';
import { client } from '../../api/client';

export interface ClubSlice {
  clubs: Club[];
  updateClub: (clubId: string, updates: Partial<Club>) => void;
  upgradeFacility: (clubId: string, facilityType: 'stadium' | 'trainingGround' | 'medicalCenter' | 'youthAcademy') => Promise<void>;
  buyClub: (clubId: string, newName?: string) => Promise<void>;
  sellClub: (clubId: string) => void;
  renameClub: (clubId: string, newName: string) => void;
  acceptSponsor: (clubId: string, sponsorId: string) => Promise<void>;
  setSeasonTarget: (clubId: string, target: SeasonTarget) => void;
  setTransferBudget: (clubId: string, amount: number) => void;
  setFormation: (clubId: string, formation: string) => void;
  setTactics: (clubId: string, tactics: string) => void;
  setTrainingFocus: (clubId: string, focus: string) => void;
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
    } catch (error) {
      console.error('Failed to upgrade facility:', error);
      return;
    }

    set({
      clubs: state.clubs.map(c => c.id === clubId ? {
        ...c,
        finances: { ...c.finances, balance: c.finances.balance - upgradeCost },
        facilities: {
          ...c.facilities,
          [type]: {
            ...facility,
            level: facility.level + 1,
            upgradeCost: Math.floor(upgradeCost * 1.5),
            ...(type === 'stadium' ? { capacity: Math.floor(c.facilities.stadium.capacity * 1.15) } : {})
          }
        },
        history: [...c.history, `Upgraded ${type} to level ${facility.level + 1}`]
      } : c)
    });
  },

  buyClub: async (clubId, newName) => {
    const state = get();
    const club = state.clubs.find(c => String(c.id) === String(clubId));
    if (!club || state.personalBalance < club.valuation) return;

    await client.buyClub(clubId, newName);

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

  sellClub: (clubId) => {
    const state = get();
    const club = state.clubs.find(c => String(c.id) === String(clubId));
    if (!club) return;

    set({
      userClubId: null,
      hasActiveSession: false,
      personalBalance: state.personalBalance + club.valuation,
      clubs: state.clubs.map(c => String(c.id) === String(clubId) ? { ...c, isUserControlled: false, history: [...c.history, `Club sold by owner`] } : c)
    });
  },

  renameClub: (clubId, newName) => {
    client.updateClub(clubId, { name: newName }).catch((error: unknown) => {
      console.error('Failed to rename club:', error);
    });
    set((state) => ({
      clubs: state.clubs.map(c => c.id === clubId ? { ...c, name: newName } : c)
    }));
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

  setSeasonTarget: (clubId, target) => {
    client.updateClub(clubId, { seasonTarget: target } as any).catch((error: unknown) => {
      console.error('Failed to update season target:', error);
    });
    set((state) => ({
      clubs: state.clubs.map(c => c.id === clubId ? { ...c, seasonTarget: target } : c)
    }));
  },

  setTransferBudget: (clubId, amount) => {
    client.updateClub(clubId, { transferBudget: amount } as any).catch((error: unknown) => {
      console.error('Failed to update transfer budget:', error);
    });
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
    const lineup = autoPickLineup(formation as any, players);

    client.updateClub(clubId, { formation, startingLineup: lineup }).catch((error: unknown) => {
      console.error('Failed to update formation:', error);
    });

    set((state) => ({
      clubs: state.clubs.map(c => c.id === clubId ? {
        ...c,
        formation: formation as any,
        startingLineup: lineup
      } : c)
    }));
  },


  setTactics: (clubId, tactics) => {
    client.updateClub(clubId, { tactics }).catch((error: unknown) => {
      console.error('Failed to update tactics:', error);
    });

    set((state) => ({
      clubs: state.clubs.map(c => c.id === clubId ? { ...c, tactics } : c)
    }));
  },

  setTrainingFocus: (clubId, trainingFocus) => {
    client.updateClub(clubId, { trainingFocus }).catch((error: unknown) => {
      console.error('Failed to update training focus:', error);
    });

    set((state) => ({
      clubs: state.clubs.map(c => c.id === clubId ? { ...c, trainingFocus } : c)
    }));
  },
});
