import React, { useState, useMemo } from 'react';
import { Gauge, Wrench, Shield, ArrowLeftRight, ChevronRight, Check } from 'lucide-react';
import { CarProfile, F1_CARS_DATA, getConstructorById } from '../../../data/f1EncyclopediaData';
import { SelectedEntity } from './EntityDetailModal';

interface CarsSectionProps {
  searchQuery: string;
  onSelectEntity: (entity: SelectedEntity) => void;
}

export const CarsSection: React.FC<CarsSectionProps> = ({
  searchQuery,
  onSelectEntity,
}) => {
  const [compareCar1Id, setCompareCar1Id] = useState<string>('mcl38');
  const [compareCar2Id, setCompareCar2Id] = useState<string>('rb20');
  const [showComparator, setShowComparator] = useState<boolean>(false);

  const filteredCars = useMemo(() => {
    return F1_CARS_DATA.filter((car) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          car.name.toLowerCase().includes(q) ||
          car.teamName.toLowerCase().includes(q) ||
          car.powerUnit.toLowerCase().includes(q) ||
          car.chassis.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery]);

  const car1 = F1_CARS_DATA.find(c => c.id === compareCar1Id) || F1_CARS_DATA[0];
  const car2 = F1_CARS_DATA.find(c => c.id === compareCar2Id) || F1_CARS_DATA[1];

  return (
    <div className="space-y-8">
      {/* General Technical Regulations Bar */}
      <div className="p-6 bg-gradient-to-r from-white/5 to-transparent border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#e10600] font-bold block mb-1">
              REGLAMENTO TÉCNICO FIA 2024 (GROUND EFFECT ERA)
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-syne uppercase text-white">
              MONOPLAZAS ACTUALES // PARÁMETROS COMUNES OBLIGATORIOS
            </h3>
          </div>
          <button
            onClick={() => setShowComparator(!showComparator)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <ArrowLeftRight size={14} />
            <span>{showComparator ? 'Ocultar Comparador' : 'Comparar 2 Monoplazas'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-black/40 border border-white/5">
            <span className="text-[9px] text-white/40 block">PESO MÍNIMO (SIN COMBUSTIBLE)</span>
            <span className="font-bold text-white">798 KG</span>
          </div>
          <div className="p-3 bg-black/40 border border-white/5">
            <span className="text-[9px] text-white/40 block">NEUMÁTICOS & LLANTAS</span>
            <span className="font-bold text-white">18" PIRELLI P-ZERO</span>
          </div>
          <div className="p-3 bg-black/40 border border-white/5">
            <span className="text-[9px] text-white/40 block">COMBUSTIBLE SOSTENIBLE</span>
            <span className="font-bold text-white">E10 (10% BIOETANOL)</span>
          </div>
          <div className="p-3 bg-black/40 border border-white/5">
            <span className="text-[9px] text-white/40 block">ANCHO MÁXIMO</span>
            <span className="font-bold text-white">2.000 MM (2 METROS)</span>
          </div>
        </div>
      </div>

      {/* Interactive Side-by-Side Comparator */}
      {showComparator && (
        <div className="p-6 bg-[#0c0c0c] border border-[#e10600]/30 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[#e10600] uppercase flex items-center gap-2">
              <ArrowLeftRight size={14} /> COMPARADOR TÉCNICO F1 2024
            </span>
            <div className="flex items-center gap-3">
              <select
                value={compareCar1Id}
                onChange={(e) => setCompareCar1Id(e.target.value)}
                className="bg-[#161616] border border-white/20 px-3 py-1 text-xs font-mono text-white"
              >
                {F1_CARS_DATA.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="text-xs font-mono text-white/40">VS</span>
              <select
                value={compareCar2Id}
                onChange={(e) => setCompareCar2Id(e.target.value)}
                className="bg-[#161616] border border-white/20 px-3 py-1 text-xs font-mono text-white"
              >
                {F1_CARS_DATA.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            {/* Car 1 */}
            <div className="p-5 bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-lg font-black font-syne uppercase text-white">{car1.name}</h4>
                <span className="text-[10px] text-white/40">{car1.teamName}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 block">MOTOR</span>
                <span className="font-bold text-cyan-400">{car1.powerUnit}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 block">SUSPENSIÓN DELANTERA / TRASERA</span>
                <span className="text-white block">Del: {car1.suspension.front}</span>
                <span className="text-white block">Tras: {car1.suspension.rear}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 block">AERODINÁMICA DESTACADA</span>
                <p className="text-white/70 text-[11px] leading-relaxed">{car1.aeroHighlights}</p>
              </div>
            </div>

            {/* Car 2 */}
            <div className="p-5 bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-lg font-black font-syne uppercase text-white">{car2.name}</h4>
                <span className="text-[10px] text-white/40">{car2.teamName}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 block">MOTOR</span>
                <span className="font-bold text-cyan-400">{car2.powerUnit}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 block">SUSPENSIÓN DELANTERA / TRASERA</span>
                <span className="text-white block">Del: {car2.suspension.front}</span>
                <span className="text-white block">Tras: {car2.suspension.rear}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 block">AERODINÁMICA DESTACADA</span>
                <p className="text-white/70 text-[11px] leading-relaxed">{car2.aeroHighlights}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10 Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCars.map((car) => {
          const team = getConstructorById(car.teamId);

          return (
            <div
              key={car.id}
              className="bg-[#0f0f0f] border border-white/10 hover:border-white/25 transition-all p-6 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 block">
                      {car.teamName} • TEMPORADA {car.season}
                    </span>
                    <h3 className="text-2xl font-black font-syne uppercase text-white tracking-tight">
                      {car.name}
                    </h3>
                  </div>

                  {team && (
                    <div className="w-12 h-12 p-1.5 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <img
                        src={team.logoUrl}
                        alt={team.officialName}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Technical Overview */}
                <div className="p-3.5 bg-white/5 border border-white/5 space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-white/40 uppercase block">UNIDAD DE POTENCIA</span>
                    <span className="font-bold text-cyan-400">{car.powerUnit}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <div>
                      <span className="text-[9px] text-white/40 uppercase block">SUSPENSIÓN DEL.</span>
                      <span className="text-white font-bold">{car.suspension.front.split(' ')[0]}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 uppercase block">SUSPENSIÓN TRAS.</span>
                      <span className="text-white font-bold">{car.suspension.rear.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">
                    CARACTERÍSTICAS AERODINÁMICAS CONOCIDAS:
                  </span>
                  <p className="text-xs font-mono text-white/70 leading-relaxed line-clamp-3">
                    {car.aeroHighlights}
                  </p>
                </div>
              </div>

              {/* Bottom Action */}
              <button
                onClick={() => onSelectEntity({ type: 'car', data: car })}
                className="w-full mt-4 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs font-mono text-white/80 hover:text-white transition-colors"
              >
                <span>VER ESPECIFICACIONES COMPLETAS</span>
                <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
