export type Position = 'GK' | 'DEF' | 'MID' | 'ATT';

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  position: Position;

  // Attributes
  technical: {
    passing: number;
    shooting: number;
    dribbling: number;
    tackling: number;
  };
  physical: {
    pace: number;
    strength: number;
    stamina: number;
  };
  mental: {
    leadership: number;
    composure: number;
    aggression: number;
  };

  overallRating: number;
  potentialRating: number;
  value: number;
  wage: number;
  morale: number;
  fitness: number;
  clubId: string;
  personality: 'LOYAL' | 'AMBITIOUS' | 'LAZY' | 'INJURY_PRONE' | 'PROFESSIONAL' | 'TEMPERAMENTAL';
}

export interface Manager {
  id: string;
  name: string;
  // Tactical Attributes
  attacking: number;
  defensive: number;
  possession: number;
  pressing: number;
  counterAttack: number;
  // Personality Attributes
  discipline: number;
  mediaHandling: number;
  loyalty: number;
  temperament: number;
  ambition: number;
  // Development Attributes
  youthDevelopment: number;
  tacticalIntelligence: number;
  squadRotation: number;
  playerManagement: number;

  salary: number;
  clubId: string;
  relationshipWithChairman: number; // 0-100
}

export interface Club {
  id: string;
  name: string;
  stadiumName: string;
  primaryColor: string;
  secondaryColor: string;
  reputation: number;
  balance: number;
  stadiumCapacity: number;
  fanbase: number;
  leagueId: string;
  isUserControlled: boolean;
  philosophy: 'ATTACKING' | 'DEFENSIVE' | 'YOUTH' | 'BALANCED';
  fanConfidence: number;
  boardConfidence: number;
}

export interface League {
  id: string;
  name: string;
  tier: number;
  country: string;
}

export interface Match {
  id: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  played: boolean;
  leagueId: string;
  week: number;
  season: number;
  events: MatchEvent[];
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'CARD' | 'INJURY' | 'COMMENTARY';
  description: string;
  playerId?: string;
}

export interface LeagueTableEntry {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GameState {
  currentWeek: number;
  currentSeason: number;
  clubs: Club[];
  players: Player[];
  managers: Manager[];
  leagues: League[];
  matches: Match[];
  userClubId: string | null;
}
