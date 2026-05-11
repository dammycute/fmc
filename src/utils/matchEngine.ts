import { type Club, type Player, type Match, type MatchEvent } from '../types/game';

const getRandomElement = <T>(arr: T[]): T | undefined => arr[Math.floor(Math.random() * arr.length)];

// --- Phase 1: Team Strength Calculation ---

export interface TeamStats {
  attackStrength: number;
  defenseStrength: number;
  midfieldControl: number;
  gkRating: number;
  overall: number;
  morale: number;
  fatigue: number;
  leadership: number;
  composure: number;
}

const FORMATION_BONUSES: Record<string, { atkMod: number; defMod: number; midMod: number }> = {
  '4-4-2':         { atkMod: 1.0,  defMod: 1.0,  midMod: 1.0  },
  '4-3-3':         { atkMod: 1.10, defMod: 0.95, midMod: 0.95 },
  '3-5-2':         { atkMod: 1.05, defMod: 0.90, midMod: 1.10 },
  '4-2-3-1':       { atkMod: 1.05, defMod: 1.0,  midMod: 1.05 },
  '5-4-1':         { atkMod: 0.85, defMod: 1.15, midMod: 1.0  },
  '4-4-2_DIAMOND': { atkMod: 1.05, defMod: 0.95, midMod: 1.05 },
};

export function calculateTeamStats(players: Player[]): TeamStats {
  if (players.length === 0) {
    return {
      attackStrength: 30, defenseStrength: 30, midfieldControl: 30,
      gkRating: 30, overall: 30, morale: 50, fatigue: 0,
      leadership: 30, composure: 50,
    };
  }

  const gks = players.filter(p => p.position === 'GK');
  const defs = players.filter(p => p.position === 'DEF');
  const mids = players.filter(p => p.position === 'MID');
  const atts = players.filter(p => p.position === 'ATT');

  const avgRating = (arr: Player[]) =>
    arr.length > 0 ? arr.reduce((s, p) => s + p.overallRating, 0) / arr.length : 0;
  const avgAttr = (arr: Player[], getter: (p: Player) => number) =>
    arr.length > 0 ? arr.reduce((s, p) => s + getter(p), 0) / arr.length : 0;

  // Attack = ATT rating, boosted by finishing and shooting
  const attRaw = atts.length > 0
    ? avgRating(atts) * 0.6 + avgAttr(atts, p => p.technical.shooting) * 0.2 + avgAttr(atts, p => p.technical.finishing) * 0.2
    : avgRating(players) * 0.5; // fallback if no attackers

  // Defense = DEF rating + GK, boosted by tackling and positioning
  const defRaw = defs.length > 0
    ? avgRating(defs) * 0.5 + avgAttr(defs, p => p.technical.tackling) * 0.25 + avgAttr(defs, p => p.technical.positioning) * 0.25
    : avgRating(players) * 0.5;

  // GK rating specifically
  const gkRating = gks.length > 0
    ? avgRating(gks) * 0.4 + avgAttr(gks, p => p.technical.reflexes || 50) * 0.3 + avgAttr(gks, p => p.technical.handling || 50) * 0.3
    : 40;

  // Midfield = MID rating, boosted by passing and vision
  const midRaw = mids.length > 0
    ? avgRating(mids) * 0.5 + avgAttr(mids, p => p.technical.passing) * 0.25 + avgAttr(mids, p => p.technical.vision) * 0.25
    : avgRating(players) * 0.5;

  const morale = avgAttr(players, p => p.morale);
  const fatigue = avgAttr(players, p => p.fatigue || 0);
  const leadership = players.length > 0 ? Math.max(0, ...players.map(p => p.mental.leadership)) : 30;
  const composure = avgAttr(atts.length > 0 ? atts : players, p => p.mental.composure);

  return {
    attackStrength: attRaw,
    defenseStrength: (defRaw * 0.7 + gkRating * 0.3), // GK contributes 30% to defense
    midfieldControl: midRaw,
    gkRating,
    overall: (attRaw + defRaw + midRaw) / 3,
    morale,
    fatigue,
    leadership,
    composure,
  };
}

