import { 
  Compound, PaceMode, DriverInRace, ScenarioDefinition, 
  WeatherState, IncidentState, StrategyEventLog, PostRaceReport, PitWindowProjection 
} from '../types/strategyMaster';

// Compound baseline delta to base time (seconds)
export const COMPOUND_DELTAS: Record<Compound, number> = {
  soft: -0.85,
  medium: 0.0,
  hard: 0.85,
  intermediate: 3.5,
  wet: 7.2,
};

// Wear increment per lap (base)
export const COMPOUND_BASE_WEAR: Record<Compound, number> = {
  soft: 5.5,
  medium: 3.4,
  hard: 2.1,
  intermediate: 4.0,
  wet: 3.8,
};

// Pace multipliers
export const PACE_EFFECTS: Record<PaceMode, { timeDelta: number; wearMult: number }> = {
  attack: { timeDelta: -0.45, wearMult: 1.6 },
  balanced: { timeDelta: 0.0, wearMult: 1.0 },
  conserve: { timeDelta: 0.55, wearMult: 0.65 },
};

export class StrategySimulationEngine {
  scenario: ScenarioDefinition;
  currentLap: number = 0;
  drivers: DriverInRace[] = [];
  weather: WeatherState = 'dry';
  incident: IncidentState = 'none';
  incidentLapsRemaining: number = 0;
  eventsLog: StrategyEventLog[] = [];
  isFinished: boolean = false;
  playerPlannedPitLap: number | null = null;
  playerPlannedCompound: Compound = 'hard';
  playerOvertakesMade: number = 0;
  playerPositionsLost: number = 0;
  playerInitialPos: number = 0;

  constructor(scenario: ScenarioDefinition, initialCompound: Compound, initialPace: PaceMode) {
    this.scenario = scenario;
    this.weather = scenario.weatherForecast.startWeather;
    this.playerInitialPos = scenario.initialPlayerPosition;

    // Initialize drivers
    const orderedCompetitors = [...scenario.competitors];
    
    this.drivers = orderedCompetitors.map((c, index) => {
      const isPlayer = c.isPlayer;
      const compound = isPlayer ? initialCompound : c.currentCompound;
      const pace = isPlayer ? initialPace : c.paceMode;
      const startPos = index + 1;
      
      // Starting gap: ~0.8s between cars
      const gapToLeader = (startPos - 1) * 0.85;

      return {
        ...c,
        isPlayer,
        currentCompound: compound,
        paceMode: pace,
        position: startPos,
        tyreLaps: 0,
        tyreWear: 0,
        totalTime: gapToLeader,
        gapToLeader,
        gapToAhead: startPos === 1 ? 0 : 0.85,
        pitStops: 0,
        lastLapTime: 0,
        bestLapTime: 999,
        status: 'running',
        trackProgress: Math.max(0, 1.0 - (startPos - 1) * 0.04),
        sector: 1,
        hasDrs: false,
        fuelKg: Math.round(scenario.totalLaps * 1.65), // ~1.65 kg per lap start
      };
    });

    // Sort by position
    this.drivers.sort((a, b) => a.position - b.position);

    this.eventsLog.push({
      lap: 0,
      message: `Semáforos apagados. ¡Comienza el Gran Premio en ${scenario.trackName}!`,
      type: 'incident',
    });
  }

  setPlayerPace(pace: PaceMode) {
    const player = this.drivers.find(d => d.isPlayer);
    if (player) {
      player.paceMode = pace;
      this.eventsLog.push({
        lap: this.currentLap,
        message: `Muro: Orden de ritmo confirmada a [${pace.toUpperCase()}].`,
        type: 'order',
      });
    }
  }

  orderPitStop(compound: Compound) {
    const player = this.drivers.find(d => d.isPlayer);
    if (!player) return;
    this.playerPlannedPitLap = this.currentLap + 1;
    this.playerPlannedCompound = compound;
    this.eventsLog.push({
      lap: this.currentLap,
      message: `Radio: "BOX, BOX, BOX al final de la vuelta ${this.currentLap + 1}. Montamos compuesto ${compound.toUpperCase()}."`,
      type: 'pit',
    });
  }

