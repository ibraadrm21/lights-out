import f1PhotosData from '../f1_photos.json';

export type F1SessionPhotoType = 'race' | 'qualy' | 'practice' | 'supplementary';

export interface F1GrandPrixPhotos {
  race: string[];
  qualy: string[];
  practice: string[];
  supplementary: string[];
}

export const f1Photos = f1PhotosData as Record<string, F1GrandPrixPhotos>;

/**
 * Normaliza y proxifica URLs externas (Wikimedia o F1-Fansite) para garantizar
 * que se muestren en cualquier navegador eludiendo bloqueos de hotlink y restricciones 403.
 */
export const getProxiedImageUrl = (rawUrl: string, width?: number): string => {
  if (!rawUrl) return '';

  // Limpiar posibles parámetros de tracking de Wikimedia
  const cleanUrl = rawUrl.split('?')[0];

  // Si ya viene de wsrv.nl, devolver
  if (cleanUrl.includes('wsrv.nl')) return cleanUrl;

  // URLs de Wikimedia Commons / Wikipedia
  if (cleanUrl.includes('upload.wikimedia.org') || cleanUrl.includes('commons.wikimedia.org')) {
    const stripped = cleanUrl.replace(/^https?:\/\//, '');
    return width 
      ? `https://wsrv.nl/?url=${encodeURIComponent(stripped)}&w=${width}&fit=cover`
      : `https://wsrv.nl/?url=${encodeURIComponent(stripped)}`;
  }

  // URLs de f1-fansite.com
  if (cleanUrl.includes('f1-fansite.com')) {
    const stripped = cleanUrl.replace(/^https?:\/\//, '');
    return width
      ? `https://wsrv.nl/?url=${encodeURIComponent(stripped)}&w=${width}&fit=cover`
      : `https://wsrv.nl/?url=${encodeURIComponent(stripped)}`;
  }

  return rawUrl;
};

export const getHashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const FALLBACK_F1_PHOTOS: Record<F1SessionPhotoType, string[]> = {
  race: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200'
  ],
  qualy: [
    'https://images.unsplash.com/photo-1610996841285-d8cf01b97bb4?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=600'
  ],
  practice: [
    'https://images.unsplash.com/photo-1605558190877-f273297a7e8e?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600'
  ],
  supplementary: [
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400'
  ]
};

export const GP_KEYWORD_MAP: Record<string, string[]> = {
  'bahrain': ['bahrain', 'sakhir'],
  'saudi-arabia': ['saudi', 'jeddah'],
  'australian': ['melbourne', 'australia', 'albert-park', 'albert park'],
  'japanese': ['suzuka', 'japan', 'japanese'],
  'chinese': ['shanghai', 'china', 'chinese'],
  'miami': ['miami'],
  'emilia-romagna': ['imola', 'emilia', 'romagna', 'san-marino', 'san marino'],
  'monaco': ['monaco', 'monte-carlo', 'monte carlo'],
  'canadian': ['montreal', 'canada', 'canadian', 'gilles-villeneuve', 'gilles villeneuve'],
  'spanish': ['barcelona', 'spain', 'spanish', 'catalunya'],
  'austrian': ['spielberg', 'austria', 'austrian', 'red-bullring', 'red-bull-ring', 'red bull ring'],
  'british': ['silverstone', 'britain', 'british', 'great britain'],
  'hungarian': ['budapest', 'hungaroring', 'hungarian', 'hungary'],
  'belgian': ['spa', 'belgium', 'belgian', 'francorchamps'],
  'dutch': ['zandvoort', 'netherlands', 'dutch'],
  'italian': ['monza', 'italy', 'italian'],
  'azerbaijan': ['baku', 'azerbaijan'],
  'singapore': ['singapore', 'marina-bay', 'marina bay'],
  'united-states': ['austin', 'cota', 'america', 'united-states', 'united states', 'us-gp', 'us-grand-prix', 'indianapolis', 'us'],
  'mexican': ['mexico', 'mexican', 'hermanos-rodriguez', 'hermanos rodriguez'],
  'sao-paulo': ['sao-paulo', 'sao paulo', 'brazil', 'brazilian', 'interlagos'],
  'las-vegas': ['las-vegas', 'las vegas', 'vegas'],
  'qatar': ['lusail', 'qatar'],
  'abu-dhabi': ['abu-dhabi', 'abu dhabi', 'yas-marina', 'yas marina'],
  'german': ['german', 'germany', 'hockenheim', 'nurburgring'],
  'malaysian': ['sepang', 'malaysia', 'malaysian'],
  'turkish': ['istanbul', 'turkey', 'turkish'],
  'french': ['magny-cours', 'france', 'french', 'paul-ricard', 'paul ricard'],
  'european': ['european', 'valencia', 'nurburgring'],
  'korean': ['korea', 'korean', 'yeongam'],
  'indian': ['india', 'indian', 'buddh'],
  'russian': ['sochi', 'russia', 'russian'],
  'portuguese': ['portugal', 'portuguese', 'portimao', 'algarve', 'estoril']
};

/**
 * 24 mapas vectoriales oficiales procedentes de Wikipedia / Wikimedia Commons
 */
export const WIKIPEDIA_CIRCUIT_VECTOR_MAPS: Record<string, string> = {
  'bahrain-sakhir': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Bahrain_International_Circuit--Grand_Prix_Layout.svg',
  'saudi-jeddah': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Jeddah_Street_Circuit_2021.svg',
  'australia-melbourne': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Albert_Park_Circuit_2021.svg',
  'japan-suzuka': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Suzuka_circuit_map--2005.svg',
  'china-shanghai': 'https://upload.wikimedia.org/wikipedia/commons/1/14/Shanghai_International_Racing_Circuit_track_map.svg',
  'miami-autodrome': 'https://upload.wikimedia.org/wikipedia/commons/4/49/Hard_Rock_Stadium_Circuit_2022.svg',
  'italy-imola': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Imola.svg',
  'monaco-montecarlo': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Monte_Carlo_Formula_1_track_map.svg',
  'canada-montreal': 'https://upload.wikimedia.org/wikipedia/commons/2/21/Circuit_Gilles_Villeneuve.svg',
  'spain-barcelona': 'https://upload.wikimedia.org/wikipedia/commons/2/26/Formula1_Circuit_Catalunya_2021.svg',
  'austria-redbullring': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Circuit_Red_Bull_Ring.svg',
  'uk-silverstone': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Circuit_Silverstone_2011.svg',
  'hungary-hungaroring': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Hungaroring2026.svg',
  'belgium-spa': 'https://upload.wikimedia.org/wikipedia/commons/5/54/Spa-Francorchamps_of_Belgium.svg',
  'netherlands-zandvoort': 'https://upload.wikimedia.org/wikipedia/commons/7/73/Circuit_Park_Zandvoort-1999.svg',
  'italy-monza': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Monza_track_map.svg',
  'azerbaijan-baku': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Baku_Formula_One_circuit_map.svg',
  'singapore-marinabay': 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Marina_Bay_circuit_2023.svg',
  'usa-austin': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Austin_circuit.svg',
  'mexico-rodriguez': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Aut%C3%B3dromo_Hermanos_Rodr%C3%ADguez.svg',
  'brazil-interlagos': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace_%28AKA_Interlagos%29_track_map.svg',
  'lasvegas-strip': 'https://upload.wikimedia.org/wikipedia/commons/4/43/2023_Las_Vegas_street_circuit.svg',
  'qatar-lusail': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Lusail_International_Circuit_2023.svg',
  'abudhabi-yasmarina': 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Circuit_Yas-Island.svg'
};

/**
 * Devuelve el mapa vectorial de Wikipedia de un circuito (proxificado para evitar 403).
 */
export const getCircuitVectorMap = (circuitId: string): string => {
  const rawSvgUrl = WIKIPEDIA_CIRCUIT_VECTOR_MAPS[circuitId] || WIKIPEDIA_CIRCUIT_VECTOR_MAPS['monaco-montecarlo'];
  return getProxiedImageUrl(rawSvgUrl);
};

/**
 * 20 fotos oficiales de los pilotos de la temporada actual extraídas de Wikipedia
 */
export const WIKIPEDIA_DRIVER_PHOTOS: Record<string, string> = {
  'max-verstappen': 'https://upload.wikimedia.org/wikipedia/commons/5/52/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3973_by_Stepro_%28medium_crop%29.jpg',
  'sergio-perez': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Sergio_P%C3%A9rez_2019_%28cropped%29.jpg',
  'charles-leclerc': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Charles_Leclerc_at_the_2026_Cannes_Film_Festival_%28cropped%29.jpg',
  'carlos-sainz': 'https://upload.wikimedia.org/wikipedia/commons/0/01/Carlos_Sainz_at_the_83rd_Venice_FILM_festival-9_%28cropped%29.jpg',
  'lando-norris': 'https://upload.wikimedia.org/wikipedia/commons/9/90/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3968_by_Stepro_%28cropped2%29.jpg',
  'oscar-piastri': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/2026_Chinese_GP_-_Oscar_Piastri_%28cropped%29_%28cropped%29.jpg',
  'george-russell': 'https://upload.wikimedia.org/wikipedia/commons/7/7f/KingsLeonSilverstne040724_%2828_of_112%29_%2853838006028%29_%28cropped%29.jpg',
  'lewis-hamilton': 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg',
  'fernando-alonso': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Alonso-68_%2824710447098%29.jpg',
  'lance-stroll': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/2025_Japan_GP_-_Aston_Martin_-_Lance_Stroll_-_Fanzone_Stage_%28cropped%29.jpg',
  'pierre-gasly': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Pierre_Gasly_2017_Malaysia.jpg',
  'esteban-ocon': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Esteban_Ocon_2024_Suzuka_%28cropped%29.jpg',
  'nico-hulkenberg': 'https://upload.wikimedia.org/wikipedia/commons/d/de/2019_Formula_One_tests_Barcelona%2C_Hulkenberg_%2840287128313%29.jpg',
  'kevin-magnussen': 'https://upload.wikimedia.org/wikipedia/commons/6/63/Kevin_Magnussen%2C_2019_Formula_One_Tests_Barcelona_%28cropped%29.jpg',
  'yuki-tsunoda': 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Yuki_Tsunoda_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8096%29.jpg',
  'liam-lawson': 'https://upload.wikimedia.org/wikipedia/commons/8/88/Liam_Lawson_at_the_Red_Bull_Fan_Zone_%E2%80%93_Crown_Riverwalk%2C_Melbourne_%28028A7795%29.jpg',
  'alex-albon': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Alex_Albon_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8626%29_%28cropped%29.jpg',
  'franco-colapinto': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Franco_Colapinto_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8698%29_cropped.jpg',
  'guanyu-zhou': 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Zhou_Guanyu_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A7999%29.jpg',
  'valtteri-bottas': 'https://upload.wikimedia.org/wikipedia/commons/2/20/Valtteri_Bottas_at_the_2026_Adelaide_Motorsport_Festival_%28028A7556%29.jpg'
};

/**
 * Devuelve la foto del piloto de Wikipedia proxificada y redimensionada.
 */
export const getDriverWikipediaPhoto = (driverId: string, width: number = 600): string => {
  const rawUrl = WIKIPEDIA_DRIVER_PHOTOS[driverId];
  if (!rawUrl) return '';
  return getProxiedImageUrl(rawUrl, width);
};

/**
 * Obtiene fotografías reales del circuito desde f1-fansite.com (a través de f1_photos.json)
 */
export const getCircuitPhotosFromF1Fansite = (
  circuitId: string,
  count: number = 4
): string[] => {
  const circuitToGpSlug: Record<string, string> = {
    'bahrain-sakhir': 'bahrain',
    'saudi-jeddah': 'saudi-arabia',
    'australia-melbourne': 'australian',
    'japan-suzuka': 'japanese',
    'china-shanghai': 'chinese',
    'miami-autodrome': 'miami',
    'italy-imola': 'emilia-romagna',
    'monaco-montecarlo': 'monaco',
    'canada-montreal': 'canadian',
    'spain-barcelona': 'spanish',
    'austria-redbullring': 'austrian',
    'uk-silverstone': 'british',
    'hungary-hungaroring': 'hungarian',
    'belgium-spa': 'belgian',
    'netherlands-zandvoort': 'dutch',
    'italy-monza': 'italian',
    'azerbaijan-baku': 'azerbaijan',
    'singapore-marinabay': 'singapore',
    'usa-austin': 'united-states',
    'mexico-rodriguez': 'mexican',
    'brazil-interlagos': 'sao-paulo',
    'lasvegas-strip': 'las-vegas',
    'qatar-lusail': 'qatar',
    'abudhabi-yasmarina': 'abu-dhabi'
  };

  const gpSlug = circuitToGpSlug[circuitId] || 'monaco';
  const matchingKeys = Object.keys(f1Photos)
    .filter(k => k.endsWith('_' + gpSlug))
    .sort()
    .reverse(); // Empezar por años más recientes

  const collected: string[] = [];
  for (const k of matchingKeys) {
    const entry = f1Photos[k];
    const photos = [
      ...(entry.race || []),
      ...(entry.qualy || []),
      ...(entry.practice || []),
      ...(entry.supplementary || [])
    ];
    for (const p of photos) {
      if (!collected.includes(p)) {
        collected.push(getProxiedImageUrl(p, 800));
        if (collected.length >= count) return collected;
      }
    }
  }

  // Si no hubiera suficientes, rellenar con fallbacks
  if (collected.length < count) {
    const needed = count - collected.length;
    for (let i = 0; i < needed; i++) {
      collected.push(FALLBACK_F1_PHOTOS.race[i % FALLBACK_F1_PHOTOS.race.length]);
    }
  }

  return collected;
};

export const getFallbackPhoto = (
  type: F1SessionPhotoType = 'race',
  index: number = 0,
  year?: number,
  sessionName: string = ''
): string => {
  const yearPhotos: string[] = [];

  if (year) {
    const yearStr = `${year}_`;
    for (const [key, data] of Object.entries(f1Photos)) {
      if (key.startsWith(yearStr)) {
        const targetType = type in data ? type : 'race';
        if (data[targetType] && data[targetType].length > 0) {
          yearPhotos.push(...data[targetType]);
        }
      }
    }
  }

  if (yearPhotos.length === 0) {
    for (const data of Object.values(f1Photos)) {
      const targetType = type in data ? type : 'race';
      if (data[targetType] && data[targetType].length > 0) {
        yearPhotos.push(...data[targetType]);
      }
    }
  }

  if (yearPhotos.length > 0) {
    const offset = getHashCode(sessionName || 'fallback');
    const photoUrl = yearPhotos[(index + offset) % yearPhotos.length];
    return getProxiedImageUrl(photoUrl, 800);
  }

  const list = FALLBACK_F1_PHOTOS[type] || FALLBACK_F1_PHOTOS.supplementary;
  return list[index % list.length];
};

export const getF1Photo = (
  year: number,
  gpId: string,
  type: F1SessionPhotoType = 'race',
  index: number = 0,
  sessionName: string = ''
): string => {
  let cleanGpId = gpId.toLowerCase().replace(/-grand-prix$/, '').replace(/_grand_prix$/, '');
  const lowerSessionName = sessionName.toLowerCase();
  const lowerGpId = cleanGpId.toLowerCase();

  for (const [gpKey, keywords] of Object.entries(GP_KEYWORD_MAP)) {
    if (keywords.some(kw => lowerSessionName.includes(kw) || lowerGpId.includes(kw))) {
      cleanGpId = gpKey;
      break;
    }
  }

  const dbKey = `${year}_${cleanGpId}`;
  let gpData = f1Photos[dbKey];

  if (!gpData) {
    gpData = f1Photos[cleanGpId];
  }

  if (!gpData) {
    return getFallbackPhoto(type, index, year, sessionName || gpId);
  }

  let list: string[] = [];
  if (lowerSessionName.includes('practice') || lowerSessionName.includes('fp') || type === 'practice') {
    list = gpData.practice.length > 0 ? gpData.practice : (gpData.qualy.length > 0 ? gpData.qualy : gpData.supplementary);
  } else if (lowerSessionName.includes('qualifying') || lowerSessionName.match(/\bq[123]\b/) || type === 'qualy') {
    list = gpData.qualy.length > 0 ? gpData.qualy : (gpData.practice.length > 0 ? gpData.practice : gpData.supplementary);
  } else {
    list = gpData.race.length > 0 ? gpData.race : gpData.supplementary;
  }

  if (list && list.length > 0) {
    const offset = getHashCode(sessionName || 'gp');
    return getProxiedImageUrl(list[(index + offset) % list.length], 800);
  }

  return getFallbackPhoto(type, index, year, sessionName || gpId);
};
