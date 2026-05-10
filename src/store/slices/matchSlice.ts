import type { StateCreator } from 'zustand';
import type { Match, League } from '../../types/game';
import { simulateMatch } from '../../utils/matchEngine';

export interface MatchSlice {
  matches: Match[];
  leagues: League[];
  prepareMatchday: () => Match | null;
  finalizeMatchday: (userMatch: Match) => void;
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

  finalizeMatchday: (userMatch) => {
    const state = get();
    const currentWeek = state.currentWeek;
    const currentSeason = state.currentSeason;

    // 1. Process AI matches for the current week
    const updatedMatches = state.matches.map((match) => {
      if (match.week === currentWeek && match.season === currentSeason && !match.played) {
        if (match.id === userMatch.id) return { ...userMatch, played: true };

        const homeClub = state.clubs.find((c) => c.id === match.homeClubId)!;
        const awayClub = state.clubs.find((c) => c.id === match.awayClubId)!;
        const homePlayers = state.players.filter((p) => p.clubId === homeClub.id);
        const awayPlayers = state.players.filter((p) => p.clubId === awayClub.id);
        const homeManager = state.managers.find((m: any) => m.clubId === homeClub.id);
        const awayManager = state.managers.find((m: any) => m.clubId === awayClub.id);

        const result = simulateMatch(
          homeClub, 
          awayClub, 
          homePlayers, 
          awayPlayers, 
          homeManager || { philosophy: 'BALANCED', pressing: 50 }, 
          awayManager || { philosophy: 'BALANCED', pressing: 50 }, 
          currentSeason, 
          match.week
        );
        return {
          ...result,
          id: match.id,
          leagueId: match.leagueId,
          played: true,
          week: match.week,
          season: match.season,
        };
      }
      return match;
    });

    set({ matches: updatedMatches });
  },
});
