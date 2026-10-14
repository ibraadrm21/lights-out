/**
 * Official Formula 1 Constructors Metadata & Logos Registry
 * Covers all active teams, factory liveries, primary/secondary colors and official FOM logo assets.
 */

export interface TeamMeta {
  id: string;
  name: string;
  shortName: string;
  code: string;
  color: string;
  secondaryColor: string;
  logoUrl: string;
  engine: string;
  badgeGlow: string;
}

export const F1_TEAMS_REGISTRY: Record<string, TeamMeta> = {
  mercedes: {
    id: 'mercedes',
    name: 'Mercedes-AMG PETRONAS F1 Team',
    shortName: 'Mercedes',
    code: 'MER',
    color: '#00d2be',
    secondaryColor: '#c0c0c0',
    logoUrl: '/logos/mercedes.png',
    engine: 'Mercedes-AMG M15 E Performance',
    badgeGlow: 'rgba(0, 210, 190, 0.35)',
  },
  ferrari: {
    id: 'ferrari',
    name: 'Scuderia Ferrari HP',
    shortName: 'Ferrari',
    code: 'FER',
    color: '#e80020',
    secondaryColor: '#fff200',
    logoUrl: '/logos/ferrari.png',
    engine: 'Ferrari 066/12',
    badgeGlow: 'rgba(232, 0, 32, 0.4)',
  },
  mclaren: {
    id: 'mclaren',
    name: 'McLaren Formula 1 Team',
    shortName: 'McLaren',
    code: 'MCL',
    color: '#ff8000',
    secondaryColor: '#47c7fc',
    logoUrl: '/logos/mclaren.png',
    engine: 'Mercedes-AMG M15 E Performance',
    badgeGlow: 'rgba(255, 128, 0, 0.4)',
  },
  redbull: {
    id: 'redbull',
    name: 'Oracle Red Bull Racing',
    shortName: 'Red Bull Racing',
    code: 'RBR',
    color: '#3671c6',
    secondaryColor: '#ea1d2d',
    logoUrl: '/logos/redbull.png',
    engine: 'Honda RBPT RBPTH002',
    badgeGlow: 'rgba(54, 113, 198, 0.4)',
  },
  racingbulls: {
    id: 'racingbulls',
    name: 'Visa Cash App RB Formula One Team',
    shortName: 'Racing Bulls',
    code: 'RB',
    color: '#6692ff',
    secondaryColor: '#ffffff',
    logoUrl: '/logos/racingbulls.png',
    engine: 'Honda RBPT RBPTH002',
    badgeGlow: 'rgba(102, 146, 255, 0.35)',
  },
  alpine: {
    id: 'alpine',
    name: 'BWT Alpine F1 Team',
    shortName: 'Alpine',
    code: 'ALP',
    color: '#0093cc',
    secondaryColor: '#ff87bc',
    logoUrl: '/logos/alpine.png',
    engine: 'Renault E-Tech RE24',
    badgeGlow: 'rgba(0, 147, 204, 0.4)',
  },
  haas: {
    id: 'haas',
    name: 'MoneyGram Haas F1 Team',
    shortName: 'Haas F1 Team',
    code: 'HAA',
    color: '#e6002b',
    secondaryColor: '#b6babd',
    logoUrl: '/logos/haas.png',
    engine: 'Ferrari 066/12',
    badgeGlow: 'rgba(230, 0, 43, 0.35)',
  },
  audi: {
    id: 'audi',
    name: 'Audi F1 Team / Kick Sauber',
    shortName: 'Audi',
    code: 'AUD',
    color: '#52e252',
    secondaryColor: '#c0c0c0',
    logoUrl: '/logos/kicksauber.png',
    engine: 'Ferrari / Audi Sport Hybrid',
    badgeGlow: 'rgba(82, 226, 82, 0.4)',
  },
  williams: {
    id: 'williams',
    name: 'Williams Racing',
    shortName: 'Williams',
    code: 'WIL',
    color: '#64c4ff',
    secondaryColor: '#041e42',
    logoUrl: '/logos/williams.png',
    engine: 'Mercedes-AMG M15 E Performance',
    badgeGlow: 'rgba(100, 196, 255, 0.4)',
  },
  astonmartin: {
    id: 'astonmartin',
    name: 'Aston Martin Aramco F1 Team',
    shortName: 'Aston Martin',
    code: 'AMR',
    color: '#229971',
    secondaryColor: '#cedc00',
    logoUrl: '/logos/astonmartin.png',
    engine: 'Mercedes-AMG M15 E Performance',
    badgeGlow: 'rgba(34, 153, 113, 0.4)',
  },
  cadillac: {
    id: 'cadillac',
    name: 'Cadillac Formula 1 Team',
    shortName: 'Cadillac',
    code: 'CAD',
    color: '#c4a052',
    secondaryColor: '#ffffff',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Cadillac_crest.svg/512px-Cadillac_crest.svg.png',
    engine: 'General Motors / TWG Performance',
    badgeGlow: 'rgba(196, 160, 82, 0.45)',
  },
};

/**
 * Normalizes any variation of a team's name to retrieve its official colors, code and logo.
 */
export function getTeamMeta(rawName?: string): TeamMeta {
  if (!rawName) return F1_TEAMS_REGISTRY.ferrari;

  const n = rawName.trim().toLowerCase();

  if (n.includes('mercedes')) return F1_TEAMS_REGISTRY.mercedes;
  if (n.includes('ferrari')) return F1_TEAMS_REGISTRY.ferrari;
  if (n.includes('mclaren')) return F1_TEAMS_REGISTRY.mclaren;
  if (n.includes('red bull') || n.includes('redbull') || n === 'rbr') return F1_TEAMS_REGISTRY.redbull;
  if (n.includes('racing bulls') || n.includes('rb') || n.includes('vcarb') || n.includes('toro rosso') || n.includes('alphatauri')) {
    return F1_TEAMS_REGISTRY.racingbulls;
  }
  if (n.includes('alpine') || n.includes('renault')) return F1_TEAMS_REGISTRY.alpine;
  if (n.includes('haas')) return F1_TEAMS_REGISTRY.haas;
  if (n.includes('audi') || n.includes('sauber') || n.includes('kick') || n.includes('stake') || n.includes('alfa')) {
    return F1_TEAMS_REGISTRY.audi;
  }
  if (n.includes('williams')) return F1_TEAMS_REGISTRY.williams;
  if (n.includes('aston') || n.includes('martin') || n === 'amr') return F1_TEAMS_REGISTRY.astonmartin;
  if (n.includes('cadillac') || n.includes('andretti') || n.includes('gm')) return F1_TEAMS_REGISTRY.cadillac;

  // Generic fallback if not matched
  return {
    id: 'unknown',
    name: rawName,
    shortName: rawName,
    code: rawName.slice(0, 3).toUpperCase(),
    color: '#e10600',
    secondaryColor: '#ffffff',
    logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png.transform/2col-retina/image.png',
    engine: 'FIA Hybrid Power Unit',
    badgeGlow: 'rgba(225, 6, 0, 0.3)',
  };
}
