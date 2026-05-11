import {
  type Club, type Player, type Manager, type League, type Position,
  type TacticalPhilosophy, type Formation,
  type OwnershipType, type BoardExpectation, type ClubCultureType,
  type GameState
} from '../types/game';
import { generateFixtures } from './fixtureGenerator';

const FIRST_NAMES = [
  'John', 'David', 'Michael', 'Chris', 'James', 'Robert', 'Mark', 'Paul', 'Kevin', 'Steven',
  'Thomas', 'Daniel', 'Gary', 'William', 'Richard', 'Joseph', 'Andrew', 'Ryan', 'Luke', 'Adam',
  'Mateo', 'Luka', 'Santi', 'Theo', 'Marco', 'Kasper', 'Sven', 'Hiroshi', 'Alessandro', 'Oliver',
  'Noah', 'Liam', 'Lucas', 'Mason', 'Ethan', 'Logan', 'Aiden', 'Arlo', 'Finn', 'Hugo'
];
const LAST_NAMES = [
  'Smith', 'Jones', 'Brown', 'Taylor', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson',
  'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Harris', 'Clarke',
  'Garcia', 'Muller', 'Silva', 'Rossi', 'Dubois', 'Fisher', 'Mason', 'Knight', 'Butler', 'Cole',
  'West', 'Jordan', 'Banks', 'Lane', 'Ford', 'Rice', 'Hunt', 'Shaw', 'Hart', 'Webb', 'Bell'
];

export const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const getRandomRating = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Tier-scaled rating ranges
const TIER_RATINGS: Record<number, { min: number; max: number; variance: number }> = {
  1: { min: 75, max: 92, variance: 5 },
  2: { min: 65, max: 80, variance: 7 },
  3: { min: 55, max: 70, variance: 10 },
  4: { min: 45, max: 60, variance: 12 },
  5: { min: 35, max: 50, variance: 15 },
};

