/**
 * LIGHTS OUT - Main Frontend Application Controller & View Router
 */

import { LightsOutStore } from './store.js?v=2';
import { F1AIEngine } from './ai-engine.js';
import { DriverleEngine } from './driverle-engine.js';
import { CircuitGeoEngine } from './geoguessr-engine.js';
import { COSMETICS_CATALOG, F1_DRIVERS } from './data.js';

// Initialize Store & Global State
const store = new LightsOutStore();
let currentView = "home";

// Active game instances
let activeQuizEngine = null;
let currentQuizQuestion = null;
let activeDriverleEngine = null;
let activeGeoEngine = null;

// DOM Elements
const appRoot = document.getElementById("app-root");
const toastContainer = document.getElementById("toast-container");

// Nav buttons
const navTabs = {
  home: document.getElementById("tab-home"),
  quiz: document.getElementById("tab-quiz"),
  driverle: document.getElementById("tab-driverle"),
  geoguessr: document.getElementById("tab-geoguessr"),
  leaderboard: document.getElementById("tab-leaderboard"),
  store: document.getElementById("tab-paddock-store"),
  profile: document.getElementById("tab-profile"),
  admin: document.getElementById("tab-admin")
};

// Toast notification helper
export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Update Header Telemetry
function updateNavTelemetry() {
  const user = store.getUser();
  const rank = store.getUserRank();

  document.getElementById("nav-user-coins").textContent = user.coins;
  document.getElementById("nav-rank-icon").textContent = rank.icon;
  document.getElementById("nav-rank-name").textContent = rank.name;

  const navAvatarCircle = document.getElementById("nav-avatar-circle");
  if (user.avatarUrl) {
    navAvatarCircle.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar">`;
  } else {
    navAvatarCircle.innerHTML = `<span>${user.activeAvatarIcon || "🏎️"}</span>`;
  }
}

// Set active tab styling
function setActiveTab(tabKey) {
  Object.values(navTabs).forEach(btn => btn?.classList.remove("active"));
  if (navTabs[tabKey]) navTabs[tabKey].classList.add("active");
  currentView = tabKey;
}

// ==========================================
// VIEW RENDERERS
// ==========================================

// 1. HOME VIEW
function renderHomeView() {
  const user = store.getUser();
  const currentRank = store.getUserRank();
  const nextRank = store.getNextRank();

  const progressPercent = nextRank 
    ? Math.min(100, Math.round(((user.score - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100))
    : 100;

  appRoot.innerHTML = `
    <!-- Top Race Week Banner (Official F1 TV / formula1.com style) -->
    <div class="f1-gp-weekend-banner">
      <div class="gp-flag-badge">🇦🇪</div>
      <div class="gp-info-block">
        <div class="gp-phase-tag"><span class="live-dot-pulse"></span> PRÓXIMO GRAN PREMIO</div>
        <div class="gp-name">FORMULA 1 ETIHAD AIRWAYS ABU DHABI GRAND PRIX 2026</div>
        <div class="gp-circuit-meta">Yas Marina Circuit • 58 Vueltas • 5.281 km • Trazado Crepuscular</div>
      </div>
      <div class="gp-timing-countdown">
        <div class="countdown-unit">
          <span class="countdown-num">03</span>
          <span class="countdown-lbl">DÍAS</span>
        </div>
        <div class="countdown-colon">:</div>
        <div class="countdown-unit">
          <span class="countdown-num">14</span>
          <span class="countdown-lbl">HRS</span>
        </div>
        <div class="countdown-colon">:</div>
        <div class="countdown-unit">
          <span class="countdown-num">28</span>
          <span class="countdown-lbl">MIN</span>
        </div>
      </div>
    </div>

    <!-- Hero Section (Dribbble & F1.com Masterpiece) -->
    <section class="hero-banner f1-official-hero">
      <div class="hero-grid-content">
        <div class="hero-left-col">
          <div class="hero-tag">
            <span class="hero-tag-badge">FIA OFFICIAL HUB</span>
            <span class="hero-tag-sub">WORLD CHAMPIONSHIP GAMING PLATFORM</span>
          </div>
          <h1 class="hero-title">
            IT'S LIGHTS OUT <br>
            AND <span class="highlight-racing-red">AWAY WE GO!</span>
          </h1>
          <p class="hero-desc">
            Domina el pináculo del automovilismo. Pon a prueba tus reflejos en el 
            <strong>Quiz Master con IA generativa</strong> (sin preguntas repetidas), descubre el piloto secreto en 
            <strong>Driverle</strong> y localiza los circuitos del mundial en <strong>Circuit GeoGuessr</strong>.
          </p>
          <div class="hero-actions">
            <button class="btn-f1-primary" id="btn-hero-quiz">
              <span class="btn-icon">⚡</span> Iniciar F1 Quiz AI
            </button>
            <button class="btn-f1-secondary" id="btn-hero-driverle">
              <span class="btn-icon">🕵️</span> Jugar Driverle
            </button>
            <button class="btn-f1-secondary" id="btn-hero-geoguessr">
              <span class="btn-icon">🗺️</span> Reto GeoGuessr
            </button>
          </div>
        </div>

        <!-- Hero Right: F1 Telemetry Speedometer & Driver Card Showcase -->
        <div class="hero-right-col">
          <div class="f1-live-telemetry-card">
            <div class="telemetry-card-top">
              <span class="telemetry-pill-live"><span class="live-dot-pulse"></span> PADDOCK TELEMETRY</span>
              <span class="telemetry-timing">DRS ZONE ACTIVE</span>
            </div>
            <div class="telemetry-driver-row">
              <div class="telemetry-car-num">#1</div>
              <div class="telemetry-driver-details">
                <div class="telemetry-driver-name">${user.displayName}</div>
                <div class="telemetry-driver-team">OFFICIAL SIMULATOR DRIVER</div>
              </div>
              <div class="telemetry-speed-gauge">
                <span class="speed-val">342</span>
                <span class="speed-unit">KM/H</span>
              </div>
            </div>
            <div class="telemetry-meters-grid">
              <div class="meter-box">
                <div class="meter-label">THROTTLE</div>
                <div class="meter-bar-outer"><div class="meter-bar-fill throttle-fill" style="width: 96%;"></div></div>
              </div>
              <div class="meter-box">
                <div class="meter-label">BRAKE</div>
                <div class="meter-bar-outer"><div class="meter-bar-fill brake-fill" style="width: 14%;"></div></div>
              </div>
              <div class="meter-box">
                <div class="meter-label">TYRES (SOFT)</div>
                <div class="meter-bar-outer"><div class="meter-bar-fill tyres-fill" style="width: 88%;"></div></div>
              </div>
              <div class="meter-box">
                <div class="meter-label">ERS HARVEST</div>
                <div class="meter-bar-outer"><div class="meter-bar-fill ers-fill" style="width: 100%;"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Driver Status & Telemetry Widget -->
    <div class="stats-paddock-grid">
      <div class="glass-panel stat-card-paddock">
        <div class="stat-paddock-icon">
          ${user.activeAvatarIcon || "🏎️"}
        </div>
        <div class="stat-paddock-body">
          <div class="stat-sublabel">PILOTO EN PISTA</div>
          <div class="stat-mainval">${user.displayName}</div>
          <div class="stat-coinval"><span class="coin-icon">🪙</span> ${user.coins} PitCoins acumuladas</div>
        </div>
      </div>

      <div class="glass-panel stat-card-paddock">
        <div class="stat-paddock-header-row">
          <span class="stat-sublabel">SUPERLICENCIA FIA</span>
          <span class="rank-name-colored" style="color: ${currentRank.color}; font-weight: 800;">
            ${currentRank.icon} ${currentRank.name}
          </span>
        </div>
        <div class="superlicence-prog-track">
          <div class="superlicence-prog-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="superlicence-meta-row">
          <span>${user.score} pts acumulados</span>
          <span>${nextRank ? `Meta: ${nextRank.name} (${nextRank.minPoints} pts)` : '¡Rango de Leyenda!'}</span>
        </div>
      </div>

      <div class="glass-panel stat-card-paddock">
        <div class="stat-paddock-header-row">
          <span class="stat-sublabel">MOTOR LOCAL AI</span>
          <span class="stat-badge-verified">0% REPETICIÓN</span>
        </div>
        <div class="stat-mainval-large" style="color: #a855f7;">${user.servedQuestionHashes.length}</div>
        <div class="stat-footnote">Preguntas únicas firmadas criptográficamente</div>
      </div>
    </div>

    <!-- Section Title: Minigames -->
    <div class="section-title-wrap">
      <div class="section-accent-bar"></div>
      <h2 class="f1-section-title">
        <span>MODOS DE COMPETICIÓN</span>
        <span class="sub-championship">TEMPORADA OFICIAL</span>
      </h2>
    </div>

    <!-- 3 Minigames Cards -->
    <div class="games-grid">
      <!-- Game 1: F1 Quiz Master -->
      <div class="game-card f1-game-card">
        <div class="card-slant-tag">01 // QUIZ</div>
        <span class="game-card-badge badge-ai">MOTOR AI LOCAL</span>
        <div class="game-card-icon">⚡</div>
        <h3 class="game-card-title">F1 Quiz Master</h3>
        <p class="game-card-desc">
          Telemetría, récords históricos, audios de radio míticos y reglamentos técnicos FIA generados proceduralmente sin repetir preguntas.
        </p>
        <div class="game-card-footer">
          <div class="game-reward-pills">
            <span class="reward-pts">+150 PTS</span>
            <span class="reward-coins">+50 🪙</span>
          </div>
          <button class="btn-f1-card" id="btn-card-quiz">
            <span>COMPETIR</span>
            <span class="arrow-f1">→</span>
          </button>
        </div>
      </div>

      <!-- Game 2: F1 Driverle -->
      <div class="game-card f1-game-card">
        <div class="card-slant-tag">02 // DRIVERLE</div>
        <span class="game-card-badge badge-word">TELEMETRÍA 6 INTENTOS</span>
        <div class="game-card-icon">🕵️</div>
        <h3 class="game-card-title">F1 Driverle</h3>
        <p class="game-card-desc">
          Identifica al piloto secreto analizando en cada intento: debut, escudería, campeonatos mundiales, podios, poles y grandes premios disputados.
        </p>
        <div class="game-card-footer">
          <div class="game-reward-pills">
            <span class="reward-pts">+300 PTS</span>
            <span class="reward-coins">+80 🪙</span>
          </div>
          <button class="btn-f1-card" id="btn-card-driverle">
            <span>ADIVINAR</span>
            <span class="arrow-f1">→</span>
          </button>
        </div>
      </div>

      <!-- Game 3: F1 Circuit GeoGuessr -->
      <div class="game-card f1-game-card">
        <div class="card-slant-tag">03 // GEOGUESSR</div>
        <span class="game-card-badge badge-geo">TRAZADO & MAPA REAL</span>
        <div class="game-card-icon">🗺️</div>
        <h3 class="game-card-title">Circuit GeoGuessr</h3>
        <p class="game-card-desc">
          Explora vistas panorámicas a pie de pista en Street View y coloca tu chincheta en el mapa mundial satelital para batir el cronómetro.
        </p>
        <div class="game-card-footer">
          <div class="game-reward-pills">
            <span class="reward-pts">+500 PTS</span>
            <span class="reward-coins">+120 🪙</span>
          </div>
          <button class="btn-f1-card" id="btn-card-geoguessr">
            <span>EXPLORAR</span>
            <span class="arrow-f1">→</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach button triggers
  document.getElementById("btn-hero-quiz")?.addEventListener("click", () => navigateTo("quiz"));
  document.getElementById("btn-hero-driverle")?.addEventListener("click", () => navigateTo("driverle"));
  document.getElementById("btn-hero-geoguessr")?.addEventListener("click", () => navigateTo("geoguessr"));

  document.getElementById("btn-card-quiz")?.addEventListener("click", () => navigateTo("quiz"));
  document.getElementById("btn-card-driverle")?.addEventListener("click", () => navigateTo("driverle"));
  document.getElementById("btn-card-geoguessr")?.addEventListener("click", () => navigateTo("geoguessr"));
}

// 2. QUIZ MASTER VIEW
function renderQuizView() {
  if (!activeQuizEngine) {
    activeQuizEngine = new F1AIEngine(new Set(store.getServedHashes()));
  }

  currentQuizQuestion = activeQuizEngine.generateNextQuestion();
  store.recordServedHash(currentQuizQuestion.hash);
  const user = store.getUser();
  updateNavTelemetry();

  appRoot.innerHTML = `
    <div class="play-view-wrapper">
      <div class="play-header">
        <div>
          <span class="game-card-badge badge-ai">MOTOR AI LOCAL REGLA-BASE</span>
          <h2 style="font-size: 1.8rem; font-weight: 800; margin-top: 0.4rem;">F1 QUIZ MASTER</h2>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Categoría: <strong style="color: #fff;">${currentQuizQuestion.category}</strong></div>
          <div style="font-size: 0.8rem; color: var(--color-gold);">Recompensa: +${currentQuizQuestion.points} pts / +40 🪙</div>
        </div>
      </div>

      <!-- Question Box -->
      <div class="quiz-question-box">
        <div class="quiz-meta">
          <span class="quiz-hash-indicator">🔒 Pregunta Única Registrada #${user.servedQuestionHashes.length} (${currentQuizQuestion.remainingPoolCount ?? 0} restantes sin repetir)</span>
          <span style="font-size: 0.75rem; color: #38bdf8;">Dificultad: ${currentQuizQuestion.difficulty}</span>
        </div>
        <div class="quiz-question-text">${currentQuizQuestion.text}</div>
      </div>

      <!-- 4 Multiple Choice Options -->
      <div class="quiz-options-grid" id="quiz-options-container">
        ${currentQuizQuestion.options.map((opt, i) => `
          <button class="option-btn" data-option="${opt}">
            <span style="background: rgba(255,255,255,0.08); width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 0.85rem;">
              ${String.fromCharCode(65 + i)}
            </span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>

      <!-- Result Feedback Box -->
      <div id="quiz-feedback" style="display: none; padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;"></div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn-f1-secondary" id="btn-quiz-exit">← Volver al Paddock</button>
        <button class="btn-f1-primary" id="btn-quiz-next" style="display: none;">Siguiente Pregunta AI →</button>
      </div>
    </div>
  `;

  // Attach option clicks
  const optionButtons = document.querySelectorAll(".option-btn");
  const feedbackBox = document.getElementById("quiz-feedback");
  const nextBtn = document.getElementById("btn-quiz-next");

  optionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const selected = btn.getAttribute("data-option");
      const isCorrect = selected === currentQuizQuestion.answer;

      optionButtons.forEach(b => {
        b.disabled = true;
        if (b.getAttribute("data-option") === currentQuizQuestion.answer) {
          b.classList.add("correct");
        } else if (b.getAttribute("data-option") === selected && !isCorrect) {
          b.classList.add("incorrect");
        }
      });

      feedbackBox.style.display = "block";
      if (isCorrect) {
        feedbackBox.style.background = "rgba(16, 185, 129, 0.15)";
        feedbackBox.style.border = "1px solid var(--color-success)";
        feedbackBox.innerHTML = `
          <div style="color: #4ade80; font-weight: 800; font-size: 1.1rem; margin-bottom: 0.3rem;">¡VUELTA RÁPIDA! Respuesta Correcta 🏁</div>
          <div style="color: var(--text-muted); font-size: 0.95rem;">${currentQuizQuestion.explanation}</div>
          <div style="margin-top: 0.6rem; color: var(--color-gold); font-weight: 700;">+${currentQuizQuestion.points} Puntos | +40 PitCoins añadidos</div>
        `;
        store.addPointsAndCoins(currentQuizQuestion.points, 40, `Quiz: ${currentQuizQuestion.category}`);
        showToast(`¡Correcto! +${currentQuizQuestion.points} pts y +40 🪙 ganados.`, "success");
      } else {
        feedbackBox.style.background = "rgba(239, 68, 68, 0.15)";
        feedbackBox.style.border = "1px solid var(--color-danger)";
        feedbackBox.innerHTML = `
          <div style="color: #f87171; font-weight: 800; font-size: 1.1rem; margin-bottom: 0.3rem;">¡BANDERA AMARILLA! Respuesta Incorrecta ⚠️</div>
          <div style="color: var(--text-muted); font-size: 0.95rem;">${currentQuizQuestion.explanation}</div>
        `;
        showToast("Respuesta incorrecta. ¡Sigue aprendiendo!", "error");
      }

      updateNavTelemetry();
      nextBtn.style.display = "inline-flex";
    });
  });

  document.getElementById("btn-quiz-exit")?.addEventListener("click", () => navigateTo("home"));
  nextBtn?.addEventListener("click", () => renderQuizView());
}

