import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, KeyRound, Award, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, Navigation, MapPin } from 'lucide-react';
import { CircuitGeoEngine } from '../../lib/lightsout/geoguessr-engine.js';
import { GoogleMapPicker } from './GoogleMapPicker';
import { useStore } from '../../store/useStore';

export const GeoGuessrView: React.FC = () => {
  const [engine, setEngine] = useState(() => new CircuitGeoEngine({ filterMode: 'all' }));
  const [roundData, setRoundData] = useState(() => engine.getCurrentRoundData());
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null);
  const [guessResult, setGuessResult] = useState<any | null>(null);
  const [unlockedClues, setUnlockedClues] = useState<string[]>([]);
  const { coins, addCoins } = useStore();

  const handlePinSelect = (lat: number, lng: number) => {
    if (guessResult) return;
    setSelectedPin({ lat, lng });
  };

  const handleUnlockClue = () => {
    if (coins < engine.clueCost) {
      alert(`Saldo insuficiente. Necesitas ${engine.clueCost} Paddock Coins para revelar la pista.`);
      return;
    }
    const res = engine.unlockNextClue(coins, (cost: number) => {
      addCoins(-cost);
    });
    if (res.success) {
      setUnlockedClues(res.unlockedClues);
    } else {
      alert(res.message);
    }
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
      setUnlockedClues([]);
    }
  };

  const handleRestart = () => {
    const newEngine = new CircuitGeoEngine({ filterMode: 'all' });
    setEngine(newEngine);
    setRoundData(newEngine.getCurrentRoundData());
    setSelectedPin(null);
    setGuessResult(null);
    setUnlockedClues([]);
  };

  const getScoreBadge = (distanceKm: number) => {
    if (distanceKm <= 25) return { label: '¡BULLSEYE MILIMÉTRICO!', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (distanceKm <= 100) return { label: '¡PRECISIÓN DE PILOTO!', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (distanceKm <= 300) return { label: '¡MUY CERCA!', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    if (distanceKm <= 750) return { label: '¡BUEN SECTOR!', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    if (distanceKm <= 1500) return { label: 'CONTINENTE CORRECTO', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    return { label: 'FUERA DE TRAZADA', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  };

  return (
    <section id="circuits" className="py-24 px-4 sm:px-6 w-full max-w-6xl mx-auto border-b border-white/5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-mono font-bold tracking-[0.4em] text-[#fed100] uppercase bg-[#fed100]/10 px-2.5 py-1 border border-[#fed100]/30 flex items-center gap-1.5">
              <Globe2 size={12} />
              GOOGLE MAPS GEOGUESSR API // LIGHTS OUT
            </span>
            <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase px-2 py-0.5 bg-white/5 border border-white/10">
              RONDA {roundData.round} / {roundData.totalRounds}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tighter">
            CIRCUIT <span className="text-[#fed100]">APEX</span>
          </h2>
        </div>

        <div className="text-right">
          <span className="text-[8px] font-mono text-white/40 uppercase block">PUNTUACIÓN GLOBAL</span>
          <span className="text-lg font-mono font-black text-white">{engine.totalScore.toLocaleString()} PTS</span>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl">
        {/* 1. Interactive Street View 360 / Panorama */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-black overflow-hidden border-b border-white/10">
          {roundData?.streetView?.embedUrl ? (
            <iframe
              src={roundData.streetView.embedUrl}
              className="w-full h-full border-0 contrast-110"
              allowFullScreen
              loading="lazy"
              title="F1 Circuit Street View"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-[#0d0d0d]">
              <Globe2 size={48} className="mb-2 text-white/20 animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-widest">
                TELEMETRÍA SATELITAL EN PROCESO
              </span>
            </div>
          )}

          {/* Technical Track Metadata Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none z-10">
            <span className="bg-black/90 backdrop-blur-md px-3 py-1.5 text-[8px] font-mono text-white font-bold tracking-widest border border-white/10 uppercase">
              LONGITUD: {roundData.lengthKm} KM
            </span>
            <span className="bg-black/90 backdrop-blur-md px-3 py-1.5 text-[8px] font-mono text-white/70 tracking-widest border border-white/10 uppercase">
              CURVAS: {roundData.turns} TURNS
            </span>
            <span className="bg-black/90 backdrop-blur-md px-3 py-1.5 text-[8px] font-mono text-[#fed100] tracking-widest border border-[#fed100]/20 uppercase">
              TIPO: {roundData.trackType}
            </span>
          </div>
        </div>

        {/* 2. Interactive Map Picker & Controls Area */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Unlockable Clues Bar */}
          <div className="p-4 bg-[#121212] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[8px] font-mono text-white/40 uppercase block mb-1">
                PISTAS DE TELEMETRÍA DESBLOQUEADAS ({unlockedClues.length} / {roundData.totalCluesAvailable})
              </span>
              {unlockedClues.length === 0 ? (
                <p className="text-xs text-white/50 italic font-mono">
                  Las pistas confidenciales de país, curvas y aerodinámica están cifradas.
                </p>
              ) : (
                <div className="space-y-1">
                  {unlockedClues.map((clue, idx) => (
                    <div key={idx} className="text-xs text-emerald-400 font-mono">
                      ⚡ {clue}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleUnlockClue}
              disabled={unlockedClues.length >= roundData.totalCluesAvailable}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-[9px] font-mono uppercase tracking-widest text-white transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-40"
            >
              <KeyRound size={12} className="text-[#fed100]" />
              <span>Desbloquear Pista (-35 Coins)</span>
            </button>
          </div>

          {/* Interactive Google Map Section */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-[#fed100]" />
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white">
                  SELECCIONA EN EL MAPA LA UBICACIÓN EXACTA DEL CIRCUITO:
                </h4>
              </div>
              <span className="text-[8px] font-mono text-white/40 uppercase">
                HAZ CLIC Y ARRASTRA PARA POSICIONAR TU MARCADOR
              </span>
            </div>

            {/* Google Maps Leaflet Picker Container */}
            <GoogleMapPicker
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
              isRevealed={!!guessResult}
              disabled={!!guessResult}
            />
          </div>

          {/* Action Row: Guess Button OR Result Summary */}
          {!guessResult ? (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/10 gap-4">
              <span className="text-[9px] font-mono text-white/50 uppercase">
                {selectedPin
                  ? 'PIN LISTO: Confirma tu estimación para calcular los kilómetros de error.'
                  : 'Navega en el mapa de Google Maps y pulsa sobre el país/circuito sospechoso.'}
              </span>

              <button
                type="button"
                onClick={handleSubmitGuess}
                disabled={!selectedPin}
                className="w-full sm:w-auto px-8 py-4 bg-[#fed100] hover:bg-[#ffe34d] text-black font-black font-mono text-[10px] tracking-[0.25em] uppercase transition-all shadow-xl shadow-[#fed100]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <MapPin size={14} className="fill-black" />
                <span>CONFIRMAR PREDICCIÓN (GUESS)</span>
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-[#141414] border border-white/15 space-y-4"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] font-mono font-bold tracking-widest px-2.5 py-0.5 border uppercase ${getScoreBadge(guessResult.distanceKm).color}`}>
                      {getScoreBadge(guessResult.distanceKm).label}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      ERROR: <strong className="text-[#fed100]">{guessResult.distanceKm.toLocaleString()} KM</strong>
                    </span>
                  </div>
                  <h3 className="text-xl font-black font-syne uppercase text-white">
                    {guessResult.circuit.name} • {guessResult.circuit.city} ({guessResult.circuit.country})
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[8px] font-mono text-white/40 uppercase block">PUNTOS OBTENIDOS</span>
                    <span className="text-2xl font-mono font-black text-emerald-400">
                      +{guessResult.earnedPoints} <span className="text-xs text-white/40">PTS</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="px-6 py-4 bg-white hover:bg-neutral-200 text-black font-black font-mono text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl"
                  >
                    <span>{roundData.round === roundData.totalRounds ? 'Finalizar Match' : 'Siguiente Circuito'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[9px] font-mono text-white/60">
                <div className="p-3 bg-white/[0.02] border border-white/5">
                  <span className="text-white/30 uppercase block">COORDENADAS REALES</span>
                  <span className="text-white font-bold">{guessResult.actualLat.toFixed(4)}°N, {guessResult.actualLng.toFixed(4)}°E</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5">
                  <span className="text-white/30 uppercase block">TU ESTIMACIÓN</span>
                  <span className="text-white font-bold">{guessResult.guessLat.toFixed(4)}°N, {guessResult.guessLng.toFixed(4)}°E</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5">
                  <span className="text-white/30 uppercase block">RÉCORD DE VUELTA</span>
                  <span className="text-[#fed100] font-bold">{guessResult.circuit.lapRecord || 'Oficial'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
