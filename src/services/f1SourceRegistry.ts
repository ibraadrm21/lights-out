import { F1SourceDefinition, SourceProvenance, SourceReliability } from '../types/f1Data';

/**
 * LIGHTS OUT — CENTRAL F1 SOURCE REGISTRY
 * 
 * Verifiable repository of all legal, free, and third-party data providers
 * used across the F1 Real platform. Explicitly registers capabilities,
 * allowed usage terms, rate limits, and health status.
 */

export const F1_SOURCES_REGISTRY: Record<string, F1SourceDefinition> = {
  'jolpica-f1': {
    id: 'jolpica-f1',
    name: 'Jolpica-F1 (Ergast API Successor)',
    baseUrl: 'https://api.jolpi.ca/ergast/f1',
    dataCategories: ['Championships', 'Seasons 1950-Present', 'Race Calendars', 'Race Results', 'Qualifying', 'Standings', 'Pit Stops', 'Laps'],
    accessMethod: 'REST_JSON',
    authenticationRequired: false,
    termsUrl: 'https://github.com/jolpica/jolpica-f1/blob/main/LICENSE.md',
    allowedUse: 'PUBLIC_FREE',
    attributionRequired: true,
    rateLimits: '4 requests per second; max 200 per minute',
    refreshPolicy: 'Cache 24 hours for historical; 1 hour for current championship',
    historicalCoverage: 'Complete from 1950 to present day',
    liveDataCapability: 'UNAVAILABLE',
    status: 'OPERATIONAL',
    verificationDate: '2024-11-20',
  },
  'openf1': {
    id: 'openf1',
    name: 'OpenF1 Community Project',
    baseUrl: 'https://api.openf1.org/v1',
    dataCategories: ['Session Timing', 'Laps', 'Intervals', 'Tyre Stints', 'Telemetry Samples', 'Weather', 'Race Control Messages'],
    accessMethod: 'REST_JSON',
    authenticationRequired: false,
    termsUrl: 'https://openf1.org/docs/',
    allowedUse: 'HISTORICAL_ONLY',
    attributionRequired: true,
    rateLimits: 'Max 30 requests per minute recommended',
    refreshPolicy: 'Cache static sessions indefinitely; dynamic telemetry on demand',
    historicalCoverage: '2023 season to present championship sessions',
    liveDataCapability: 'PAID_ONLY', // OpenF1 requires paid plan for real-time live timing. Historical is 100% free!
    status: 'OPERATIONAL',
    verificationDate: '2024-11-20',
  },
  'fia-official': {
    id: 'fia-official',
    name: 'Fédération Internationale de l’Automobile (FIA)',
    baseUrl: 'https://www.fia.com',
    dataCategories: ['Sporting Regulations', 'Technical Regulations', 'Financial Regulations', 'Official Stewards Decisions', 'Classifications'],
    accessMethod: 'OFFICIAL_PDF',
    authenticationRequired: false,
    termsUrl: 'https://www.fia.com/terms-and-conditions',
    allowedUse: 'EDUCATIONAL_NON_COMMERCIAL',
    attributionRequired: true,
    rateLimits: 'Direct linking and citation only',
    refreshPolicy: 'Event-by-event updates',
    historicalCoverage: 'Modern regulatory era (2000-present)',
    liveDataCapability: 'UNAVAILABLE',
    status: 'OPERATIONAL',
    verificationDate: '2024-11-20',
  },
  'wikimedia-commons': {
    id: 'wikimedia-commons',
    name: 'Wikimedia Commons & Wikipedia',
    baseUrl: 'https://commons.wikimedia.org',
    dataCategories: ['Driver Biographies', 'Licensed Headshot Photography', 'Circuit Vector SVG Maps (FIA Grade 1)'],
    accessMethod: 'REST_JSON',
    authenticationRequired: false,
    termsUrl: 'https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia',
    allowedUse: 'PUBLIC_FREE',
    attributionRequired: true,
    rateLimits: 'Wikimedia User-Agent policy compliant with proxy CDN',
    refreshPolicy: 'Static caching with CDN proxy',
    historicalCoverage: 'All historical drivers, teams and circuits',
    liveDataCapability: 'UNAVAILABLE',
    status: 'OPERATIONAL',
    verificationDate: '2024-11-20',
  },
  'f1-fansite': {
    id: 'f1-fansite',
    name: 'F1-Fansite Editorial Archive',
    baseUrl: 'https://www.f1-fansite.com',
    dataCategories: ['Track Photography', 'Paddock Atmosphere', 'Session Coverage 2001-Present'],
    accessMethod: 'STATIC_ARCHIVE',
    authenticationRequired: false,
    termsUrl: 'https://www.f1-fansite.com/privacy-policy-f1-fansite-com/',
    allowedUse: 'EDUCATIONAL_NON_COMMERCIAL',
    attributionRequired: true,
    rateLimits: 'Locally indexed JSON dictionary with CDN proxy',
    refreshPolicy: 'Static curated local database',
    historicalCoverage: '2001 to present day Grand Prix sessions',
    liveDataCapability: 'UNAVAILABLE',
    status: 'OPERATIONAL',
    verificationDate: '2024-11-20',
  },
  'fastf1-research': {
    id: 'fastf1-research',
    name: 'FastF1 Python Engineering Library (Offline Reference)',
    baseUrl: 'https://docs.fastf1.dev/',
    dataCategories: ['Telemetry Processing', 'Delta-Time Formulae', 'Sector Split Algorithms'],
    accessMethod: 'REST_JSON',
    authenticationRequired: false,
    termsUrl: 'https://github.com/theOehrly/Fast-F1/blob/master/LICENSE',
    allowedUse: 'PUBLIC_FREE',
    attributionRequired: true,
    rateLimits: 'Offline reference algorithms only',
    refreshPolicy: 'Static algorithms',
    historicalCoverage: '2018 to present',
    liveDataCapability: 'UNAVAILABLE',
    status: 'OPERATIONAL',
    verificationDate: '2024-11-20',
  }
};

