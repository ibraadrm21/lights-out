import { F1AIEngine } from './lightsout/ai-engine.js';
import { DriverleEngine } from './lightsout/driverle-engine.js';
import { CircuitGeoEngine } from './lightsout/geoguessr-engine.js';
import { F1_DRIVERS, F1_CIRCUITS, F1_TEAMS } from './lightsout/data.js';
import { openf1 } from './openf1Service';

const BACKEND_BASE_URL = 'http://localhost:5000/api';

export interface BackendMetrics {
  status: string;
  uptime: string;
  served_unique_hashes: number;
  total_active_users: number;
  f1_season: number;
}

export class LightsOutApiClient {
  private static aiEngine: any = null;
  private static servedHashes: Set<string> = new Set();

  static init() {
    try {
      const stored = localStorage.getItem('lightsout_served_hashes');
      if (stored) {
        const arr = JSON.parse(stored);
        this.servedHashes = new Set(arr);
      }
    } catch (e) {}

    this.aiEngine = new F1AIEngine(this.servedHashes);
  }

  static getServedHashes(): string[] {
    return Array.from(this.servedHashes);
  }

  static recordHash(hash: string) {
    this.servedHashes.add(hash);
    try {
      localStorage.setItem('lightsout_served_hashes', JSON.stringify(Array.from(this.servedHashes)));
    } catch (e) {}
  }

  private static async getLiveOpenF1Question(): Promise<{
    question: string;
    answer: string;
    options: string[];
    category: string;
    difficulty: string;
    explanation?: string;
    points: number;
    hash: string;
    source: 'procedural_ai_engine';
  } | null> {
    try {
      const standings = await openf1.getDriverStandings();
      if (!standings || standings.length < 4) return null;

      const p1 = standings[0];
      const p2 = standings[1];
      const p3 = standings[2];
      const p4 = standings[3];

      const questionType = Math.floor(Math.random() * 3);
      if (questionType === 0) {
        // P1 Leader
        const text = `EN VIVO [Mundial F1]: ¿Qué piloto lidera actualmente la clasificación del Campeonato Mundial de Pilotos?`;
        const answer = p1.driver.full_name;
        const hash = `live_openf1_p1_leader_${answer.toLowerCase().replace(/\s+/g, '_')}`;
        if (this.servedHashes.has(hash)) return null;

        const opts = [p1.driver.full_name, p2.driver.full_name, p3.driver.full_name, p4.driver.full_name].sort(() => Math.random() - 0.5);
        return {
          question: text,
          answer,
          options: opts,
          category: 'OPENF1 EN VIVO // MUNDIAL',
          difficulty: 'Medio',
          explanation: `${p1.driver.full_name} encabeza el campeonato con ${p1.points_current} puntos oficiales (OpenF1 Live Telemetry).`,
          points: 150,
          hash,
          source: 'procedural_ai_engine'
        };
      } else if (questionType === 1) {
        // P2 Contender
        const text = `EN VIVO [Mundial F1]: ¿Qué piloto ocupa actualmente la 2ª posición en el Campeonato de Pilotos?`;
        const answer = p2.driver.full_name;
        const hash = `live_openf1_p2_chaser_${answer.toLowerCase().replace(/\s+/g, '_')}`;
        if (this.servedHashes.has(hash)) return null;

        const opts = [p1.driver.full_name, p2.driver.full_name, p3.driver.full_name, p4.driver.full_name].sort(() => Math.random() - 0.5);
        return {
          question: text,
          answer,
          options: opts,
          category: 'OPENF1 EN VIVO // MUNDIAL',
          difficulty: 'Difícil',
          explanation: `${p2.driver.full_name} marcha en 2ª posición con ${p2.points_current} puntos en la clasificación general.`,
          points: 160,
          hash,
          source: 'procedural_ai_engine'
        };
      } else {
        // Team Constructors
        const teamStandings = await openf1.getTeamStandings();
        if (!teamStandings || teamStandings.length < 4) return null;
        const t1 = teamStandings[0];
        const text = `EN VIVO [Constructores]: ¿Qué escudería encabeza la tabla del Campeonato Mundial de Constructores?`;
        const answer = t1.team_name;
        const hash = `live_openf1_t1_leader_${answer.toLowerCase().replace(/\s+/g, '_')}`;
        if (this.servedHashes.has(hash)) return null;

        const opts = teamStandings.slice(0, 4).map(t => t.team_name).sort(() => Math.random() - 0.5);
        return {
          question: text,
          answer,
          options: opts,
          category: 'OPENF1 EN VIVO // CONSTRUCTORES',
          difficulty: 'Medio',
          explanation: `${t1.team_name} lidera el certamen de marcas con ${t1.points_current} puntos.`,
          points: 150,
          hash,
          source: 'procedural_ai_engine'
        };
      }
    } catch (e) {
      return null;
    }
  }

  /**
   * Fetches the next procedural question either from the backend REST API,
   * live OpenF1 telemetry, or dynamically via the F1AIEngine with 21,000+ unique questions.
   */
  static async fetchNextQuizQuestion(): Promise<{
    question: string;
    answer: string;
    options: string[];
    category: string;
    difficulty: string;
    explanation?: string;
    points: number;
    hash: string;
    source: 'backend_api' | 'procedural_ai_engine';
  }> {
    if (!this.aiEngine) {
      this.init();
    }

    // 1. Try backend API first (if custom server running)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${BACKEND_BASE_URL}/games/quiz/next`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        this.recordHash(data.hash);
        return {
          question: data.question,
          answer: data.answer,
          options: data.options,
          category: 'TELEMETRÍA FIA',
          difficulty: 'PRO',
          explanation: `Pregunta generada en tiempo real por el servidor backend de Lights Out. Hash: ${data.hash.slice(0, 10)}...`,
          points: data.points || 120,
          hash: data.hash,
          source: 'backend_api',
        };
      }
    } catch (err) {
      // Backend not running, seamlessly fallback to internal procedural AI Engine
    }

    // 2. 25% chance to inject a live OpenF1 real-time season question
    if (Math.random() < 0.25) {
      const liveQ = await this.getLiveOpenF1Question();
      if (liveQ) {
        this.recordHash(liveQ.hash);
        return liveQ;
      }
    }

    // 3. Procedural Rule-Based AI Engine (21,400+ unique questions, 0 repetition guarantee)
    const q = this.aiEngine.generateNextQuestion();
    this.recordHash(q.hash);

    return {
      question: q.text,
      answer: q.answer,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
      explanation: q.explanation,
      points: q.points || 150,
      hash: q.hash,
      source: 'procedural_ai_engine',
    };
  }

  /**
   * Fetches backend server telemetry health and metrics
   */
  static async fetchMetrics(): Promise<BackendMetrics | null> {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/metrics`, { timeout: 1000 } as any);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  }

  /**
   * Creates an instance of the Driverle Engine
   */
  static createDriverleEngine(options?: any) {
    return new DriverleEngine(options);
  }

  /**
   * Creates an instance of the GeoGuessr Circuit Engine
   */
  static createCircuitGeoEngine(options?: any) {
    return new CircuitGeoEngine(options);
  }

  /**
   * Direct access to the raw F1 databases
   */
  static getRawDrivers() {
    return F1_DRIVERS;
  }

  static getRawCircuits() {
    return F1_CIRCUITS;
  }

  static getRawTeams() {
    return F1_TEAMS;
  }
}

// Auto-initialize on load
LightsOutApiClient.init();
