const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').trim();
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseCSVLine(lines[i]);
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = vals[j] !== undefined ? vals[j] : '';
    }
    rows.push(obj);
  }
  return rows;
}

console.log('Loading CSVs...');
const driversCsv = readCSV('scripts/f1db/f1db-drivers.csv');
const countriesCsv = readCSV('scripts/f1db/f1db-countries.csv');
const constructorsCsv = readCSV('scripts/f1db/f1db-constructors.csv');
const entrantsDriversCsv = readCSV('scripts/f1db/f1db-seasons-entrants-drivers.csv');
const raceResultsCsv = readCSV('scripts/f1db/f1db-races-race-results.csv');

// Country mappings
const countryMap = {};
countriesCsv.forEach(c => {
  countryMap[c.id] = {
    name: c.name,
    code: c.alpha2Code
  };
});

// Spanish country names
const spanishCountries = {
  'netherlands': 'Países Bajos',
  'united-kingdom': 'Reino Unido',
  'spain': 'España',
  'germany': 'Alemania',
  'france': 'Francia',
  'italy': 'Italia',
  'brazil': 'Brasil',
  'finland': 'Finlandia',
  'australia': 'Australia',
  'united-states-of-america': 'Estados Unidos',
  'argentina': 'Argentina',
  'austria': 'Austria',
  'belgium': 'Bélgica',
  'canada': 'Canadá',
  'mexico': 'México',
  'japan': 'Japón',
  'switzerland': 'Suiza',
  'sweden': 'Suecia',
  'new-zealand': 'Nueva Zelanda',
  'south-africa': 'Sudáfrica',
  'colombia': 'Colombia',
  'denmark': 'Dinamarca',
  'ireland': 'Irlanda',
  'monaco': 'Mónaco',
  'poland': 'Polonia',
  'portugal': 'Portugal',
  'thailand': 'Tailandia',
  'russia': 'Rusia',
  'venezuela': 'Venezuela',
  'chile': 'Chile',
  'china': 'China',
  'hungary': 'Hungría',
  'india': 'India',
  'indonesia': 'Indonesia',
  'malaysia': 'Malasia',
  'morocco': 'Marruecos',
  'czech-republic': 'República Checa',
  'uruguay': 'Uruguay',
  'zimbabwe': 'Zimbabue'
};

// Constructor name mapping
const constructorMap = {};
constructorsCsv.forEach(c => {
  constructorMap[c.id] = c.name;
});

// Driver years & teams from race results + entrants
const driverSeasons = {};
const driverConstructors = {};

// 1. From race results (authoritative GP starts/entries)
raceResultsCsv.forEach(r => {
  const dId = r.driverId;
  const year = parseInt(r.year, 10);
  const cId = r.constructorId;
  if (!dId || isNaN(year)) return;

  if (!driverSeasons[dId]) {
    driverSeasons[dId] = { debut: year, last: year, totalGps: 0 };
  }
  if (year < driverSeasons[dId].debut) driverSeasons[dId].debut = year;
  if (year > driverSeasons[dId].last) driverSeasons[dId].last = year;
  driverSeasons[dId].totalGps++;

  if (cId) {
    if (!driverConstructors[dId]) driverConstructors[dId] = {};
    driverConstructors[dId][cId] = (driverConstructors[dId][cId] || 0) + 1;
  }
});

// 2. Fallback to seasons-entrants-drivers if no race results (e.g. entered but DNQ)
entrantsDriversCsv.forEach(e => {
  const dId = e.driverId;
  const year = parseInt(e.year, 10);
  const cId = e.constructorId;
  if (!dId || isNaN(year)) return;

  if (!driverSeasons[dId]) {
    driverSeasons[dId] = { debut: year, last: year, totalGps: 0 };
  } else {
    if (year < driverSeasons[dId].debut) driverSeasons[dId].debut = year;
    if (year > driverSeasons[dId].last) driverSeasons[dId].last = year;
  }

  if (cId) {
    if (!driverConstructors[dId]) driverConstructors[dId] = {};
    driverConstructors[dId][cId] = (driverConstructors[dId][cId] || 0) + 1;
  }
});

