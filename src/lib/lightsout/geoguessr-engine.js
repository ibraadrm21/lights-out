/**
 * LIGHTS OUT - F1 Circuit GeoGuessr Engine
 * Interactive Map Guessing: calculate distance error in km via Haversine formula,
 * award dynamic score based on proximity (0 to 1000 pts), pay-to-unlock cryptic clues.
 */

import { F1_CIRCUITS } from './data.js';

// Haversine formula to compute great-circle distance between two GPS points in Kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Convert distance error into Points (Max 1000 pts for pinpoint bullseye)
export function scoreFromDistance(distanceKm) {
  if (distanceKm <= 25) return 1000;
  if (distanceKm <= 100) return 900;
  if (distanceKm <= 300) return 750;
  if (distanceKm <= 750) return 550;
  if (distanceKm <= 1500) return 350;
  if (distanceKm <= 3000) return 150;
  return 25; // Minimum participation points
}

// Fisher-Yates true cryptographic unbiased shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class CircuitGeoEngine {
  constructor(options = {}) {
    this.filterMode = options.filterMode || "all"; // "all" | "era2000" | "historic" | "street"
    
    // Read previously played circuits in recent sessions to avoid repeating
    let playedIds = [];
    try {
      playedIds = JSON.parse(localStorage.getItem("lightsout_geoguessr_played") || "[]");
    } catch (e) {
      playedIds = [];
    }

    // Filter available pool according to era / track preferences
    let pool = F1_CIRCUITS;
    if (this.filterMode === "era2000") {
      pool = F1_CIRCUITS.filter(c => c.firstGP >= 1999 || c.trackType.includes("Actual") || c.trackType.includes("Moderno"));
    } else if (this.filterMode === "historic") {
      pool = F1_CIRCUITS.filter(c => c.trackType.includes("Histórico") || c.firstGP < 2010);
    } else if (this.filterMode === "street") {
      pool = F1_CIRCUITS.filter(c => c.trackType.includes("Callejero") || c.trackType.includes("Urbano") || c.trackType.includes("Semipermanente"));
    }

    // Separate into unplayed and played to prioritize circuits the player hasn't seen yet
    const unplayed = pool.filter(c => !playedIds.includes(c.id));
    const alreadyPlayed = pool.filter(c => playedIds.includes(c.id));

    // Shuffle unplayed first, followed by shuffled already-played
    const shuffledPool = [...shuffleArray(unplayed), ...shuffleArray(alreadyPlayed)];
    
    this.circuits = shuffledPool.length >= 5 ? shuffledPool : shuffleArray(F1_CIRCUITS);
    this.currentRoundIndex = 0;
    this.totalRounds = 5;
    this.currentCircuit = this.circuits[this.currentRoundIndex];
    this.unlockedCluesCount = 0; // Starts with 0 clues revealed (must pay)
    this.clueCost = 35; // 35 PitCoins per clue
    this.totalScore = 0;
    this.isRoundFinished = false;
    this.isMatchOver = false;
    this.lastGuessResult = null;

    // Record the current circuit ID
    this.recordPlayedCircuit(this.currentCircuit.id);
  }

  recordPlayedCircuit(circuitId) {
    try {
      let playedIds = JSON.parse(localStorage.getItem("lightsout_geoguessr_played") || "[]");
      if (!playedIds.includes(circuitId)) {
        playedIds.push(circuitId);
        // Keep last 25 circuits to keep rotating fresh ones
        if (playedIds.length > 25) {
          playedIds.shift();
        }
        localStorage.setItem("lightsout_geoguessr_played", JSON.stringify(playedIds));
      }
    } catch (e) {}
  }

  getCurrentRoundData() {
    const c = this.currentCircuit;
    return {
      round: this.currentRoundIndex + 1,
      totalRounds: this.totalRounds,
      svgPath: c.svgPath,
      streetView: c.streetView,
      trackType: c.trackType,
      turns: c.turns,
      lengthKm: c.lengthKm,
      drsZones: c.drsZones,
      unlockedClues: c.clues.slice(0, this.unlockedCluesCount),
      totalCluesAvailable: c.clues.length,
      unlockedCluesCount: this.unlockedCluesCount,
      clueCost: this.clueCost,
      isRoundFinished: this.isRoundFinished,
      lastGuessResult: this.lastGuessResult
    };
  }

  // Pay to reveal next cryptic clue
  unlockNextClue(userCoins, deductCoinsCallback) {
    if (this.unlockedCluesCount >= this.currentCircuit.clues.length) {
      return { success: false, message: "Todas las pistas disponibles ya han sido descifradas." };
    }

    if (userCoins < this.clueCost) {
      return { success: false, message: `Saldo insuficiente. Necesitas ${this.clueCost} PitCoins para descifrar esta telemetría.` };
    }

    if (deductCoinsCallback) {
      deductCoinsCallback(this.clueCost);
    }

    this.unlockedCluesCount++;
    const clueText = this.currentCircuit.clues[this.unlockedCluesCount - 1];

    return {
      success: true,
      clueText,
      unlockedClues: this.currentCircuit.clues.slice(0, this.unlockedCluesCount),
      remainingAvailable: this.currentCircuit.clues.length - this.unlockedCluesCount
    };
  }

  // Submit geographical coordinates guess from world map pin
  guessCoordinates(guessLat, guessLng) {
    if (this.isRoundFinished) return { error: "Ronda ya completada." };

    const actualLat = this.currentCircuit.streetView.lat;
    const actualLng = this.currentCircuit.streetView.lng;

    const distanceKm = calculateDistanceKm(guessLat, guessLng, actualLat, actualLng);
    const earnedPoints = scoreFromDistance(distanceKm);

    this.isRoundFinished = true;
    this.totalScore += earnedPoints;

    this.lastGuessResult = {
      guessLat,
      guessLng,
      actualLat,
      actualLng,
      distanceKm,
      earnedPoints,
      circuit: this.currentCircuit,
      isExactMatch: distanceKm <= 50
    };

    return {
      success: true,
      result: this.lastGuessResult,
      totalScore: this.totalScore,
      isFinalRound: this.currentRoundIndex + 1 >= this.totalRounds
    };
  }

  nextRound() {
    if (this.currentRoundIndex + 1 >= this.totalRounds) {
      this.isMatchOver = true;
      return { isMatchOver: true, totalScore: this.totalScore };
    }
    this.currentRoundIndex++;
    this.currentCircuit = this.circuits[this.currentRoundIndex % this.circuits.length];
    this.recordPlayedCircuit(this.currentCircuit.id);
    this.unlockedCluesCount = 0;
    this.isRoundFinished = false;
    this.lastGuessResult = null;
    return { isMatchOver: false, roundData: this.getCurrentRoundData() };
  }
}