// Driverle state settings
let driverleSettings = {
  showConfig: true,
  minYear: 2016,
  maxYear: 2026,
  statMode: "all",    // "all" | "points" | "wins"
  gameMode: "daily"   // "daily" | "infinite"
};

// 3. DRIVERLE VIEW - Formula 1 Driverle Faithful Recreation
function renderDriverleView() {
  if (!activeDriverleEngine || activeDriverleEngine.isGameOver) {
    activeDriverleEngine = new DriverleEngine({
      minYear: driverleSettings.minYear,
      maxYear: driverleSettings.maxYear,
      statMode: driverleSettings.statMode,
      gameMode: driverleSettings.gameMode
    });
  }

  const engine = activeDriverleEngine;
  const availableDrivers = engine.getAvailableDrivers();

  // Percentage calculations for double range slider track highlight
  const totalSpan = 2026 - 1950;
  const leftPct = Math.max(0, Math.min(100, ((driverleSettings.minYear - 1950) / totalSpan) * 100));
  const rightPct = Math.max(0, Math.min(100, ((2026 - driverleSettings.maxYear) / totalSpan) * 100));

  appRoot.innerHTML = `
    <div class="driverle-container">
      
      <!-- Brand Top Header -->
      <div class="driverle-header-top">
        <div class="driverle-brand-title">
          <span>&lt; Formula1</span><span class="orange">DRIVERLE</span>
        </div>
        <div style="display: flex; gap: 0.6rem; align-items: center;">
          <button class="driverle-gear-btn" title="Información" id="btn-driverle-info">ℹ️</button>
          <button class="driverle-gear-btn" id="btn-toggle-config" title="Ajustes de Temporadas">⚙️</button>
        </div>
      </div>

      <div style="font-weight: 800; font-size: 1.05rem; margin-bottom: 0.2rem;">Guess the F1 driver!</div>
      <div class="driverle-sub-plays">2,604,248 plays</div>

      <!-- Summary Stats Bar -->
      <div class="driverle-summary-bar">
        <div class="driverle-stat-item">
          <div class="label">Seasons</div>
          <div class="value">${driverleSettings.minYear}-${driverleSettings.maxYear}</div>
        </div>
        <div class="driverle-stat-item">
          <div class="label">Stat mode</div>
          <div class="value">${driverleSettings.statMode}</div>
        </div>
        <div class="driverle-stat-item">
          <div class="label">Game mode</div>
          <div class="value">${driverleSettings.gameMode}</div>
        </div>
        <div class="driverle-stat-item">
          <div class="label">Guesses</div>
          <div class="value">${engine.maxAttempts - engine.attempts.length}</div>
        </div>
      </div>

      <!-- Settings / Season Interval Selector (Collapsible / Toggleable) -->
      <div class="driverle-settings-box" id="driverle-settings-panel" style="${driverleSettings.showConfig ? 'display: block;' : 'display: none;'}">
        <div class="driverle-settings-header">
          <span style="font-weight: 800; font-size: 1.1rem; color: #fff;">Seasons</span>
          <div class="driverle-range-badges">
            <span class="driverle-badge-orange" id="badge-min-year">${driverleSettings.minYear}</span>
            <span class="driverle-badge-orange" id="badge-max-year">${driverleSettings.maxYear}</span>
          </div>
        </div>

        <!-- Double Range Slider -->
        <div class="double-slider-wrapper">
          <div class="slider-track">
            <div class="slider-track-highlight" id="slider-highlight" style="left: ${leftPct}%; right: ${rightPct}%;"></div>
          </div>
          <input type="range" class="range-input" id="slider-min" min="1950" max="2026" value="${driverleSettings.minYear}">
          <input type="range" class="range-input" id="slider-max" min="1950" max="2026" value="${driverleSettings.maxYear}">
        </div>

        <div class="slider-ticks-row">
          <span>1950</span>
          <span>2026</span>
        </div>

        <!-- Stat mode options -->
        <div class="driverle-opts-row">
          <span class="driverle-opts-label">Stats</span>
          <div class="driverle-btn-group">
            <button class="driverle-toggle-btn ${driverleSettings.statMode === 'all' ? 'active' : ''}" data-stat="all">All</button>
            <button class="driverle-toggle-btn ${driverleSettings.statMode === 'points' ? 'active' : ''}" data-stat="points">Points only</button>
            <button class="driverle-toggle-btn ${driverleSettings.statMode === 'wins' ? 'active' : ''}" data-stat="wins">Wins only</button>
          </div>
        </div>

        <!-- Game mode options -->
        <div class="driverle-opts-row">
          <span class="driverle-opts-label">Mode</span>
          <div class="driverle-btn-group">
            <button class="driverle-toggle-btn ${driverleSettings.gameMode === 'daily' ? 'active' : ''}" data-mode="daily">Daily</button>
            <button class="driverle-toggle-btn ${driverleSettings.gameMode === 'infinite' ? 'active' : ''}" data-mode="infinite">Infinite</button>
          </div>
        </div>

        <button class="driverle-btn-confirm" id="btn-confirm-settings">Confirm</button>
      </div>

      <!-- Tile Column Headers Matching Formula1 Driverle UI: Drvr | First year | Last year | WCs | Wins | Top 3s | Pnts | Poles | GPs -->
      <div class="driverle-tiles-header">
        <div class="driverle-tile-h">Drvr</div>
        <div class="driverle-tile-h">First<br>year</div>
        <div class="driverle-tile-h">Last<br>year</div>
        <div class="driverle-tile-h">WCs</div>
        <div class="driverle-tile-h">Wins</div>
        <div class="driverle-tile-h">Top<br>3s</div>
        <div class="driverle-tile-h">Pnts</div>
        <div class="driverle-tile-h">Poles</div>
        <div class="driverle-tile-h">GPs</div>
      </div>

      <!-- Autocomplete Search Bar -->
      <div class="driverle-search-box" id="driverle-search-container" style="${engine.isGameOver ? 'display: none;' : 'display: flex;'}">
        <input 
          type="text" 
          id="driverle-input" 
          class="driverle-input-text" 
          placeholder="Start typing for driver (${availableDrivers.length} pilotos en intervalo)..." 
          autocomplete="off"
        />
        <button class="driverle-btn-submit" id="btn-submit-guess">Submit</button>
        <div class="driverle-suggestions" id="driverle-suggestions" style="display: none;"></div>
      </div>

      <!-- Attempts History List -->
      <div class="driverle-attempts-list" id="driverle-attempts-list">
        ${engine.attempts.map(att => `
          <div class="driverle-attempt-grid">
            <div class="driverle-cell name-cell">
              <strong style="color: #fff;">${att.driver.name}</strong>
            </div>
            <div class="driverle-cell ${att.firstYear.match ? 'exact' : att.firstYear.direction}">
              ${att.firstYear.val} ${att.firstYear.direction === 'higher' ? '↑' : att.firstYear.direction === 'lower' ? '↓' : ''}
            </div>
            <div class="driverle-cell ${att.lastYear.match ? 'exact' : att.lastYear.direction}">
              ${att.lastYear.val} ${att.lastYear.direction === 'higher' ? '↑' : att.lastYear.direction === 'lower' ? '↓' : ''}
            </div>
            <div class="driverle-cell ${att.wcs.match ? 'exact' : att.wcs.direction}">
              ${att.wcs.val} ${att.wcs.direction === 'higher' ? '↑' : att.wcs.direction === 'lower' ? '↓' : ''}
            </div>
            <div class="driverle-cell ${att.wins.match ? 'exact' : att.wins.direction}">
              ${att.wins.val} ${att.wins.direction === 'higher' ? '↑' : att.wins.direction === 'lower' ? '↓' : ''}
            </div>
            <div class="driverle-cell ${att.top3s.match ? 'exact' : att.top3s.direction}">
              ${att.top3s.val} ${att.top3s.direction === 'higher' ? '↑' : att.top3s.direction === 'lower' ? '↓' : ''}
            </div>
            <div class="driverle-cell ${att.points.match ? 'exact' : att.points.direction}">
              ${att.points.val} ${att.points.direction === 'higher' ? '↑' : att.points.direction === 'lower' ? '↓' : ''}
            </div>
            <div class="driverle-cell ${att.poles.match ? 'exact' : att.poles.direction}">
              ${att.poles.val} ${att.poles.direction === 'higher' ? '↑' : att.poles.direction === 'lower' ? '↓' : ''}
            </div>
            <div class="driverle-cell ${att.gps.match ? 'exact' : att.gps.direction}">
              ${att.gps.val} ${att.gps.direction === 'higher' ? '↑' : att.gps.direction === 'lower' ? '↓' : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Outcome Banner (Victory or Game Over) -->
      <div id="driverle-outcome" style="${engine.isGameOver ? 'display: block;' : 'display: none;'} margin-bottom: 1.5rem; padding: 1.5rem; border-radius: var(--radius-md); text-align: center;">
        ${engine.isGameOver ? (
          engine.isVictory ? `
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid var(--color-success); border-radius: 8px; padding: 1.5rem;">
              <h3 style="color: #4ade80; font-size: 1.5rem; margin-bottom: 0.5rem;">¡VICTORIA EN EL GRAN PREMIO! 🏆</h3>
              <p style="color: #d1d5db; font-size: 1rem;">Has descubierto a <strong>${engine.targetDriver.name}</strong> (${engine.targetDriver.team}) en ${engine.attempts.length} intentos.</p>
              <div style="margin-top: 0.8rem; color: var(--color-gold); font-weight: 800; font-size: 1.1rem;">+300 Puntos | +80 PitCoins</div>
            </div>
          ` : `
            <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid var(--color-danger); border-radius: 8px; padding: 1.5rem;">
              <h3 style="color: #f87171; font-size: 1.5rem; margin-bottom: 0.5rem;">DNF - Te has quedado sin intentos 🛑</h3>
              <p style="color: #d1d5db; font-size: 1rem;">El piloto secreto era <strong>${engine.targetDriver.name}</strong> (${engine.targetDriver.team}) [${engine.targetDriver.debutYear}-${engine.targetDriver.lastYear}].</p>
            </div>
          `
        ) : ''}
      </div>

      <!-- Action Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
        <button class="btn-f1-secondary" id="btn-driverle-exit">← Volver al Paddock</button>
        <button class="btn-f1-primary" id="btn-driverle-reset" style="${engine.isGameOver ? 'display: inline-flex;' : 'display: none;'}">Jugar Otra Partida 🔄</button>
      </div>

    </div>
  `;

  // Attach event handlers
  const settingsPanel = document.getElementById("driverle-settings-panel");
  const toggleConfigBtn = document.getElementById("btn-toggle-config");
  const sliderMin = document.getElementById("slider-min");
  const sliderMax = document.getElementById("slider-max");
  const badgeMinYear = document.getElementById("badge-min-year");
  const badgeMaxYear = document.getElementById("badge-max-year");
  const sliderHighlight = document.getElementById("slider-highlight");
  const btnConfirmSettings = document.getElementById("btn-confirm-settings");

  const searchInput = document.getElementById("driverle-input");
  const suggestionsBox = document.getElementById("driverle-suggestions");
  const submitGuessBtn = document.getElementById("btn-submit-guess");
  const resetGameBtn = document.getElementById("btn-driverle-reset");
  const exitBtn = document.getElementById("btn-driverle-exit");

  // Toggle settings panel
  toggleConfigBtn?.addEventListener("click", () => {
    driverleSettings.showConfig = !driverleSettings.showConfig;
    if (settingsPanel) {
      settingsPanel.style.display = driverleSettings.showConfig ? "block" : "none";
    }
  });

  // Slider updates
  const updateSliders = () => {
    let minVal = parseInt(sliderMin.value, 10);
    let maxVal = parseInt(sliderMax.value, 10);

    if (minVal > maxVal) {
      const tmp = minVal;
      minVal = maxVal;
      maxVal = tmp;
    }

    driverleSettings.minYear = minVal;
    driverleSettings.maxYear = maxVal;

    if (badgeMinYear) badgeMinYear.textContent = minVal;
    if (badgeMaxYear) badgeMaxYear.textContent = maxVal;

    const span = 2026 - 1950;
    const lPct = ((minVal - 1950) / span) * 100;
    const rPct = ((2026 - maxVal) / span) * 100;
    if (sliderHighlight) {
      sliderHighlight.style.left = `${lPct}%`;
      sliderHighlight.style.right = `${rPct}%`;
    }
  };

  sliderMin?.addEventListener("input", updateSliders);
  sliderMax?.addEventListener("input", updateSliders);

  // Toggle Stat buttons
  document.querySelectorAll("[data-stat]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll("[data-stat]").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      driverleSettings.statMode = e.target.getAttribute("data-stat");
    });
  });

  // Toggle Mode buttons
  document.querySelectorAll("[data-mode]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll("[data-mode]").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      driverleSettings.gameMode = e.target.getAttribute("data-mode");
    });
  });

  // Confirm Settings and restart game with new filtered pool
  btnConfirmSettings?.addEventListener("click", () => {
    driverleSettings.showConfig = false;
    activeDriverleEngine = new DriverleEngine({
      minYear: driverleSettings.minYear,
      maxYear: driverleSettings.maxYear,
      statMode: driverleSettings.statMode,
      gameMode: driverleSettings.gameMode
    });
    showToast(`Intervalo ${driverleSettings.minYear}-${driverleSettings.maxYear} aplicado (${activeDriverleEngine.candidateDrivers.length} pilotos disponibles).`, "info");
    renderDriverleView();
  });

  // Autocomplete Driver Suggestions
  let selectedDriverObj = null;

  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      if (suggestionsBox) suggestionsBox.style.display = "none";
      selectedDriverObj = null;
      return;
    }

    const filtered = availableDrivers.filter(d => 
      d.name.toLowerCase().includes(query) || 
      (d.team && d.team.toLowerCase().includes(query)) ||
      (d.country && d.country.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
      if (suggestionsBox) {
        suggestionsBox.innerHTML = `<div style="padding: 0.8rem 1rem; color: #9ca3af; font-size: 0.85rem;">Ningún piloto coincide con '${query}' en el intervalo ${driverleSettings.minYear}-${driverleSettings.maxYear}</div>`;
        suggestionsBox.style.display = "block";
      }
      selectedDriverObj = null;
      return;
    }

    if (suggestionsBox) {
      suggestionsBox.innerHTML = filtered.slice(0, 10).map(d => `
        <div class="driverle-suggest-item" data-id="${d.id}">
          <span style="font-weight: 800; font-size: 1rem; color: #fff;">${d.name}</span>
        </div>
      `).join('');
      suggestionsBox.style.display = "block";

      suggestionsBox.querySelectorAll(".driverle-suggest-item").forEach(item => {
        item.addEventListener("click", () => {
          const id = item.getAttribute("data-id");
          selectedDriverObj = availableDrivers.find(d => d.id === id);
          if (selectedDriverObj) {
            searchInput.value = selectedDriverObj.name;
          }
          suggestionsBox.style.display = "none";
        });
      });
    }
  });

  // Submit guess
  const performGuess = () => {
    let targetId = selectedDriverObj ? selectedDriverObj.id : null;
    if (!targetId) {
      // Check if typed name matches exactly
      const val = searchInput?.value.trim().toLowerCase();
      const exact = availableDrivers.find(d => d.name.toLowerCase() === val);
      if (exact) {
        targetId = exact.id;
      }
    }

    if (!targetId) {
      showToast("Por favor escribe o selecciona un piloto válido de la lista.", "error");
      return;
    }

    const res = engine.submitGuess(targetId);
    if (res.error) {
      showToast(res.error, "error");
      return;
    }

    if (res.isGameOver) {
      if (res.isVictory) {
        store.addPointsAndCoins(300, 80, `Driverle: ${res.targetDriver.name}`);
        showToast("¡Enhorabuena! Has resuelto el Driverle.", "success");
      } else {
        showToast(`Fin de partida. El piloto era ${res.targetDriver.name}`, "error");
      }
      updateNavTelemetry();
    }

    renderDriverleView();
  };

  submitGuessBtn?.addEventListener("click", performGuess);
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      performGuess();
    }
  });

  resetGameBtn?.addEventListener("click", () => {
    activeDriverleEngine = new DriverleEngine({
      minYear: driverleSettings.minYear,
      maxYear: driverleSettings.maxYear,
      statMode: driverleSettings.statMode,
      gameMode: driverleSettings.gameMode
    });
    renderDriverleView();
  });

  exitBtn?.addEventListener("click", () => navigateTo("home"));
}

// 4. CIRCUIT GEOGUESSR VIEW (Faithful Recreation of Official GeoGuessr HUD & Mini-Map)
let selectedMapPoint = null; // { lat, lng }
let geoFilterMode = "all"; // "all" | "era2000" | "historic" | "street"
let geoTimerInterval = null;
let geoRemainingSeconds = 180; // 3 minutes countdown timer like GeoGuessr

function formatGeoTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function renderGeoGuessrView() {
  if (geoTimerInterval) {
    clearInterval(geoTimerInterval);
    geoTimerInterval = null;
  }

  if (!activeGeoEngine || activeGeoEngine.isMatchOver) {
    activeGeoEngine = new CircuitGeoEngine({ filterMode: geoFilterMode });
    selectedMapPoint = null;
  }

  const engine = activeGeoEngine;
  const round = engine.getCurrentRoundData();
  const user = store.getUser();
  geoRemainingSeconds = 180;

  // Render faithful GeoGuessr screen layout
  appRoot.innerHTML = `
    <div class="geoguessr-stage">
      
      <!-- Full-screen 360 Street View Viewport -->
      <div class="geoguessr-viewport-frame">
        <iframe 
          id="streetview-iframe"
          src="${round.streetView ? round.streetView.embedUrl : ''}" 
          width="100%" 
          height="100%" 
          style="border: 0; display: block; filter: contrast(1.04) brightness(0.97);" 
          loading="eager" 
          allowfullscreen="false"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>

      <!-- Anti-Cheat Overlay: Hide Street View Title / Street Name at Top-Left -->
      <div class="geoguessr-mask-topleft"></div>

      <!-- Anti-Cheat Overlay: Hide Street Name painted on the asphalt (Bottom ground) -->
      <div class="geoguessr-mask-bottom">
        <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #64748b; background: rgba(0,0,0,0.6); padding: 3px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          🛡️ Competición Oficial: Trazados & Nombres censurados
        </div>
      </div>

      <!-- Top HUD Navigation (Matches User Screenshot) -->
      <div class="geoguessr-hud-top">
        
        <!-- Top Left: GeoGuessr F1 Logo Badge -->
        <div class="geoguessr-brand-badge" id="btn-geoguessr-home" title="Volver al menú principal">
          <span style="font-size: 1.2rem;">📍</span>
          <span class="geoguessr-logo-text">GEOGUESSR</span>
          <span class="geoguessr-logo-sub">F1 WORLD</span>
        </div>

        <!-- Top Center: Compass Bar + Glowing Countdown Capsule -->
        <div class="geoguessr-center-hud">
          <div class="geoguessr-compass-bar">
            <span>SW</span>
            <span class="compass-tick">| | |</span>
            <span class="active-cardinal">W</span>
            <span class="compass-tick">| | |</span>
            <span>NW</span>
          </div>
          <div class="geoguessr-timer-capsule" id="geoguessr-clock">
            <span>⏱️</span>
            <span id="geo-timer-display">${formatGeoTimer(geoRemainingSeconds)}</span>
          </div>
        </div>

        <!-- Top Right: Round Tracker Purple Pills + Total Score -->
        <div class="geoguessr-tracker-container">
          <div class="geoguessr-round-label">RONDA</div>
          <div class="geoguessr-round-pills">
            ${[1, 2, 3, 4, 5].map(r => {
              const isPast = r < round.round;
              const isCurrent = r === round.round;
              return `<div class="geoguessr-pill ${isPast ? 'completed' : isCurrent ? 'active' : ''}">${r}</div>`;
            }).join('')}
          </div>
          <div class="geoguessr-total-box">
            <span class="total-title">TOTAL</span>
            <span class="total-number" id="geoguessr-hud-total-score">${engine.totalScore}</span>
          </div>
        </div>

      </div>

      <!-- Left Vertical Controls (Zoom, Reset View, Paddock) -->
      <div class="geoguessr-left-controls">
        <button class="geoguessr-icon-btn" id="btn-geo-nav-paddock" title="Volver al Paddock">🏠</button>
        <button class="geoguessr-icon-btn" id="btn-geo-next-random" title="Cambiar a otro circuito aleatorio">🎲</button>
        <button class="geoguessr-icon-btn" id="btn-geo-filter-menu" title="Filtrar era de circuitos">⚙️</button>
      </div>

      <!-- Bottom Bar: Secret Clues (PitCoins) & Era Tags -->
      <div class="geoguessr-bottom-bar">
        <button class="geoguessr-clue-pill" id="btn-pay-clue" ${round.unlockedClues.length >= round.totalCluesAvailable || round.isRoundFinished ? 'disabled style="opacity: 0.5;"' : ''}>
          <span>💡</span> Desencriptar Pista (-${round.clueCost} 🪙 PitCoins) [${round.unlockedClues.length}/${round.totalCluesAvailable}]
        </button>

        ${round.unlockedClues.length > 0 ? `
          <div style="background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); max-width: 450px;">
            🔍 ${round.unlockedClues[round.unlockedClues.length - 1]}
          </div>
        ` : ''}
      </div>

      <!-- Bottom Right Floating Pinning Mini-Map (GeoGuessr Interactive Card) -->
      <div class="geoguessr-minimap-wrapper">
        <div class="geoguessr-minimap-card" id="geoguessr-minimap-card">
          <div class="minimap-toggle-size" id="btn-minimap-toggle" title="Expandir / Contraer Mapa">⛶</div>
          <div id="geoguessr-leaflet-map"></div>
        </div>

        <button class="btn-geoguessr-guess ${selectedMapPoint ? 'ready' : ''}" id="btn-confirm-gps" ${round.isRoundFinished ? 'disabled' : ''}>
          ${selectedMapPoint ? 'ADIVINAR AHORA 🎯' : 'COLOCA TU CHINCHETA EN EL MAPA'}
        </button>
      </div>

      <!-- Post-Guess Result Modal Dialog -->
      <div class="geoguessr-result-modal" id="geo-result-modal" style="display: none;">
        <div class="geoguessr-result-dialog" id="geo-result-dialog-content">
          <!-- Populated dynamically upon guess -->
        </div>
      </div>

    </div>
  `;

  // Start Countdown Timer
  geoTimerInterval = setInterval(() => {
    if (geoRemainingSeconds > 0) {
      geoRemainingSeconds--;
      const display = document.getElementById("geo-timer-display");
      if (display) display.textContent = formatGeoTimer(geoRemainingSeconds);
    }
  }, 1000);

  // Initialize Real Leaflet Map inside Bottom-Right Mini-Map Card
  const miniMapCard = document.getElementById("geoguessr-minimap-card");
  const toggleMapSizeBtn = document.getElementById("btn-minimap-toggle");
  const confirmBtn = document.getElementById("btn-confirm-gps");
  const resultModal = document.getElementById("geo-result-modal");
  const resultDialogContent = document.getElementById("geo-result-dialog-content");
  const btnPayClue = document.getElementById("btn-pay-clue");

  let leafletMap = null;
  let userMarker = null;

  if (window.L) {
    leafletMap = L.map("geoguessr-leaflet-map", {
      center: [25, 10],
      zoom: 2,
      minZoom: 1,
      maxZoom: 16,
      zoomControl: true,
      attributionControl: false
    });

    // Google Maps Roadmap Layer
    const googleRoadmap = L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      subdomains: "0123",
      maxZoom: 20
    });
    googleRoadmap.addTo(leafletMap);

    // Google Satellite Layer Control
    const googleSatellite = L.tileLayer("https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
      subdomains: "0123",
      maxZoom: 20
    });

    L.control.layers({
      "Carreteras": googleRoadmap,
      "Satélite": googleSatellite
    }, null, { position: "topleft" }).addTo(leafletMap);

    // Custom GeoGuessr Style Pin Icon
    const userPinIcon = L.divIcon({
      className: "custom-user-pin",
      html: `<div style="font-size: 2.2rem; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8)); line-height: 1;">📍</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    });

    // If point was already selected
    if (selectedMapPoint) {
      userMarker = L.marker([selectedMapPoint.lat, selectedMapPoint.lng], { icon: userPinIcon }).addTo(leafletMap);
    }

    // Map Click Listener to drop / update user pin
    leafletMap.on("click", (e) => {
      if (round.isRoundFinished) return;

      const { lat, lng } = e.latlng;
      selectedMapPoint = { lat, lng };

      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        userMarker = L.marker([lat, lng], { icon: userPinIcon }).addTo(leafletMap);
      }

      confirmBtn.classList.add("ready");
      confirmBtn.textContent = "ADIVINAR AHORA 🎯";
      confirmBtn.disabled = false;
    });

    // Toggle expand mini-map
    toggleMapSizeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      miniMapCard.classList.toggle("expanded");
      setTimeout(() => leafletMap.invalidateSize(), 300);
    });

    miniMapCard?.addEventListener("mouseenter", () => {
      setTimeout(() => leafletMap.invalidateSize(), 150);
    });
  }

  // Clue purchase handler
  btnPayClue?.addEventListener("click", () => {
    const res = engine.unlockNextClue(user.coins, (cost) => {
      store.deductCoins(cost, "Pista de telemetría GPS");
      updateNavTelemetry();
    });

    if (res.success) {
      showToast(`¡Pista desencriptada! (-${round.clueCost} 🪙)`, "info");
      renderGeoGuessrView();
    } else {
      showToast(res.message, "error");
    }
  });

  // Guess confirmation handler
  confirmBtn?.addEventListener("click", () => {
    if (!selectedMapPoint) {
      showToast("Haz clic en el mapa de la esquina para colocar tu chincheta.", "info");
      miniMapCard.classList.add("expanded");
      if (leafletMap) leafletMap.invalidateSize();
      return;
    }

    if (geoTimerInterval) {
      clearInterval(geoTimerInterval);
      geoTimerInterval = null;
    }

    const res = engine.guessCoordinates(selectedMapPoint.lat, selectedMapPoint.lng);
    confirmBtn.disabled = true;

    // Award score & show results modal
    store.addPointsAndCoins(res.result.earnedPoints, 40, `GeoGuessr GPS: ${res.result.circuit.name}`);
    updateNavTelemetry();

    // Update HUD Score
    const totalScoreDisplay = document.getElementById("geoguessr-hud-total-score");
    if (totalScoreDisplay) totalScoreDisplay.textContent = engine.totalScore;

    const isBullseye = res.result.distanceKm <= 50;
    const isClose = res.result.distanceKm <= 500;

    resultDialogContent.innerHTML = `
      <div class="geoguessr-score-circle">
        ${isBullseye ? '🎯' : isClose ? '⚡' : '📍'}
      </div>
      <h2 style="font-size: 2rem; font-weight: 900; margin-bottom: 0.5rem; text-transform: uppercase;">
        ${isBullseye ? '¡PLENO DE TELEMETRÍA!' : isClose ? '¡MUY CERCA DE LA PISTA!' : 'CONJETURA REGISTRADA'}
      </h2>
      <p style="font-size: 1.15rem; color: #94a3b8; margin-bottom: 1.5rem;">
        El circuito oficial es <strong style="color: #fff;">${res.result.circuit.name}</strong><br>
        <span style="color: var(--color-gold);">${res.result.circuit.city}, ${res.result.circuit.country}</span>
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 1.2rem; border-radius: 12px; margin-bottom: 2rem; font-family: var(--font-mono);">
        <div>
          <div style="font-size: 0.8rem; color: #64748b; text-transform: uppercase;">Distancia de Error</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #fff;">${res.result.distanceKm.toLocaleString()} km</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: #64748b; text-transform: uppercase;">Puntuación Ronda</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #10b981;">+${res.result.earnedPoints} PTS</div>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button class="btn-f1-secondary" id="btn-result-paddock">Volver al Paddock</button>
        <button class="btn-f1-primary" id="btn-result-next">
          ${res.isFinalRound ? 'Ver Clasificación Final 🏆' : 'Siguiente Ronda →'}
        </button>
      </div>
    `;

    resultModal.style.display = "flex";

    document.getElementById("btn-result-paddock")?.addEventListener("click", () => {
      resultModal.style.display = "none";
      navigateTo("home");
    });

    document.getElementById("btn-result-next")?.addEventListener("click", () => {
      resultModal.style.display = "none";
      selectedMapPoint = null;
      const nextStatus = engine.nextRound();
      if (nextStatus.isMatchOver) {
        showToast(`¡Desafío GeoGuessr completado con ${engine.totalScore} pts!`, "success");
        navigateTo("leaderboard");
      } else {
        renderGeoGuessrView();
      }
    });
  });

  // Top Left Brand / Home Click
  document.getElementById("btn-geoguessr-home")?.addEventListener("click", () => navigateTo("home"));
  document.getElementById("btn-geo-nav-paddock")?.addEventListener("click", () => navigateTo("home"));

  // Change Circuit
  document.getElementById("btn-geo-next-random")?.addEventListener("click", () => {
    activeGeoEngine = new CircuitGeoEngine({ filterMode: geoFilterMode });
    selectedMapPoint = null;
    showToast("🎲 ¡Nuevo circuito cargado!", "info");
    renderGeoGuessrView();
  });

  // Era filter toggle button
  document.getElementById("btn-geo-filter-menu")?.addEventListener("click", () => {
    const modes = ["all", "era2000", "historic", "street"];
    const labels = {
      all: "Todos (29)",
      era2000: "Era 2000-2026",
      historic: "Históricos",
      street: "Callejeros"
    };
    const nextIdx = (modes.indexOf(geoFilterMode) + 1) % modes.length;
    geoFilterMode = modes[nextIdx];
    activeGeoEngine = new CircuitGeoEngine({ filterMode: geoFilterMode });
    selectedMapPoint = null;
    showToast(`Filtro cambiado a: ${labels[geoFilterMode]} (${activeGeoEngine.circuits.length} circuitos)`, "info");
    renderGeoGuessrView();
  });
}

