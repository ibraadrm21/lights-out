export interface F1QuizQuestion {
  id: string;
  category: 'AERODYNAMICS' | 'ENGINES & ERS' | 'HISTORIC GPS' | 'STRATEGY' | 'TELEMETRY';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'ROOKIE' | 'INTERMEDIATE' | 'PRO';
  points: number;
}

export interface F1Driver {
  id: string;
  name: string;
  shortName: string;
  number: number;
  team: string;
  country: string;
  flag: string;
  podiums: number;
  wins: number;
  championships: number;
  debutYear: number;
  image: string;
}

export interface F1TrackCorner {
  id: string;
  trackName: string;
  country: string;
  cornerName: string;
  turnNumber: string;
  lengthKm: number;
  lapRecord: string;
  image: string;
  options: string[];
  correctAnswer: string;
  clue: string;
}

export const F1_CONSTRUCTORS = [
  { name: 'Scuderia Ferrari HP', code: 'FER', color: '#e10600', engine: 'Ferrari 066/12' },
  { name: 'Oracle Red Bull Racing', code: 'RBR', color: '#1e41ff', engine: 'Honda RBPT' },
  { name: 'Mercedes-AMG Petronas', code: 'MER', color: '#00d2be', engine: 'Mercedes-AMG M15' },
  { name: 'McLaren Formula 1 Team', code: 'MCL', color: '#ff8000', engine: 'Mercedes-AMG M15' },
  { name: 'Aston Martin Aramco', code: 'AMR', color: '#229971', engine: 'Mercedes-AMG M15' },
  { name: 'Williams Racing', code: 'WIL', color: '#00a0de', engine: 'Mercedes-AMG M15' },
  { name: 'BWT Alpine F1 Team', code: 'ALP', color: '#ff87bc', engine: 'Renault E-Tech' },
  { name: 'Stake F1 Team Kick Sauber', code: 'SAU', color: '#52e252', engine: 'Ferrari 066/12' },
  { name: 'MoneyGram Haas F1 Team', code: 'HAA', color: '#e6002b', engine: 'Ferrari 066/12' },
  { name: 'Visa Cash App RB', code: 'VCARB', color: '#6692ff', engine: 'Honda RBPT' },
  { name: 'Pirelli Motorsport', code: 'PIR', color: '#fed100', engine: 'Official Tire Supplier' },
];

export const F1_QUIZ_QUESTIONS: F1QuizQuestion[] = [
  {
    id: 'q1',
    category: 'AERODYNAMICS',
    question: '¿Qué fenómeno aerodinámico describe el retorno del "Ground Effect" y causó severas oscilaciones verticales en los monoplazas en 2022?',
    options: ['Porpoising', 'Dirty Air Vortex', 'Slipstream Dissipation', 'Gurney Flap Stall'],
    correctAnswer: 'Porpoising',
    explanation: 'El porpoising ocurre cuando el fondo plano succiona tanto el chasis hacia el asfalto que se produce una pérdida súbita de flujo aerodinámico, elevando y bajando violentamente el coche.',
    difficulty: 'INTERMEDIATE',
    points: 150,
  },
  {
    id: 'q2',
    category: 'ENGINES & ERS',
    question: '¿Cuál es la potencia máxima reglamentaria suministrada por el MGU-K en los motores híbridos V6 turbo actuales?',
    options: ['120 kW (~160 CV)', '160 kW (~215 CV)', '250 kW (~340 CV)', '90 kW (~120 CV)'],
    correctAnswer: '120 kW (~160 CV)',
    explanation: 'El sistema actual limita la entrega del MGU-K a 120 kW (unos 160 caballos de fuerza), aunque en las regulaciones de 2026 aumentará a 350 kW.',
    difficulty: 'PRO',
    points: 200,
  },
  {
    id: 'q3',
    category: 'HISTORIC GPS',
    question: '¿En qué año y trazado consiguió Ayrton Senna su mítica primera vuelta bajo el diluvio adelantando a 4 rivales?',
    options: ['Donington Park 1993 (GP Europa)', 'Monaco 1984', 'Interlagos 1991', 'Estoril 1985'],
    correctAnswer: 'Donington Park 1993 (GP Europa)',
    explanation: 'La vuelta inicial de Senna en Donington Park 1993 bajo lluvia torrencial es considerada por consenso la mejor primera vuelta en la historia de la F1.',
    difficulty: 'ROOKIE',
    points: 100,
  },
  {
    id: 'q4',
    category: 'STRATEGY',
    question: '¿Cuál es el tiempo del récord mundial absoluto de parada en boxes (Pit Stop) en carrera?',
    options: ['1.80 segundos (McLaren)', '1.82 segundos (Red Bull)', '1.91 segundos (Williams)', '1.74 segundos (Ferrari)'],
    correctAnswer: '1.80 segundos (McLaren)',
    explanation: 'McLaren estableció el récord en el GP de Qatar 2023 cambiando los 4 neumáticos a Lando Norris en exactamente 1.80 segundos.',
    difficulty: 'INTERMEDIATE',
    points: 150,
  },
  {
    id: 'q5',
    category: 'TELEMETRY',
    question: '¿Qué curva del calendario genera habitualmente la mayor carga lateral continua (más de 5.2G) en los pilotos?',
    options: ['Curva 8 de Istanbul Park / Pouhon (Spa)', 'Eau Rouge', 'Parabolica (Monza)', '130R (Suzuka)'],
    correctAnswer: 'Curva 8 de Istanbul Park / Pouhon (Spa)',
    explanation: 'Pouhon en Spa y la histórica Curva 8 de Turquía someten el cuello del piloto a fuerzas sostenidas por encima de los 5G durante más de 3 segundos.',
    difficulty: 'PRO',
    points: 200,
  },
  {
    id: 'q6',
    category: 'ENGINES & ERS',
    question: '¿Qué componente del motor híbrido se encarga de recuperar energía térmica del turbocompresor?',
    options: ['MGU-H', 'MGU-K', 'Wastegate Actuator', 'Intercooler Bypass'],
    correctAnswer: 'MGU-H',
    explanation: 'El MGU-H (Motor Generator Unit - Heat) convierte la energía de los gases de escape calientes en electricidad almacenada en la batería.',
    difficulty: 'INTERMEDIATE',
    points: 150,
  },
];

