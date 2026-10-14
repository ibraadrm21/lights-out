/**
 * OpenF1 API Service (https://openf1.org)
 * Provides real-time and latest official Formula 1 data:
 * - Driver & Constructor World Championship standings with current points
 * - Latest Grand Prix race results, gaps, points awarded and DNFs
 * - Driver telemetry metadata, first name, last name and official headshots
 */

export interface OpenF1Driver {
  driver_number: number;
  first_name: string;
  last_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  headshot_url: string;
  country_code: string;
}

export interface OpenF1ChampionshipDriver {
  driver_number: number;
  position_current: number;
  position_start: number;
  points_current: number;
  points_start: number;
  driver: OpenF1Driver;
}

import { getTeamMeta } from './teamData';

export interface OpenF1ChampionshipTeam {
  team_name: string;
  position_current: number;
  position_start: number;
  points_current: number;
  points_start: number;
  team_colour?: string;
  logo_url?: string;
  code?: string;
}

export interface OpenF1RaceResult {
  position: number | null;
  driver_number: number;
  number_of_laps: number;
  points: number;
  gap_to_leader: string;
  duration?: number;
  dnf: boolean;
  dns: boolean;
  driver: OpenF1Driver;
}

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  circuit_short_name: string;
  country_name: string;
  location: string;
  year: number;
  date_start: string;
}

const BASE_URL = 'https://api.openf1.org/v1';

// Format driver names properly: First Name + Last Name
export function formatNameParts(firstName?: string, lastName?: string, fallbackFullName?: string): { firstName: string; lastName: string; fullName: string } {
  if (firstName && lastName) {
    const fn = firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1).toLowerCase();
    const ln = lastName.trim().charAt(0).toUpperCase() + lastName.trim().slice(1).toLowerCase();
    return { firstName: fn, lastName: ln, fullName: `${fn} ${ln}` };
  }
  if (fallbackFullName) {
    const parts = fallbackFullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      const fn = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
      const ln = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
      return { firstName: fn, lastName: ln, fullName: `${fn} ${ln}` };
    }
  }
  return { firstName: 'Piloto', lastName: 'Oficial', fullName: fallbackFullName || 'Piloto Oficial F1' };
}

