/**
 * LIGHTS OUT - Driverle Game Engine
 * Guess the secret F1 driver with telemetry comparison matching Formula 1 Driverle format:
 * Columns: Drvr | First year | Last year | WCs (Championships) | Wins | Top 3s (Podiums) | Pnts (Points) | Poles | GPs
 * Supports filter by year interval (e.g. 1950 - 2026, 2010 - 2026), stat mode (all / points only / wins only), and game mode (infinite / daily)
 */

import { F1_DRIVERS } from './data.js';

export class DriverleEngine {
  constructor(options = {}) {
    this.minYear = options.minYear !== undefined ? parseInt(options.minYear, 10) : 1950;
    this.maxYear = options.maxYear !== undefined ? parseInt(options.maxYear, 10) : 2026;
    this.statMode = options.statMode || "all"; // "all" | "points" | "wins"
    this.gameMode = options.gameMode || "infinite"; // "infinite" | "daily"
    this.maxAttempts = options.maxAttempts || 10;

    // Filter candidate drivers who were active during this season interval
    this.candidateDrivers = this.filterDrivers(this.minYear, this.maxYear, this.statMode);
    
    // Ensure we have candidates, fallback to all if range too narrow
    if (this.candidateDrivers.length === 0) {
      this.candidateDrivers = F1_DRIVERS;
    }

    if (this.gameMode === "daily") {
      // Deterministic driver based on today's date
      const todayStr = new Date().toISOString().slice(0, 10);
      let seed = 0;
      for (let i = 0; i < todayStr.length; i++) {
        seed = (seed * 31 + todayStr.charCodeAt(i)) & 0xffffff;
      }
      this.targetDriver = this.candidateDrivers[seed % this.candidateDrivers.length];
    } else {
      this.targetDriver = options.targetDriverId 
        ? F1_DRIVERS.find(d => d.id === options.targetDriverId) || this.candidateDrivers[Math.floor(Math.random() * this.candidateDrivers.length)]
        : this.candidateDrivers[Math.floor(Math.random() * this.candidateDrivers.length)];
    }

    this.attempts = [];
    this.isGameOver = false;
    this.isVictory = false;
  }

  filterDrivers(minY, maxY, statMode) {
    return F1_DRIVERS.filter(d => {
      const debut = d.debutYear || 1950;
      const last = d.lastYear || d.debutYear || 2026;
      // Driver active overlap with [minY, maxY]
      const overlaps = debut <= maxY && last >= minY;
      if (!overlaps) return false;

      if (statMode === "points") {
        return (d.points || 0) > 0;
      }
      if (statMode === "wins") {
        return (d.wins || 0) > 0;
      }
      return true;
    });
  }

  submitGuess(driverId) {
    if (this.isGameOver) return { error: "El juego ya ha finalizado." };

    const guessed = F1_DRIVERS.find(d => d.id === driverId);
    if (!guessed) return { error: "Piloto no válido." };

    // Check if already guessed
    if (this.attempts.some(a => a.driver.id === driverId)) {
      return { error: "Ya has introducido este piloto en este intento." };
    }

    const t = this.targetDriver;
    const g = guessed;

    // Numerical helper
    const compNum = (valG, valT) => {
      const gNum = Number(valG) || 0;
      const tNum = Number(valT) || 0;
      return {
        val: gNum,
        match: gNum === tNum,
        direction: gNum < tNum ? "higher" : gNum > tNum ? "lower" : "equal"
      };
    };

    // Columns: Drvr | First year | Last year | WCs | Wins | Top 3s | Pnts | Poles | GPs
    const comparison = {
      driver: g,
      nameMatch: g.id === t.id,
      firstYear: compNum(g.debutYear, t.debutYear),
      lastYear: compNum(g.lastYear, t.lastYear),
      wcs: compNum(g.championships, t.championships),
      wins: compNum(g.wins, t.wins),
      top3s: compNum(g.podiums, t.podiums),
      points: compNum(g.points, t.points),
      poles: compNum(g.poles, t.poles),
      gps: compNum(g.gps, t.gps)
    };

    this.attempts.push(comparison);

    if (g.id === t.id) {
      this.isGameOver = true;
      this.isVictory = true;
    } else if (this.attempts.length >= this.maxAttempts) {
      this.isGameOver = true;
      this.isVictory = false;
    }

    return {
      success: true,
      comparison,
      remainingAttempts: this.maxAttempts - this.attempts.length,
      isGameOver: this.isGameOver,
      isVictory: this.isVictory,
      targetDriver: this.isGameOver ? this.targetDriver : null
    };
  }

  getAvailableDrivers() {
    return this.candidateDrivers
      .map(d => ({
        id: d.id,
        name: d.name,
        team: d.team,
        country: d.country,
        debutYear: d.debutYear,
        lastYear: d.lastYear,
        championships: d.championships,
        wins: d.wins,
        podiums: d.podiums,
        points: d.points,
        poles: d.poles,
        gps: d.gps
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
