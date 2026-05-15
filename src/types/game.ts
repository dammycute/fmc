export type Position = 'GK' | 'DEF' | 'MID' | 'ATT';
export type SeasonTarget = 'CHAMPIONS' | 'PROMOTION' | 'PLAYOFFS' | 'TOP_HALF' | 'MID_TABLE' | 'AVOID_RELEGATION';
export type PersonalityStyle = 'LOYAL' | 'AMBITIOUS' | 'LAZY' | 'INJURY_PRONE' | 'PROFESSIONAL' | 'TEMPERAMENTAL';
export type TacticalPhilosophy = 'POSSESSION' | 'HIGH_PRESSING' | 'COUNTER_ATTACK' | 'DEFENSIVE' | 'WING_PLAY' | 'DIRECT';
export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-4-1' | '4-4-2_DIAMOND';
export type TrainingFocus = 'ATTACKING' | 'DEFENSIVE' | 'PHYSICAL' | 'MENTAL' | 'BALANCED';
export type OwnershipType = 'LOCAL' | 'BILLIONAIRE' | 'CORPORATE' | 'FAN_OWNED';
export type BoardExpectation = 'AVOID_RELEGATION' | 'MID_TABLE' | 'PROMOTION' | 'TITLE_CONTENDER' | 'QUALIFY_EUROPE';
export type ClubCultureType = 'YOUTH_DEVELOPMENT' | 'WINNING' | 'SELLING' | 'PRAGMATIC' | 'LUXURY_FOOTBALL';

export interface StaffAdvertisement {
  id: string;
  role: StaffRole;
  weeksRemaining: number;
  cost: number;
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
  valuation: number;
  isForSale: boolean;
  formation: Formation;
  tactics: TacticalPhilosophy;
  trainingFocus: TrainingFocus;
  startingLineup: { [pos: string]: string | null };
}


export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  position: Position;
  archetype?: string;
  consistency: number;
  profile: 'EXPLOSIVE' | 'TECHNICAL' | 'MENTAL' | 'BALANCED';
  technical: {
    passing: number;
    shooting: number;
    dribbling: number;
    tackling: number;
    positioning: number;
    vision: number;
    finishing: number;
    handling?: number; // GK only
    commandOfArea?: number; // GK only
    eccentricity?: number; // GK only
    reflexes?: number; // GK only
    rushingOut?: number; // GK only
  };
  physical: {
    pace: number;
    strength: number;
    stamina: number;
    agility: number;
    acceleration: number;
  };
  mental: {
    leadership: number;
    composure: number;
    aggression: number;
    workRate: number;
    decisions: number;
    determination: number;
  };
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
  isInjured: boolean;
  injuryWeeksRemaining: number;
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
    adaptation: number;
    cityLife: number;
  };
  chemistry: { [playerId: string]: number };
  isLegend: boolean;
  avatarUrl?: string;
  history: {
    appearances: number;
    goals: number;
    trophies: number;
    joinedSeason: number;
    joinedWeek: number;
  };
}

export type ManagerArchetype = 'TACTICIAN' | 'MOTIVATOR' | 'YOUTH_DEVELOPER' | 'PRAGMATIST' | 'FIREBRAND' | 'VETERAN';

export interface Manager {
  id: string;
  name: string;
  archetype: ManagerArchetype;
  coaching: {
    attacking: number;
    defensive: number;
    tactical: number;
    mental: number;
    workingWithYouth: number;
  };
  philosophy: TacticalPhilosophy;
  preferredFormation: Formation;
  pressing: number;
  creativeFreedom: number;
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
  contractYears?: number;
  contractWeeksRemaining: number;
  clubId: string;
  relationshipWithChairman: number;
  wantsToLeave: boolean;
  morale: number;
  preferredStyle: TacticalPhilosophy;
  history: string[];
  
  // Archetype mechanical effects
  youthDevelopmentMultiplier: number;
  overperformanceMultiplier: number;
  chairmanRelationshipDecayRate: number;
  transferRequestFrequency: number;
  moraleSwingAmplitude: number;
  
  // Optional flattened properties for UI compatibility
  agePreference?: { min: number; max: number };
  ambition?: number;
  discipline?: number;
  loyalty?: number;
  attacking?: number;
  defensive?: number;
  possession?: number;
}

export type StaffRole = 'SPORTING_DIRECTOR' | 'SCOUT' | 'PHYSIO' | 'ANALYST' | 'ACADEMY_COACH';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  rating: number;
  salary: number;
  clubId: string;
  isApplicant?: boolean;
}

export interface StaffApplicant extends Staff {
  id: string;
  isApplicant: boolean;
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
  transferBudget: number;
  wageBudget: number;
  weeklyWages: number;
  weeklyStaffWages: number;
  overdraftLimit: number;
  revenue: {
    tickets: number;
    sponsorship: number;
    merchandise: number;
    tvRights: number;
    prizeMoney: number;
  };
  expenses: {
    playerWages: number;
    staffWages: number;
    facilityMaintenance: number;
    loanRepayments: number;
    transfers: number;
  };
  loans: Array<{
    id: string;
    amount: number;
    remainingAmount: number;
    weeklyRepayment: number;
    interestRate: number;
  }>;
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
  season: number;
  week: number;
  events: MatchEvent[];
  playerRatings?: Record<string, number>;
  stats?: {
    homePossession: number;
    awayPossession: number;
    homeShots: number;
    awayShots: number;
    homePassRate: number;
    awayPassRate: number;
    homeXg?: number;
    awayXg?: number;
  };
}


export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'CARD' | 'INJURY' | 'COMMENTARY';
  description: string;
  playerId?: string;
  clubId?: string;
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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  week: number;
  season: number;
  isPlayerInterested: boolean;
  negotiationCount: number;
}

export interface NewsStory {
  id: string;
  week: number;
  season: number;
  title: string;
  content: string;
  category: 'MATCH' | 'TRANSFER' | 'CLUB' | 'WORLD' | 'RUMOUR' | 'FINANCE' | 'BOARD';
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'BREAKING';
  clubId?: string;
  impact?: {
    morale?: number;
    fans?: number;
    board?: number;
  };
}

export interface ScoutAssignment {
  id: string;
  scoutId: string;
  clubId: string;
  region: string;
  progress: number;
  playersFound: string[];
  reports: ScoutReport[];
}

export interface ScoutReport {
  id: string;
  playerId: string;
  scoutId: string;
  reportedRating: number;
  week: number;
  season: number;
}

export interface LeagueTableEntry {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface GameState {
  currentSeason: number;
  currentWeek: number;
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
  personalBalance: number;
}