export const generatePlayer = (clubId: string, leagueTier: number, isYouth = false): Player => {
  const tierCfg = TIER_RATINGS[leagueTier] || TIER_RATINGS[5];
  const age = isYouth ? 16 + Math.floor(Math.random() * 4) : 18 + Math.floor(Math.random() * 15);

  const rating = getRandomRating(tierCfg.min, tierCfg.max);
  const potential = Math.min(99, rating + Math.floor(Math.random() * (leagueTier >= 3 ? 22 : 15)));

  const position = getRandomElement(['GK', 'DEF', 'MID', 'ATT'] as Position[]);
  const playerTierMultiplier = [1, 0.7, 0.5, 0.3, 0.15][leagueTier - 1] || 0.15;
  const v = tierCfg.variance; // wider spread at lower tiers

  // Position-specific attribute adjustments
  let technicalAttrs = {
    passing: getRandomRating(rating - v, rating + v),
    shooting: getRandomRating(rating - v, rating + v),
    dribbling: getRandomRating(rating - v, rating + v),
    tackling: getRandomRating(rating - v, rating + v),
    positioning: getRandomRating(rating - v, rating + v),
    vision: getRandomRating(rating - v, rating + v),
    finishing: getRandomRating(rating - v, rating + v),
  };

  let gkAttrs = {};

  if (position === 'GK') {
    technicalAttrs = {
      passing: getRandomRating(rating - 8, rating - 2),
      shooting: getRandomRating(rating - 10, rating - 5),
      dribbling: getRandomRating(rating - 8, rating - 2),
      tackling: getRandomRating(rating - 8, rating - 2),
      positioning: getRandomRating(rating - 3, rating + 7),
      vision: getRandomRating(rating - 5, rating + 3),
      finishing: getRandomRating(rating - 10, rating - 5),
    };
    gkAttrs = {
      handling: getRandomRating(rating - 3, rating + 7),
      commandOfArea: getRandomRating(rating - 3, rating + 7),
      eccentricity: getRandomRating(20, 80),
      reflexes: getRandomRating(rating - 3, rating + 7),
      rushingOut: getRandomRating(rating - 5, rating + 5),
    };
  } else if (position === 'DEF') {
    technicalAttrs.tackling = getRandomRating(rating, rating + v);
    technicalAttrs.positioning = getRandomRating(rating, rating + v);
  } else if (position === 'MID') {
    technicalAttrs.passing = getRandomRating(rating, rating + v);
    technicalAttrs.vision = getRandomRating(rating, rating + v);
  } else if (position === 'ATT') {
    technicalAttrs.shooting = getRandomRating(rating, rating + v);
    technicalAttrs.finishing = getRandomRating(rating, rating + v);
  }

  // Tier-scaled mental attributes
  // Lower tiers: lower composure/decisions, but work rate and determination can still be high
  const mentalBase = rating;
  const composureRange = leagueTier >= 4 ? 15 : leagueTier >= 3 ? 10 : 5;
  const decisionRange = composureRange;

  const result: Player = {
    id: Math.random().toString(36).substring(2, 11),
    firstName: getRandomElement(FIRST_NAMES),
    lastName: getRandomElement(LAST_NAMES),
    age,
    position,
    technical: { ...technicalAttrs, ...gkAttrs },
    physical: {
      pace: getRandomRating(rating - v, rating + v + 5), // pace can be an outlier
      strength: getRandomRating(rating - v, rating + v),
      stamina: getRandomRating(Math.max(30, rating - v + (leagueTier >= 4 ? 5 : 0)), rating + v), // lower tiers rely on stamina
      agility: getRandomRating(rating - v, rating + v),
      acceleration: getRandomRating(rating - v, rating + v),
    },
    mental: {
      leadership: getRandomRating(25, 85),
      composure: getRandomRating(Math.max(20, mentalBase - composureRange), mentalBase + 5),
      aggression: getRandomRating(30, 90),
      workRate: getRandomRating(40, 95),
      decisions: getRandomRating(Math.max(20, mentalBase - decisionRange), mentalBase + 5),
      determination: getRandomRating(40, 95),
    },
    hidden: {
      professionalism: getRandomRating(30, 95),
      ambition: getRandomRating(30, 95),
      loyalty: getRandomRating(30, 95),
      injuryProneness: getRandomRating(10, 80),
      temperament: getRandomRating(30, 90),
      bigMatchMentality: getRandomRating(30, 90),
      consistency: getRandomRating(leagueTier <= 2 ? 55 : 30, 90), // higher tiers = more consistent
    },
    overallRating: rating,
    potentialRating: potential,
    value: rating * rating * 1000 * playerTierMultiplier,
    wage: rating * 100 * playerTierMultiplier,
    morale: 70 + Math.floor(Math.random() * 30),
    fitness: 100,
    fatigue: 0,
    injuryRisk: 0,
    clubId,
    // Age-based personality assignment
    personality: (() => {
      // Wonderkid: young (16-21) with high potential gap (15+)
      if (age <= 21 && (potential - rating) >= 15) return 'WONDERKID' as any;
      // Leader: experienced (28+) with high leadership
      if (age >= 28 && rating >= 70) return 'LEADER' as any;
      // Club Hero: veteran (30+) with loyalty
      if (age >= 30) return getRandomElement(['CLUB_HERO', 'LOYAL', 'PROFESSIONAL'] as any);
      // Others
      return getRandomElement(['LOYAL', 'AMBITIOUS', 'PROFESSIONAL', 'TEMPERAMENTAL'] as any);
    })(),
    contractYears: 1 + Math.floor(Math.random() * 4),
    isTransferListed: false,
    isLoanListed: false,
    tacticalFamiliarity: 50 + Math.random() * 30,
    form: [7.0, 7.0, 7.0, 7.0, 7.0],
    happiness: {
      contract: 80,
      playingTime: 80,
      manager: 80,
      clubAmbition: 80,
      adaptation: 100,
      cityLife: 80,
    },
    chemistry: {},
    isLegend: false,
    history: {
      appearances: 0,
      goals: 0,
      trophies: 0,
      joinedSeason: 2024,
      joinedWeek: 1
    }
  };

  // --- Age-based growth/decline curve ---
  // Peak: 26, Decline starts: 31
  // Young players get slight boost toward potential
  // Old players get decline toward lower stat ceiling
  if (age < 26) {
    // Growth phase: boost physical attributes, potential is more reachable
    const growthFactor = (26 - age) / 26; // bigger boost for younger players
    result.physical.pace = Math.min(99, result.physical.pace + Math.floor(growthFactor * 5));
    result.physical.acceleration = Math.min(99, result.physical.acceleration + Math.floor(growthFactor * 5));
    result.physical.agility = Math.min(99, result.physical.agility + Math.floor(growthFactor * 3));
  } else if (age >= 31) {
    // Decline phase: reduce physical stats, mental may stay/improve
    const declineFactor = (age - 30) / 10; // gradual decline
    result.physical.pace = Math.max(20, Math.floor(result.physical.pace * (1 - declineFactor * 0.15)));
    result.physical.acceleration = Math.max(20, Math.floor(result.physical.acceleration * (1 - declineFactor * 0.12)));
    result.physical.stamina = Math.max(25, Math.floor(result.physical.stamina * (1 - declineFactor * 0.10)));
    // Mental attributes improve with age
    result.mental.leadership = Math.min(99, result.mental.leadership + Math.floor(declineFactor * 8));
    result.mental.composure = Math.min(99, result.mental.composure + Math.floor(declineFactor * 5));
    result.mental.decisions = Math.min(99, result.mental.decisions + Math.floor(declineFactor * 5));
  }

  // --- Wonderkid attribute boost ---
  // Wonderkids should have at least one elite attribute that hints at their potential
  if (result.personality === 'WONDERKID') {
    // Boost their best technical attribute by 8-12 points
    const techKeys = Object.keys(result.technical) as (keyof typeof result.technical)[];
    const bestTech = techKeys.reduce((best, key) =>
      (result.technical[key] || 0) > (result.technical[best] || 0) ? key : best, techKeys[0]);
    if (bestTech) {
      (result.technical as any)[bestTech] = Math.min(99, (result.technical[bestTech] || 0) + getRandomRating(8, 12));
    }
    // Boost one physical attribute
    result.physical.pace = Math.min(99, result.physical.pace + getRandomRating(5, 10));
    result.physical.agility = Math.min(99, result.physical.agility + getRandomRating(3, 8));
  }

  return result;
};