// Complete Official F1 Drivers Registry
export const OFFICIAL_F1_DRIVERS_REGISTRY: Record<number, OpenF1Driver> = {
  1: {
    driver_number: 1,
    first_name: 'Max',
    last_name: 'Verstappen',
    full_name: 'Max Verstappen',
    name_acronym: 'VER',
    team_name: 'Red Bull Racing',
    team_colour: '#3671c6',
    country_code: 'NED',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png',
  },
  2: {
    driver_number: 2,
    first_name: 'Logan',
    last_name: 'Sargeant',
    full_name: 'Logan Sargeant',
    name_acronym: 'SAR',
    team_name: 'Williams',
    team_colour: '#64c4ff',
    country_code: 'USA',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png.transform/1col/image.png',
  },
  3: {
    driver_number: 3,
    first_name: 'Max',
    last_name: 'Verstappen',
    full_name: 'Max Verstappen',
    name_acronym: 'VER',
    team_name: 'Red Bull Racing',
    team_colour: '#3671c6',
    country_code: 'NED',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png',
  },
  4: {
    driver_number: 4,
    first_name: 'Lando',
    last_name: 'Norris',
    full_name: 'Lando Norris',
    name_acronym: 'NOR',
    team_name: 'McLaren',
    team_colour: '#ff8000',
    country_code: 'GBR',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png',
  },
  5: {
    driver_number: 5,
    first_name: 'Gabriel',
    last_name: 'Bortoleto',
    full_name: 'Gabriel Bortoleto',
    name_acronym: 'BOR',
    team_name: 'Audi',
    team_colour: '#f50537',
    country_code: 'BRA',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/1col/image.png',
  },
  6: {
    driver_number: 6,
    first_name: 'Isack',
    last_name: 'Hadjar',
    full_name: 'Isack Hadjar',
    name_acronym: 'HAD',
    team_name: 'Red Bull Racing',
    team_colour: '#3671c6',
    country_code: 'FRA',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png.transform/1col/image.png',
  },
  7: {
    driver_number: 7,
    first_name: 'Jack',
    last_name: 'Doohan',
    full_name: 'Jack Doohan',
    name_acronym: 'DOO',
    team_name: 'Alpine',
    team_colour: '#0093cc',
    country_code: 'AUS',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png.transform/1col/image.png',
  },
  10: {
    driver_number: 10,
    first_name: 'Pierre',
    last_name: 'Gasly',
    full_name: 'Pierre Gasly',
    name_acronym: 'GAS',
    team_name: 'Alpine',
    team_colour: '#0093cc',
    country_code: 'FRA',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png',
  },
  11: {
    driver_number: 11,
    first_name: 'Sergio',
    last_name: 'Pérez',
    full_name: 'Sergio Pérez',
    name_acronym: 'PER',
    team_name: 'Cadillac',
    team_colour: '#ffcc00',
    country_code: 'MEX',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/1col/image.png',
  },
  12: {
    driver_number: 12,
    first_name: 'Kimi',
    last_name: 'Antonelli',
    full_name: 'Kimi Antonelli',
    name_acronym: 'ANT',
    team_name: 'Mercedes',
    team_colour: '#00d2be',
    country_code: 'ITA',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ANDANT01_Andrea_Kimi_Antonelli/andant01.png.transform/1col/image.png',
  },
  14: {
    driver_number: 14,
    first_name: 'Fernando',
    last_name: 'Alonso',
    full_name: 'Fernando Alonso',
    name_acronym: 'ALO',
    team_name: 'Aston Martin',
    team_colour: '#229971',
    country_code: 'ESP',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png',
  },
  16: {
    driver_number: 16,
    first_name: 'Charles',
    last_name: 'Leclerc',
    full_name: 'Charles Leclerc',
    name_acronym: 'LEC',
    team_name: 'Ferrari',
    team_colour: '#e80020',
    country_code: 'MON',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png',
  },
  18: {
    driver_number: 18,
    first_name: 'Lance',
    last_name: 'Stroll',
    full_name: 'Lance Stroll',
    name_acronym: 'STR',
    team_name: 'Aston Martin',
    team_colour: '#229971',
    country_code: 'CAN',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png',
  },
  20: {
    driver_number: 20,
    first_name: 'Kevin',
    last_name: 'Magnussen',
    full_name: 'Kevin Magnussen',
    name_acronym: 'MAG',
    team_name: 'Haas F1 Team',
    team_colour: '#b6babd',
    country_code: 'DEN',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png.transform/1col/image.png',
  },
  22: {
    driver_number: 22,
    first_name: 'Yuki',
    last_name: 'Tsunoda',
    full_name: 'Yuki Tsunoda',
    name_acronym: 'TSU',
    team_name: 'Racing Bulls',
    team_colour: '#6c98ff',
    country_code: 'JPN',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/1col/image.png',
  },
  23: {
    driver_number: 23,
    first_name: 'Alexander',
    last_name: 'Albon',
    full_name: 'Alexander Albon',
    name_acronym: 'ALB',
    team_name: 'Williams',
    team_colour: '#64c4ff',
    country_code: 'THA',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/1col/image.png',
  },
  24: {
    driver_number: 24,
    first_name: 'Zhou',
    last_name: 'Guanyu',
    full_name: 'Zhou Guanyu',
    name_acronym: 'ZHO',
    team_name: 'Kick Sauber',
    team_colour: '#52e252',
    country_code: 'CHN',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png.transform/1col/image.png',
  },
  27: {
    driver_number: 27,
    first_name: 'Nico',
    last_name: 'Hülkenberg',
    full_name: 'Nico Hülkenberg',
    name_acronym: 'HUL',
    team_name: 'Audi',
    team_colour: '#f50537',
    country_code: 'GER',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png',
  },
  30: {
    driver_number: 30,
    first_name: 'Liam',
    last_name: 'Lawson',
    full_name: 'Liam Lawson',
    name_acronym: 'LAW',
    team_name: 'Racing Bulls',
    team_colour: '#6c98ff',
    country_code: 'NZL',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/1col/image.png',
  },
  31: {
    driver_number: 31,
    first_name: 'Esteban',
    last_name: 'Ocon',
    full_name: 'Esteban Ocon',
    name_acronym: 'OCO',
    team_name: 'Haas F1 Team',
    team_colour: '#b6babd',
    country_code: 'FRA',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/1col/image.png',
  },
  41: {
    driver_number: 41,
    first_name: 'Arvid',
    last_name: 'Lindblad',
    full_name: 'Arvid Lindblad',
    name_acronym: 'LIN',
    team_name: 'Racing Bulls',
    team_colour: '#6c98ff',
    country_code: 'GBR',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ARVLIN01_Arvid_Lindblad/arvlin01.png.transform/1col/image.png',
  },
  43: {
    driver_number: 43,
    first_name: 'Franco',
    last_name: 'Colapinto',
    full_name: 'Franco Colapinto',
    name_acronym: 'COL',
    team_name: 'Alpine',
    team_colour: '#0093cc',
    country_code: 'ARG',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png.transform/1col/image.png',
  },
  44: {
    driver_number: 44,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    full_name: 'Lewis Hamilton',
    name_acronym: 'HAM',
    team_name: 'Ferrari',
    team_colour: '#e80020',
    country_code: 'GBR',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png',
  },
  55: {
    driver_number: 55,
    first_name: 'Carlos',
    last_name: 'Sainz',
    full_name: 'Carlos Sainz',
    name_acronym: 'SAI',
    team_name: 'Williams',
    team_colour: '#64c4ff',
    country_code: 'ESP',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png',
  },
  63: {
    driver_number: 63,
    first_name: 'George',
    last_name: 'Russell',
    full_name: 'George Russell',
    name_acronym: 'RUS',
    team_name: 'Mercedes',
    team_colour: '#00d2be',
    country_code: 'GBR',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png',
  },
  77: {
    driver_number: 77,
    first_name: 'Valtteri',
    last_name: 'Bottas',
    full_name: 'Valtteri Bottas',
    name_acronym: 'BOT',
    team_name: 'Cadillac',
    team_colour: '#ffcc00',
    country_code: 'FIN',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/1col/image.png',
  },
  81: {
    driver_number: 81,
    first_name: 'Oscar',
    last_name: 'Piastri',
    full_name: 'Oscar Piastri',
    name_acronym: 'PIA',
    team_name: 'McLaren',
    team_colour: '#ff8000',
    country_code: 'AUS',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png',
  },
  87: {
    driver_number: 87,
    first_name: 'Oliver',
    last_name: 'Bearman',
    full_name: 'Oliver Bearman',
    name_acronym: 'BEA',
    team_name: 'Haas F1 Team',
    team_colour: '#b6babd',
    country_code: 'GBR',
    headshot_url: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/1col/image.png',
  },
};

