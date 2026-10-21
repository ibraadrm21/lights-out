import React, { useState, useMemo } from 'react';
import { Shield, User, Filter, ChevronRight, Radio, CheckCircle2 } from 'lucide-react';
import { 
  TechnicalStaffProfile, F1_TECHNICAL_STAFF_DATA, F1_CONSTRUCTORS_DATA, 
  getDriverById, getConstructorById 
} from '../../../data/f1EncyclopediaData';
import { SelectedEntity } from './EntityDetailModal';

interface StaffSectionProps {
  searchQuery: string;
  onSelectEntity: (entity: SelectedEntity) => void;
}

export const StaffSection: React.FC<StaffSectionProps> = ({
  searchQuery,
  onSelectEntity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');

  const filteredStaff = useMemo(() => {
    return F1_TECHNICAL_STAFF_DATA.filter((staff) => {
      // Category filter
      if (selectedCategory !== 'ALL' && staff.roleCategory !== selectedCategory) {
        return false;
      }
      // Team filter
      if (selectedTeam !== 'ALL' && staff.teamId !== selectedTeam) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          staff.name.toLowerCase().includes(q) ||
          staff.roleTitle.toLowerCase().includes(q) ||
          staff.teamName.toLowerCase().includes(q) ||
          (staff.assignedDriverName && staff.assignedDriverName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedCategory, selectedTeam, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Category Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'Todos los Cargos' },
            { id: 'TEAM_PRINCIPAL', label: 'Team Principals' },
            { id: 'TECHNICAL_DIRECTOR', label: 'Directores Técnicos' },
            { id: 'RACE_ENGINEER', label: 'Ingenieros de Carrera (Radio)' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-white text-black font-bold border-white'
                  : 'bg-white/5 text-white/60 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Team filter dropdown */}
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="bg-[#121212] border border-white/15 px-3 py-1.5 text-xs font-mono text-white rounded-none focus:outline-hidden focus:border-[#e10600]"
        >
          <option value="ALL">Todas las Escuderías</option>
          {F1_CONSTRUCTORS_DATA.map(c => (
            <option key={c.id} value={c.id}>{c.shortName}</option>
          ))}
        </select>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((staff) => {
          const team = getConstructorById(staff.teamId);
          const driver = staff.assignedDriverId ? getDriverById(staff.assignedDriverId) : null;

          return (
            <div
              key={staff.id}
              className="bg-[#0f0f0f] border border-white/10 hover:border-white/25 transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest uppercase text-white/40 block">
                      {staff.flag} {staff.nationality} • {staff.teamName}
                    </span>
                    <h3 className="text-xl font-black font-syne uppercase text-white tracking-tight mt-0.5">
                      {staff.name}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase border shrink-0 ${
                    staff.roleCategory === 'RACE_ENGINEER'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : staff.roleCategory === 'TECHNICAL_DIRECTOR'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-[#e10600]/10 text-[#e10600] border-[#e10600]/30'
                  }`}>
                    {staff.roleCategory === 'RACE_ENGINEER' ? 'ING. CARRERA' : staff.roleCategory === 'TECHNICAL_DIRECTOR' ? 'DIR. TÉCNICO' : 'TEAM PRINCIPAL'}
                  </span>
                </div>

                {/* Role Title */}
                <div className="p-2.5 bg-white/5 border border-white/5 text-xs font-mono text-white/80">
                  <span className="text-[9px] text-white/40 uppercase block">CARGO OFICIAL</span>
                  <span className="font-bold text-white">{staff.roleTitle}</span>
                </div>

                {/* If Race Engineer: Assigned Driver button */}
                {driver && (
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 text-xs font-mono space-y-1">
                    <span className="text-[9px] text-emerald-400/70 uppercase flex items-center gap-1 font-bold">
                      <Radio size={10} className="animate-pulse" /> PILOTO ASIGNADO EN RADIO:
                    </span>
                    <button
                      onClick={() => onSelectEntity({ type: 'driver', data: driver })}
                      className="text-white hover:text-emerald-400 font-bold flex items-center justify-between w-full transition-colors"
                    >
                      <span>{driver.fullName} #{driver.number}</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}

                {/* Responsibilities */}
                <div>
                  <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">
                    RESPONSABILIDADES:
                  </span>
                  <p className="text-xs font-mono text-white/60 line-clamp-2 leading-relaxed">
                    {staff.publicResponsibilities}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectEntity({ type: 'staff', data: staff })}
                className="mt-4 pt-3 border-t border-white/5 w-full flex items-center justify-between text-xs font-mono text-white/40 hover:text-white transition-colors"
              >
                <span>VER TRAYECTORIA Y RESPONSABILIDADES</span>
                <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
