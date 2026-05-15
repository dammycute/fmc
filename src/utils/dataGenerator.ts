import {
  type Club, type Player, type Manager, type League, type Position,
  type TacticalPhilosophy, type Formation,
  type OwnershipType, type SeasonTarget, type BoardExpectation, type ClubCultureType,
  type GameState, type ManagerArchetype
} from '../types/game';
import { generateFixtures } from './fixtureGenerator';
import {
  PREMIER_LEAGUE_CLUBS,
  CHAMPIONSHIP_CLUBS,
  LEAGUE_ONE_CLUBS,
  LEAGUE_TWO_CLUBS,
  NATIONAL_LEAGUE_CLUBS,
} from '../data/clubs';

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

// Manager Archetype Configuration
export interface ArchetypeConfig {
  youthDevelopmentMultiplier: number;
  overperformanceMultiplier: number;
  chairmanRelationshipDecayRate: number;
  transferRequestFrequency: number;
  moraleSwingAmplitude: number;
}

export const ARCHETYPE_CONFIG: Record<ManagerArchetype, ArchetypeConfig> = {
  TACTICIAN: {
    youthDevelopmentMultiplier: 0.85,        // Focuses on tactics, less direct youth development
    overperformanceMultiplier: 1.35,         // Maximizes tactical advantage
    chairmanRelationshipDecayRate: 0.9,      // Results matter, moderate patience
    transferRequestFrequency: 0.15,          // Doesn't ask for many transfers
    moraleSwingAmplitude: 0.8,               // Calm, tactical approach
  },
  MOTIVATOR: {
    youthDevelopmentMultiplier: 0.90,        // Decent with youth development
    overperformanceMultiplier: 1.28,         // Motivates the squad to punch above their weight
    chairmanRelationshipDecayRate: 0.75,     // Better relationship management, slower decay
    transferRequestFrequency: 0.08,          // Focused on current squad
    moraleSwingAmplitude: 1.5,               // Morale fluctuates dramatically with results
  },
  YOUTH_DEVELOPER: {
    youthDevelopmentMultiplier: 1.6,         // Specializes in youth development
    overperformanceMultiplier: 0.95,         // Not focused on immediate overperformance
    chairmanRelationshipDecayRate: 1.1,      // May clash over short-term results
    transferRequestFrequency: 0.35,          // Needs specific player profiles
    moraleSwingAmplitude: 0.9,               // Focused, steady approach
  },
  PRAGMATIST: {
    youthDevelopmentMultiplier: 0.70,        // Not youth-focused
    overperformanceMultiplier: 1.1,          // Solid but unspectacular
    chairmanRelationshipDecayRate: 0.85,     // Practical results maintain board confidence
    transferRequestFrequency: 0.25,          // Wants specific tactical pieces
    moraleSwingAmplitude: 0.6,               // Steady, no-nonsense demeanor
  },
  FIREBRAND: {
    youthDevelopmentMultiplier: 0.75,        // Less patient with development
    overperformanceMultiplier: 1.45,         // High intensity yields big results or big failures
    chairmanRelationshipDecayRate: 1.25,     // Volatile, loses trust quickly
    transferRequestFrequency: 0.5,           // Constantly demands transfers
    moraleSwingAmplitude: 2.0,               // Morale swings wildly
  },
  VETERAN: {
    youthDevelopmentMultiplier: 0.95,        // Decent all-around coach
    overperformanceMultiplier: 1.2,          // Experience helps squeeze results
    chairmanRelationshipDecayRate: 0.8,      // Steady hand, earns trust
    transferRequestFrequency: 0.12,          // Knows how to maximize current squad
    moraleSwingAmplitude: 0.85,              // Emotionally stable
  },
};

