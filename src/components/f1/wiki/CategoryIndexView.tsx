import React, { useState, useMemo } from 'react';
import { 
  Users, Shield, Car, Wrench, MapPin, 
  Trophy, Search, ArrowUpDown, Filter, ChevronRight,
  ExternalLink, Calendar, Gauge, CheckCircle2
} from 'lucide-react';
import { 
  F1_DRIVERS_DATA, F1_CONSTRUCTORS_DATA, F1_CARS_DATA, 
  F1_TECHNICAL_STAFF_DATA, F1_CIRCUITS_DATA, F1_TEAMMATE_DUELS,
  getConstructorById, getDriverById, getCarById, getTechnicalStaffById
} from '../../../data/f1EncyclopediaData';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiLink } from './WikiLink';
import { getDriverWikipediaPhoto } from '../../../services/f1PhotoService';

export type WikiCategory = 'pilotos' | 'escuderias' | 'monoplazas' | 'personal' | 'circuitos' | 'clasificacion' | 'estadisticas';

interface CategoryIndexViewProps {
  category: WikiCategory;
}

export const CategoryIndexView: React.FC<CategoryIndexViewProps> = ({ category }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subFilter, setSubFilter] = useState('ALL');
  const [sortField, setSortField] = useState<string>('default');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Category metadata & configurations
  const categoryMeta = useMemo(() => {
    switch (category) {
      case 'pilotos':
        return {
          title: 'Categoría: Pilotos de Fórmula 1 (2024)',
          singular: 'Piloto',
          description: 'Registro enciclopédico de los 20 pilotos titulares que compiten en el Campeonato Mundial de Fórmula 1 de la FIA 2024.',
          count: F1_DRIVERS_DATA.length,
          icon: Users,
        };
      case 'escuderias':
        return {
          title: 'Categoría: Escuderías y Constructores (2024)',
          singular: 'Escudería',
          description: 'Las 10 escuderías oficiales inscritas en el Campeonato Mundial de Constructores de la FIA 2024.',
          count: F1_CONSTRUCTORS_DATA.length,
          icon: Shield,
        };
      case 'monoplazas':
        return {
          title: 'Categoría: Monoplazas de Fórmula 1 (2024)',
          singular: 'Monoplaza',
          description: 'Especificaciones técnicas verificadas de los 10 coches de efecto suelo construidos bajo el reglamento técnico de la FIA 2024.',
          count: F1_CARS_DATA.length,
          icon: Car,
        };
      case 'personal':
        return {
          title: 'Categoría: Personal Técnico y Dirección Deportiva',
          singular: 'Personal Técnico',
          description: 'Team Principals, directores técnicos e ingenieros de carrera verificados de los 20 pilotos de la parrilla 2024.',
          count: F1_TECHNICAL_STAFF_DATA.length,
          icon: Wrench,
        };
      case 'circuitos':
        return {
          title: 'Categoría: Circuitos y Grandes Premios (2024)',
          singular: 'Circuito',
          description: 'Los 24 autódromos y trazados urbanos homologados Grado 1 por la FIA para la temporada 2024.',
          count: F1_CIRCUITS_DATA.length,
          icon: MapPin,
        };
      case 'clasificacion':
      case 'estadisticas':
        return {
          title: 'Categoría: Estadísticas y Clasificaciones Oficiales',
          singular: 'Estadística',
          description: 'Tablas consolidadas del Mundial de Pilotos, Mundial de Constructores y duelos internos entre compañeros de equipo.',
          count: 24,
          icon: Trophy,
        };
    }
  }, [category]);

  const CategoryIcon = categoryMeta.icon;

  // Filtered lists
  const filteredDrivers = useMemo(() => {
    return F1_DRIVERS_DATA.filter(d => {
      if (subFilter !== 'ALL' && d.teamId !== subFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.fullName.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.teamName.toLowerCase().includes(q) ||
        String(d.number) === q
      );
    }).sort((a, b) => {
      if (sortField === 'points') return sortAsc ? a.points - b.points : b.points - a.points;
      if (sortField === 'number') return sortAsc ? a.number - b.number : b.number - a.number;
      if (sortField === 'name') return sortAsc ? a.lastName.localeCompare(b.lastName) : b.lastName.localeCompare(a.lastName);
      return a.championshipPosition - b.championshipPosition;
    });
  }, [searchQuery, subFilter, sortField, sortAsc]);

  const filteredConstructors = useMemo(() => {
    return F1_CONSTRUCTORS_DATA.filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.officialName.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.powerUnitManufacturer.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (sortField === 'name') return sortAsc ? a.shortName.localeCompare(b.shortName) : b.shortName.localeCompare(a.shortName);
      return a.championshipPosition - b.championshipPosition;
    });
  }, [searchQuery, sortField, sortAsc]);

  const filteredCars = useMemo(() => {
    return F1_CARS_DATA.filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.teamName.toLowerCase().includes(q) ||
        c.powerUnit.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const filteredStaff = useMemo(() => {
    return F1_TECHNICAL_STAFF_DATA.filter(s => {
      if (subFilter !== 'ALL' && s.roleCategory !== subFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.teamName.toLowerCase().includes(q) ||
        s.roleTitle.toLowerCase().includes(q) ||
        (s.assignedDriverName && s.assignedDriverName.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, subFilter]);

  const filteredCircuits = useMemo(() => {
    return F1_CIRCUITS_DATA.filter(c => {
      if (subFilter !== 'ALL' && c.status2024 !== subFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.circuitName.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        String(c.round) === q
      );
    }).sort((a, b) => a.round - b.round);
  }, [searchQuery, subFilter]);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs
        items={[
          { label: 'Portal F1 Real', to: '/f1-real' },
          { label: categoryMeta.singular },
        ]}
      />

      {/* Category Header */}
      <header className="border-b border-white/15 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold">
            ÍNDICE ENCICLOPÉDICO // CATEGORÍA
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50">
            {categoryMeta.count} artículos indexados
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-syne uppercase tracking-tight text-white flex items-center gap-3">
          <CategoryIcon className="text-[#FF1E00]" size={32} />
          {categoryMeta.title}
        </h1>

        <p className="text-xs sm:text-sm text-white/70 mt-2 max-w-3xl leading-relaxed">
          {categoryMeta.description}
        </p>
      </header>

      {/* Filter and Search Bar */}
      <div className="bg-[#1b1b26] border border-white/10 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filtrar en ${categoryMeta.singular.toLowerCase()}s...`}
              className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF1E00] font-mono"
            />
          </div>

          {/* Subfilter Pills */}
          {category === 'pilotos' && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-white/60">
              <span className="text-white/40 uppercase mr-1">Escudería:</span>
              <button
                onClick={() => setSubFilter('ALL')}
                className={`px-2 py-1 border transition-all ${subFilter === 'ALL' ? 'bg-[#FF1E00] text-white border-[#FF1E00] font-bold' : 'border-white/10 hover:border-white/20'}`}
              >
                Todas
              </button>
              {F1_CONSTRUCTORS_DATA.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSubFilter(t.id)}
                  className={`px-2 py-1 border transition-all whitespace-nowrap ${subFilter === t.id ? 'bg-white text-black border-white font-bold' : 'border-white/10 hover:border-white/20'}`}
                >
                  {t.shortName}
                </button>
              ))}
            </div>
          )}

          {category === 'personal' && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-white/60">
              <span className="text-white/40 uppercase mr-1">Rol:</span>
              <button
                onClick={() => setSubFilter('ALL')}
                className={`px-2 py-1 border transition-all ${subFilter === 'ALL' ? 'bg-[#FF1E00] text-white border-[#FF1E00] font-bold' : 'border-white/10 hover:border-white/20'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setSubFilter('TEAM_PRINCIPAL')}
                className={`px-2 py-1 border transition-all ${subFilter === 'TEAM_PRINCIPAL' ? 'bg-white text-black border-white font-bold' : 'border-white/10 hover:border-white/20'}`}
              >
                Team Principals
              </button>
              <button
                onClick={() => setSubFilter('TECHNICAL_DIRECTOR')}
                className={`px-2 py-1 border transition-all ${subFilter === 'TECHNICAL_DIRECTOR' ? 'bg-white text-black border-white font-bold' : 'border-white/10 hover:border-white/20'}`}
              >
                Directores Técnicos
              </button>
              <button
                onClick={() => setSubFilter('RACE_ENGINEER')}
                className={`px-2 py-1 border transition-all ${subFilter === 'RACE_ENGINEER' ? 'bg-white text-black border-white font-bold' : 'border-white/10 hover:border-white/20'}`}
              >
                Ingenieros de Carrera
              </button>
            </div>
          )}

          {category === 'circuitos' && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/60">
              <span className="text-white/40 uppercase mr-1">Estado:</span>
              <button
                onClick={() => setSubFilter('ALL')}
                className={`px-2 py-1 border transition-all ${subFilter === 'ALL' ? 'bg-[#FF1E00] text-white border-[#FF1E00] font-bold' : 'border-white/10 hover:border-white/20'}`}
              >
                Todos (24)
              </button>
              <button
                onClick={() => setSubFilter('COMPLETED')}
                className={`px-2 py-1 border transition-all ${subFilter === 'COMPLETED' ? 'bg-white text-black border-white font-bold' : 'border-white/10 hover:border-white/20'}`}
              >
                Disputados
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Table According to Category */}
      
      {/* 1. PILOTOS */}
      {category === 'pilotos' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-white/60">
                <tr>
                  <th className="p-3 text-center">Pos</th>
                  <th className="p-3">Dorsal</th>
                  <th className="p-3">Piloto</th>
                  <th className="p-3">Nacionalidad</th>
                  <th className="p-3">Escudería</th>
                  <th className="p-3">Monoplaza</th>
                  <th className="p-3 text-right">Puntos</th>
                  <th className="p-3 text-center">Vict.</th>
                  <th className="p-3 text-center">Podios</th>
                  <th className="p-3">Ingeniero de Carrera</th>
                  <th className="p-3 text-center">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredDrivers.map(d => {
                  const t = getConstructorById(d.teamId);
                  const car = getCarById(d.carId);
                  const eng = getTechnicalStaffById(d.raceEngineerId);

                  return (
                    <tr key={d.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-mono font-bold text-center text-white/50">
                        P{d.championshipPosition}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#FF1E00]">
                        #{d.number}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img 
                            src={getDriverWikipediaPhoto(d.id) || d.headshotUrl} 
                            alt={d.fullName} 
                            className="w-7 h-7 rounded-full object-cover bg-black/40 border border-white/10" 
                          />
                          <WikiLink to={`/f1-real/pilotos/${d.id}`}>{d.fullName}</WikiLink>
                          <span className="text-[10px] font-mono text-white/40">({d.acronym})</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {d.flag} {d.country}
                      </td>
                      <td className="p-3">
                        {t ? <WikiLink to={`/f1-real/escuderias/${t.id}`}>{t.shortName}</WikiLink> : d.teamName}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {car ? <WikiLink to={`/f1-real/monoplazas/${car.id}`}>{car.name}</WikiLink> : 'N/A'}
                      </td>
                      <td className="p-3 font-mono font-bold text-right text-white">
                        {d.points}
                      </td>
                      <td className="p-3 font-mono text-center text-amber-400 font-bold">
                        {d.seasonStats.wins > 0 ? d.seasonStats.wins : '-'}
                      </td>
                      <td className="p-3 font-mono text-center text-white/80">
                        {d.seasonStats.podiums > 0 ? d.seasonStats.podiums : '-'}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {eng ? (
                          <WikiLink to={`/f1-real/personal/${eng.id}`}>{eng.name}</WikiLink>
                        ) : d.raceEngineerName}
                      </td>
                      <td className="p-3 text-center">
                        <WikiLink to={`/f1-real/pilotos/${d.id}`}>
                          <span className="px-2 py-0.5 bg-white/10 hover:bg-[#FF1E00] text-white text-[10px] uppercase font-mono transition-colors">
                            Ver Artículo →
                          </span>
                        </WikiLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ESCUDERÍAS */}
      {category === 'escuderias' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-white/60">
                <tr>
                  <th className="p-3 text-center">Pos</th>
                  <th className="p-3">Escudería</th>
                  <th className="p-3">Nombre Oficial</th>
                  <th className="p-3">País</th>
                  <th className="p-3">Unidad de Potencia</th>
                  <th className="p-3">Team Principal</th>
                  <th className="p-3">Pilotos Titulares</th>
                  <th className="p-3 text-right">Puntos</th>
                  <th className="p-3 text-center">Artículo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredConstructors.map(c => {
                  const tp = getTechnicalStaffById(c.teamPrincipalId);
                  const drivers = c.driverIds.map(dId => getDriverById(dId)).filter(Boolean);

                  return (
                    <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-mono font-bold text-center text-white/50">
                        P{c.championshipPosition}
                      </td>
                      <td className="p-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.primaryColor }} />
                          <WikiLink to={`/f1-real/escuderias/${c.id}`}>{c.shortName}</WikiLink>
                        </div>
                      </td>
                      <td className="p-3 text-white/70 font-mono text-[11px]">
                        {c.officialName}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {c.flag} {c.country}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-white">
                        {c.powerUnitDesignation} ({c.powerUnitManufacturer})
                      </td>
                      <td className="p-3">
                        {tp ? <WikiLink to={`/f1-real/personal/${tp.id}`}>{tp.name}</WikiLink> : c.teamPrincipal}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <div className="flex items-center gap-2">
                          {drivers.map(d => d && (
                            <WikiLink key={d.id} to={`/f1-real/pilotos/${d.id}`}>
                              {d.acronym} #{d.number}
                            </WikiLink>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-right text-white">
                        {c.points}
                      </td>
                      <td className="p-3 text-center">
                        <WikiLink to={`/f1-real/escuderias/${c.id}`}>
                          <span className="px-2 py-0.5 bg-white/10 hover:bg-[#FF1E00] text-white text-[10px] uppercase font-mono transition-colors">
                            Ver Artículo →
                          </span>
                        </WikiLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MONOPLAZAS */}
      {category === 'monoplazas' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-white/60">
                <tr>
                  <th className="p-3">Monoplaza</th>
                  <th className="p-3">Escudería</th>
                  <th className="p-3">Chasis</th>
                  <th className="p-3">Unidad de Potencia</th>
                  <th className="p-3">Peso Mínimo</th>
                  <th className="p-3">Suspensión (Del/Tras)</th>
                  <th className="p-3">Pilotos en Pista</th>
                  <th className="p-3 text-center">Ficha Técnica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredCars.map(car => {
                  const t = getConstructorById(car.teamId);
                  const drivers = t ? t.driverIds.map(dId => getDriverById(dId)).filter(Boolean) : [];

                  return (
                    <tr key={car.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-bold text-white">
                        <WikiLink to={`/f1-real/monoplazas/${car.id}`}>{car.name}</WikiLink>
                      </td>
                      <td className="p-3">
                        {t ? <WikiLink to={`/f1-real/escuderias/${t.id}`}>{t.shortName}</WikiLink> : car.teamName}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-white/80">
                        {car.chassis}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-[#FF1E00]">
                        {car.powerUnit}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {car.weightKg} kg (Reglamentario)
                      </td>
                      <td className="p-3 font-mono text-[11px] text-white/60">
                        {car.suspension.front} / {car.suspension.rear}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <div className="flex items-center gap-2">
                          {drivers.map(d => d && (
                            <WikiLink key={d.id} to={`/f1-real/pilotos/${d.id}`}>
                              {d.lastName} #{d.number}
                            </WikiLink>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <WikiLink to={`/f1-real/monoplazas/${car.id}`}>
                          <span className="px-2 py-0.5 bg-white/10 hover:bg-[#FF1E00] text-white text-[10px] uppercase font-mono transition-colors">
                            Ver Artículo →
                          </span>
                        </WikiLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PERSONAL TÉCNICO */}
      {category === 'personal' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-white/60">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Cargo Oficial</th>
                  <th className="p-3">Escudería</th>
                  <th className="p-3">Nacionalidad</th>
                  <th className="p-3">Asignación Deportiva</th>
                  <th className="p-3">Responsabilidades Públicas</th>
                  <th className="p-3 text-center">Artículo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredStaff.map(s => {
                  const t = getConstructorById(s.teamId);
                  const assignedDriver = s.assignedDriverId ? getDriverById(s.assignedDriverId) : undefined;

                  return (
                    <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-bold text-white">
                        <WikiLink to={`/f1-real/personal/${s.id}`}>{s.name}</WikiLink>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-white/80">
                        {s.roleTitle}
                      </td>
                      <td className="p-3">
                        {t ? <WikiLink to={`/f1-real/escuderias/${t.id}`}>{t.shortName}</WikiLink> : s.teamName}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {s.flag} {s.nationality}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {assignedDriver ? (
                          <WikiLink to={`/f1-real/pilotos/${assignedDriver.id}`}>
                            {assignedDriver.fullName} #{assignedDriver.number}
                          </WikiLink>
                        ) : (
                          <span className="text-white/40">Fábrica y Dirección General</span>
                        )}
                      </td>
                      <td className="p-3 text-white/60 text-[11px] max-w-xs truncate">
                        {s.publicResponsibilities}
                      </td>
                      <td className="p-3 text-center">
                        <WikiLink to={`/f1-real/personal/${s.id}`}>
                          <span className="px-2 py-0.5 bg-white/10 hover:bg-[#FF1E00] text-white text-[10px] uppercase font-mono transition-colors">
                            Ver Artículo →
                          </span>
                        </WikiLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CIRCUITOS */}
      {category === 'circuitos' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-white/60">
                <tr>
                  <th className="p-3 text-center">Ronda</th>
                  <th className="p-3">Circuito</th>
                  <th className="p-3">Nombre Oficial</th>
                  <th className="p-3">País y Ciudad</th>
                  <th className="p-3">Longitud</th>
                  <th className="p-3">Vueltas</th>
                  <th className="p-3">Curvas</th>
                  <th className="p-3">DRS</th>
                  <th className="p-3">Récord de Vuelta</th>
                  <th className="p-3">Ganador 2024</th>
                  <th className="p-3 text-center">Artículo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredCircuits.map(c => {
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-mono font-bold text-center text-[#FF1E00]">
                        #{c.round}
                      </td>
                      <td className="p-3 font-bold text-white">
                        <WikiLink to={`/f1-real/circuitos/${c.id}`}>{c.circuitName}</WikiLink>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-white/60 max-w-[180px] truncate">
                        {c.officialName}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {c.flag} {c.city}, {c.country}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {c.lengthKm} km
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {c.raceLaps}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {c.turnsCount} ({c.leftTurns}I/{c.rightTurns}D)
                      </td>
                      <td className="p-3 font-mono text-[11px] text-center text-[#FF1E00]">
                        {c.drsZonesCount}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-amber-400">
                        {c.lapRecord.time} ({c.lapRecord.driver})
                      </td>
                      <td className="p-3 font-mono text-[11px] text-emerald-400">
                        {c.sessionResults2024?.winnerDriver || 'Programado'}
                      </td>
                      <td className="p-3 text-center">
                        <WikiLink to={`/f1-real/circuitos/${c.id}`}>
                          <span className="px-2 py-0.5 bg-white/10 hover:bg-[#FF1E00] text-white text-[10px] uppercase font-mono transition-colors">
                            Ver Artículo →
                          </span>
                        </WikiLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CLASIFICACIÓN Y ESTADÍSTICAS */}
      {(category === 'clasificacion' || category === 'estadisticas') && (
        <div className="space-y-8">
          {/* Driver Standings Table */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy size={16} className="text-[#FF1E00]" />
              Clasificación Oficial del Campeonato Mundial de Pilotos 2024
            </h3>
            <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-white/60">
                  <tr>
                    <th className="p-3 text-center">Pos</th>
                    <th className="p-3">Piloto</th>
                    <th className="p-3">Escudería</th>
                    <th className="p-3 text-right">Puntos</th>
                    <th className="p-3 text-center">Victorias</th>
                    <th className="p-3 text-center">Podios</th>
                    <th className="p-3 text-center">Poles</th>
                    <th className="p-3 text-center">Vueltas Rápidas</th>
                    <th className="p-3">Mejor Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {F1_DRIVERS_DATA.slice().sort((a, b) => a.championshipPosition - b.championshipPosition).map(d => {
                    const t = getConstructorById(d.teamId);
                    return (
                      <tr key={d.id} className="hover:bg-white/[0.03]">
                        <td className="p-3 font-mono font-black text-center text-[#FF1E00]">
                          {d.championshipPosition}º
                        </td>
                        <td className="p-3 font-bold text-white">
                          <WikiLink to={`/f1-real/pilotos/${d.id}`}>{d.fullName}</WikiLink>
                        </td>
                        <td className="p-3">
                          {t ? <WikiLink to={`/f1-real/escuderias/${t.id}`}>{t.shortName}</WikiLink> : d.teamName}
                        </td>
                        <td className="p-3 font-mono font-bold text-right text-white">
                          {d.points}
                        </td>
                        <td className="p-3 font-mono text-center text-amber-400 font-bold">{d.seasonStats.wins}</td>
                        <td className="p-3 font-mono text-center">{d.seasonStats.podiums}</td>
                        <td className="p-3 font-mono text-center">{d.seasonStats.poles}</td>
                        <td className="p-3 font-mono text-center">{d.seasonStats.fastestLaps}</td>
                        <td className="p-3 font-mono text-white/60">{d.seasonStats.bestFinish} ({d.seasonStats.bestFinishRace})</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Duelos de Compañeros de Equipo */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2">
              <ArrowUpDown size={16} className="text-[#FF1E00]" />
              Duelos Directos entre Compañeros de Equipo 2024
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {F1_TEAMMATE_DUELS.map(duel => (
                <div key={duel.teamId} className="bg-[#1b1b26] border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-syne font-bold text-white text-sm">{duel.teamName}</span>
                    <span className="font-mono text-[10px] text-white/50">{duel.totalRacesCompared} GPs comparados</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="font-bold text-white block">
                        <WikiLink to={`/f1-real/pilotos/${duel.driver1.id}`}>{duel.driver1.name}</WikiLink>
                      </span>
                      <div className="text-white/60">Puntos: <strong className="text-white">{duel.driver1.points}</strong></div>
                      <div className="text-white/60">Qualy: <strong className="text-white">{duel.driver1.qualifyingAhead}</strong></div>
                      <div className="text-white/60">Carrera: <strong className="text-white">{duel.driver1.racesAhead}</strong></div>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-white block">
                        <WikiLink to={`/f1-real/pilotos/${duel.driver2.id}`}>{duel.driver2.name}</WikiLink>
                      </span>
                      <div className="text-white/60">Puntos: <strong className="text-white">{duel.driver2.points}</strong></div>
                      <div className="text-white/60">Qualy: <strong className="text-white">{duel.driver2.qualifyingAhead}</strong></div>
                      <div className="text-white/60">Carrera: <strong className="text-white">{duel.driver2.racesAhead}</strong></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/70 italic pt-2 border-t border-white/5">
                    {duel.analysis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
