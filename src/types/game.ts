export type Position = 'GK' | 'DEF' | 'MID' | 'ATT';

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  position: Position;
  overallRating: number;
  potentialRating: number;
  value: number;
  wage: number;
  morale: number;
  fitness: number;
  clubId: string;
}

export interface Manager {
  id: string;
  name: string;
  attackStyle: number;
  defensiveStyle: number;
  youthPreference: number;
  tacticalRating: number;
  manManagement: number;
  salary: number;
  clubId: string;
}

export interface Club {
  id: string;
  name: string;
  reputation: number;
  balance: number;
  stadiumCapacity: number;
  fanbase: number;
  leagueId: string;
  isUserControlled: boolean;
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