  cancelPitStop() {
    this.playerPlannedPitLap = null;
    this.eventsLog.push({
      lap: this.currentLap,
      message: `Radio: "STAY OUT! Cancelamos entrada a boxes."`,
      type: 'order',
    });
  }

  simulateNextLap(): { events: StrategyEventLog[]; lap: number; isFinished: boolean } {
    if (this.isFinished) {
      return { events: [], lap: this.currentLap, isFinished: true };
    }

    this.currentLap++;
    const currentEvents: StrategyEventLog[] = [];

    // 1. Check weather transitions
    if (this.scenario.weatherForecast.rainChanceLaps) {
      const rainEvent = this.scenario.weatherForecast.rainChanceLaps.find(r => r.lap === this.currentLap);
      if (rainEvent && this.weather !== rainEvent.weather) {
        this.weather = rainEvent.weather;
        const msg = rainEvent.weather === 'wet'
          ? '¡LLUVIA INTENSA en pista! El asfalto está encharcado.'
          : rainEvent.weather === 'drizzle'
          ? 'Lluvia ligera reportada en la recta principal y sector 2.'
          : 'La lluvia ha cesado. La trazada se está secando.';
        currentEvents.push({ lap: this.currentLap, message: msg, type: 'weather' });
      }
    }

    // 2. Check incidents (SC, VSC)
    if (this.scenario.possibleIncidents) {
      const inc = this.scenario.possibleIncidents.find(i => i.triggerLap === this.currentLap);
      if (inc && this.incident === 'none') {
        this.incident = inc.type;
        this.incidentLapsRemaining = inc.durationLaps;
        currentEvents.push({
          lap: this.currentLap,
          message: `🚨 ${inc.type === 'safety_car' ? 'SAFETY CAR' : 'VIRTUAL SAFETY CAR'}: ${inc.description}`,
          type: 'incident',
        });
      }
    }

    if (this.incident !== 'none') {
      this.incidentLapsRemaining--;
      if (this.incidentLapsRemaining <= 0) {
        const ended = this.incident;
        this.incident = 'none';
        currentEvents.push({
          lap: this.currentLap,
          message: `🟢 Bandera verde. El ${ended === 'safety_car' ? 'Safety Car entra a boxes' : 'VSC termina'}. ¡Carrera reanudada!`,
          type: 'incident',
        });
      }
    }

    // 3. AI Pit stop logic & decision making
    this.drivers.forEach(driver => {
      driver.inPitThisLap = false;
      if (driver.isPlayer) {
        if (this.playerPlannedPitLap === this.currentLap) {
          this.executePitStop(driver, this.playerPlannedCompound, currentEvents);
          this.playerPlannedPitLap = null;
        }
      } else {
        // AI Logic
        this.evaluateAIPit(driver, currentEvents);
      }
    });

    // 4. Calculate lap times & wear
    this.drivers.forEach(driver => {
      if (driver.status === 'out') return;

      driver.tyreLaps++;

      // Wear increase
      const baseWear = COMPOUND_BASE_WEAR[driver.currentCompound] || 3.0;
      const paceWear = PACE_EFFECTS[driver.paceMode].wearMult;
      const heatPenalty = this.scenario.weatherForecast.temperature > 28 && driver.currentCompound === 'soft' ? 1.25 : 1.0;
      
      // Wet degradation if dry tyres on wet track
      let rainWearPenalty = 1.0;
      if ((this.weather === 'wet' || this.weather === 'drizzle') && !['intermediate', 'wet'].includes(driver.currentCompound)) {
        rainWearPenalty = 1.8;
      } else if (this.weather === 'dry' && ['intermediate', 'wet'].includes(driver.currentCompound)) {
        rainWearPenalty = 2.5; // Overheating wet tyres on dry track
      }

      const lapWear = baseWear * paceWear * heatPenalty * rainWearPenalty;
      driver.tyreWear = Math.min(100, driver.tyreWear + lapWear);

      // Lap time calculation:
      // Tbase + Pcompuesto + Pdesgaste + Pritmo + Pclima + Pincident
      const baseT = this.scenario.baseLapTime;
      const compoundT = COMPOUND_DELTAS[driver.currentCompound] || 0;
      const paceT = PACE_EFFECTS[driver.paceMode].timeDelta;

      // Wear penalty curve: gentle until 60%, exponential cliff after 70%
      let wearT = 0;
      if (driver.tyreWear > 30) {
        wearT = Math.pow((driver.tyreWear - 30) / 18, 1.8) * 0.4;
      }
      if (driver.tyreWear > 75) {
        wearT += (driver.tyreWear - 75) * 0.15; // Cliff
      }

      // Weather penalty
      let weatherT = 0;
      if (this.weather === 'wet') {
        if (driver.currentCompound === 'wet') weatherT = 6.0;
        else if (driver.currentCompound === 'intermediate') weatherT = 8.5;
        else weatherT = 20.0; // Slicks in wet
      } else if (this.weather === 'drizzle') {
        if (driver.currentCompound === 'intermediate') weatherT = 4.0;
        else if (driver.currentCompound === 'wet') weatherT = 7.5;
        else weatherT = 5.5; // Slicks slipping
      } else {
        // dry
        if (driver.currentCompound === 'intermediate') weatherT = 4.5;
        else if (driver.currentCompound === 'wet') weatherT = 9.0;
      }

      // Incident delta
      let incidentT = 0;
      if (this.incident === 'safety_car') {
        incidentT = 18.0; // Slow pace under SC
      } else if (this.incident === 'vsc') {
        incidentT = 12.0; // Slow pace under VSC
      }

      // Fuel consumption and weight effect:
      // ~1.6 kg per lap burned. Weight penalty: ~0.033s per kg of fuel carried
      const fuelBurn = driver.paceMode === 'attack' ? 1.85 : driver.paceMode === 'conserve' ? 1.4 : 1.6;
      driver.fuelKg = Math.max(0, Number((driver.fuelKg - fuelBurn).toFixed(1)));
      const fuelWeightPenalty = (driver.fuelKg * 0.033);

      // DRS evaluation: Allowed if within 1.0s of car ahead, no SC/VSC, and track not wet
      const canUseDrs = this.incident === 'none' && this.weather === 'dry' && driver.gapToAhead > 0 && driver.gapToAhead <= 1.0;
      driver.hasDrs = canUseDrs;
      const drsBonus = canUseDrs ? -0.42 : 0; // ~0.42s gain per lap with open flap

      // Small natural micro-variation (driver consistency)
      const variance = (Math.random() - 0.5) * 0.25;

      const lapTime = baseT + compoundT + paceT + wearT + weatherT + incidentT + fuelWeightPenalty + drsBonus + variance;
      driver.lastLapTime = lapTime;
      if (driver.status !== 'pit' && lapTime < driver.bestLapTime && this.incident === 'none') {
        driver.bestLapTime = lapTime;
      }
      driver.totalTime += lapTime;
    });

    // 5. Update track progress & sector positions
    this.drivers.forEach(d => {
      // Base lap fraction from time into lap
      const leader = this.drivers[0];
      const gapBehindLeader = Math.max(0, d.totalTime - (leader ? leader.totalTime : 0));
      // Normalize progress around the lap (0.0 to 1.0)
      const lapProgress = ((this.currentLap * this.scenario.baseLapTime - gapBehindLeader) % this.scenario.baseLapTime) / this.scenario.baseLapTime;
      const normalized = Math.max(0, Math.min(1, (lapProgress + 1) % 1));
      d.trackProgress = Number(normalized.toFixed(3));
      if (d.trackProgress < 0.33) d.sector = 1;
      else if (d.trackProgress < 0.66) d.sector = 2;
      else d.sector = 3;
    });

    // 6. Resolve overtakes and sort standings by totalTime
    const previousPositions = new Map<string, number>();
    this.drivers.forEach(d => previousPositions.set(d.id, d.position));

    // Under Safety Car:
    // Cars bunch up gradually, but cars that pit drop to the back of the queue!
    if (this.incident === 'safety_car') {
      this.drivers.sort((a, b) => a.totalTime - b.totalTime);
      const leaderTime = this.drivers[0].totalTime;
      this.drivers.forEach((d, idx) => {
        d.position = idx + 1;
        // Bunch up with 0.65s spacing behind SC
        d.totalTime = leaderTime + (idx * 0.65);
      });
    } else {
      // Normal race or VSC
      this.drivers.sort((a, b) => a.totalTime - b.totalTime);
      this.drivers.forEach((d, idx) => {
        d.position = idx + 1;
      });
    }

    // Calculate gaps
    const leader = this.drivers[0];
    this.drivers.forEach((driver, idx) => {
      driver.gapToLeader = Number((driver.totalTime - leader.totalTime).toFixed(2));
      if (idx === 0) {
        driver.gapToAhead = 0;
      } else {
        driver.gapToAhead = Number((driver.totalTime - this.drivers[idx - 1].totalTime).toFixed(2));
      }

      // Check position changes for player
      const prevPos = previousPositions.get(driver.id) || driver.position;
      if (driver.isPlayer) {
        if (driver.position < prevPos) {
          const delta = prevPos - driver.position;
          this.playerOvertakesMade += delta;
          const overtaken = this.drivers[driver.position]; // car now behind
          currentEvents.push({
            lap: this.currentLap,
            message: `⚡ ¡Adelantamiento! Subes a P${driver.position} tras adelantar a ${overtaken ? overtaken.name : 'tu rival'}.`,
            type: 'overtake',
          });
        } else if (driver.position > prevPos) {
          const delta = driver.position - prevPos;
          this.playerPositionsLost += delta;
          if (!driver.inPitThisLap) {
            currentEvents.push({
              lap: this.currentLap,
              message: `⚠️ Pierdes posición: Caes a P${driver.position}.`,
              type: 'warning',
            });
          }
        }
      }
    });

    // Check race finish
    if (this.currentLap >= this.scenario.totalLaps) {
      this.isFinished = true;
      const player = this.drivers.find(d => d.isPlayer);
      currentEvents.push({
        lap: this.currentLap,
        message: `🏁 Bandera a cuadros. ¡Final de carrera! Has terminado en P${player ? player.position : '-'}.`,
        type: 'incident',
      });
    }

    this.eventsLog.push(...currentEvents);
    return { events: currentEvents, lap: this.currentLap, isFinished: this.isFinished };
  }