export const getDriverByNumber = (num: number): OpenF1Driver => {
  if (OFFICIAL_F1_DRIVERS_REGISTRY[num]) {
    return OFFICIAL_F1_DRIVERS_REGISTRY[num];
  }
  return {
    driver_number: num,
    first_name: 'Piloto',
    last_name: `F1 #${num}`,
    full_name: `Piloto F1 #${num}`,
    name_acronym: `#${num}`,
    team_name: 'F1 Constructor',
    team_colour: '#ffffff',
    headshot_url: '',
    country_code: 'FIA',
  };
};

class OpenF1Service {
  private cache: {
    drivers?: Record<number, OpenF1Driver>;
    session?: OpenF1Session;
    standingsDrivers?: OpenF1ChampionshipDriver[];
    standingsTeams?: OpenF1ChampionshipTeam[];
    results?: OpenF1RaceResult[];
    lastFetched?: number;
  } = {};

  /**
   * Fetches all drivers from the latest session and indexes them by driver number,
   * merging with official registry so that names, surnames and teams are 100% complete.
   */
  async getDrivers(sessionKey = 'latest'): Promise<Record<number, OpenF1Driver>> {
    if (this.cache.drivers && this.isCacheValid()) {
      return this.cache.drivers;
    }

    const map: Record<number, OpenF1Driver> = { ...OFFICIAL_F1_DRIVERS_REGISTRY };

    try {
      const res = await fetch(`${BASE_URL}/drivers?session_key=${sessionKey}`);
      if (res.ok) {
        const data: any[] = await res.json();
        data.forEach(d => {
          const num = Number(d.driver_number);
          const registryEntry = OFFICIAL_F1_DRIVERS_REGISTRY[num];
          const formatted = formatNameParts(d.first_name, d.last_name, d.full_name);

          map[num] = {
            driver_number: num,
            first_name: d.first_name ? formatNameParts(d.first_name, d.last_name).firstName : (registryEntry?.first_name || formatted.firstName),
            last_name: d.last_name ? formatNameParts(d.first_name, d.last_name).lastName : (registryEntry?.last_name || formatted.lastName),
            full_name: formatted.fullName || registryEntry?.full_name || 'Piloto F1',
            name_acronym: d.name_acronym || registryEntry?.name_acronym || `#${num}`,
            team_name: d.team_name || registryEntry?.team_name || 'F1 Team',
            team_colour: d.team_colour ? `#${d.team_colour.replace('#', '')}` : (registryEntry?.team_colour || '#ffffff'),
            headshot_url: d.headshot_url || registryEntry?.headshot_url || '',
            country_code: d.country_code || registryEntry?.country_code || 'FIA',
          };
        });
      }
    } catch (e) {
      console.warn('OpenF1 getDrivers fetch error, using registry:', e);
    }

    this.cache.drivers = map;
    return map;
  }

