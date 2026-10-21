import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Radio, Search, Users, Shield, Gauge, 
  Wrench, MapPin, Activity, LayoutGrid, X, CheckCircle,
  Home, ChevronRight, AlertCircle, ArrowLeft, Calendar, Flag,
  FileText, Cpu, GraduationCap, Award, Database
} from 'lucide-react';
import { 
  openf1, OpenF1ChampionshipDriver, OpenF1ChampionshipTeam, 
  OpenF1RaceResult, OpenF1Session 
} from '../../lib/openf1Service';
import { 
  getDriverById, getConstructorById, getCarById, 
  getTechnicalStaffById, getCircuitById,
  F1_DRIVERS_DATA, F1_CONSTRUCTORS_DATA, F1_CARS_DATA,
  F1_TECHNICAL_STAFF_DATA, F1_CIRCUITS_DATA
} from '../../data/f1EncyclopediaData';

// Wiki Encyclopedia Components
import { WikiPortalHome } from './wiki/WikiPortalHome';
import { CategoryIndexView, WikiCategory } from './wiki/CategoryIndexView';
import { DriverWikiArticle } from './wiki/DriverWikiArticle';
import { TeamWikiArticle } from './wiki/TeamWikiArticle';
import { CarWikiArticle } from './wiki/CarWikiArticle';
import { StaffWikiArticle } from './wiki/StaffWikiArticle';
import { CircuitWikiArticle } from './wiki/CircuitWikiArticle';
import { SeasonWikiArticle } from './wiki/SeasonWikiArticle';
import { GrandPrixWikiArticle } from './wiki/GrandPrixWikiArticle';
import { RegulationsWikiArticle } from './wiki/RegulationsWikiArticle';
import { TechnicalWikiArticle } from './wiki/TechnicalWikiArticle';
import { JuniorCategoryArticle } from './wiki/JuniorCategoryArticle';
import { HistoricalRecordsView } from './wiki/HistoricalRecordsView';
import { SourceRegistryView } from './wiki/SourceRegistryView';
import { WikiLink } from './wiki/WikiLink';

// Advanced Race Center Component
import { AdvancedRaceCenter } from './racecenter/AdvancedRaceCenter';
import { SelectedEntity, EntityDetailModal } from './encyclopedia/EntityDetailModal';

// Precomputed historical seasons index for quick browsing
const HISTORICAL_SEASONS = [
  { year: 2024, champDriver: 'Max Verstappen', champTeam: 'McLaren', races: 24 },
  { year: 2023, champDriver: 'Max Verstappen', champTeam: 'Red Bull Racing', races: 22 },
  { year: 2022, champDriver: 'Max Verstappen', champTeam: 'Red Bull Racing', races: 22 },
  { year: 2021, champDriver: 'Max Verstappen', champTeam: 'Mercedes', races: 22 },
  { year: 2020, champDriver: 'Lewis Hamilton', champTeam: 'Mercedes', races: 17 },
  { year: 2019, champDriver: 'Lewis Hamilton', champTeam: 'Mercedes', races: 21 },
  { year: 2018, champDriver: 'Lewis Hamilton', champTeam: 'Mercedes', races: 21 },
  { year: 2017, champDriver: 'Lewis Hamilton', champTeam: 'Mercedes', races: 20 },
  { year: 2016, champDriver: 'Nico Rosberg', champTeam: 'Mercedes', races: 21 },
  { year: 2015, champDriver: 'Lewis Hamilton', champTeam: 'Mercedes', races: 19 },
  { year: 2014, champDriver: 'Lewis Hamilton', champTeam: 'Mercedes', races: 19 },
  { year: 2013, champDriver: 'Sebastian Vettel', champTeam: 'Red Bull Racing', races: 19 },
  { year: 2012, champDriver: 'Sebastian Vettel', champTeam: 'Red Bull Racing', races: 20 },
  { year: 2011, champDriver: 'Sebastian Vettel', champTeam: 'Red Bull Racing', races: 19 },
  { year: 2010, champDriver: 'Sebastian Vettel', champTeam: 'Red Bull Racing', races: 19 },
  { year: 2009, champDriver: 'Jenson Button', champTeam: 'Brawn GP', races: 17 },
  { year: 2008, champDriver: 'Lewis Hamilton', champTeam: 'Ferrari', races: 18 },
  { year: 2007, champDriver: 'Kimi Räikkönen', champTeam: 'Ferrari', races: 17 },
  { year: 2006, champDriver: 'Fernando Alonso', champTeam: 'Renault', races: 18 },
  { year: 2005, champDriver: 'Fernando Alonso', champTeam: 'Renault', races: 19 },
  { year: 2004, champDriver: 'Michael Schumacher', champTeam: 'Ferrari', races: 18 },
  { year: 2003, champDriver: 'Michael Schumacher', champTeam: 'Ferrari', races: 16 },
  { year: 2002, champDriver: 'Michael Schumacher', champTeam: 'Ferrari', races: 17 },
  { year: 2001, champDriver: 'Michael Schumacher', champTeam: 'Ferrari', races: 17 },
  { year: 2000, champDriver: 'Michael Schumacher', champTeam: 'Ferrari', races: 17 },
  { year: 1994, champDriver: 'Michael Schumacher', champTeam: 'Williams', races: 16 },
  { year: 1991, champDriver: 'Ayrton Senna', champTeam: 'McLaren', races: 16 },
  { year: 1988, champDriver: 'Ayrton Senna', champTeam: 'McLaren', races: 16 },
  { year: 1976, champDriver: 'James Hunt', champTeam: 'Ferrari', races: 16 },
  { year: 1950, champDriver: 'Giuseppe Farina', champTeam: 'Alfa Romeo', races: 7 },
];

