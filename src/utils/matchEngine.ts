import { type Club, type Player, type Match, type MatchEvent } from '../types/game';

export interface TeamStats {
  attack: number;
  defense: number;
  midfield: number;
  overall: number;
}

export function calculateTeamStats(players: Player[]): TeamStats {
  const gks = players.filter(p => p.position === 'GK');
  const defs = players.filter(p => p.position === 'DEF');
  const mids = players.filter(p => p.position === 'MID');
  const atts = players.filter(p => p.position === 'ATT');

  const avg = (arr: Player[]) => arr.length > 0 ? arr.reduce((sum, p) => sum + p.overallRating, 0) / arr.length : 0;

  const attack = avg(atts);
  const midfield = avg(mids);
  const defense = (avg(defs) + avg(gks)) / 2;
  const overall = (attack + midfield + defense) / 3;

  return { attack, defense, midfield, overall };
}

export function simulateMatch(
  homeClub: Club,
  awayClub: Club,
  homePlayers: Player[],
  awayPlayers: Player[],
  week: number,
  season: number
): Match {
  const homeStats = calculateTeamStats(homePlayers);
  const awayStats = calculateTeamStats(awayPlayers);

  // Home advantage
  const homeBonus = 5;
  const homeStrength = homeStats.overall + homeBonus;
  const awayStrength = awayStats.overall;

  let homeScore = 0;
  let awayScore = 0;
  const events: MatchEvent[] = [];

  // Simulate 90 minutes in chunks
  for (let minute = 1; minute <= 90; minute += 5) {
    // Probability of a chance
    if (Math.random() < 0.2) {
      const isHomeChance = Math.random() * (homeStrength + awayStrength) < homeStrength;
      
      if (isHomeChance) {
        // Home chance: home attack vs away defense
        if (Math.random() * (homeStats.attack + awayStats.defense) < homeStats.attack) {
          homeScore++;
          events.push({
            minute,
            type: 'GOAL',
            description: `GOAL for ${homeClub.name}!`,
          });
        }
      } else {
        // Away chance: away attack vs home defense
        if (Math.random() * (awayStats.attack + homeStats.defense) < awayStats.attack) {
          awayScore++;
          events.push({
            minute,
            type: 'GOAL',
            description: `GOAL for ${awayClub.name}!`,
          });
        }
      }
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    homeClubId: homeClub.id,
    awayClubId: awayClub.id,
    homeScore,
    awayScore,
    played: true,
    leagueId: homeClub.leagueId,
    week,
    season,
    events,
  };
}
