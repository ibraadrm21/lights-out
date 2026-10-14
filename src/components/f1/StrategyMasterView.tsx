import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, FastForward, RotateCcw, AlertTriangle, CloudRain, 
  Sun, ShieldAlert, Award, Zap, Flame, Compass, ChevronRight,
  TrendingDown, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight,
  Radio, Wrench, BarChart3, Disc
} from 'lucide-react';
import { SCENARIOS } from '../../data/strategyScenarios';
import { ScenarioDefinition, Compound, PaceMode, PostRaceReport } from '../../types/strategyMaster';
import { StrategySimulationEngine } from '../../lib/strategyEngine';
import { useStore } from '../../store/useStore';
import { PitCoinIcon } from '../common/F1Icons';
import { CircuitRadar } from './CircuitRadar';
import { PitWindowInteractive } from './PitWindowInteractive';

const TYRE_COLORS: Record<Compound, { bg: string; text: string; border: string; name: string }> = {
  soft: { bg: '#e10600', text: '#ffffff', border: '#e10600', name: 'SOFT' },
  medium: { bg: '#ffd100', text: '#000000', border: '#ffd100', name: 'MEDIUM' },
  hard: { bg: '#ffffff', text: '#000000', border: '#ffffff', name: 'HARD' },
  intermediate: { bg: '#43b02a', text: '#ffffff', border: '#43b02a', name: 'INTER' },
  wet: { bg: '#0066cc', text: '#ffffff', border: '#0066cc', name: 'WET' },
};

