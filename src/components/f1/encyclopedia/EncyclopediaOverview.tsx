import React from 'react';
import { 
  Radio, Trophy, Users, Shield, Wrench, MapPin, 
  Activity, ArrowRight, RefreshCw, Flag, CheckCircle, ChevronRight, Gauge
} from 'lucide-react';
import { OpenF1Session } from '../../../lib/openf1Service';
import { F1_DRIVERS_DATA, F1_CONSTRUCTORS_DATA, F1_CIRCUITS_DATA } from '../../../data/f1EncyclopediaData';
import { SelectedEntity } from './EntityDetailModal';

interface EncyclopediaOverviewProps {
  session: OpenF1Session | null;
  loading: boolean;
  lastUpdated: string;
  onRefresh: () => void;
  onNavigateSection: (section: string) => void;
  onSelectEntity: (entity: SelectedEntity) => void;
}

export const EncyclopediaOverview: React.FC<EncyclopediaOverviewProps> = ({
  session,
  loading,
  lastUpdated,
  onRefresh,
  onNavigateSection,
  onSelectEntity,
}) => {
  const driverLeader = F1_DRIVERS_DATA[0]; // Verstappen
  const teamLeader = F1_CONSTRUCTORS_DATA[0]; // McLaren

  return (
    <div className="space-y-10">
      {/* Live / Telemetry Status Banner */}
      <div className="p-6 bg-gradient-to-r from-[#121212] via-[#0d0d0d] to-[#0a0a0a] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[9px] font-mono font-bold tracking-[0.4em] text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/30 flex items-center gap-1.5">
              <Radio size={12} className="animate-pulse text-emerald-400" />
              OPENF1 LIVE DATA // FEED OFICIAL FIA
            </span>
            {session && (
              <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase px-2 py-0.5 bg-white/5 border border-white/10">
                ÚLTIMA SESIÓN: {session.circuit_short_name} • {session.country_name} ({session.year})
              </span>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-black font-syne uppercase text-white tracking-tight">
            ENCICLOPEDIA OFICIAL // FÓRMULA 1 ACTUAL
          </h3>
          <p className="text-xs font-mono text-white/60 max-w-2xl">
            Base de datos interactiva verificada con la parrilla activa, especificaciones técnicas de los 10 monoplazas, telemetría de 24 trazados y duelos oficiales entre compañeros.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {lastUpdated && (
            <span className="text-[8px] font-mono text-white/40 uppercase hidden lg:inline">
              SINCRONIZADO: {lastUpdated}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin text-emerald-400' : ''} />
            <span>{loading ? 'Sincronizando...' : 'Recargar Datos'}</span>
          </button>
        </div>
      </div>

      {/* Champion Spotlights: Driver & Team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver Leader */}
        <div
          onClick={() => onSelectEntity({ type: 'driver', data: driverLeader })}
          className="p-6 bg-[#0f0f0f] border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <Trophy size={13} /> CAMPEÓN MUNDIAL DE PILOTOS 2024
              </span>
              <span className="text-xs font-mono font-bold text-white/40 group-hover:text-white transition-colors">
                VER FICHA →
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 overflow-hidden shrink-0">
                <img
                  src={driverLeader.headshotUrl}
                  alt={driverLeader.fullName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <h4 className="text-2xl font-black font-syne uppercase text-white group-hover:text-amber-400 transition-colors">
                  {driverLeader.fullName}
                </h4>
                <span className="text-xs font-mono text-white/60">
                  {driverLeader.flag} #{driverLeader.number} • {driverLeader.teamName}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-white/5">
              <div className="p-2 bg-white/5">
                <span className="text-[8px] text-white/40 block">PUNTOS</span>
                <span className="font-black text-amber-400 text-sm">{driverLeader.points}</span>
              </div>
              <div className="p-2 bg-white/5">
                <span className="text-[8px] text-white/40 block">VICTORIAS</span>
                <span className="font-bold text-white text-sm">{driverLeader.seasonStats.wins}</span>
              </div>
              <div className="p-2 bg-white/5">
                <span className="text-[8px] text-white/40 block">PODIOS</span>
                <span className="font-bold text-white text-sm">{driverLeader.seasonStats.podiums}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Constructor Leader */}
        <div
          onClick={() => onSelectEntity({ type: 'team', data: teamLeader })}
          className="p-6 bg-[#0f0f0f] border border-[#ff8000]/30 hover:border-[#ff8000]/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#ff8000] font-bold flex items-center gap-1.5">
                <Trophy size={13} /> CAMPEÓN MUNDIAL DE CONSTRUCTORES 2024
              </span>
              <span className="text-xs font-mono font-bold text-white/40 group-hover:text-white transition-colors">
                VER FICHA →
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 p-2 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <img
                  src={teamLeader.logoUrl}
                  alt={teamLeader.officialName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-2xl font-black font-syne uppercase text-white group-hover:text-[#ff8000] transition-colors">
                  {teamLeader.officialName}
                </h4>
                <span className="text-xs font-mono text-white/60">
                  {teamLeader.flag} Motor: {teamLeader.powerUnitDesignation}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-white/5">
              <div className="p-2 bg-white/5">
                <span className="text-[8px] text-white/40 block">PUNTOS</span>
                <span className="font-black text-[#ff8000] text-sm">{teamLeader.points}</span>
              </div>
              <div className="p-2 bg-white/5">
                <span className="text-[8px] text-white/40 block">VICTORIAS</span>
                <span className="font-bold text-white text-sm">{teamLeader.seasonStats.wins}</span>
              </div>
              <div className="p-2 bg-white/5">
                <span className="text-[8px] text-white/40 block">PODIOS</span>
                <span className="font-bold text-white text-sm">{teamLeader.seasonStats.podiums}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Encyclopedia Navigation Hub Cards */}
      <div>
        <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-white/40 mb-4">
          EXPLORAR SECCIONES DE LA ENCICLOPEDIA F1 REAL
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'drivers',
              title: 'Pilotos Actuales',
              desc: 'Perfiles completos de los 20 pilotos titulares de la temporada, números, puntos y estadísticas.',
              count: `${F1_DRIVERS_DATA.length} Pilotos`,
              icon: Users,
              color: '#e10600',
            },
            {
              id: 'teams',
              title: 'Escuderías y Constructores',
              desc: 'Fichas de los 10 constructores: sedes, personal directivo, motores y patrocinadores oficiales.',
              count: `${F1_CONSTRUCTORS_DATA.length} Equipos`,
              icon: Shield,
              color: '#00d2be',
            },
            {
              id: 'cars',
              title: 'Monoplazas 2024',
              desc: 'Especificaciones técnicas detalladas: chasis, dimensiones, suspensiones y conceptos aerodinámicos.',
              count: '10 Coches',
              icon: Gauge,
              color: '#ff8000',
            },
            {
              id: 'staff',
              title: 'Personal Técnico & Ingenieros',
              desc: 'Team Principals, Directores Técnicos y los ingenieros de carrera asignados a cada piloto.',
              count: 'Liderazgo & Pista',
              icon: Wrench,
              color: '#6692ff',
            },
            {
              id: 'circuits',
              title: 'Circuitos del Calendario',
              desc: 'Los 24 trazados oficiales: longitudes, curvas, sectores, zonas de DRS y récords de vuelta.',
              count: `${F1_CIRCUITS_DATA.length} Circuitos`,
              icon: MapPin,
              color: '#52e252',
            },
            {
              id: 'standings',
              title: 'Estadísticas & Duelos',
              desc: 'Clasificaciones completas de pilotos y constructores, y comparativa frente a frente entre compañeros.',
              count: 'Telemetría & Puntos',
              icon: Activity,
              color: '#facc15',
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.id}
                onClick={() => onNavigateSection(card.id)}
                className="p-6 bg-[#0f0f0f] hover:bg-[#141414] border border-white/10 hover:border-white/25 transition-all text-left flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-none border border-white/10"
                      style={{ backgroundColor: `${card.color}15`, borderColor: `${card.color}40` }}
                    >
                      <Icon size={18} style={{ color: card.color }} />
                    </div>
                    <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-0.5 border border-white/10">
                      {card.count}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-black font-syne uppercase text-white group-hover:text-[#e10600] transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs font-mono text-white/60 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-white/40 group-hover:text-white transition-colors pt-2 border-t border-white/5">
                  <span>Acceder a la sección</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
