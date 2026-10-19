import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Maximize2, Minimize2, MapPin, ArrowRight, RotateCcw, 
  Eye, Zap, CheckCircle2, ChevronRight, Award, ShieldAlert 
} from 'lucide-react';
import { CircuitGeoEngine } from '../../lib/lightsout/geoguessr-engine.js';
import { GoogleMapPicker } from './GoogleMapPicker';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../contexts/AuthContext';

export const GeoGuessrView: React.FC = () => {
  const [engine, setEngine] = useState(() => new CircuitGeoEngine({ filterMode: 'all' }));
  const [roundData, setRoundData] = useState(() => engine.getCurrentRoundData());
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null);
  const [guessResult, setGuessResult] = useState<any | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [isMapHovered, setIsMapHovered] = useState<boolean>(false);
  const [showClue, setShowClue] = useState<boolean>(false);

  const { coins, addCoins } = useStore();
  const { profile } = useAuth();

  const handlePinSelect = (lat: number, lng: number) => {
    if (guessResult) return;
    setSelectedPin({ lat, lng });
  };

  const handleSubmitGuess = () => {
    if (!selectedPin || guessResult) return;

    const res = engine.guessCoordinates(selectedPin.lat, selectedPin.lng);
    if (res.error) {
      alert(res.error);
      return;
    }

    if (res.success && res.result) {
      addCoins(res.result.earnedPoints);
      setGuessResult(res.result);
      setIsMapExpanded(true); // Auto-expand map to show distance line & result
    }
  };

  const handleNextRound = () => {
    const status = engine.nextRound();
    if (status.isMatchOver) {
      alert(`¡Sesión de GeoGuessr completada! Puntuación final: ${engine.totalScore} PTS.`);
      handleRestart();
    } else {
      setRoundData(engine.getCurrentRoundData());
      setSelectedPin(null);
      setGuessResult(null);
      setIsMapExpanded(false);
      setShowClue(false);
    }
  };

  const handleRestart = () => {
    const newEngine = new CircuitGeoEngine({ filterMode: 'all' });
    setEngine(newEngine);
    setRoundData(newEngine.getCurrentRoundData());
    setSelectedPin(null);
    setGuessResult(null);
    setIsMapExpanded(false);
    setShowClue(false);
  };

  const getScoreBadge = (distanceKm: number) => {
    if (distanceKm <= 25) return { label: '¡BULLSEYE 5.000 PTS!', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (distanceKm <= 100) return { label: '¡PRECISIÓN DE ÉLITE!', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (distanceKm <= 300) return { label: '¡MUY CERCA!', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    if (distanceKm <= 750) return { label: '¡BUEN SECTOR!', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    return { label: 'FUERA DE TRAZADA', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  };

  // Convert distance to standard GeoGuessr 5,000 points scale
  const computeGeoGuessrPoints = (distanceKm: number) => {
    return Math.max(0, Math.round(5000 * Math.exp(-distanceKm / 1500)));
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden select-none">
      {/* 1. IMMERSIVE FULLSCREEN STREET VIEW (PANORAMA) */}
      <div className="absolute inset-0 w-full h-full z-0">
        {roundData?.streetView?.embedUrl ? (
          <iframe
            src={roundData.streetView.embedUrl}
            className="w-full h-full border-0 contrast-105"
            allowFullScreen
            loading="lazy"
            title="Google Street View Panorama"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d0d] text-white/50">
            <span className="text-sm font-mono tracking-widest uppercase">
              Cargando Street View 360...
            </span>
          </div>
        )}
      </div>

      {/* 2. TOP HUD: ROUND & SCORE PILL */}
      <div className="absolute top-16 left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto bg-black/80 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 shadow-2xl flex items-center gap-4 text-xs font-mono">
          <span className="text-white/60 uppercase tracking-widest text-[11px]">
            RONDA <strong className="text-white">{roundData.round}</strong> / {roundData.totalRounds}
          </span>
          <div className="h-3.5 w-px bg-white/20" />
          <span className="text-[#fed100] font-black text-sm tracking-widest">
            {engine.totalScore} <span className="text-[10px] text-white/40">PTS</span>
          </span>
        </div>
      </div>

      {/* 3. SUBTLE TELEMETRY CLUE PILL (LEFT SIDE) */}
      <div className="absolute top-20 left-4 z-20 flex flex-col gap-2">
        <div className="bg-black/80 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[9px] font-mono text-white/80 rounded-sm shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#fed100] animate-pulse" />
          <span>F1 CIRCUIT GEOGUESSR</span>
        </div>

        {/* Optional Technical Hint toggle */}
        <button
          onClick={() => setShowClue(!showClue)}
          className="bg-black/80 hover:bg-black backdrop-blur-md border border-white/15 px-3 py-1.5 text-[8px] font-mono text-white/60 hover:text-white rounded-sm shadow-xl flex items-center gap-1.5 transition-all w-fit cursor-pointer"
        >
          <Eye size={11} />
          <span>{showClue ? 'Ocultar Pista' : 'Pista de Curvas'}</span>
        </button>

        <AnimatePresence>
          {showClue && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-black/90 backdrop-blur-md border border-white/15 p-3 rounded-sm shadow-2xl max-w-xs text-[9px] font-mono text-white/80 space-y-1"
            >
              <div>CURVAS: <strong className="text-white">{roundData.turns}</strong></div>
              <div>LONGITUD: <strong className="text-white">{roundData.lengthKm} KM</strong></div>
              <div>TIPO: <strong className="text-[#fed100]">{roundData.trackType}</strong></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. FLOATING INTERACTIVE MAP WIDGET (GEOGUESSR STYLE) */}
      <div 
        className="absolute bottom-5 right-5 z-30 flex flex-col items-end transition-all duration-300"
        onMouseEnter={() => !guessResult && setIsMapHovered(true)}
        onMouseLeave={() => !guessResult && setIsMapHovered(false)}
      >
        <motion.div
          animate={{
            width: isMapExpanded ? 'min(92vw, 840px)' : (isMapHovered ? '500px' : '400px'),
            height: isMapExpanded ? 'min(78vh, 600px)' : (isMapHovered ? '380px' : '300px'),
            opacity: 1
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="bg-[#0e0e14] border-2 border-white/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden relative"
        >
          {/* Leaflet Google Map Container */}
          <div className="w-full h-full relative overflow-hidden">
            <GoogleMapPicker
              className="relative w-full h-full overflow-hidden"
              onPinSelect={handlePinSelect}
              selectedPin={selectedPin}
              actualLocation={
                guessResult
                  ? {
                      lat: guessResult.actualLat,
                      lng: guessResult.actualLng,
                      name: `${guessResult.circuit.name} (${guessResult.circuit.country})`,
                    }
                  : null
              }
              isRevealed={Boolean(guessResult)}
              disabled={Boolean(guessResult)}
              isExpanded={isMapExpanded}
              onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
            />
          </div>

          {/* Floating GUESS Button Directly Over the Map */}
          {!guessResult && (
            <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center pointer-events-none px-4">
              <button
                type="button"
                onClick={handleSubmitGuess}
                disabled={!selectedPin}
                className="pointer-events-auto px-10 py-3 bg-[#46d369] hover:bg-[#57e77a] text-black font-black font-mono text-sm tracking-widest uppercase transition-all rounded-full shadow-[0_8px_30px_rgba(70,211,105,0.4)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>{selectedPin ? 'GUESS' : 'COLOCA UN PIN'}</span>
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* 5. POST-GUESS RESULT MODAL / OVERLAY (AUTHENTIC GEOGUESSR DEBRIEF) */}
      <AnimatePresence>
        {guessResult && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-5 left-5 z-40 bg-[#0e0e14]/95 backdrop-blur-xl border border-white/20 p-6 rounded-lg shadow-2xl max-w-md w-full"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className={`text-[8px] font-mono font-bold tracking-widest px-2 py-0.5 border uppercase rounded-xs ${getScoreBadge(guessResult.distanceKm).color}`}>
                  {getScoreBadge(guessResult.distanceKm).label}
                </span>
                <h3 className="text-xl font-black font-syne uppercase text-white mt-2">
                  {guessResult.circuit.name}
                </h3>
                <span className="text-xs font-mono text-white/60">
                  {guessResult.circuit.city}, {guessResult.circuit.country}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[8px] font-mono text-white/40 uppercase block">PUNTOS</span>
                <span className="text-2xl font-black font-syne text-[#46d369]">
                  +{computeGeoGuessrPoints(guessResult.distanceKm)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded my-4 flex justify-between items-center text-xs font-mono">
              <span className="text-white/50">DISTANCIA DE ERROR:</span>
              <span className="font-bold text-white text-sm">
                {guessResult.distanceKm.toLocaleString()} KM
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleNextRound}
                className="w-full py-3 bg-[#46d369] hover:bg-[#57e77a] text-black font-black font-mono text-[10px] tracking-widest uppercase transition-all rounded shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{roundData.round === roundData.totalRounds ? 'Ver Resumen Final' : 'Siguiente Ronda'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
