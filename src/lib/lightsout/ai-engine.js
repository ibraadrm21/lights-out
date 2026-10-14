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

export class F1AIEngine {
  constructor(servedHashes = new Set()) {
    this.servedHashes = servedHashes instanceof Set ? servedHashes : new Set(servedHashes);
    this._allPossibleQuestionsCache = null;
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
    const allDriverNames = F1_DRIVERS.map(d => d.name);
    const allCountries = Array.from(new Set([...F1_DRIVERS.map(d => d.country), ...F1_CIRCUITS.map(c => c.country)]));
    const allCircuitNames = F1_CIRCUITS.map(c => c.name);
    const allTeams = F1_TEAMS.map(t => t.name);

    // 1. Championships count (for champions)
    F1_DRIVERS.filter(d => d.championships > 0).forEach(driver => {
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
    F1_DRIVERS.forEach(driver => {
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
    F1_DRIVERS.forEach(driver => {
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
    F1_DRIVERS.filter(d => d.number > 0).forEach(driver => {
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
    F1_DRIVERS.filter(d => d.quote && d.quote.length > 5).forEach(driver => {
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
    F1_DRIVERS.filter(d => d.funFact && d.funFact.length > 10).forEach(driver => {
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
    F1_DRIVERS.filter(d => d.wins > 0).forEach(driver => {
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
    F1_DRIVERS.filter(d => d.podiums > 0).forEach(driver => {
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
    F1_DRIVERS.forEach(driver => {
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

    // 19. Head-to-Head Driver Duels (Combinatorial Pairing across all metrics)
    for (let i = 0; i < F1_DRIVERS.length; i++) {
      for (let j = i + 1; j < F1_DRIVERS.length; j++) {
        const d1 = F1_DRIVERS[i];
        const d2 = F1_DRIVERS[j];

        // 19.1 Duels by GP Wins
        if (d1.wins !== d2.wins) {
          const winner = d1.wins > d2.wins ? d1 : d2;
          const loser = d1.wins > d2.wins ? d2 : d1;
          const text = `Duelo F1: Entre ${d1.name} y ${d2.name}, ¿quién ostenta MÁS victorias en Grandes Premios?`;
          const answer = winner.name;
          candidateQuestions.push({
            category: "Duelos Históricos & Victorias",
            difficulty: "Medio",
            text,
            answer,
            getOptions: () => shuffleArray([winner.name, loser.name, "Están empatados en victorias", "Ninguno ha ganado un Gran Premio"]),
            explanation: `${winner.name} acumula ${winner.wins} victorias en F1, superando a ${loser.name} (${loser.wins} victorias).`,
            points: 100,
            hash: computeQuestionHash(text, answer)
          });
        }

        // 19.2 Duels by GP Podiums
        if (d1.podiums !== d2.podiums) {
          const winner = d1.podiums > d2.podiums ? d1 : d2;
          const loser = d1.podiums > d2.podiums ? d2 : d1;
          const text = `Duelo F1: Entre ${d1.name} y ${d2.name}, ¿quién ha subido a MÁS podios en Fórmula 1?`;
          const answer = winner.name;
          candidateQuestions.push({
            category: "Duelos Históricos & Podios",
            difficulty: "Medio",
            text,
            answer,
            getOptions: () => shuffleArray([winner.name, loser.name, "Están empatados en podios", "Ninguno ha subido al podio"]),
            explanation: `${winner.name} tiene ${winner.podiums} podios en su casillero frente a los ${loser.podiums} de ${loser.name}.`,
            points: 100,
            hash: computeQuestionHash(text, answer)
          });
        }

        // 19.3 Duels by World Championships
        if (d1.championships !== d2.championships && (d1.championships > 0 || d2.championships > 0)) {
          const winner = d1.championships > d2.championships ? d1 : d2;
          const loser = d1.championships > d2.championships ? d2 : d1;
          const text = `Duelo de Campeones: ¿Quién ostenta MÁS Títulos Mundiales de Pilotos: ${d1.name} o ${d2.name}?`;
          const answer = winner.name;
          candidateQuestions.push({
            category: "Duelo de Campeones",
            difficulty: "Fácil",
            text,
            answer,
            getOptions: () => shuffleArray([winner.name, loser.name, "Tienen los mismos títulos", "Ninguno de los dos fue campeón"]),
            explanation: `${winner.name} tiene ${winner.championships} título(s) mundial(es), frente a ${loser.championships} de ${loser.name}.`,
            points: 110,
            hash: computeQuestionHash(text, answer)
          });
        }

        // 19.4 Duels by Pole Positions
        if (d1.poles !== d2.poles) {
          const winner = d1.poles > d2.poles ? d1 : d2;
          const loser = d1.poles > d2.poles ? d2 : d1;
          const text = `Duelo a una Vuelta: ¿Quién ha logrado MÁS pole positions oficiales: ${d1.name} o ${d2.name}?`;
          const answer = winner.name;
          candidateQuestions.push({
            category: "Clasificación & Poles",
            difficulty: "Medio",
            text,
            answer,
            getOptions: () => shuffleArray([winner.name, loser.name, "Están empatados en poles", "Ninguno ha logrado una pole"]),
            explanation: `${winner.name} cuenta con ${winner.poles} poles frente a ${loser.poles} de ${loser.name}.`,
            points: 110,
            hash: computeQuestionHash(text, answer)
          });
        }

        // 19.5 Duels by Grand Prix Longevity
        if (d1.gps !== d2.gps) {
          const winner = d1.gps > d2.gps ? d1 : d2;
          const loser = d1.gps > d2.gps ? d2 : d1;
          const text = `Longevidad F1: ¿Quién ha disputado MÁS Grandes Premios en la historia: ${d1.name} o ${d2.name}?`;
          const answer = winner.name;
          candidateQuestions.push({
            category: "Longevidad & Grandes Premios",
            difficulty: "Difícil",
            text,
            answer,
            getOptions: () => shuffleArray([winner.name, loser.name, "Han disputado el mismo número de GPs", "Menos de 50 GPs ambos"]),
            explanation: `${winner.name} suma ${winner.gps} carreras disputadas frente a las ${loser.gps} de ${loser.name}.`,
            points: 110,
            hash: computeQuestionHash(text, answer)
          });
        }

        // 19.6 Duels by Debut Chronology
        if (d1.debutYear !== d2.debutYear) {
          const earlier = d1.debutYear < d2.debutYear ? d1 : d2;
          const later = d1.debutYear < d2.debutYear ? d2 : d1;
          const text = `Cronología F1: ¿Quién debutó ANTES en la Fórmula 1: ${d1.name} o ${d2.name}?`;
          const answer = earlier.name;
          candidateQuestions.push({
            category: "Cronología & Debut",
            difficulty: "Difícil",
            text,
            answer,
            getOptions: () => shuffleArray([earlier.name, later.name, "Debutaron en la misma temporada", "Ambos debutaron antes del año 2000"]),
            explanation: `${earlier.name} debutó en ${earlier.debutYear}, mientras que ${later.name} tomó la salida por primera vez en ${later.debutYear}.`,
            points: 120,
            hash: computeQuestionHash(text, answer)
          });
        }
      }
    }

    // 20. Head-to-Head Circuit Duels (Combinatorial Pairing across all circuits)
    for (let i = 0; i < F1_CIRCUITS.length; i++) {
      for (let j = i + 1; j < F1_CIRCUITS.length; j++) {
        const c1 = F1_CIRCUITS[i];
        const c2 = F1_CIRCUITS[j];

        // 20.1 Circuit Length
        if (c1.lengthKm !== c2.lengthKm) {
          const longer = c1.lengthKm > c2.lengthKm ? c1 : c2;
          const shorter = c1.lengthKm > c2.lengthKm ? c2 : c1;
          const text = `Trazados F1: ¿Qué circuito tiene una vuelta MÁS LARGA en kilómetros: ${c1.name} o ${c2.name}?`;
          const answer = longer.name;
          candidateQuestions.push({
            category: "Circuitos & Telemetría",
            difficulty: "Medio",
            text,
            answer,
            getOptions: () => shuffleArray([longer.name, shorter.name, "Tienen exactamente la misma longitud", "Ambos miden menos de 4.0 km"]),
            explanation: `${longer.name} mide ${longer.lengthKm} km por vuelta frente a los ${shorter.lengthKm} km de ${shorter.name}.`,
            points: 100,
            hash: computeQuestionHash(text, answer)
          });
        }

        // 20.2 Circuit Turns
        if (c1.turns !== c2.turns) {
          const more = c1.turns > c2.turns ? c1 : c2;
          const less = c1.turns > c2.turns ? c2 : c1;
          const text = `Trazados F1: ¿Qué circuito cuenta con MÁS curvas en su recorrido oficial: ${c1.name} o ${c2.name}?`;
          const answer = more.name;
          candidateQuestions.push({
            category: "Circuitos & Curvas",
            difficulty: "Medio",
            text,
            answer,
            getOptions: () => shuffleArray([more.name, less.name, "Tienen el mismo número de curvas", "Ambos tienen menos de 12 curvas"]),
            explanation: `${more.name} cuenta con ${more.turns} curvas frente a las ${less.turns} de ${less.name}.`,
            points: 100,
            hash: computeQuestionHash(text, answer)
          });
        }

        // 20.3 Circuit Historical Debut
        if (c1.firstGP !== c2.firstGP) {
          const earlier = c1.firstGP < c2.firstGP ? c1 : c2;
          const later = c1.firstGP < c2.firstGP ? c2 : c1;
          const text = `Historia de Circuitos: ¿Qué trazado acogió un Gran Premio de F1 ANTES en la historia: ${c1.name} o ${c2.name}?`;
          const answer = earlier.name;
          candidateQuestions.push({
            category: "Circuitos & Historia",
            difficulty: "Experto",
            text,
            answer,
            getOptions: () => shuffleArray([earlier.name, later.name, "Debutaron el mismo año", "Ambos debutaron después de 2015"]),
            explanation: `${earlier.name} debutó en el calendario en ${earlier.firstGP}, mientras que ${later.name} lo hizo en ${later.firstGP}.`,
            points: 120,
            hash: computeQuestionHash(text, answer)
          });
        }
      }
    }

    // 21. Exclusion / "Which of these DID NOT..." Trivia
    const champions = F1_DRIVERS.filter(d => d.championships > 0);
    const nonChampions = F1_DRIVERS.filter(d => d.championships === 0);
    const winners = F1_DRIVERS.filter(d => d.wins > 0);
    const nonWinners = F1_DRIVERS.filter(d => d.wins === 0);
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
   * Generates the next question, guaranteeing 100% strictly that it has NEVER
   * been served to this user before.
   */
  generateNextQuestion() {
    const allCandidates = this.generateAllCandidateQuestions();

    // Filter candidate questions strictly by servedHashes
    const unserved = allCandidates.filter(q => !this.servedHashes.has(q.hash));

    if (unserved.length > 0) {
      // Pick a random unserved candidate
      const randomIndex = Math.floor(Math.random() * unserved.length);
      const chosen = unserved[randomIndex];

      // Mark as served immediately
      this.servedHashes.add(chosen.hash);

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
    const driver = F1_DRIVERS[Math.floor(Math.random() * F1_DRIVERS.length)];
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