export const F1_DRIVERS: F1Driver[] = [
  {
    id: 'ver',
    name: 'Max Verstappen',
    shortName: 'VER',
    number: 1,
    team: 'Oracle Red Bull Racing',
    country: 'Países Bajos',
    flag: '🇳🇱',
    podiums: 111,
    wins: 63,
    championships: 4,
    debutYear: 2015,
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'ham',
    name: 'Lewis Hamilton',
    shortName: 'HAM',
    number: 44,
    team: 'Scuderia Ferrari HP',
    country: 'Reino Unido',
    flag: '🇬🇧',
    podiums: 201,
    wins: 105,
    championships: 7,
    debutYear: 2007,
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'alo',
    name: 'Fernando Alonso',
    shortName: 'ALO',
    number: 14,
    team: 'Aston Martin Aramco',
    country: 'España',
    flag: '🇪🇸',
    podiums: 106,
    wins: 32,
    championships: 2,
    debutYear: 2001,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'lec',
    name: 'Charles Leclerc',
    shortName: 'LEC',
    number: 16,
    team: 'Scuderia Ferrari HP',
    country: 'Mónaco',
    flag: '🇲🇨',
    podiums: 42,
    wins: 8,
    championships: 0,
    debutYear: 2018,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'nor',
    name: 'Lando Norris',
    shortName: 'NOR',
    number: 4,
    team: 'McLaren Formula 1 Team',
    country: 'Reino Unido',
    flag: '🇬🇧',
    podiums: 28,
    wins: 4,
    championships: 0,
    debutYear: 2019,
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'pia',
    name: 'Oscar Piastri',
    shortName: 'PIA',
    number: 81,
    team: 'McLaren Formula 1 Team',
    country: 'Australia',
    flag: '🇦🇺',
    podiums: 10,
    wins: 2,
    championships: 0,
    debutYear: 2023,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'rus',
    name: 'George Russell',
    shortName: 'RUS',
    number: 63,
    team: 'Mercedes-AMG Petronas',
    country: 'Reino Unido',
    flag: '🇬🇧',
    podiums: 15,
    wins: 3,
    championships: 0,
    debutYear: 2019,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'sai',
    name: 'Carlos Sainz Jr.',
    shortName: 'SAI',
    number: 55,
    team: 'Williams Racing',
    country: 'España',
    flag: '🇪🇸',
    podiums: 25,
    wins: 4,
    championships: 0,
    debutYear: 2015,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
  },
];