export const StrategyMasterView: React.FC = () => {
  const { addCoins } = useStore();
  
  // Game states: 'briefing' | 'racing' | 'debrief'
  const [phase, setPhase] = useState<'briefing' | 'racing' | 'debrief'>('briefing');
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  
  // Briefing choices
  const [startingCompound, setStartingCompound] = useState<Compound>('medium');
  const [initialPace, setInitialPace] = useState<PaceMode>('balanced');
  
  // Racing engine state
  const scenario = SCENARIOS[selectedScenarioIndex];
  const engineRef = useRef<StrategySimulationEngine | null>(null);
  
  // Reactive render triggers
  const [, setTick] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [isPitModalOpen, setIsPitModalOpen] = useState<boolean>(false);
  const [selectedPitCompound, setSelectedPitCompound] = useState<Compound>('hard');
  const [report, setReport] = useState<PostRaceReport | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize race
  const handleStartRace = () => {
    const engine = new StrategySimulationEngine(scenario, startingCompound, initialPace);
    engineRef.current = engine;
    setPhase('racing');
    setIsPlaying(true);
    setTick(prev => prev + 1);
  };

  // Reset or change scenario
  const handleResetToBriefing = () => {
    setIsPlaying(false);
    engineRef.current = null;
    setReport(null);
    setPhase('briefing');
  };

  // Simulation timer loop
  useEffect(() => {
    if (phase !== 'racing' || !isPlaying) return;

    const intervalTime = Math.max(300, 1600 / playbackSpeed);

    const interval = setInterval(() => {
      const engine = engineRef.current;
      if (!engine) return;

      const res = engine.simulateNextLap();
      setTick(prev => prev + 1);

      if (res.isFinished) {
        setIsPlaying(false);
        const finalReport = engine.generatePostRaceReport();
        setReport(finalReport);
        addCoins(finalReport.coinsReward);
        setPhase('debrief');
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [phase, isPlaying, playbackSpeed, addCoins]);

  // Auto-scroll race control events
  useEffect(() => {
    if (phase === 'racing') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [engineRef.current?.eventsLog.length, phase]);

  const engine = engineRef.current;
  const playerDriver = engine?.drivers.find(d => d.isPlayer);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans select-none">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono tracking-widest uppercase bg-[#e10600]/20 text-[#e10600] font-bold border border-[#e10600]/40">
              PIT WALL TELEMETRY
            </span>
            <span className="text-white/40 text-xs font-mono">
              LIGHTS OUT // SIMULATOR v2.6
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-syne uppercase tracking-tight text-white flex items-center gap-3">
            STRATEGY <span className="text-[#e10600]">MASTER</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 font-mono mt-1">
            Tu trabajo no es conducir. Tu trabajo es ganar el Gran Premio desde el muro de boxes.
          </p>
        </div>

        {/* Global Controls or Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-[#121212] border border-white/10 rounded-xs px-3 py-2 flex items-center gap-3">
            <Compass size={16} className="text-white/60" />
            <div>
              <div className="text-[9px] font-mono text-white/40 uppercase">CIRCUITO ACTIVO</div>
              <div className="text-xs font-f1 font-bold text-white flex items-center gap-1.5">
                <span>{scenario.flag}</span>
                <span>{scenario.trackName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE A: BRIEFING */}
      {phase === 'briefing' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Column 1 & 2: Briefing Details & Scenario Selector */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Scenarios Selector Tabs */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-sm p-4">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-3">
                SELECCIONA EL ESCENARIO DE CARRERA
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SCENARIOS.map((sc, idx) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenarioIndex(idx);
                      // Default compound
                      setStartingCompound(sc.availableTyreSets[0]?.compound || 'medium');
                    }}
                    className={`p-3 text-left rounded-sm border transition-all cursor-pointer ${
                      selectedScenarioIndex === idx
                        ? 'bg-white/10 border-[#e10600] text-white shadow-lg'
                        : 'bg-white/5 border-white/5 hover:border-white/20 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="text-lg mb-1">{sc.flag}</div>
                    <div className="text-xs font-f1 font-bold tracking-wide uppercase line-clamp-1">{sc.title}</div>
                    <div className="text-[10px] font-mono text-white/40 truncate">{sc.trackName}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Circuit Technical Card */}
            <div className="bg-[#0d0d0d] border border-white/10 rounded-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
                <Radio size={180} />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#e10600] uppercase tracking-widest font-bold">
                    FASE A // PREPARACIÓN DEL MURO
                  </span>
                  <h2 className="text-2xl font-black font-syne uppercase text-white mt-0.5">
                    {scenario.title}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-f1 text-white">{scenario.totalLaps} VTS</div>
                  <div className="text-[10px] font-mono text-white/40 uppercase">DISTANCIA TOTAL</div>
                </div>
              </div>

              {/* Objective Banner */}
              <div className="p-3.5 bg-[#e10600]/10 border border-[#e10600]/30 rounded-xs mb-6">
                <div className="flex items-center gap-2 text-xs font-f1 font-bold text-[#e10600] uppercase tracking-wider mb-1">
                  <ShieldAlert size={15} />
                  <span>OBJETIVO DE LA ESCUDERÍA</span>
                </div>
                <p className="text-xs text-white/80 font-sans leading-relaxed">
                  {scenario.targetObjective}
                </p>
              </div>

              {/* Race Factors Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xs">
                  <div className="text-[10px] font-mono text-white/40 uppercase">PARRILLA SALIDA</div>
                  <div className="text-lg font-black font-f1 text-white">P{scenario.initialPlayerPosition}</div>
                  <div className="text-[10px] text-white/50 font-mono">Entre los favoritos</div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xs">
                  <div className="text-[10px] font-mono text-white/40 uppercase">PÉRDIDA EN PIT</div>
                  <div className="text-lg font-black font-f1 text-yellow-400">+{scenario.pitStopDelta}s</div>
                  <div className="text-[10px] text-white/50 font-mono">Bajo SC: +{scenario.scPitDelta}s</div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xs">
                  <div className="text-[10px] font-mono text-white/40 uppercase">METEOROLOGÍA</div>
                  <div className="text-lg font-black font-f1 text-white flex items-center gap-1.5">
                    {scenario.weatherForecast.startWeather === 'dry' ? <Sun size={16} className="text-amber-400" /> : <CloudRain size={16} className="text-blue-400" />}
                    <span>{scenario.weatherForecast.temperature}°C</span>
                  </div>
                  <div className="text-[10px] text-white/50 font-mono capitalize">{scenario.weatherForecast.startWeather}</div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xs">
                  <div className="text-[10px] font-mono text-white/40 uppercase">RITMO BASE VUELTA</div>
                  <div className="text-lg font-black font-f1 text-white">{scenario.baseLapTime}s</div>
                  <div className="text-[10px] text-white/50 font-mono">Trazada óptima</div>
                </div>
              </div>

              {/* Forecast text */}
              <div className="mt-4 p-3 bg-black/40 border border-white/5 rounded-xs text-xs font-mono text-white/60">
                <span className="text-white font-bold">INFORME METEOROLÓGICO: </span>
                {scenario.weatherForecast.forecastNotes}
              </div>
            </div>
          </div>

          {/* Column 3: Tactical Plan Selection */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-sm p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#e10600] uppercase tracking-widest font-bold block mb-1">
                CONFIGURACIÓN INICIAL
              </span>
              <h3 className="text-xl font-black font-syne uppercase text-white mb-4">
                PLAN DE SALIDA
              </h3>

              {/* Starting Compound Selector */}
              <div className="mb-6">
                <label className="text-xs font-mono text-white/60 uppercase block mb-2 font-bold">
                  1. COMPUESTO DE SALIDA:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {scenario.availableTyreSets.slice(0, 3).map((tyre) => {
                    const info = TYRE_COLORS[tyre.compound];
                    const isSelected = startingCompound === tyre.compound;
                    return (
                      <button
                        key={tyre.id}
                        onClick={() => setStartingCompound(tyre.compound)}
                        className={`p-3 rounded-xs border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected 
                            ? 'bg-white/15 border-white shadow-md' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div 
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-[8px]"
                          style={{ borderColor: info.border, color: info.border }}
                        >
                          {info.name[0]}
                        </div>
                        <span className="text-xs font-f1 font-bold text-white">{info.name}</span>
                        <span className="text-[9px] font-mono text-white/40">Nuevo</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Initial Pace Mode */}
              <div className="mb-6">
                <label className="text-xs font-mono text-white/60 uppercase block mb-2 font-bold">
                  2. RITMO DE SALIDA (STINT 1):
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'attack', label: 'ATTACK (Atacar)', desc: 'Ganar tiempo de inmediato, alta degradación.', icon: Flame, color: '#e10600' },
                    { id: 'balanced', label: 'BALANCED (Equilibrado)', desc: 'Ritmo competitivo sin quemar gomas.', icon: Zap, color: '#38bdf8' },
                    { id: 'conserve', label: 'CONSERVE (Conservar)', desc: 'Cuidar neumáticos para alargar la parada.', icon: TrendingDown, color: '#4ade80' },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = initialPace === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setInitialPace(p.id as PaceMode)}
                        className={`w-full p-2.5 rounded-xs border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-white/15 border-white text-white shadow-sm'
                            : 'bg-white/5 border-white/5 hover:border-white/15 text-white/60'
                        }`}
                      >
                        <Icon size={16} style={{ color: p.color }} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-f1 font-bold uppercase text-white">{p.label}</div>
                          <div className="text-[10px] font-mono text-white/40">{p.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rivals grid overview */}
              <div className="p-3 bg-black/60 border border-white/5 rounded-xs text-[11px] font-mono text-white/50 mb-6">
                <div className="flex justify-between pb-1 border-b border-white/10 text-white font-bold">
                  <span>PARRILLA</span>
                  <span>ESTRATEGIA RIVAL</span>
                </div>
                <div className="space-y-1 pt-1.5 max-h-28 overflow-y-auto">
                  {scenario.competitors.map((c, i) => (
                    <div key={c.id} className="flex justify-between items-center text-[10px]">
                      <span className="text-white/80">P{i + 1} {c.name}</span>
                      <span className="capitalize text-white/40">{c.profile} ({c.currentCompound})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStartRace}
              className="w-full py-3.5 bg-[#e10600] hover:bg-[#b00500] text-white font-f1 font-bold text-sm uppercase tracking-widest rounded-xs transition-all shadow-[0_0_25px_rgba(225,6,0,0.5)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={16} fill="white" />
              <span>INICIAR SIMULACIÓN DE CARRERA</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* PHASE B: SIMULATION (RACING) */}
      {phase === 'racing' && engine && (
        <div className="space-y-6">
          
          {/* Muro Dashboard Top Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0d0d0d] border border-white/10 rounded-sm p-4">
            {/* Lap Counter */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xs bg-[#e10600]/20 border border-[#e10600]/40 flex items-center justify-center font-f1 font-bold text-lg text-[#e10600]">
                {engine.currentLap}
              </div>
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase block">VUELTA</span>
                <span className="text-xs font-mono font-bold text-white">DE {scenario.totalLaps} VTS</span>
              </div>
            </div>

            {/* Weather & Track Status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xs bg-white/5 border border-white/10 flex items-center justify-center">
                {engine.weather === 'dry' ? (
                  <Sun size={20} className="text-amber-400" />
                ) : (
                  <CloudRain size={20} className="text-blue-400" />
                )}
              </div>
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase block">ESTADO PISTA</span>
                <span className="text-xs font-mono font-bold uppercase text-white">
                  {engine.weather === 'dry' ? 'Asfalto Seco' : engine.weather === 'drizzle' ? 'Húmedo / Chirimiri' : 'Encharcado (Wet)'}
                </span>
              </div>
            </div>

            {/* Flag / Incident status */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xs border flex items-center justify-center ${
                engine.incident === 'safety_car' 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse'
                  : engine.incident === 'vsc'
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                  : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
              }`}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase block">CONTROL DE CARRERA</span>
                <span className="text-xs font-mono font-bold uppercase text-white">
                  {engine.incident === 'safety_car' ? 'SAFETY CAR' : engine.incident === 'vsc' ? 'VSC ACTIVO' : 'BANDERA VERDE'}
                </span>
              </div>
            </div>

            {/* Simulation speed controls */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-xs bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                title={isPlaying ? 'Pausar' : 'Reanudar'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} fill="white" />}
              </button>

              {[1, 2, 4].map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1.5 rounded-xs text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    playbackSpeed === spd 
                      ? 'bg-[#e10600] text-white shadow-sm' 
                      : 'bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Main Racing Split: Live Timing Tower (Left) & Driver Cockpit Muro (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Timing Tower (7 cols) */}
            <div className="lg:col-span-7 bg-[#0d0d0d] border border-white/10 rounded-sm p-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase font-bold flex items-center gap-2">
                  <BarChart3 size={14} className="text-[#e10600]" />
                  <span>TABLA DE TIEMPOS // LIVE TIMING</span>
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  ACTUALIZACIÓN EN TIEMPO REAL
                </span>
              </div>

              {/* Tower Headers */}
              <div className="grid grid-cols-12 text-[9px] font-mono text-white/40 uppercase pb-2 px-2 border-b border-white/5">
                <div className="col-span-1 text-center">POS</div>
                <div className="col-span-4">PILOTO / EQUIPO</div>
                <div className="col-span-2 text-center">GOMAS</div>
                <div className="col-span-1 text-center">BOX</div>
                <div className="col-span-2 text-right">DIFERENCIA</div>
                <div className="col-span-2 text-right">ÚLT. VUELTA</div>
              </div>

              {/* Timing Rows */}
              <div className="space-y-1.5 pt-2">
                {engine.drivers.map((driver) => {
                  const tyreInfo = TYRE_COLORS[driver.currentCompound];
                  const isPlayer = driver.isPlayer;

                  return (
                    <motion.div
                      layout
                      key={driver.id}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      className={`grid grid-cols-12 items-center p-2 rounded-xs border text-xs transition-all ${
                        isPlayer
                          ? 'bg-[#e10600]/15 border-[#e10600] shadow-[0_0_15px_rgba(225,6,0,0.2)]'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                      }`}
                    >
                      {/* Position */}
                      <div className="col-span-1 text-center font-f1 font-black text-sm">
                        <span className={driver.position === 1 ? 'text-yellow-400' : isPlayer ? 'text-[#e10600]' : 'text-white'}>
                          {driver.position}
                        </span>
                      </div>

                      {/* Driver info */}
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <div 
                          className="w-1.5 h-6 shrink-0 rounded-full" 
                          style={{ backgroundColor: driver.teamColor }} 
                        />
                        <div className="truncate">
                          <span className={`block font-f1 font-bold uppercase truncate ${isPlayer ? 'text-white font-black' : 'text-white/90'}`}>
                            {driver.name}
                          </span>
                          <span className="block text-[10px] font-mono text-white/40 truncate">
                            {driver.team}
                          </span>
                        </div>
                      </div>

                      {/* Tyres Badge */}
                      <div className="col-span-2 flex items-center justify-center gap-1.5">
                        <span 
                          className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[8px]"
                          style={{ borderColor: tyreInfo.border, color: tyreInfo.border }}
                          title={`${driver.tyreLaps} vueltas usadas`}
                        >
                          {tyreInfo.name[0]}
                        </span>
                        <div className="w-12 bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              driver.tyreWear > 75 
                                ? 'bg-red-500' 
                                : driver.tyreWear > 50 
                                ? 'bg-amber-400' 
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, driver.tyreWear)}%` }}
                          />
                        </div>
                      </div>

                      {/* Pit count */}
                      <div className="col-span-1 text-center font-mono text-[11px] text-white/60">
                        {driver.pitStops}
                      </div>

                      {/* Gap */}
                      <div className="col-span-2 text-right font-mono text-[11px] font-bold">
                        {driver.position === 1 ? (
                          <span className="text-yellow-400">LEADER</span>
                        ) : (
                          <span className="text-white/70">+{driver.gapToLeader}s</span>
                        )}
                      </div>

                      {/* Last Lap Time */}
                      <div className="col-span-2 text-right font-mono text-[11px] text-white/50">
                        {driver.lastLapTime > 0 ? `${driver.lastLapTime.toFixed(2)}s` : '--'}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 5. Mini-radar 2D synchronized with sectors and car positions */}
              <div className="mt-4">
                <CircuitRadar 
                  drivers={engine.drivers} 
                  scenarioId={scenario.id}
                  trackName={scenario.trackName} 
                />
              </div>
            </div>

            {/* Cockpit Muro: Player Status, Interactive Pit Window & Orders (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* 4. Interactive Pit Window connected to simulation physics */}
              <PitWindowInteractive
                projection={engine.getProjectedPitWindow()}
                drivers={engine.drivers}
                isPitPlanned={!!engine.playerPlannedPitLap}
                onConfirmBox={() => setIsPitModalOpen(true)}
              />

              {/* Player Telemetry Card */}
              {playerDriver && (
                <div className="bg-[#0f0f0f] border border-white/15 rounded-sm p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Radio size={16} className="text-[#e10600] animate-pulse" />
                      <span className="text-xs font-f1 font-bold tracking-widest text-white uppercase">
                        CANAL DE TELEMETRÍA // TU PILOTO
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-f1 font-bold bg-[#e10600] text-white">
                      P{playerDriver.position}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Compound info */}
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xs">
                      <div className="text-[10px] font-mono text-white/40 uppercase mb-1">NEUMÁTICOS ACTUALES</div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-[8px]"
                          style={{ borderColor: TYRE_COLORS[playerDriver.currentCompound].border, color: TYRE_COLORS[playerDriver.currentCompound].border }}
                        >
                          {TYRE_COLORS[playerDriver.currentCompound].name[0]}
                        </span>
                        <span className="font-f1 font-bold text-white text-sm">
                          {TYRE_COLORS[playerDriver.currentCompound].name}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-white/50 mt-1">
                        {playerDriver.tyreLaps} vueltas · Desgaste: <strong className={playerDriver.tyreWear > 70 ? 'text-red-400' : 'text-white'}>{Math.round(playerDriver.tyreWear)}%</strong>
                      </div>
                    </div>

                    {/* Gap to ahead / behind & DRS/Fuel */}
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xs">
                      <div className="text-[10px] font-mono text-white/40 uppercase mb-1 flex items-center justify-between">
                        <span>BRECHA & TELEMETRÍA</span>
                        {playerDriver.hasDrs && (
                          <span className="px-1.5 py-0.2 rounded-xs bg-emerald-500 text-black font-black text-[8px] animate-pulse">
                            DRS OPEN
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-f1 font-bold text-white">
                        {playerDriver.position === 1 ? 'Liderando' : `+${playerDriver.gapToAhead}s al rival`}
                      </div>
                      <div className="text-[10px] font-mono text-white/50 mt-1 flex items-center justify-between">
                        <span>Boxes: {playerDriver.pitStops}</span>
                        <span className="text-white/70 font-bold">⛽ {playerDriver.fuelKg} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Pace Mode Controls */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-white/40 uppercase block mb-1.5 font-bold">
                      ORDEN DE RITMO (PACE):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { mode: 'attack', label: 'ATTACK', icon: Flame, color: '#e10600' },
                        { mode: 'balanced', label: 'BALANCED', icon: Zap, color: '#38bdf8' },
                        { mode: 'conserve', label: 'CONSERVE', icon: TrendingDown, color: '#4ade80' },
                      ].map(p => {
                        const Icon = p.icon;
                        const isCurrent = playerDriver.paceMode === p.mode;
                        return (
                          <button
                            key={p.mode}
                            onClick={() => engine.setPlayerPace(p.mode as PaceMode)}
                            className={`py-2 px-1 rounded-xs border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                              isCurrent
                                ? 'bg-white/20 border-white text-white font-bold'
                                : 'bg-white/5 border-white/5 hover:border-white/20 text-white/50'
                            }`}
                          >
                            <Icon size={14} style={{ color: p.color }} />
                            <span className="text-[10px] font-f1 tracking-wider uppercase">{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Box Call Action */}
                  <div>
                    {engine.playerPlannedPitLap ? (
                      <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/40 rounded-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-f1 font-bold text-yellow-400 block uppercase">
                            PARADA PROGRAMADA: VUELTA {engine.playerPlannedPitLap}
                          </span>
                          <span className="text-[10px] font-mono text-white/50">
                            Montar {engine.playerPlannedCompound.toUpperCase()}
                          </span>
                        </div>
                        <button
                          onClick={() => engine.cancelPitStop()}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono uppercase rounded-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsPitModalOpen(true)}
                        className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-f1 font-bold text-xs uppercase tracking-widest rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Wrench size={14} className="text-[#e10600]" />
                        <span>CONFIGURAR COMPUESTO & BOX BOX</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Race Control Feed / Radio Logs */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-sm p-3.5 h-60 flex flex-col">
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-2 font-bold">
                  RADIO DEL EQUIPO & INCIDENTES
                </span>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                  {engine.eventsLog.map((evt, idx) => (
                    <div 
                      key={idx}
                      className={`p-2 rounded-xs border text-[11px] leading-relaxed ${
                        evt.type === 'incident' 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
                          : evt.type === 'weather'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                          : evt.type === 'pit'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : evt.type === 'overtake'
                          ? 'bg-[#e10600]/15 border-[#e10600]/40 text-white font-bold'
                          : evt.type === 'warning'
                          ? 'bg-red-500/10 border-red-500/20 text-red-300'
                          : 'bg-white/5 border-white/5 text-white/70'
                      }`}
                    >
                      <span className="text-white/40 font-bold mr-1.5">[V{evt.lap}]</span>
                      <span>{evt.message}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* PHASE C: DEBRIEF & POST RACE REPORT */}
      {phase === 'debrief' && report && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto bg-[#0d0d0d] border border-white/15 rounded-sm p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="text-center pb-6 border-b border-white/10">
            <span className="text-[10px] font-mono text-[#e10600] uppercase tracking-[0.3em] font-bold block mb-1">
              POST-RACE DEBRIEFING // INFORME DEL MURO
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-syne uppercase text-white">
              {report.finishPosition <= scenario.targetPosition ? (
                <span className="text-emerald-400">OBJETIVO CUMPLIDO</span>
              ) : (
                <span className="text-red-400">OBJETIVO NO ALCANZADO</span>
              )}
            </h2>
            <p className="text-xs font-mono text-white/50 mt-1">
              {scenario.trackName} · {scenario.totalLaps} Vueltas completadas
            </p>
          </div>

          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xs text-center">
              <span className="text-[9px] font-mono text-white/40 uppercase block">POSICIÓN FINAL</span>
              <span className="text-2xl font-f1 font-black text-white">P{report.finishPosition}</span>
              <span className="text-[10px] font-mono block text-white/50">Salida: P{report.startPosition}</span>
            </div>

            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xs text-center">
              <span className="text-[9px] font-mono text-white/40 uppercase block">DIFERENCIA GANADOR</span>
              <span className="text-2xl font-f1 font-black text-white">
                {report.finishPosition === 1 ? 'VICTORIA' : `+${report.gapToWinner}s`}
              </span>
              <span className="text-[10px] font-mono block text-white/50">{report.totalPits} Paradas en box</span>
            </div>

            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xs text-center">
              <span className="text-[9px] font-mono text-white/40 uppercase block">PUNTUACIÓN ESTRATEGIA</span>
              <span className="text-2xl font-f1 font-black text-yellow-400">{report.score} pts</span>
              <span className="text-[10px] font-mono block text-white/50">RATING: {report.rating}</span>
            </div>

            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xs text-center">
              <span className="text-[9px] font-mono text-white/40 uppercase block">RECOMPENSA PITCOINS</span>
              <div className="flex items-center justify-center gap-1.5 text-xl font-f1 font-black text-yellow-400 mt-0.5">
                <PitCoinIcon size={18} />
                <span>+{report.coinsReward}</span>
              </div>
              <span className="text-[10px] font-mono block text-white/50">Añadidas al balance</span>
            </div>
          </div>

          {/* Strategic Decision Explanations */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/60 mb-3 font-bold">
              ANÁLISIS DE DECISIONES DEL INGENIERO:
            </h4>
            <div className="space-y-2.5">
              {report.keyDecisions.map((dec, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-xs border flex items-start gap-3 ${
                    dec.impact === 'positive'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100'
                      : dec.impact === 'negative'
                      ? 'bg-red-500/10 border-red-500/20 text-red-100'
                      : 'bg-white/5 border-white/10 text-white/80'
                  }`}
                >
                  {dec.impact === 'positive' ? (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : dec.impact === 'negative' ? (
                    <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <Disc size={18} className="text-white/40 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="block font-f1 font-bold text-xs uppercase tracking-wide">
                      {dec.title}
                    </span>
                    <span className="block text-xs font-sans text-white/70 mt-0.5">
                      {dec.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartRace}
              className="flex-1 py-3 bg-[#e10600] hover:bg-[#b00500] text-white font-f1 font-bold text-xs uppercase tracking-widest rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RotateCcw size={14} />
              <span>REPETIR ESTE ESCENARIO</span>
            </button>
            <button
              onClick={handleResetToBriefing}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-f1 font-bold text-xs uppercase tracking-widest rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass size={14} />
              <span>ELEGIR OTRO CIRCUITO / ESCENARIO</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* MODAL: BOX BOX ORDER */}
      <AnimatePresence>
        {isPitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsPitModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0e0e0e] border border-white/20 rounded-sm p-6 shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-[#e10600]">
                  <Wrench size={18} />
                  <span className="font-f1 font-bold text-sm tracking-wider uppercase text-white">ORDENAR PARADA EN BOXES</span>
                </div>
                <span className="text-[10px] font-mono text-white/40">FINAL DE VUELTA</span>
              </div>

              <p className="text-xs text-white/60 font-mono mb-4">
                El piloto entrará al final de la vuelta actual. Selecciona el juego de neumáticos que montarán los mecánicos:
              </p>

              <div className="space-y-2 mb-6">
                {(['soft', 'medium', 'hard', 'intermediate', 'wet'] as Compound[]).map((comp) => {
                  const info = TYRE_COLORS[comp];
                  const isSelected = selectedPitCompound === comp;
                  return (
                    <button
                      key={comp}
                      onClick={() => setSelectedPitCompound(comp)}
                      className={`w-full p-2.5 rounded-xs border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-white/15 border-white text-white font-bold'
                          : 'bg-white/5 border-white/5 hover:border-white/15 text-white/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-[8px]"
                          style={{ borderColor: info.border, color: info.border }}
                        >
                          {info.name[0]}
                        </span>
                        <span className="font-f1 text-xs uppercase tracking-wider">{info.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">
                        {comp === 'soft' ? 'Ritmo máximo / Alta degr.' : comp === 'medium' ? 'Equilibrado' : comp === 'hard' ? 'Larga duración' : 'Pista mojada'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsPitModalOpen(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase rounded-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    engine?.orderPitStop(selectedPitCompound);
                    setIsPitModalOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-[#e10600] hover:bg-[#b00500] text-white font-f1 font-bold text-xs uppercase tracking-widest rounded-xs cursor-pointer shadow-md"
                >
                  CONFIRMAR BOX
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
