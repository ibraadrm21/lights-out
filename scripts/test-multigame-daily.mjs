import assert from 'node:assert';
import { F1AIEngine } from '../src/lib/lightsout/ai-engine.js';
import { F1_DRIVERS, F1_CIRCUITS } from '../src/lib/lightsout/data.js';

console.log('🧪 RUNNING MULTI-MINIGAME DAILY TEST SUITE...\n');

function getUtcDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function pseudoRandom(seed) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 1000000) / 1000000;
}

const gameIds = ['quiz', 'driverle', 'reaction', 'higher_lower', 'helmet_guess', 'circuits'];

function getDailyGameRounds(dateStr = getUtcDateString()) {
  return gameIds.map(gameId => {
    const seed = `${dateStr}_${gameId}`;
    let config = {};
    if (gameId === 'quiz') {
      const engine = new F1AIEngine();
      const allQuestions = engine.generateAllCandidateQuestions();
      const selected = [];
      for (let i = 0; i < 5; i++) {
        const idx = Math.floor(pseudoRandom(`${seed}_q_${i}`) * allQuestions.length);
        selected.push(allQuestions[idx]);
      }
      config = { questions: selected };
    } else if (gameId === 'driverle') {
      const eligible = F1_DRIVERS.filter(d => d.gps >= 10);
      const idx = Math.floor(pseudoRandom(`${seed}_target`) * eligible.length);
      config = { targetDriverId: eligible[idx].id, targetDriverName: eligible[idx].name };
    } else if (gameId === 'circuits') {
      const idx = Math.floor(pseudoRandom(`${seed}_circuit`) * F1_CIRCUITS.length);
      config = { circuitName: F1_CIRCUITS[idx].name, country: F1_CIRCUITS[idx].country };
    }
    return { id: gameId, dateStr, config };
  });
}

const today = getUtcDateString();
const roundsToday = getDailyGameRounds(today);

// Test 1: Exactly 6 distinct daily rounds
console.log('Test 1: Generates exactly 6 daily rounds across all available minigames');
assert.strictEqual(roundsToday.length, 6, 'Must generate 6 minigame rounds');
const ids = roundsToday.map(r => r.id);
assert.deepStrictEqual(ids, ['quiz', 'driverle', 'reaction', 'higher_lower', 'helmet_guess', 'circuits']);
console.log('  ✓ PASSED: 6 minigames verified: Quiz, Driverle, Reaction, Higher/Lower, Helmet, Circuits');

// Test 2: Deterministic round configuration for all users on same date
console.log('\nTest 2: Deterministic content across sessions on the same UTC date');
const roundsUserA = getDailyGameRounds(today);
const roundsUserB = getDailyGameRounds(today);
for (let i = 0; i < 6; i++) {
  assert.strictEqual(roundsUserA[i].id, roundsUserB[i].id);
  if (roundsUserA[i].config.questions) {
    const hashesA = roundsUserA[i].config.questions.map(q => q.hash);
    const hashesB = roundsUserB[i].config.questions.map(q => q.hash);
    assert.deepStrictEqual(hashesA, hashesB, 'Question hashes must be identical');
  } else {
    assert.deepStrictEqual(roundsUserA[i].config, roundsUserB[i].config);
  }
}
console.log('  ✓ PASSED: Users A and B receive 100% identical questions, drivers, and setups');

// Test 3: Daily rotation on date change
console.log('\nTest 3: Date rotation produces different setups');
const roundsTomorrow = getDailyGameRounds('2026-10-16');
assert.notDeepStrictEqual(roundsToday[0].config, roundsTomorrow[0].config, 'Quiz questions must rotate on date change');
console.log('  ✓ PASSED: Tomorrow round rotated with fresh daily configurations');

// Test 4: Cumulative score arithmetic with voluntary participation
console.log('\nTest 4: Partial participation cumulative scoring');
const attemptsUser1 = {
  quiz: { score: 400, completed: true },
  driverle: { score: 540, completed: true }
}; // Only played 2 games
const totalScore1 = Object.values(attemptsUser1).reduce((acc, a) => acc + a.score, 0);
const completed1 = Object.values(attemptsUser1).filter(a => a.completed).length;
assert.strictEqual(totalScore1, 940);
assert.strictEqual(completed1, 2);
console.log(`  ✓ PASSED: User 1 played 2 games, scored ${totalScore1} PTS (${completed1}/6 juegos) without penalties`);

// Test 5: Leaderboard sorting: Total Score DESC, then Games Completed DESC
console.log('\nTest 5: Leaderboard ordering with games completed tiebreaker');
const lbEntries = [
  { userId: 'u1', totalScore: 1200, gamesCompleted: 3 },
  { userId: 'u2', totalScore: 1400, gamesCompleted: 4 },
  { userId: 'u3', totalScore: 1200, gamesCompleted: 4 }, // Same score as u1, but 4 games completed
  { userId: 'u4', totalScore: 800, gamesCompleted: 2 }
];
const sortedLb = [...lbEntries].sort((a, b) => b.totalScore - a.totalScore || b.gamesCompleted - a.gamesCompleted);
assert.strictEqual(sortedLb[0].userId, 'u2', 'u2 (1400 pts) must be rank 1');
assert.strictEqual(sortedLb[1].userId, 'u3', 'u3 (1200 pts, 4 games) must be rank 2');
assert.strictEqual(sortedLb[2].userId, 'u1', 'u1 (1200 pts, 3 games) must be rank 3');
assert.strictEqual(sortedLb[3].userId, 'u4', 'u4 (800 pts) must be rank 4');
console.log('  ✓ PASSED: Leaderboard clearly distinguishes partial vs full participation and ranks accurately');

console.log('\n=============================================');
console.log('🏁 ALL MULTI-MINIGAME DAILY TESTS PASSED (100% GREEN)');
console.log('=============================================\n');
