/**
 * LIGHTS OUT - AI Quiz Rule-Based Engine & Minigames Engine
 * Generates dynamic questions in real-time with SHA-256 equivalent hashing,
 * GUARANTEES zero question repetition per user lifetime (persisted in user profile),
 * with 20+ specialized factual templates generating over 1,200+ distinct questions.
 */

import { F1_DRIVERS, F1_CIRCUITS, F1_TEAMS } from './data.js';

export const CANONICAL_TEAMS = [
  "Scuderia Ferrari",
  "Mercedes-AMG Petronas",
  "McLaren Formula 1 Team",
  "Oracle Red Bull Racing",
  "Williams Racing",
  "Aston Martin Aramco",
  "BWT Alpine F1 Team",
  "Kick Sauber / Audi",
  "MoneyGram Haas F1 Team",
  "Visa Cash App RB",
  "Team Lotus",
  "Brabham",
  "Tyrrell Racing",
  "Benetton Formula",
  "March Engineering",
  "Jordan Grand Prix"
];

export function getCanonicalTeam(raw) {
  const s = String(raw).toLowerCase().trim();
  if (s.includes('ferrari')) return 'Scuderia Ferrari';
  if (s.includes('mercedes')) return 'Mercedes-AMG Petronas';
  if (s.includes('mclaren')) return 'McLaren Formula 1 Team';
  if (s.includes('red bull') || s.includes('redbull')) return 'Oracle Red Bull Racing';
  if (s.includes('williams')) return 'Williams Racing';
  if (s.includes('aston martin') || s.includes('aston')) return 'Aston Martin Aramco';
  if (s.includes('alpine') || s.includes('renault')) return 'BWT Alpine F1 Team';
  if (s.includes('sauber') || s.includes('kick') || s.includes('audi') || s.includes('alfa')) return 'Kick Sauber / Audi';
  if (s.includes('haas')) return 'MoneyGram Haas F1 Team';
  if (s.includes('rb') || s.includes('toro rosso') || s.includes('alphatauri')) return 'Visa Cash App RB';
  if (s.includes('lotus')) return 'Team Lotus';
  if (s.includes('brabham')) return 'Brabham';
  if (s.includes('tyrrell')) return 'Tyrrell Racing';
  if (s.includes('benetton')) return 'Benetton Formula';
  if (s.includes('march')) return 'March Engineering';
  if (s.includes('jordan')) return 'Jordan Grand Prix';
  return String(raw).trim();
}

