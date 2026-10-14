export type Compound = 'soft' | 'medium' | 'hard' | 'intermediate' | 'wet';

export type PaceMode = 'attack' | 'balanced' | 'conserve';

export type AIProfile = 'aggressive' | 'conservative' | 'strategic' | 'unpredictable';

export type WeatherState = 'dry' | 'drizzle' | 'wet';

export type IncidentState = 'none' | 'vsc' | 'safety_car';

export interface TyreSet {
  id: string;
  compound: Compound;
  isUsed: boolean;
  wear: number; // 0 to 100
}

export interface DriverInRace {
  id: string;
  name: string;
  team: string;
  teamColor: string;
  number: number;
  isPlayer: boolean;
  profile: AIProfile;
  currentCompound: Compound;
  tyreLaps: number;
  tyreWear: number; // 0-100%
  paceMode: PaceMode;
  totalTime: number; // in seconds
  gapToLeader: number; // in seconds
  gapToAhead: number; // in seconds
  position: number;
  pitStops: number;
  lastLapTime: number;
  bestLapTime: number;
  status: 'running' | 'pit' | 'out';
  inPitThisLap?: boolean;
  trackProgress: number; // 0.0 to 1.0 around the circuit
  sector: 1 | 2 | 3;
  hasDrs: boolean; // Gap < 1.0s at detection point
  fuelKg: number; // Current fuel load in kg
}

export interface PitWindowProjection {
  currentPosition: number;
  projectedPosition: number;
  pitLossSeconds: number;
  rejoinGapToLeader: number;
  rejoinAheadDriver: string | null;
  rejoinBehindDriver: string | null;
  trafficRisk: 'low' | 'medium' | 'high';
  trafficDescription: string;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  subtitle: string;
  trackName: string;
  country: string;
  flag: string;
  totalLaps: number;
  baseLapTime: number; // e.g. 78.5 seconds (Barcelona ~1:18.5)
  pitStopDelta: number; // seconds lost entering & exiting pit lane (~21s)
  vscPitDelta: number; // seconds lost during VSC (~12s)
  scPitDelta: number; // seconds lost during SC (~9s)
  initialPlayerPosition: number;
  targetObjective: string;
  targetPosition: number;
  weatherForecast: {
    startWeather: WeatherState;
    temperature: number;
    forecastNotes: string;
    rainChanceLaps?: { lap: number; weather: WeatherState; intensity: number }[];
  };
  possibleIncidents?: {
    triggerLap: number;
    type: IncidentState;
    durationLaps: number;
    description: string;
  }[];
  availableTyreSets: TyreSet[];
  competitors: Omit<DriverInRace, 'position' | 'totalTime' | 'gapToLeader' | 'gapToAhead' | 'lastLapTime' | 'bestLapTime' | 'status' | 'trackProgress' | 'sector' | 'hasDrs' | 'fuelKg'>[];
}

export interface LapHistoryEntry {
  lap: number;
  driverId: string;
  position: number;
  lapTime: number;
  tyreWear: number;
  compound: Compound;
  pitted: boolean;
  gapToLeader: number;
}

export interface StrategyEventLog {
  lap: number;
  message: string;
  type: 'overtake' | 'pit' | 'incident' | 'weather' | 'order' | 'warning';
}

export interface PostRaceReport {
  startPosition: number;
  finishPosition: number;
  totalTime: number;
  gapToWinner: number;
  totalPits: number;
  timeInPits: number;
  overtakesMade: number;
  positionsLost: number;
  keyDecisions: {
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  score: number; // 0-1000
  rating: 'MASTER' | 'STRATEGIST' | 'GAMBLER' | 'ROOKIE';
  coinsReward: number;
}
