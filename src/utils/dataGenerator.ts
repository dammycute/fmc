import {
  type Club, type Player, type Manager, type League, type Position,
  type TacticalPhilosophy, type Formation,
  type OwnershipType, type SeasonTarget, type BoardExpectation, type ClubCultureType,
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

const ENGLISH_FIRST = ['Jack', 'Harry', 'George', 'Charlie', 'Alfie', 'James', 'Oliver', 'Liam', 'Mason', 'Theo', 'Connor', 'Kieran', 'Luke', 'Ryan', 'Jordan', 'Adam', 'Lewis', 'Callum', 'Ben', 'Tom'];
const ENGLISH_LAST = ['Smith', 'Jones', 'Taylor', 'Brown', 'Wilson', 'Davies', 'Evans', 'Thomas', 'Roberts', 'Walker', 'White', 'Hall', 'Clarke', 'Ward', 'Moore', 'Hughes', 'Martin', 'Wood', 'Lewis', 'Lee'];
const FRENCH_FIRST = ['Kylian', 'Antoine', 'Karim', 'Paul', 'Raphael', 'Theo', 'Ousmane', 'Marcus', 'Kingsley', 'Lucas', 'Matteo', 'Rayan', 'Youssef', 'Axel', 'Amine', 'Florian', 'Nabil', 'Adrien', 'Tanguy'];
const FRENCH_LAST = ['Dupont', 'Martin', 'Bernard', 'Petit', 'Laurent', 'Leroy', 'Moreau', 'Girard', 'Rousseau', 'Blanc', 'Lemaire', 'Faure', 'Dembele', 'Kante', 'Pogba', 'Mbappe', 'Zidane', 'Henry', 'Vieira'];
const SPANISH_FIRST = ['Pablo', 'Carlos', 'Diego', 'Sergio', 'Alejandro', 'Fernando', 'Alvaro', 'Marcos', 'Rodrigo', 'Mikel', 'Dani', 'Pedri', 'Gavi', 'Ferran', 'Nico', 'Eric', 'Oscar', 'Victor', 'Ivan', 'Luis'];
const SPANISH_LAST = ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Sanchez', 'Gonzalez', 'Perez', 'Torres', 'Ramirez', 'Flores', 'Morales', 'Ortega', 'Silva', 'Diaz', 'Romero', 'Ruiz', 'Jimenez', 'Alvarez', 'Molina'];
const BRAZILIAN_FIRST = ['Gabriel', 'Vinicius', 'Rodrygo', 'Endrick', 'Matheus', 'Lucas', 'Felipe', 'Rafael', 'Bruno', 'Thiago', 'Neymar', 'Richarlison', 'Casemiro', 'Fabinho', 'Roberto', 'Alisson', 'Ederson', 'Marquinhos'];
const BRAZILIAN_LAST = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Carvalho', 'Barbosa', 'Cavalcanti', 'Nunes', 'Araujo', 'Mendes', 'Teixeira'];
const AFRICAN_FIRST = ['Mohamed', 'Sadio', 'Riyad', 'Victor', 'Emmanuel', 'Wilfried', 'Nicolas', 'Divock', 'Odion', 'Samuel', 'Ismaila', 'Serge', 'Andre', 'Thomas', 'Ibrahim', 'Cheikhou', 'Edouard', 'Bukayo', 'Eberechi'];
const AFRICAN_LAST = ['Salah', 'Mane', 'Mahrez', 'Osimhen', 'Zaha', 'Boly', 'Onana', 'Eze', 'Saka', 'Diallo', 'Kouyate', 'Traore', 'Doucouré', 'Bakayoko', 'Koulibaly', 'Mendy', 'Sarr', 'Diatta'];
const GERMAN_FIRST = ['Thomas', 'Kai', 'Leroy', 'Joshua', 'Leon', 'Florian', 'Marco', 'Toni', 'Manuel', 'Niklas', 'Antonio', 'Serge', 'Ilkay', 'Julian', 'Lukas', 'Jonas', 'Max', 'Robin', 'Emre'];
const GERMAN_LAST = ['Muller', 'Kroos', 'Reus', 'Werner', 'Sane', 'Kimmich', 'Goretzka', 'Musiala', 'Gnabry', 'Rudiger', 'Havertz', 'Neuer', 'Hummels', 'Boateng', 'Gundogan', 'Draxler', 'Brandt'];
const SCANDINAVIAN_FIRST = ['Erling', 'Martin', 'Kasper', 'Christian', 'Mikkel', 'Victor', 'Andreas', 'Joachim', 'Emil', 'Rasmus', 'Magnus', 'Fredrik', 'Sander', 'Jonas', 'Mathias', 'Henrik', 'Lars', 'Bjorn', 'Erik'];
const SCANDINAVIAN_LAST = ['Haaland', 'Odegaard', 'Schmeichel', 'Eriksen', 'Damsgaard', 'Skov Olsen', 'Lindstrom', 'Norgaard', 'Braithwaite', 'Forsberg', 'Larsson', 'Berg', 'Johnsen', 'Hansen', 'Nielsen', 'Andersen'];

const pickNationality = (tier: number): { first: string[]; last: string[] } => {
  const rand = Math.random();

  if (tier === 1) {
    if (rand < 0.18) return { first: ENGLISH_FIRST, last: ENGLISH_LAST };
    if (rand < 0.30) return { first: BRAZILIAN_FIRST, last: BRAZILIAN_LAST };
    if (rand < 0.42) return { first: FRENCH_FIRST, last: FRENCH_LAST };
    if (rand < 0.54) return { first: SPANISH_FIRST, last: SPANISH_LAST };
    if (rand < 0.66) return { first: AFRICAN_FIRST, last: AFRICAN_LAST };
    if (rand < 0.78) return { first: GERMAN_FIRST, last: GERMAN_LAST };
    return { first: SCANDINAVIAN_FIRST, last: SCANDINAVIAN_LAST };
  }

  if (tier === 2) {
    if (rand < 0.45) return { first: ENGLISH_FIRST, last: ENGLISH_LAST };
    if (rand < 0.60) return { first: FRENCH_FIRST, last: FRENCH_LAST };
    if (rand < 0.72) return { first: AFRICAN_FIRST, last: AFRICAN_LAST };
    if (rand < 0.82) return { first: SPANISH_FIRST, last: SPANISH_LAST };
    if (rand < 0.90) return { first: GERMAN_FIRST, last: GERMAN_LAST };
    return { first: SCANDINAVIAN_FIRST, last: SCANDINAVIAN_LAST };
  }

  if (tier === 3) {
    if (rand < 0.70) return { first: ENGLISH_FIRST, last: ENGLISH_LAST };
    if (rand < 0.82) return { first: AFRICAN_FIRST, last: AFRICAN_LAST };
    if (rand < 0.91) return { first: FRENCH_FIRST, last: FRENCH_LAST };
    return { first: SPANISH_FIRST, last: SPANISH_LAST };
  }

  if (tier === 4) {
    if (rand < 0.85) return { first: ENGLISH_FIRST, last: ENGLISH_LAST };
    if (rand < 0.94) return { first: AFRICAN_FIRST, last: AFRICAN_LAST };
    return { first: FRENCH_FIRST, last: FRENCH_LAST };
  }

  return { first: ENGLISH_FIRST, last: ENGLISH_LAST };
};

export const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const getRandomRating = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Tier-scaled rating ranges
const TIER_RATINGS: Record<number, { min: number; max: number; variance: number }> = {
  1: { min: 76, max: 94, variance: 5 },   // Premier League: world class to squad fillers
  2: { min: 63, max: 78, variance: 7 },   // Championship: solid pros, some gems
  3: { min: 52, max: 67, variance: 9 },   // League One: journeymen and youth
  4: { min: 42, max: 57, variance: 11 },  // League Two: part-timers and experienced pros
  5: { min: 32, max: 48, variance: 13 },  // National League: semi-pro level
};

type StatKey = keyof Player['technical'] | keyof Player['physical'] | keyof Player['mental'];

type Archetype = {
  name: string;
  statBias: Partial<Record<StatKey, number>>;
};

export const PLAYER_ARCHETYPES: Record<Position, Archetype[]> = {
  GK: [
    {
      name: 'Sweeper Keeper',
      statBias: {
        rushingOut: 12,
        reflexes: 8,
        commandOfArea: -5,
        handling: -3,
        passing: 6,
      },
    },
    {
      name: 'Traditional Keeper',
      statBias: {
        commandOfArea: 12,
        handling: 10,
        rushingOut: -8,
        reflexes: 5,
        passing: -5,
      },
    },
    {
      name: 'Distributor',
      statBias: {
        passing: 14,
        handling: 8,
        reflexes: -3,
        rushingOut: 5,
        commandOfArea: -4,
      },
    },
  ],
  DEF: [
    {
      name: 'Ball Playing CB',
      statBias: {
        passing: 10,
        vision: 8,
        tackling: -3,
        pace: -4,
        strength: -2,
      },
    },
    {
      name: 'Stopper',
      statBias: {
        tackling: 12,
        strength: 10,
        aggression: 8,
        passing: -8,
        pace: -5,
      },
    },
    {
      name: 'Pacey CB',
      statBias: {
        pace: 12,
        acceleration: 10,
        tackling: 4,
        strength: -6,
        passing: -4,
      },
    },
    {
      name: 'Fullback Winger',
      statBias: {
        pace: 10,
        dribbling: 8,
        vision: 6,
        tackling: -4,
        strength: -5,
      },
    },
    {
      name: 'Defensive Fullback',
      statBias: {
        tackling: 10,
        positioning: 8,
        pace: -3,
        dribbling: -6,
      },
    },
  ],
  MID: [
    {
      name: 'Deep Lying Playmaker',
      statBias: {
        passing: 14,
        vision: 12,
        tackling: 4,
        pace: -6,
        shooting: -5,
      },
    },
    {
      name: 'Box to Box',
      statBias: {
        workRate: 10,
        stamina: 8,
        shooting: 6,
        passing: 4,
        pace: 4,
      },
    },
    {
      name: 'Destroyer CDM',
      statBias: {
        tackling: 14,
        aggression: 10,
        strength: 8,
        passing: -10,
        vision: -8,
      },
    },
    {
      name: 'Advanced Playmaker',
      statBias: {
        vision: 12,
        dribbling: 10,
        passing: 8,
        shooting: 4,
        tackling: -8,
      },
    },
    {
      name: 'Wide Midfielder',
      statBias: {
        pace: 8,
        vision: 6,
        dribbling: 6,
        stamina: 4,
        tackling: -4,
      },
    },
  ],
  ATT: [
    {
      name: 'Target Man',
      statBias: {
        strength: 14,
        finishing: 12,
        shooting: 6,
        pace: -8,
        dribbling: -6,
      },
    },
    {
      name: 'Poacher',
      statBias: {
        shooting: 14,
        composure: 10,
        positioning: 10,
        pace: 2,
        strength: -8,
      },
    },
    {
      name: 'Pacey Forward',
      statBias: {
        pace: 14,
        acceleration: 12,
        dribbling: 8,
        strength: -8,
        passing: -2,
      },
    },
    {
      name: 'Complete Forward',
      statBias: {
        shooting: 8,
        dribbling: 8,
        pace: 6,
        strength: 4,
        passing: 4,
      },
    },
    {
      name: 'Inside Forward',
      statBias: {
        dribbling: 12,
        shooting: 10,
        pace: 8,
        strength: -6,
        finishing: -8,
      },
    },
  ],
};

const generateAge = (tier: number, isYouth: boolean): number => {
  if (isYouth) return 16 + Math.floor(Math.random() * 4); // 16–19

  const rand = Math.random();

  if (tier === 1) {
    if (rand < 0.08) return 17 + Math.floor(Math.random() * 3);  // 17–19 (8%)
    if (rand < 0.30) return 20 + Math.floor(Math.random() * 3);  // 20–22 (22%)
    if (rand < 0.72) return 23 + Math.floor(Math.random() * 7);  // 23–29 (42%)
    if (rand < 0.92) return 30 + Math.floor(Math.random() * 4);  // 30–33 (20%)
    return 34 + Math.floor(Math.random() * 3);                    // 34–36 (8%)
  }

  if (tier === 2) {
    if (rand < 0.06) return 17 + Math.floor(Math.random() * 3);
    if (rand < 0.25) return 20 + Math.floor(Math.random() * 3);
    if (rand < 0.65) return 23 + Math.floor(Math.random() * 7);
    if (rand < 0.88) return 30 + Math.floor(Math.random() * 4);
    return 34 + Math.floor(Math.random() * 3);
  }

  if (tier === 3) {
    if (rand < 0.12) return 17 + Math.floor(Math.random() * 3);
    if (rand < 0.30) return 20 + Math.floor(Math.random() * 3);
    if (rand < 0.60) return 23 + Math.floor(Math.random() * 7);
    if (rand < 0.85) return 30 + Math.floor(Math.random() * 5);
    return 35 + Math.floor(Math.random() * 3);
  }

  if (tier === 4) {
    if (rand < 0.15) return 17 + Math.floor(Math.random() * 3);
    if (rand < 0.28) return 20 + Math.floor(Math.random() * 3);
    if (rand < 0.52) return 23 + Math.floor(Math.random() * 7);
    if (rand < 0.80) return 30 + Math.floor(Math.random() * 5);
    return 35 + Math.floor(Math.random() * 4);
  }

  if (rand < 0.20) return 16 + Math.floor(Math.random() * 4);   // cheap youth
  if (rand < 0.35) return 20 + Math.floor(Math.random() * 3);
  if (rand < 0.52) return 23 + Math.floor(Math.random() * 7);
  if (rand < 0.75) return 30 + Math.floor(Math.random() * 5);
  return 35 + Math.floor(Math.random() * 5);                     // winding down
};

export const generatePlayer = (clubId: string, leagueTier: number, isYouth = false): Player => {
  const tierCfg = TIER_RATINGS[leagueTier] || TIER_RATINGS[5];
  const age = generateAge(leagueTier, isYouth);

  const rating = getRandomRating(tierCfg.min, tierCfg.max);
  const potential = Math.min(99, rating + Math.floor(Math.random() * (leagueTier >= 3 ? 22 : 15)));

  const position = getRandomElement(['GK', 'DEF', 'MID', 'ATT'] as Position[]);
  const archetypes = PLAYER_ARCHETYPES[position];
  const archetype = getRandomElement(archetypes);

  // Profile — governs development and decline curve shape
  const profile = (() => {
    if (position === 'GK') return 'TECHNICAL';
    if (archetype.name === 'Pacey Forward' || archetype.name === 'Pacey CB' || archetype.name === 'Fullback Winger') return 'EXPLOSIVE';
    if (archetype.name === 'Deep Lying Playmaker' || archetype.name === 'Ball Playing CB' || archetype.name === 'Distributor') return 'TECHNICAL';
    if (age >= 29) return 'MENTAL';
    return getRandomElement(['EXPLOSIVE', 'TECHNICAL', 'MENTAL', 'BALANCED'] as const);
  })();

  const consistencyBase = leagueTier === 1 ? 65 : leagueTier === 2 ? 55 : leagueTier === 3 ? 45 : 35;
  const consistencyAgeBonus = Math.min(20, (age - 18) * 1.2);
  const consistency = Math.max(10, Math.min(99,
    consistencyBase + consistencyAgeBonus + (Math.random() * 30 - 10)
  ));

  const v = tierCfg.variance; // wider spread at lower tiers

  const getBias = (key: StatKey) => archetype.statBias[key] ?? 0;
  const biasedStat = (base: number, bias = 0) => {
    const min = Math.max(20, base - v + bias);
    const max = Math.min(99, base + v + bias);
    return getRandomRating(min, max);
  };
  const biasedStatRange = (minBase: number, maxBase: number, bias = 0) => {
    const min = Math.max(20, minBase + bias);
    const max = Math.min(99, maxBase + bias);
    return getRandomRating(min, max);
  };



  // Position-specific attribute adjustments
  let technicalAttrs = {
    passing: biasedStat(rating, getBias('passing')),
    shooting: biasedStat(rating, getBias('shooting')),
    dribbling: biasedStat(rating, getBias('dribbling')),
    tackling: biasedStat(rating, getBias('tackling')),
    positioning: biasedStat(rating, getBias('positioning')),
    vision: biasedStat(rating, getBias('vision')),
    finishing: biasedStat(rating, getBias('finishing')),
  };

  let gkAttrs = {};

  if (position === 'GK') {
    technicalAttrs = {
      passing: biasedStatRange(rating - 8, rating - 2, getBias('passing')),
      shooting: biasedStatRange(rating - 10, rating - 5, getBias('shooting')),
      dribbling: biasedStatRange(rating - 8, rating - 2, getBias('dribbling')),
      tackling: biasedStatRange(rating - 8, rating - 2, getBias('tackling')),
      positioning: biasedStatRange(rating - 3, rating + 7, getBias('positioning')),
      vision: biasedStatRange(rating - 5, rating + 3, getBias('vision')),
      finishing: biasedStatRange(rating - 10, rating - 5, getBias('finishing')),
    };
    gkAttrs = {
      handling: biasedStatRange(rating - 3, rating + 7, getBias('handling')),
      commandOfArea: biasedStatRange(rating - 3, rating + 7, getBias('commandOfArea')),
      eccentricity: getRandomRating(20, 80),
      reflexes: biasedStatRange(rating - 3, rating + 7, getBias('reflexes')),
      rushingOut: biasedStatRange(rating - 5, rating + 5, getBias('rushingOut')),
    };
  } else if (position === 'DEF') {
    technicalAttrs.tackling = biasedStat(rating, getBias('tackling'));
    technicalAttrs.positioning = biasedStat(rating, getBias('positioning'));
  } else if (position === 'MID') {
    technicalAttrs.passing = biasedStat(rating, getBias('passing'));
    technicalAttrs.vision = biasedStat(rating, getBias('vision'));
  } else if (position === 'ATT') {
    technicalAttrs.shooting = biasedStat(rating, getBias('shooting'));
    technicalAttrs.finishing = biasedStat(rating, getBias('finishing'));
  }

  // Tier-scaled mental attributes
  // Lower tiers: lower composure/decisions, but work rate and determination can still be high
  const mentalBase = rating;


  const namePool = pickNationality(leagueTier);
  const firstName = getRandomElement(namePool.first);
  const lastName = getRandomElement(namePool.last);
  const contractYears = 1 + Math.floor(Math.random() * 4);

  // --- Position wage premium ---
  // Attackers and attacking mids earn more at same ability level
  const positionWagePremium: Record<Position, number> = {
    GK:  0.85,
    DEF: 0.90,
    MID: 1.00,
    ATT: 1.15,
  };

  // --- Age value factor ---
  // Peak value at 24-27, sharp drop after 30, very low under 19
  const ageValueFactor = (() => {
    if (age <= 17) return 0.40;
    if (age <= 19) return 0.65;
    if (age <= 21) return 0.85;
    if (age <= 23) return 0.95;
    if (age <= 27) return 1.00;  // peak
    if (age <= 29) return 0.88;
    if (age <= 31) return 0.70;
    if (age <= 33) return 0.50;
    if (age <= 35) return 0.30;
    return 0.15;
  })();

  // --- Potential factor ---
  // High potential gap on young players drives up value significantly
  const potentialGap = Math.max(0, potential - rating);
  const potentialFactor = 1 + (potentialGap / 100) * (age < 24 ? 1.5 : age < 28 ? 0.8 : 0.3);

  // --- Contract factor ---
  // Less time on contract = lower value (selling club has less leverage)
  const contractFactor = 0.6 + (contractYears * 0.1); // 1yr = 0.7x, 4yr = 1.0x

  // --- Tier base multipliers ---
  const tierValueBase: Record<number, number> = {
    1: 9_000_000,
    2: 2_000_000,
    3: 350_000,
    4: 55_000,
    5: 8_000,
  };
  const tierWageBase: Record<number, number> = {
    1: 90_000,   // per week
    2: 15_000,
    3: 2_500,
    4: 500,
    5: 120,
  };

  const tierBase = tierValueBase[leagueTier] || 8_000;
  const tierWage = tierWageBase[leagueTier] || 120;

  // Value formula: base × rating factor × age × potential × contract
  const ratingFactor = Math.pow(rating / 70, 2.5); // exponential — elite players worth far more
  const value = Math.floor(
    tierBase * ratingFactor * ageValueFactor * potentialFactor * contractFactor
  );

  // Wage formula: simpler — tier base × rating scale × position premium × age scale
  const ageWageFactor = age < 20 ? 0.5 : age < 24 ? 0.75 : age < 30 ? 1.0 : age < 33 ? 0.85 : 0.65;
  const wage = Math.floor(
    tierWage * (rating / 65) * positionWagePremium[position] * ageWageFactor
  );

  const result: Player = {
    id: Math.random().toString(36).substring(2, 11),
    firstName,
    lastName,
    age,
    position,
    technical: { ...technicalAttrs, ...gkAttrs },
    physical: {
      pace: biasedStat(rating, getBias('pace')),
      strength: biasedStat(rating, getBias('strength')),
      stamina: biasedStat(Math.max(30, rating + (leagueTier >= 4 ? 5 : 0)), getBias('stamina')),
      agility: biasedStat(rating, getBias('agility')),
      acceleration: biasedStat(rating, getBias('acceleration')),
    },
    mental: {
      leadership: biasedStat(55, getBias('leadership')),
      composure: biasedStat(mentalBase, getBias('composure')),
      aggression: biasedStat(60, getBias('aggression')),
      workRate: biasedStat(67, getBias('workRate')),
      decisions: biasedStat(mentalBase, getBias('decisions')),
      determination: biasedStat(67, getBias('determination')),
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
    archetype: archetype.name,
    consistency,
    profile,
    overallRating: rating,
    potentialRating: potential,
    value: Math.max(1000, value),
    wage: Math.max(50, wage),
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
    contractYears,
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
  if (age < 26) {
    const growthFactor = (26 - age) / 26;
    if (profile === 'EXPLOSIVE') {
      result.physical.pace         = Math.min(99, result.physical.pace + Math.floor(growthFactor * 8));
      result.physical.acceleration = Math.min(99, result.physical.acceleration + Math.floor(growthFactor * 8));
      result.physical.agility      = Math.min(99, result.physical.agility + Math.floor(growthFactor * 5));
    } else if (profile === 'TECHNICAL') {
      result.technical.passing     = Math.min(99, result.technical.passing + Math.floor(growthFactor * 6));
      result.technical.vision      = Math.min(99, result.technical.vision + Math.floor(growthFactor * 6));
      result.technical.dribbling   = Math.min(99, result.technical.dribbling + Math.floor(growthFactor * 5));
    } else if (profile === 'MENTAL') {
      result.mental.composure      = Math.min(99, result.mental.composure + Math.floor(growthFactor * 8));
      result.mental.decisions      = Math.min(99, result.mental.decisions + Math.floor(growthFactor * 7));
      result.mental.leadership     = Math.min(99, result.mental.leadership + Math.floor(growthFactor * 5));
    } else {
      result.physical.pace         = Math.min(99, result.physical.pace + Math.floor(growthFactor * 5));
      result.physical.acceleration = Math.min(99, result.physical.acceleration + Math.floor(growthFactor * 5));
      result.technical.passing     = Math.min(99, result.technical.passing + Math.floor(growthFactor * 4));
    }
  }

  if (age >= 31) {
    const declineFactor = Math.min(1, (age - 30) / 10);
    if (profile === 'EXPLOSIVE') {
      result.physical.pace         = Math.max(20, Math.floor(result.physical.pace * (1 - declineFactor * 0.22)));
      result.physical.acceleration = Math.max(20, Math.floor(result.physical.acceleration * (1 - declineFactor * 0.20)));
      result.physical.stamina      = Math.max(25, Math.floor(result.physical.stamina * (1 - declineFactor * 0.15)));
      result.physical.agility      = Math.max(20, Math.floor(result.physical.agility * (1 - declineFactor * 0.18)));
    } else if (profile === 'TECHNICAL') {
      result.physical.pace         = Math.max(20, Math.floor(result.physical.pace * (1 - declineFactor * 0.14)));
      result.physical.acceleration = Math.max(20, Math.floor(result.physical.acceleration * (1 - declineFactor * 0.12)));
      result.physical.stamina      = Math.max(25, Math.floor(result.physical.stamina * (1 - declineFactor * 0.10)));
      result.mental.decisions      = Math.min(99, result.mental.decisions + Math.floor(declineFactor * 8));
      result.mental.composure      = Math.min(99, result.mental.composure + Math.floor(declineFactor * 6));
    } else if (profile === 'MENTAL') {
      result.physical.pace         = Math.max(20, Math.floor(result.physical.pace * (1 - declineFactor * 0.08)));
      result.physical.stamina      = Math.max(25, Math.floor(result.physical.stamina * (1 - declineFactor * 0.07)));
      result.mental.leadership     = Math.min(99, result.mental.leadership + Math.floor(declineFactor * 12));
      result.mental.decisions      = Math.min(99, result.mental.decisions + Math.floor(declineFactor * 10));
      result.mental.composure      = Math.min(99, result.mental.composure + Math.floor(declineFactor * 8));
    } else {
      result.physical.pace         = Math.max(20, Math.floor(result.physical.pace * (1 - declineFactor * 0.15)));
      result.physical.acceleration = Math.max(20, Math.floor(result.physical.acceleration * (1 - declineFactor * 0.12)));
      result.physical.stamina      = Math.max(25, Math.floor(result.physical.stamina * (1 - declineFactor * 0.10)));
      result.mental.leadership     = Math.min(99, result.mental.leadership + Math.floor(declineFactor * 8));
      result.mental.composure      = Math.min(99, result.mental.composure + Math.floor(declineFactor * 5));
    }
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


const PREMIER_LEAGUE_CLUBS = [
  {
    id: 'club-man-city',
    name: 'Man City',
    stadiumName: 'Etihad',
    primaryColor: '#6CABDD',
    secondaryColor: '#FFFFFF',
    reputation: 97,
    valuation: 4500000000,
    finances: {
      balance: 180000000,
      weeklyWages: 11000000,
      transferBudget: 200000000,
    },
    facilities: {
      stadiumCapacity: 53000,
      stadiumLevel: 9,
      trainingLevel: 9,
      medicalLevel: 9,
      youthLevel: 9,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'CHAMPIONS',
  },
  {
    id: 'club-arsenal',
    name: 'Arsenal',
    stadiumName: 'Emirates',
    primaryColor: '#EF0107',
    secondaryColor: '#FFFFFF',
    reputation: 95,
    valuation: 3800000000,
    finances: {
      balance: 150000000,
      weeklyWages: 9500000,
      transferBudget: 180000000,
    },
    facilities: {
      stadiumCapacity: 60704,
      stadiumLevel: 9,
      trainingLevel: 9,
      medicalLevel: 9,
      youthLevel: 8,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'CHAMPIONS',
  },
  {
    id: 'club-liverpool',
    name: 'Liverpool',
    stadiumName: 'Anfield',
    primaryColor: '#C8102E',
    secondaryColor: '#F6EB61',
    reputation: 96,
    valuation: 4200000000,
    finances: {
      balance: 160000000,
      weeklyWages: 10000000,
      transferBudget: 170000000,
    },
    facilities: {
      stadiumCapacity: 61276,
      stadiumLevel: 9,
      trainingLevel: 9,
      medicalLevel: 9,
      youthLevel: 9,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'CHAMPIONS',
  },
  {
    id: 'club-chelsea',
    name: 'Chelsea',
    stadiumName: 'Stamford Bridge',
    primaryColor: '#034694',
    secondaryColor: '#FFFFFF',
    reputation: 91,
    valuation: 2800000000,
    finances: {
      balance: 90000000,
      weeklyWages: 10500000,
      transferBudget: 150000000,
    },
    facilities: {
      stadiumCapacity: 40343,
      stadiumLevel: 9,
      trainingLevel: 9,
      medicalLevel: 8,
      youthLevel: 8,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'CHAMPIONS',
  },
  {
    id: 'club-man-utd',
    name: 'Man Utd',
    stadiumName: 'Old Trafford',
    primaryColor: '#DA291C',
    secondaryColor: '#FBE122',
    reputation: 93,
    valuation: 3200000000,
    finances: {
      balance: 60000000,
      weeklyWages: 9000000,
      transferBudget: 100000000,
    },
    facilities: {
      stadiumCapacity: 74879,
      stadiumLevel: 9,
      trainingLevel: 9,
      medicalLevel: 8,
      youthLevel: 8,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'CHAMPIONS',
  },
  {
    id: 'club-tottenham',
    name: 'Tottenham',
    stadiumName: 'Tottenham Hotspur Stadium',
    primaryColor: '#132257',
    secondaryColor: '#FFFFFF',
    reputation: 89,
    valuation: 2500000000,
    finances: {
      balance: 80000000,
      weeklyWages: 8000000,
      transferBudget: 120000000,
    },
    facilities: {
      stadiumCapacity: 62850,
      stadiumLevel: 9,
      trainingLevel: 8,
      medicalLevel: 8,
      youthLevel: 8,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'TOP_HALF',
  },
  {
    id: 'club-newcastle',
    name: 'Newcastle',
    stadiumName: 'St James Park',
    primaryColor: '#241F20',
    secondaryColor: '#FFFFFF',
    reputation: 85,
    valuation: 1800000000,
    finances: {
      balance: 70000000,
      weeklyWages: 7000000,
      transferBudget: 100000000,
    },
    facilities: {
      stadiumCapacity: 52305,
      stadiumLevel: 8,
      trainingLevel: 8,
      medicalLevel: 7,
      youthLevel: 7,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-aston-villa',
    name: 'Aston Villa',
    stadiumName: 'Villa Park',
    primaryColor: '#95BFE5',
    secondaryColor: '#670E36',
    reputation: 83,
    valuation: 1400000000,
    finances: {
      balance: 65000000,
      weeklyWages: 6500000,
      transferBudget: 80000000,
    },
    facilities: {
      stadiumCapacity: 42785,
      stadiumLevel: 8,
      trainingLevel: 8,
      medicalLevel: 7,
      youthLevel: 7,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-brighton',
    name: 'Brighton',
    stadiumName: 'Amex Stadium',
    primaryColor: '#0057B8',
    secondaryColor: '#FFFFFF',
    reputation: 78,
    valuation: 900000000,
    finances: {
      balance: 55000000,
      weeklyWages: 4500000,
      transferBudget: 60000000,
    },
    facilities: {
      stadiumCapacity: 31800,
      stadiumLevel: 7,
      trainingLevel: 9,
      medicalLevel: 8,
      youthLevel: 9,
    },
    boardType: 'LOCAL',
    seasonTarget: 'TOP_HALF',
  },
  {
    id: 'club-west-ham',
    name: 'West Ham',
    stadiumName: 'London Stadium',
    primaryColor: '#7A263A',
    secondaryColor: '#1BB1E7',
    reputation: 76,
    valuation: 800000000,
    finances: {
      balance: 40000000,
      weeklyWages: 5000000,
      transferBudget: 50000000,
    },
    facilities: {
      stadiumCapacity: 62500,
      stadiumLevel: 7,
      trainingLevel: 7,
      medicalLevel: 7,
      youthLevel: 6,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'TOP_HALF',
  },
  {
    id: 'club-wolves',
    name: 'Wolves',
    stadiumName: 'Molineux',
    primaryColor: '#FDB913',
    secondaryColor: '#231F20',
    reputation: 73,
    valuation: 600000000,
    finances: {
      balance: 30000000,
      weeklyWages: 4000000,
      transferBudget: 40000000,
    },
    facilities: {
      stadiumCapacity: 32050,
      stadiumLevel: 7,
      trainingLevel: 7,
      medicalLevel: 6,
      youthLevel: 6,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-everton',
    name: 'Everton',
    stadiumName: 'Goodison Park',
    primaryColor: '#003399',
    secondaryColor: '#FFFFFF',
    reputation: 72,
    valuation: 500000000,
    finances: {
      balance: 20000000,
      weeklyWages: 4500000,
      transferBudget: 30000000,
    },
    facilities: {
      stadiumCapacity: 39572,
      stadiumLevel: 6,
      trainingLevel: 7,
      medicalLevel: 6,
      youthLevel: 6,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-fulham',
    name: 'Fulham',
    stadiumName: 'Craven Cottage',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    reputation: 70,
    valuation: 450000000,
    finances: {
      balance: 35000000,
      weeklyWages: 3800000,
      transferBudget: 35000000,
    },
    facilities: {
      stadiumCapacity: 25700,
      stadiumLevel: 6,
      trainingLevel: 7,
      medicalLevel: 6,
      youthLevel: 6,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-brentford',
    name: 'Brentford',
    stadiumName: 'Gtech Community Stadium',
    primaryColor: '#E30613',
    secondaryColor: '#FFFFFF',
    reputation: 68,
    valuation: 380000000,
    finances: {
      balance: 30000000,
      weeklyWages: 3200000,
      transferBudget: 30000000,
    },
    facilities: {
      stadiumCapacity: 17250,
      stadiumLevel: 6,
      trainingLevel: 7,
      medicalLevel: 7,
      youthLevel: 7,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-crystal-palace',
    name: 'Crystal Palace',
    stadiumName: 'Selhurst Park',
    primaryColor: '#1B458F',
    secondaryColor: '#C4122E',
    reputation: 67,
    valuation: 400000000,
    finances: {
      balance: 25000000,
      weeklyWages: 3500000,
      transferBudget: 25000000,
    },
    facilities: {
      stadiumCapacity: 25486,
      stadiumLevel: 6,
      trainingLevel: 6,
      medicalLevel: 6,
      youthLevel: 6,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-nottm-forest',
    name: 'Nottm Forest',
    stadiumName: 'City Ground',
    primaryColor: '#E53233',
    secondaryColor: '#FFFFFF',
    reputation: 66,
    valuation: 380000000,
    finances: {
      balance: 20000000,
      weeklyWages: 4000000,
      transferBudget: 25000000,
    },
    facilities: {
      stadiumCapacity: 30445,
      stadiumLevel: 6,
      trainingLevel: 7,
      medicalLevel: 6,
      youthLevel: 6,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-bournemouth',
    name: 'Bournemouth',
    stadiumName: 'Vitality Stadium',
    primaryColor: '#DA291C',
    secondaryColor: '#000000',
    reputation: 62,
    valuation: 280000000,
    finances: {
      balance: 20000000,
      weeklyWages: 3000000,
      transferBudget: 20000000,
    },
    facilities: {
      stadiumCapacity: 11307,
      stadiumLevel: 5,
      trainingLevel: 7,
      medicalLevel: 6,
      youthLevel: 6,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-leicester',
    name: 'Leicester',
    stadiumName: 'King Power Stadium',
    primaryColor: '#003090',
    secondaryColor: '#FDBE11',
    reputation: 65,
    valuation: 320000000,
    finances: {
      balance: 15000000,
      weeklyWages: 4000000,
      transferBudget: 20000000,
    },
    facilities: {
      stadiumCapacity: 32261,
      stadiumLevel: 6,
      trainingLevel: 7,
      medicalLevel: 6,
      youthLevel: 6,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-ipswich',
    name: 'Ipswich',
    stadiumName: 'Portman Road',
    primaryColor: '#0044A9',
    secondaryColor: '#FFFFFF',
    reputation: 58,
    valuation: 200000000,
    finances: {
      balance: 15000000,
      weeklyWages: 2500000,
      transferBudget: 15000000,
    },
    facilities: {
      stadiumCapacity: 29721,
      stadiumLevel: 5,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-southampton',
    name: 'Southampton',
    stadiumName: 'St Mary\'s',
    primaryColor: '#D71920',
    secondaryColor: '#FFFFFF',
    reputation: 57,
    valuation: 180000000,
    finances: {
      balance: 10000000,
      weeklyWages: 3000000,
      transferBudget: 10000000,
    },
    facilities: {
      stadiumCapacity: 32384,
      stadiumLevel: 5,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'AVOID_RELEGATION',
  },
];

const CHAMPIONSHIP_CLUBS = [
  {
    id: 'club-leeds-united',
    name: 'Leeds United',
    stadiumName: 'Elland Road',
    primaryColor: '#FFCD00',
    secondaryColor: '#1D428A',
    reputation: 72,
    valuation: 380000000,
    finances: {
      balance: 25000000,
      weeklyWages: 3500000,
      transferBudget: 30000000,
    },
    facilities: {
      stadiumCapacity: 37890,
      stadiumLevel: 7,
      trainingLevel: 7,
      medicalLevel: 6,
      youthLevel: 6,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-sunderland',
    name: 'Sunderland',
    stadiumName: 'Stadium of Light',
    primaryColor: '#EB172B',
    secondaryColor: '#FFFFFF',
    reputation: 65,
    valuation: 180000000,
    finances: {
      balance: 15000000,
      weeklyWages: 2000000,
      transferBudget: 15000000,
    },
    facilities: {
      stadiumCapacity: 49000,
      stadiumLevel: 6,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-sheffield-utd',
    name: 'Sheffield Utd',
    stadiumName: 'Bramall Lane',
    primaryColor: '#EE2737',
    secondaryColor: '#000000',
    reputation: 66,
    valuation: 200000000,
    finances: {
      balance: 12000000,
      weeklyWages: 3000000,
      transferBudget: 20000000,
    },
    facilities: {
      stadiumCapacity: 32125,
      stadiumLevel: 6,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-middlesbrough',
    name: 'Middlesbrough',
    stadiumName: 'Riverside Stadium',
    primaryColor: '#E53233',
    secondaryColor: '#FFFFFF',
    reputation: 63,
    valuation: 150000000,
    finances: {
      balance: 12000000,
      weeklyWages: 2000000,
      transferBudget: 12000000,
    },
    facilities: {
      stadiumCapacity: 34742,
      stadiumLevel: 6,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-burnley',
    name: 'Burnley',
    stadiumName: 'Turf Moor',
    primaryColor: '#6C1D45',
    secondaryColor: '#99D6EA',
    reputation: 64,
    valuation: 160000000,
    finances: {
      balance: 10000000,
      weeklyWages: 2500000,
      transferBudget: 15000000,
    },
    facilities: {
      stadiumCapacity: 21944,
      stadiumLevel: 6,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-west-brom',
    name: 'West Brom',
    stadiumName: 'The Hawthorns',
    primaryColor: '#122F67',
    secondaryColor: '#FFFFFF',
    reputation: 64,
    valuation: 170000000,
    finances: {
      balance: 10000000,
      weeklyWages: 2200000,
      transferBudget: 12000000,
    },
    facilities: {
      stadiumCapacity: 26852,
      stadiumLevel: 6,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-bristol-city',
    name: 'Bristol City',
    stadiumName: 'Ashton Gate',
    primaryColor: '#E3001B',
    secondaryColor: '#FFFFFF',
    reputation: 58,
    valuation: 120000000,
    finances: {
      balance: 8000000,
      weeklyWages: 1500000,
      transferBudget: 8000000,
    },
    facilities: {
      stadiumCapacity: 27000,
      stadiumLevel: 5,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-coventry',
    name: 'Coventry',
    stadiumName: 'CBS Arena',
    primaryColor: '#59CBFF',
    secondaryColor: '#FFFFFF',
    reputation: 57,
    valuation: 100000000,
    finances: {
      balance: 8000000,
      weeklyWages: 1400000,
      transferBudget: 7000000,
    },
    facilities: {
      stadiumCapacity: 32609,
      stadiumLevel: 5,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 5,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-blackburn',
    name: 'Blackburn',
    stadiumName: 'Ewood Park',
    primaryColor: '#009EE0',
    secondaryColor: '#FFFFFF',
    reputation: 60,
    valuation: 130000000,
    finances: {
      balance: 8000000,
      weeklyWages: 1600000,
      transferBudget: 8000000,
    },
    facilities: {
      stadiumCapacity: 31367,
      stadiumLevel: 6,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-preston',
    name: 'Preston',
    stadiumName: 'Deepdale',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000066',
    reputation: 55,
    valuation: 80000000,
    finances: {
      balance: 6000000,
      weeklyWages: 1200000,
      transferBudget: 6000000,
    },
    facilities: {
      stadiumCapacity: 23404,
      stadiumLevel: 5,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-millwall',
    name: 'Millwall',
    stadiumName: 'The Den',
    primaryColor: '#001D5E',
    secondaryColor: '#FFFFFF',
    reputation: 55,
    valuation: 80000000,
    finances: {
      balance: 5000000,
      weeklyWages: 1200000,
      transferBudget: 5000000,
    },
    facilities: {
      stadiumCapacity: 20146,
      stadiumLevel: 5,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-norwich',
    name: 'Norwich',
    stadiumName: 'Carrow Road',
    primaryColor: '#00A650',
    secondaryColor: '#FFF200',
    reputation: 63,
    valuation: 155000000,
    finances: {
      balance: 10000000,
      weeklyWages: 2000000,
      transferBudget: 12000000,
    },
    facilities: {
      stadiumCapacity: 27359,
      stadiumLevel: 6,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-hull-city',
    name: 'Hull City',
    stadiumName: 'MKM Stadium',
    primaryColor: '#F5A12D',
    secondaryColor: '#000000',
    reputation: 56,
    valuation: 90000000,
    finances: {
      balance: 6000000,
      weeklyWages: 1300000,
      transferBudget: 6000000,
    },
    facilities: {
      stadiumCapacity: 25400,
      stadiumLevel: 5,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-qpr',
    name: 'QPR',
    stadiumName: 'Loftus Road',
    primaryColor: '#1D5BA4',
    secondaryColor: '#FFFFFF',
    reputation: 57,
    valuation: 95000000,
    finances: {
      balance: 5000000,
      weeklyWages: 1400000,
      transferBudget: 5000000,
    },
    facilities: {
      stadiumCapacity: 18360,
      stadiumLevel: 5,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-stoke-city',
    name: 'Stoke City',
    stadiumName: 'bet365 Stadium',
    primaryColor: '#E03A3E',
    secondaryColor: '#FFFFFF',
    reputation: 60,
    valuation: 130000000,
    finances: {
      balance: 7000000,
      weeklyWages: 2000000,
      transferBudget: 8000000,
    },
    facilities: {
      stadiumCapacity: 30089,
      stadiumLevel: 6,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-swansea',
    name: 'Swansea',
    stadiumName: 'Swansea.com Stadium',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    reputation: 58,
    valuation: 100000000,
    finances: {
      balance: 6000000,
      weeklyWages: 1300000,
      transferBudget: 6000000,
    },
    facilities: {
      stadiumCapacity: 21088,
      stadiumLevel: 5,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-cardiff',
    name: 'Cardiff',
    stadiumName: 'Cardiff City Stadium',
    primaryColor: '#0070B5',
    secondaryColor: '#D71920',
    reputation: 58,
    valuation: 110000000,
    finances: {
      balance: 6000000,
      weeklyWages: 1500000,
      transferBudget: 6000000,
    },
    facilities: {
      stadiumCapacity: 33280,
      stadiumLevel: 5,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-derby-county',
    name: 'Derby County',
    stadiumName: 'Pride Park',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    reputation: 62,
    valuation: 140000000,
    finances: {
      balance: 8000000,
      weeklyWages: 1800000,
      transferBudget: 8000000,
    },
    facilities: {
      stadiumCapacity: 33597,
      stadiumLevel: 6,
      trainingLevel: 6,
      medicalLevel: 5,
      youthLevel: 5,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-luton',
    name: 'Luton',
    stadiumName: 'Kenilworth Road',
    primaryColor: '#F78F1E',
    secondaryColor: '#FFFFFF',
    reputation: 56,
    valuation: 85000000,
    finances: {
      balance: 5000000,
      weeklyWages: 1300000,
      transferBudget: 5000000,
    },
    facilities: {
      stadiumCapacity: 12000,
      stadiumLevel: 4,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-plymouth',
    name: 'Plymouth',
    stadiumName: 'Home Park',
    primaryColor: '#006B54',
    secondaryColor: '#FFFFFF',
    reputation: 52,
    valuation: 60000000,
    finances: {
      balance: 4000000,
      weeklyWages: 1000000,
      transferBudget: 4000000,
    },
    facilities: {
      stadiumCapacity: 18600,
      stadiumLevel: 4,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'LOCAL',
    seasonTarget: 'AVOID_RELEGATION',
  },
];

const LEAGUE_ONE_CLUBS = [
  {
    id: 'club-birmingham-city',
    name: 'Birmingham City',
    stadiumName: 'St Andrews',
    primaryColor: '#0000FF',
    secondaryColor: '#FFFFFF',
    reputation: 58,
    valuation: 75000000,
    finances: {
      balance: 3000000,
      weeklyWages: 800000,
      transferBudget: 4000000,
    },
    facilities: {
      stadiumCapacity: 29409,
      stadiumLevel: 5,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-wrexham',
    name: 'Wrexham',
    stadiumName: 'Racecourse Ground',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 52,
    valuation: 40000000,
    finances: {
      balance: 3000000,
      weeklyWages: 500000,
      transferBudget: 3000000,
    },
    facilities: {
      stadiumCapacity: 10771,
      stadiumLevel: 4,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-stockport',
    name: 'Stockport',
    stadiumName: 'Edgeley Park',
    primaryColor: '#1C3B8C',
    secondaryColor: '#FFFFFF',
    reputation: 48,
    valuation: 25000000,
    finances: {
      balance: 2000000,
      weeklyWages: 250000,
      transferBudget: 1500000,
    },
    facilities: {
      stadiumCapacity: 10841,
      stadiumLevel: 4,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-peterborough',
    name: 'Peterborough',
    stadiumName: 'London Road',
    primaryColor: '#0066CC',
    secondaryColor: '#FFFFFF',
    reputation: 50,
    valuation: 30000000,
    finances: {
      balance: 2000000,
      weeklyWages: 350000,
      transferBudget: 2000000,
    },
    facilities: {
      stadiumCapacity: 15314,
      stadiumLevel: 4,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 4,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-exeter-city',
    name: 'Exeter City',
    stadiumName: 'St James Park',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 46,
    valuation: 18000000,
    finances: {
      balance: 1500000,
      weeklyWages: 200000,
      transferBudget: 1000000,
    },
    facilities: {
      stadiumCapacity: 8830,
      stadiumLevel: 3,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-oxford-utd',
    name: 'Oxford Utd',
    stadiumName: 'Kassam Stadium',
    primaryColor: '#FFD700',
    secondaryColor: '#000066',
    reputation: 50,
    valuation: 28000000,
    finances: {
      balance: 2000000,
      weeklyWages: 300000,
      transferBudget: 2000000,
    },
    facilities: {
      stadiumCapacity: 12500,
      stadiumLevel: 4,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-charlton',
    name: 'Charlton',
    stadiumName: 'The Valley',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 53,
    valuation: 45000000,
    finances: {
      balance: 2500000,
      weeklyWages: 450000,
      transferBudget: 2500000,
    },
    facilities: {
      stadiumCapacity: 27111,
      stadiumLevel: 5,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-rotherham',
    name: 'Rotherham',
    stadiumName: 'New York Stadium',
    primaryColor: '#E62020',
    secondaryColor: '#FFFFFF',
    reputation: 47,
    valuation: 20000000,
    finances: {
      balance: 1500000,
      weeklyWages: 250000,
      transferBudget: 1500000,
    },
    facilities: {
      stadiumCapacity: 12021,
      stadiumLevel: 4,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-bolton',
    name: 'Bolton',
    stadiumName: 'Toughsheet Stadium',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000080',
    reputation: 52,
    valuation: 35000000,
    finances: {
      balance: 2000000,
      weeklyWages: 350000,
      transferBudget: 2000000,
    },
    facilities: {
      stadiumCapacity: 28723,
      stadiumLevel: 5,
      trainingLevel: 4,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-cambridge-utd',
    name: 'Cambridge Utd',
    stadiumName: 'Abbey Stadium',
    primaryColor: '#F5A12D',
    secondaryColor: '#000000',
    reputation: 44,
    valuation: 15000000,
    finances: {
      balance: 1000000,
      weeklyWages: 180000,
      transferBudget: 800000,
    },
    facilities: {
      stadiumCapacity: 8127,
      stadiumLevel: 3,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-reading',
    name: 'Reading',
    stadiumName: 'Select Car Leasing Stadium',
    primaryColor: '#004494',
    secondaryColor: '#FFFFFF',
    reputation: 55,
    valuation: 55000000,
    finances: {
      balance: 2000000,
      weeklyWages: 600000,
      transferBudget: 3000000,
    },
    facilities: {
      stadiumCapacity: 24161,
      stadiumLevel: 5,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-wigan-athletic',
    name: 'Wigan Athletic',
    stadiumName: 'DW Stadium',
    primaryColor: '#1D428A',
    secondaryColor: '#FFFFFF',
    reputation: 50,
    valuation: 28000000,
    finances: {
      balance: 1500000,
      weeklyWages: 300000,
      transferBudget: 1500000,
    },
    facilities: {
      stadiumCapacity: 25133,
      stadiumLevel: 4,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 4,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-huddersfield',
    name: 'Huddersfield',
    stadiumName: 'John Smiths Stadium',
    primaryColor: '#0E63AD',
    secondaryColor: '#FFFFFF',
    reputation: 52,
    valuation: 38000000,
    finances: {
      balance: 2000000,
      weeklyWages: 400000,
      transferBudget: 2000000,
    },
    facilities: {
      stadiumCapacity: 24500,
      stadiumLevel: 5,
      trainingLevel: 5,
      medicalLevel: 4,
      youthLevel: 4,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-barnsley',
    name: 'Barnsley',
    stadiumName: 'Oakwell',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 48,
    valuation: 22000000,
    finances: {
      balance: 1500000,
      weeklyWages: 220000,
      transferBudget: 1000000,
    },
    facilities: {
      stadiumCapacity: 23009,
      stadiumLevel: 4,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-shrewsbury',
    name: 'Shrewsbury',
    stadiumName: 'New Meadow',
    primaryColor: '#003399',
    secondaryColor: '#FFCC00',
    reputation: 42,
    valuation: 12000000,
    finances: {
      balance: 900000,
      weeklyWages: 160000,
      transferBudget: 700000,
    },
    facilities: {
      stadiumCapacity: 9875,
      stadiumLevel: 3,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-burton-albion',
    name: 'Burton Albion',
    stadiumName: 'Pirelli Stadium',
    primaryColor: '#FFFF00',
    secondaryColor: '#000000',
    reputation: 41,
    valuation: 10000000,
    finances: {
      balance: 800000,
      weeklyWages: 150000,
      transferBudget: 600000,
    },
    facilities: {
      stadiumCapacity: 6912,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-lincoln-city',
    name: 'Lincoln City',
    stadiumName: 'LNER Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 43,
    valuation: 13000000,
    finances: {
      balance: 1000000,
      weeklyWages: 170000,
      transferBudget: 700000,
    },
    facilities: {
      stadiumCapacity: 10120,
      stadiumLevel: 3,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-northampton',
    name: 'Northampton',
    stadiumName: 'Sixfields Stadium',
    primaryColor: '#800000',
    secondaryColor: '#FFFFFF',
    reputation: 41,
    valuation: 10000000,
    finances: {
      balance: 800000,
      weeklyWages: 150000,
      transferBudget: 600000,
    },
    facilities: {
      stadiumCapacity: 7798,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-blackpool',
    name: 'Blackpool',
    stadiumName: 'Bloomfield Road',
    primaryColor: '#F68712',
    secondaryColor: '#FFFFFF',
    reputation: 50,
    valuation: 27000000,
    finances: {
      balance: 1500000,
      weeklyWages: 280000,
      transferBudget: 1500000,
    },
    facilities: {
      stadiumCapacity: 16750,
      stadiumLevel: 4,
      trainingLevel: 4,
      medicalLevel: 3,
      youthLevel: 4,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-port-vale',
    name: 'Port Vale',
    stadiumName: 'Vale Park',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    reputation: 40,
    valuation: 9000000,
    finances: {
      balance: 700000,
      weeklyWages: 140000,
      transferBudget: 500000,
    },
    facilities: {
      stadiumCapacity: 19052,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'AVOID_RELEGATION',
  },
];

const LEAGUE_TWO_CLUBS = [
  {
    id: 'club-doncaster-rovers',
    name: 'Doncaster Rovers',
    stadiumName: 'Eco-Power Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 40,
    valuation: 8000000,
    finances: {
      balance: 600000,
      weeklyWages: 120000,
      transferBudget: 500000,
    },
    facilities: {
      stadiumCapacity: 15231,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-chesterfield',
    name: 'Chesterfield',
    stadiumName: 'SMH Group Stadium',
    primaryColor: '#1C4FA0',
    secondaryColor: '#FFFFFF',
    reputation: 38,
    valuation: 6000000,
    finances: {
      balance: 500000,
      weeklyWages: 100000,
      transferBudget: 400000,
    },
    facilities: {
      stadiumCapacity: 10400,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-bradford-city',
    name: 'Bradford City',
    stadiumName: 'Valley Parade',
    primaryColor: '#800000',
    secondaryColor: '#F5A12D',
    reputation: 40,
    valuation: 8000000,
    finances: {
      balance: 600000,
      weeklyWages: 120000,
      transferBudget: 500000,
    },
    facilities: {
      stadiumCapacity: 25136,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 3,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-mk-dons',
    name: 'MK Dons',
    stadiumName: 'Stadium MK',
    primaryColor: '#FFFF00',
    secondaryColor: '#000000',
    reputation: 38,
    valuation: 7000000,
    finances: {
      balance: 500000,
      weeklyWages: 110000,
      transferBudget: 400000,
    },
    facilities: {
      stadiumCapacity: 30500,
      stadiumLevel: 4,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 3,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-afc-wimbledon',
    name: 'AFC Wimbledon',
    stadiumName: 'Cherry Red Records Stadium',
    primaryColor: '#0000FF',
    secondaryColor: '#FFFF00',
    reputation: 35,
    valuation: 4000000,
    finances: {
      balance: 400000,
      weeklyWages: 80000,
      transferBudget: 300000,
    },
    facilities: {
      stadiumCapacity: 9315,
      stadiumLevel: 2,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-walsall',
    name: 'Walsall',
    stadiumName: 'Poundland Bescot Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 36,
    valuation: 5000000,
    finances: {
      balance: 400000,
      weeklyWages: 90000,
      transferBudget: 300000,
    },
    facilities: {
      stadiumCapacity: 11300,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-newport-county',
    name: 'Newport County',
    stadiumName: 'Rodney Parade',
    primaryColor: '#F5A12D',
    secondaryColor: '#000000',
    reputation: 30,
    valuation: 2000000,
    finances: {
      balance: 300000,
      weeklyWages: 60000,
      transferBudget: 200000,
    },
    facilities: {
      stadiumCapacity: 7850,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-grimsby-town',
    name: 'Grimsby Town',
    stadiumName: 'Blundell Park',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    reputation: 33,
    valuation: 3500000,
    finances: {
      balance: 350000,
      weeklyWages: 75000,
      transferBudget: 250000,
    },
    facilities: {
      stadiumCapacity: 9052,
      stadiumLevel: 2,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-swindon-town',
    name: 'Swindon Town',
    stadiumName: 'County Ground',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 37,
    valuation: 5500000,
    finances: {
      balance: 450000,
      weeklyWages: 95000,
      transferBudget: 350000,
    },
    facilities: {
      stadiumCapacity: 15728,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 3,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-crewe-alexandra',
    name: 'Crewe Alexandra',
    stadiumName: 'Mornflake Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 35,
    valuation: 4000000,
    finances: {
      balance: 350000,
      weeklyWages: 80000,
      transferBudget: 280000,
    },
    facilities: {
      stadiumCapacity: 10153,
      stadiumLevel: 2,
      trainingLevel: 3,
      medicalLevel: 3,
      youthLevel: 3,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-harrogate-town',
    name: 'Harrogate Town',
    stadiumName: 'EnviroVent Stadium',
    primaryColor: '#FFFF00',
    secondaryColor: '#000000',
    reputation: 28,
    valuation: 1800000,
    finances: {
      balance: 250000,
      weeklyWages: 55000,
      transferBudget: 180000,
    },
    facilities: {
      stadiumCapacity: 4173,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-gillingham',
    name: 'Gillingham',
    stadiumName: 'Priestfield Stadium',
    primaryColor: '#004B87',
    secondaryColor: '#FFFFFF',
    reputation: 33,
    valuation: 3000000,
    finances: {
      balance: 300000,
      weeklyWages: 70000,
      transferBudget: 220000,
    },
    facilities: {
      stadiumCapacity: 11582,
      stadiumLevel: 2,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-accrington',
    name: 'Accrington',
    stadiumName: 'Wham Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 27,
    valuation: 1500000,
    finances: {
      balance: 220000,
      weeklyWages: 50000,
      transferBudget: 150000,
    },
    facilities: {
      stadiumCapacity: 5450,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-colchester-utd',
    name: 'Colchester Utd',
    stadiumName: 'JobServe Community Stadium',
    primaryColor: '#0000FF',
    secondaryColor: '#FFFFFF',
    reputation: 32,
    valuation: 2800000,
    finances: {
      balance: 280000,
      weeklyWages: 65000,
      transferBudget: 200000,
    },
    facilities: {
      stadiumCapacity: 10105,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-crawley-town',
    name: 'Crawley Town',
    stadiumName: 'Broadfield Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 30,
    valuation: 2200000,
    finances: {
      balance: 250000,
      weeklyWages: 58000,
      transferBudget: 180000,
    },
    facilities: {
      stadiumCapacity: 6000,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-tranmere-rovers',
    name: 'Tranmere Rovers',
    stadiumName: 'Prenton Park',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000080',
    reputation: 34,
    valuation: 3500000,
    finances: {
      balance: 300000,
      weeklyWages: 72000,
      transferBudget: 230000,
    },
    facilities: {
      stadiumCapacity: 16789,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-morecambe',
    name: 'Morecambe',
    stadiumName: 'Mazuma Mobile Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 28,
    valuation: 1800000,
    finances: {
      balance: 220000,
      weeklyWages: 52000,
      transferBudget: 160000,
    },
    facilities: {
      stadiumCapacity: 6476,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-fleetwood-town',
    name: 'Fleetwood Town',
    stadiumName: 'Highbury Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 35,
    valuation: 4500000,
    finances: {
      balance: 380000,
      weeklyWages: 85000,
      transferBudget: 300000,
    },
    facilities: {
      stadiumCapacity: 5327,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 3,
    },
    boardType: 'BILLIONAIRE',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-salford-city',
    name: 'Salford City',
    stadiumName: 'Peninsula Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 36,
    valuation: 5000000,
    finances: {
      balance: 400000,
      weeklyWages: 90000,
      transferBudget: 320000,
    },
    facilities: {
      stadiumCapacity: 5106,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 3,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PLAYOFFS',
  },
  {
    id: 'club-carlisle-united',
    name: 'Carlisle United',
    stadiumName: 'Brunton Park',
    primaryColor: '#1C4FA0',
    secondaryColor: '#FFFFFF',
    reputation: 32,
    valuation: 2500000,
    finances: {
      balance: 260000,
      weeklyWages: 62000,
      transferBudget: 190000,
    },
    facilities: {
      stadiumCapacity: 17949,
      stadiumLevel: 2,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
];

const NATIONAL_LEAGUE_CLUBS = [
  {
    id: 'club-york-city',
    name: 'York City',
    stadiumName: 'LNER Community Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 34,
    valuation: 2500000,
    finances: {
      balance: 180000,
      weeklyWages: 55000,
      transferBudget: 150000,
    },
    facilities: {
      stadiumCapacity: 8000,
      stadiumLevel: 3,
      trainingLevel: 3,
      medicalLevel: 2,
      youthLevel: 2,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-solihull-moors',
    name: 'Solihull Moors',
    stadiumName: 'SportNation.bet Stadium',
    primaryColor: '#FFD700',
    secondaryColor: '#000000',
    reputation: 28,
    valuation: 900000,
    finances: {
      balance: 80000,
      weeklyWages: 25000,
      transferBudget: 60000,
    },
    facilities: {
      stadiumCapacity: 3050,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-gateshead',
    name: 'Gateshead',
    stadiumName: 'Gateshead International Stadium',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    reputation: 26,
    valuation: 700000,
    finances: {
      balance: 60000,
      weeklyWages: 20000,
      transferBudget: 40000,
    },
    facilities: {
      stadiumCapacity: 11750,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-oldham-athletic',
    name: 'Oldham Athletic',
    stadiumName: 'Boundary Park',
    primaryColor: '#004B87',
    secondaryColor: '#FFFFFF',
    reputation: 32,
    valuation: 1800000,
    finances: {
      balance: 120000,
      weeklyWages: 40000,
      transferBudget: 100000,
    },
    facilities: {
      stadiumCapacity: 13512,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 2,
    },
    boardType: 'LOCAL',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-hartlepool-utd',
    name: 'Hartlepool Utd',
    stadiumName: 'Victoria Park',
    primaryColor: '#003087',
    secondaryColor: '#FFFFFF',
    reputation: 30,
    valuation: 1200000,
    finances: {
      balance: 90000,
      weeklyWages: 30000,
      transferBudget: 70000,
    },
    facilities: {
      stadiumCapacity: 7856,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-eastleigh',
    name: 'Eastleigh',
    stadiumName: 'Silverlake Stadium',
    primaryColor: '#003087',
    secondaryColor: '#FFFFFF',
    reputation: 24,
    valuation: 500000,
    finances: {
      balance: 50000,
      weeklyWages: 18000,
      transferBudget: 30000,
    },
    facilities: {
      stadiumCapacity: 5250,
      stadiumLevel: 1,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-fc-halifax-town',
    name: 'FC Halifax Town',
    stadiumName: 'The Shay',
    primaryColor: '#003087',
    secondaryColor: '#FFFF00',
    reputation: 26,
    valuation: 650000,
    finances: {
      balance: 55000,
      weeklyWages: 20000,
      transferBudget: 40000,
    },
    facilities: {
      stadiumCapacity: 14000,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-altrincham',
    name: 'Altrincham',
    stadiumName: 'J Davidson Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 25,
    valuation: 550000,
    finances: {
      balance: 50000,
      weeklyWages: 18000,
      transferBudget: 35000,
    },
    facilities: {
      stadiumCapacity: 6085,
      stadiumLevel: 1,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-boreham-wood',
    name: 'Boreham Wood',
    stadiumName: 'Meadow Park',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    reputation: 22,
    valuation: 350000,
    finances: {
      balance: 35000,
      weeklyWages: 15000,
      transferBudget: 25000,
    },
    facilities: {
      stadiumCapacity: 4502,
      stadiumLevel: 1,
      trainingLevel: 1,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-bromley',
    name: 'Bromley',
    stadiumName: 'Hayes Lane',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    reputation: 25,
    valuation: 550000,
    finances: {
      balance: 50000,
      weeklyWages: 18000,
      transferBudget: 35000,
    },
    facilities: {
      stadiumCapacity: 5000,
      stadiumLevel: 1,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-woking',
    name: 'Woking',
    stadiumName: 'Kingfield Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 24,
    valuation: 450000,
    finances: {
      balance: 40000,
      weeklyWages: 16000,
      transferBudget: 28000,
    },
    facilities: {
      stadiumCapacity: 6036,
      stadiumLevel: 1,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-maidenhead-utd',
    name: 'Maidenhead Utd',
    stadiumName: 'York Road',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    reputation: 20,
    valuation: 280000,
    finances: {
      balance: 28000,
      weeklyWages: 15000,
      transferBudget: 20000,
    },
    facilities: {
      stadiumCapacity: 4500,
      stadiumLevel: 1,
      trainingLevel: 1,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-wealdstone',
    name: 'Wealdstone',
    stadiumName: 'Grosvenor Vale',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 20,
    valuation: 250000,
    finances: {
      balance: 25000,
      weeklyWages: 15000,
      transferBudget: 18000,
    },
    facilities: {
      stadiumCapacity: 3000,
      stadiumLevel: 1,
      trainingLevel: 1,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-dorking-wanderers',
    name: 'Dorking Wanderers',
    stadiumName: 'Meadowbank',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 19,
    valuation: 220000,
    finances: {
      balance: 22000,
      weeklyWages: 15000,
      transferBudget: 15000,
    },
    facilities: {
      stadiumCapacity: 4000,
      stadiumLevel: 1,
      trainingLevel: 1,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-kidderminster',
    name: 'Kidderminster',
    stadiumName: 'Aggborough Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 22,
    valuation: 320000,
    finances: {
      balance: 30000,
      weeklyWages: 15000,
      transferBudget: 20000,
    },
    facilities: {
      stadiumCapacity: 6444,
      stadiumLevel: 1,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-southend-utd',
    name: 'Southend Utd',
    stadiumName: 'Roots Hall',
    primaryColor: '#003087',
    secondaryColor: '#FFFFFF',
    reputation: 32,
    valuation: 1500000,
    finances: {
      balance: 100000,
      weeklyWages: 35000,
      transferBudget: 80000,
    },
    facilities: {
      stadiumCapacity: 12392,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 2,
    },
    boardType: 'CORPORATE',
    seasonTarget: 'PROMOTION',
  },
  {
    id: 'club-barnet',
    name: 'Barnet',
    stadiumName: 'Underhill Stadium',
    primaryColor: '#F5A12D',
    secondaryColor: '#000000',
    reputation: 28,
    valuation: 850000,
    finances: {
      balance: 70000,
      weeklyWages: 22000,
      transferBudget: 50000,
    },
    facilities: {
      stadiumCapacity: 5500,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-dag-and-red',
    name: 'Dag & Red',
    stadiumName: 'Victoria Road',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 27,
    valuation: 750000,
    finances: {
      balance: 65000,
      weeklyWages: 20000,
      transferBudget: 45000,
    },
    facilities: {
      stadiumCapacity: 6078,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
  {
    id: 'club-ebbsfleet-utd',
    name: 'Ebbsfleet Utd',
    stadiumName: 'Stonebridge Road',
    primaryColor: '#CC0000',
    secondaryColor: '#FFFFFF',
    reputation: 22,
    valuation: 320000,
    finances: {
      balance: 30000,
      weeklyWages: 15000,
      transferBudget: 20000,
    },
    facilities: {
      stadiumCapacity: 4097,
      stadiumLevel: 1,
      trainingLevel: 1,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'FAN_OWNED',
    seasonTarget: 'AVOID_RELEGATION',
  },
  {
    id: 'club-aldershot-town',
    name: 'Aldershot Town',
    stadiumName: 'EBB Stadium',
    primaryColor: '#CC0000',
    secondaryColor: '#003087',
    reputation: 27,
    valuation: 730000,
    finances: {
      balance: 62000,
      weeklyWages: 20000,
      transferBudget: 42000,
    },
    facilities: {
      stadiumCapacity: 7100,
      stadiumLevel: 2,
      trainingLevel: 2,
      medicalLevel: 1,
      youthLevel: 1,
    },
    boardType: 'LOCAL',
    seasonTarget: 'MID_TABLE',
  },
];

function mapBoardTypeToCulture(boardType: string): ClubCultureType {
  switch (boardType) {
    case 'BILLIONAIRE': return 'WINNING';
    case 'FAN_OWNED': return 'YOUTH_DEVELOPMENT';
    case 'LOCAL': return 'PRAGMATIC';
    case 'CORPORATE': return 'SELLING';
    default: return 'PRAGMATIC';
  }
}

function mapSeasonTargetToExpectation(seasonTarget: string, tier: number): BoardExpectation {
  switch (seasonTarget) {
    case 'CHAMPIONS':
      return 'QUALIFY_EUROPE';
    case 'PROMOTION':
      return 'PROMOTION';
    case 'TOP_HALF':
      return 'MID_TABLE';
    case 'PLAYOFFS':
      return tier === 2 ? 'PROMOTION' : 'MID_TABLE';
    case 'MID_TABLE':
      return 'MID_TABLE';
    case 'AVOID_RELEGATION':
      return 'AVOID_RELEGATION';
    default:
      return 'MID_TABLE';
  }
}

const getSquadBiasForCulture = (culture: ClubCultureType[]): {
  youngBias: number,
  potentialBias: number,
  ratingBias: number,
} => {
  const primary = culture[0];
  switch (primary) {
    case 'YOUTH_DEVELOPMENT':
      return { youngBias: 0.7, potentialBias: 0.8, ratingBias: -4 };
    case 'WINNING':
      return { youngBias: 0.2, potentialBias: 0.3, ratingBias: +4 };
    case 'SELLING':
      return { youngBias: 0.6, potentialBias: 0.9, ratingBias: -2 };
    case 'LUXURY_FOOTBALL':
      return { youngBias: 0.3, potentialBias: 0.5, ratingBias: +3 };
    case 'PRAGMATIC':
    default:
      return { youngBias: 0.4, potentialBias: 0.4, ratingBias: 0 };
  }
};

function generatePlayerAtPosition(clubId: string, tier: number, position: Position): Player {
  const p = generatePlayer(clubId, tier);
  p.position = position;
  return p;
}

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

  const squadSizeByTier: Record<number, number> = {
    1: 25,  // Premier League: large squads with depth
    2: 23,  // Championship: solid squads
    3: 20,  // League One: lean squads
    4: 18,  // League Two: small squads
    5: 16,  // National League: bare bones
  };

  const clubData = {
    'l1': PREMIER_LEAGUE_CLUBS,
    'l2': CHAMPIONSHIP_CLUBS,
    'l3': LEAGUE_ONE_CLUBS,
    'l4': LEAGUE_TWO_CLUBS,
    'l5': NATIONAL_LEAGUE_CLUBS,
  };

  const baseUpgradeCostByTier: Record<number, number> = {
    1: 15_000_000,
    2: 6_000_000,
    3: 1_500_000,
    4: 400_000,
    5: 80_000,
  };

  const sponsorNamesByTier: Record<number, { MAIN: string[]; SLEEVE: string[]; STADIUM: string[] }> = {
    1: {
      MAIN: ['Emirates', 'Etihad', 'AIA', 'Chevrolet', 'Adidas'],
      SLEEVE: ['Visa', 'Nike', 'Puma', 'Coca-Cola'],
      STADIUM: ['Fly Emirates', 'Etihad Airways', 'AIA Group']
    },
    2: {
      MAIN: ['Sky Bet', 'Carabao', 'Utilita', 'Randstad'],
      SLEEVE: ['Bet365', 'Coral', 'Ladbrokes'],
      STADIUM: ['Sky Betting', 'Carabao Energy', 'Utilita Energy']
    },
    3: {
      MAIN: ['Skybet', 'Local Motors', 'RegionalBank FC'],
      SLEEVE: ['BetVictor', 'William Hill', 'Paddy Power'],
      STADIUM: ['Local Brewery', 'Regional Insurance', 'Town Council']
    },
    4: {
      MAIN: ['Local Builders', 'Town Garage', 'Community Bank'],
      SLEEVE: ['Village Pub', 'Local Shop', 'Town Cafe'],
      STADIUM: ['Local Council', 'Town Hall', 'Community Centre']
    },
    5: {
      MAIN: ['Corner Shop', 'Local Pub', 'Village Store'],
      SLEEVE: ['Newsagent', 'Butcher', 'Baker'],
      STADIUM: ['Village Hall', 'Community Club', 'Local Park']
    },
  };

  const sponsorRangesByTier: Record<number, { MAIN: number[]; SLEEVE: number[]; STADIUM: number[] }> = {
    1: { MAIN: [80000, 500000], SLEEVE: [30000, 150000], STADIUM: [100000, 800000] },
    2: { MAIN: [10000, 80000], SLEEVE: [4000, 30000], STADIUM: [15000, 100000] },
    3: { MAIN: [2000, 12000], SLEEVE: [800, 4000], STADIUM: [3000, 15000] },
    4: { MAIN: [400, 2500], SLEEVE: [150, 800], STADIUM: [600, 3000] },
    5: { MAIN: [80, 400], SLEEVE: [30, 150], STADIUM: [120, 600] },
  };

  leagues.forEach(league => {
    const staticClubs = clubData[league.id as keyof typeof clubData];
    staticClubs.forEach(staticClub => {
      const clubId = staticClub.id;
      const tierMultiplier = [100, 10, 1, 0.1, 0.02][league.tier - 1] || 0.01;
      const ownerType = staticClub.boardType as OwnershipType;
      const expectations = mapSeasonTargetToExpectation(staticClub.seasonTarget, league.tier);
      const culture: ClubCultureType[] = [mapBoardTypeToCulture(ownerType)];

      const club: Club = {
        id: clubId,
        name: staticClub.name,
        stadiumName: staticClub.stadiumName,
        primaryColor: staticClub.primaryColor,
        secondaryColor: staticClub.secondaryColor,
        reputation: staticClub.reputation,
        isUserControlled: false,
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
          stadium: { level: staticClub.facilities.stadiumLevel, name: 'Stadium', upgradeCost: Math.floor(baseUpgradeCostByTier[league.tier] * Math.pow(1.5, staticClub.facilities.stadiumLevel)), capacity: staticClub.facilities.stadiumCapacity },
          trainingGround: { level: staticClub.facilities.trainingLevel, name: 'Training Ground', upgradeCost: Math.floor(baseUpgradeCostByTier[league.tier] * Math.pow(1.5, staticClub.facilities.trainingLevel)) },
          medicalCenter: { level: staticClub.facilities.medicalLevel, name: 'Medical Center', upgradeCost: Math.floor(baseUpgradeCostByTier[league.tier] * Math.pow(1.5, staticClub.facilities.medicalLevel)) },
          youthAcademy: { level: staticClub.facilities.youthLevel, name: 'Youth Academy', upgradeCost: Math.floor(baseUpgradeCostByTier[league.tier] * Math.pow(1.5, staticClub.facilities.youthLevel)) },
        },
        valuation: staticClub.valuation,
        isForSale: true,
        finances: {
          balance: staticClub.finances.balance,
          transferBudget: staticClub.finances.transferBudget,
          wageBudget: (20000 * tierMultiplier),
          weeklyWages: 0,
          weeklyStaffWages: 0,
          overdraftLimit: -(1000000 + (3 - league.tier) * 2000000),
          revenue: { tickets: 0, sponsorship: 200000, prizeMoney: 0, merchandise: 10000, tvRights: 100000 },
          expenses: { playerWages: 0, staffWages: 0, transfers: 0, facilityMaintenance: 5000, loanRepayments: 0 },
          loans: []
        },
        transferBudget: staticClub.finances.transferBudget,
        seasonTarget: staticClub.seasonTarget as SeasonTarget,
        availableSponsors: [
          (() => {
            const names = sponsorNamesByTier[league.tier].MAIN;
            const ranges = sponsorRangesByTier[league.tier].MAIN;
            const amount = Math.floor(Math.random() * (ranges[1] - ranges[0] + 1)) + ranges[0];
            return { id: `sp-${clubId}-1`, name: getRandomElement(names), type: 'MAIN' as const, amount, duration: 2, reputationRequired: Math.max(0, Math.floor(staticClub.reputation - 5)), status: 'PENDING' as const };
          })(),
          (() => {
            const names = sponsorNamesByTier[league.tier].SLEEVE;
            const ranges = sponsorRangesByTier[league.tier].SLEEVE;
            const amount = Math.floor(Math.random() * (ranges[1] - ranges[0] + 1)) + ranges[0];
            return { id: `sp-${clubId}-2`, name: getRandomElement(names), type: 'SLEEVE' as const, amount, duration: 1, reputationRequired: Math.max(0, Math.floor(staticClub.reputation - 10)), status: 'PENDING' as const };
          })(),
          (() => {
            const names = sponsorNamesByTier[league.tier].STADIUM;
            const ranges = sponsorRangesByTier[league.tier].STADIUM;
            const amount = Math.floor(Math.random() * (ranges[1] - ranges[0] + 1)) + ranges[0];
            return { id: `sp-${clubId}-3`, name: getRandomElement(names), type: 'STADIUM' as const, amount, duration: 3, reputationRequired: Math.max(0, Math.floor(staticClub.reputation + 5)), status: 'PENDING' as const };
          })(),
        ],
        activeSponsors: [],
        staffAds: [],
        staffApplicants: [],
        scoutAssignments: [],
        scoutReports: [],
        formation: '4-4-2',
        tactics: 'DIRECT',
        startingLineup: {},
        history: [`Founded club in ${league.name}`]
      };

      // Generate Squad
      const squad: Player[] = [];
      const squadSize = squadSizeByTier[league.tier] || 16;
      const bias = getSquadBiasForCulture(club.culture);
      for (let p = 0; p < squadSize; p++) {
        const forceYouth = Math.random() < bias.youngBias * 0.4;
        const player = generatePlayer(clubId, league.tier, forceYouth);

        if (Math.random() < bias.potentialBias && player.age < 24) {
          player.potentialRating = Math.min(99,
            player.potentialRating + Math.floor(Math.random() * 10)
          );
        }

        if (bias.ratingBias !== 0) {
          player.overallRating = Math.max(20, Math.min(99,
            player.overallRating + Math.floor(bias.ratingBias * Math.random())
          ));
        }

        squad.push(player);
      }

      // Enforce minimum position coverage
      const positionCounts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, ATT: 0 };
      squad.forEach(p => positionCounts[p.position]++);
      const mins: Record<Position, number> = { GK: 2, DEF: 4, MID: 3, ATT: 2 };
      for (const pos of Object.keys(mins) as Position[]) {
        while (positionCounts[pos] < mins[pos]) {
          for (let i = squad.length - 1; i >= 0; i--) {
            const p = squad[i];
            if (positionCounts[p.position] > mins[p.position]) {
              squad[i] = generatePlayerAtPosition(clubId, league.tier, pos);
              positionCounts[p.position]--;
              positionCounts[pos]++;
              break;
            }
          }
        }
      }

      const maxWonderkids = league.tier <= 2 ? 3 : 1;
      let wonderkidCount = 0;
      squad.forEach(p => {
        if (p.personality === 'WONDERKID') {
          wonderkidCount++;
          if (wonderkidCount > maxWonderkids) {
            p.personality = 'PROFESSIONAL';
          }
        }
      });

      // Add squad to allPlayers
      squad.forEach(player => allPlayers.push(player));

      const playerWages = squad.reduce((sum, p) => sum + p.wage, 0);
      club.finances.weeklyWages = playerWages;
      club.finances.expenses.playerWages = playerWages;

      // Finalize Starting Lineup
      club.startingLineup = autoPickLineup(club.formation, squad);

      clubs.push(club);

      // Generate Manager
      const managerRatingBase = 40 + (5 - league.tier) * 10;
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
        history: [`Started career at ${staticClub.name}`]
      };

      managers.push(manager);
    });
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
    personalBalance: 1000000, // Non-league level starting wealth
  };
};
