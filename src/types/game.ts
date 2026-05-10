export type Position = 'GK' | 'DEF' | 'MID' | 'ATT';
export type SeasonTarget = 'CHAMPIONS' | 'PROMOTION' | 'PLAYOFFS' | 'TOP_HALF' | 'MID_TABLE' | 'AVOID_RELEGATION';
export type PersonalityStyle = 'LOYAL' | 'AMBITIOUS' | 'LAZY' | 'INJURY_PRONE' | 'PROFESSIONAL' | 'TEMPERAMENTAL';
export type TacticalPhilosophy = 'POSSESSION' | 'HIGH_PRESSING' | 'COUNTER_ATTACK' | 'DEFENSIVE' | 'WING_PLAY' | 'DIRECT';
export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-4-1' | '4-4-2_DIAMOND';
export type OwnershipType = 'LOCAL' | 'BILLIONAIRE' | 'CORPORATE' | 'FAN_OWNED';
export type BoardExpectation = 'AVOID_RELEGATION' | 'MID_TABLE' | 'PROMOTION' | 'TITLE_CONTENDER' | 'QUALIFY_EUROPE';
export type ClubCultureType = 'YOUTH_DEVELOPMENT' | 'WINNING' | 'SELLING' | 'PRAGMATIC' | 'LUXURY_FOOTBALL';

export interface StaffAdvertisement {
  id: string;
  role: StaffRole;
  weeksRemaining: number;
  cost: number;
}

export interface StaffApplicant extends Staff {
  id: string;
  isApplicant: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  type: 'MAIN' | 'SLEEVE' | 'STADIUM';
  amount: number;
  duration: number; // in seasons
  reputationRequired: number;
  status: 'PENDING' | 'ACTIVE';
}

export interface Club {
  id: string;
  name: string;
  stadiumName: string;
  primaryColor: string;
  secondaryColor: string;
  reputation: number; // 0-100
  isUserControlled: boolean;
  fanConfidence: number; // 0-100
  boardConfidence: number; // 0-100
  leagueId: string;
  facilities: ClubFacilities;
  finances: ClubFinances;
  history: string[];
  board: {
    type: OwnershipType;
    expectations: BoardExpectation;
    confidence: number;
    patience: number;
    funds: number;
  };
  culture: ClubCultureType[];
  rivals: string[];
  records: {
    biggestWin: string;
    worstDefeat: string;
    recordSigning: number;
    recordSale: number;
    hallOfFame: string[];
  };
  staffAds: StaffAdvertisement[];
  staffApplicants: StaffApplicant[];
  scoutAssignments: ScoutAssignment[];
  scoutReports: ScoutReport[];
  transferBudget: number;
  seasonTarget: SeasonTarget;
  availableSponsors: Sponsor[];
  activeSponsors: Sponsor[];
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  position: Position;
  
  // Technical
  technical: {
    passing: number;
    shooting: number;
    dribbling: number;
    tackling: number;
    positioning: number;
    vision: number;
    finishing: number;
    handling?: number; // GK only
  };
  
  // Physical
  physical: {
    pace: number;
    strength: number;
    stamina: number;
    agility: number;
    acceleration: number;
  };
  
  // Mental
  mental: {
    leadership: number;
    composure: number;
    aggression: number;
    workRate: number;
    decisions: number;
    determination: number;
  };
  
  // Hidden
  hidden: {
    professionalism: number;
    ambition: number;
    loyalty: number;
    injuryProneness: number;
    temperament: number;
    bigMatchMentality: number;
    consistency: number;
  };

  overallRating: number;
  potentialRating: number;
  value: number;
  wage: number;
  morale: number; 
  fitness: number; 
  fatigue: number; 
  injuryRisk: number; 
  clubId: string;
  personality: PersonalityStyle | 'LEADER' | 'WONDERKID' | 'LAZY_GENIUS' | 'CLUB_HERO' | 'MERCENARY';
  contractYears: number;
  isTransferListed: boolean;
  isLoanListed: boolean;
  tacticalFamiliarity: number; 
  form: number[]; // Last 5 match ratings
  happiness: {
    contract: number;
    playingTime: number;
    manager: number;
    clubAmbition: number;
    adaptation: number; // 0-100 (for foreign players)
    cityLife: number; // 0-100
  };
  chemistry: { [playerId: string]: number }; // Relationship with teammates
  isLegend: boolean;
  history: {
    appearances: number;
    goals: number;
    trophies: number;
    joinedDate: string;
  };
}

export interface Manager {
  id: string;
  name: string;
  
  // Coaching Attributes
  coaching: {
    attacking: number;
    defensive: number;
    tactical: number;
    mental: number;
    workingWithYouth: number;
  };
  
  // Philosophy
  philosophy: TacticalPhilosophy;
  preferredFormation: Formation;
  pressing: number;
  creativeFreedom: number;
  
  // Personality
  personality: {
    discipline: number;
    loyalty: number;
    ambition: number;
    mediaHandling: number;
    playerManagement: number;
  };

  coachingAbility: number;
  tacticalIntelligence: number;
  salary: number;
  clubId: string;
  relationshipWithChairman: number;
  morale: number;
  history: string[];
}

export type StaffRole = 'SPORTING_DIRECTOR' | 'SCOUT' | 'PHYSIO' | 'ANALYST' | 'ACADEMY_COACH';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  rating: number;
  salary: number;
  clubId: string;
}

export interface Facility {
  level: number;
  name: string;
  upgradeCost: number;
}

export interface ClubFacilities {
  stadium: Facility & { capacity: number };
  trainingGround: Facility;
  medicalCenter: Facility;
  youthAcademy: Facility;
}

export interface ClubFinances {
  balance: number;
  weeklyWages: number;
  weeklyStaffWages: number;
  revenue: {
    tickets: number;
    sponsorship: number;
    prizeMoney: number;
    merchandise: number;
    tvRights: number;
    playerSales: number;
  };
  expenses: {
    playerWages: number;
    staffWages: number;
    transfers: number;
    facilityMaintenance: number;
    loanRepayments: number;
  };
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

export interface TransferRequest {
  id: string;
  managerId: string;
  clubId: string;
  type: 'SQUAD_WEAKNESS' | 'TACTICAL' | 'DEPTH' | 'YOUTH';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELAYED';
  suggestedPosition?: Position;
  suggestedPlayerId?: string;
  budgetLimit?: number;
  weekRequested: number;
  seasonRequested: number;
}

export interface TransferBid {
  id: string;
  playerId: string;
  fromClubId: string;
  toClubId: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  week: number;
  season: number;
  isPlayerInterested: boolean;
  negotiationCount: number; // Max 3 bargaining rounds
}

export interface NewsStory {
  id: string;
  date: string;
  title: string;
  content: string;
  category: 'MATCH' | 'TRANSFER' | 'CLUB' | 'WORLD' | 'RUMOUR';
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'BREAKING';
  clubId?: string;
}

export interface ScoutAssignment {
  scoutId: string;
  region: string;
  progress: number;
  playersFound: string[]; // Player IDs
}

export interface ScoutReport {
  playerId: string;
  scoutId: string;
  knowledgeLevel: number; // 0-100
  recommendation: number; // 1-5
}

export interface GameState {
  currentWeek: number;
  currentSeason: number;
  isTransferWindowOpen: boolean;
  clubs: Club[];
  players: Player[];
  managers: Manager[];
  staff: Staff[];
  leagues: League[];
  matches: Match[];
  transferRequests: TransferRequest[];
  transferBids: TransferBid[];
  news: NewsStory[];
  userClubId: string | null;
}
