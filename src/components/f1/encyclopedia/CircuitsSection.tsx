import React, { useState, useMemo } from 'react';
import { MapPin, Flag, Trophy, Gauge, Filter, ChevronRight, Activity } from 'lucide-react';
import { CircuitProfile, F1_CIRCUITS_DATA } from '../../../data/f1EncyclopediaData';
import { CIRCUIT_VECTOR_PROFILES } from '../../../data/circuitProfiles';
import { getCircuitVectorMap } from '../../../services/f1PhotoService';
import { SelectedEntity } from './EntityDetailModal';

interface CircuitsSectionProps {
  searchQuery: string;
  onSelectEntity: (entity: SelectedEntity) => void;
}

export const CircuitsSection: React.FC<CircuitsSectionProps> = ({
  searchQuery,
  onSelectEntity,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'UPCOMING'>('ALL');

  const filteredCircuits = useMemo(() => {
    return F1_CIRCUITS_DATA.filter((circuit) => {
      if (statusFilter !== 'ALL' && circuit.status2024 !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          circuit.circuitName.toLowerCase().includes(q) ||
          circuit.officialName.toLowerCase().includes(q) ||
          circuit.country.toLowerCase().includes(q) ||
          circuit.city.toLowerCase().includes(q) ||
          String(circuit.round) === q
        );
      }
      return true;
    }).sort((a, b) => a.round - b.round);
  }, [statusFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Calendar Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 flex items-center gap-1.5 mr-2">
            <Filter size={12} /> ESTADO DEL EVENTO:
          </span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border ${
              statusFilter === 'ALL'
                ? 'bg-white text-black font-bold border-white'
                : 'bg-white/5 text-white/60 hover:text-white border-white/10'
            }`}
          >
            Todos ({F1_CIRCUITS_DATA.length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border ${
              statusFilter === 'COMPLETED'
                ? 'bg-white text-black font-bold border-white'
                : 'bg-white/5 text-white/60 hover:text-white border-white/10'
            }`}
          >
            Disputados (24)
          </button>
        </div>

        <div className="text-xs font-mono text-white/50">
          CALENDARIO OFICIAL FIA FÓRMULA 1 // 24 GRANDES PREMIOS
        </div>
      </div>

      {/* Circuits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCircuits.map((circuit) => {
          const vectorProfile = circuit.vectorKey ? CIRCUIT_VECTOR_PROFILES[circuit.vectorKey] : null;

          return (
            <div
              key={circuit.id}
              className="bg-[#0f0f0f] border border-white/10 hover:border-white/25 transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Round badge & country */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#e10600] px-2 py-0.5 bg-[#e10600]/10 border border-[#e10600]/30">
                    RONDA #{circuit.round}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-white/60">
                    <span>{circuit.flag}</span>
                    <span className="uppercase">{circuit.country}</span>
                  </div>
                </div>

                {/* Circuit Name */}
                <div>
                  <h3 className="text-xl font-black font-syne uppercase text-white tracking-tight">
                    {circuit.circuitName}
                  </h3>
                  <span className="text-[10px] font-mono text-white/40 block truncate">
                    {circuit.officialName} ({circuit.city})
                  </span>
                </div>

                {/* SVG Vector Preview from Wikipedia */}
                <div className="w-full h-28 bg-black/50 border border-white/5 flex items-center justify-center p-2 relative overflow-hidden">
                  <img
                    src={getCircuitVectorMap(circuit.id)}
                    alt={`Trazado oficial de ${circuit.circuitName} de Wikipedia`}
                    className="max-h-24 w-auto object-contain filter contrast-125"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 right-2 text-[8px] font-mono text-[#FF1E00] uppercase">
                    WIKIPEDIA // VECTOR
                  </span>
                </div>

                {/* Circuit Specs Matrix */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono p-2.5 bg-white/5 border border-white/5">
                  <div>
                    <span className="text-[8px] text-white/40 uppercase block">LONGITUD</span>
                    <span className="font-bold text-white">{circuit.lengthKm} KM</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/40 uppercase block">VUELTAS</span>
                    <span className="font-bold text-[#e10600]">{circuit.raceLaps}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/40 uppercase block">CURVAS</span>
                    <span className="font-bold text-white">{circuit.turnsCount}</span>
                  </div>
                </div>

                {/* Lap Record */}
                <div className="p-2.5 bg-white/5 border border-white/5 text-xs font-mono">
                  <span className="text-[8px] text-[#e10600] uppercase font-bold block">RÉCORD DE VUELTA EN CARRERA</span>
                  <span className="font-bold text-white text-sm">{circuit.lapRecord.time}</span>
                  <span className="text-[9px] text-white/50 block truncate">
                    {circuit.lapRecord.driver} ({circuit.lapRecord.year}) • {circuit.lapRecord.car}
                  </span>
                </div>

                {/* 2024 GP Result snippet */}
                {circuit.sessionResults2024 && (
                  <div className="p-2 bg-amber-500/5 border border-amber-500/20 text-[10px] font-mono flex items-center justify-between text-amber-400">
                    <span className="uppercase font-bold flex items-center gap-1">
                      <Trophy size={11} /> GANADOR 2024:
                    </span>
                    <span className="font-bold text-white truncate max-w-[170px]">
                      {circuit.sessionResults2024.winnerDriver.split('(')[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              <button
                onClick={() => onSelectEntity({ type: 'circuit', data: circuit })}
                className="mt-4 pt-3 border-t border-white/5 w-full flex items-center justify-between text-xs font-mono text-white/40 hover:text-white transition-colors"
              >
                <span>VER DETALLES Y ZONAS DRS</span>
                <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
