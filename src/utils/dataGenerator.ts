import { type Club, type Player, type Manager, type League, type Position } from '../types/game';

const FIRST_NAMES = ['John', 'David', 'Michael', 'Chris', 'James', 'Robert', 'Mark', 'Paul', 'Kevin', 'Steven', 'Thomas', 'Daniel', 'Gary', 'William', 'Richard', 'Joseph', 'Andrew', 'Ryan', 'Luke', 'Adam'];
const LAST_NAMES = ['Smith', 'Jones', 'Brown', 'Taylor', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Harris', 'Clarke'];

const CLUB_NAMES = [
  'London City', 'Manchester Blues', 'Mersey Reds', 'North London Cannons', 'West Midlands Lions', 
  'Yorkshire United', 'South Coast Seagulls', 'East Anglian Canaries', 'North East Magpies', 'Midlands Foxes',
  'Thames Ironworks', 'South London Eagles', 'Lancashire Rovers', 'Derbyshire Rams', 'Nottingham Foresters',
  'Sheffield Blades', 'Birmingham Blues', 'Bristol Robins', 'Cardiff Bluebirds', 'Swansea Jacks'
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

  return {
    id: generateId(),
    firstName: getRandomElement(FIRST_NAMES),
    lastName: getRandomElement(LAST_NAMES),
    age,
    position,
    overallRating: rating,
    potentialRating: potential,
    value,
    wage,
    morale: 70 + Math.floor(Math.random() * 30),
    fitness: 100,
    clubId,
  };
}

export function generateInitialData() {
  const leagues: League[] = [
    { id: 'l1', name: 'Pro League 1', tier: 1, country: 'England' },
  ];

  const clubs: Club[] = [];
  const players: Player[] = [];
  const managers: Manager[] = [];

  CLUB_NAMES.slice(0, 20).forEach((name, index) => {
    const clubId = generateId();
    const isUserControlled = index === 0; // First club is user's by default

    clubs.push({
      id: clubId,
      name,
      reputation: 50 - index, // Top teams higher rep
      balance: 1000000,
      stadiumCapacity: 5000 + (20 - index) * 1000,
      fanbase: 1000 + (20 - index) * 500,
      leagueId: 'l1',
      isUserControlled,
    });

    // Generate squad: 2 GK, 6 DEF, 6 MID, 4 ATT
    const squadComposition: { pos: Position; count: number }[] = [
      { pos: 'GK', count: 2 },
      { pos: 'DEF', count: 6 },
      { pos: 'MID', count: 6 },
      { pos: 'ATT', count: 4 },
    ];

    const baseRating = 50 + (20 - index) * 2; // AI clubs range from ~50 to ~90

    squadComposition.forEach(({ pos, count }) => {
      for (let i = 0; i < count; i++) {
        players.push(generatePlayer(clubId, pos, baseRating - 5, baseRating + 5));
      }
    });

    managers.push({
      id: generateId(),
      name: `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
      attackStyle: 40 + Math.random() * 20,
      defensiveStyle: 40 + Math.random() * 20,
      youthPreference: 30 + Math.random() * 40,
      tacticalRating: baseRating,
      manManagement: baseRating,
      salary: baseRating * 100,
      clubId,
    });
  });

  return { leagues, clubs, players, managers };
}
