import React, { useState, useMemo } from 'react';
import { Search, Filter, Trophy, Flag, ChevronRight, Activity } from 'lucide-react';
import { DriverProfile, F1_DRIVERS_DATA, F1_CONSTRUCTORS_DATA } from '../../../data/f1EncyclopediaData';
import { getDriverWikipediaPhoto } from '../../../services/f1PhotoService';
import { SelectedEntity } from './EntityDetailModal';

interface DriversSectionProps {
  searchQuery: string;
  onSelectEntity: (entity: SelectedEntity) => void;
}

export const DriversSection: React.FC<DriversSectionProps> = ({
  searchQuery,
  onSelectEntity,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [selectedNationality, setSelectedNationality] = useState<string>('ALL');

  // Unique nationalities
  const nationalities = useMemo(() => {
    const list = Array.from(new Set(F1_DRIVERS_DATA.map(d => d.country))).sort();
    return ['ALL', ...list];
  }, []);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    return F1_DRIVERS_DATA.filter((driver) => {
      // Team filter
      if (selectedTeam !== 'ALL' && driver.teamId !== selectedTeam) {
        return false;
      }
      // Nationality filter
      if (selectedNationality !== 'ALL' && driver.country !== selectedNationality) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = driver.fullName.toLowerCase().includes(q) || driver.acronym.toLowerCase().includes(q);
        const matchNumber = String(driver.number).includes(q);
        const matchTeam = driver.teamName.toLowerCase().includes(q);
        const matchCountry = driver.country.toLowerCase().includes(q);
        return matchName || matchNumber || matchTeam || matchCountry;
      }
      return true;
    }).sort((a, b) => a.championshipPosition - b.championshipPosition);
  }, [selectedTeam, selectedNationality, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 border border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 flex items-center gap-1.5">
            <Filter size={12} /> FILTRAR POR:
          </span>

          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="bg-[#121212] border border-white/15 px-3 py-1.5 text-xs font-mono text-white rounded-none focus:outline-hidden focus:border-[#e10600]"
          >
            <option value="ALL">Todas las Escuderías ({F1_CONSTRUCTORS_DATA.length})</option>
            {F1_CONSTRUCTORS_DATA.map(c => (
              <option key={c.id} value={c.id}>{c.shortName}</option>
            ))}
          </select>

          {/* Nationality Filter */}
          <select
            value={selectedNationality}
            onChange={(e) => setSelectedNationality(e.target.value)}
            className="bg-[#121212] border border-white/15 px-3 py-1.5 text-xs font-mono text-white rounded-none focus:outline-hidden focus:border-[#e10600]"
          >
            <option value="ALL">Todas las Nacionalidades</option>
            {nationalities.filter(n => n !== 'ALL').map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-white/50">
          MOSTRANDO <span className="text-white font-bold">{filteredDrivers.length}</span> DE 20 PILOTOS
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDrivers.map((driver) => (
          <button
            key={driver.id}
            onClick={() => onSelectEntity({ type: 'driver', data: driver })}
            className="group relative bg-[#0f0f0f] hover:bg-[#141414] border border-white/10 hover:border-white/25 transition-all text-left overflow-hidden flex flex-col justify-between"
          >
            {/* Top Team Accent Line */}
            <div
              className="h-1 w-full"
              style={{ backgroundColor: driver.teamColour }}
            />

            {/* Card Body */}
            <div className="p-5 space-y-4">
              {/* Header: Number, Flag & Position */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{driver.flag}</span>
                  <span className="text-xs font-mono font-bold text-white/60 tracking-wider">
                    {driver.acronym}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-white/70">
                    P{driver.championshipPosition}
                  </span>
                  <span className="text-xs font-mono font-black text-[#e10600]">
                    #{driver.number}
                  </span>
                </div>
              </div>

              {/* Driver Image & Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 shrink-0 bg-white/5 border border-white/10 overflow-hidden">
                  <img
                    src={getDriverWikipediaPhoto(driver.id) || driver.headshotUrl}
                    alt={driver.fullName}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = driver.headshotUrl;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase block truncate">
                    {driver.teamName}
                  </span>
                  <h3 className="text-lg font-black font-syne uppercase tracking-tight text-white group-hover:text-[#e10600] transition-colors truncate">
                    {driver.fullName}
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#e10600]">
                    {driver.points} PTS
                  </span>
                </div>
              </div>

              {/* Mini Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center font-mono">
                <div className="p-1.5 bg-white/5">
                  <span className="text-[8px] text-white/40 uppercase block">VICTORIAS</span>
                  <span className="text-xs font-bold text-white">{driver.seasonStats.wins}</span>
                </div>
                <div className="p-1.5 bg-white/5">
                  <span className="text-[8px] text-white/40 uppercase block">PODIOS</span>
                  <span className="text-xs font-bold text-white">{driver.seasonStats.podiums}</span>
                </div>
                <div className="p-1.5 bg-white/5">
                  <span className="text-[8px] text-white/40 uppercase block">POLES</span>
                  <span className="text-xs font-bold text-white">{driver.seasonStats.poles}</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="px-5 py-2.5 bg-white/5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40 group-hover:text-white transition-colors">
              <span>EXPLORAR FICHA COMPLETA</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
