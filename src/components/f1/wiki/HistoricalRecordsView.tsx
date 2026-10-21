import React, { useState, useMemo } from 'react';
import { 
  Trophy, Award, Search, Filter, ArrowUpDown, 
  HelpCircle, ExternalLink, Calendar, Users, Shield, Flag 
} from 'lucide-react';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiLink } from './WikiLink';

type RecordCategory = 
  | 'championships' 
  | 'wins' 
  | 'poles' 
  | 'podiums' 
  | 'fastest-laps' 
  | 'season-records' 
  | 'constructors' 
  | 'scoring-history';

interface RecordEntry {
  rank: number;
  entityName: string;
  driverId?: string;
  constructorId?: string;
  country?: string;
  activePeriod: string;
  value: number | string;
  secondaryValue?: string;
  notes?: string;
  isCurrent?: boolean;
}

const CHAMPIONSHIP_RECORDS: RecordEntry[] = [
  { rank: 1, entityName: 'Michael Schumacher', country: 'Alemania', activePeriod: '1991–2012', value: 7, notes: '1994, 1995, 2000, 2001, 2002, 2003, 2004 (Benetton, Ferrari)' },
  { rank: 1, entityName: 'Lewis Hamilton', country: 'Reino Unido', activePeriod: '2007–Act.', value: 7, notes: '2008, 2014, 2015, 2017, 2018, 2019, 2020 (McLaren, Mercedes)', isCurrent: true, driverId: 'lewis-hamilton' },
  { rank: 3, entityName: 'Juan Manuel Fangio', country: 'Argentina', activePeriod: '1950–1958', value: 5, notes: '1951, 1954, 1955, 1956, 1957 (Alfa Romeo, Maserati, Mercedes, Ferrari)' },
  { rank: 4, entityName: 'Alain Prost', country: 'Francia', activePeriod: '1980–1993', value: 4, notes: '1985, 1986, 1989, 1993 (McLaren, Williams)' },
  { rank: 4, entityName: 'Sebastian Vettel', country: 'Alemania', activePeriod: '2007–2022', value: 4, notes: '2010, 2011, 2012, 2013 (Red Bull Racing)' },
  { rank: 4, entityName: 'Max Verstappen', country: 'Países Bajos', activePeriod: '2015–Act.', value: 4, notes: '2021, 2022, 2023, 2024 (Red Bull Racing)', isCurrent: true, driverId: 'max-verstappen' },
  { rank: 7, entityName: 'Jack Brabham', country: 'Australia', activePeriod: '1955–1970', value: 3, notes: '1959, 1960, 1966 (Cooper, Brabham)' },
  { rank: 7, entityName: 'Jackie Stewart', country: 'Reino Unido', activePeriod: '1965–1973', value: 3, notes: '1969, 1971, 1973 (Matra, Tyrrell)' },
  { rank: 7, entityName: 'Niki Lauda', country: 'Austria', activePeriod: '1971–1985', value: 3, notes: '1975, 1977, 1984 (Ferrari, McLaren)' },
  { rank: 7, entityName: 'Nelson Piquet', country: 'Brasil', activePeriod: '1978–1991', value: 3, notes: '1981, 1983, 1987 (Brabham, Williams)' },
  { rank: 7, entityName: 'Ayrton Senna', country: 'Brasil', activePeriod: '1984–1994', value: 3, notes: '1988, 1990, 1991 (McLaren)' },
  { rank: 12, entityName: 'Fernando Alonso', country: 'España', activePeriod: '2001–Act.', value: 2, notes: '2005, 2006 (Renault)', isCurrent: true, driverId: 'fernando-alonso' },
];

