import React from 'react';
import { 
  Trophy, Shield, Users, Car, Wrench, MapPin, 
  Activity, Radio, ArrowRight, Sparkles, ExternalLink,
  Calendar, Clock, CheckCircle2, Award, Zap
} from 'lucide-react';
import { 
  F1_DRIVERS_DATA, F1_CONSTRUCTORS_DATA, F1_CARS_DATA, 
  F1_TECHNICAL_STAFF_DATA, F1_CIRCUITS_DATA, F1_TEAMMATE_DUELS,
  getConstructorById, getDriverById, getCarById
} from '../../../data/f1EncyclopediaData';
import { OpenF1Session } from '../../../lib/openf1Service';
import { WikiLink } from './WikiLink';

interface WikiPortalHomeProps {
  session?: OpenF1Session | null;
  onNavigateCategory?: (category: string) => void;
  onOpenRaceCenter?: () => void;
}

export const WikiPortalHome: React.FC<WikiPortalHomeProps> = ({ 
  session, 
  onNavigateCategory,
  onOpenRaceCenter 
}) => {
  // Top 8 drivers by points
  const topDrivers = [...F1_DRIVERS_DATA]
    .sort((a, b) => a.championshipPosition - b.championshipPosition)
    .slice(0, 8);

  // Top 5 constructors
  const topTeams = [...F1_CONSTRUCTORS_DATA]
    .sort((a, b) => a.championshipPosition - b.championshipPosition)
    .slice(0, 5);

  // Featured articles
  const featuredDriver = getDriverById('max-verstappen') || F1_DRIVERS_DATA[0];
  const featuredTeam = getConstructorById('mclaren') || F1_CONSTRUCTORS_DATA[1];
  const featuredCar = getCarById('mclaren-mcl38') || F1_CARS_DATA[1];

  // Next or latest completed round
  const latestFinishedCircuit = F1_CIRCUITS_DATA[F1_CIRCUITS_DATA.length - 1]; // Abu Dhabi finale

  return (
    <div className="space-y-8">
      {/* Portal Header Banner */}
      <section className="bg-gradient-to-r from-[#1b1b26] via-[#15151E] to-[#1b1b26] border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF1E00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold bg-[#FF1E00]/10 border border-[#FF1E00]/30 px-2 py-0.5">
              PORTAL DEL CONOCIMIENTO // FÓRMULA 1
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[10px] font-mono text-white/60">
              TEMPORADA OFICIAL FIA 2024
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={11} /> 100% REGISTRO VERIFICADO
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight text-white">
            Enciclopedia de <span className="text-[#FF1E00]">Fórmula 1</span>
          </h1>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl font-sans">
            Bienvenido al portal enciclopédico de <strong>Lights Out</strong>. Este repositorio reúne la documentación canónica, fichas técnicas, telemetría y organigramas de la parrilla actual de la Fórmula 1: los 20 pilotos, las 10 escuderías, sus monoplazas de efecto suelo, ingenieros de carrera y los 24 trazados del campeonato mundial.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
            <div className="bg-black/40 border border-white/10 p-2.5">
              <span className="text-[10px] text-white/40 uppercase block">Pilotos</span>
              <span className="text-white font-bold text-base">20 Titulares</span>
            </div>
            <div className="bg-black/40 border border-white/10 p-2.5">
              <span className="text-[10px] text-white/40 uppercase block">Escuderías</span>
              <span className="text-white font-bold text-base">10 Equipos</span>
            </div>
            <div className="bg-black/40 border border-white/10 p-2.5">
              <span className="text-[10px] text-white/40 uppercase block">Coches</span>
              <span className="text-white font-bold text-base">10 Monoplazas</span>
            </div>
            <div className="bg-black/40 border border-white/10 p-2.5">
              <span className="text-[10px] text-white/40 uppercase block">Personal</span>
              <span className="text-white font-bold text-base">37 Técnicos</span>
            </div>
            <div className="bg-black/40 border border-white/10 p-2.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-white/40 uppercase block">Circuitos</span>
              <span className="text-[#FF1E00] font-bold text-base">24 Grandes Premios</span>
            </div>
          </div>
        </div>
      </section>

      {/* Race Center / Live Timing Alert Banner */}
      <section className="bg-[#1b1b26] border-l-4 border-emerald-400 border-y border-r border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                CENTRO DE CARRERA Y LIVE TIMING
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[10px] font-mono text-white/50">OPENF1 TELEMETRY FEED</span>
            </div>
            <h3 className="text-sm font-bold text-white font-syne">
              {session ? `${session.session_name} — ${session.country_name}` : 'Sesión Oficial en Pista disponible en Race Center'}
            </h3>
            <p className="text-xs text-white/60 font-mono">
              Monitor de tiempos en directo, cronometraje por sectores, compuestos de neumáticos y meteorología.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRaceCenter}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <span>Abrir Race Center</span>
          <ArrowRight size={14} />
        </button>
      </section>

      {/* 2-Column Portal Layout (Wikipedia Portal Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Featured Article + Standings Tables */}
        <div className="lg:col-span-8 space-y-8">
          {/* Featured Article Section */}
          <section className="bg-[#1b1b26] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Artículo Destacado de la Semana
                </h2>
              </div>
              <span className="text-[10px] font-mono text-white/40 uppercase">Monoplaza Campeón</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="sm:w-1/3 w-full bg-black/40 border border-white/10 p-3 space-y-2 text-center">
                <img
                  src={featuredCar.imageUrl}
                  alt={featuredCar.name}
                  className="w-full h-32 object-contain bg-black/60 rounded-xs"
                />
                <span className="text-[10px] font-mono text-white/50 block">
                  {featuredCar.name} ({featuredCar.season})
                </span>
              </div>

              <div className="sm:w-2/3 space-y-2 text-xs">
                <h3 className="text-xl font-bold font-syne text-white uppercase tracking-tight">
                  <WikiLink to={`/f1-real/monoplazas/${featuredCar.id}`}>{featuredCar.name}</WikiLink>
                </h3>
                <p className="text-white/70 leading-relaxed">
                  El <strong>{featuredCar.name}</strong> es el monoplaza diseñado y construido por McLaren Racing para competir en el Campeonato Mundial de Fórmula 1 2024. Diseñado bajo la supervisión de Rob Marshall y Peter Prodromou, logró revertir el dominio inicial de Red Bull para conseguir el Campeonato Mundial de Constructores 2024.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="bg-white/5 px-2 py-0.5 border border-white/10 text-white/80">
                    Motor: {featuredCar.powerUnit}
                  </span>
                  <span className="bg-white/5 px-2 py-0.5 border border-white/10 text-white/80">
                    Chasis: {featuredCar.chassis}
                  </span>
                  <span className="bg-white/5 px-2 py-0.5 border border-white/10 text-white/80">
                    Peso: {featuredCar.weightKg} kg
                  </span>
                </div>
                <div className="pt-2">
                  <WikiLink to={`/f1-real/monoplazas/${featuredCar.id}`}>
                    <span className="text-[#FF1E00] hover:underline font-bold font-mono inline-flex items-center gap-1">
                      Leer artículo completo →
                    </span>
                  </WikiLink>
                </div>
              </div>
            </div>
          </section>

          {/* Top Drivers Table (Compact Editorial View) */}
          <section className="bg-[#1b1b26] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-[#FF1E00]" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                  Campeonato Mundial de Pilotos 2024 (Cabecera de Tabla)
                </h2>
              </div>
              <WikiLink to="/f1-real/pilotos">
                <span className="text-[10px] font-mono text-[#FF1E00] hover:underline uppercase">
                  Ver los 20 pilotos →
                </span>
              </WikiLink>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-white/60">
                  <tr>
                    <th className="p-2.5 text-center">Pos</th>
                    <th className="p-2.5">Piloto</th>
                    <th className="p-2.5">Escudería</th>
                    <th className="p-2.5 text-right">Puntos</th>
                    <th className="p-2.5 text-center">Vict.</th>
                    <th className="p-2.5 text-center">Podios</th>
                    <th className="p-2.5">Ingeniero de Carrera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {topDrivers.map((d) => {
                    const t = getConstructorById(d.teamId);
                    const eng = d.raceEngineerId ? d.raceEngineerName : null;

                    return (
                      <tr key={d.id} className="hover:bg-white/[0.02]">
                        <td className="p-2.5 font-mono font-bold text-center text-[#FF1E00]">
                          P{d.championshipPosition}
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white/50 text-[11px]">#{d.number}</span>
                            <span className="font-semibold text-white">
                              <WikiLink to={`/f1-real/pilotos/${d.id}`}>{d.fullName}</WikiLink>
                            </span>
                            <span className="text-[10px]">{d.flag}</span>
                          </div>
                        </td>
                        <td className="p-2.5">
                          {t ? <WikiLink to={`/f1-real/escuderias/${t.id}`}>{t.shortName}</WikiLink> : d.teamName}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-right text-white">
                          {d.points}
                        </td>
                        <td className="p-2.5 font-mono text-center text-amber-400 font-bold">
                          {d.seasonStats.wins > 0 ? d.seasonStats.wins : '-'}
                        </td>
                        <td className="p-2.5 font-mono text-center">
                          {d.seasonStats.podiums > 0 ? d.seasonStats.podiums : '-'}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-white/60">
                          {d.raceEngineerId ? (
                            <WikiLink to={`/f1-real/personal/${d.raceEngineerId}`}>{d.raceEngineerName}</WikiLink>
                          ) : d.raceEngineerName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top Constructors Table */}
          <section className="bg-[#1b1b26] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-[#FF1E00]" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                  Campeonato Mundial de Constructores 2024
                </h2>
              </div>
              <WikiLink to="/f1-real/escuderias">
                <span className="text-[10px] font-mono text-[#FF1E00] hover:underline uppercase">
                  Ver las 10 escuderías →
                </span>
              </WikiLink>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-white/60">
                  <tr>
                    <th className="p-2.5 text-center">Pos</th>
                    <th className="p-2.5">Escudería</th>
                    <th className="p-2.5">Unidad de Potencia</th>
                    <th className="p-2.5">Team Principal</th>
                    <th className="p-2.5">Pilotos Titulares</th>
                    <th className="p-2.5 text-right">Puntos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {topTeams.map((c) => {
                    const drivers = c.driverIds.map(dId => getDriverById(dId)).filter(Boolean);

                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="p-2.5 font-mono font-bold text-center text-[#FF1E00]">
                          P{c.championshipPosition}
                        </td>
                        <td className="p-2.5 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.primaryColor }} />
                            <WikiLink to={`/f1-real/escuderias/${c.id}`}>{c.shortName}</WikiLink>
                          </div>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-white/70">
                          {c.powerUnitManufacturer}
                        </td>
                        <td className="p-2.5 text-[11px]">
                          <WikiLink to={`/f1-real/personal/${c.teamPrincipalId}`}>{c.teamPrincipal}</WikiLink>
                        </td>
                        <td className="p-2.5 font-mono text-[11px]">
                          <div className="flex items-center gap-2">
                            {drivers.map(d => d && (
                              <WikiLink key={d.id} to={`/f1-real/pilotos/${d.id}`}>
                                {d.acronym}
                              </WikiLink>
                            ))}
                          </div>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-right text-white">
                          {c.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Circuits Snapshot */}
          <section className="bg-[#1b1b26] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#FF1E00]" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                  Grandes Premios Destacados de la Temporada
                </h2>
              </div>
              <WikiLink to="/f1-real/circuitos">
                <span className="text-[10px] font-mono text-[#FF1E00] hover:underline uppercase">
                  Ver los 24 circuitos →
                </span>
              </WikiLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[F1_CIRCUITS_DATA[0], F1_CIRCUITS_DATA[7], F1_CIRCUITS_DATA[13]].map(circuit => (
                <div key={circuit.id} className="bg-black/30 border border-white/10 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#FF1E00] font-bold">Ronda #{circuit.round}</span>
                    <span>{circuit.flag} {circuit.country}</span>
                  </div>
                  <h4 className="font-syne font-bold text-white text-sm">
                    <WikiLink to={`/f1-real/circuitos/${circuit.id}`}>{circuit.circuitName}</WikiLink>
                  </h4>
                  <p className="text-[11px] font-mono text-white/50">
                    {circuit.lengthKm} km • {circuit.raceLaps} vueltas • {circuit.turnsCount} curvas
                  </p>
                  <div className="pt-1 text-[10px] font-mono text-white/70">
                    Ganador: <strong className="text-white">{circuit.sessionResults2024?.winnerDriver || 'Programado'}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Category Directory & Season Infobox */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fandom-style Season Quick Infobox */}
          <div className="bg-[#1b1b26] border-2 border-[#FF1E00] p-4 space-y-4">
            <div className="border-b border-white/10 pb-2 text-center">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#FF1E00] font-bold block">
                FICHA DE TEMPORADA
              </span>
              <h3 className="font-syne font-black text-white text-lg uppercase tracking-tight">
                Fórmula 1 2024
              </h3>
              <span className="text-[10px] font-mono text-white/50">
                75ª Edición del Campeonato Mundial FIA
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-white/5">
              <div className="flex justify-between py-1.5">
                <span className="text-white/50 font-mono">Organizador:</span>
                <span className="font-semibold text-white">FIA / FOM</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-white/50 font-mono">Grandes Premios:</span>
                <span className="font-semibold text-white">24 citas</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-white/50 font-mono">Parrilla Oficial:</span>
                <span className="font-semibold text-white">20 pilotos (10 equipos)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-white/50 font-mono">Campeón Pilotos:</span>
                <span className="font-bold text-[#FF1E00]">Max Verstappen (Red Bull)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-white/50 font-mono">Campeón Constructores:</span>
                <span className="font-bold text-amber-400">McLaren Formula 1 Team</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-white/50 font-mono">Suministrador Neumáticos:</span>
                <span className="font-semibold text-white">Pirelli Motorsport</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-white/50 font-mono">Peso Mínimo Monoplaza:</span>
                <span className="font-mono text-white">798 kg</span>
              </div>
            </div>
          </div>

          {/* Category Navigation Box */}
          <div className="bg-[#1b1b26] border border-white/10 p-4 space-y-3">
            <h3 className="font-syne font-bold text-white uppercase text-xs tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
              <Users size={14} className="text-[#FF1E00]" />
              Explorar por Categoría
            </h3>

            <div className="space-y-1.5 text-xs">
              <WikiLink to="/f1-real/pilotos">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-[#FF1E00]" />
                    <span className="font-semibold text-white">Pilotos</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">20 artículos →</span>
                </div>
              </WikiLink>

              <WikiLink to="/f1-real/escuderias">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-[#FF1E00]" />
                    <span className="font-semibold text-white">Escuderías</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">10 artículos →</span>
                </div>
              </WikiLink>

              <WikiLink to="/f1-real/monoplazas">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Car size={14} className="text-[#FF1E00]" />
                    <span className="font-semibold text-white">Monoplazas</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">10 artículos →</span>
                </div>
              </WikiLink>

              <WikiLink to="/f1-real/personal">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Wrench size={14} className="text-[#FF1E00]" />
                    <span className="font-semibold text-white">Personal Técnico</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">37 artículos →</span>
                </div>
              </WikiLink>

              <WikiLink to="/f1-real/circuitos">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#FF1E00]" />
                    <span className="font-semibold text-white">Circuitos</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">24 artículos →</span>
                </div>
              </WikiLink>

              <WikiLink to="/f1-real/temporadas">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#FF1E00]" />
                    <span className="font-semibold text-white">Temporadas Históricas</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">1950–2024 →</span>
                </div>
              </WikiLink>

              <WikiLink to="/f1-real/records">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Trophy size={14} className="text-[#FF1E00]" />
                    <span className="font-semibold text-white">Récords y Estadísticas</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">Histórico →</span>
                </div>
              </WikiLink>

              <WikiLink to="/f1-real/reglamento">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-[#FF1E00]" />
                    <span className="font-semibold text-white">Reglamento y Comisarios FIA</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">Oficial →</span>
                </div>
              </WikiLink>

              <WikiLink to="/f1-real/tecnologia">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-[#FF1E00]" />
                    <span className="font-semibold text-white">Tecnología e Ingeniería</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">Efecto Suelo →</span>
                </div>
              </WikiLink>

              <WikiLink to="/f1-real/junior">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-[#FF1E00]" />
                    <span className="font-semibold text-white">Feeder Series (F2 & F3)</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">Academias →</span>
                </div>
              </WikiLink>

              <WikiLink to="/f1-real/fuentes">
                <div className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-emerald-400" />
                    <span className="font-semibold text-white">Fuentes de Datos y APIs</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400">Legal y Abierto →</span>
                </div>
              </WikiLink>
            </div>
          </div>

          {/* Did you know / Encyclopedic technical notes */}
          <div className="bg-[#1b1b26] border border-white/10 p-4 space-y-3">
            <h3 className="font-syne font-bold text-white uppercase text-xs tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              Notas Técnicas de la Temporada
            </h3>

            <div className="space-y-3 text-xs text-white/70 leading-relaxed font-sans">
              <p>
                <strong>Túneles Venturi y Efecto Suelo:</strong> La generación técnica actual produce hasta un 60% de su adherencia total a través de túneles inferiores de efecto suelo conforme al reglamento FIA.
              </p>
              <p>
                <strong>Unidades de Potencia V6 Turbo Híbridas:</strong> Motores de combustión interna de 1.6 litros acompañados de un MGU-K de 120 kW (161 CV) y un MGU-H que recupera energía térmica de los gases del escape sin límite de recuperación por vuelta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