  private executePitStop(driver: DriverInRace, targetCompound: Compound, events: StrategyEventLog[]) {
    driver.currentCompound = targetCompound;
    driver.tyreWear = 0;
    driver.tyreLaps = 0;
    driver.pitStops++;
    driver.inPitThisLap = true;

    // Time cost based on incident
    let pitCost = this.scenario.pitStopDelta;
    if (this.incident === 'safety_car') {
      pitCost = this.scenario.scPitDelta;
    } else if (this.incident === 'vsc') {
      pitCost = this.scenario.vscPitDelta;
    }

    driver.totalTime += pitCost;

    const incidentBonusText = this.incident !== 'none' 
      ? ` (¡Parada barata bajo ${this.incident.toUpperCase()}! Pierde solo ${pitCost}s)` 
      : ` (Tiempo en pit lane: +${pitCost}s)`;

    events.push({
      lap: this.currentLap,
      message: `${driver.name} entra en boxes. Monta ${targetCompound.toUpperCase()}${incidentBonusText}.`,
      type: 'pit',
    });
  }

  private evaluateAIPit(driver: DriverInRace, events: StrategyEventLog[]) {
    const lapsRemaining = this.scenario.totalLaps - this.currentLap;

    // 1. Weather priority
    if (this.weather === 'wet' && driver.currentCompound !== 'wet' && driver.currentCompound !== 'intermediate') {
      this.executePitStop(driver, 'wet', events);
      return;
    }
    if (this.weather === 'drizzle' && driver.currentCompound !== 'intermediate' && driver.currentCompound !== 'wet') {
      if (Math.random() > 0.25) {
        this.executePitStop(driver, 'intermediate', events);
        return;
      }
    }
    if (this.weather === 'dry' && ['intermediate', 'wet'].includes(driver.currentCompound)) {
      this.executePitStop(driver, 'medium', events);
      return;
    }

    // Don't pit if there are only 2 or fewer laps remaining unless punctured
    if (lapsRemaining <= 2 && driver.tyreWear < 90) {
      return;
    }

    // 2. Contextual AI under Safety Car / VSC
    // Evaluates: tyre wear + laps remaining + track position + tyre age
    if (this.incident !== 'none') {
      const willTyresLast = (100 - driver.tyreWear) / COMPOUND_BASE_WEAR[driver.currentCompound] > lapsRemaining;
      
      // If leading with high track position and tyres can finish, stay out for track position
      if (driver.position === 1 && willTyresLast && driver.tyreWear < 60) {
        return; // Prioritize track position over fresh tyres
      }

      // If tyres won't last or wear is over 55%, take the cheap pit stop
      if ((driver.tyreWear > 55 || !willTyresLast) && driver.pitStops < 2) {
        let nextComp: Compound = 'hard';
        if (lapsRemaining <= 10) nextComp = 'soft';
        else if (driver.currentCompound === 'soft') nextComp = 'medium';
        this.executePitStop(driver, nextComp, events);
        return;
      }
    }

    // 3. Normal wear-based degradation threshold
    const wearThreshold = driver.profile === 'aggressive' ? 70 : driver.profile === 'conservative' ? 82 : 75;
    if (driver.tyreWear >= wearThreshold && lapsRemaining > 2) {
      let nextComp: Compound = 'hard';
      if (lapsRemaining <= 10) {
        nextComp = 'soft'; // Final sprint
      } else if (driver.currentCompound === 'medium') {
        nextComp = 'hard';
      } else {
        nextComp = 'medium';
      }
      this.executePitStop(driver, nextComp, events);
    }
  }