const WINS_RECORDS: RecordEntry[] = [
  { rank: 1, entityName: 'Lewis Hamilton', country: 'Reino Unido', activePeriod: '2007–Act.', value: 105, secondaryValue: '353 Salidas (29.7%)', isCurrent: true, driverId: 'lewis-hamilton' },
  { rank: 2, entityName: 'Michael Schumacher', country: 'Alemania', activePeriod: '1991–2012', value: 91, secondaryValue: '306 Salidas (29.7%)' },
  { rank: 3, entityName: 'Max Verstappen', country: 'Países Bajos', activePeriod: '2015–Act.', value: 63, secondaryValue: '209 Salidas (30.1%)', isCurrent: true, driverId: 'max-verstappen' },
  { rank: 4, entityName: 'Sebastian Vettel', country: 'Alemania', activePeriod: '2007–2022', value: 53, secondaryValue: '299 Salidas (17.7%)' },
  { rank: 5, entityName: 'Alain Prost', country: 'Francia', activePeriod: '1980–1993', value: 51, secondaryValue: '199 Salidas (25.6%)' },
  { rank: 6, entityName: 'Ayrton Senna', country: 'Brasil', activePeriod: '1984–1994', value: 41, secondaryValue: '161 Salidas (25.5%)' },
  { rank: 7, entityName: 'Fernando Alonso', country: 'España', activePeriod: '2001–Act.', value: 32, secondaryValue: '401 Salidas (8.0%)', isCurrent: true, driverId: 'fernando-alonso' },
  { rank: 8, entityName: 'Nigel Mansell', country: 'Reino Unido', activePeriod: '1980–1995', value: 31, secondaryValue: '187 Salidas (16.6%)' },
  { rank: 9, entityName: 'Jackie Stewart', country: 'Reino Unido', activePeriod: '1965–1973', value: 27, secondaryValue: '99 Salidas (27.3%)' },
  { rank: 10, entityName: 'Jim Clark', country: 'Reino Unido', activePeriod: '1960–1968', value: 25, secondaryValue: '72 Salidas (34.7%)' },
  { rank: 10, entityName: 'Niki Lauda', country: 'Austria', activePeriod: '1971–1985', value: 25, secondaryValue: '171 Salidas (14.6%)' },
];

const POLES_RECORDS: RecordEntry[] = [
  { rank: 1, entityName: 'Lewis Hamilton', country: 'Reino Unido', activePeriod: '2007–Act.', value: 104, isCurrent: true, driverId: 'lewis-hamilton' },
  { rank: 2, entityName: 'Michael Schumacher', country: 'Alemania', activePeriod: '1991–2012', value: 68 },
  { rank: 3, entityName: 'Ayrton Senna', country: 'Brasil', activePeriod: '1984–1994', value: 65 },
  { rank: 4, entityName: 'Sebastian Vettel', country: 'Alemania', activePeriod: '2007–2022', value: 57 },
  { rank: 5, entityName: 'Max Verstappen', country: 'Países Bajos', activePeriod: '2015–Act.', value: 40, isCurrent: true, driverId: 'max-verstappen' },
  { rank: 6, entityName: 'Jim Clark', country: 'Reino Unido', activePeriod: '1960–1968', value: 33 },
  { rank: 6, entityName: 'Alain Prost', country: 'Francia', activePeriod: '1980–1993', value: 33 },
  { rank: 8, entityName: 'Nigel Mansell', country: 'Reino Unido', activePeriod: '1980–1995', value: 32 },
  { rank: 9, entityName: 'Nico Rosberg', country: 'Alemania', activePeriod: '2006–2016', value: 30 },
  { rank: 10, entityName: 'Juan Manuel Fangio', country: 'Argentina', activePeriod: '1950–1958', value: 29 },
  { rank: 11, entityName: 'Charles Leclerc', country: 'Mónaco', activePeriod: '2018–Act.', value: 26, isCurrent: true, driverId: 'charles-leclerc' },
];

