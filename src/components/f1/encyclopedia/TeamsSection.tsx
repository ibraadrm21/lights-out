import React, { useMemo } from 'react';
import { ChevronRight, Wrench, Shield, Trophy } from 'lucide-react';
import { ConstructorProfile, F1_CONSTRUCTORS_DATA, getDriverById } from '../../../data/f1EncyclopediaData';
import { SelectedEntity } from './EntityDetailModal';

interface TeamsSectionProps {
  searchQuery: string;
  onSelectEntity: (entity: SelectedEntity) => void;
}

export const TeamsSection: React.FC<TeamsSectionProps> = ({
  searchQuery,
  onSelectEntity,
}) => {
  const filteredTeams = useMemo(() => {
    return F1_CONSTRUCTORS_DATA.filter((team) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          team.officialName.toLowerCase().includes(q) ||
          team.shortName.toLowerCase().includes(q) ||
          team.code.toLowerCase().includes(q) ||
          team.powerUnitManufacturer.toLowerCase().includes(q) ||
          team.chassisName.toLowerCase().includes(q) ||
          team.teamPrincipal.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => a.championshipPosition - b.championshipPosition);
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="p-6 bg-gradient-to-r from-white/5 to-transparent border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#e10600] font-bold block mb-1">
            CAMPEONATO MUNDIAL DE CONSTRUCTORES FIA 2024
          </span>
          <h3 className="text-xl sm:text-2xl font-black font-syne uppercase text-white">
            10 ESCUDERÍAS OFICIALES EN PARRILLA
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-white/40 uppercase block">CAMPEÓN DE CONSTRUCTORES</span>
          <span className="text-sm font-mono font-bold text-amber-400">McLAREN F1 TEAM (666 PTS)</span>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTeams.map((team) => {
          const drivers = team.driverIds.map(id => getDriverById(id)).filter(Boolean);

          return (
            <div
              key={team.id}
              className="bg-[#0f0f0f] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between"
            >
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full" style={{ backgroundColor: team.primaryColor }} />

              <div className="p-6 space-y-6">
                {/* Header: Logo, Name, Position */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 p-2 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <img
                        src={team.logoUrl}
                        alt={team.officialName}
                        className="max-h-full max-w-full object-contain filter drop-shadow"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logos/mercedes.png';
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white/50">{team.flag} {team.code}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-white/70">
                          P{team.championshipPosition}
                        </span>
                      </div>
                      <h3 className="text-xl font-black font-syne uppercase text-white tracking-tight">
                        {team.shortName}
                      </h3>
                      <span className="text-xs font-mono font-bold text-[#e10600]">
                        {team.points} PUNTOS
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectEntity({ type: 'team', data: team })}
                    className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    title="Ver ficha completa"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Technical Distinctions (Motor, Chasis, Team Principal) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-3 bg-white/5 border border-white/5">
                    <span className="text-[9px] text-white/40 uppercase block">UNIDAD DE POTENCIA</span>
                    <span className="font-bold text-cyan-400 truncate block">{team.powerUnitDesignation}</span>
                    <span className="text-[8px] text-white/40 block">({team.powerUnitManufacturer})</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5">
                    <span className="text-[9px] text-white/40 uppercase block">CHASIS HOMOLOGADO</span>
                    <span className="font-bold text-white truncate block">{team.chassisName}</span>
                    <span className="text-[8px] text-white/40 block">Temporada 2024</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5">
                    <span className="text-[9px] text-white/40 uppercase block">TEAM PRINCIPAL</span>
                    <span className="font-bold text-white truncate block">{team.teamPrincipal}</span>
                    <span className="text-[8px] text-white/40 block">{team.headquarters.split(',')[0]}</span>
                  </div>
                </div>

                {/* Team Drivers Buttons */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-white/40 block">
                    ALINEACIÓN TITULAR DE PILOTOS:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {drivers.map(d => d && (
                      <button
                        key={d.id}
                        onClick={() => onSelectEntity({ type: 'driver', data: d })}
                        className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex items-center justify-between group"
                      >
                        <div className="truncate">
                          <span className="text-xs font-bold font-syne text-white block truncate">
                            #{d.number} {d.fullName}
                          </span>
                          <span className="text-[9px] font-mono text-white/50">
                            P{d.championshipPosition} • {d.points} PTS
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-white/30 group-hover:text-white transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <button
                onClick={() => onSelectEntity({ type: 'team', data: team })}
                className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/70 hover:text-white transition-colors"
              >
                <span>VER DOSSIER TÉCNICO Y PATROCINADORES</span>
                <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