  // Calculate projected pit window for the player
  getProjectedPitWindow(): PitWindowProjection {
    const player = this.drivers.find(d => d.isPlayer);
    if (!player) {
      return {
        currentPosition: 1,
        projectedPosition: 1,
        pitLossSeconds: this.scenario.pitStopDelta,
        rejoinGapToLeader: 0,
        rejoinAheadDriver: null,
        rejoinBehindDriver: null,
        trafficRisk: 'low',
        trafficDescription: 'Pista despejada.',
      };
    }

    let loss = this.scenario.pitStopDelta;
    if (this.incident === 'safety_car') loss = this.scenario.scPitDelta;
    else if (this.incident === 'vsc') loss = this.scenario.vscPitDelta;

    const projectedTotalTime = player.totalTime + loss;

    // Find where the player would land in the current field
    const otherDrivers = this.drivers.filter(d => !d.isPlayer);
    const sorted = [...otherDrivers].sort((a, b) => a.totalTime - b.totalTime);

    let projectedPos = 1;
    let aheadDriver: string | null = null;
    let behindDriver: string | null = null;

    for (let i = 0; i < sorted.length; i++) {
      if (projectedTotalTime > sorted[i].totalTime) {
        projectedPos = i + 2;
        aheadDriver = sorted[i].name;
      } else {
        if (!behindDriver) behindDriver = sorted[i].name;
      }
    }

    const leader = this.drivers[0];
    const rejoinGap = leader ? Number((projectedTotalTime - leader.totalTime).toFixed(2)) : loss;

    // Traffic assessment
    let trafficRisk: 'low' | 'medium' | 'high' = 'low';
    let trafficDescription = 'Salida con aire limpio sin coches directos.';

    if (aheadDriver && behindDriver) {
      trafficRisk = 'high';
      trafficDescription = `Atrapado en tráfico entre ${aheadDriver} y ${behindDriver} (aire sucio).`;
    } else if (aheadDriver) {
      trafficRisk = 'medium';
      trafficDescription = `Reincorporación justo detrás de ${aheadDriver} a menos de 1.5s.`;
    }

    return {
      currentPosition: player.position,
      projectedPosition: projectedPos,
      pitLossSeconds: loss,
      rejoinGapToLeader: rejoinGap,
      rejoinAheadDriver: aheadDriver,
      rejoinBehindDriver: behindDriver,
      trafficRisk,
      trafficDescription,
    };
  }

