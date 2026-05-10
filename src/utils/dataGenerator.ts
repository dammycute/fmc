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

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomRating = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generatePlayer = (clubId: string, leagueTier: number, isYouth = false): Player => {
  const baseMin = 72 - (leagueTier - 1) * 6;
  const baseMax = 82 - (leagueTier - 1) * 6;
  const age = isYouth ? 16 + Math.floor(Math.random() * 4) : 18 + Math.floor(Math.random() * 15);

  const rating = getRandomRating(Math.max(30, baseMin), Math.min(92, baseMax));
  const potential = Math.min(99, rating + Math.floor(Math.random() * 18));

  const position = getRandomElement(['GK', 'DEF', 'MID', 'ATT'] as Position[]);
  const playerTierMultiplier = [1, 0.7, 0.5, 0.3, 0.15][leagueTier - 1] || 0.15;

  // Position-specific attribute adjustments
  let technicalAttrs = {
    passing: getRandomRating(rating - 5, rating + 5),
    shooting: getRandomRating(rating - 5, rating + 5),
    dribbling: getRandomRating(rating - 5, rating + 5),
    tackling: getRandomRating(rating - 5, rating + 5),
    positioning: getRandomRating(rating - 5, rating + 5),
    vision: getRandomRating(rating - 5, rating + 5),
    finishing: getRandomRating(rating - 5, rating + 5),
  };

  let gkAttrs = {};

  if (position === 'GK') {
    technicalAttrs = {
      passing: getRandomRating(rating - 8, rating - 2), // Lower passing for GK
      shooting: getRandomRating(rating - 10, rating - 5), // Lower shooting
      dribbling: getRandomRating(rating - 8, rating - 2), // Lower dribbling
      tackling: getRandomRating(rating - 8, rating - 2), // Lower tackling
      positioning: getRandomRating(rating - 3, rating + 7), // Higher positioning
      vision: getRandomRating(rating - 5, rating + 3),
      finishing: getRandomRating(rating - 10, rating - 5), // Lower finishing
    };
    gkAttrs = {
      handling: getRandomRating(rating - 3, rating + 7),
      commandOfArea: getRandomRating(rating - 3, rating + 7),
      eccentricity: getRandomRating(20, 80), // GK personality trait
      reflexes: getRandomRating(rating - 3, rating + 7),
      rushingOut: getRandomRating(rating - 5, rating + 5),
    };
  } else if (position === 'DEF') {
    technicalAttrs.tackling = getRandomRating(rating - 3, rating + 7); // Higher tackling for DEF
    technicalAttrs.positioning = getRandomRating(rating - 3, rating + 7); // Higher positioning
    technicalAttrs.passing = getRandomRating(rating - 3, rating + 7); // Higher passing
  } else if (position === 'MID') {
    technicalAttrs.passing = getRandomRating(rating - 3, rating + 7); // Higher passing for MID
    technicalAttrs.vision = getRandomRating(rating - 3, rating + 7); // Higher vision
    technicalAttrs.dribbling = getRandomRating(rating - 3, rating + 7); // Higher dribbling
  } else if (position === 'ATT') {
    technicalAttrs.shooting = getRandomRating(rating - 3, rating + 7); // Higher shooting for ATT
    technicalAttrs.finishing = getRandomRating(rating - 3, rating + 7); // Higher finishing
    technicalAttrs.dribbling = getRandomRating(rating - 3, rating + 7); // Higher dribbling
  }

  return {
    id: Math.random().toString(36).substring(2, 11),
    firstName: getRandomElement(FIRST_NAMES),
    lastName: getRandomElement(LAST_NAMES),
    age,
    position,
    technical: { ...technicalAttrs, ...gkAttrs },
    physical: {
      pace: getRandomRating(rating - 5, rating + 10),
      strength: getRandomRating(rating - 5, rating + 5),
      stamina: getRandomRating(rating - 5, rating + 5),
      agility: getRandomRating(rating - 5, rating + 5),
      acceleration: getRandomRating(rating - 5, rating + 5),
    },
    mental: {
      leadership: getRandomRating(30, 90),
      composure: getRandomRating(rating - 10, rating + 5),
      aggression: getRandomRating(30, 90),
      workRate: getRandomRating(40, 95),
      decisions: getRandomRating(rating - 10, rating + 5),
      determination: getRandomRating(40, 95),
    },
    hidden: {
      professionalism: getRandomRating(30, 95),
      ambition: getRandomRating(30, 95),
      loyalty: getRandomRating(30, 95),
      injuryProneness: getRandomRating(10, 80),
      temperament: getRandomRating(30, 90),
      bigMatchMentality: getRandomRating(30, 90),
      consistency: getRandomRating(40, 90),
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
    personality: getRandomElement(['LOYAL', 'AMBITIOUS', 'LAZY', 'INJURY_PRONE', 'PROFESSIONAL', 'TEMPERAMENTAL', 'LEADER', 'WONDERKID', 'CLUB_HERO'] as any),
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

      const club: Club = {
        id: clubId,
        name: clubName,
        stadiumName: `${getRandomElement(LAST_NAMES)} Park`,
        primaryColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        secondaryColor: '#ffffff',
        reputation: 100 - (league.tier * 20) + Math.random() * 10,
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
          { id: `sp-${clubId}-1`, name: 'Global Airlines', type: 'MAIN', amount: 500000, duration: 2, reputationRequired: 30, status: 'PENDING' },
          { id: `sp-${clubId}-2`, name: 'Zenith Energy', type: 'SLEEVE', amount: 150000, duration: 1, reputationRequired: 20, status: 'PENDING' },
          { id: `sp-${clubId}-3`, name: 'Apex Logistics', type: 'STADIUM', amount: 300000, duration: 3, reputationRequired: 40, status: 'PENDING' },
        ],
        activeSponsors: [],
        staffAds: [],
        staffApplicants: [],
        scoutAssignments: [],
        scoutReports: [],
        formation: manager.preferredFormation,
        tactics: getRandomElement(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as any[]) as any,
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

      clubs.push(club);
      managers.push(manager);
    }
  });

  // Create a large pool of free managers for the staff market
  for (let i = 0; i < 100; i++) {
    const managerRatingBase = getRandomRating(30, 80);
    managers.push({
      id: `free-manager-${i}`,
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
      salary: Math.floor(5000 + managerRatingBase * 200),
      clubId: '',
      relationshipWithChairman: 50,
      morale: 70,
      preferredStyle: getRandomElement(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as TacticalPhilosophy[]),
      preferredFormation: getRandomElement(['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-4-1'] as Formation[]),
      history: [`Available for hire from day one`]
    });
  }

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
    staff: [],
    transferBids: [],
    news: [],
    userClubId: null,
    personalBalance: 250000, // Non-league level starting wealth
  };
};