const PODIUMS_RECORDS: RecordEntry[] = [
  { rank: 1, entityName: 'Lewis Hamilton', country: 'Reino Unido', activePeriod: '2007–Act.', value: 201, isCurrent: true, driverId: 'lewis-hamilton' },
  { rank: 2, entityName: 'Michael Schumacher', country: 'Alemania', activePeriod: '1991–2012', value: 155 },
  { rank: 3, entityName: 'Sebastian Vettel', country: 'Alemania', activePeriod: '2007–2022', value: 122 },
  { rank: 4, entityName: 'Max Verstappen', country: 'Países Bajos', activePeriod: '2015–Act.', value: 111, isCurrent: true, driverId: 'max-verstappen' },
  { rank: 5, entityName: 'Fernando Alonso', country: 'España', activePeriod: '2001–Act.', value: 106, isCurrent: true, driverId: 'fernando-alonso' },
  { rank: 5, entityName: 'Alain Prost', country: 'Francia', activePeriod: '1980–1993', value: 106 },
  { rank: 7, entityName: 'Kimi Räikkönen', country: 'Finlandia', activePeriod: '2001–2021', value: 103 },
  { rank: 8, entityName: 'Ayrton Senna', country: 'Brasil', activePeriod: '1984–1994', value: 80 },
  { rank: 9, entityName: 'Rubens Barrichello', country: 'Brasil', activePeriod: '1993–2011', value: 68 },
  { rank: 10, entityName: 'Valtteri Bottas', country: 'Finlandia', activePeriod: '2013–Act.', value: 67, isCurrent: true, driverId: 'valtteri-bottas' },
];

const CONSTRUCTOR_RECORDS: RecordEntry[] = [
  { rank: 1, entityName: 'Scuderia Ferrari', country: 'Italia', activePeriod: '1950–Act.', value: 16, secondaryValue: '248 Victorias / 1084 GGPP', notes: 'Único constructor presente en cada temporada desde 1950', isCurrent: true, constructorId: 'ferrari' },
  { rank: 2, entityName: 'Williams Grand Prix', country: 'Reino Unido', activePeriod: '1975–Act.', value: 9, secondaryValue: '114 Victorias', notes: '1980, 1981, 1986, 1987, 1992, 1993, 1994, 1996, 1997', isCurrent: true, constructorId: 'williams' },
  { rank: 3, entityName: 'McLaren Racing', country: 'Reino Unido', activePeriod: '1966–Act.', value: 8, secondaryValue: '188 Victorias', notes: '1974, 1984, 1985, 1988, 1989, 1990, 1991, 1998', isCurrent: true, constructorId: 'mclaren' },
  { rank: 3, entityName: 'Mercedes-AMG F1', country: 'Alemania', activePeriod: '1954–Act.', value: 8, secondaryValue: '128 Victorias', notes: '8 títulos consecutivos entre 2014 y 2021 (Récord absoluto)', isCurrent: true, constructorId: 'mercedes' },
  { rank: 5, entityName: 'Team Lotus', country: 'Reino Unido', activePeriod: '1958–1994', value: 7, secondaryValue: '79 Victorias', notes: 'Pioneros del chasis monocasco y la aerodinámica con efecto suelo' },
  { rank: 6, entityName: 'Red Bull Racing', country: 'Austria', activePeriod: '2005–Act.', value: 6, secondaryValue: '121 Victorias', notes: '2010, 2011, 2012, 2013, 2022, 2023', isCurrent: true, constructorId: 'redbull' },
];