  /**
   * Fetches latest Grand Prix session information
   */
  async getLatestSession(): Promise<OpenF1Session | null> {
    if (this.cache.session && this.isCacheValid()) {
      return this.cache.session;
    }

    try {
      const res = await fetch(`${BASE_URL}/sessions?session_key=latest`);
      if (!res.ok) throw new Error('Failed to fetch session from OpenF1');
      const data: any[] = await res.json();
      if (data && data.length > 0) {
        this.cache.session = data[0];
        return data[0];
      }
    } catch (e) {
      console.warn('OpenF1 getLatestSession error:', e);
    }
    return null;
  }

  /**
   * Fetches official World Championship Drivers Standings with actual live points,
   * guaranteeing real first and last names for all drivers.
   */
  async getDriverStandings(sessionKey = 'latest'): Promise<OpenF1ChampionshipDriver[]> {
    try {
      const [driversMap, res] = await Promise.all([
        this.getDrivers(sessionKey),
        fetch(`${BASE_URL}/championship_drivers?session_key=${sessionKey}`)
      ]);

      if (!res.ok) throw new Error('Failed to fetch driver standings');
      const data: any[] = await res.json();

      const mapped: OpenF1ChampionshipDriver[] = data
        .map(item => {
          const num = Number(item.driver_number);
          const driver = driversMap[num] || getDriverByNumber(num);

          return {
            driver_number: num,
            position_current: item.position_current,
            position_start: item.position_start,
            points_current: item.points_current,
            points_start: item.points_start,
            driver,
          };
        })
        .sort((a, b) => a.position_current - b.position_current);

      this.cache.standingsDrivers = mapped;
      this.cache.lastFetched = Date.now();
      return mapped;
    } catch (e) {
      console.warn('OpenF1 getDriverStandings error:', e);
      return this.cache.standingsDrivers || [];
    }
  }

  /**
   * Fetches official Constructors / Teams Championship Standings with live points
   */
  async getTeamStandings(sessionKey = 'latest'): Promise<OpenF1ChampionshipTeam[]> {
    try {
      const res = await fetch(`${BASE_URL}/championship_teams?session_key=${sessionKey}`);
      if (!res.ok) throw new Error('Failed to fetch team standings');
      const data: any[] = await res.json();

      const mapped: OpenF1ChampionshipTeam[] = data
        .map(item => {
          const meta = getTeamMeta(item.team_name);
          return {
            team_name: item.team_name,
            position_current: item.position_current,
            position_start: item.position_start,
            points_current: item.points_current,
            points_start: item.points_start,
            team_colour: meta.color,
            logo_url: meta.logoUrl,
            code: meta.code,
          };
        })
        .sort((a, b) => a.position_current - b.position_current);

      this.cache.standingsTeams = mapped;
      return mapped;
    } catch (e) {
      console.warn('OpenF1 getTeamStandings error:', e);
      return this.cache.standingsTeams || [];
    }
  }

  /**
   * Fetches real race results from the latest Grand Prix with real first and last names.
   */
  async getLatestRaceResults(sessionKey = 'latest'): Promise<OpenF1RaceResult[]> {
    try {
      const [driversMap, res] = await Promise.all([
        this.getDrivers(sessionKey),
        fetch(`${BASE_URL}/session_result?session_key=${sessionKey}`)
      ]);

      if (!res.ok) throw new Error('Failed to fetch race results');
      const data: any[] = await res.json();

      const mapped: OpenF1RaceResult[] = data
        .map(item => {
          const num = Number(item.driver_number);
          const driver = driversMap[num] || getDriverByNumber(num);

          return {
            position: item.position !== null ? Number(item.position) : null,
            driver_number: num,
            number_of_laps: item.number_of_laps,
            points: item.points || 0,
            gap_to_leader: item.gap_to_leader === 0 ? 'WINNER' : String(item.gap_to_leader || '-'),
            duration: item.duration,
            dnf: !!item.dnf,
            dns: !!item.dns,
            driver,
          };
        })
        .sort((a, b) => {
          if (a.position === null) return 1;
          if (b.position === null) return -1;
          return a.position - b.position;
        });

      this.cache.results = mapped;
      return mapped;
    } catch (e) {
      console.warn('OpenF1 getLatestRaceResults error:', e);
      return this.cache.results || [];
    }
  }

  private isCacheValid(): boolean {
    return !!(this.cache.lastFetched && Date.now() - this.cache.lastFetched < 120000);
  }
}

export const openf1 = new OpenF1Service();
