/**
 * LIGHTS OUT — F1 REAL NORMALIZED DATA TYPES & SOURCE PROVENANCE
 * 
 * Formal data architecture conforming to the Master Development Specification.
 * Enforces strict temporal accuracy, source provenance, licensing metadata,
 * and clear distinction between official records, calculated metrics, and replays.
 */

export type SourceReliability = 'OFFICIAL_PRIMARY' | 'COMMUNITY_VERIFIED' | 'COMPUTED' | 'EDITORIAL' | 'DEMO';

export interface SourceProvenance {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  retrievedAt: string;
  license: string;
  licenseUrl: string;
  reliability: SourceReliability;
  isOfficialFia: boolean;
  citationText: string;
}

export interface F1SourceDefinition {
  id: string;
  name: string;
  baseUrl: string;
  dataCategories: string[];
  accessMethod: 'REST_JSON' | 'STATIC_ARCHIVE' | 'OFFICIAL_PDF' | 'SCRAPER_FREE';
  authenticationRequired: boolean;
  termsUrl: string;
  allowedUse: 'PUBLIC_FREE' | 'HISTORICAL_ONLY' | 'EDUCATIONAL_NON_COMMERCIAL' | 'UNVERIFIED';
  attributionRequired: boolean;
  rateLimits: string;
  refreshPolicy: string;
  historicalCoverage: string;
  liveDataCapability: 'FREE' | 'PAID_ONLY' | 'UNAVAILABLE';
  lastSynchronized?: string;
  lastError?: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN' | 'RATE_LIMITED';
  verificationDate: string;
}

export interface F1SeasonSummary {
  season: number;
  totalRaces: number;
  championDriver?: {
    id: string;
    name: string;
    nationality: string;
    constructorId: string;
    constructorName: string;
    points: number;
  };
  championConstructor?: {
    id: string;
    name: string;
    points: number;
  };
  regulationsSummary: string;
  majorChanges: string[];
  provenance: SourceProvenance;
}

export interface F1GrandPrixResultEntry {
  position: number | string; // 'DNF', 'DSQ', 'DNS'
  gridPosition: number;
  driverId: string;
  driverNumber: number;
  driverName: string;
  driverNationality: string;
  constructorId: string;
  constructorName: string;
  laps: number;
  timeOrStatus: string;
  points: number;
  fastestLap?: {
    rank: number;
    lap: number;
    time: string;
    averageSpeedKph?: string;
  };
  penaltiesApplied?: string[];
  classificationStatus: 'OFFICIAL_FINAL' | 'PROVISIONAL' | 'UNDER_INVESTIGATION';
}

export interface F1QualifyingEntry {
  position: number;
  driverId: string;
  driverNumber: number;
  driverName: string;
  constructorId: string;
  constructorName: string;
  q1?: string;
  q2?: string;
  q3?: string;
}

export interface F1RaceWeekend {
  id: string;
  season: number;
  round: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  country: string;
  city: string;
  date: string;
  time?: string;
  hasSprint: boolean;
  results?: F1GrandPrixResultEntry[];
  qualifying?: F1QualifyingEntry[];
  stewardsDecisionsCount?: number;
  provenance: SourceProvenance;
}

export interface F1StewardDecision {
  id: string;
  weekendId: string;
  documentNumber: number;
  session: string;
  date: string;
  carNumber: number;
  driverName: string;
  competitor: string;
  fact: string;
  offence: string;
  decision: string;
  reason: string;
  officialPdfUrl?: string;
  provenance: SourceProvenance;
}

export interface F1RegulationTopic {
  id: string;
  year: number;
  category: 'SPORTING' | 'TECHNICAL' | 'FINANCIAL' | 'SAFETY';
  title: string;
  summary: string;
  officialArticleCode: string;
  keyPoints: string[];
  engineeringImpact: string;
  officialDocumentUrl: string;
  provenance: SourceProvenance;
}

export interface F1TechTopic {
  id: string;
  title: string;
  systemCategory: 'AERODYNAMICS' | 'POWER_UNIT' | 'CHASSIS_SUSPENSION' | 'TYRES_BRAKES' | 'SAFETY';
  shortSummary: string;
  detailedAnalysis: string;
  regulatoryContext: string;
  engineeringPrinciples: string[];
  schematicExplanation: string;
  associatedRegulations: string[];
  provenance: SourceProvenance;
}

export interface F1JuniorCategoryProfile {
  id: string;
  championship: 'FIA_FORMULA_2' | 'FIA_FORMULA_3';
  season: number;
  championDriver?: string;
  championTeam?: string;
  graduatedDriversToF1: { driverName: string; f1Team: string; debutYear: number }[];
  academiesRepresented: { academyName: string; f1Team: string; juniorDrivers: string[] }[];
  overview: string;
  provenance: SourceProvenance;
}

export interface F1HistoricalRecord {
  id: string;
  category: 'WINS' | 'POLES' | 'CHAMPIONSHIPS' | 'PODIUMS' | 'CONSECUTIVE_WINS' | 'POINTS';
  title: string;
  description: string;
  rulesContext: string;
  entries: {
    rank: number;
    holderName: string;
    entityType: 'DRIVER' | 'CONSTRUCTOR';
    value: number | string;
    yearsSpan: string;
    notes?: string;
  }[];
  provenance: SourceProvenance;
}

export interface F1MediaAsset {
  id: string;
  entityType: 'DRIVER' | 'TEAM' | 'CAR' | 'CIRCUIT' | 'REGULATION';
  entityId: string;
  url: string;
  thumbnailUrl?: string;
  author: string;
  sourceWebsite: string;
  license: 'PUBLIC_DOMAIN' | 'CC_BY_SA_4_0' | 'CC_BY_3_0' | 'CC_BY_2_0' | 'EDITORIAL_F1FANSITE' | 'UNSPLASH_FREE';
  licenseUrl: string;
  attribution: string;
  commercialUseAllowed: boolean;
  modificationAllowed: boolean;
}
