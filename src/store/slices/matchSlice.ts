import type { StateCreator } from 'zustand';
import type { Match, League } from '../../types/game';
import { simulateMatch } from '../../utils/matchEngine';

export interface MatchSlice {
  matches: Match[];
  leagues: League[];
  prepareMatchday: () => Match | null;
  startUserMatch: (matchId: string) => Match | null;
  finalizeMatchday: (userMatch: Match | null) => void;
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

  startUserMatch: (matchId: string) => {
    const state = get();
    const match = state.matches.find(m => m.id === matchId);
    if (!match) return null;

    const homeClub = state.clubs.find(c => c.id === match.homeClubId)!;
    const awayClub = state.clubs.find(c => c.id === match.awayClubId)!;
    
    // Only use players in starting lineup for simulation stats
    const homeLineupIds = new Set(Object.values(homeClub.startingLineup || {}).filter(Boolean));
    const awayLineupIds = new Set(Object.values(awayClub.startingLineup || {}).filter(Boolean));
    
    const homePlayers = state.players.filter(p => homeLineupIds.has(p.id));
    const awayPlayers = state.players.filter(p => awayLineupIds.has(p.id));
    
    // Fallback if lineups are empty for AI teams
    const effectiveHomePlayers = homePlayers.length >= 11 ? homePlayers : state.players.filter(p => p.clubId === homeClub.id).sort((a,b) => b.overallRating - a.overallRating).slice(0, 11);
    const effectiveAwayPlayers = awayPlayers.length >= 11 ? awayPlayers : state.players.filter(p => p.clubId === awayClub.id).sort((a,b) => b.overallRating - a.overallRating).slice(0, 11);

    const homeManager = state.managers.find((m: any) => m.clubId === homeClub.id);
    const awayManager = state.managers.find((m: any) => m.clubId === awayClub.id);

    const simulatedMatch = simulateMatch(
      homeClub, 
      awayClub, 
      effectiveHomePlayers, 
      effectiveAwayPlayers, 
      homeManager || { philosophy: 'BALANCED', pressing: 50 }, 
      awayManager || { philosophy: 'BALANCED', pressing: 50 }, 
      state.currentSeason, 
      match.week
    );

    // Maintain the original ID and league metadata
    return {
      ...simulatedMatch,
      id: match.id,
      leagueId: match.leagueId,
      week: match.week,
      season: match.season,
      played: false // Keep it false until finalizeMatchday is called
    };
  },

  finalizeMatchday: (userMatch: Match | null) => {
    const state = get();
    const currentWeek = state.currentWeek;
    const currentSeason = state.currentSeason;

    const updatedMatches = state.matches.map((match) => {
      if (match.week === currentWeek && match.season === currentSeason && !match.played) {
        if (userMatch && match.id === userMatch.id) return { ...userMatch, played: true };

        const homeClub = state.clubs.find((c) => c.id === match.homeClubId);
        const awayClub = state.clubs.find((c) => c.id === match.awayClubId);
        
        if (!homeClub || !awayClub) return match;

        // Use top 11 for AI matches to avoid squad dilution
        const homePlayers = state.players
          .filter((p) => p.clubId === homeClub.id)
          .sort((a, b) => b.overallRating - a.overallRating)
          .slice(0, 11);
        const awayPlayers = state.players
          .filter((p) => p.clubId === awayClub.id)
          .sort((a, b) => b.overallRating - a.overallRating)
          .slice(0, 11);
          
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