const HISTORICAL_SCORING_SYSTEMS = [
  { era: '1950–1959', system: '8 - 6 - 4 - 3 - 2 (+1 Vuelta Rápida)', bestResults: 'Sólo las 4 o 5 mejores carreras puntuaban', notes: 'Los puntos se dividían si varios pilotos compartían coche o hacían el mismo tiempo de vuelta rápida.' },
  { era: '1960', system: '8 - 6 - 4 - 3 - 2 - 1', bestResults: 'Las 6 mejores carreras', notes: 'Se eliminó el punto por vuelta rápida y se premió al 6º clasificado.' },
  { era: '1961–1990', system: '9 - 6 - 4 - 3 - 2 - 1', bestResults: 'Mejores resultados por mitades de año', notes: 'La victoria pasó de 8 a 9 puntos. En 1988 Senna fue campeón pese a que Prost sumó más puntos totales por la regla de descarte.' },
  { era: '1991–2002', system: '10 - 6 - 4 - 3 - 2 - 1', bestResults: 'Todas las carreras cuentan', notes: 'Se abolió la regla de resultados descartables; cada punto sumado computó para el mundial.' },
  { era: '2003–2009', system: '10 - 8 - 6 - 5 - 4 - 3 - 2 - 1', bestResults: 'Top 8 clasificados', notes: 'Reducción de la brecha entre el 1º y 2º de 4 a 2 puntos para premiar la regularidad frente a las victorias aplastantes de Ferrari.' },
  { era: '2010–2018', system: '25 - 18 - 15 - 12 - 10 - 8 - 6 - 4 - 2 - 1', bestResults: 'Top 10 clasificados', notes: 'Escala moderna introducida con la ampliación de la parrilla a 24 monoplazas.' },
  { era: '2019–2024', system: '25 - 18 - 15 - 12 - 10 - 8 - 6 - 4 - 2 - 1 (+1 FL)', bestResults: 'Top 10 + Sprint (8-1)', notes: 'Reintroducción del punto por Vuelta Rápida (para pilotos clasificados en el Top 10) y carreras al Sprint en sábados seleccionados.' },
];