export const F1_TRACK_CORNERS: F1TrackCorner[] = [
  {
    id: 'c1',
    trackName: 'Circuit de Spa-Francorchamps',
    country: 'Bélgica',
    cornerName: 'Eau Rouge & Raidillon',
    turnNumber: 'Turns 2, 3 & 4',
    lengthKm: 7.004,
    lapRecord: '1:41.252 (Hamilton, 2020)',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
    options: ['Eau Rouge / Raidillon', '130R', 'Curva Parabolica', 'Maggotts-Becketts'],
    correctAnswer: 'Eau Rouge / Raidillon',
    clue: 'La legendaria compresión cuesta arriba donde los monoplazas tocan fondo a más de 300 km/h antes de la recta de Kemmel.',
  },
  {
    id: 'c2',
    trackName: 'Autodromo Nazionale Monza',
    country: 'Italia',
    cornerName: 'Curva Alboreto (Parabolica)',
    turnNumber: 'Turn 11',
    lengthKm: 5.793,
    lapRecord: '1:18.887 (Hamilton, 2020)',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1200&auto=format&fit=crop',
    options: ['Curva Grande', 'Variante del Rettifilo', 'Curva Alboreto (Parabolica)', 'Lesmo 2'],
    correctAnswer: 'Curva Alboreto (Parabolica)',
    clue: 'El curvón final de altísima velocidad que desemboca en la recta principal del Templo de la Velocidad.',
  },
  {
    id: 'c3',
    trackName: 'Silverstone Circuit',
    country: 'Reino Unido',
    cornerName: 'Maggotts & Becketts',
    turnNumber: 'Turns 10-13',
    lengthKm: 5.891,
    lapRecord: '1:27.097 (Verstappen, 2020)',
    image: 'https://images.unsplash.com/photo-1541348263662-e0c86437da7b?q=80&w=1200&auto=format&fit=crop',
    options: ['Copse', 'Stowe', 'Maggotts & Becketts', 'Club Corner'],
    correctAnswer: 'Maggotts & Becketts',
    clue: 'La secuencia ultrarrápida de eses donde el flujo aerodinámico y los alerones se ponen al límite absoluto.',
  },
  {
    id: 'c4',
    trackName: 'Circuit de Monaco',
    country: 'Mónaco',
    cornerName: 'Fairmont / Loews Hairpin',
    turnNumber: 'Turn 6',
    lengthKm: 3.337,
    lapRecord: '1:12.909 (Hamilton, 2021)',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop',
    options: ['Sainte Dévote', 'Fairmont / Loews Hairpin', 'Tabac', 'Swimming Pool Chicane'],
    correctAnswer: 'Fairmont / Loews Hairpin',
    clue: 'La curva más lenta de todo el campeonato del mundo, negociada a menos de 50 km/h con bloqueo máximo de dirección.',
  },
  {
    id: 'c5',
    trackName: 'Suzuka International Racing Course',
    country: 'Japón',
    cornerName: '130R',
    turnNumber: 'Turn 15',
    lengthKm: 5.807,
    lapRecord: '1:30.983 (Hamilton, 2019)',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    options: ['Degner 1', '130R', 'S-Curves', 'Spoon Curve'],
    correctAnswer: '130R',
    clue: 'Un viraje a izquierdas de radio 130 metros que los pilotos abordan con el acelerador a fondo a más de 310 km/h.',
  },
];

export const F1_LEADERBOARD = [
  { rank: 1, name: 'ApexHunter_99', title: 'World Champion', points: 14850, accuracy: '96.4%', bestLap: '1:18.2' },
  { rank: 2, name: 'SennaGhost', title: 'Grand Prix Winner', points: 13920, accuracy: '94.8%', bestLap: '1:18.9' },
  { rank: 3, name: 'TelemetryPro', title: 'Podium Regular', points: 12400, accuracy: '92.1%', bestLap: '1:19.4' },
  { rank: 4, name: 'MonzaSlipstream', title: 'Pole Sitter', points: 11150, accuracy: '89.5%', bestLap: '1:19.8' },
  { rank: 5, name: 'VortexDownforce', title: 'Test Driver', points: 9800, accuracy: '87.0%', bestLap: '1:20.3' },
  { rank: 6, name: 'EauRougeFlatout', title: 'Paddock Rookie', points: 8450, accuracy: '85.2%', bestLap: '1:20.9' },
];