// Existing rich data (colors, helmet colors, quotes, funFacts) from current 85 drivers
const currentData = require('../src/lib/lightsout/data.js');
const richLookup = {};
if (currentData && currentData.F1_DRIVERS) {
  currentData.F1_DRIVERS.forEach(d => {
    richLookup[d.id] = d;
    richLookup[d.name.toLowerCase()] = d;
  });
}

console.log('Mapping drivers...');
const finalDrivers = [];

driversCsv.forEach(d => {
  const id = d.id;
  const name = d.name;
  const seasons = driverSeasons[id] || { debut: 1950, last: 1950, totalGps: 0 };

  // Calculate top 1-3 teams they drove for
  let mainTeam = 'Independiente';
  if (driverConstructors[id]) {
    const sortedTeams = Object.entries(driverConstructors[id])
      .sort((a, b) => b[1] - a[1])
      .map(([cId]) => constructorMap[cId] || cId)
      .slice(0, 3);
    if (sortedTeams.length > 0) {
      mainTeam = sortedTeams.join(' / ');
    }
  }

  const natId = d.nationalityCountryId || d.countryOfBirthCountryId || '';
  const countryName = spanishCountries[natId] || (countryMap[natId]?.name || 'Internacional');
  const countryCode = countryMap[natId]?.code || 'FIA';

  const wcs = parseInt(d.totalChampionshipWins, 10) || 0;
  const wins = parseInt(d.totalRaceWins, 10) || 0;
  const podiums = parseInt(d.totalPodiums, 10) || 0;
  const poles = parseInt(d.totalPolePositions, 10) || 0;
  const points = Math.round(parseFloat(d.totalPoints) || 0);
  const gps = parseInt(d.totalRaceEntries, 10) || seasons.totalGps || 1;
  const number = parseInt(d.permanentNumber, 10) || null;
  const code = d.abbreviation || name.slice(0, 3).toUpperCase();

  // Check if we have rich quotes / funFacts
  const rich = richLookup[id] || richLookup[name.toLowerCase()] || {};

  finalDrivers.push({
    id: id,
    name: name,
    code: code,
    number: number,
    team: rich.team || mainTeam,
    country: countryName,
    countryCode: countryCode,
    championships: wcs,
    podiums: podiums,
    wins: wins,
    debutYear: seasons.debut,
    lastYear: seasons.last,
    points: points,
    poles: poles,
    gps: gps,
    helmetColor: rich.helmetColor || '#cccccc',
    color: rich.color || '#e10600',
    stats: rich.stats || {
      speed: Math.min(99, 70 + wins * 2 + wcs * 5),
      consistency: Math.min(99, 70 + podiums),
      racecraft: Math.min(99, 70 + wcs * 6),
      experience: Math.min(99, Math.round(Math.min(99, (gps / 300) * 99)))
    },
    quote: rich.quote || '',
    funFact: rich.funFact || (wcs > 0 ? `Campeón del Mundo de Fórmula 1 (${wcs} ${wcs === 1 ? 'título' : 'títulos'}).` : wins > 0 ? `Ganador de ${wins} Grandes Premios de F1.` : podiums > 0 ? `Subió al podio de F1 en ${podiums} ocasiones.` : `Disputó ${gps} Grandes Premios de F1.`)
  });
});

console.log('Total drivers processed:', finalDrivers.length);

// Sort: Champions first, then by wins, then by podiums, then by GPs, then alphabet
finalDrivers.sort((a, b) => {
  if (b.championships !== a.championships) return b.championships - a.championships;
  if (b.wins !== a.wins) return b.wins - a.wins;
  if (b.podiums !== a.podiums) return b.podiums - a.podiums;
  if (b.gps !== a.gps) return b.gps - a.gps;
  return a.name.localeCompare(b.name);
});

fs.writeFileSync('src/lib/lightsout/f1-drivers-all.json', JSON.stringify(finalDrivers, null, 2));
console.log('Saved src/lib/lightsout/f1-drivers-all.json successfully!');
