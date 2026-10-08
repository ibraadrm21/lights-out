import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LightsOutStore } from './store.js';
import { SpotlightCard, DecryptedText, MagneticButton, AnimatedNumber } from './components/motion-primitives.jsx';
import { QuizView } from './components/QuizView.jsx';
import { DriverleView } from './components/DriverleView.jsx';
import { GeoGuessrView } from './components/GeoGuessrView.jsx';
import { LeaderboardView } from './components/LeaderboardView.jsx';
import { StoreView, ProfileView } from './components/StoreAndProfileView.jsx';

export function App() {
  const [store] = useState(() => new LightsOutStore());
  const [currentView, setCurrentView] = useState('home');
  const [userData, setUserData] = useState(() => store.getUser());
  const [userRank, setUserRank] = useState(() => store.getUserRank());

  const updateNavTelemetry = () => {
    setUserData({ ...store.getUser() });
    setUserRank(store.getUserRank());
  };

  const nextRank = store.getNextRank();
  const progressPercent = nextRank
    ? Math.min(100, Math.round(((userData.score - userRank.minPoints) / (nextRank.minPoints - userRank.minPoints)) * 100))
    : 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-white">
      {/* 1. TOP LIVE TICKER RIBBON - Minimal Clean Racing Tape */}
      <div className="w-full bg-[#0d0f15] border-b border-white/[0.06] py-1.5 px-4 overflow-hidden text-xs font-mono select-none">
        <div className="flex items-center justify-between max-w-7xl mx-auto text-[#94a3b8] text-[11px] tracking-wide">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-white font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff1801] animate-pulse"></span>
              RD 24 ABU DHABI GP
            </span>
            <span className="text-white/20">/</span>
            <span className="hidden sm:inline text-white/70">
              Yas Marina Circuit &bull; Dec 6-8
            </span>
            <span className="hidden md:inline text-white/20">/</span>
            <span className="hidden md:inline text-[#ff8000] font-medium">
              McLaren 666 PTS <span className="text-white/40">&bull;</span> Ferrari 652 PTS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00f2fe] bg-[#00f2fe]/10 border border-[#00f2fe]/20 px-2 py-0.5 rounded">
              DRS OPEN
            </span>
            <span className="text-white/50 text-[11px]">342 KM/H SPEED TRAP</span>
          </div>
        </div>
      </div>

      {/* 2. MODERN CLEAN NAVIGATION BAR */}
      <header className="clean-nav">
        <div className="clean-brand" onClick={() => setCurrentView('home')}>
          <div className="brand-dot-logo">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="brand-text">
            <span>LIGHTS OUT</span>
            <span className="brand-tag">F1</span>
          </div>
        </div>

        {/* Clean Pill Navigation (bklit.com & modern motorsport) */}
        <nav className="hidden md:block">
          <ul className="nav-tab-list">
            <li>
              <button
                className={`nav-tab-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => setCurrentView('home')}
              >
                Paddock
              </button>
            </li>
            <li>
              <button
                className={`nav-tab-item ${currentView === 'quiz' ? 'active' : ''}`}
                onClick={() => setCurrentView('quiz')}
              >
                Quiz Master
              </button>
            </li>
            <li>
              <button
                className={`nav-tab-item ${currentView === 'driverle' ? 'active' : ''}`}
                onClick={() => setCurrentView('driverle')}
              >
                Driverle
              </button>
            </li>
            <li>
              <button
                className={`nav-tab-item ${currentView === 'geoguessr' ? 'active' : ''}`}
                onClick={() => setCurrentView('geoguessr')}
              >
                GeoGuessr
              </button>
            </li>
            <li>
              <button
                className={`nav-tab-item ${currentView === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('leaderboard')}
              >
                Clasificación
              </button>
            </li>
            <li>
              <button
                className={`nav-tab-item ${currentView === 'store' ? 'active' : ''}`}
                onClick={() => setCurrentView('store')}
              >
                Tienda
              </button>
            </li>
          </ul>
        </nav>

        {/* Clean User Status Badge */}
        <div className="user-profile-badge" onClick={() => setCurrentView('profile')}>
          <div className="coins-pill">
            <span>🪙</span>
            <span>{userData.coins.toLocaleString()}</span>
          </div>
          <div className="rank-pill hidden sm:inline-block">
            {userRank.name}
          </div>
          <div className="avatar-circle">
            {userData.avatarUrl ? (
              <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{userData.activeAvatarIcon || '🏎️'}</span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Tab Strip for small screens (hidden on desktop) */}
      <div className="mobile-only-tabs">
        {['home', 'quiz', 'driverle', 'geoguessr', 'leaderboard', 'store', 'profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentView(tab)}
            className={`mobile-tab-pill ${currentView === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* 3. MAIN CONTENT VIEWPORT */}
      <main className="clean-main flex-grow">
        <AnimatePresence mode="wait">
          {currentView === 'quiz' && (
            <QuizView
              key="quiz"
              store={store}
              updateNavTelemetry={updateNavTelemetry}
              onReturnHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'driverle' && (
            <DriverleView
              key="driverle"
              store={store}
              updateNavTelemetry={updateNavTelemetry}
              onReturnHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'geoguessr' && (
            <GeoGuessrView
              key="geoguessr"
              store={store}
              updateNavTelemetry={updateNavTelemetry}
              onReturnHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'leaderboard' && (
            <LeaderboardView
              key="leaderboard"
              store={store}
              onReturnHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'store' && (
            <StoreView
              key="store"
              store={store}
              updateNavTelemetry={updateNavTelemetry}
              onReturnHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              key="profile"
              store={store}
              updateNavTelemetry={updateNavTelemetry}
              onReturnHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-10"
            >
              {/* Grand Prix Countdown Banner - Sleek Minimalist Bar */}
              <div className="clean-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-l-4 border-l-[#ff1801]">
                <div className="flex items-center gap-4">
                  <div className="text-3xl sm:text-4xl">🇦🇪</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#ff1801] uppercase">
                        Próximo Gran Premio
                      </span>
                      <span className="text-white/20">&bull;</span>
                      <span className="text-xs text-slate-400">Ronda 24 de 24</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Space_Grotesk']">
                      FORMULA 1 ETIHAD AIRWAYS ABU DHABI GP 2026
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Yas Marina Circuit &bull; 58 Laps &bull; 5.281 km &bull; Carrera Crepuscular
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 bg-black/40 border border-white/[0.08] px-4 py-2.5 rounded-xl font-mono text-center self-stretch sm:self-auto justify-center">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">03</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">Días</div>
                  </div>
                  <span className="text-lg text-[#ff1801] font-bold pb-2">:</span>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">14</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">Hrs</div>
                  </div>
                  <span className="text-lg text-[#ff1801] font-bold pb-2">:</span>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">28</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">Min</div>
                  </div>
                </div>
              </div>

              {/* Clean Editorial Hero Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Editorial Hero Content */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                    <span className="w-2 h-2 rounded-full bg-[#ff1801]"></span>
                    <span className="text-xs font-mono font-medium text-slate-300 tracking-wider uppercase">
                      FIA Paddock Gaming Ecosystem
                    </span>
                  </div>

                  <div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-[1.08] mb-4">
                      IT'S LIGHTS OUT <br />
                      AND <span className="text-[#ff1801]">
                        <DecryptedText text="AWAY WE GO!" speed={35} maxIterations={5} />
                      </span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
                      El centro interactivo definitivo de Fórmula 1 impulsado por inteligencia artificial procedural: 
                      compite en preguntas técnicas únicas, descifra al piloto legendario en telemetría y geolocaliza trazados icónicos del calendario.
                    </p>
                  </div>

                  {/* Quick CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      className="btn-clean-primary"
                      onClick={() => setCurrentView('quiz')}
                    >
                      <span>⚡ F1 Quiz Master</span>
                    </button>
                    <button
                      className="btn-clean-secondary"
                      onClick={() => setCurrentView('driverle')}
                    >
                      <span>🕵️ F1 Driverle</span>
                    </button>
                    <button
                      className="btn-clean-secondary"
                      onClick={() => setCurrentView('geoguessr')}
                    >
                      <span>🗺️ Circuit GeoGuessr</span>
                    </button>
                  </div>
                </div>

                {/* Right: Clean Telemetry Speedometer Card */}
                <div className="lg:col-span-5">
                  <SpotlightCard className="clean-card p-6 border border-white/[0.08]">
                    <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                          Telemetry Feed Active
                        </span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20">
                        DRS ACTIVE
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-extrabold text-[#ff1801] font-['Space_Grotesk']">
                          #1
                        </div>
                        <div>
                          <div className="font-bold text-base text-white tracking-wide uppercase font-['Space_Grotesk']">
                            {userData.displayName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {userRank.name} Licencia FIA
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                          <AnimatedNumber value={342} duration={1.2} />
                        </div>
                        <div className="text-[10px] font-mono text-[#ff1801] font-bold tracking-widest uppercase">
                          KM/H
                        </div>
                      </div>
                    </div>

                    {/* Minimalist Gauge Meters */}
                    <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                      <div className="bg-black/30 border border-white/[0.05] p-3 rounded-lg">
                        <div className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold tracking-wider">
                          <span>THROTTLE</span>
                          <span className="text-emerald-400 font-mono">96%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full w-[96%]"></div>
                        </div>
                      </div>

                      <div className="bg-black/30 border border-white/[0.05] p-3 rounded-lg">
                        <div className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold tracking-wider">
                          <span>BRAKE</span>
                          <span className="text-[#ff1801] font-mono">14%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ff1801] rounded-full w-[14%]"></div>
                        </div>
                      </div>

                      <div className="bg-black/30 border border-white/[0.05] p-3 rounded-lg">
                        <div className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold tracking-wider">
                          <span>TYRE SOFT</span>
                          <span className="text-amber-400 font-mono">88%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full w-[88%]"></div>
                        </div>
                      </div>

                      <div className="bg-black/30 border border-white/[0.05] p-3 rounded-lg">
                        <div className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold tracking-wider">
                          <span>ERS HARVEST</span>
                          <span className="text-cyan-400 font-mono">100%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full w-[100%]"></div>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              </div>

              {/* Status & Licence Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Driver Profile Info */}
                <SpotlightCard className="clean-card p-6 flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-3xl">
                      {userData.activeAvatarIcon || '🏎️'}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                        Piloto Oficial
                      </div>
                      <div className="text-lg font-bold text-white font-['Space_Grotesk']">
                        {userData.displayName}
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Fondos Paddock:</span>
                    <span className="text-amber-400 font-bold">
                      🪙 <AnimatedNumber value={userData.coins} /> PitCoins
                    </span>
                  </div>
                </SpotlightCard>

                {/* 2. FIA Superlicence Progress */}
                <SpotlightCard className="clean-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                        Superlicencia FIA
                      </span>
                      <span className="text-xs font-bold text-white font-mono">
                        {userRank.icon} {userRank.name}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden my-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#ff1801] to-[#ff8000] rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-2 border-t border-white/[0.06]">
                    <span>{userData.score} pts acumulados</span>
                    <span className="text-slate-300 font-medium">
                      {nextRank ? `Meta: ${nextRank.minPoints} pts` : 'Rango Leyenda'}
                    </span>
                  </div>
                </SpotlightCard>

                {/* 3. Procedural AI Telemetry Metric */}
                <SpotlightCard className="clean-card p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                      Motor Procedural AI
                    </span>
                    <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                      0% REPETICIÓN
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-purple-400 font-['Space_Grotesk'] my-1">
                    <AnimatedNumber value={userData.servedQuestionHashes.length} />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/[0.06]">
                    Desafíos generados y firmados
                  </div>
                </SpotlightCard>
              </div>

              {/* 3 Main Game Mode Cards Grid */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-[#ff1801] rounded-full"></div>
                  <h2 className="text-2xl font-bold tracking-tight text-white font-['Space_Grotesk'] uppercase">
                    Modos de Competición
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Quiz Master */}
                  <SpotlightCard className="clean-card p-7 flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wider">
                          01 // QUIZ
                        </span>
                        <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                          AI PROCEDURAL
                        </span>
                      </div>

                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl mb-4 text-[#ff1801] group-hover:scale-105 transition-transform">
                        ⚡
                      </div>

                      <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-2">
                        F1 Quiz Master
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-6">
                        Telemetría en directo, récords mundiales, audios de radio míticos y reglas técnicas FIA generados sin repetición.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold">
                        <span className="text-cyan-400">+150 PTS</span>
                        <span className="text-amber-400">+40 🪙</span>
                      </div>
                      <button
                        className="btn-clean-primary !py-2 !px-4 text-xs font-semibold"
                        onClick={() => setCurrentView('quiz')}
                      >
                        Competir &rarr;
                      </button>
                    </div>
                  </SpotlightCard>

                  {/* Card 2: Driverle */}
                  <SpotlightCard className="clean-card p-7 flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wider">
                          02 // DRIVERLE
                        </span>
                        <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                          6 INTENTOS
                        </span>
                      </div>

                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl mb-4 text-sky-400 group-hover:scale-105 transition-transform">
                        🕵️
                      </div>

                      <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-2">
                        F1 Driverle
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-6">
                        Deduce al piloto secreto analizando en cada intento: era de debut, campeonatos mundiales, victorias, podios y dorsales.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold">
                        <span className="text-cyan-400">+300 PTS</span>
                        <span className="text-amber-400">+80 🪙</span>
                      </div>
                      <button
                        className="btn-clean-primary !py-2 !px-4 text-xs font-semibold"
                        onClick={() => setCurrentView('driverle')}
                      >
                        Adivinar &rarr;
                      </button>
                    </div>
                  </SpotlightCard>

                  {/* Card 3: GeoGuessr */}
                  <SpotlightCard className="clean-card p-7 flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wider">
                          03 // GEOGUESSR
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          SATÉLITE & PISTA
                        </span>
                      </div>

                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl mb-4 text-emerald-400 group-hover:scale-105 transition-transform">
                        🗺️
                      </div>

                      <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-2">
                        Circuit GeoGuessr
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-6">
                        Observa vistas panorámicas a pie de trazado y sitúa tu marcador en el mapa mundial calculando la distancia en kilómetros.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold">
                        <span className="text-cyan-400">+500 PTS</span>
                        <span className="text-amber-400">+120 🪙</span>
                      </div>
                      <button
                        className="btn-clean-primary !py-2 !px-4 text-xs font-semibold"
                        onClick={() => setCurrentView('geoguessr')}
                      >
                        Explorar &rarr;
                      </button>
                    </div>
                  </SpotlightCard>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. SLEEK MINIMAL FOOTER */}
      <footer className="clean-footer">
        <div className="clean-footer-content">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="clean-brand" onClick={() => setCurrentView('home')}>
              <div className="brand-dot-logo">
                <span /><span /><span /><span /><span />
              </div>
              <span className="brand-text text-sm">LIGHTS OUT</span>
            </div>
            <span className="text-white/20 hidden sm:inline">&bull;</span>
            <p className="text-xs text-slate-400">
              Modern Formula 1 Interactive Paddock. Motion.dev & ReactBits UI.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
            <button onClick={() => setCurrentView('leaderboard')} className="hover:text-white transition-colors">
              Clasificación
            </button>
            <button onClick={() => setCurrentView('store')} className="hover:text-white transition-colors">
              Tienda
            </button>
            <button onClick={() => setCurrentView('profile')} className="hover:text-white transition-colors">
              Superlicencia
            </button>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FIA ONLINE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
