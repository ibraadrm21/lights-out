/**
 * Real F1 Circuit Vector Profiles
 * Standardized SVG coordinates (viewBox 0 0 500 320)
 * Continuous loop paths representing authentic circuit geometry
 * Includes DRS zones, sector splits (progress fractions 0.0-1.0), and corner coordinates
 */

export interface CircuitVectorProfile {
  id: string;
  name: string;
  officialName: string;
  country: string;
  flag: string;
  turns: number;
  lengthKm: number;
  viewBox: string;
  pathD: string;
  startFinishPoint: { x: number; y: number; textX: number; textY: number };
  sectors: {
    s1End: number; // e.g. 0.32
    s2End: number; // e.g. 0.67
  };
  drsZones: {
    zoneNumber: number;
    name: string;
    detectionProgress: number; // progress on lap 0.0 to 1.0
    activationStart: number;
    activationEnd: number;
    deltaAdvantageSeconds: number; // pace bonus per lap (~0.35s)
  }[];
  keyCorners: { name: string; number: number; progress: number }[];
}

export const CIRCUIT_VECTOR_PROFILES: Record<string, CircuitVectorProfile> = {
  // 1. Circuit de Barcelona-Catalunya (Montmeló)
  // Characterized by long start/finish straight, Turn 1-2 chicane, long sweeping Renault curve T3, Repsol T4, Seat T5, Campsa T9, and final stadium section
  'catalunya-undercut': {
    id: 'catalunya-undercut',
    name: 'Barcelona-Catalunya',
    officialName: 'Circuit de Barcelona-Catalunya',
    country: 'España',
    flag: '🇪🇸',
    turns: 14,
    lengthKm: 4.657,
    viewBox: '0 0 500 320',
    // Continuous loop: Straight, Elf (T1-2), Renault (T3), Repsol (T4), Seat (T5), Moreneta (T7-8), Campsa (T9), Back straight, La Caixa (T10), Europcar (T12), New sweeping final corner (T13-14)
    pathD: `
      M 160,285
      L 390,285
      C 410,285 435,280 445,260
      C 455,240 445,215 425,205
      L 380,185
      C 360,175 350,150 365,130
      C 380,110 410,120 430,95
      C 445,75 435,45 405,40
      L 310,35
      C 285,35 270,55 260,75
      L 245,110
      C 235,130 215,140 190,140
      L 130,140
      C 105,140 90,160 90,185
      C 90,210 110,230 135,240
      L 170,250
      C 185,255 190,270 180,280
      C 175,285 168,285 160,285
      Z
    `.replace(/\s+/g, ' ').trim(),
    startFinishPoint: { x: 260, y: 285, textX: 260, textY: 308 },
    sectors: {
      s1End: 0.31,
      s2End: 0.68,
    },
    drsZones: [
      {
        zoneNumber: 1,
        name: 'Recta Principal (Main Straight)',
        detectionProgress: 0.94,
        activationStart: 0.97,
        activationEnd: 0.12,
        deltaAdvantageSeconds: 0.38,
      },
      {
        zoneNumber: 2,
        name: 'Recta Trasera (Back Straight T9-T10)',
        detectionProgress: 0.52,
        activationStart: 0.55,
        activationEnd: 0.65,
        deltaAdvantageSeconds: 0.28,
      }
    ],
    keyCorners: [
      { name: 'Curva 1 (Elf)', number: 1, progress: 0.14 },
      { name: 'Curva 3 (Renault)', number: 3, progress: 0.22 },
      { name: 'Curva 5 (Seat)', number: 5, progress: 0.40 },
      { name: 'Curva 9 (Campsa)', number: 9, progress: 0.53 },
      { name: 'Curva 10 (La Caixa)', number: 10, progress: 0.66 },
      { name: 'Curva 14 (Catalunya)', number: 14, progress: 0.92 },
    ]
  },

  // 2. Silverstone Circuit
  // Characterized by Copse (T9), Maggotts, Becketts, Chapel (T10-13), Hangar Straight, Stowe (T15), Vale, Club (T16-18), Abbey, Farm, Village (T1-3)
  'silverstone-rain': {
    id: 'silverstone-rain',
    name: 'Silverstone Circuit',
    officialName: 'Silverstone Circuit',
    country: 'Reino Unido',
    flag: '🇬🇧',
    turns: 18,
    lengthKm: 5.891,
    viewBox: '0 0 500 320',
    pathD: `
      M 160,220
      L 240,220
      C 265,220 280,205 285,185
      L 295,145
      C 300,125 320,115 340,125
      L 380,145
      C 400,155 425,145 435,125
      L 450,90
      C 460,70 445,45 420,40
      L 330,35
      C 300,35 270,55 250,75
      L 210,115
      C 195,130 170,135 150,130
      L 90,115
      C 65,110 45,130 50,155
      L 65,200
      C 75,230 105,250 135,245
      L 155,240
      C 165,235 165,225 160,220
      Z
    `.replace(/\s+/g, ' ').trim(),
    startFinishPoint: { x: 200, y: 220, textX: 200, textY: 242 },
    sectors: {
      s1End: 0.28,
      s2End: 0.65,
    },
    drsZones: [
      {
        zoneNumber: 1,
        name: 'Wellington Straight',
        detectionProgress: 0.18,
        activationStart: 0.21,
        activationEnd: 0.32,
        deltaAdvantageSeconds: 0.36,
      },
      {
        zoneNumber: 2,
        name: 'Hangar Straight (Chapel to Stowe)',
        detectionProgress: 0.60,
        activationStart: 0.63,
        activationEnd: 0.77,
        deltaAdvantageSeconds: 0.42,
      }
    ],
    keyCorners: [
      { name: 'Abbey', number: 1, progress: 0.05 },
      { name: 'Copse', number: 9, progress: 0.45 },
      { name: 'Maggotts & Becketts', number: 11, progress: 0.52 },
      { name: 'Stowe', number: 15, progress: 0.76 },
      { name: 'Club Corner', number: 18, progress: 0.95 },
    ]
  },

  // 3. Autodromo Nazionale Monza
  // The Temple of Speed: Rettifilo Chicane (T1-2), Curva Grande (T3), Roggia (T4-5), Lesmo 1 & 2 (T6-7), Serraglio, Ascari (T8-10), Back straight, Parabolica / Curva Alboreto (T11)
  'monza-onestop': {
    id: 'monza-onestop',
    name: 'Monza',
    officialName: 'Autodromo Nazionale Monza',
    country: 'Italia',
    flag: '🇮🇹',
    turns: 11,
    lengthKm: 5.793,
    viewBox: '0 0 500 320',
    pathD: `
      M 90,260
      L 340,260
      C 370,260 395,245 405,220
      L 435,150
      C 445,120 430,85 400,75
      C 370,65 330,75 310,95
      L 295,110
      C 285,120 265,115 255,100
      L 240,75
      C 230,60 210,55 190,60
      L 140,75
      C 115,85 105,110 115,130
      L 135,165
      C 145,185 135,210 115,220
      L 85,235
      C 65,245 65,260 90,260
      Z
    `.replace(/\s+/g, ' ').trim(),
    startFinishPoint: { x: 210, y: 260, textX: 210, textY: 282 },
    sectors: {
      s1End: 0.35,
      s2End: 0.70,
    },
    drsZones: [
      {
        zoneNumber: 1,
        name: 'Rettifilo (Main Straight to T1)',
        detectionProgress: 0.92,
        activationStart: 0.95,
        activationEnd: 0.15,
        deltaAdvantageSeconds: 0.45,
      },
      {
        zoneNumber: 2,
        name: 'Serraglio (Curva del Serraglio to Ascari)',
        detectionProgress: 0.48,
        activationStart: 0.51,
        activationEnd: 0.64,
        deltaAdvantageSeconds: 0.35,
      }
    ],
    keyCorners: [
      { name: 'Variante del Rettifilo', number: 1, progress: 0.16 },
      { name: 'Curva Grande', number: 3, progress: 0.28 },
      { name: 'Variante della Roggia', number: 4, progress: 0.42 },
      { name: 'Curva di Lesmo 1 & 2', number: 6, progress: 0.52 },
      { name: 'Variante Ascari', number: 8, progress: 0.72 },
      { name: 'Curva Parabolica (Alboreto)', number: 11, progress: 0.88 },
    ]
  }
};

export function getCircuitProfile(scenarioId: string): CircuitVectorProfile {
  return CIRCUIT_VECTOR_PROFILES[scenarioId] || CIRCUIT_VECTOR_PROFILES['catalunya-undercut'];
}