export const FORMATION_CONFIG: Record<Formation, { [pos: string]: { x: number, y: number, role: Position } }> = {
  '4-4-2': {
    'GK': { x: 50, y: 90, role: 'GK' },
    'LB': { x: 15, y: 70, role: 'DEF' },
    'CB1': { x: 38, y: 75, role: 'DEF' },
    'CB2': { x: 62, y: 75, role: 'DEF' },
    'RB': { x: 85, y: 70, role: 'DEF' },
    'LM': { x: 15, y: 40, role: 'MID' },
    'CM1': { x: 38, y: 45, role: 'MID' },
    'CM2': { x: 62, y: 45, role: 'MID' },
    'RM': { x: 85, y: 40, role: 'MID' },
    'ST1': { x: 40, y: 15, role: 'ATT' },
    'ST2': { x: 60, y: 15, role: 'ATT' }
  },
  '4-3-3': {
    'GK': { x: 50, y: 90, role: 'GK' },
    'LB': { x: 15, y: 70, role: 'DEF' },
    'CB1': { x: 38, y: 75, role: 'DEF' },
    'CB2': { x: 62, y: 75, role: 'DEF' },
    'RB': { x: 85, y: 70, role: 'DEF' },
    'CM1': { x: 30, y: 50, role: 'MID' },
    'CM2': { x: 50, y: 55, role: 'MID' },
    'CM3': { x: 70, y: 50, role: 'MID' },
    'LW': { x: 20, y: 20, role: 'ATT' },
    'RW': { x: 80, y: 20, role: 'ATT' },
    'ST': { x: 50, y: 15, role: 'ATT' }
  },
  '3-5-2': {
    'GK': { x: 50, y: 90, role: 'GK' },
    'CB1': { x: 25, y: 75, role: 'DEF' },
    'CB2': { x: 50, y: 78, role: 'DEF' },
    'CB3': { x: 75, y: 75, role: 'DEF' },
    'LWB': { x: 10, y: 50, role: 'DEF' },
    'RWB': { x: 90, y: 50, role: 'DEF' },
    'CM1': { x: 35, y: 55, role: 'MID' },
    'CM2': { x: 50, y: 58, role: 'MID' },
    'CM3': { x: 65, y: 55, role: 'MID' },
    'ST1': { x: 40, y: 15, role: 'ATT' },
    'ST2': { x: 60, y: 15, role: 'ATT' }
  },
  '4-2-3-1': {
    'GK': { x: 50, y: 90, role: 'GK' },
    'LB': { x: 15, y: 70, role: 'DEF' },
    'CB1': { x: 38, y: 75, role: 'DEF' },
    'CB2': { x: 62, y: 75, role: 'DEF' },
    'RB': { x: 85, y: 70, role: 'DEF' },
    'CDM1': { x: 35, y: 58, role: 'MID' },
    'CDM2': { x: 65, y: 58, role: 'MID' },
    'LAM': { x: 20, y: 35, role: 'MID' },
    'CAM': { x: 50, y: 38, role: 'MID' },
    'RAM': { x: 80, y: 35, role: 'MID' },
    'ST': { x: 50, y: 15, role: 'ATT' }
  },
  '5-4-1': {
    'GK': { x: 50, y: 90, role: 'GK' },
    'LWB': { x: 10, y: 65, role: 'DEF' },
    'CB1': { x: 30, y: 75, role: 'DEF' },
    'CB2': { x: 50, y: 78, role: 'DEF' },
    'CB3': { x: 70, y: 75, role: 'DEF' },
    'RWB': { x: 90, y: 65, role: 'DEF' },
    'LM': { x: 20, y: 45, role: 'MID' },
    'CM1': { x: 40, y: 48, role: 'MID' },
    'CM2': { x: 60, y: 48, role: 'MID' },
    'RM': { x: 80, y: 45, role: 'MID' },
    'ST': { x: 50, y: 15, role: 'ATT' }
  },
  '4-4-2_DIAMOND': {
    'GK': { x: 50, y: 90, role: 'GK' },
    'LB': { x: 15, y: 70, role: 'DEF' },
    'CB1': { x: 38, y: 75, role: 'DEF' },
    'CB2': { x: 62, y: 75, role: 'DEF' },
    'RB': { x: 85, y: 70, role: 'DEF' },
    'CDM': { x: 50, y: 60, role: 'MID' },
    'LM': { x: 20, y: 45, role: 'MID' },
    'RM': { x: 80, y: 45, role: 'MID' },
    'CAM': { x: 50, y: 35, role: 'MID' },
    'ST1': { x: 40, y: 15, role: 'ATT' },
    'ST2': { x: 60, y: 15, role: 'ATT' }
  }
};

