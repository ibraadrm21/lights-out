import React from 'react';
import { PitWindowProjection, DriverInRace } from '../../types/strategyMaster';
import { ArrowDownRight, Users, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface PitWindowInteractiveProps {
  projection: PitWindowProjection;
  drivers: DriverInRace[];
  onConfirmBox: () => void;
  isPitPlanned: boolean;
}

export const PitWindowInteractive: React.FC<PitWindowInteractiveProps> = ({
  projection,
  drivers,
  onConfirmBox,
  isPitPlanned,
}) => {
  const player = drivers.find(d => d.isPlayer);
  const positionDelta = projection.projectedPosition - projection.currentPosition;

  return (
    <div className="bg-[#0e0e0e] border border-white/10 rounded-sm p-4 relative overflow-hidden select-none">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-yellow-400" />
          <span className="text-[10px] font-f1 font-bold tracking-widest text-white uppercase">
            VENTANA DE PARADA INTERACTIVA // PIT WINDOW
          </span>
        </div>
        <span className="text-[9px] font-mono text-white/40 uppercase">
          PROYECCIÓN EN VIVO
        </span>
      </div>

      {/* Main projection tiles */}
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {/* Current vs Projected Pos */}
        <div className="p-2.5 bg-white/5 border border-white/5 rounded-xs">
          <span className="text-[9px] font-mono text-white/40 uppercase block">POS. DE SALIDA</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-f1 font-black text-white">P{projection.projectedPosition}</span>
            <span className={`text-[10px] font-mono font-bold ${positionDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              ({positionDelta > 0 ? `-${positionDelta}` : '0'})
            </span>
          </div>
          <span className="text-[8px] font-mono text-white/40 block mt-0.5">Actualmente P{projection.currentPosition}</span>
        </div>

        {/* Pit Time Loss */}
        <div className="p-2.5 bg-white/5 border border-white/5 rounded-xs">
          <span className="text-[9px] font-mono text-white/40 uppercase block">PÉRDIDA ESTIMADA</span>
          <div className="text-lg font-f1 font-black text-yellow-400 mt-0.5">
            +{projection.pitLossSeconds.toFixed(1)}s
          </div>
          <span className="text-[8px] font-mono text-white/40 block mt-0.5">Tiempo en calle de boxes</span>
        </div>

        {/* Traffic risk */}
        <div className="p-2.5 bg-white/5 border border-white/5 rounded-xs">
          <span className="text-[9px] font-mono text-white/40 uppercase block">RIESGO DE TRÁFICO</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${
              projection.trafficRisk === 'high' 
                ? 'bg-red-500 animate-pulse' 
                : projection.trafficRisk === 'medium'
                ? 'bg-yellow-400'
                : 'bg-emerald-400'
            }`} />
            <span className="text-xs font-f1 font-bold uppercase text-white">
              {projection.trafficRisk === 'high' ? 'ALTO' : projection.trafficRisk === 'medium' ? 'MEDIO' : 'LIMPIO'}
            </span>
          </div>
          <span className="text-[8px] font-mono text-white/40 block mt-0.5 truncate">
            {projection.rejoinAheadDriver ? `Tras ${projection.rejoinAheadDriver.split(' ')[1] || projection.rejoinAheadDriver}` : 'Aire limpio'}
          </span>
        </div>
      </div>

      {/* Traffic description banner */}
      <div className={`p-2.5 rounded-xs border text-[11px] font-mono leading-relaxed mb-3 flex items-start gap-2 ${
        projection.trafficRisk === 'high'
          ? 'bg-red-500/10 border-red-500/30 text-red-200'
          : projection.trafficRisk === 'medium'
          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
      }`}>
        <AlertCircle size={15} className="shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">INFORME DEL MURO: </span>
          <span>{projection.trafficDescription}</span>
        </div>
      </div>

      {/* Visual Rejoin Slot Bar */}
      <div className="p-2 bg-black/50 border border-white/5 rounded-xs mb-3">
        <span className="text-[9px] font-mono text-white/40 uppercase block mb-1.5">
          SIMULACIÓN DE REINCORPORACIÓN EN LA PARRILLA:
        </span>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {drivers.map((d, idx) => {
            const isRejoinPoint = idx + 1 === projection.projectedPosition;
            return (
              <React.Fragment key={d.id}>
                {isRejoinPoint && (
                  <div className="px-2 py-1 bg-[#e10600] text-white text-[9px] font-f1 font-black rounded-xs shadow-[0_0_10px_rgba(225,6,0,0.6)] animate-pulse shrink-0">
                    ▼ TÚ (P{projection.projectedPosition})
                  </div>
                )}
                <div 
                  className={`px-1.5 py-0.5 text-[8px] font-mono rounded-xs border shrink-0 ${
                    d.isPlayer 
                      ? 'bg-white/20 border-white text-white font-bold' 
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  P{d.position} {d.name.split(' ')[1] || d.name}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Quick Action Button */}
      {!isPitPlanned && (
        <button
          onClick={onConfirmBox}
          className="w-full py-2 bg-[#e10600]/80 hover:bg-[#e10600] text-white font-f1 font-bold text-[11px] uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <span>APROVECHAR ESTA VENTANA // BOX THIS LAP</span>
          <ArrowDownRight size={14} />
        </button>
      )}
    </div>
  );
};