class F1SourceRegistryManager {
  private sources: Record<string, F1SourceDefinition> = { ...F1_SOURCES_REGISTRY };
  private healthCache: Record<string, { ok: boolean; pingMs: number; checkedAt: number }> = {};

  getAllSources(): F1SourceDefinition[] {
    return Object.values(this.sources);
  }

  getSource(id: string): F1SourceDefinition | undefined {
    return this.sources[id];
  }

  createProvenance(
    sourceId: string,
    specificPath: string,
    reliability: SourceReliability = 'COMMUNITY_VERIFIED',
    customCitation?: string
  ): SourceProvenance {
    const src = this.sources[sourceId] || this.sources['jolpica-f1'];
    return {
      sourceId: src.id,
      sourceName: src.name,
      sourceUrl: `${src.baseUrl}${specificPath.startsWith('/') ? specificPath : '/' + specificPath}`,
      retrievedAt: new Date().toISOString(),
      license: src.allowedUse,
      licenseUrl: src.termsUrl,
      reliability,
      isOfficialFia: sourceId === 'fia-official',
      citationText: customCitation || `${src.name} — Consultado conforme a ${src.termsUrl}`,
    };
  }

  async checkHealth(sourceId: string): Promise<{ ok: boolean; pingMs: number }> {
    const src = this.sources[sourceId];
    if (!src) return { ok: false, pingMs: 0 };

    const cached = this.healthCache[sourceId];
    if (cached && Date.now() - cached.checkedAt < 300000) { // 5 min cache
      return { ok: cached.ok, pingMs: cached.pingMs };
    }

    const t0 = performance.now();
    try {
      let testUrl = src.baseUrl;
      if (sourceId === 'jolpica-f1') testUrl = `${src.baseUrl}/seasons.json?limit=1`;
      else if (sourceId === 'openf1') testUrl = `${src.baseUrl}/sessions?limit=1`;

      const res = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      const elapsed = Math.round(performance.now() - t0);
      const ok = res.status < 400 || res.type === 'opaque';
      
      this.healthCache[sourceId] = { ok, pingMs: elapsed, checkedAt: Date.now() };
      this.sources[sourceId].lastSynchronized = new Date().toISOString();
      this.sources[sourceId].status = ok ? 'OPERATIONAL' : 'DEGRADED';

      return { ok, pingMs: elapsed };
    } catch (e: any) {
      const elapsed = Math.round(performance.now() - t0);
      this.healthCache[sourceId] = { ok: false, pingMs: elapsed, checkedAt: Date.now() };
      this.sources[sourceId].lastError = e?.message || 'Network check error';
      this.sources[sourceId].status = 'DEGRADED';
      return { ok: false, pingMs: elapsed };
    }
  }
}

export const f1SourceRegistry = new F1SourceRegistryManager();
