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

    const userClubId = state.userClubId;
    const isUserMatch = match.homeClubId === userClubId || match.awayClubId === userClubId;
    
    // Require manager for user's matches
    if (isUserMatch) {
      const userClub = state.clubs.find(c => c.id === userClubId);
      const userManager = state.managers.find((m: any) => m.clubId === userClubId);
      if (!userManager) return null; // Cannot start match without a manager
    }

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
          .sort((a, b) => (b.overallRating - (b.fatigue || 0) * 0.5) - (a.overallRating - (a.fatigue || 0) * 0.5))
          .slice(0, 11);
        const awayPlayers = state.players
          .filter((p) => p.clubId === awayClub.id)
          .sort((a, b) => (b.overallRating - (b.fatigue || 0) * 0.5) - (a.overallRating - (a.fatigue || 0) * 0.5))
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

    // Collect all player IDs that participated in matches this week
    const participatingPlayerIds = new Set<string>();
    
    updatedMatches.forEach((match) => {
      if (match.week === currentWeek && match.season === currentSeason && match.played) {
        // Add all players from both clubs
        const homeClub = state.clubs.find(c => c.id === match.homeClubId);
        const awayClub = state.clubs.find(c => c.id === match.awayClubId);
        
        // Use starting lineups if available, otherwise top 11
        if (homeClub) {
          const lineupIds = Object.values(homeClub.startingLineup || {}).filter(Boolean);
          if (lineupIds.length >= 11) {
            lineupIds.forEach(id => id && participatingPlayerIds.add(id as string));
          } else {
            state.players
              .filter(p => p.clubId === homeClub.id)
              .sort((a, b) => b.overallRating - a.overallRating)
              .slice(0, 11)
              .forEach(p => participatingPlayerIds.add(p.id));
          }
        }
        if (awayClub) {
          const lineupIds = Object.values(awayClub.startingLineup || {}).filter(Boolean);
          if (lineupIds.length >= 11) {
            lineupIds.forEach(id => id && participatingPlayerIds.add(id as string));
          } else {
            state.players
              .filter(p => p.clubId === awayClub.id)
              .sort((a, b) => b.overallRating - a.overallRating)
              .slice(0, 11)
              .forEach(p => participatingPlayerIds.add(p.id));
          }
        }
      }
    });

    // Apply fatigue + update match stats (goals, appearances)
    // First, collect goal scorers from all this week's matches
    const goalCounts: Record<string, number> = {};
    updatedMatches.forEach((match) => {
      if (match.week === currentWeek && match.season === currentSeason && match.played && match.events) {
        match.events.forEach((event: any) => {
          if (event.type === 'GOAL' && event.playerId) {
            goalCounts[event.playerId] = (goalCounts[event.playerId] || 0) + 1;
          }
        });
      }
    });

    const updatedPlayers = state.players.map((p: any) => {
      const updates: any = {};
      
      // Fatigue for participants
      if (participatingPlayerIds.has(p.id)) {
        updates.fatigue = Math.min(100, (p.fatigue || 0) + 12);
        // Increment appearances
        updates.history = {
          ...(p.history || { appearances: 0, goals: 0, trophies: 0, joinedSeason: 2024, joinedWeek: 1 }),
          appearances: ((p.history?.appearances) || 0) + 1,
          goals: ((p.history?.goals) || 0) + (goalCounts[p.id] || 0),
        };
      }
      
      return Object.keys(updates).length > 0 ? { ...p, ...updates } : p;
    });

    set({ matches: updatedMatches, players: updatedPlayers });

    // --- Post-Match Analyst Report ---
    const userClubId = state.userClubId;
    const matchThisWeek = updatedMatches.find(m => (m.homeClubId === userClubId || m.awayClubId === userClubId) && m.week === currentWeek && m.season === currentSeason);
    const analyst = state.staff?.find((s: any) => s.clubId === userClubId && s.role === 'DATA_ANALYST');
    
    if (matchThisWeek && analyst) {
      const isHome = matchThisWeek.homeClubId === userClubId;
      const userScore = isHome ? matchThisWeek.homeScore : matchThisWeek.awayScore;
      const oppScore = isHome ? matchThisWeek.awayScore : matchThisWeek.homeScore;
      const oppClub = state.clubs.find((c: any) => c.id === (isHome ? matchThisWeek.awayClubId : matchThisWeek.homeClubId));
      
      let headline = userScore > oppScore ? 'Dominant Performance' : userScore === oppScore ? 'Tactical Stalemate' : 'Areas for Improvement';
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
  },
});

