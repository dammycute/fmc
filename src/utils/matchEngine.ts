import { type Club, type Player, type Match, type MatchEvent } from '../types/game';

export interface TeamStats {
  attack: number;
  defense: number;
  midfield: number;
  overall: number;
  morale: number;
  fatigue: number;
  leadership: number;
}

export function calculateTeamStats(players: Player[]): TeamStats {
  const gks = players.filter(p => p.position === 'GK');
  const defs = players.filter(p => p.position === 'DEF');
  const mids = players.filter(p => p.position === 'MID');
  const atts = players.filter(p => p.position === 'ATT');

  const avgAttr = (arr: Player[], getter: (p: Player) => number) => 
    arr.length > 0 ? arr.reduce((sum, p) => sum + getter(p), 0) / arr.length : 0;

  const attack = avgAttr(atts, p => p.overallRating);
  const midfield = avgAttr(mids, p => p.overallRating);
  const defense = (avgAttr(defs, p => p.overallRating) + avgAttr(gks, p => p.overallRating)) / 2;
  const overall = (attack + midfield + defense) / 3;
  
  const morale = avgAttr(players, p => p.morale);
  const fatigue = avgAttr(players, p => p.fatigue);
  const leadership = Math.max(...players.map(p => p.mental.leadership));

  return { attack, defense, midfield, overall, morale, fatigue, leadership };
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

  let homeScore = 0;
  let awayScore = 0;
  const events: MatchEvent[] = [];

  // Home advantage
  const homeBonus = 5;

  // Simulate 90 minutes in 5-minute chunks
  for (let minute = 5; minute <= 90; minute += 5) {
    // Second half fatigue impact
    const fatigueMod = minute > 60 ? 0.9 : 1.0;
    
    // Morale & Leadership momentum
    const homeMomentum = (homeStats.morale / 100) + (homeStats.leadership / 200);
    const awayMomentum = (awayStats.morale / 100) + (awayStats.leadership / 200);

    const homeStrength = (homeStats.overall + homeBonus) * homeMomentum * (1 - (homeStats.fatigue / 500)) * fatigueMod;
    const awayStrength = awayStats.overall * awayMomentum * (1 - (awayStats.fatigue / 500)) * fatigueMod;

    // Probability of a goal-scoring opportunity
    if (Math.random() < 0.28) {
      const isHomeChance = Math.random() * (homeStrength + awayStrength) < homeStrength;
      
      if (isHomeChance) {
        const avgComposure = homePlayers.filter(p => p.position === 'ATT').reduce((sum, p) => sum + p.mental.composure, 0) / (homePlayers.filter(p => p.position === 'ATT').length || 1);
        const conversionChance = (homeStats.attack + (avgComposure / 2)) / (homeStats.attack + awayStats.defense + 15);
        
        if (Math.random() < conversionChance) {
          homeScore++;
          const goalTypes = ['A powerful header', 'A clinical finish', 'A long-range screamer', 'A poacher\'s goal'];
          events.push({
            minute,
            type: 'GOAL',
            description: `GOAL! ${goalTypes[Math.floor(Math.random() * goalTypes.length)]} puts ${homeClub.name} ahead!`,
          });
        }
      } else {
        const avgComposure = awayPlayers.filter(p => p.position === 'ATT').reduce((sum, p) => sum + p.mental.composure, 0) / (awayPlayers.filter(p => p.position === 'ATT').length || 1);
        const conversionChance = (awayStats.attack + (avgComposure / 2)) / (awayStats.attack + homeStats.defense + 15);

        if (Math.random() < conversionChance) {
          awayScore++;
          const goalTypes = ['A clinical counter-attack', 'A tap-in from close range', 'An absolute rocket', 'A deflected effort'];
          events.push({
            minute,
            type: 'GOAL',
            description: `GOAL! ${goalTypes[Math.floor(Math.random() * goalTypes.length)]} for ${awayClub.name}!`,
          });
        }
      }
    }

    // Yellow Cards
    if (Math.random() < 0.08) {
      const isHomeCard = Math.random() > 0.5;
      const teamName = isHomeCard ? homeClub.name : awayClub.name;
      events.push({
        minute,
        type: 'CARD',
        description: `Yellow Card: A reckless challenge from a ${teamName} player.`,
      });
    }

    // Occasional Injuries
    if (Math.random() < 0.012) {
      const isHomeInjury = Math.random() > 0.5;
      const clubName = isHomeInjury ? homeClub.name : awayClub.name;
      events.push({
        minute,
        type: 'INJURY',
        description: `Injury blow for ${clubName}. Player forced off.`,
      });
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