  generatePostRaceReport(): PostRaceReport {
    const player = this.drivers.find(d => d.isPlayer)!;
    const winner = this.drivers[0];
    const targetMet = player.position <= this.scenario.targetPosition;
    const posGain = this.playerInitialPos - player.position;

    const keyDecisions: { title: string; description: string; impact: 'positive' | 'negative' | 'neutral' }[] = [];

    // Analyze player choices
    if (player.pitStops === 0) {
      keyDecisions.push({
        title: 'Estrategia sin paradas (Zero-stop)',
        description: 'Intentaste completar la carrera con un solo juego de neumáticos. Provocó una degradación severa en las vueltas finales.',
        impact: 'negative',
      });
    } else if (player.pitStops === 1) {
      keyDecisions.push({
        title: 'Estrategia a 1 parada limpia',
        description: 'Optimizaste el tiempo perdido en boxes alargando la vida de los neumáticos sin caer en el abismo de degradación.',
        impact: 'positive',
      });
    } else {
      keyDecisions.push({
        title: 'Estrategia agresiva a múltiples paradas',
        description: 'Tuviste ritmo fresco pero el tráfico y el tiempo perdido en pit lane limitaron el salto de posiciones.',
        impact: targetMet ? 'positive' : 'neutral',
      });
    }

    if (posGain > 0) {
      keyDecisions.push({
        title: `Ganancia de posiciones (+${posGain})`,
        description: `Remontaste desde P${this.playerInitialPos} hasta cruzar la meta en P${player.position}.`,
        impact: 'positive',
      });
    } else if (posGain < 0) {
      keyDecisions.push({
        title: `Pérdida de posiciones (${posGain})`,
        description: `Caíste de P${this.playerInitialPos} a P${player.position}. El undercut o el ritmo de degradación perjudicaron tu resultado.`,
        impact: 'negative',
      });
    }

    // Weather decision analysis
    if (this.scenario.weatherForecast.rainChanceLaps && this.scenario.weatherForecast.rainChanceLaps.length > 0) {
      if (['intermediate', 'wet'].includes(player.currentCompound)) {
        keyDecisions.push({
          title: 'Reacción meteorológica',
          description: 'Montaste gomas para mojado durante la lluvia, evitando perder hasta 15 segundos por vuelta.',
          impact: 'positive',
        });
      }
    }

    // Score calculation
    let baseScore = targetMet ? 600 : 350;
    baseScore += Math.max(0, (8 - player.position) * 45);
    baseScore += this.playerOvertakesMade * 30;
    baseScore -= (player.tyreWear > 85 ? 50 : 0);

    const score = Math.min(1000, Math.max(100, Math.round(baseScore)));

    let rating: PostRaceReport['rating'] = 'ROOKIE';
    if (score >= 850) rating = 'MASTER';
    else if (score >= 700) rating = 'STRATEGIST';
    else if (score >= 500) rating = 'GAMBLER';

    const coinsReward = Math.round(score / 5);

    return {
      startPosition: this.playerInitialPos,
      finishPosition: player.position,
      totalTime: player.totalTime,
      gapToWinner: Number((player.totalTime - winner.totalTime).toFixed(2)),
      totalPits: player.pitStops,
      timeInPits: player.pitStops * this.scenario.pitStopDelta,
      overtakesMade: this.playerOvertakesMade,
      positionsLost: this.playerPositionsLost,
      keyDecisions,
      score,
      rating,
      coinsReward,
    };
  }
}
