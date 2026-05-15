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
      stats: { homePossession: 50, awayPossession: 50, homeShots: 0, awayShots: 0, homePassRate: 0, awayPassRate: 0, homeXg: 0, awayXg: 0 },
    };
  }

  const homeStats = calculateTeamStats(homePlayers);
  const awayStats = calculateTeamStats(awayPlayers);

  // --- TACTICAL FAMILIARITY ---
  const getFamiliarityMod = (players: Player[]) => {
    if (players.length === 0) return 1.0;
    const avgFam = players.reduce((sum, p) => sum + (p.tacticalFamiliarity || 0), 0) / players.length;
    if (avgFam < 60) return 0.90;
    if (avgFam > 80) return 1.05;
    return 1.0;
  };
  const homeFamMod = getFamiliarityMod(homePlayers);
  const awayFamMod = getFamiliarityMod(awayPlayers);

  // --- TACTICAL MODIFIERS ---
  const homeTactics = homeClub.tactics || homeManager?.philosophy || 'DIRECT';
  const awayTactics = awayClub.tactics || awayManager?.philosophy || 'DIRECT';
  const homeTacMod = getTacticalModifiers(homeTactics);
  const awayTacMod = getTacticalModifiers(awayTactics);

  // --- FORMATION BONUSES ---
  const homeFormBonus = FORMATION_BONUSES[homeClub.formation] || FORMATION_BONUSES['4-4-2'];
  const awayFormBonus = FORMATION_BONUSES[awayClub.formation] || FORMATION_BONUSES['4-4-2'];

  let homeMid = homeStats.midfieldControl * homeTacMod.midMod * homeFormBonus.midMod * homeFamMod;
  const awayMid = awayStats.midfieldControl * awayTacMod.midMod * awayFormBonus.midMod * awayFamMod;

  // Home advantage
  const HOME_BONUS = 3;
  homeMid += HOME_BONUS;

  let homeScore = 0;
  let awayScore = 0;
  let homeShots = 0;
  let awayShots = 0;
  let homeXg = 0;
  let awayXg = 0;
  const events: MatchEvent[] = [];

  // Momentum tracking
  let homeMoraleMod = 0;
  let awayMoraleMod = 0;

  // Zone simulation state
  // Zones: 0: Deep Def, 1: Def Mid, 2: Mid, 3: Att Mid, 4: Final Third
  let possessionTeam: 'home' | 'away' = (homeMid / (homeMid + awayMid)) > Math.random() ? 'home' : 'away';
  let currentZone = 2; // MID
  let isFastBreak = false;
  let homePossessionChunks = 0;

  const homeDefCount = homePlayers.filter(p => p.position === 'DEF').length;
  const awayDefCount = awayPlayers.filter(p => p.position === 'DEF').length;
  const homePress = homeManager?.pressing || 50;
  const awayPress = awayManager?.pressing || 50;

  // --- SIMULATE 90 MINUTES IN 5-MIN CHUNKS ---
  for (let minute = 5; minute <= 90; minute += 5) {
    if (possessionTeam === 'home') homePossessionChunks++;
    const fatigueMinuteFactor = minute > 75 ? 0.82 : minute > 60 ? 0.90 : 1.0;
    const homeFatiguePenalty = (1 - (homeStats.fatigue / 300)) * fatigueMinuteFactor;
    const awayFatiguePenalty = (1 - (awayStats.fatigue / 300)) * fatigueMinuteFactor;

    const homeMomentum = ((homeStats.morale + homeMoraleMod) / 100) + (homeStats.leadership / 250);
    const awayMomentum = ((awayStats.morale + awayMoraleMod) / 100) + (awayStats.leadership / 250);

    const effHomeMid = homeMid * homeMomentum * homeFatiguePenalty;
    const effAwayMid = awayMid * awayMomentum * awayFatiguePenalty;

    // Game state adaptation
    let homeAtkMod = 1.0, homeDefMod = 1.0;
    let awayAtkMod = 1.0, awayDefMod = 1.0;
    if (homeScore > awayScore) {
      homeAtkMod = 0.90; homeDefMod = 1.10;
      awayAtkMod = 1.15; awayDefMod = 0.85;
    } else if (awayScore > homeScore) {
      awayAtkMod = 0.90; awayDefMod = 1.10;
      homeAtkMod = 1.15; homeDefMod = 0.85;
    }

    // --- POSSESSION & ZONE MOVEMENT ---
    const currentAttMid = possessionTeam === 'home' ? effHomeMid : effAwayMid;
    const currentDefMid = possessionTeam === 'home' ? effAwayMid : effHomeMid;
    const midRatio = currentAttMid / (currentAttMid + currentDefMid);

    const defPressing = (possessionTeam === 'home' ? awayPress : homePress) / 100;

    // Turnover chance
    let turnoverChance = 0.25 + (1 - midRatio) * 0.4;
    if (currentZone > 2) {
      turnoverChance += defPressing * 0.2; // Pressing effective in opponent zones
    }
    turnoverChance *= (possessionTeam === 'home' ? awayDefMod : homeDefMod);

    if (Math.random() < turnoverChance) {
      const oldZone = currentZone;
      possessionTeam = possessionTeam === 'home' ? 'away' : 'home';
      currentZone = Math.max(1, 4 - oldZone);
      const attTactics = possessionTeam === 'home' ? homeTactics : awayTactics;
      isFastBreak = attTactics === 'COUNTER_ATTACK' && oldZone > 2;
    } else {
      // Advance zones
      const attTactics = possessionTeam === 'home' ? homeTactics : awayTactics;
      let moveChance = 0.35 + midRatio * 0.4;
      moveChance *= (possessionTeam === 'home' ? homeAtkMod : awayAtkMod);
      if (attTactics === 'COUNTER_ATTACK') moveChance += 0.1;

      if (Math.random() < moveChance) {
        currentZone++;
        if (attTactics === 'COUNTER_ATTACK' && Math.random() < 0.3) {
          currentZone++; // COUNTER_ATTACK skip zone
        }
      }
    }

    // --- CHANCE CREATION ---
    if (currentZone >= 4) {
      const attackingPlayers = possessionTeam === 'home' ? homePlayers : awayPlayers;

      // Select shooter
      const atts = attackingPlayers.filter(p => p.position === 'ATT');
      const mids = attackingPlayers.filter(p => p.position === 'MID');
      const defs = attackingPlayers.filter(p => p.position === 'DEF');
      const r = Math.random();
      const shooter = r < 0.6 && atts.length > 0 ? getRandomElement(atts) :
                     (r < 0.9 && mids.length > 0 ? getRandomElement(mids) :
                     getRandomElement(defs.length > 0 ? defs : attackingPlayers));

      if (possessionTeam === 'home') homeShots++; else awayShots++;

      // xG Calculation
      const base_xG = shooter?.position === 'ATT' ? 0.18 : (shooter?.position === 'MID' ? 0.09 : 0.04);
      let chanceXg = base_xG;
      if (isFastBreak) chanceXg += 0.1;

      const opponentDefCount = possessionTeam === 'home' ? awayDefCount : homeDefCount;
      chanceXg -= opponentDefCount * 0.03;

      const opponentGkRating = possessionTeam === 'home' ? awayStats.gkRating : homeStats.gkRating;
      chanceXg -= (opponentGkRating / 100) * 0.08;

      chanceXg += ((shooter?.mental.composure || 50) / 100) * 0.05;

      if ((shooter?.fatigue || 0) > 60) chanceXg *= 0.85;

      chanceXg = Math.max(0.01, Math.min(0.65, chanceXg));

      if (possessionTeam === 'home') homeXg += chanceXg; else awayXg += chanceXg;

      if (Math.random() < chanceXg) {
        if (possessionTeam === 'home') homeScore++; else awayScore++;

        homeMoraleMod = possessionTeam === 'home' ? Math.min(homeMoraleMod + 10, 25) : Math.max(homeMoraleMod - 10, -25);
        awayMoraleMod = possessionTeam === 'away' ? Math.min(awayMoraleMod + 10, 25) : Math.max(awayMoraleMod - 10, -25);

        const goalTypes = ['a clinical finish', 'a powerful header', 'a long-range screamer', 'a poacher\'s instinct', 'a curling effort', 'a tap-in'];
        events.push({
          minute, type: 'GOAL', clubId: possessionTeam === 'home' ? homeClub.id : awayClub.id, playerId: shooter?.id,
          description: `GOAL! ${shooter?.lastName || 'Unknown'} with ${getRandomElement(goalTypes)} for ${possessionTeam === 'home' ? homeClub.name : awayClub.name}!`,
        });
      }

      // Reset possession
      currentZone = 2;
      possessionTeam = possessionTeam === 'home' ? 'away' : 'home';
      isFastBreak = false;
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

  const homePossession = Math.floor((homePossessionChunks / 18) * 100);
  const awayPossession = 100 - homePossession;

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
      homeXg: Number(homeXg.toFixed(2)),
      awayXg: Number(awayXg.toFixed(2)),
    },
  };
}
