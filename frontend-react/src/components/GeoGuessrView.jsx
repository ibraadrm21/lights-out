import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CircuitGeoEngine } from '../geoguessr-engine.js';
import confetti from 'canvas-confetti';

export function GeoGuessrView({ store, updateNavTelemetry, onReturnHome }) {
  const [engine] = useState(() => new CircuitGeoEngine({ filterMode: 'all' }));
  const [roundData, setRoundData] = useState(() => engine.getCurrentRoundData());
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const user = store.getUser();

  // Initialize Leaflet map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
      });

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
      }).addTo(map);

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setSelectedPoint({ lat, lng });

        const pinIcon = window.L.divIcon({
          className: 'f1-map-pin',
          html: '<div style="font-size: 26px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5)); transform: translate(-50%, -100%);">📍</div>',
          iconSize: [30, 30],
        });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = window.L.marker([lat, lng], { icon: pinIcon }).addTo(map);
        }
      });

      leafletMapRef.current = map;
    }
  }, []);

  const handleToggleClue = () => {
    const res = engine.unlockNextClue(user.coins, (cost) => {
      store.deductCoins(cost, 'Pista GPS GeoGuessr');
      updateNavTelemetry();
    });
    if (res.success) {
      setRoundData({ ...engine.getCurrentRoundData() });
    } else {
      alert(res.message);
    }
  };

  const handleConfirmGuess = () => {
    if (!selectedPoint) {
      alert('Por favor haz clic en el mini-mapa para colocar tu chincheta antes de adivinar.');
      setIsMapExpanded(true);
      return;
    }

    const res = engine.guessCoordinates(selectedPoint.lat, selectedPoint.lng);
    store.addPointsAndCoins(res.result.earnedPoints, 40, `GeoGuessr: ${res.result.circuit.name}`);
    updateNavTelemetry();

    setResultModal(res);

    if (res.result.distanceKm < 100) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  const handleNextRound = () => {
    setResultModal(null);
    setSelectedPoint(null);
    if (markerRef.current && leafletMapRef.current) {
      leafletMapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    const status = engine.nextRound();
    if (status.isMatchOver) {
      alert(`¡Desafío completado! Puntuación final: ${engine.totalScore} PTS.`);
      onReturnHome();
    } else {
      setRoundData(engine.getCurrentRoundData());
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[640px] rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl">
      {/* 360 Street View or Vector Track Silhouette */}
      {roundData?.streetView?.embedUrl ? (
        <iframe
          src={roundData.streetView.embedUrl}
          className="w-full h-full border-0"
          allowFullScreen=""
          loading="lazy"
          title="F1 Circuit Street View"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4 bg-[#0a0d14]">
          <div className="text-4xl">🗺️</div>
          <div className="font-['Space_Grotesk'] text-xl font-bold">Trazado Vectorial en Telemetría</div>
          {roundData?.svgPath && (
            <svg viewBox="0 0 400 300" className="w-72 h-52 filter drop-shadow-[0_0_20px_rgba(255,24,1,0.5)]">
              <path d={roundData.svgPath} fill="none" stroke="#ff1801" strokeWidth="6" strokeLinecap="round" />
            </svg>
          )}
        </div>
      )}

      {/* Top HUD Card */}
      <div className="absolute top-5 left-5 z-30 bg-[#0c0f18]/90 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/[0.1] border-l-4 border-l-[#ff1801] flex items-center gap-5 shadow-2xl">
        <button
          onClick={onReturnHome}
          className="text-white hover:text-red-400 text-lg transition-colors pr-1 font-bold"
          title="Regresar al Paddock"
        >
          &larr;
        </button>
        <div>
          <div className="text-[10px] font-mono font-bold text-red-400 tracking-wider">
            RONDA {roundData.round} / {roundData.totalRounds}
          </div>
          <div className="text-base font-bold font-['Space_Grotesk'] text-white uppercase">
            Circuit GeoGuessr
          </div>
        </div>
        <div className="border-l border-white/[0.1] pl-5 text-right font-mono">
          <div className="text-[10px] text-slate-400">PUNTOS</div>
          <div className="text-base font-bold text-cyan-400">
            {engine.totalScore} PTS
          </div>
        </div>
      </div>

      {/* Clues Pill Stack */}
      <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-2 max-w-md">
        {roundData.unlockedClues.map((clue, idx) => (
          <div
            key={idx}
            className="bg-[#0c0f18]/90 backdrop-blur-md border border-amber-500/30 rounded-lg px-3.5 py-2 text-white text-xs shadow-lg"
          >
            <strong className="text-amber-400 font-mono text-[11px] mr-1.5">
              PISTA #{idx + 1}:
            </strong>
            {clue}
          </div>
        ))}
        {roundData.unlockedCluesCount < roundData.totalCluesAvailable && (
          <button
            onClick={handleToggleClue}
            className="bg-[#121522]/90 backdrop-blur-md border border-amber-500/40 text-amber-300 rounded-full px-4 py-2 text-xs font-mono font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5 w-fit shadow-lg"
          >
            💡 Descifrar Pista ({roundData.unlockedCluesCount + 1}/{roundData.totalCluesAvailable}) &bull; -{roundData.clueCost} 🪙
          </button>
        )}
      </div>

      {/* Floating Map Drawer */}
      <motion.div
        animate={{
          width: isMapExpanded ? '520px' : '320px',
          height: isMapExpanded ? '360px' : '220px',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="absolute bottom-6 right-6 z-40 bg-[#0c0f18]/95 backdrop-blur-md border border-white/[0.15] rounded-2xl overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
      >
        <div className="flex-grow relative">
          <div ref={mapContainerRef} className="w-full h-full bg-[#0a0d14]" />
          <button
            onClick={() => {
              setIsMapExpanded(!isMapExpanded);
              setTimeout(() => leafletMapRef.current?.invalidateSize(), 300);
            }}
            className="absolute top-2.5 right-2.5 z-[1000] bg-black/70 hover:bg-black text-white border border-white/20 rounded-md w-7 h-7 flex items-center justify-center text-xs transition-colors"
          >
            {isMapExpanded ? '↙' : '↗'}
          </button>
        </div>
        <div className="p-3 bg-[#0d1018] border-t border-white/[0.08]">
          <button
            onClick={handleConfirmGuess}
            disabled={!selectedPoint}
            className={`w-full py-2.5 rounded-lg font-bold font-['Space_Grotesk'] text-xs uppercase tracking-wider transition-all ${
              selectedPoint
                ? 'btn-clean-primary !w-full justify-center'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            {selectedPoint ? 'Adivinar Ahora 🎯' : 'Coloca tu chincheta en el mapa'}
          </button>
        </div>
      </motion.div>

      {/* Result Modal */}
      <AnimatePresence>
        {resultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              className="clean-card p-8 sm:p-10 max-w-lg w-full text-center border-t-4 border-t-[#ff1801] shadow-2xl"
            >
              <div className="text-4xl mb-3">
                {resultModal.result.distanceKm < 100 ? '🎯' : '📍'}
              </div>
              <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-white uppercase mb-1">
                {resultModal.result.circuit.name}
              </h3>
              <p className="text-amber-400 font-mono text-sm mb-6">
                {resultModal.result.circuit.city}, {resultModal.result.circuit.country}
              </p>

              <div className="grid grid-cols-2 gap-4 bg-white/[0.03] border border-white/[0.06] p-4 rounded-xl mb-6 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Distancia de Error</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {resultModal.result.distanceKm.toLocaleString()} km
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Puntos Ronda</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    +{resultModal.result.earnedPoints} PTS
                  </div>
                </div>
              </div>

              <button
                className="btn-clean-primary w-full justify-center !py-3 font-semibold"
                onClick={handleNextRound}
              >
                {resultModal.isFinalRound ? 'Ver Resumen Final 🏆' : 'Siguiente Circuito &rarr;'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
