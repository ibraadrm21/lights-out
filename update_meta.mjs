import fs from 'fs';

const meta = {
  verstappen: { lastYear: 2026, points: 2980, poles: 40, gps: 208 },
  hamilton: { lastYear: 2026, points: 4829, poles: 104, gps: 353 },
  alonso: { lastYear: 2026, points: 2329, poles: 22, gps: 401 },
  leclerc: { lastYear: 2026, points: 1381, poles: 26, gps: 146 },
  norris: { lastYear: 2026, points: 969, poles: 8, gps: 128 },
  sainz: { lastYear: 2026, points: 1226, poles: 6, gps: 206 },
  piastri: { lastYear: 2026, points: 389, poles: 0, gps: 46 },
  russell: { lastYear: 2026, points: 661, poles: 4, gps: 128 },
  perez: { lastYear: 2026, points: 1637, poles: 3, gps: 281 },
  senna: { lastYear: 1994, points: 614, poles: 65, gps: 161 },
  schumacher: { lastYear: 2012, points: 1566, poles: 68, gps: 308 },
  fangio: { lastYear: 1958, points: 277, poles: 29, gps: 52 },
  prost: { lastYear: 1993, points: 798, poles: 33, gps: 202 },
  vettel: { lastYear: 2022, points: 3098, poles: 57, gps: 300 },
  lauda: { lastYear: 1985, points: 420, poles: 24, gps: 177 },
  stewart: { lastYear: 1973, points: 360, poles: 17, gps: 100 },
  piquet: { lastYear: 1991, points: 485, poles: 24, gps: 207 },
  brabham: { lastYear: 1970, points: 261, poles: 13, gps: 128 },
  clark: { lastYear: 1968, points: 274, poles: 33, gps: 73 },
  fittipaldi: { lastYear: 1980, points: 281, poles: 6, gps: 149 },
  hakkinen: { lastYear: 2001, points: 420, poles: 26, gps: 165 },
  hill_graham: { lastYear: 1975, points: 289, poles: 13, gps: 179 },
  ascari: { lastYear: 1955, points: 140, poles: 14, gps: 33 },
  raikkonen: { lastYear: 2021, points: 1873, poles: 18, gps: 353 },
  mansell: { lastYear: 1995, points: 482, poles: 32, gps: 191 },
  rosberg_nico: { lastYear: 2016, points: 1594, poles: 30, gps: 206 },
  button: { lastYear: 2017, points: 1235, poles: 8, gps: 309 },
  hunt: { lastYear: 1979, points: 179, poles: 14, gps: 93 },
  andretti: { lastYear: 1982, points: 180, poles: 18, gps: 131 },
  villeneuve_jacques: { lastYear: 2006, points: 235, poles: 13, gps: 165 },
  hill_damon: { lastYear: 1999, points: 360, poles: 20, gps: 122 },
  surtees: { lastYear: 1972, points: 180, poles: 8, gps: 113 },
  rindt: { lastYear: 1970, points: 109, poles: 10, gps: 62 },
  jones: { lastYear: 1986, points: 206, poles: 6, gps: 117 },
  rosberg_keke: { lastYear: 1986, points: 159, poles: 5, gps: 128 },
  scheckter: { lastYear: 1980, points: 255, poles: 3, gps: 113 },
  denny_hulme: { lastYear: 1974, points: 248, poles: 1, gps: 112 },
  phil_hill: { lastYear: 1964, points: 98, poles: 6, gps: 52 },
  hawthorn: { lastYear: 1958, points: 127, poles: 4, gps: 47 },
  farina: { lastYear: 1955, points: 127, poles: 5, gps: 34 },
  ricciardo: { lastYear: 2024, points: 1329, poles: 3, gps: 258 },
  bottas: { lastYear: 2026, points: 1797, poles: 20, gps: 244 },
  barrichello: { lastYear: 2011, points: 658, poles: 14, gps: 326 },
  massa: { lastYear: 2017, points: 1167, poles: 16, gps: 272 },
  webber: { lastYear: 2013, points: 1047, poles: 13, gps: 217 },
  montoya: { lastYear: 2006, points: 307, poles: 13, gps: 95 },
  coulthard: { lastYear: 2008, points: 535, poles: 12, gps: 247 },
  gilles_villeneuve: { lastYear: 1982, points: 107, poles: 2, gps: 68 },
  moss: { lastYear: 1961, points: 186, poles: 16, gps: 67 },
  peterson: { lastYear: 1978, points: 206, poles: 14, gps: 123 },
  gasly: { lastYear: 2026, points: 418, poles: 0, gps: 151 },
  ocon: { lastYear: 2026, points: 445, poles: 0, gps: 154 },
  tsunoda: { lastYear: 2026, points: 89, poles: 0, gps: 87 },
  albon: { lastYear: 2026, points: 240, poles: 0, gps: 102 },
  hulkenberg: { lastYear: 2026, points: 561, poles: 1, gps: 227 },
  magnussen: { lastYear: 2026, points: 200, poles: 1, gps: 182 },
  kubica: { lastYear: 2021, points: 274, poles: 1, gps: 99 },
  stroll: { lastYear: 2026, points: 292, poles: 1, gps: 164 },
  colapinto: { lastYear: 2026, points: 5, poles: 0, gps: 9 },
  bearman: { lastYear: 2026, points: 7, poles: 0, gps: 3 },
  antonelli: { lastYear: 2026, points: 0, poles: 0, gps: 1 },
  zhou: { lastYear: 2026, points: 12, poles: 0, gps: 66 },
  sargeant: { lastYear: 2024, points: 1, poles: 0, gps: 37 },
  lawson: { lastYear: 2026, points: 6, poles: 0, gps: 11 },
  doohan: { lastYear: 2026, points: 0, poles: 0, gps: 1 },
  delarosa: { lastYear: 2012, points: 35, poles: 0, gps: 107 },
  gene: { lastYear: 2004, points: 5, poles: 0, gps: 36 },
  maldonado: { lastYear: 2015, points: 76, poles: 1, gps: 96 },
  kobayashi: { lastYear: 2014, points: 125, poles: 0, gps: 76 },
  grosjean: { lastYear: 2020, points: 391, poles: 0, gps: 181 },
  kvyat: { lastYear: 2020, points: 202, poles: 0, gps: 112 },
  fisichella: { lastYear: 2009, points: 275, poles: 4, gps: 231 },
  trulli: { lastYear: 2011, points: 246, poles: 4, gps: 256 },
  ralf_schumacher: { lastYear: 2007, points: 329, poles: 6, gps: 182 },
  frentzen: { lastYear: 2003, points: 174, poles: 2, gps: 160 },
  berger: { lastYear: 1997, points: 385, poles: 12, gps: 210 },
  alesi: { lastYear: 2001, points: 241, poles: 2, gps: 202 },
  alboreto: { lastYear: 1994, points: 186, poles: 2, gps: 215 },
  arnoux: { lastYear: 1989, points: 181, poles: 18, gps: 164 },
  cevert: { lastYear: 1973, points: 89, poles: 0, gps: 47 },
  bruce_mclaren: { lastYear: 1970, points: 196, poles: 3, gps: 104 },
  ickx: { lastYear: 1979, points: 181, poles: 13, gps: 120 },
  reutemann: { lastYear: 1982, points: 310, poles: 6, gps: 146 },
  irvine: { lastYear: 2002, points: 191, poles: 0, gps: 148 },
  jos_verstappen: { lastYear: 2003, points: 17, poles: 0, gps: 107 }
};

let content = fs.readFileSync('frontend/data.js', 'utf8');

for (const [id, data] of Object.entries(meta)) {
  const marker = 'id: "' + id + '"';
  const pos = content.indexOf(marker);
  if (pos !== -1) {
    const debutIdx = content.indexOf('debutYear:', pos);
    if (debutIdx !== -1) {
      const lineEnd = content.indexOf('\n', debutIdx);
      const insertStr = `\n    lastYear: ${data.lastYear},\n    points: ${data.points},\n    poles: ${data.poles},\n    gps: ${data.gps},`;
      content = content.slice(0, lineEnd) + insertStr + content.slice(lineEnd);
    }
  }
}

fs.writeFileSync('frontend/data.js', content, 'utf8');
console.log('Successfully updated frontend/data.js with complete driver metadata!');
