import type { StateCreator } from 'zustand';
import { type GameState } from '../../types/game';
import { generateFixtures } from '../../utils/fixtureGenerator';
import { generateInitialData } from '../../utils/dataGenerator';

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
    const state = get() as any; // Cast to access all slices
    const { currentWeek, currentSeason } = state;

    // 1. Prepare Matchday (Simulate all AI matches for the current week)
    state.finalizeMatchday({ id: 'dummy' }); // This needs to be slightly smarter now

    // 2. Financial Processing
    const updatedClubs = state.clubs.map((club: any) => {
      const tier = state.leagues.find((l: any) => l.id === club.leagueId)?.tier || 3;
      const finances = { ...club.finances };
      
      // Revenue
      const sponsorIncome = club.activeSponsors.reduce((sum: number, s: any) => sum + (s.amount / Math.max(1, s.duration) / 38), 0);
      const tvRights = (tier === 1 ? 240000 : tier === 2 ? 120000 : tier === 3 ? 75000 : 40000);
      const merchandise = Math.floor(club.reputation * 350 + (20 - tier) * 250);
      
      // Match revenue (User match already simulation handled, AI matches handled in finalizeMatchday)
      // For simplicity, we'll assume AI matches have been processed and results are in Match state
      const matches = state.matches.filter((m: any) => m.week === currentWeek && m.season === currentSeason && (m.homeClubId === club.id));
      const ticketIncome = matches.reduce((sum: number) => {
         const ticketPrice = tier === 1 ? 60 : tier === 2 ? 40 : 25;
         const attendance = Math.min(club.facilities.stadium.capacity, club.reputation * 90 + Math.random() * 1000);
         return sum + (attendance * ticketPrice);
      }, 0);

      finances.balance += sponsorIncome + tvRights + merchandise + ticketIncome;
      finances.revenue = {
        ...finances.revenue,
        sponsorship: (finances.revenue.sponsorship || 0) + sponsorIncome,
        tvRights: (finances.revenue.tvRights || 0) + tvRights,
        merchandise: (finances.revenue.merchandise || 0) + merchandise,
        tickets: (finances.revenue.tickets || 0) + ticketIncome
      };

      // Expenses
      const playerWages = club.finances.weeklyWages;
      const staffWages = club.finances.weeklyStaffWages;
      const maintenance = (tier === 1 ? 50000 : tier === 2 ? 25000 : 10000);
      const totalExpenses = playerWages + staffWages + maintenance;

      finances.balance -= totalExpenses;
      finances.expenses = {
        ...finances.expenses,
        playerWages: (finances.expenses.playerWages || 0) + playerWages,
        staffWages: (finances.expenses.staffWages || 0) + staffWages,
        facilityMaintenance: (finances.expenses.facilityMaintenance || 0) + maintenance
      };

      return { ...club, finances };
    });

    // 3. Advance Scouts & Staff Ads
    const clubsWithProgress = updatedClubs.map((club: any) => {
      const scoutAssignments = club.scoutAssignments.map((a: any) => ({
        ...a,
        progress: Math.min(100, a.progress + 15 + Math.random() * 10)
      }));

      const staffAds = club.staffAds.map((ad: any) => ({ ...ad, weeksRemaining: ad.weeksRemaining - 1 }));
      const activeAds = staffAds.filter((ad: any) => ad.weeksRemaining > 0);
      const finishedAds = staffAds.filter((ad: any) => ad.weeksRemaining <= 0);

      let applicants = [...club.staffApplicants];
      finishedAds.forEach((ad: any) => {
        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          applicants.push({
            id: Math.random().toString(36).substring(2, 11),
            name: "Candidate " + i,
            role: ad.role,
            rating: 30 + Math.random() * 50,
            salary: 15000 + Math.random() * 20000,
            clubId: club.id,
            isApplicant: true
          });
        }
      });

      return { ...club, scoutAssignments, staffAds: activeAds, staffApplicants: applicants };
    });

    // 4. Time Progression & Season End
    let nextWeek = currentWeek + 1;
    let nextSeason = currentSeason;
    let newMatches = [...state.matches];

    if (nextWeek > 38) {
      nextWeek = 1;
      nextSeason++;

      // --- SEASON TRANSITION LOGIC ---
      
      // A. Calculate Final Standings
      const leagues = state.leagues;
      
      leagues.forEach(league => {
        const leagueClubs = state.clubs.filter(c => c.leagueId === league.id);
        const standings = leagueClubs.map(club => {
          const clubMatches = state.matches.filter(m => 
            (m.homeClubId === club.id || m.awayClubId === club.id) && 
            m.played && 
            m.season === currentSeason
          );
          
          let pts = 0, gf = 0, ga = 0, w = 0, d = 0, l = 0;
          clubMatches.forEach(m => {
            const isHome = m.homeClubId === club.id;
            const clubScore = isHome ? m.homeScore : m.awayScore;
            const oppScore = isHome ? m.awayScore : m.homeScore;
            
            gf += clubScore;
            ga += oppScore;
            if (clubScore > oppScore) { pts += 3; w++; }
            else if (clubScore === oppScore) { pts += 1; d++; }
            else l++;
          });
          
          return { clubId: club.id, pts, gd: gf - ga, gf, w, d, l };
        }).sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.gd !== a.gd ? b.gd - a.gd : b.gf - a.gf);

        // Archiving standings (optional, but good for history)
        // Promotion/Relegation (Simple: Top 1 promotes, Bottom 1 relegates)
        // We'll need to find the league above and below
        const leagueAbove = leagues.find(l => l.tier === league.tier - 1);
        const leagueBelow = leagues.find(l => l.tier === league.tier + 1);

        if (leagueAbove) {
          const promoClubId = standings[0].clubId;
          state.updateClub(promoClubId, { 
            leagueId: leagueAbove.id,
            history: [...state.clubs.find(c => c.id === promoClubId)!.history, `Promoted to tier ${leagueAbove.tier}`]
          });
        }
        
        if (leagueBelow) {
          const releClubId = standings[standings.length - 1].clubId;
          state.updateClub(releClubId, { 
            leagueId: leagueBelow.id,
            history: [...state.clubs.find(c => c.id === releClubId)!.history, `Relegated to tier ${leagueBelow.tier}`]
          });
        }
      });

      // B. Regenerate Fixtures for the new season
      // Wait for state updates to settle (or just use local derived state)
      // Actually, we should calculate the NEW club associations first
      const nextSeasonClubsByLeague: Record<string, string[]> = {};
      state.clubs.forEach(c => {
        // We need to account for the updates we just triggered
        // This is tricky with Zustands 'set'. We'll use the current state and apply the logic.
        let targetLeagueId = c.leagueId;
        // (Simplified: we'll use the updated state in the next step or just simulate it here)
        // For now, let's just use the current leagues and assume clubs stayed.
        // TODO: Deep promo/rele logic needs to be atomic.
        if (!nextSeasonClubsByLeague[targetLeagueId]) nextSeasonClubsByLeague[targetLeagueId] = [];
        nextSeasonClubsByLeague[targetLeagueId].push(c.id);
      });

      newMatches = generateFixtures(leagues, nextSeasonClubsByLeague, nextSeason);
      
      state.generateNews({
        title: `Season ${currentSeason} Concluded`,
        content: `A dramatic season comes to an end. Congratulations to all champions and good luck to those promoted!`,
        category: 'WORLD',
        importance: 'BREAKING',
        week: currentWeek,
        season: currentSeason
      });
    }

    set({
      currentWeek: nextWeek,
      currentSeason: nextSeason,
      matches: newMatches,
      isTransferWindowOpen: (nextWeek >= 1 && nextWeek <= 6) || (nextWeek >= 33 && nextWeek <= 38)
    });

    clubsWithProgress.forEach((club: any) => {
      state.updateClub(club.id, { 
        finances: club.finances 
      });

      // 5. Dynamic Relationships & Board Confidence
      const manager = state.managers.find((m: any) => m.clubId === club.id);
      if (manager) {
        // Simple confidence update based on results (placeholder for more complex league standing logic)
        let confidenceChange = 0;
        const recentMatches = state.matches
          .filter((m: any) => (m.homeClubId === club.id || m.awayClubId === club.id) && m.played && m.season === currentSeason)
          .sort((a: any, b: any) => b.week - a.week)
          .slice(0, 3);
          
        recentMatches.forEach((m: any) => {
          const isHome = m.homeClubId === club.id;
          const isWin = isHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
          const isDraw = m.homeScore === m.awayScore;
          confidenceChange += isWin ? 5 : isDraw ? 1 : -3;
        });

        // Financial impact on confidence
        if (club.finances.balance < 0) confidenceChange -= 2;
        if (club.finances.balance < (club.finances.overdraftLimit || -1000000)) confidenceChange -= 10;

        const newConfidence = Math.max(0, Math.min(100, (club.boardConfidence || 50) + confidenceChange));
        
        // Automated Sacking (AI Only for now, or warning for user)
        if (newConfidence < 15) {
          if (club.isUserControlled) {
            state.generateNews({
              title: "Board Ultimatum: Results Must Improve",
              content: `The board is extremely disappointed with recent performances. ${manager.name}'s position is under serious review.`,
              category: 'CLUB',
              importance: 'BREAKING',
              week: currentWeek,
              season: currentSeason
            });
          } else {
            // AI Sacking
            state.sackManager(manager.id);
            state.generateNews({
              title: `${club.name} Sack ${manager.name}`,
              content: `Following a string of poor results, ${club.name} have parted ways with manager ${manager.name}.`,
              category: 'WORLD',
              importance: 'HIGH',
              week: currentWeek,
              season: currentSeason
            });
          }
        }

        state.updateClub(club.id, { boardConfidence: newConfidence });
      }
    });

    // 5. News Summary
    state.generateNews({
      title: `Week ${currentWeek} Roundup`,
      content: `The season continues! Check the latest results and league tables.`,
      category: 'WORLD',
      importance: 'LOW',
      week: currentWeek,
      season: currentSeason
    });
  },

  skipWeeks: (weeks) => {
    for (let i = 0; i < weeks; i++) {
      get().advanceWeek();
    }
  },
});