export const autoPickLineup = (formation: Formation, players: Player[]): { [pos: string]: string | null } => {
  const lineup: { [pos: string]: string | null } = {};
  const config = FORMATION_CONFIG[formation];
  const sortedPlayers = [...players].sort((a, b) => b.overallRating - a.overallRating);
  const usedIds = new Set<string>();

  Object.entries(config).forEach(([pos, data]) => {
    const bestPlayer = sortedPlayers.find(p => p.position === data.role && !usedIds.has(p.id));
    if (bestPlayer) {
      lineup[pos] = bestPlayer.id;
      usedIds.add(bestPlayer.id);
    } else {
      // Fallback to any best player
      const anyBest = sortedPlayers.find(p => !usedIds.has(p.id));
      if (anyBest) {
        lineup[pos] = anyBest.id;
        usedIds.add(anyBest.id);
      } else {
        lineup[pos] = null;
      }
    }
  });

  return lineup;
};


const usedClubNames = new Set<string>();

const clubSuffixes = [
  'United', 'FC', 'City', 'Town', 'Athletic', 'Wanderers', 'Rovers', 'Albion', 'County',
  'Harriers', 'Swifts', 'Sporting', 'Rangers', 'Strollers', 'Real', 'Inter', 'Viking', 'Villa'
];
const placeNames = [
  'Bromley', 'Dorking', 'Sutton', 'Boreham', 'Ebbsfleet', 'Solihull', 'Maidenhead', 'Wealdstone',
  'Altrincham', 'Eastleigh', 'Dartford', 'Havant', 'Chelmsford', 'Maidstone', 'Tonbridge',
  'St Albans', 'Hemel', 'Worthing', 'Braintree', 'Chippenham', 'Weymouth', 'Slough',
  'Richmond', 'Finchley', 'Brentwood', 'Croydon', 'Harrow', 'Barnet', 'Enfield', 'Uxbridge',
  'Woking', 'Guildford', 'Epsom', 'Reigate', 'Sevenoaks', 'Gravesend', 'Basildon', 'Harlow'
];

