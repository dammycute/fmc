import { 
  type Club, type Player, type Manager, type League, type Position, 
  type TacticalPhilosophy, type Formation, 
  type OwnershipType, type BoardExpectation, type ClubCultureType, 
  type GameState, type Match
} from '../types/game';

const FIRST_NAMES = ['John', 'David', 'Michael', 'Chris', 'James', 'Robert', 'Mark', 'Paul', 'Kevin', 'Steven', 'Thomas', 'Daniel', 'Gary', 'William', 'Richard', 'Joseph', 'Andrew', 'Ryan', 'Luke', 'Adam', 'Mateo', 'Luka', 'Santi', 'Theo', 'Marco'];
const LAST_NAMES = ['Smith', 'Jones', 'Brown', 'Taylor', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Harris', 'Clarke', 'Garcia', 'Muller', 'Silva', 'Rossi', 'Dubois'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomRating = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generatePlayer = (clubId: string, leagueTier: number, isYouth = false): Player => {
  const baseMin = 80 - (leagueTier * 10);
  const baseMax = 90 - (leagueTier * 10);
  const age = isYouth ? 16 + Math.floor(Math.random() * 4) : 18 + Math.floor(Math.random() * 15);
  
  const rating = getRandomRating(Math.max(30, baseMin), Math.min(95, baseMax));
  const potential = Math.min(99, rating + Math.floor(Math.random() * 15));

  const position = getRandomElement(['GK', 'DEF', 'MID', 'ATT'] as Position[]);
  const playerTierMultiplier = [1, 0.25, 0.05, 0.01, 0.005][leagueTier - 1] || 0.005;

  return {
    id: Math.random().toString(36).substr(2, 9),
    firstName: getRandomElement(FIRST_NAMES),
    lastName: getRandomElement(LAST_NAMES),
    age,
    position,
    technical: {
      passing: getRandomRating(rating - 5, rating + 5),
      shooting: getRandomRating(rating - 5, rating + 5),
      dribbling: getRandomRating(rating - 5, rating + 5),
      tackling: getRandomRating(rating - 5, rating + 5),
      positioning: getRandomRating(rating - 5, rating + 5),
      vision: getRandomRating(rating - 5, rating + 5),
      finishing: getRandomRating(rating - 5, rating + 5),
      ...(position === 'GK' ? { handling: getRandomRating(rating - 5, rating + 5) } : {}),
    },
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
      joinedDate: '2024-07-01'
    }
  };
};

const clubSuffixes = ['United', 'FC', 'City', 'Town', 'Athletic', 'Wanderers', 'Rovers', 'Albion', 'County', 'Harriers', 'Swifts', 'Sporting', 'Rangers', 'Strollers'];
const placeNames = ['Bromley', 'Dorking', 'Sutton', 'Boreham', 'Ebbsfleet', 'Solihull', 'Maidenhead', 'Wealdstone', 'Altrincham', 'Eastleigh', 'Dartford', 'Havant', 'Chelmsford', 'Maidstone', 'Tonbridge', 'St Albans', 'Hemel', 'Worthing', 'Braintree', 'Chippenham', 'Weymouth', 'Slough'];

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
      const clubName = `${getRandomElement(placeNames)} ${getRandomElement(clubSuffixes)}`;

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
          weeklyWages: 0,
          weeklyStaffWages: 0,
          revenue: { tickets: 0, sponsorship: 200000, prizeMoney: 0, merchandise: 10000, tvRights: 100000, playerSales: 0 },
          expenses: { playerWages: 0, staffWages: 0, transfers: 0, facilityMaintenance: 5000, loanRepayments: 0 }
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
        history: [`Club founded in ${league.name}`]
      };

      // Generate Squad
      const squad: Player[] = [];
      for (let p = 0; p < 22; p++) {
        const player = generatePlayer(clubId, league.tier);
        squad.push(player);
        allPlayers.push(player);
      }
      club.finances.weeklyWages = squad.reduce((sum, p) => sum + p.wage, 0);

      // Generate Manager
      const manager: Manager = {
        id: `m-${clubId}`,
        name: `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
        coaching: {
          attacking: getRandomRating(40, 90),
          defensive: getRandomRating(40, 90),
          tactical: getRandomRating(40, 90),
          mental: getRandomRating(40, 90),
          workingWithYouth: getRandomRating(40, 90),
        },
        philosophy: getRandomElement(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as TacticalPhilosophy[]),
        pressing: getRandomRating(30, 95),
        creativeFreedom: getRandomRating(30, 95),
        personality: {
          discipline: getRandomRating(40, 95),
          loyalty: getRandomRating(40, 95),
          ambition: getRandomRating(40, 95),
          mediaHandling: getRandomRating(40, 95),
          playerManagement: getRandomRating(40, 95),
        },
        coachingAbility: getRandomRating(40, 90),
        tacticalIntelligence: getRandomRating(40, 90),
        salary: Math.floor(5000 * tierMultiplier),
        clubId: clubId,
        relationshipWithChairman: 70,
        morale: 70,
        preferredStyle: ['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'][Math.floor(Math.random() * 6)] as TacticalPhilosophy,
        preferredFormation: ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-4-1'][Math.floor(Math.random() * 5)] as Formation,
        history: [`Started career at ${clubName}`]
      };

      clubs.push(club);
      managers.push(manager);
    }
  });

  const allMatches: Match[] = [];
  
  // Generate Fixtures for all leagues (Circle Method Round Robin)
  leagues.forEach(league => {
    const leagueClubs = clubs.filter(c => c.leagueId === league.id);
    const numClubs = leagueClubs.length;
    const rounds = numClubs - 1;
    const half = numClubs / 2;
    
    // Create an array for rotation (keep first element fixed)
    const clubIds = leagueClubs.map(c => c.id);

    for (let round = 0; round < rounds * 2; round++) { // Double for Home & Away
      const week = round + 1;
      const weekMatches: Match[] = [];
      
      for (let i = 0; i < half; i++) {
        const homeIdx = i;
        const awayIdx = numClubs - 1 - i;
        
        const homeId = clubIds[homeIdx];
        const awayId = clubIds[awayIdx];

        weekMatches.push({
          id: `m-${league.id}-w${week}-${homeId}-${awayId}`,
          homeClubId: round % 2 === 0 ? homeId : awayId, // Alternate home/away
          awayClubId: round % 2 === 0 ? awayId : homeId,
          homeScore: 0,
          awayScore: 0,
          played: false,
          leagueId: league.id,
          week,
          season: 2024,
          events: []
        });
      }
      
      allMatches.push(...weekMatches);
      
      // Rotate clubIds (excluding the first one)
      const last = clubIds.pop()!;
      clubIds.splice(1, 0, last);
    }
  });

  return { 
    currentWeek: 1,
    currentSeason: 2024,
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
    personalBalance: 500000 // Non-league level starting wealth
  };
};
