import { type Club, type Player, type Match, type MatchEvent } from '../types/game';

const getRandomElement = <T>(arr: T[]): T | undefined => arr[Math.floor(Math.random() * arr.length)];

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
  homeManager: any,
  awayManager: any,
  season: number,
  week: number
): Match {
  const homeStats = calculateTeamStats(homePlayers);
  const awayStats = calculateTeamStats(awayPlayers);

  let homeScore = 0;
  let awayScore = 0;
  let homeShots = 0;
  let awayShots = 0;
  const events: MatchEvent[] = [];

  // Tactical factors
  const getPhilosophyBonus = (philosophy: string, isAttacking: boolean) => {
    if (philosophy === 'TIKI_TAKA' || philosophy === 'POSSESSION') return isAttacking ? 1.1 : 0.9;
    if (philosophy === 'GEGENPRESSING' || philosophy === 'HIGH_PRESSING') return 1.2;
    if (philosophy === 'PARK_THE_BUS' || philosophy === 'DEFENSIVE') return isAttacking ? 0.7 : 1.4;
    if (philosophy === 'COUNTER_ATTACK') return 1.15;
    return 1.0;
  };

  const homeTacticalMod = getPhilosophyBonus(homeManager.philosophy || homeClub.tactics, true);
  const awayTacticalMod = getPhilosophyBonus(awayManager.philosophy || awayClub.tactics, true);

  // Home advantage
  const homeBonus = 5;

  // Real Possession calculation based on midfield balance
  const homeMidPower = homeStats.midfield * homeTacticalMod;
  const awayMidPower = awayStats.midfield * awayTacticalMod;
  const homePossBase = (homeMidPower / (homeMidPower + awayMidPower)) * 100;
  const homePossession = Math.floor(homePossBase + (Math.random() * 10 - 5));
  const awayPossession = 100 - homePossession;

  // Simulate 90 minutes in 5-minute chunks
  for (let minute = 5; minute <= 90; minute += 5) {
    // Pressing impacts fatigue
    const homePressingFactor = (homeManager.pressing || 50) / 100;
    const awayPressingFactor = (awayManager.pressing || 50) / 100;
    
    const fatigueMod = minute > 60 ? 0.85 : 1.0;
    const homeMomentum = (homeStats.morale / 100) + (homeStats.leadership / 200);
    const awayMomentum = (awayStats.morale / 100) + (awayStats.leadership / 200);

    const homeStrength = (homeStats.overall + homeBonus) * homeMomentum * homeTacticalMod * (1 - (homeStats.fatigue / 400)) * fatigueMod;
    const awayStrength = awayStats.overall * awayMomentum * awayTacticalMod * (1 - (awayStats.fatigue / 400)) * fatigueMod;

    // Probability of a goal-scoring opportunity (shots)
    const baseChance = 0.35; // Increased from 0.28 for more action
    if (Math.random() < baseChance) {
      if (homePlayers.length === 0 || awayPlayers.length === 0) return;

      const isHomeChance = Math.random() * (homeStrength + awayStrength) < homeStrength;
      
      if (isHomeChance) {
        homeShots++;
        const attackers = homePlayers.filter(p => p.position === 'ATT');
        const avgComposure = attackers.length > 0 ? attackers.reduce((sum, p) => sum + p.mental.composure, 0) / attackers.length : 60;
        
        // Ensure conversion chance doesn't drop to 0
        const conversionChance = Math.max(0.15, (homeStats.attack * homeTacticalMod + (avgComposure / 2)) / (homeStats.attack + awayStats.defense + 25));
        
        if (Math.random() < conversionChance) {
          homeScore++;
          const scorers = homePlayers.filter(p => p.position === 'ATT' || p.position === 'MID');
          const scorer = scorers.length > 0 ? (Math.random() > 0.3 ? scorers[0] : getRandomElement(scorers)) : getRandomElement(homePlayers);
          
          const goalTypes = ['A powerful header', 'A clinical finish', 'A long-range screamer', 'A poacher\'s goal'];
          events.push({
            minute,
            type: 'GOAL',
            clubId: homeClub.id,
            playerId: scorer?.id,
            description: `GOAL! ${scorer ? scorer.lastName : 'Someone'} with ${goalTypes[Math.floor(Math.random() * goalTypes.length)]} for ${homeClub.name}!`,
          });
        }
      } else {
        awayShots++;
        const attackers = awayPlayers.filter(p => p.position === 'ATT');
        const avgComposure = attackers.length > 0 ? attackers.reduce((sum, p) => sum + p.mental.composure, 0) / attackers.length : 60;
        
        const conversionChance = Math.max(0.15, (awayStats.attack * awayTacticalMod + (avgComposure / 2)) / (awayStats.attack + homeStats.defense + 25));

        if (Math.random() < conversionChance) {
          awayScore++;
          const scorers = awayPlayers.filter(p => p.position === 'ATT' || p.position === 'MID');
          const scorer = scorers.length > 0 ? (Math.random() > 0.3 ? scorers[0] : getRandomElement(scorers)) : getRandomElement(awayPlayers);
          
          const goalTypes = ['A clinical counter-attack', 'A tap-in from close range', 'An absolute rocket', 'A deflected effort'];
          events.push({
            minute,
            type: 'GOAL',
            clubId: awayClub.id,
            playerId: scorer?.id,
            description: `GOAL! ${scorer ? scorer.lastName : 'Someone'} scores with ${goalTypes[Math.floor(Math.random() * goalTypes.length)]} for ${awayClub.name}!`,
          });
        }
      }
    }

    // Bookings
    if (Math.random() < (0.05 + (homePressingFactor + awayPressingFactor) * 0.05)) {
      const isHomeCard = Math.random() > 0.5;
      events.push({
        minute,
        type: 'CARD',
        clubId: isHomeCard ? homeClub.id : awayClub.id,
        description: `Yellow Card: High intensity challenge.`,
      });
    }

    // Injuries
    if (Math.random() < 0.012) {
      const isHomeInjury = Math.random() > 0.5;
      events.push({
        minute,
        type: 'INJURY',
        clubId: isHomeInjury ? homeClub.id : awayClub.id,
        description: `Injury blow for ${isHomeInjury ? homeClub.name : awayClub.name}.`,
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
    season,
    week,
    events,
    stats: {
      homePossession,
      awayPossession,
      homeShots,
      awayShots,
      homePassRate: Math.floor(75 + Math.random() * 15),
      awayPassRate: Math.floor(75 + Math.random() * 15),
    }
  };
}