const generateClubName = (): string => {
  let name = `${getRandomElement(placeNames)} ${getRandomElement(clubSuffixes)}`;
  while (usedClubNames.has(name)) {
    name = `${getRandomElement(placeNames)} ${getRandomElement(clubSuffixes)}`;
  }
  usedClubNames.add(name);
  return name;
};

export const generateInitialData = (): GameState => {
  const leagues: League[] = [
    { id: 'l1', name: 'Premier League', tier: 1, country: 'England' },
    { id: 'l2', name: 'Championship', tier: 2, country: 'England' },
    { id: 'l3', name: 'League One', tier: 3, country: 'England' },
    { id: 'l4', name: 'League Two', tier: 4, country: 'England' },
    { id: 'l5', name: 'National League', tier: 5, country: 'England' },
  ];

  const clubs: Club[] = [];
  const allPlayers: Player[] = [];
  const managers: Manager[] = [];

  leagues.forEach(league => {
    for (let i = 0; i < 20; i++) {
      const clubId = `c-${league.id}-${i}`;
      const isUser = false;
      const tierMultiplier = [100, 10, 1, 0.1, 0.02][league.tier - 1] || 0.01;

      const ownerType: OwnershipType = getRandomElement(['LOCAL', 'BILLIONAIRE', 'CORPORATE', 'FAN_OWNED']);
      const expectations: BoardExpectation = league.tier === 1 ? 'QUALIFY_EUROPE' : league.tier === 2 ? 'PROMOTION' : 'MID_TABLE';
      const culture: ClubCultureType[] = [getRandomElement(['YOUTH_DEVELOPMENT', 'WINNING', 'SELLING', 'PRAGMATIC', 'LUXURY_FOOTBALL'])];
      const clubName = generateClubName();

      // Generate Manager
      const managerRatingBase = 40 + (5 - league.tier) * 10; // Higher tier = better managers
      const manager: Manager = {
        id: `m-${clubId}`,
        name: `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
        coaching: {
          attacking: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
          defensive: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
          tactical: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
          mental: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
          workingWithYouth: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        },
        philosophy: getRandomElement(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as TacticalPhilosophy[]),
        pressing: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        creativeFreedom: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        personality: {
          discipline: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
          loyalty: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
          ambition: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
          mediaHandling: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
          playerManagement: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        },
        coachingAbility: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        tacticalIntelligence: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        salary: Math.floor(5000 * tierMultiplier),
        clubId: clubId,
        relationshipWithChairman: 70,
        morale: 70,
        preferredStyle: ['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'][Math.floor(Math.random() * 6)] as TacticalPhilosophy,
        preferredFormation: ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-4-1'][Math.floor(Math.random() * 5)] as Formation,
        history: [`Started career at ${clubName}`]
      };

      const reputation = 100 - (league.tier * 20) + Math.random() * 10;
      const club: Club = {
        id: clubId,
        name: clubName,
        stadiumName: `${getRandomElement(LAST_NAMES)} Park`,
        primaryColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        secondaryColor: '#ffffff',
        reputation: reputation,
        isUserControlled: isUser,
        fanConfidence: 70,
        boardConfidence: 70,
        leagueId: league.id,
        board: {
          type: ownerType,
          expectations,
          confidence: 70,
          patience: ownerType === 'BILLIONAIRE' ? 40 : 80,
          funds: ownerType === 'BILLIONAIRE' ? 50000000 : 0,
        },
        culture,
        rivals: [],
        records: {
          biggestWin: '5-0 vs Rivals',
          worstDefeat: '0-4 vs Giants',
          recordSigning: 0,
          recordSale: 0,
          hallOfFame: []
        },
        facilities: {
          stadium: { level: 1, name: 'Stadium', upgradeCost: 1000000, capacity: Math.floor(20000 * Math.pow(0.5, league.tier - 1)) },
          trainingGround: { level: 1, name: 'Training Ground', upgradeCost: 500000 },
          medicalCenter: { level: 1, name: 'Medical Center', upgradeCost: 300000 },
          youthAcademy: { level: 1, name: 'Youth Academy', upgradeCost: 400000 },
        },
        valuation: (5000000 + Math.random() * 5000000) * tierMultiplier,
        isForSale: true,
        finances: {
          balance: (200000 + Math.random() * 500000) * tierMultiplier,
          transferBudget: (100000 + Math.random() * 200000) * tierMultiplier,
          wageBudget: (20000 * tierMultiplier),
          weeklyWages: 0,
          weeklyStaffWages: 0,
          overdraftLimit: -(1000000 + (3 - league.tier) * 2000000),
          revenue: { tickets: 0, sponsorship: 200000, prizeMoney: 0, merchandise: 10000, tvRights: 100000 },
          expenses: { playerWages: 0, staffWages: 0, transfers: 0, facilityMaintenance: 5000, loanRepayments: 0 },
          loans: []
        },
        transferBudget: 500000,
        seasonTarget: 'MID_TABLE',
        availableSponsors: [
          { id: `sp-${clubId}-1`, name: 'Global Airlines', type: 'MAIN', amount: Math.floor(reputation * 10000), duration: 2, reputationRequired: Math.max(0, Math.floor(reputation - 5)), status: 'PENDING' },
          { id: `sp-${clubId}-2`, name: 'Zenith Energy', type: 'SLEEVE', amount: Math.floor(reputation * 5000), duration: 1, reputationRequired: Math.max(0, Math.floor(reputation - 10)), status: 'PENDING' },
          { id: `sp-${clubId}-3`, name: 'Apex Logistics', type: 'STADIUM', amount: Math.floor(reputation * 15000), duration: 3, reputationRequired: Math.max(0, Math.floor(reputation + 10)), status: 'PENDING' },
        ],
        activeSponsors: [],

        staffAds: [],
        staffApplicants: [],
        scoutAssignments: [],
        scoutReports: [],
        formation: manager.preferredFormation,
        tactics: getRandomElement(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as any[]) as any,
        startingLineup: {},
        history: [`Club founded in ${league.name}`]
      };

      // Generate Squad
      const squad: Player[] = [];
      for (let p = 0; p < 22; p++) {
        const player = generatePlayer(clubId, league.tier);
        squad.push(player);
        allPlayers.push(player);
      }
      const playerWages = squad.reduce((sum, p) => sum + p.wage, 0);
      club.finances.weeklyWages = playerWages;
      club.finances.expenses.playerWages = playerWages;

      // Finalize Starting Lineup
      club.startingLineup = autoPickLineup(club.formation, squad);

      clubs.push(club);
      managers.push(manager);
    }
  });

  // Create tier-distributed free managers for the staff market
  const MANAGER_TIER_RANGES: Record<number, { min: number; max: number; salaryMin: number; salaryMax: number; count: number }> = {
    1: { min: 75, max: 95, salaryMin: 50000, salaryMax: 200000, count: 10 },
    2: { min: 60, max: 80, salaryMin: 10000, salaryMax: 50000, count: 15 },
    3: { min: 45, max: 65, salaryMin: 2000, salaryMax: 10000, count: 25 },
    4: { min: 35, max: 50, salaryMin: 500, salaryMax: 2000, count: 25 },
    5: { min: 25, max: 45, salaryMin: 200, salaryMax: 1000, count: 25 },
  };

  Object.entries(MANAGER_TIER_RANGES).forEach(([tierStr, cfg]) => {
    const tier = parseInt(tierStr);
    for (let i = 0; i < cfg.count; i++) {
      const managerRatingBase = getRandomRating(cfg.min, cfg.max);
      const spread = 12; // tight attribute spread around base
      managers.push({
        id: `free-manager-t${tier}-${i}`,
        name: `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
        coaching: {
          attacking: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
          defensive: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
          tactical: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
          mental: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
          workingWithYouth: getRandomRating(tier >= 3 ? managerRatingBase : managerRatingBase - 10, Math.min(95, managerRatingBase + spread)),
        },
        philosophy: getRandomElement(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as TacticalPhilosophy[]),
        pressing: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        creativeFreedom: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        personality: {
          discipline: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
          loyalty: getRandomRating(tier >= 4 ? 60 : 30, 95), // lower-tier managers are more loyal
          ambition: getRandomRating(tier <= 2 ? 60 : 30, 95), // top-tier managers are more ambitious
          mediaHandling: getRandomRating(Math.max(20, managerRatingBase - 15), managerRatingBase + 10),
          playerManagement: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        },
        coachingAbility: managerRatingBase,
        tacticalIntelligence: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        salary: getRandomRating(cfg.salaryMin, cfg.salaryMax),
        clubId: '',
        relationshipWithChairman: 50,
        morale: 70,
        preferredStyle: getRandomElement(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as TacticalPhilosophy[]),
        preferredFormation: getRandomElement(['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-4-1'] as Formation[]),
        history: [`Available for hire from day one`]
      });
    }
  });

  // Create a large pool of unattached players for the transfer market
  for (let i = 0; i < 200; i++) {
    const tier = getRandomRating(1, 5);
    allPlayers.push(generatePlayer('', tier));
  }

  const clubIdsByLeague = leagues.reduce((acc, l) => {
    acc[l.id] = clubs.filter(c => c.leagueId === l.id).map(c => c.id);
    return acc;
  }, {} as Record<string, string[]>);

  const allMatches = generateFixtures(leagues, clubIdsByLeague, 2024);

  return {
    currentSeason: 2024,
    currentWeek: 1,
    isTransferWindowOpen: true,
    clubs,
    players: allPlayers,
    managers,
    leagues,
    matches: allMatches,
    transferRequests: [],
    staff: Array.from({ length: 150 }).map((_, i) => {
      const rating = getRandomRating(20, 85);
      return {
        id: `free-staff-${i}`,
        name: `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
        role: getRandomElement(['SPORTING_DIRECTOR', 'SCOUT', 'PHYSIO', 'ANALYST', 'ACADEMY_COACH']),
        rating,
        salary: Math.floor(rating * 150),
        clubId: '',
        isApplicant: false
      };
    }),

    transferBids: [],
    news: [],
    userClubId: null,
    personalBalance: 500000, // Non-league level starting wealth
  };
};