// --- Tactical Philosophy Modifiers ---

const getTacticalModifiers = (tactics: string) => {
  switch (tactics) {
    case 'POSSESSION':      return { atkMod: 0.95, defMod: 1.0,  midMod: 1.15 };
    case 'HIGH_PRESSING':   return { atkMod: 1.15, defMod: 0.90, midMod: 1.10 };
    case 'COUNTER_ATTACK':  return { atkMod: 1.20, defMod: 1.10, midMod: 0.85 };
    case 'DEFENSIVE':       return { atkMod: 0.70, defMod: 1.35, midMod: 0.95 };
    case 'WING_PLAY':       return { atkMod: 1.10, defMod: 0.95, midMod: 1.0  };
    case 'DIRECT':          return { atkMod: 1.15, defMod: 1.0,  midMod: 0.90 };
    default:                return { atkMod: 1.0,  defMod: 1.0,  midMod: 1.0  };
  }
};

// --- Main Simulation ---

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
  // Safety: if either squad is truly empty, return a 0-0 draw rather than crashing
  if (homePlayers.length === 0 || awayPlayers.length === 0) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      homeClubId: homeClub.id, awayClubId: awayClub.id,
      homeScore: 0, awayScore: 0, played: true,
      leagueId: homeClub.leagueId, season, week,
      events: [{ minute: 1, type: 'COMMENTARY', description: 'Match abandoned — insufficient players.' }],
      stats: { homePossession: 50, awayPossession: 50, homeShots: 0, awayShots: 0, homePassRate: 0, awayPassRate: 0 },
    };
  }

  const homeStats = calculateTeamStats(homePlayers);
  const awayStats = calculateTeamStats(awayPlayers);

  // --- TACTICAL MODIFIERS ---
  // Use club.tactics (boardroom choice) first, fall back to manager philosophy
  const homeTactics = homeClub.tactics || homeManager?.philosophy || 'DIRECT';
  const awayTactics = awayClub.tactics || awayManager?.philosophy || 'DIRECT';
  const homeTacMod = getTacticalModifiers(homeTactics);
  const awayTacMod = getTacticalModifiers(awayTactics);

  // --- FORMATION BONUSES ---
  const homeFormBonus = FORMATION_BONUSES[homeClub.formation] || FORMATION_BONUSES['4-4-2'];
  const awayFormBonus = FORMATION_BONUSES[awayClub.formation] || FORMATION_BONUSES['4-4-2'];

  // Apply both tactical + formation modifiers
  let homeAtk = homeStats.attackStrength * homeTacMod.atkMod * homeFormBonus.atkMod;
  let homeDef = homeStats.defenseStrength * homeTacMod.defMod * homeFormBonus.defMod;
  let homeMid = homeStats.midfieldControl * homeTacMod.midMod * homeFormBonus.midMod;

  let awayAtk = awayStats.attackStrength * awayTacMod.atkMod * awayFormBonus.atkMod;
  let awayDef = awayStats.defenseStrength * awayTacMod.defMod * awayFormBonus.defMod;
  let awayMid = awayStats.midfieldControl * awayTacMod.midMod * awayFormBonus.midMod;

  // Home advantage
  const HOME_BONUS = 3;
  homeAtk += HOME_BONUS;
  homeMid += HOME_BONUS;

  // --- PHASE 2: MIDFIELD BATTLE → POSSESSION ---
  const rawPoss = (homeMid / (homeMid + awayMid)) * 100;
  const homePossession = Math.max(35, Math.min(65, Math.floor(rawPoss + (Math.random() * 6 - 3))));
  const awayPossession = 100 - homePossession;

  let homeScore = 0;
  let awayScore = 0;
  let homeShots = 0;
  let awayShots = 0;
  const events: MatchEvent[] = [];

  // Momentum tracking — changes when goals are scored
  let homeMoraleMod = 0;
  let awayMoraleMod = 0;

  // Pressure tracking — sustained possession builds pressure
  let homePressure = 0;
  let awayPressure = 0;

  // --- SIMULATE 90 MINUTES IN 5-MIN CHUNKS ---
  for (let minute = 5; minute <= 90; minute += 5) {
    // --- PHASE 5: FATIGUE DECAY ---
    const fatigueMinuteFactor = minute > 75 ? 0.82 : minute > 60 ? 0.90 : 1.0;
    const homeFatiguePenalty = (1 - (homeStats.fatigue / 300)) * fatigueMinuteFactor;
    const awayFatiguePenalty = (1 - (awayStats.fatigue / 300)) * fatigueMinuteFactor;

    // Momentum from morale + leadership (safe from NaN)
    const homeBaseMomentum = ((homeStats.morale + homeMoraleMod) / 100) + (homeStats.leadership / 250);
    const awayBaseMomentum = ((awayStats.morale + awayMoraleMod) / 100) + (awayStats.leadership / 250);

    // Effective strengths for this chunk
    const effHomeAtk = homeAtk * homeBaseMomentum * homeFatiguePenalty;
    const effHomeDef = homeDef * homeBaseMomentum * homeFatiguePenalty;
    const effAwayAtk = awayAtk * awayBaseMomentum * awayFatiguePenalty;
    const effAwayDef = awayDef * awayBaseMomentum * awayFatiguePenalty;

    // --- PHASE 4: MOMENTUM — GAME STATE ---
    // Leading team defends deeper, trailing team pushes forward
    let homeAtkMod = 1.0, homeDefMod = 1.0;
    let awayAtkMod = 1.0, awayDefMod = 1.0;
    if (homeScore > awayScore) {
      homeAtkMod = 0.90; homeDefMod = 1.10; // protect lead
      awayAtkMod = 1.15; awayDefMod = 0.85;  // chase game
    } else if (awayScore > homeScore) {
      awayAtkMod = 0.90; awayDefMod = 1.10;
      homeAtkMod = 1.15; homeDefMod = 0.85;
    }

    // --- PHASE 3: CHANCE CREATION ---
    // Chance of a shot opportunity each 5-minute block
    const chanceRate = 0.38; // ~7 shots per team per game on average

    // Home chance
    if (Math.random() < chanceRate * (homePossession / 50)) {
      homeShots++;
      homePressure += 1;

      // Pressure bonus: sustained attacks increase chance quality
      const pressureBonus = Math.min(homePressure * 0.02, 0.10);

      // Conversion: attack quality vs defense + GK
      const convRaw = (effHomeAtk * homeAtkMod + homeStats.composure * 0.3) /
        (effHomeAtk * homeAtkMod + effAwayDef * awayDefMod + awayStats.gkRating * 0.5 + 20);
      const conversionChance = Math.max(0.08, Math.min(0.45, convRaw + pressureBonus));

      if (Math.random() < conversionChance) {
        homeScore++;
        homePressure = 0; // reset pressure after goal

        // Momentum shift
        homeMoraleMod = Math.min(homeMoraleMod + 10, 25);
        awayMoraleMod = Math.max(awayMoraleMod - 10, -25);

        // Pick scorer — weight towards attackers
        const scorers = homePlayers.filter(p => p.position === 'ATT' || p.position === 'MID');
        const scorer = scorers.length > 0
          ? (Math.random() > 0.25 ? scorers.sort((a, b) => b.technical.shooting - a.technical.shooting)[0] : getRandomElement(scorers))
          : getRandomElement(homePlayers);

        const goalTypes = ['a powerful header', 'a clinical finish', 'a long-range screamer', 'a poacher\'s instinct', 'a curling effort into the top corner', 'a tap-in from close range'];
        events.push({
          minute, type: 'GOAL', clubId: homeClub.id, playerId: scorer?.id,
          description: `GOAL! ${scorer?.lastName || 'Unknown'} with ${getRandomElement(goalTypes)} for ${homeClub.name}!`,
        });
      }
    } else {
      homePressure = Math.max(0, homePressure - 0.5); // pressure bleeds off
    }

    // Away chance
    if (Math.random() < chanceRate * (awayPossession / 50)) {
      awayShots++;
      awayPressure += 1;

      const pressureBonus = Math.min(awayPressure * 0.02, 0.10);
      const convRaw = (effAwayAtk * awayAtkMod + awayStats.composure * 0.3) /
        (effAwayAtk * awayAtkMod + effHomeDef * homeDefMod + homeStats.gkRating * 0.5 + 20);
      const conversionChance = Math.max(0.08, Math.min(0.45, convRaw + pressureBonus));

      if (Math.random() < conversionChance) {
        awayScore++;
        awayPressure = 0;
        awayMoraleMod = Math.min(awayMoraleMod + 10, 25);
        homeMoraleMod = Math.max(homeMoraleMod - 10, -25);

        const scorers = awayPlayers.filter(p => p.position === 'ATT' || p.position === 'MID');
        const scorer = scorers.length > 0
          ? (Math.random() > 0.25 ? scorers.sort((a, b) => b.technical.shooting - a.technical.shooting)[0] : getRandomElement(scorers))
          : getRandomElement(awayPlayers);

        const goalTypes = ['a clinical counter-attack goal', 'a tap-in from close range', 'an absolute rocket', 'a deft chip over the keeper', 'a header from a corner', 'a thunderous volley'];
        events.push({
          minute, type: 'GOAL', clubId: awayClub.id, playerId: scorer?.id,
          description: `GOAL! ${scorer?.lastName || 'Unknown'} scores with ${getRandomElement(goalTypes)} for ${awayClub.name}!`,
        });
      }
    } else {
      awayPressure = Math.max(0, awayPressure - 0.5);
    }

    // --- BOOKINGS ---
    const pressingIntensity = ((homeManager?.pressing || 50) + (awayManager?.pressing || 50)) / 200;
    if (Math.random() < (0.04 + pressingIntensity * 0.04)) {
      const isHomeCard = Math.random() > 0.5;
      const cardPlayers = isHomeCard ? homePlayers : awayPlayers;
      const cardPlayer = getRandomElement(cardPlayers.filter(p => p.position !== 'GK')) || getRandomElement(cardPlayers);
      events.push({
        minute, type: 'CARD',
        clubId: isHomeCard ? homeClub.id : awayClub.id,
        playerId: cardPlayer?.id,
        description: `Yellow Card: ${cardPlayer?.lastName || 'A player'} booked for a reckless challenge.`,
      });
    }

    // --- INJURIES ---
    if (Math.random() < 0.01) {
      const isHomeInjury = Math.random() > 0.5;
      const injPlayers = isHomeInjury ? homePlayers : awayPlayers;
      const injPlayer = getRandomElement(injPlayers);
      events.push({
        minute, type: 'INJURY',
        clubId: isHomeInjury ? homeClub.id : awayClub.id,
        playerId: injPlayer?.id,
        description: `Injury blow: ${injPlayer?.lastName || 'A player'} goes down for ${isHomeInjury ? homeClub.name : awayClub.name}.`,
      });
    }

    // --- COMMENTARY ---
    if (minute === 45) {
      events.push({ minute, type: 'COMMENTARY', description: `Half-time: ${homeClub.name} ${homeScore} - ${awayScore} ${awayClub.name}` });
    }
  }

  // Final whistle commentary
  events.push({ minute: 90, type: 'COMMENTARY', description: `Full time: ${homeClub.name} ${homeScore} - ${awayScore} ${awayClub.name}` });

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
      homePassRate: Math.floor(70 + (homePossession / 5) + Math.random() * 10),
      awayPassRate: Math.floor(70 + (awayPossession / 5) + Math.random() * 10),
    },
  };
}