export const RealF1Hub: React.FC = () => {
  const { category, id } = useParams<{ category?: string; id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Selected decade filter for seasons directory
  const [selectedDecade, setSelectedDecade] = useState<string>('2020s');

  // Live OpenF1 Data Feeds (for portal summary status)
  const [session, setSession] = useState<OpenF1Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Optional modal for backwards-compatible interactions
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);

  useEffect(() => {
    openf1.getLatestSession()
      .then(sess => setSession(sess))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search matching across all entities, seasons, regulations and tech topics
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase().trim();

    const results: {
      type: string;
      id: string;
      title: string;
      subtitle: string;
      badge: string;
      customPath?: string;
    }[] = [];

    // Match Drivers
    F1_DRIVERS_DATA.forEach(d => {
      if (d.fullName.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || String(d.number) === q || d.acronym.toLowerCase() === q) {
        results.push({
          type: 'pilotos',
          id: d.id,
          title: `${d.fullName} #${d.number}`,
          subtitle: `${d.teamName} • ${d.country}`,
          badge: 'Piloto',
        });
      }
    });

    // Match Constructors
    F1_CONSTRUCTORS_DATA.forEach(c => {
      if (c.officialName.toLowerCase().includes(q) || c.shortName.toLowerCase().includes(q) || c.powerUnitManufacturer.toLowerCase().includes(q)) {
        results.push({
          type: 'escuderias',
          id: c.id,
          title: c.shortName,
          subtitle: `${c.officialName} (${c.powerUnitManufacturer})`,
          badge: 'Escudería',
        });
      }
    });

    // Match Cars
    F1_CARS_DATA.forEach(car => {
      if (car.name.toLowerCase().includes(q) || car.teamName.toLowerCase().includes(q) || car.powerUnit.toLowerCase().includes(q)) {
        results.push({
          type: 'monoplazas',
          id: car.id,
          title: car.name,
          subtitle: `${car.teamName} • ${car.powerUnit}`,
          badge: 'Monoplaza',
        });
      }
    });

    // Match Technical Staff
    F1_TECHNICAL_STAFF_DATA.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.teamName.toLowerCase().includes(q) || s.roleTitle.toLowerCase().includes(q)) {
        results.push({
          type: 'personal',
          id: s.id,
          title: s.name,
          subtitle: `${s.roleTitle} (${s.teamName})`,
          badge: 'Técnico',
        });
      }
    });

    // Match Circuits
    F1_CIRCUITS_DATA.forEach(c => {
      if (c.circuitName.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)) {
        results.push({
          type: 'circuitos',
          id: c.id,
          title: c.circuitName,
          subtitle: `Ronda #${c.round} • ${c.city}, ${c.country}`,
          badge: 'Circuito',
        });
      }
    });

    // Match Regulations & Topics
    if ('reglamento'.includes(q) || 'parc ferme'.includes(q) || 'limites'.includes(q) || 'safety car'.includes(q) || 'sanciones'.includes(q) || 'cost cap'.includes(q)) {
      results.push({
        type: 'reglamento',
        id: '',
        title: 'Reglamento y Comisarios FIA',
        subtitle: 'Código deportivo, técnico y archivo de sanciones',
        badge: 'Reglamento',
        customPath: '/f1-real/reglamento',
      });
    }

    // Match Technology & Engineering
    if ('tecnologia'.includes(q) || 'efecto suelo'.includes(q) || 'marsopeo'.includes(q) || 'porpoising'.includes(q) || 'hibrido'.includes(q) || 'frenos'.includes(q) || 'halo'.includes(q)) {
      results.push({
        type: 'tecnologia',
        id: '',
        title: 'Tecnología e Ingeniería F1',
        subtitle: 'Aerodinámica Venturi, motor híbrido V6, cinemática',
        badge: 'Ingeniería',
        customPath: '/f1-real/tecnologia',
      });
    }

    // Match Junior & Academies
    if ('junior'.includes(q) || 'f2'.includes(q) || 'formula 2'.includes(q) || 'formula 3'.includes(q) || 'superlicencia'.includes(q) || 'academia'.includes(q)) {
      results.push({
        type: 'junior',
        id: '',
        title: 'Categorías Junior y Academias (F2/F3)',
        subtitle: 'Pirámide FIA y programas de desarrollo de talento',
        badge: 'Feeder',
        customPath: '/f1-real/junior',
      });
    }

    // Match Seasons (e.g. 1950 - 2024)
    const yearMatch = parseInt(q, 10);
    if (!isNaN(yearMatch) && yearMatch >= 1950 && yearMatch <= 2025) {
      results.push({
        type: 'temporadas',
        id: String(yearMatch),
        title: `Temporada Oficial ${yearMatch}`,
        subtitle: `Campeonato Mundial de Fórmula 1 de la FIA ${yearMatch}`,
        badge: 'Temporada',
        customPath: `/f1-real/temporadas/${yearMatch}`,
      });
    }

    // Match Historical Records
    if ('records'.includes(q) || 'estadisticas'.includes(q) || 'victorias'.includes(q) || 'campeones'.includes(q) || 'schumacher'.includes(q) || 'hamilton'.includes(q) || 'senna'.includes(q)) {
      results.push({
        type: 'records',
        id: '',
        title: 'Récords y Estadísticas Históricas',
        subtitle: 'Palmarés de victorias, poles, títulos y evolución de puntos',
        badge: 'Récords',
        customPath: '/f1-real/records',
      });
    }

    // Match Source Registry
    if ('fuentes'.includes(q) || 'openf1'.includes(q) || 'jolpica'.includes(q) || 'api'.includes(q) || 'licencia'.includes(q)) {
      results.push({
        type: 'fuentes',
        id: '',
        title: 'Registro Central de Fuentes y Legalidad',
        subtitle: 'Términos de servicio, APIs abiertas y estado operativo',
        badge: 'Legal',
        customPath: '/f1-real/fuentes',
      });
    }

    return results.slice(0, 10);
  }, [searchQuery]);

  // Main navigation items
  const navItems = [
    { id: 'portal', label: 'Portada', icon: Home, path: '/f1-real' },
    { id: 'temporadas', label: 'Temporadas (1950-2024)', icon: Calendar, path: '/f1-real/temporadas' },
    { id: 'grand-prix', label: 'Grandes Premios', icon: Flag, path: '/f1-real/grand-prix' },
    { id: 'pilotos', label: 'Pilotos (20)', icon: Users, path: '/f1-real/pilotos' },
    { id: 'escuderias', label: 'Escuderías (10)', icon: Shield, path: '/f1-real/escuderias' },
    { id: 'monoplazas', label: 'Monoplazas (10)', icon: Gauge, path: '/f1-real/monoplazas' },
    { id: 'personal', label: 'Personal Técnico', icon: Wrench, path: '/f1-real/personal' },
    { id: 'circuitos', label: 'Circuitos (24)', icon: MapPin, path: '/f1-real/circuitos' },
    { id: 'records', label: 'Récords Históricos', icon: Award, path: '/f1-real/records' },
    { id: 'reglamento', label: 'Reglamento FIA', icon: FileText, path: '/f1-real/reglamento' },
    { id: 'tecnologia', label: 'Tecnología', icon: Cpu, path: '/f1-real/tecnologia' },
    { id: 'junior', label: 'Feeder F2/F3', icon: GraduationCap, path: '/f1-real/junior' },
    { id: 'fuentes', label: 'Fuentes & APIs', icon: Database, path: '/f1-real/fuentes' },
    { id: 'race-center', label: 'Race Center Live', icon: Radio, path: '/f1-real/race-center' },
  ];

  const currentTab = useMemo(() => {
    if (!category) return 'portal';
    if (category === 'estadisticas' || category === 'clasificacion') return 'records';
    return category;
  }, [category]);

  // Render dedicated individual entity articles
  const renderArticle = () => {
    if (!category || !id) return null;

    if (category === 'pilotos') {
      const driver = getDriverById(id);
      if (!driver) {
        return (
          <div className="bg-[#1b1b26] border border-red-500/30 p-8 text-center space-y-4">
            <AlertCircle size={36} className="text-red-400 mx-auto" />
            <h2 className="text-xl font-bold font-syne text-white">Piloto No Documentado</h2>
            <p className="text-xs text-white/60">No se ha encontrado ningún piloto con el identificador "{id}".</p>
            <button onClick={() => navigate('/f1-real/pilotos')} className="px-4 py-2 bg-[#FF1E00] text-white text-xs font-mono uppercase">
              Ver Índice de Pilotos
            </button>
          </div>
        );
      }
      return <DriverWikiArticle driver={driver} />;
    }

    if (category === 'escuderias') {
      const team = getConstructorById(id);
      if (!team) {
        return (
          <div className="bg-[#1b1b26] border border-red-500/30 p-8 text-center space-y-4">
            <AlertCircle size={36} className="text-red-400 mx-auto" />
            <h2 className="text-xl font-bold font-syne text-white">Escudería No Documentada</h2>
            <p className="text-xs text-white/60">No se ha encontrado ninguna escudería con el identificador "{id}".</p>
            <button onClick={() => navigate('/f1-real/escuderias')} className="px-4 py-2 bg-[#FF1E00] text-white text-xs font-mono uppercase">
              Ver Índice de Escuderías
            </button>
          </div>
        );
      }
      return <TeamWikiArticle team={team} />;
    }

    if (category === 'monoplazas') {
      const car = getCarById(id);
      if (!car) {
        return (
          <div className="bg-[#1b1b26] border border-red-500/30 p-8 text-center space-y-4">
            <AlertCircle size={36} className="text-red-400 mx-auto" />
            <h2 className="text-xl font-bold font-syne text-white">Monoplaza No Documentado</h2>
            <p className="text-xs text-white/60">No se ha encontrado ningún monoplaza con el identificador "{id}".</p>
            <button onClick={() => navigate('/f1-real/monoplazas')} className="px-4 py-2 bg-[#FF1E00] text-white text-xs font-mono uppercase">
              Ver Índice de Monoplazas
            </button>
          </div>
        );
      }
      return <CarWikiArticle car={car} />;
    }

    if (category === 'personal') {
      const staff = getTechnicalStaffById(id);
      if (!staff) {
        return (
          <div className="bg-[#1b1b26] border border-red-500/30 p-8 text-center space-y-4">
            <AlertCircle size={36} className="text-red-400 mx-auto" />
            <h2 className="text-xl font-bold font-syne text-white">Personal Técnico No Documentado</h2>
            <p className="text-xs text-white/60">No se ha encontrado ningún técnico con el identificador "{id}".</p>
            <button onClick={() => navigate('/f1-real/personal')} className="px-4 py-2 bg-[#FF1E00] text-white text-xs font-mono uppercase">
              Ver Índice de Personal Técnico
            </button>
          </div>
        );
      }
      return <StaffWikiArticle staff={staff} />;
    }

    if (category === 'circuitos') {
      const circuit = getCircuitById(id);
      if (!circuit) {
        return (
          <div className="bg-[#1b1b26] border border-red-500/30 p-8 text-center space-y-4">
            <AlertCircle size={36} className="text-red-400 mx-auto" />
            <h2 className="text-xl font-bold font-syne text-white">Circuito No Documentado</h2>
            <p className="text-xs text-white/60">No se ha encontrado ningún circuito con el identificador "{id}".</p>
            <button onClick={() => navigate('/f1-real/circuitos')} className="px-4 py-2 bg-[#FF1E00] text-white text-xs font-mono uppercase">
              Ver Calendario de Circuitos
            </button>
          </div>
        );
      }
      return <CircuitWikiArticle circuit={circuit} />;
    }

    if (category === 'temporadas') {
      const yearNum = parseInt(id, 10);
      if (!isNaN(yearNum) && yearNum >= 1950 && yearNum <= 2025) {
        return <SeasonWikiArticle year={yearNum} />;
      }
      return (
        <div className="bg-[#1b1b26] border border-red-500/30 p-8 text-center space-y-4">
          <AlertCircle size={36} className="text-red-400 mx-auto" />
          <h2 className="text-xl font-bold font-syne text-white">Temporada No Válida</h2>
          <p className="text-xs text-white/60">La temporada debe ser un año entre 1950 y 2024.</p>
          <button onClick={() => navigate('/f1-real/temporadas')} className="px-4 py-2 bg-[#FF1E00] text-white text-xs font-mono uppercase">
            Ver Archivo de Temporadas
          </button>
        </div>
      );
    }

    if (category === 'grand-prix') {
      const parts = id.split(/[-_]/).map(Number);
      const year = parts[0] || 2024;
      const round = parts[1] || 1;
      return <GrandPrixWikiArticle year={year} round={round} />;
    }

    return null;
  };

  return (
    <section id="f1-real" className="py-6 sm:py-12 px-4 sm:px-6 w-full max-w-7xl mx-auto min-h-screen">
      {/* Top Encyclopedic Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold bg-[#FF1E00]/10 border border-[#FF1E00]/30 px-2 py-0.5">
              ENCICLOPEDIA DIGITAL F1 REAL
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[10px] font-mono text-emerald-400 uppercase">
              JOLPICA-F1 & OPENF1 INTEGRATED
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[10px] font-mono text-white/50 uppercase">
              1950–2024 VERIFIED
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-syne uppercase tracking-tight text-white flex items-center gap-2">
            <span>LIGHTS OUT</span>
            <span className="text-[#FF1E00]">F1 REAL</span>
          </h2>
        </div>

        {/* Global Wiki Search Bar */}
        <div ref={searchRef} className="w-full md:w-96 relative">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Buscar (piloto, equipo, circuito, año, técnica, reglamento)..."
              className="w-full bg-[#1b1b26] border border-white/15 focus:border-[#FF1E00] text-xs font-mono text-white pl-9 pr-8 py-2.5 rounded-none placeholder:text-white/30 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#1b1b26] border border-white/20 shadow-2xl z-50 divide-y divide-white/5 max-h-96 overflow-y-auto">
              <div className="p-2 text-[10px] font-mono uppercase text-white/40 bg-black/40">
                Artículos y Entidades Coincidentes ({searchResults.length})
              </div>
              {searchResults.map((res) => (
                <button
                  key={`${res.type}-${res.id}-${res.title}`}
                  onClick={() => {
                    if (res.customPath) {
                      navigate(res.customPath);
                    } else {
                      navigate(`/f1-real/${res.type}/${res.id}`);
                    }
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2.5 hover:bg-white/10 transition-colors flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-white font-syne">{res.title}</div>
                    <div className="text-[10px] font-mono text-white/50">{res.subtitle}</div>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-white/10 text-[#FF1E00] border border-white/10 whitespace-nowrap">
                    {res.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Encyclopedic Secondary Navigation Bar (Scrollable) */}
      <nav aria-label="Navegación enciclopédica" className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-8 scrollbar-none border-b border-white/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (searchQuery) setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap shrink-0 border ${
                isActive
                  ? 'bg-white text-black font-bold border-white shadow-md'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border-white/10'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-black' : 'text-white/60'} />
              <span>{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF1E00] ml-1" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Main View Area */}
      <div className="min-h-[600px]">
        {/* Case 1: Specific Article with ID (e.g. /f1-real/pilotos/max-verstappen or /f1-real/temporadas/2021) */}
        {category && id ? (
          renderArticle()
        ) : category === 'race-center' ? (
          /* Case 2: Advanced Race Center & Live Timing (OpenF1 Telemetry) */
          <AdvancedRaceCenter />
        ) : category === 'reglamento' ? (
          /* Case 3: Regulations and FIA Stewards Archive */
          <RegulationsWikiArticle />
        ) : category === 'tecnologia' ? (
          /* Case 4: Technology and Ground Effect Engineering */
          <TechnicalWikiArticle />
        ) : category === 'junior' ? (
          /* Case 5: Feeder Series F2/F3 and Driver Academies */
          <JuniorCategoryArticle />
        ) : category === 'records' ? (
          /* Case 6: Historical All-Time Records and Scoring Systems */
          <HistoricalRecordsView />
        ) : category === 'fuentes' ? (
          /* Case 7: Legal Data Sources Registry and API Diagnostics */
          <SourceRegistryView />
        ) : category === 'temporadas' ? (
          /* Case 8: Historical Seasons Directory (1950 - 2024) */
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono text-[#FF1E00] font-bold uppercase tracking-wider block mb-1">
                ARCHIVO HISTÓRICO // JOLPICA-F1 API
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-syne uppercase text-white">
                Campeonatos Mundiales de Fórmula 1 (1950–2024)
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-sans mt-1">
                Selecciona cualquier temporada para acceder a su monografía enciclopédica, calendario completo, clasificaciones oficiales y estadísticas.
              </p>
            </div>

            {/* Quick Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {HISTORICAL_SEASONS.map((s) => (
                <button
                  key={s.year}
                  onClick={() => navigate(`/f1-real/temporadas/${s.year}`)}
                  className="bg-[#1b1b26] hover:bg-[#222232] border border-white/10 hover:border-[#FF1E00] p-4 text-left transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black font-syne text-white group-hover:text-[#FF1E00] transition-colors">
                      {s.year}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 text-white/60 border border-white/10">
                      {s.races} Carreras
                    </span>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="text-white/60 font-mono text-[11px]">
                      Campeón: <strong className="text-amber-400 font-sans">{s.champDriver}</strong>
                    </div>
                    <div className="text-white/60 font-mono text-[11px]">
                      Constructor: <strong className="text-white font-sans">{s.champTeam}</strong>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-[#FF1E00] flex items-center justify-between">
                    <span>Ver Monografía Completa</span>
                    <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : category === 'grand-prix' ? (
          /* Case 9: Grand Prix Directory (2024 Calendar Rounds) */
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono text-[#FF1E00] font-bold uppercase tracking-wider block mb-1">
                CALENDARIO OFICIAL FIA // GRANDES PREMIOS 2024
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-syne uppercase text-white">
                Grandes Premios de la Temporada 2024
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-sans mt-1">
                Accede a las clasificaciones oficiales de carrera, sesiones de clasificación, resultados de Sprint y resoluciones de comisarios de cada Gran Premio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {F1_CIRCUITS_DATA.map((circuit) => (
                <div
                  key={circuit.id}
                  className="bg-[#1b1b26] border border-white/10 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-[#FF1E00]">
                        RONDA #{circuit.round}
                      </span>
                      <span className="text-xs">{circuit.flag} {circuit.country}</span>
                    </div>
                    <h3 className="font-syne font-bold text-white text-base">
                      {circuit.circuitName}
                    </h3>
                    <p className="text-[11px] font-mono text-white/50">
                      {circuit.circuitName} • {circuit.lengthKm} km
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/f1-real/grand-prix/2024-${circuit.round}`)}
                      className="px-3 py-1.5 bg-[#FF1E00] hover:bg-red-600 text-white text-xs font-mono uppercase font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Ver Resultados</span>
                      <ChevronRight size={12} />
                    </button>
                    <WikiLink to={`/f1-real/circuitos/${circuit.id}`} className="text-[10px] font-mono text-white/50 hover:text-white">
                      Ver Circuito →
                    </WikiLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : category ? (
          /* Case 10: Standard Category Index View (pilotos, escuderias, monoplazas, personal, circuitos) */
          <CategoryIndexView category={category as WikiCategory} />
        ) : (
          /* Case 11: Default Wiki Portal Home */
          <WikiPortalHome
            session={session}
            onNavigateCategory={(cat) => navigate(`/f1-real/${cat}`)}
            onOpenRaceCenter={() => navigate('/f1-real/race-center')}
          />
        )}
      </div>

      {/* Legacy Modal Support */}
      <EntityDetailModal
        entity={selectedEntity}
        onClose={() => setSelectedEntity(null)}
        onSelectEntity={setSelectedEntity}
      />
    </section>
  );
};
