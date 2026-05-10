import { type Club, type Player, type Manager, type League, type Position } from '../types/game';

const FIRST_NAMES = ['John', 'David', 'Michael', 'Chris', 'James', 'Robert', 'Mark', 'Paul', 'Kevin', 'Steven', 'Thomas', 'Daniel', 'Gary', 'William', 'Richard', 'Joseph', 'Andrew', 'Ryan', 'Luke', 'Adam'];
const LAST_NAMES = ['Smith', 'Jones', 'Brown', 'Taylor', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Harris', 'Clarke'];

const CLUB_DATA = [
  // Tier 1: Premier League
  { name: 'Manchester Blues', primaryColor: '#6CABDD', secondaryColor: '#FFFFFF', stadiumName: 'Etihad Stadium' },
  { name: 'Mersey Reds', primaryColor: '#C8102E', secondaryColor: '#F6EB61', stadiumName: 'Anfield' },
  { name: 'North London Cannons', primaryColor: '#EF0107', secondaryColor: '#FFFFFF', stadiumName: 'Emirates Stadium' },
  { name: 'London City', primaryColor: '#034694', secondaryColor: '#FFFFFF', stadiumName: 'Stamford Bridge' },
  { name: 'Manchester Devils', primaryColor: '#DA291C', secondaryColor: '#000000', stadiumName: 'Old Trafford' },
  { name: 'North London Lilies', primaryColor: '#132257', secondaryColor: '#FFFFFF', stadiumName: 'Tottenham Hotspur Stadium' },
  { name: 'West Midlands Lions', primaryColor: '#670E36', secondaryColor: '#95BFE5', stadiumName: 'Villa Park' },
  { name: 'North East Magpies', primaryColor: '#241F20', secondaryColor: '#FFFFFF', stadiumName: 'St James\' Park' },
  { name: 'South Coast Seagulls', primaryColor: '#0057B8', secondaryColor: '#FFFFFF', stadiumName: 'Amex Stadium' },
  { name: 'Midlands Foxes', primaryColor: '#003090', secondaryColor: '#FDBE11', stadiumName: 'King Power Stadium' },
  { name: 'Thames Ironworks', primaryColor: '#7A263A', secondaryColor: '#1BB1E7', stadiumName: 'London Stadium' },
  { name: 'South London Eagles', primaryColor: '#1B458F', secondaryColor: '#C4122E', stadiumName: 'Selhurst Park' },
  { name: 'Lancashire Rovers', primaryColor: '#0054A6', secondaryColor: '#ED1C24', stadiumName: 'Ewood Park' },
  { name: 'Derbyshire Rams', primaryColor: '#FFFFFF', secondaryColor: '#000000', stadiumName: 'Pride Park' },
  { name: 'Nottingham Foresters', primaryColor: '#DD0000', secondaryColor: '#FFFFFF', stadiumName: 'City Ground' },
  { name: 'Sheffield Blades', primaryColor: '#EE2737', secondaryColor: '#000000', stadiumName: 'Bramall Lane' },
  { name: 'Birmingham Blues', primaryColor: '#0000FF', secondaryColor: '#FFFFFF', stadiumName: 'St Andrew\'s' },
  { name: 'Bristol Robins', primaryColor: '#BC0303', secondaryColor: '#FFFFFF', stadiumName: 'Ashton Gate' },
  { name: 'Cardiff Bluebirds', primaryColor: '#0000FF', secondaryColor: '#FFFFFF', stadiumName: 'Cardiff City Stadium' },
  { name: 'Swansea Jacks', primaryColor: '#FFFFFF', secondaryColor: '#000000', stadiumName: 'Swansea.com Stadium' },
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function generatePlayer(clubId: string, position: Position, minRating: number, maxRating: number): Player {
  const rating = Math.floor(Math.random() * (maxRating - minRating + 1)) + minRating;
  const potential = Math.min(99, rating + Math.floor(Math.random() * 15));
  const age = 17 + Math.floor(Math.random() * 18);
  
  // Basic value calculation
  const value = (rating * rating * 1000) + (potential * 500);
  const wage = (rating * 100);

  const personalities: Player['personality'][] = ['LOYAL', 'AMBITIOUS', 'LAZY', 'INJURY_PRONE', 'PROFESSIONAL', 'TEMPERAMENTAL'];

  return {
    id: generateId(),
    firstName: getRandomElement(FIRST_NAMES),
    lastName: getRandomElement(LAST_NAMES),
    age,
    position,
    technical: {
      passing: rating + (Math.random() * 10 - 5),
      shooting: rating + (Math.random() * 10 - 5),
      dribbling: rating + (Math.random() * 10 - 5),
      tackling: rating + (Math.random() * 10 - 5),
    },
    physical: {
      pace: rating + (Math.random() * 10 - 5),
      strength: rating + (Math.random() * 10 - 5),
      stamina: rating + (Math.random() * 10 - 5),
    },
    mental: {
      leadership: rating + (Math.random() * 10 - 5),
      composure: rating + (Math.random() * 10 - 5),
      aggression: rating + (Math.random() * 10 - 5),
    },
    overallRating: rating,
    potentialRating: potential,
    value,
    wage,
    morale: 70 + Math.floor(Math.random() * 30),
    fitness: 100,
    clubId,
    personality: getRandomElement(personalities),
  };
}

export function generateInitialData() {
  const leagues: League[] = [
    { id: 'l1', name: 'Premier League', tier: 1, country: 'England' },
    { id: 'l2', name: 'Championship', tier: 2, country: 'England' },
    { id: 'l3', name: 'League One', tier: 3, country: 'England' },
    { id: 'l4', name: 'League Two', tier: 4, country: 'England' },
    { id: 'l5', name: 'National League', tier: 5, country: 'England' },
    { id: 'l6n', name: 'National League North', tier: 6, country: 'England' },
    { id: 'l6s', name: 'National League South', tier: 6, country: 'England' },
  ];

  const clubs: Club[] = [];
  const players: Player[] = [];
  const managers: Manager[] = [];

  leagues.forEach((league) => {
    // Generate 20 clubs per league (simplified for MVP, maybe fewer for lower tiers)
    const clubCount = league.tier === 6 ? 10 : 20;

    for (let i = 0; i < clubCount; i++) {
      const clubId = generateId();
      const isUserControlled = league.tier === 1 && i === 0; // First club of PL is user's

      const clubBaseData = CLUB_DATA[i % CLUB_DATA.length];
      const name = league.tier === 1 ? clubBaseData.name : `${clubBaseData.name} ${league.name.split(' ')[0]}`;

      clubs.push({
        id: clubId,
        name: name,
        stadiumName: clubBaseData.stadiumName,
        primaryColor: clubBaseData.primaryColor,
        secondaryColor: clubBaseData.secondaryColor,
        reputation: 100 - (league.tier * 15) - (i * 2),
        balance: 10000000 / league.tier,
        stadiumCapacity: (30000 / league.tier) + (20 - i) * 500,
        fanbase: (20000 / league.tier) + (20 - i) * 200,
        leagueId: league.id,
        isUserControlled,
        philosophy: getRandomElement(['ATTACKING', 'DEFENSIVE', 'YOUTH', 'BALANCED']),
        fanConfidence: 70,
        boardConfidence: 70,
      });

      // Generate squad
      const baseRating = 90 - (league.tier * 10) - (i * 0.5);
      const squadComposition: { pos: Position; count: number }[] = [
        { pos: 'GK', count: 2 },
        { pos: 'DEF', count: 8 },
        { pos: 'MID', count: 8 },
        { pos: 'ATT', count: 5 },
      ];

      squadComposition.forEach(({ pos, count }) => {
        for (let j = 0; j < count; j++) {
          players.push(generatePlayer(clubId, pos, baseRating - 5, baseRating + 5));
        }
      });

      managers.push({
        id: generateId(),
        name: `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
        attacking: 40 + Math.random() * 50,
        defensive: 40 + Math.random() * 50,
        possession: 40 + Math.random() * 50,
        pressing: 40 + Math.random() * 50,
        counterAttack: 40 + Math.random() * 50,
        discipline: 40 + Math.random() * 50,
        mediaHandling: 40 + Math.random() * 50,
        loyalty: 40 + Math.random() * 50,
        temperament: 40 + Math.random() * 50,
        ambition: 40 + Math.random() * 50,
        youthDevelopment: 40 + Math.random() * 50,
        tacticalIntelligence: 40 + Math.random() * 50,
        squadRotation: 40 + Math.random() * 50,
        playerManagement: 40 + Math.random() * 50,
        salary: (baseRating * 1000) / league.tier,
        clubId,
        relationshipWithChairman: 70,
      });
    }
  });

  return { leagues, clubs, players, managers };
}
