import type { StateCreator } from 'zustand';
import { type GameState } from '../../types/game';
import { generateFixtures } from '../../utils/fixtureGenerator';
import { generateInitialData, generatePlayer, getRandomElement } from '../../utils/dataGenerator';

import { processAITransfers } from '../../utils/transferEngine';


export interface GameSlice {
  currentSeason: number;
  currentWeek: number;
  isTransferWindowOpen: boolean;
  userClubId: string | null;
  personalBalance: number;
  initializeGame: () => void;
  advanceWeek: () => void;
  setGameState: (state: Partial<GameState>) => void;
  skipWeeks: (weeks: number) => void;
}

export const createGameSlice: StateCreator<
  GameSlice & any,
  [],
  [],
  GameSlice
> = (set, get) => ({
  currentSeason: 2024,
  currentWeek: 1,
  isTransferWindowOpen: false,
  userClubId: null,
  personalBalance: 0,

  initializeGame: () => {
    const data = generateInitialData();
    set({
      ...data,
      userClubId: data.clubs.find(c => c.isUserControlled)?.id || null,
    });
  },

  setGameState: (state) => set((prev) => ({ ...prev, ...state })),

  advanceWeek: () => {
    const state = get() as any;
    const { currentWeek, currentSeason, leagues, news } = state;


    if (!leagues || !state.clubs || !state.players) return;


    // 1. Finalize current week matches
    state.finalizeMatchday(null);
    
    // IMPORTANT: Get fresh state after match simulation
    const freshState = get() as any;
    const { players: freshPlayers, matches: freshMatches, clubs: freshClubs } = freshState;

    // 2. Financial & Transfer Market Processing
    const transferUpdates = processAITransfers(freshState);
    const aiTransferredPlayers = transferUpdates.players || freshPlayers;

    const allNewPlayers: any[] = [];
    const newNews: any[] = [];
    let updatedManagers = [...state.managers];

    const clubsWithUpdates = freshClubs.map((club: any) => {
      const tier = leagues.find((l: any) => l.id === club.leagueId)?.tier || 3;
      
      // Transfer Logic
      let currentClub = { ...club };
      const transferClub = transferUpdates.clubs?.find((c: any) => c.id === club.id);
      if (transferClub) currentClub = { ...currentClub, ...transferClub };

      // Finance Logic
      const finances = { ...currentClub.finances };
      const sponsorIncome = currentClub.activeSponsors.reduce((sum: number, s: any) => sum + (s.amount / Math.max(1, s.duration) / 38), 0);
      const tvRights = (tier === 1 ? 240000 : tier === 2 ? 120000 : tier === 3 ? 75000 : 40000);
      const merchandise = Math.floor(currentClub.reputation * 350 + (20 - tier) * 250);
      
      const weeklyMatches = freshMatches.filter((m: any) => m.week === currentWeek && m.season === currentSeason && m.homeClubId === currentClub.id);
      const ticketIncome = weeklyMatches.reduce((sum: number) => {
         const ticketPrice = tier === 1 ? 60 : tier === 2 ? 40 : 25;
         const attendance = Math.min(currentClub.facilities.stadium.capacity, currentClub.reputation * 90 + Math.random() * 1000);
         return sum + (attendance * ticketPrice);
      }, 0);

      finances.balance += sponsorIncome + tvRights + merchandise + ticketIncome;
      finances.revenue = { sponsorship: sponsorIncome, tvRights, merchandise, tickets: ticketIncome };

      const playerWages = currentClub.finances.weeklyWages || 0;
      const staffWages = currentClub.finances.weeklyStaffWages || 0;
      const maintenance = (tier === 1 ? 50000 : tier === 2 ? 25000 : 10000);
      finances.balance -= (playerWages + staffWages + maintenance);
      finances.expenses = { playerWages, staffWages, facilityMaintenance: maintenance };

      // Scouting Logic
      const scoutAssignments = currentClub.scoutAssignments.map((a: any) => {
        const newProgress = Math.min(100, a.progress + 15 + Math.random() * 10);
        const playersFound = [...a.playersFound];
        if (newProgress === 100 && a.progress < 100) {
          const count = 2 + Math.floor(Math.random() * 3);
          for (let i = 0; i < count; i++) {
            const p = generatePlayer('', tier);
            allNewPlayers.push(p);
            playersFound.push(p.id);
          }
        }
        return { ...a, progress: newProgress, playersFound };
      });

      // Youth Intake (Week 38)
      const clubHistory = [...currentClub.history];
      if (currentWeek === 38) {
        const academyLevel = currentClub.facilities.youthAcademy.level;
        const intakeCount = Math.floor(Math.random() * (academyLevel + 1));
        for (let i = 0; i < intakeCount; i++) {
          const youth = generatePlayer(currentClub.id, tier, true);
          allNewPlayers.push(youth);
          clubHistory.push(`Youth Academy graduate: ${youth.firstName} ${youth.lastName} joined.`);
        }
      }

      // Board Confidence & Sacking Logic
      let boardConfidence = currentClub.boardConfidence || 70;
      const clubManager = updatedManagers.find(m => m.clubId === currentClub.id);
      if (clubManager) {
        let confidenceChange = 0;
        const recentMatches = freshMatches
          .filter((m: any) => (m.homeClubId === currentClub.id || m.awayClubId === currentClub.id) && m.played && m.season === currentSeason)
          .sort((a: any, b: any) => b.week - a.week)
          .slice(0, 3);
        recentMatches.forEach((m: any) => {
          const isHome = m.homeClubId === currentClub.id;
          const isWin = isHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
          confidenceChange += isWin ? 5 : (m.homeScore === m.awayScore ? 1 : -3);
        });
        if (finances.balance < 0) confidenceChange -= 2;
        boardConfidence = Math.max(0, Math.min(100, boardConfidence + confidenceChange));

        if (boardConfidence < 15) {
          if (currentClub.isUserControlled) {
            newNews.push({
              title: "Board Ultimatum",
              content: `Results must improve immediately for ${clubManager.name}.`,
              category: 'CLUB', importance: 'BREAKING', clubId: currentClub.id
            });
          } else {
            updatedManagers = updatedManagers.map(m => m.id === clubManager.id ? { ...m, clubId: '', relationshipWithChairman: 0 } : m);
            clubHistory.push(`Manager ${clubManager.name} was sacked.`);
            newNews.push({
              title: `${currentClub.name} Sack ${clubManager.name}`,
              content: `Poor results led to ${clubManager.name}'s departure.`,
              category: 'WORLD', importance: 'HIGH', clubId: currentClub.id
            });
          }
        }
      }

      // Staff Ads
      const staffAds = (currentClub.staffAds || []).map((ad: any) => ({ ...ad, weeksRemaining: ad.weeksRemaining - 1 }));
      const activeAds = staffAds.filter((ad: any) => ad.weeksRemaining > 0);
      const applicants = [...(currentClub.staffApplicants || [])];
      staffAds.filter((ad: any) => ad.weeksRemaining <= 0).forEach((ad: any) => {
        for (let i = 0; i < 2; i++) {
          applicants.push({
            id: Math.random().toString(36).substring(2, 11),
            name: `${generatePlayer('', 1).firstName} ${generatePlayer('', 1).lastName}`,
            role: ad.role, rating: 30 + Math.random() * 50, salary: 15000, clubId: currentClub.id, isApplicant: true
          });
        }
      });

      // Sponsorship Refresh Logic
      const availableSponsors = [...(currentClub.availableSponsors || [])];
      if (availableSponsors.length < 3 && Math.random() < 0.1) {
        const rep = currentClub.reputation;
        const newSponsor = {
          id: `sp-${currentClub.id}-${Date.now()}`,
          name: getRandomElement(['Vortex', 'Pulse', 'Quantum', 'Nexus', 'Horizon']) + ' ' + getRandomElement(['Solutions', 'Systems', 'Digital', 'Global', 'Logistics']),
          type: getRandomElement(['MAIN', 'SLEEVE', 'STADIUM'] as any[]),
          amount: Math.floor(rep * (Math.random() * 5000 + 5000)),
          duration: 1 + Math.floor(Math.random() * 3),
          reputationRequired: Math.max(0, Math.floor(rep + (Math.random() * 20 - 10))),
          status: 'PENDING' as const
        };
        availableSponsors.push(newSponsor);
      }

      return { 
        ...currentClub, 
        finances, 
        scoutAssignments, 
        history: clubHistory, 
        boardConfidence, 
        staffAds: activeAds, 
        staffApplicants: applicants,
        availableSponsors
      };
    });


    // 3. Time Progression
    let nextWeek = currentWeek + 1;
    let nextSeason = currentSeason;
    let newMatches = [...freshMatches];

    if (nextWeek > 38) {
      nextWeek = 1;
      nextSeason++;

      const sortedLeagues = [...leagues].sort((a: any, b: any) => a.tier - b.tier);
      const changes: { clubId: string; updates: any }[] = [];
      
      sortedLeagues.forEach((league, index) => {
        const leagueClubs = clubsWithUpdates.filter((c: any) => c.leagueId === league.id);
        const standings = leagueClubs.map((club: any) => {
          const clubMatches = freshMatches.filter((m: any) => 
            (m.homeClubId === club.id || m.awayClubId === club.id) && 
            m.played && 
            m.season === currentSeason
          );
          
          let pts = 0, gf = 0, ga = 0;
          clubMatches.forEach(m => {
            const isHome = m.homeClubId === club.id;
            const clubScore = isHome ? m.homeScore : m.awayScore;
            const oppScore = isHome ? m.awayScore : m.homeScore;
            gf += clubScore; ga += oppScore;
            if (clubScore > oppScore) pts += 3;
            else if (clubScore === oppScore) pts += 1;
          });
          
          return { clubId: club.id, pts, gd: gf - ga, gf };
        }).sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.gd !== a.gd ? b.gd - a.gd : b.gf - a.gf);

        const leagueAbove = sortedLeagues[index - 1];
        const leagueBelow = sortedLeagues[index + 1];

        if (leagueAbove) {
          standings.slice(0, 3).forEach((s) => {
            changes.push({ clubId: s.clubId, updates: { leagueId: leagueAbove.id } });
          });
        }
        if (leagueBelow) {
          standings.slice(-3).forEach((s) => {
            changes.push({ clubId: s.clubId, updates: { leagueId: leagueBelow.id } });
          });
        }
      });

      // Apply changes to the mapped clubs
      changes.forEach(change => {
        const clubIdx = clubsWithUpdates.findIndex(c => c.id === change.clubId);
        if (clubIdx !== -1) {
          clubsWithUpdates[clubIdx] = { 
            ...clubsWithUpdates[clubIdx], 
            ...change.updates,
            history: [...clubsWithUpdates[clubIdx].history, `Season transition: Moved to new division.`]
          };
        }
      });

      // B. Regenerate Fixtures
      const nextSeasonClubsByLeague: Record<string, string[]> = {};
      clubsWithUpdates.forEach((c: any) => {
        if (!nextSeasonClubsByLeague[c.leagueId]) nextSeasonClubsByLeague[c.leagueId] = [];
        nextSeasonClubsByLeague[c.leagueId].push(c.id);
      });

      newMatches = generateFixtures(sortedLeagues, nextSeasonClubsByLeague, nextSeason);
      
      newNews.push({
        title: `Season ${currentSeason} Concluded`,
        content: `A dramatic season comes to an end. Promotions and relegations have been finalized.`,
        category: 'WORLD', importance: 'BREAKING', week: currentWeek, season: currentSeason
      });
    }


    // 4. Player Fatigue Recovery
    const finalPlayers = [...aiTransferredPlayers, ...allNewPlayers].map((p: any) => ({
      ...p,
      fatigue: Math.max(0, (p.fatigue || 0) - 15),
      morale: Math.min(100, Math.max(0, (p.morale || 70) + (Math.random() * 4 - 2))) 
    }));

    // 5. Final State Update
    set({
      currentWeek: nextWeek,
      currentSeason: nextSeason,
      matches: newMatches,
      players: finalPlayers,
      clubs: clubsWithUpdates,
      managers: updatedManagers,
      isTransferWindowOpen: (nextWeek >= 1 && nextWeek <= 6) || (nextWeek >= 33 && nextWeek <= 38),
      transferBids: transferUpdates.transferBids || freshState.transferBids,
      news: [...newNews.map(n => ({ ...n, id: Math.random().toString(36).substring(2, 11), week: currentWeek, season: currentSeason })), ...news].slice(0, 100)
    });
  },


  skipWeeks: (weeks) => {
    for (let i = 0; i < weeks; i++) {
      get().advanceWeek();
    }
  },
});
