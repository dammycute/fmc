import type { StateCreator } from 'zustand';
import type { Match, League } from '../../types/game';
import { client } from '../../api/client';

export interface MatchSlice {
  matches: Match[];
  leagues: League[];
  prepareMatchday: () => Match | null;
  startUserMatch: (matchId: string) => Promise<Match | null>;
  finalizeMatchday: (userMatch: Match | null) => Promise<void>;
}

export const createMatchSlice: StateCreator<
  MatchSlice & any,
  [],
  [],
  MatchSlice
> = (set, get) => ({
  matches: [],
  leagues: [],

  prepareMatchday: () => {
    const state = get();
    const userClubId = state.userClubId;
    if (!userClubId) return null;

    const userMatch = state.matches.find(
      (m) => (m.homeClubId === userClubId || m.awayClubId === userClubId) &&
        m.week === state.currentWeek &&
        m.season === state.currentSeason &&
        !m.played
    );

    return userMatch || null;
  },

  startUserMatch: async (matchId: string) => {
    const state = get();
    const match = state.matches.find(m => m.id === matchId);
    if (!match) return null;

    try {
      // Step 1: Call Django API to simulate the match
      const response = await client.simulateMatch(matchId);
      
      // Map Snake Case from backend to Camel Case for frontend Match type
      const simulatedMatch = {
        ...match,
        homeScore: response.home_score,
        awayScore: response.away_score,
        events: response.events,
        playerRatings: response.player_ratings,
        stats: {
          homePossession: response.stats?.home_possession || 50,
          awayPossession: response.stats?.away_possession || 50,
          homeShots: response.stats?.home_shots || 0,
          awayShots: response.stats?.away_shots || 0,
          homePassRate: response.stats?.home_pass_rate || 75,
          awayPassRate: response.stats?.away_pass_rate || 75,
          homeXg: response.stats?.home_xg || 0,
          awayXg: response.stats?.away_xg || 0,
        },
        played: false // Kept as false until finalizeMatchday
      };

      return simulatedMatch;
    } catch (error) {
      console.error('Failed to simulate match on backend:', error);
      return null;
    }
  },

  finalizeMatchday: async (userMatch: Match | null) => {
    const state = get();
    const currentWeek = state.currentWeek;
    const currentSeason = state.currentSeason;

    // Step 2: Call Django API to finalize the user's match result
    if (userMatch) {
      try {
        await client.finalizeMatch(userMatch.id, {
          home_score: userMatch.homeScore,
          away_score: userMatch.awayScore,
          events: userMatch.events,
          player_ratings: (userMatch as any).playerRatings,
          stats: userMatch.stats
        });
      } catch (error) {
        console.error('Failed to persist match result to backend:', error);
      }
    }

    // Step 3: Local state update only. 
    // Player stats (goals, apps, fatigue) are now handled by backend advance_week().
    // We only update the matches array to mark the user match as played.
    // AI matches are left unplayed locally; they will be simulated by the backend during advance_week().
    const updatedMatches = state.matches.map((match) => {
      if (match.week === currentWeek && match.season === currentSeason) {
        if (userMatch && match.id === userMatch.id) {
          return { ...userMatch, played: true };
        }
      }
      return match;
    });

    set({ matches: updatedMatches });

    // --- Post-Match Analyst Report ---
    const userClubId = state.userClubId;
    const matchThisWeek = updatedMatches.find(m => (m.homeClubId === userClubId || m.awayClubId === userClubId) && m.week === currentWeek && m.season === currentSeason);
    const analyst = state.staff?.find((s: any) => s.clubId === userClubId && s.role === 'ANALYST');
    
    if (matchThisWeek && analyst && matchThisWeek.played) {
      const isHome = matchThisWeek.homeClubId === userClubId;
      const userScore = isHome ? matchThisWeek.homeScore : matchThisWeek.awayScore;
      const oppScore = isHome ? matchThisWeek.awayScore : matchThisWeek.homeScore;
      const oppClub = state.clubs.find((c: any) => c.id === (isHome ? matchThisWeek.awayClubId : matchThisWeek.homeClubId));
      
      const headline = userScore > oppScore ? 'Dominant Performance' : userScore === oppScore ? 'Tactical Stalemate' : 'Areas for Improvement';
      let content = `Analyst ${analyst.name} reports: Our team showed ${userScore > oppScore ? 'excellent control' : 'mixed results'} against ${oppClub?.name}. `;
      
      const goals = (matchThisWeek.events || []).filter((e: any) => e.type === 'GOAL' && e.clubId === userClubId);
      if (goals.length > 0) {
        content += `Clinical finishing was key. `;
      } else {
        content += `We struggled in the final third. `;
      }
      
      state.generateNews({
        title: `${headline}: vs ${oppClub?.name}`,
        content,
        category: 'MATCH',
        importance: 'MEDIUM',
        impact: { morale: userScore > oppScore ? 5 : -5 }
      });
    }

    // Step 4: Sync all data from backend to ensure state consistency
    await state.syncData();
  },
});