// Determine manager archetype based on coaching attributes
export const determineManagerArchetype = (coaching: Manager['coaching'], personality: Manager['personality'], coachingAbility: number): ManagerArchetype => {
  const { attacking, defensive, tactical, mental, workingWithYouth } = coaching;
  const { loyalty, playerManagement } = personality;

  // TACTICIAN: high tactical rating
  if (tactical > 80) return 'TACTICIAN';

  // MOTIVATOR: high player management + mental skills
  if (playerManagement > 80 && mental > 75) return 'MOTIVATOR';

  // YOUTH_DEVELOPER: high working with youth
  if (workingWithYouth > 80) return 'YOUTH_DEVELOPER';

  // PRAGMATIST: high defensive + low attacking (defensive focus)
  if (defensive > 75 && attacking < 70) return 'PRAGMATIST';

  // FIREBRAND: high pressing + low loyalty (aggressive, demanding)
  if (coachingAbility > 70 && loyalty < 40) return 'FIREBRAND';

  // VETERAN: age-equivalent high coaching ability (will use coachingAbility as proxy)
  if (coachingAbility > 85) return 'VETERAN';

  // Default: MOTIVATOR as middle ground
  return 'MOTIVATOR';
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
    isInjured: false,
    injuryWeeksRemaining: 0,
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



// Club data moved to src/data/clubs.ts

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
        trainingFocus: 'BALANCED',
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
      const coaching = {
        attacking: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        defensive: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        tactical: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        mental: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        workingWithYouth: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
      };
      const personality = {
        discipline: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        loyalty: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        ambition: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        mediaHandling: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        playerManagement: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
      };
      const coachingAbility = getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20));
      const archetype = determineManagerArchetype(coaching, personality, coachingAbility);
      const archetypeConfig = ARCHETYPE_CONFIG[archetype];

      // Calculate contract weeks based on tier
      let contractWeeksRemaining: number;
      if (league.tier <= 2) {
        contractWeeksRemaining = getRandomRating(104, 208); // 2-4 years
      } else if (league.tier <= 4) {
        contractWeeksRemaining = getRandomRating(52, 156); // 1-3 years
      } else {
        contractWeeksRemaining = getRandomRating(26, 104); // 6 months - 2 years
      }

      const manager: Manager = {
        id: `m-${clubId}`,
        name: `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
        archetype,
        coaching,
        philosophy: getRandomElement(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as TacticalPhilosophy[]),
        pressing: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        creativeFreedom: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        personality,
        coachingAbility,
        tacticalIntelligence: getRandomRating(managerRatingBase, Math.min(95, managerRatingBase + 20)),
        salary: Math.floor(5000 * tierMultiplier),
        contractWeeksRemaining,
        clubId: clubId,
        relationshipWithChairman: 70,
        wantsToLeave: false,
        morale: 70,
        preferredStyle: ['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'][Math.floor(Math.random() * 6)] as TacticalPhilosophy,
        preferredFormation: ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-4-1'][Math.floor(Math.random() * 5)] as Formation,
        history: [`Started career at ${staticClub.name}`],
        youthDevelopmentMultiplier: archetypeConfig.youthDevelopmentMultiplier,
        overperformanceMultiplier: archetypeConfig.overperformanceMultiplier,
        chairmanRelationshipDecayRate: archetypeConfig.chairmanRelationshipDecayRate,
        transferRequestFrequency: archetypeConfig.transferRequestFrequency,
        moraleSwingAmplitude: archetypeConfig.moraleSwingAmplitude,
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
      const coaching = {
        attacking: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        defensive: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        tactical: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        mental: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        workingWithYouth: getRandomRating(tier >= 3 ? managerRatingBase : managerRatingBase - 10, Math.min(95, managerRatingBase + spread)),
      };
      const personality = {
        discipline: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        loyalty: getRandomRating(tier >= 4 ? 60 : 30, 95), // lower-tier managers are more loyal
        ambition: getRandomRating(tier <= 2 ? 60 : 30, 95), // top-tier managers are more ambitious
        mediaHandling: getRandomRating(Math.max(20, managerRatingBase - 15), managerRatingBase + 10),
        playerManagement: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
      };
      const coachingAbility = managerRatingBase;
      const archetype = determineManagerArchetype(coaching, personality, coachingAbility);
      const archetypeConfig = ARCHETYPE_CONFIG[archetype];

      // Calculate contract weeks based on tier
      let contractWeeksRemaining: number;
      if (tier <= 2) {
        contractWeeksRemaining = getRandomRating(104, 208); // 2-4 years
      } else if (tier <= 4) {
        contractWeeksRemaining = getRandomRating(52, 156); // 1-3 years
      } else {
        contractWeeksRemaining = getRandomRating(26, 104); // 6 months - 2 years
      }

      managers.push({
        id: `free-manager-t${tier}-${i}`,
        name: `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
        archetype,
        coaching,
        philosophy: getRandomElement(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as TacticalPhilosophy[]),
        pressing: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        creativeFreedom: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        personality,
        coachingAbility,
        tacticalIntelligence: getRandomRating(managerRatingBase - 5, Math.min(95, managerRatingBase + spread)),
        salary: getRandomRating(cfg.salaryMin, cfg.salaryMax),
        contractWeeksRemaining,
        clubId: '',
        relationshipWithChairman: 50,
        wantsToLeave: false,
        morale: 70,
        preferredStyle: getRandomElement(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as TacticalPhilosophy[]),
        preferredFormation: getRandomElement(['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-4-1'] as Formation[]),
        history: [`Available for hire from day one`],
        youthDevelopmentMultiplier: archetypeConfig.youthDevelopmentMultiplier,
        overperformanceMultiplier: archetypeConfig.overperformanceMultiplier,
        chairmanRelationshipDecayRate: archetypeConfig.chairmanRelationshipDecayRate,
        transferRequestFrequency: archetypeConfig.transferRequestFrequency,
        moraleSwingAmplitude: archetypeConfig.moraleSwingAmplitude,
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
