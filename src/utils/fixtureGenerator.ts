import { type League, type Match } from '../types/game';

export function generateFixtures(leagues: League[], clubIdsByLeague: Record<string, string[]>, season: number): Match[] {
  const allMatches: Match[] = [];

  leagues.forEach(league => {
    const clubIds = [...(clubIdsByLeague[league.id] || [])];
    if (clubIds.length < 2) return;

    // Ensure even number of clubs
    if (clubIds.length % 2 !== 0) clubIds.push('BYE');

    const numClubs = clubIds.length;
    const rounds = (numClubs - 1) * 2; // Home and Away
    const matchesPerRound = numClubs / 2;

    for (let round = 0; round < rounds; round++) {
      const weekNum = round + 1;
      if (weekNum > 38) break; // Hard limit to 38 weeks for now

      for (let i = 0; i < matchesPerRound; i++) {
        const homeIdx = i;
        const awayIdx = numClubs - 1 - i;

        const homeId = clubIds[homeIdx];
        const awayId = clubIds[awayIdx];

        if (homeId === 'BYE' || awayId === 'BYE') continue;

        allMatches.push({
          id: `m-${league.id}-${round}-${homeId}-${awayId}-${season}`,
          homeClubId: round % 2 === 0 ? homeId : awayId,
          awayClubId: round % 2 === 0 ? awayId : homeId,
          homeScore: 0,
          awayScore: 0,
          played: false,
          leagueId: league.id,
          season,
          week: weekNum,
          events: []
        });
      }

      // Rotate clubs for Round Robin
      const last = clubIds.pop()!;
      clubIds.splice(1, 0, last);
    }
  });

  return allMatches;
}