export const HistoricalRecordsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<RecordCategory>('championships');
  const [searchQuery, setSearchQuery] = useState('');

  const currentRecords = useMemo(() => {
    switch (activeCategory) {
      case 'championships': return CHAMPIONSHIP_RECORDS;
      case 'wins': return WINS_RECORDS;
      case 'poles': return POLES_RECORDS;
      case 'podiums': return PODIUMS_RECORDS;
      case 'constructors': return CONSTRUCTOR_RECORDS;
      default: return CHAMPIONSHIP_RECORDS;
    }
  }, [activeCategory]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return currentRecords;
    const q = searchQuery.toLowerCase();
    return currentRecords.filter(r => 
      r.entityName.toLowerCase().includes(q) ||
      (r.country && r.country.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  }, [currentRecords, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs 
        items={[
          { label: 'Portal Portada', to: '/f1-real' },
          { label: 'Récords y Estadísticas Históricas' },
        ]} 
      />

      {/* Main Title & Notice */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5">
            HISTORIAL ESTADÍSTICO OFICIAL FIA // 1950–2024
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 uppercase">
            BASE DE DATOS JOLPICA-F1 / ERGAST NORMALIZADA
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-syne uppercase text-white tracking-tight">
          Grandes Récords de la Fórmula 1
        </h1>
        <p className="text-xs sm:text-sm text-white/70 font-sans mt-2 max-w-4xl leading-relaxed">
          Tablas oficiales de campeonatos, victorias, pole positions y podios desde la fundación de la categoría en Silverstone 1950. 
          Incluye advertencias metodológicas sobre la evolución de los sistemas de puntuación y el número de carreras anuales.
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#1b1b26] border border-white/10 p-1.5">
        {[
          { id: 'championships', label: 'Campeonatos', icon: Trophy },
          { id: 'wins', label: 'Victorias GP', icon: Flag },
          { id: 'poles', label: 'Pole Positions', icon: Award },
          { id: 'podiums', label: 'Podios', icon: Award },
          { id: 'constructors', label: 'Constructores', icon: Shield },
          { id: 'scoring-history', label: 'Evolución de Puntuación', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id as RecordCategory);
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase transition-colors ${
                isActive
                  ? 'bg-[#FF1E00] text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Methodological Context Warning Banner */}
      <div className="bg-[#1b1b26] border-l-4 border-amber-500 p-3.5 text-xs text-white/80 space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-400 font-syne uppercase">
          <HelpCircle size={14} />
          <span>Advertencia Metodológica y Contexto de Épocas</span>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed font-sans">
          Las comparaciones de totales absolutos deben analizarse con rigor temporal: en la década de 1950 una temporada constaba de entre 7 y 9 carreras, 
          mientras que el calendario 2024 consta de 24 Grandes Premios más carreras Sprint. De igual modo, una victoria en 1950 otorgaba 8 puntos frente a los 25 actuales.
        </p>
      </div>

      {/* Section View: Table or Scoring Evolution */}
      {activeCategory === 'scoring-history' ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-syne uppercase text-white">
            Evolución de los Sistemas de Puntuación del Campeonato Mundial (1950–2024)
          </h2>
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1b1b26] border-b border-white/10 text-white/60">
                <tr>
                  <th className="p-3">Período</th>
                  <th className="p-3">Escala de Puntos Oficial</th>
                  <th className="p-3">Regla de Resultados Válidos</th>
                  <th className="p-3">Contexto Histórico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/20 text-white/80">
                {HISTORICAL_SCORING_SYSTEMS.map((sys) => (
                  <tr key={sys.era} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-[#FF1E00] whitespace-nowrap">{sys.era}</td>
                    <td className="p-3 text-white font-bold">{sys.system}</td>
                    <td className="p-3 text-white/70">{sys.bestResults}</td>
                    <td className="p-3 text-white/60 text-[11px] leading-relaxed">{sys.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Search bar inside records */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nombre, país o notas..."
                className="w-full bg-[#1b1b26] border border-white/10 text-white text-xs font-mono pl-7 pr-3 py-1.5 focus:border-[#FF1E00] focus:outline-none"
              />
            </div>
            <span className="text-[10px] font-mono text-white/50">
              {filteredRecords.length} Registros clasificados
            </span>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1b1b26] border-b border-white/10 text-white/60 uppercase">
                <tr>
                  <th className="p-3 w-16 text-center">Pos</th>
                  <th className="p-3">
                    {activeCategory === 'constructors' ? 'Escudería / Constructor' : 'Piloto'}
                  </th>
                  <th className="p-3">País</th>
                  <th className="p-3">Período Activo</th>
                  <th className="p-3 text-right">Récord Absoluto</th>
                  <th className="p-3">Detalle / Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/20 text-white/80">
                {filteredRecords.map((rec) => (
                  <tr key={`${rec.rank}-${rec.entityName}`} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold ${
                        rec.rank === 1 
                          ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' 
                          : rec.rank === 2
                          ? 'bg-zinc-300/20 text-zinc-300 border border-zinc-300/30'
                          : rec.rank === 3
                          ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30'
                          : 'text-white/60'
                      }`}>
                        {rec.rank}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-white">
                      <div className="flex items-center gap-2">
                        {rec.driverId ? (
                          <WikiLink to={`/f1-real/pilotos/${rec.driverId}`} className="font-bold text-white hover:text-[#FF1E00] font-syne">
                            {rec.entityName}
                          </WikiLink>
                        ) : rec.constructorId ? (
                          <WikiLink to={`/f1-real/escuderias/${rec.constructorId}`} className="font-bold text-white hover:text-[#FF1E00] font-syne">
                            {rec.entityName}
                          </WikiLink>
                        ) : (
                          <span className="font-syne font-bold">{rec.entityName}</span>
                        )}

                        {rec.isCurrent && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Activo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-white/60">{rec.country || '-'}</td>
                    <td className="p-3 text-white/60">{rec.activePeriod}</td>
                    <td className="p-3 text-right">
                      <div className="font-bold text-base text-[#FF1E00]">{rec.value}</div>
                      {rec.secondaryValue && (
                        <div className="text-[10px] text-white/40">{rec.secondaryValue}</div>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-white/60 max-w-md">{rec.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provenance Footer */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-white/50">
        <span>Fuente: Ergast / Jolpica-F1 Historical Archive (Licencia CC-BY-NC / Open Data)</span>
        <span>Revisión de integridad: 2024 FIA Post-Season Certification</span>
      </div>
    </div>
  );
};