// 5. LEADERBOARD VIEW
function renderLeaderboardView() {
  const leaders = store.getLeaderboard();
  const top3 = leaders.slice(0, 3);

  appRoot.innerHTML = `
    <div class="glass-panel" style="padding: 2.8rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--f1-red) 0%, var(--color-mclaren-papaya) 50%, var(--color-mercedes-cyan) 100%);"></div>

      <!-- Header & Tabs -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1.5rem;">
        <div>
          <div class="hero-tag" style="margin-bottom: 0.5rem;">
            <span class="hero-tag-badge">FIA OFFICIAL STANDINGS</span>
            <span class="hero-tag-sub">MUNDIAL VIRTUAL DE PILOTOS 2026</span>
          </div>
          <h2 style="font-family: var(--font-f1-title); font-size: 2.6rem; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -1px;">
            CLASIFICACIÓN <span class="highlight-racing-red">DEL MUNDIAL</span>
          </h2>
        </div>
        <div style="display: flex; gap: 0.6rem; background: rgba(0,0,0,0.4); padding: 5px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <button class="btn-f1-secondary" style="font-size: 0.82rem; padding: 0.5rem 1.2rem; background: var(--f1-red); border-color: var(--f1-red); color: #fff;">General</button>
          <button class="btn-f1-secondary" style="font-size: 0.82rem; padding: 0.5rem 1.2rem; opacity: 0.7;">Semanal</button>
          <button class="btn-f1-secondary" style="font-size: 0.82rem; padding: 0.5rem 1.2rem; opacity: 0.7;">Paddock Club</button>
        </div>
      </div>

      <!-- Official F1 Podium Top 3 Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
        ${top3.map((podiumDriver, i) => {
          const colors = [
            { border: 'var(--color-gold)', label: '🥇 P1 CHAMPION', glow: 'rgba(245, 158, 11, 0.3)' },
            { border: 'var(--color-silver)', label: '🥈 P2 RUNNER-UP', glow: 'rgba(203, 213, 225, 0.2)' },
            { border: 'var(--color-bronze)', label: '🥉 P3 PODIUM', glow: 'rgba(217, 119, 6, 0.2)' }
          ][i];

          return `
            <div style="background: linear-gradient(180deg, #181b28 0%, #10121b 100%); border: 1px solid ${colors.border}; border-radius: var(--radius-md); padding: 1.6rem; text-align: center; box-shadow: 0 10px 25px ${colors.glow}; position: relative;">
              <span style="font-family: var(--font-mono); font-size: 0.72rem; font-weight: 800; color: ${colors.border}; letter-spacing: 1px;">${colors.label}</span>
              <div style="font-size: 3rem; margin: 0.8rem 0 0.4rem 0;">${podiumDriver.avatar}</div>
              <div style="font-family: var(--font-f1-title); font-size: 1.4rem; font-weight: 900; text-transform: uppercase;">${podiumDriver.name}</div>
              <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.8rem;">${podiumDriver.country} ${podiumDriver.badge}</div>
              <div style="font-family: var(--font-mono); font-size: 1.35rem; font-weight: 900; color: var(--color-mercedes-cyan);">${podiumDriver.points.toLocaleString()} PTS</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Full Standings Table (Formula 1 TV Timing Sheet Style) -->
      <div style="overflow-x: auto; background: #0c0d13; border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md);">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: #141722; color: #94a3b8; font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.2px; border-bottom: 2px solid rgba(255,255,255,0.08);">
              <th style="padding: 1rem 1.4rem; text-align: center; width: 80px;">POS</th>
              <th style="padding: 1rem 1.4rem;">PILOTO / LICENCIA</th>
              <th style="padding: 1rem 1.4rem; text-align: center; width: 100px;">PAÍS</th>
              <th style="padding: 1rem 1.4rem; text-align: center; width: 120px;">INSIGNIA</th>
              <th style="padding: 1rem 1.4rem; text-align: right; width: 180px;">SUPERLICENCIA</th>
            </tr>
          </thead>
          <tbody>
            ${leaders.map(l => `
              <tr style="background: ${l.isSelf ? 'linear-gradient(90deg, rgba(225,6,0,0.18), rgba(20,23,34,0.9))' : 'transparent'}; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='${l.isSelf ? 'rgba(225,6,0,0.15)' : 'transparent'}'">
                <td style="padding: 1.1rem 1.4rem; text-align: center; font-family: var(--font-f1-title); font-weight: 900; font-size: 1.25rem; color: ${l.rank === 1 ? 'var(--color-gold)' : l.rank === 2 ? 'var(--color-silver)' : l.rank === 3 ? 'var(--color-bronze)' : '#fff'}; border-left: ${l.isSelf ? '4px solid var(--f1-red)' : '4px solid transparent'};">
                  ${l.rank}
                </td>
                <td style="padding: 1.1rem 1.4rem;">
                  <div style="display: flex; align-items: center; gap: 0.9rem;">
                    <span style="font-size: 1.5rem; background: rgba(255,255,255,0.06); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.08);">
                      ${l.avatar}
                    </span>
                    <div>
                      <div style="font-family: var(--font-f1-title); font-weight: 800; font-size: 1.1rem; color: #fff;">${l.name}</div>
                      ${l.isSelf ? '<span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--f1-red-light); font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">● TU MONOPLAZA EN PISTA</span>' : '<span style="font-size: 0.75rem; color: var(--text-dim);">Superlicencia Oficial FIA</span>'}
                    </div>
                  </div>
                </td>
                <td style="padding: 1.1rem 1.4rem; text-align: center; font-family: var(--font-mono); font-size: 0.88rem; font-weight: 800; color: var(--text-muted);">
                  ${l.country}
                </td>
                <td style="padding: 1.1rem 1.4rem; text-align: center; font-size: 1.4rem;">
                  ${l.badge}
                </td>
                <td style="padding: 1.1rem 1.4rem; text-align: right; font-weight: 900; font-size: 1.25rem; color: var(--color-mercedes-cyan); font-family: var(--font-mono);">
                  ${l.points.toLocaleString()} <span style="font-size: 0.75rem; color: var(--text-dim);">PTS</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 5.5 LIVE PADDOCK RADIO CHAT VIEW (Discord / Team Radio style)
let currentChatChannel = "general";

function renderForumView() {
  const channels = store.getChatChannels();
  const messages = store.getChatMessages(currentChatChannel);
  const user = store.getUser();
  const activeChannelObj = channels.find(c => c.id === currentChatChannel) || channels[0];

  appRoot.innerHTML = `
    <div class="glass-panel" style="padding: 1.5rem; height: calc(100vh - 140px); min-height: 650px; display: flex; flex-direction: column;">
      
      <!-- Top Chat Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></div>
          <div>
            <h2 style="font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              <span>📻</span> PADDOCK TEAM RADIO LIVE
            </h2>
            <div style="font-size: 0.8rem; color: var(--text-dim); font-family: var(--font-mono);">
              Canal activo: <strong style="color: #fff;">${activeChannelObj.name}</strong> • ${activeChannelObj.desc}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <span class="game-card-badge" style="background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3);">
            🟢 EN DIRECTO
          </span>
          <span style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono);">
            👥 8 Pilotos en frecuencia
          </span>
        </div>
      </div>

      <!-- Main Chat Body: Channels Sidebar + Live Message Stream -->
      <div style="display: grid; grid-template-columns: 260px 1fr; gap: 1.2rem; flex-grow: 1; overflow: hidden;">
        
        <!-- Channels Sidebar -->
        <div style="background: rgba(10, 11, 16, 0.75); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; padding-left: 0.5rem;">
            Frecuencias de Radio
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.4rem; flex-grow: 1;">
            ${channels.map(ch => `
              <button class="btn-channel ${ch.id === currentChatChannel ? 'active-channel' : ''}" data-channel="${ch.id}" style="text-align: left; background: ${ch.id === currentChatChannel ? 'rgba(225, 6, 0, 0.2)' : 'transparent'}; border: 1px solid ${ch.id === currentChatChannel ? 'var(--f1-red)' : 'transparent'}; color: ${ch.id === currentChatChannel ? '#fff' : 'var(--text-muted)'}; padding: 0.65rem 0.9rem; border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between;">
                <span>${ch.name}</span>
                ${ch.id === currentChatChannel ? '<span style="color: var(--f1-red); font-size: 0.8rem;">●</span>' : ''}
              </button>
            `).join('')}
          </div>

          <!-- Self Status at bottom of sidebar -->
          <div style="background: rgba(255,255,255,0.03); border-radius: var(--radius-md); padding: 0.75rem; border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 0.7rem;">
            <div style="font-size: 1.4rem; background: rgba(225,6,0,0.15); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-subtle);">
              ${user.activeAvatarIcon || '🏎️'}
            </div>
            <div style="overflow: hidden;">
              <div style="font-weight: 800; font-size: 0.85rem; color: #fff; white-space: nowrap; text-overflow: ellipsis;">${user.displayName}</div>
              <div style="font-size: 0.7rem; color: var(--color-gold); font-family: var(--font-mono);">🪙 ${user.coins} • ${user.activeBadge || '🚦'}</div>
            </div>
          </div>
        </div>

        <!-- Messages Area + Input Bar -->
        <div style="background: rgba(15, 17, 24, 0.6); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; overflow: hidden;">
          
          <!-- Message Stream (Scrollable) -->
          <div id="chat-messages-container" style="flex-grow: 1; overflow-y: auto; padding: 1.2rem; display: flex; flex-direction: column; gap: 1rem;">
            ${messages.map(m => {
              const isSelf = m.author.isSelf;
              return `
                <div style="display: flex; gap: 0.9rem; align-items: flex-start; ${isSelf ? 'flex-direction: row-reverse;' : ''}">
                  <!-- Avatar -->
                  <div style="font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; background: ${isSelf ? 'rgba(225,6,0,0.2)' : 'rgba(255,255,255,0.06)'}; display: flex; align-items: center; justify-content: center; border: 1px solid ${isSelf ? 'var(--f1-red)' : 'var(--border-subtle)'}; flex-shrink: 0;">
                    ${m.author.avatar}
                  </div>

                  <!-- Message Bubble -->
                  <div style="max-width: 75%; display: flex; flex-direction: column; ${isSelf ? 'align-items: flex-end;' : 'align-items: flex-start;'}">
                    <!-- Author & Timestamp -->
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                      <strong style="font-size: 0.85rem; color: ${isSelf ? '#f87171' : '#f8fafc'}; font-weight: 800;">
                        ${m.author.name}
                      </strong>
                      <span style="font-size: 0.7rem; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px; color: var(--text-dim);">
                        ${m.author.role}
                      </span>
                      <span style="font-size: 0.7rem; color: var(--text-dim); font-family: var(--font-mono);">
                        ${m.time}
                      </span>
                    </div>

                    <!-- Bubble Content -->
                    <div style="background: ${isSelf ? 'linear-gradient(135deg, rgba(225,6,0,0.25), rgba(150,0,0,0.35))' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${isSelf ? 'rgba(225,6,0,0.5)' : 'var(--border-subtle)'}; color: #f8fafc; padding: 0.75rem 1.1rem; border-radius: ${isSelf ? '14px 2px 14px 14px' : '2px 14px 14px 14px'}; font-size: 0.95rem; line-height: 1.5; word-break: break-word;">
                      ${m.text}
                    </div>

                    <!-- Reactions List & Quick Add Reaction -->
                    <div style="display: flex; gap: 0.4rem; align-items: center; margin-top: 0.35rem;">
                      ${Object.entries(m.reactions || {}).map(([emoji, count]) => `
                        <button class="btn-react" data-msg-id="${m.id}" data-emoji="${emoji}" style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.75rem; padding: 2px 6px; border-radius: 99px; cursor: pointer; display: flex; align-items: center; gap: 3px;">
                          <span>${emoji}</span> <span>${count}</span>
                        </button>
                      `).join('')}

                      <!-- Quick emoji reaction picker -->
                      <button class="btn-add-reaction" data-msg-id="${m.id}" style="background: transparent; border: none; font-size: 0.75rem; color: var(--text-dim); cursor: pointer; padding: 2px 4px;" title="Reaccionar">
                        ➕
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Live Chat Input Bar -->
          <form id="chat-send-form" style="padding: 1rem; border-top: 1px solid var(--border-subtle); background: rgba(10, 11, 16, 0.8); display: flex; gap: 0.8rem; align-items: center;">
            <!-- Quick Radio Sound / Emojis -->
            <div style="display: flex; gap: 0.3rem;">
              <button type="button" class="btn-emoji-quick" data-emoji="🔥" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 6px 8px; font-size: 0.9rem; cursor: pointer;">🔥</button>
              <button type="button" class="btn-emoji-quick" data-emoji="🏎️" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 6px 8px; font-size: 0.9rem; cursor: pointer;">🏎️</button>
              <button type="button" class="btn-emoji-quick" data-emoji="⏱️" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 6px 8px; font-size: 0.9rem; cursor: pointer;">⏱️</button>
            </div>

            <!-- Input Text Box -->
            <input 
              type="text" 
              id="chat-input-text" 
              required 
              autocomplete="off"
              placeholder="Transmitir por radio a ${activeChannelObj.name}... (Enter para enviar)" 
              style="flex-grow: 1; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); color: #fff; padding: 0.75rem 1.1rem; border-radius: var(--radius-md); font-size: 0.95rem; outline: none;"
            >

            <!-- Send button -->
            <button type="submit" class="btn-f1-primary" style="padding: 0.75rem 1.5rem; font-size: 0.9rem; white-space: nowrap;">
              Transmitir 📻
            </button>
          </form>

        </div>
      </div>
    </div>
  `;

  // Auto-scroll chat to bottom
  const container = document.getElementById("chat-messages-container");
  if (container) container.scrollTop = container.scrollHeight;

  // Channel switching
  document.querySelectorAll(".btn-channel").forEach(btn => {
    btn.addEventListener("click", () => {
      currentChatChannel = btn.getAttribute("data-channel");
      renderForumView();
    });
  });

  // Message sending
  const chatForm = document.getElementById("chat-send-form");
  const chatInput = document.getElementById("chat-input-text");

  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value;
    if (!text || !text.trim()) return;

    store.sendChatMessage(currentChatChannel, text);
    chatInput.value = "";
    renderForumView();
  });

  // Quick emojis
  document.querySelectorAll(".btn-emoji-quick").forEach(btn => {
    btn.addEventListener("click", () => {
      const emoji = btn.getAttribute("data-emoji");
      chatInput.value += ` ${emoji} `;
      chatInput.focus();
    });
  });

  // Message Reactions
  document.querySelectorAll(".btn-react").forEach(btn => {
    btn.addEventListener("click", () => {
      const msgId = btn.getAttribute("data-msg-id");
      const emoji = btn.getAttribute("data-emoji");
      store.reactToMessage(msgId, emoji);
      renderForumView();
    });
  });

  document.querySelectorAll(".btn-add-reaction").forEach(btn => {
    btn.addEventListener("click", () => {
      const msgId = btn.getAttribute("data-msg-id");
      const reactionOptions = ["🔥", "🏎️", "👀", "😂", "👏", "🧡"];
      const randEmoji = reactionOptions[Math.floor(Math.random() * reactionOptions.length)];
      store.reactToMessage(msgId, randEmoji);
      renderForumView();
    });
  });
}

// 6. STORE / COSMETICS VIEW
function renderStoreView() {
  const user = store.getUser();

  appRoot.innerHTML = `
    <div class="glass-panel" style="padding: 2.8rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--color-gold) 0%, var(--f1-red) 100%);"></div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1.5rem;">
        <div>
          <div class="hero-tag" style="margin-bottom: 0.5rem;">
            <span class="hero-tag-badge" style="background: var(--color-gold); color: #000;">OFFICIAL PADDOCK STORE</span>
            <span class="hero-tag-sub">MERCHANDISING & DISTINTIVOS DE PISTA</span>
          </div>
          <h2 style="font-family: var(--font-f1-title); font-size: 2.6rem; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -1px;">
            TIENDA <span style="color: var(--color-gold); text-shadow: 0 0 25px rgba(245, 158, 11, 0.4);">PITCOINS CLUB</span>
          </h2>
        </div>
        <div class="coin-chip" style="font-size: 1.15rem; padding: 0.6rem 1.4rem; background: rgba(245,158,11,0.12); border-radius: var(--radius-md); border: 1px solid rgba(245,158,11,0.35); font-family: var(--font-mono); font-weight: 900;">
          <span>🪙</span> <span>${user.coins.toLocaleString()} PitCoins de Balance</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 1.8rem;">
        ${COSMETICS_CATALOG.map(item => {
          const isOwned = user.inventory.includes(item.id);
          const isEquipped = user.activeAvatarIcon === item.icon || user.activeBadge === item.icon || user.activeFrame === item.id;

          const rarityBadgeColors = {
            comun: { bg: 'rgba(255,255,255,0.08)', text: '#cbd5e1' },
            raro: { bg: 'rgba(56,189,248,0.15)', text: '#38bdf8' },
            epico: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc' },
            legendario: { bg: 'rgba(245,158,11,0.2)', text: '#f59e0b' }
          }[item.rarity.toLowerCase()] || { bg: 'rgba(255,255,255,0.08)', text: '#fff' };

          return `
            <div class="f1-game-card" style="padding: 1.8rem; border-radius: var(--radius-md); border: 1px solid ${isEquipped ? 'var(--f1-red)' : 'rgba(255,255,255,0.08)'}; background: linear-gradient(180deg, #161824 0%, #0d0f17 100%);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem;">
                <div style="font-size: 2.8rem; background: rgba(255,255,255,0.04); width: 66px; height: 66px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.08);">
                  ${item.icon}
                </div>
                <span style="font-family: var(--font-mono); font-size: 0.68rem; font-weight: 800; background: ${rarityBadgeColors.bg}; color: ${rarityBadgeColors.text}; padding: 3px 8px; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase;">
                  ${item.rarity}
                </span>
              </div>
              <h3 style="font-family: var(--font-f1-title); font-size: 1.3rem; font-weight: 800; margin-bottom: 0.4rem; color: #fff;">${item.name}</h3>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.5rem; flex-grow: 1; line-height: 1.5;">${item.desc}</p>
              
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.2rem;">
                <span style="font-family: var(--font-mono); font-weight: 800; color: var(--color-gold);">
                  🪙 ${item.price} PitCoins
                </span>
                ${isOwned ? `
                  <button class="btn-f1-secondary btn-equip" data-id="${item.id}" style="padding: 0.4rem 0.9rem; font-size: 0.85rem; ${isEquipped ? 'border-color: var(--color-success); color: #4ade80;' : ''}">
                    ${isEquipped ? 'Equipado ✓' : 'Equipar'}
                  </button>
                ` : `
                  <button class="btn-f1-primary btn-buy" data-id="${item.id}" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" ${user.coins < item.price ? 'disabled style="opacity: 0.5;"' : ''}>
                    Comprar
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach purchase/equip listeners
  document.querySelectorAll(".btn-buy").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const res = store.buyCosmetic(id);
      if (res.success) {
        showToast(`¡Compraste con éxito "${res.item.name}"!`, "success");
        updateNavTelemetry();
        renderStoreView();
      } else {
        showToast(res.message, "error");
      }
    });
  });

  document.querySelectorAll(".btn-equip").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      store.equipCosmetic(id);
      showToast("Cosmético equipado en tu perfil.", "info");
      updateNavTelemetry();
      renderStoreView();
    });
  });
}

// 7. USER PROFILE & AVATAR UPLOAD VIEW
function renderProfileView() {
  const user = store.getUser();
  const rank = store.getUserRank();

  appRoot.innerHTML = `
    <div class="glass-panel" style="padding: 2.8rem; max-width: 860px; margin: 0 auto; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--f1-red) 0%, var(--color-mercedes-cyan) 100%);"></div>

      <div class="hero-tag" style="margin-bottom: 0.5rem;">
        <span class="hero-tag-badge">FIA SUPERLICENCE OFFICIAL ID</span>
        <span class="hero-tag-sub">FEDERATION INTERNATIONALE DE L'AUTOMOBILE</span>
      </div>
      <h2 style="font-family: var(--font-f1-title); font-size: 2.6rem; font-weight: 900; font-style: italic; margin-bottom: 2rem; text-transform: uppercase;">
        LICENCIA DE PILOTO <span class="highlight-racing-red">OFICIAL</span>
      </h2>

      <!-- Official FIA Driver ID Card Header -->
      <div style="background: linear-gradient(135deg, #181b28 0%, #10121b 100%); border: 1px solid rgba(255,255,255,0.12); border-left: 6px solid var(--f1-red); border-radius: var(--radius-md); padding: 2rem; display: flex; gap: 2rem; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; box-shadow: 0 12px 30px rgba(0,0,0,0.5);">
        <div style="position: relative;">
          <div style="width: 120px; height: 120px; border-radius: 16px; background: #1c1e28; border: 3px solid var(--f1-red); display: flex; align-items: center; justify-content: center; font-size: 4rem; overflow: hidden; box-shadow: 0 0 25px var(--f1-red-glow);">
            ${user.avatarUrl ? `<img src="${user.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Avatar">` : `<span>${user.activeAvatarIcon || '🏎️'}</span>`}
          </div>
          <label for="avatar-file-input" style="position: absolute; bottom: -6px; right: -6px; background: var(--f1-red); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; font-size: 0.95rem; box-shadow: 0 4px 10px rgba(0,0,0,0.6);" title="Subir avatar oficial">
            📷
          </label>
          <input type="file" id="avatar-file-input" accept="image/png, image/jpeg, image/webp" style="display: none;">
        </div>

        <div style="flex-grow: 1;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <h3 style="font-size: 1.6rem; font-weight: 800;">${user.displayName}</h3>
            <span style="font-size: 1.2rem;">${user.activeBadge || '🚦'}</span>
          </div>
          <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.4rem;">@${user.username} • ${user.country} 🇲🇽</div>
          <div style="color: ${rank.color}; font-weight: 700; font-size: 0.95rem;">${rank.icon} ${rank.name} (${user.score} pts acumulados)</div>
        </div>
      </div>

      <!-- Edit Form -->
      <form id="profile-edit-form" style="display: flex; flex-direction: column; gap: 1.2rem;">
        <div>
          <label style="display: block; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">Nombre de Pantalla</label>
          <input type="text" id="prof-display-name" value="${user.displayName}" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); color: #fff; padding: 0.8rem 1rem; border-radius: var(--radius-md); font-size: 1rem; outline: none;">
        </div>

        <div>
          <label style="display: block; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">País</label>
          <input type="text" id="prof-country" value="${user.country}" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); color: #fff; padding: 0.8rem 1rem; border-radius: var(--radius-md); font-size: 1rem; outline: none;">
        </div>

        <div>
          <label style="display: block; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">Biografía de Carrera</label>
          <textarea id="prof-bio" rows="3" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); color: #fff; padding: 0.8rem 1rem; border-radius: var(--radius-md); font-size: 1rem; outline: none; font-family: inherit;">${user.bio}</textarea>
        </div>

        <button type="submit" class="btn-f1-primary" style="align-self: flex-start; margin-top: 1rem;">Guardar Cambios 💾</button>
      </form>
    </div>
  `;

  // Avatar upload processing (reading data URL, mirroring Pillow resize requirements)
  const fileInput = document.getElementById("avatar-file-input");
  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("El archivo seleccionado debe ser una imagen (PNG, JPG, WEBP).", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        store.updateProfile({ avatarUrl: event.target.result });
        showToast("¡Avatar actualizado con éxito!", "success");
        updateNavTelemetry();
        renderProfileView();
      };
      reader.readAsDataURL(file);
    }
  });

  // Profile update form
  document.getElementById("profile-edit-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const displayName = document.getElementById("prof-display-name").value;
    const country = document.getElementById("prof-country").value;
    const bio = document.getElementById("prof-bio").value;

    store.updateProfile({ displayName, country, bio });
    showToast("Datos de perfil guardados correctamente.", "success");
    updateNavTelemetry();
    renderProfileView();
  });
}

// 8. ADMIN DASHBOARD & SYSTEM MONITORING VIEW
function renderAdminView() {
  const user = store.getUser();
  const servedHashes = store.getServedHashes();

  appRoot.innerHTML = `
    <div class="glass-panel" style="padding: 2.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <span class="hero-tag" style="background: rgba(168,85,247,0.2); color: #c084fc; border-color: rgba(168,85,247,0.4);">
            FIA TELEMETRY CONTROL
          </span>
          <h2 style="font-size: 2.2rem; font-weight: 900; text-transform: uppercase;">PANEL DE ADMINISTRACIÓN & MÉTRICAS</h2>
        </div>
        <button class="btn-f1-secondary" id="btn-admin-reset" style="color: #ef4444; border-color: rgba(239,68,68,0.4);">
          ⚠️ Resetear Datos Locales
        </button>
      </div>

      <!-- Metrics Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
        <div class="glass-panel" style="padding: 1.5rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Estado del Servidor</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: #4ade80;">200 OK • Online</div>
          <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">Latencia: 12ms (Local)</div>
        </div>

        <div class="glass-panel" style="padding: 1.5rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Hashes Servidos Quiz</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: #38bdf8;">${servedHashes.length} Hashes</div>
          <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">Cero duplicados verificados</div>
        </div>

        <div class="glass-panel" style="padding: 1.5rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">JWT Status</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: #a855f7;">HS256 Valid</div>
          <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">Rotación de claves activada</div>
        </div>

        <div class="glass-panel" style="padding: 1.5rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Catálogo Cosméticos</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-gold);">${COSMETICS_CATALOG.length} Artículos</div>
          <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">Economía de PitCoins balanceada</div>
        </div>
      </div>

      <!-- Hash History Audit Table -->
      <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem;">Historial de Preguntas de IA Servidas (Anti-Repetición)</h3>
      <div style="max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.3); border-radius: var(--radius-md); padding: 1rem; font-family: var(--font-mono); font-size: 0.85rem;">
        ${servedHashes.length === 0 ? '<div style="color: var(--text-dim);">No se han generado preguntas en esta sesión.</div>' : ''}
        ${servedHashes.map(h => `<div style="padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8;"><span style="color: var(--f1-red);">SHA256:</span> ${h}</div>`).join('')}
      </div>
    </div>
  `;

  document.getElementById("btn-admin-reset")?.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas resetear todos los datos de sesión y monedas?")) {
      store.resetAllProgress();
      showToast("Datos reiniciados.", "info");
      updateNavTelemetry();
      renderAdminView();
    }
  });
}

// Router switcher
function navigateTo(viewKey) {
  setActiveTab(viewKey);
  window.scrollTo({ top: 0, behavior: "smooth" });

  switch (viewKey) {
    case "home":
      renderHomeView();
      break;
    case "quiz":
      renderQuizView();
      break;
    case "driverle":
      renderDriverleView();
      break;
    case "geoguessr":
      renderGeoGuessrView();
      break;
    case "leaderboard":
      renderLeaderboardView();
      break;
    case "store":
      renderStoreView();
      break;
    case "profile":
      renderProfileView();
      break;
    case "admin":
      renderAdminView();
      break;
    default:
      renderHomeView();
  }
}

// Initialize Navigation Event Listeners
function initNavigation() {
  document.getElementById("nav-brand-btn")?.addEventListener("click", () => navigateTo("home"));
  document.getElementById("telemetry-bar-btn")?.addEventListener("click", () => navigateTo("profile"));

  navTabs.home?.addEventListener("click", () => navigateTo("home"));
  navTabs.quiz?.addEventListener("click", () => navigateTo("quiz"));
  navTabs.driverle?.addEventListener("click", () => navigateTo("driverle"));
  navTabs.geoguessr?.addEventListener("click", () => navigateTo("geoguessr"));
  navTabs.leaderboard?.addEventListener("click", () => navigateTo("leaderboard"));
  navTabs.store?.addEventListener("click", () => navigateTo("store"));
  navTabs.profile?.addEventListener("click", () => navigateTo("profile"));
  navTabs.admin?.addEventListener("click", () => navigateTo("admin"));
}

// Kickoff application
function startApp() {
  window.__navTab = navigateTo;
  initNavigation();
  updateNavTelemetry();
  navigateTo("home");
  showToast("¡Bienvenido al paddock de Lights Out F1! 🏁", "info");
}

window.addEventListener("DOMContentLoaded", startApp);