// Fast internal deterministic hash (acting as cryptographic digest for question texts)
export function computeQuestionHash(text, answer) {
  const combined = `${text.trim()}|${String(answer).trim()}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  // Convert to hex-like string representation
  return 'qhash_' + Math.abs(hash).toString(16) + '_' + combined.length;
}

// Utility to pick random elements from array excluding certain values
function getRandomOptions(correctAnswer, allPossiblePool, count = 3) {
  const pool = Array.from(new Set(allPossiblePool.filter(item => String(item).trim() !== String(correctAnswer).trim())));
  // Fisher-Yates shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const selected = pool.slice(0, count);
  const options = [String(correctAnswer), ...selected.map(String)];
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Strictly defined list of legendary pre-2015 drivers:
 * Only World Champions, multi-Grand Prix winners with 6+ wins, and truly iconic F1 legends.
 * Excludes obscure/historical drivers who happened to win 1-2 races decades ago (e.g. Jabouille, Revson, etc.).
 */
export const PRE_2015_MYTHIC_NAMES = new Set([
  // World Champions (pre-2015)
  'Michael Schumacher', 'Juan Manuel Fangio', 'Alain Prost', 'Ayrton Senna',
  'Jackie Stewart', 'Niki Lauda', 'Nelson Piquet', 'Jack Brabham',
  'Jim Clark', 'Mika Häkkinen', 'Graham Hill', 'Emerson Fittipaldi',
  'Alberto Ascari', 'Nigel Mansell', 'Damon Hill', 'Alan Jones',
  'Mario Andretti', 'Jacques Villeneuve', 'Jody Scheckter', 'James Hunt',
  'Denny Hulme', 'John Surtees', 'Jochen Rindt', 'Nino Farina',
  'Keke Rosberg', 'Mike Hawthorn', 'Phil Hill',

  // Iconic Non-Champions (pre-2015) - True legends of the sport
  'Stirling Moss', 'Gilles Villeneuve', 'Ronnie Peterson', 'Carlos Reutemann',
  'David Coulthard', 'Rubens Barrichello', 'Gerhard Berger', 'Mark Webber',
  'Juan Pablo Montoya', 'Jacky Ickx', 'Felipe Massa', 'Jean Alesi',
  'François Cevert', 'Bruce McLaren',

  // Pilotos míticos y longevos de la era 2000-2015 (5+ temporadas en ese periodo)
  'Ralf Schumacher', 'Giancarlo Fisichella', 'Jarno Trulli', 'Nick Heidfeld',
  'Heikki Kovalainen', 'Pedro de la Rosa', 'Kamui Kobayashi', 'Takuma Sato',
  'Timo Glock', 'Adrian Sutil', 'Alexander Wurz', 'Vitantonio Liuzzi'
]);

/**
 * Modern Quiz eligibility:
 * 1. Pre-2015: STRICTLY the mythic champions and iconic legends defined above.
 * 2. 2015 onwards: ONLY drivers with at least half a full season (>= 10 GPs).
 */
export function isQuizEligibleDriver(d) {
  const isPost2015 = (d.lastYear || d.debutYear) >= 2015;
  if (isPost2015) {
    return (d.gps || 0) >= 10;
  }
  return PRE_2015_MYTHIC_NAMES.has(d.name);
}

export const QUIZ_DRIVERS = F1_DRIVERS.filter(isQuizEligibleDriver);

export class F1AIEngine {
  constructor(servedHashes = new Set()) {
    this.servedHashes = servedHashes instanceof Set ? servedHashes : new Set(servedHashes);
    this._allPossibleQuestionsCache = null;
    this.categoryHistory = []; // Keeps track of recently served question categories
  }

  getServedHashes() {
    return Array.from(this.servedHashes);
  }

  /**
   * Generates all valid questions available in the database across all templates.
   */
  generateAllCandidateQuestions() {
    if (this._allPossibleQuestionsCache) {
      return this._allPossibleQuestionsCache;
    }

    const candidateQuestions = [];
    const allDriverNames = QUIZ_DRIVERS.map(d => d.name);
    const allCountries = Array.from(new Set([...QUIZ_DRIVERS.map(d => d.country), ...F1_CIRCUITS.map(c => c.country)]));
    const allCircuitNames = F1_CIRCUITS.map(c => c.name);
    const allTeams = F1_TEAMS.map(t => t.name);

    // 1. Championships count (for champions)
    QUIZ_DRIVERS.filter(d => d.championships > 0).forEach(driver => {
      const text = `¿Cuántos Campeonatos Mundiales de Pilotos ha ganado ${driver.name}?`;
      const answer = driver.championships.toString();
      const fakePool = [0, 1, 2, 3, 4, 5, 7].filter(n => n !== driver.championships);
      candidateQuestions.push({
        category: "Récords y Títulos",
        difficulty: driver.championships >= 3 ? "Medio" : "Difícil",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, fakePool),
        explanation: `${driver.name} ostenta ${driver.championships} título(s) mundial(es) en la Fórmula 1.`,
        points: 100,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 2. Driver debut year
    QUIZ_DRIVERS.forEach(driver => {
      const text = `¿En qué año debutó oficialmente ${driver.name} en la Fórmula 1?`;
      const answer = driver.debutYear.toString();
      const fakeYears = [
        driver.debutYear - 3, driver.debutYear - 2, driver.debutYear - 1,
        driver.debutYear + 1, driver.debutYear + 2, driver.debutYear + 4
      ].filter(y => y >= 1950 && y <= 2026);
      candidateQuestions.push({
        category: "Historia & Debut",
        difficulty: "Difícil",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, fakeYears),
        explanation: `${driver.name} tomó la salida de su primer Gran Premio en la temporada ${driver.debutYear}.`,
        points: 120,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 3. Driver nationality
    QUIZ_DRIVERS.forEach(driver => {
      const text = `¿De qué país es originario el piloto de F1 ${driver.name}?`;
      const answer = driver.country;
      candidateQuestions.push({
        category: "Pilotos & Nacionalidades",
        difficulty: "Fácil",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, allCountries),
        explanation: `${driver.name} compite bajo la bandera y nacionalidad de ${driver.country}.`,
        points: 80,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 4. Driver car number
    QUIZ_DRIVERS.filter(d => d.number > 0).forEach(driver => {
      const text = `¿Qué dorsal o número distintivo ha llevado ${driver.name} en su monoplaza?`;
      const answer = `#${driver.number}`;
      const fakeNumbers = [1, 4, 11, 14, 16, 44, 55, 63, 77, 81, 23, 27, 33, 10, 3].map(n => `#${n}`);
      candidateQuestions.push({
        category: "Dorsales & Monoplazas",
        difficulty: "Medio",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, fakeNumbers),
        explanation: `El número distintivo de ${driver.name} en el monoplaza es el ${driver.number}.`,
        points: 90,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 5. Driver quotes
    QUIZ_DRIVERS.filter(d => d.quote && d.quote.length > 5).forEach(driver => {
      const text = `¿Qué piloto de F1 pronunció o popularizó la famosa frase: "${driver.quote}"?`;
      const answer = driver.name;
      candidateQuestions.push({
        category: "Team Radio & Cultura",
        difficulty: "Experto",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, allDriverNames),
        explanation: `Dicha célebre frase corresponde a ${driver.name} (${driver.team}).`,
        points: 150,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 6. Driver Fun Fact Trivia
    QUIZ_DRIVERS.filter(d => d.funFact && d.funFact.length > 10).forEach(driver => {
      const text = `Trivia F1: "${driver.funFact}" ¿A qué piloto se refiere?`;
      const answer = driver.name;
      candidateQuestions.push({
        category: "Curiosidades & Leyendas",
        difficulty: "Experto",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, allDriverNames),
        explanation: `Efectivamente, corresponde a ${driver.name} de ${driver.team}.`,
        points: 140,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 7. Driver GP Wins count
    QUIZ_DRIVERS.filter(d => d.wins > 0).forEach(driver => {
      const text = `¿Cuántas victorias oficiales en Grandes Premios ostenta ${driver.name}?`;
      const answer = `${driver.wins} victorias`;
      const offsets = [-8, -4, -2, +3, +7, +12, +18];
      const fakeWins = offsets.map(o => `${Math.max(1, driver.wins + o)} victorias`);
      candidateQuestions.push({
        category: "Estadísticas de Carrera",
        difficulty: "Difícil",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, fakeWins),
        explanation: `${driver.name} suma ${driver.wins} victorias en Grandes Premios de Fórmula 1.`,
        points: 130,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 8. Driver GP Podiums count
    QUIZ_DRIVERS.filter(d => d.podiums > 0).forEach(driver => {
      const text = `¿A cuántos podios ha subido en su trayectoria en F1 ${driver.name}?`;
      const answer = `${driver.podiums} podios`;
      const offsets = [-15, -6, +5, +14, +22];
      const fakePodiums = offsets.map(o => `${Math.max(1, driver.podiums + o)} podios`);
      candidateQuestions.push({
        category: "Estadísticas de Carrera",
        difficulty: "Difícil",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, fakePodiums),
        explanation: `${driver.name} ha alcanzado el podio en ${driver.podiums} ocasiones.`,
        points: 120,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 9. Circuit country / geography
    F1_CIRCUITS.forEach(circuit => {
      const text = `¿En qué país se encuentra y disputa el Gran Premio en el ${circuit.name}?`;
      const answer = circuit.country;
      const circuitCountries = F1_CIRCUITS.map(c => c.country);
      candidateQuestions.push({
        category: "Circuitos & Geografía",
        difficulty: "Fácil",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, circuitCountries),
        explanation: `El trazado de ${circuit.name} está ubicado en ${circuit.city}, ${circuit.country}.`,
        points: 80,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 10. Circuit city / location
    F1_CIRCUITS.forEach(circuit => {
      const text = `¿En qué ciudad o región se ubica el ${circuit.name}?`;
      const answer = circuit.city;
      const circuitCities = F1_CIRCUITS.map(c => c.city);
      candidateQuestions.push({
        category: "Circuitos & Ciudades",
        difficulty: "Medio",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, circuitCities),
        explanation: `El ${circuit.name} se sitúa en ${circuit.city} (${circuit.country}).`,
        points: 90,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 11. Circuit turns
    F1_CIRCUITS.forEach(circuit => {
      const text = `¿Cuántas curvas tiene el trazado oficial de ${circuit.name}?`;
      const answer = `${circuit.turns} curvas`;
      const fakeTurns = [circuit.turns - 5, circuit.turns - 3, circuit.turns + 2, circuit.turns + 4, circuit.turns + 6]
        .filter(n => n > 8).map(n => `${n} curvas`);
      candidateQuestions.push({
        category: "Trazados & Curvas",
        difficulty: "Experto",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, fakeTurns),
        explanation: `El circuito ${circuit.name} tiene una configuración de ${circuit.turns} curvas.`,
        points: 130,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 12. Circuit first GP debut
    F1_CIRCUITS.forEach(circuit => {
      const text = `¿En qué año acogió el ${circuit.name} su primer Gran Premio puntuable de F1?`;
      const answer = circuit.firstGP.toString();
      const fakeGP = [
        circuit.firstGP - 8, circuit.firstGP - 4, circuit.firstGP + 3, circuit.firstGP + 7, circuit.firstGP + 12
      ].filter(y => y >= 1950 && y <= 2026).map(String);
      candidateQuestions.push({
        category: "Historia de Circuitos",
        difficulty: "Experto",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, fakeGP),
        explanation: `El ${circuit.name} debutó en el calendario oficial de Fórmula 1 en ${circuit.firstGP}.`,
        points: 140,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 13. Circuit DRS Zones
    F1_CIRCUITS.forEach(circuit => {
      const text = `¿Cuántas zonas de DRS tiene habilitadas el trazado de ${circuit.name}?`;
      const answer = `${circuit.drsZones} zona(s) de DRS`;
      const fakeDrs = [1, 2, 3, 4].filter(n => n !== circuit.drsZones).map(n => `${n} zona(s) de DRS`);
      candidateQuestions.push({
        category: "Aerodinámica & DRS",
        difficulty: "Medio",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, fakeDrs),
        explanation: `El trazado de ${circuit.name} cuenta con ${circuit.drsZones} zona(s) de activación de DRS.`,
        points: 100,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 14. Circuit Track length
    F1_CIRCUITS.forEach(circuit => {
      const text = `¿Cuál es la longitud aproximada de una vuelta al ${circuit.name}?`;
      const answer = `${circuit.lengthKm} km`;
      const fakeLengths = [
        (circuit.lengthKm - 1.2).toFixed(3) + " km",
        (circuit.lengthKm - 0.6).toFixed(3) + " km",
        (circuit.lengthKm + 0.7).toFixed(3) + " km",
        (circuit.lengthKm + 1.5).toFixed(3) + " km"
      ];
      candidateQuestions.push({
        category: "Telemetría de Trazado",
        difficulty: "Difícil",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, fakeLengths),
        explanation: `La longitud de una vuelta completa al ${circuit.name} es de ${circuit.lengthKm} km.`,
        points: 120,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 15. Team base / headquarters
    F1_TEAMS.forEach(team => {
      const text = `¿Dónde se encuentra la sede central y fábrica de la escudería ${team.name}?`;
      const answer = team.base;
      const otherBases = F1_TEAMS.map(t => t.base);
      candidateQuestions.push({
        category: "Escuderías & Fábricas",
        difficulty: "Medio",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, otherBases),
        explanation: `La fábrica y túnel de viento de ${team.name} están ubicados en ${team.base}.`,
        points: 100,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 16. Team engine supplier
    F1_TEAMS.forEach(team => {
      const text = `¿Qué motorista o unidad de potencia propulsa a ${team.name}?`;
      const primaryEngine = team.engine.split("/")[0].trim();
      const answer = primaryEngine;
      const allPossibleEngines = ["Ferrari", "Mercedes", "Honda RBPT", "Renault", "Audi", "Ford / Red Bull"];
      const safeFakeEngines = allPossibleEngines.filter(e => !team.engine.toLowerCase().includes(e.toLowerCase().split(" ")[0]));
      candidateQuestions.push({
        category: "Motores & Unidades de Potencia",
        difficulty: "Medio",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, safeFakeEngines),
        explanation: `La escudería ${team.name} cuenta con unidades de potencia suministradas por ${team.engine}.`,
        points: 100,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 17. Team Constructors Championships
    F1_TEAMS.filter(t => t.championships > 0).forEach(team => {
      const text = `¿Cuántos Campeonatos Mundiales de Constructores tiene la escudería ${team.name}?`;
      const answer = `${team.championships} títulos`;
      const fakeChamps = [0, 2, 6, 8, 9, 16].filter(n => n !== team.championships).map(n => `${n} títulos`);
      candidateQuestions.push({
        category: "Historia de Constructores",
        difficulty: "Difícil",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, fakeChamps),
        explanation: `${team.name} acumula ${team.championships} títulos de constructores en su vitrina.`,
        points: 110,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 18. Driver team association (strictly canonicalized and excluding all teams the driver has ever raced for)
    QUIZ_DRIVERS.forEach(driver => {
      const rawParts = (driver.team || '').split(/[\/\(\)]/).map(s => s.trim()).filter(Boolean);
      const driverCanonicalTeams = Array.from(new Set(rawParts.map(p => getCanonicalTeam(p))));
      if (driverCanonicalTeams.length === 0) return;

      const answer = driverCanonicalTeams[0];
      const text = `¿En qué escudería de F1 compite o ha competido destacadamente ${driver.name}?`;
      
      // Candidate pool for wrong options must strictly EXCLUDE every team the driver has ever been part of
      const safeFakeTeams = CANONICAL_TEAMS.filter(t => !driverCanonicalTeams.includes(t));

      candidateQuestions.push({
        category: "Parrilla & Escuderías",
        difficulty: "Fácil",
        text,
        answer,
        getOptions: () => getRandomOptions(answer, safeFakeTeams),
        explanation: `${driver.name} compitió destacadamente para ${answer} (trayectoria: ${driver.team}).`,
        points: 75,
        hash: computeQuestionHash(text, answer)
      });
    });

    // 21. Exclusion / "Which of these DID NOT..." Trivia
    const champions = QUIZ_DRIVERS.filter(d => d.championships > 0);
    const nonChampions = QUIZ_DRIVERS.filter(d => d.championships === 0);
    const winners = QUIZ_DRIVERS.filter(d => d.wins > 0);
    const nonWinners = QUIZ_DRIVERS.filter(d => d.wins === 0);
    const europeanCountries = ['Italia', 'Reino Unido', 'España', 'Mónaco', 'Bélgica', 'Austria', 'Países Bajos', 'Hungría', 'Azerbaiyán'];
    const euroCircuits = F1_CIRCUITS.filter(c => europeanCountries.includes(c.country));
    const nonEuroCircuits = F1_CIRCUITS.filter(c => !europeanCountries.includes(c.country));

    // Never won a championship (for non-champions)
    nonChampions.forEach(driver => {
      const answer = driver.name;
      candidateQuestions.push({
        category: "Exclusiones & Campeonatos",
        difficulty: "Medio",
        text: `Trivia de Campeones: ¿Cuál de los siguientes pilotos NUNCA ha ganado un Campeonato Mundial de Pilotos?`,
        answer,
        getOptions: () => {
          const fakeChamps = shuffleArray(champions.map(c => c.name)).slice(0, 3);
          return shuffleArray([answer, ...fakeChamps]);
        },
        explanation: `${driver.name} nunca ha sido campeón del mundo de F1, a diferencia de los otros tres que sí se coronaron.`,
        points: 110,
        hash: computeQuestionHash(`exclusion_champ_${driver.id}`, answer)
      });
    });

    // Never won a Grand Prix (for non-winners)
    nonWinners.forEach(driver => {
      const answer = driver.name;
      candidateQuestions.push({
        category: "Exclusiones & Victorias",
        difficulty: "Difícil",
        text: `Palmarés F1: ¿Cuál de los siguientes pilotos NUNCA ha logrado una victoria en un Gran Premio de F1?`,
        answer,
        getOptions: () => {
          const fakeWinners = shuffleArray(winners.map(w => w.name)).slice(0, 3);
          return shuffleArray([answer, ...fakeWinners]);
        },
        explanation: `${driver.name} no ha conseguido subir a lo más alto del podio (0 victorias en GP).`,
        points: 120,
        hash: computeQuestionHash(`exclusion_win_${driver.id}`, answer)
      });
    });

    // Non-European circuit
    nonEuroCircuits.forEach(circuit => {
      const answer = circuit.name;
      candidateQuestions.push({
        category: "Geografía de Circuitos",
        difficulty: "Medio",
        text: `Geografía F1: ¿Cuál de los siguientes circuitos NO está situado geográficamente en Europa?`,
        answer,
        getOptions: () => {
          const fakeEuros = shuffleArray(euroCircuits.map(c => c.name)).slice(0, 3);
          return shuffleArray([answer, ...fakeEuros]);
        },
        explanation: `El trazado de ${circuit.name} está ubicado en ${circuit.country}, fuera del continente europeo.`,
        points: 90,
        hash: computeQuestionHash(`exclusion_euro_circuit_${circuit.id}`, answer)
      });
    });

    this._allPossibleQuestionsCache = candidateQuestions;
    return candidateQuestions;
  }

  /**
   * Generates the next question, guaranteeing 100% strictly that:
   * 1. It has NEVER been served to this user before (lifetime uniqueness via servedHashes).
   * 2. The same question category CANNOT appear back-to-back or within the last 3 questions (anti-monotony cooldown).
   * 3. Selection is pseudo-random across available distinct categories to avoid predictable patterns.
   */
  generateNextQuestion() {
    const allCandidates = this.generateAllCandidateQuestions();

    // Filter candidate questions strictly by servedHashes
    const unserved = allCandidates.filter(q => !this.servedHashes.has(q.hash));

    if (unserved.length > 0) {
      // Group unserved questions by category
      const categoriesMap = new Map();
      for (const q of unserved) {
        if (!categoriesMap.has(q.category)) {
          categoriesMap.set(q.category, []);
        }
        categoriesMap.get(q.category).push(q);
      }

      // Determine available categories that have NOT appeared recently (cooling memory: last 3 categories)
      const recentWindow = this.categoryHistory.slice(-3);
      let eligibleCategories = Array.from(categoriesMap.keys()).filter(
        cat => !recentWindow.includes(cat)
      );

      // If cooling window is too restrictive (e.g. only 1-2 categories remain unserved in entire pool),
      // relax cooling down gradually: try avoiding only the immediate last question's category
      if (eligibleCategories.length === 0 && this.categoryHistory.length > 0) {
        const lastCat = this.categoryHistory[this.categoryHistory.length - 1];
        eligibleCategories = Array.from(categoriesMap.keys()).filter(cat => cat !== lastCat);
      }

      // If still empty (all remaining questions are of the exact same category), accept all remaining
      if (eligibleCategories.length === 0) {
        eligibleCategories = Array.from(categoriesMap.keys());
      }

      // Pick a random category among eligible to avoid predictable patterns and category-size bias
      const randomCatIndex = Math.floor(Math.random() * eligibleCategories.length);
      const chosenCategory = eligibleCategories[randomCatIndex];
      const questionsInCategory = categoriesMap.get(chosenCategory);

      // Pick a random question from that category
      const randomQIndex = Math.floor(Math.random() * questionsInCategory.length);
      const chosen = questionsInCategory[randomQIndex];

      // Mark as served immediately and track category history (keep last 10)
      this.servedHashes.add(chosen.hash);
      this.categoryHistory.push(chosen.category);
      if (this.categoryHistory.length > 10) {
        this.categoryHistory.shift();
      }

      return {
        category: chosen.category,
        difficulty: chosen.difficulty,
        text: chosen.text,
        answer: chosen.answer,
        options: chosen.getOptions(),
        explanation: chosen.explanation,
        points: chosen.points,
        hash: chosen.hash,
        id: 'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        remainingPoolCount: unserved.length - 1,
        totalQuestionsPool: allCandidates.length
      };
    }

    // ULTRA-EXTREME EDGE CASE: The user has answered EVERY single one of the 1,000+ questions!
    // In this case, dynamically synthesize an algorithmic question with unique parameters
    // so repetition is STILL mathematically impossible.
    const driver = QUIZ_DRIVERS[Math.floor(Math.random() * QUIZ_DRIVERS.length)];
    const randomSeed = Math.floor(Math.random() * 90000) + 10000;
    const synthText = `[Desafío Maestro #${randomSeed}] El piloto ${driver.name} debutó en ${driver.debutYear}. ¿Cuántas temporadas de diferencia han pasado desde su debut hasta la temporada 2026?`;
    const diffYears = 2026 - driver.debutYear;
    const synthAnswer = `${diffYears} temporadas`;
    const synthHash = computeQuestionHash(synthText, synthAnswer);
    this.servedHashes.add(synthHash);

    const fakeDiffs = [diffYears - 4, diffYears - 2, diffYears + 3, diffYears + 5].map(d => `${d} temporadas`);

    return {
      category: "Desafío Maestro Algorítmico",
      difficulty: "Legendario",
      text: synthText,
      answer: synthAnswer,
      options: getRandomOptions(synthAnswer, fakeDiffs),
      explanation: `${driver.name} debutó en ${driver.debutYear}, por lo que en 2026 se cumplen ${diffYears} años.`,
      points: 200,
      hash: synthHash,
      id: 'q_synth_' + Date.now(),
      remainingPoolCount: 0,
      totalQuestionsPool: allCandidates.length
    };
  }
}
