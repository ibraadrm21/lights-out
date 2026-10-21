import React, { useState, useEffect } from 'react';
import { 
  Calendar, Trophy, Flag, Shield, ExternalLink, 
  RotateCcw, CheckCircle2, Bookmark, ArrowRight, Activity 
} from 'lucide-react';
import { F1SeasonSummary, F1RaceWeekend } from '../../../types/f1Data';
import { jolpica } from '../../../services/jolpicaService';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiInfobox, InfoboxSection } from './WikiInfobox';
import { WikiTableOfContents, TOCItem } from './WikiTableOfContents';
import { WikiLink } from './WikiLink';

interface SeasonWikiArticleProps {
  year: number;
}

export const SeasonWikiArticle: React.FC<SeasonWikiArticleProps> = ({ year }) => {
  const [races, setRaces] = useState<F1RaceWeekend[]>([]);
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [teamStandings, setTeamStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      jolpica.getSeasonRaces(year),
      jolpica.getDriverStandings(year),
      jolpica.getConstructorStandings(year),
    ]).then(([r, ds, cs]) => {
      setRaces(r);
      setDriverStandings(ds);
      setTeamStandings(cs);
    }).finally(() => {
      setLoading(false);
    });
  }, [year]);

  const championDriver = driverStandings[0];
  const championTeam = teamStandings[0];

  const tocItems: TOCItem[] = [
    { id: 'resumen', label: '1. Resumen y Contexto Histórico' },
    { id: 'campeones', label: '2. Campeones del Mundo' },
    { id: 'calendario', label: `3. Calendario Oficial (${races.length} Grandes Premios)` },
    { id: 'clasificacion-pilotos', label: '4. Clasificación Final de Pilotos' },
    { id: 'clasificacion-constructores', label: '5. Clasificación Final de Constructores' },
    { id: 'referencias', label: '6. Referencias y Fuentes Oficiales' },
  ];

  const infoboxSections: InfoboxSection[] = [
    {
      title: 'Campeonato Mundial',
      rows: [
        { label: 'Temporada', value: <span className="font-bold text-[#FF1E00]">{year}</span> },
        { label: 'Edición', value: `${year - 1949}ª Temporada FIA` },
        { label: 'Grandes Premios', value: `${races.length} carreras` },
        { 
          label: 'Campeón Pilotos', 
          value: championDriver ? (
            <span className="font-bold text-amber-400">
              {championDriver.driverName} ({championDriver.points} pts)
            </span>
          ) : 'En disputa' 
        },
        { 
          label: 'Campeón Equipos', 
          value: championTeam ? (
            <span className="font-bold text-white">
              {championTeam.constructorName} ({championTeam.points} pts)
            </span>
          ) : 'En disputa' 
        },
      ],
    },
    {
      title: 'Datos Técnicos y Regulatorios',
      rows: [
        { 
          label: 'Era Reglamentaria', 
          value: year >= 2022 ? 'Efecto Suelo (Túneles Venturi)' : year >= 2014 ? 'V6 Turbo Híbrido (1.6L)' : year >= 2006 ? 'V8 Atmosférico (2.4L)' : 'V10 Clásico (3.0L)' 
        },
        { label: 'Fuente Principal', value: 'Jolpica-F1 / FIA Archive' },
        { label: 'Licencia', value: 'Public Historical Data' },
      ],
    },
  ];

  return (
    <article className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs
        items={[
          { label: 'Temporadas Históricas', to: '/f1-real/temporadas' },
          { label: `Temporada ${year}` },
        ]}
      />

      {/* Header */}
      <header className="border-b border-white/15 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold">
            ARTÍCULO HISTÓRICO // CAMPEONATO MUNDIAL
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50">
            AÑO {year} // FIA ARCHIVE
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight text-white">
          Temporada {year} de Fórmula 1
        </h1>

        <p className="text-xs font-mono text-white/60 mt-1">
          {year - 1949}ª edición del Campeonato Mundial de Fórmula 1 de la FIA.
        </p>
      </header>

      {/* Main 2-Column Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 space-y-8 w-full min-w-0">
          {/* Lead paragraph */}
          <section className="bg-white/[0.02] border-l-2 border-[#FF1E00] p-4 text-sm text-white/80 leading-relaxed font-sans">
            <p>
              El <strong>Campeonato Mundial de Fórmula 1 de {year}</strong> fue la {year - 1949}ª temporada de automovilismo de velocidad para monoplazas de Fórmula 1 organizada por la FIA. La temporada comprendió un calendario oficial de <strong>{races.length} Grandes Premios</strong> disputados en autódromos internacionales y circuitos urbanos alrededor del mundo.
              {championDriver && (
                <> El título mundial de pilotos fue obtenido por <strong className="text-white">{championDriver.driverName}</strong> sumando un total de {championDriver.points} puntos.</>
              )}
            </p>
          </section>

          {/* Table of Contents */}
          <WikiTableOfContents items={tocItems} />

          {/* Section 1: Resumen */}
          <section id="resumen" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Calendar size={18} className="text-[#FF1E00]" />
              1. Resumen y Contexto Histórico
            </h2>
            <div className="text-sm text-white/70 space-y-2 leading-relaxed">
              <p>
                Durante el campeonato de {year}, la competición estuvo regida bajo los reglamentos deportivos y técnicos oficiales de la FIA. Los datos históricos han sido validados a través de los registros unificados de Jolpica-F1 y los boletines de clasificación final de la FIA.
              </p>
            </div>
          </section>

          {/* Section 2: Campeones */}
          <section id="campeones" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Trophy size={18} className="text-[#FF1E00]" />
              2. Campeones del Mundo {year}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#1b1b26] border border-amber-500/30 space-y-2">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                  Campeón Mundial de Pilotos
                </span>
                <h3 className="font-syne font-bold text-white text-lg">
                  {championDriver ? championDriver.driverName : 'Sin definir'}
                </h3>
                <p className="text-xs font-mono text-white/60">
                  {championDriver ? `${championDriver.points} Puntos • ${championDriver.wins} Victorias • ${championDriver.constructorName}` : ''}
                </p>
              </div>

              <div className="p-4 bg-[#1b1b26] border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#FF1E00] font-bold block">
                  Campeón Mundial de Constructores
                </span>
                <h3 className="font-syne font-bold text-white text-lg">
                  {championTeam ? championTeam.constructorName : 'Sin definir'}
                </h3>
                <p className="text-xs font-mono text-white/60">
                  {championTeam ? `${championTeam.points} Puntos • ${championTeam.wins} Victorias` : ''}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Calendario */}
          <section id="calendario" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Flag size={18} className="text-[#FF1E00]" />
              3. Calendario Oficial y Grandes Premios
            </h2>
            {loading ? (
              <p className="text-xs font-mono text-white/40">Cargando carreras de Jolpica-F1...</p>
            ) : (
              <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 uppercase text-white/60 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center">Ronda</th>
                      <th className="p-2.5">Gran Premio</th>
                      <th className="p-2.5">Circuito</th>
                      <th className="p-2.5">Ubicación</th>
                      <th className="p-2.5">Fecha</th>
                      <th className="p-2.5 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {races.map(r => (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                        <td className="p-2.5 font-bold text-center text-[#FF1E00]">#{r.round}</td>
                        <td className="p-2.5 font-semibold text-white">{r.raceName}</td>
                        <td className="p-2.5 text-white/70">{r.circuitName}</td>
                        <td className="p-2.5 text-white/60">{r.city}, {r.country}</td>
                        <td className="p-2.5 text-white/60">{r.date}</td>
                        <td className="p-2.5 text-center">
                          <WikiLink to={`/f1-real/grand-prix/${year}/${r.round}`}>
                            <span className="px-2 py-0.5 bg-white/10 hover:bg-[#FF1E00] text-white text-[10px] uppercase transition-colors">
                              Resultados →
                            </span>
                          </WikiLink>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Section 4: Standings */}
          <section id="clasificacion-pilotos" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Activity size={18} className="text-[#FF1E00]" />
              4. Clasificación Final de Pilotos {year}
            </h2>
            <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white/5 border-b border-white/10 uppercase text-white/60 text-[11px]">
                  <tr>
                    <th className="p-2.5 text-center">Pos</th>
                    <th className="p-2.5">Piloto</th>
                    <th className="p-2.5">Escudería</th>
                    <th className="p-2.5 text-right">Puntos</th>
                    <th className="p-2.5 text-center">Victorias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {driverStandings.slice(0, 15).map(d => (
                    <tr key={d.driverId} className="hover:bg-white/[0.02]">
                      <td className="p-2.5 font-bold text-center text-[#FF1E00]">P{d.position}</td>
                      <td className="p-2.5 font-semibold text-white">{d.driverName}</td>
                      <td className="p-2.5 text-white/70">{d.constructorName}</td>
                      <td className="p-2.5 font-bold text-right text-white">{d.points}</td>
                      <td className="p-2.5 font-bold text-center text-amber-400">{d.wins > 0 ? d.wins : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6: Referencias */}
          <section id="referencias" className="scroll-mt-6 space-y-3 pt-4 border-t border-white/15">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Bookmark size={14} className="text-[#FF1E00]" />
              Referencias y Fuentes Documentales
            </h2>
            <ol className="list-decimal list-inside text-xs font-mono text-white/60 space-y-1.5">
              <li>FIA Formula One World Championship Archives (1950-{year}).</li>
              <li>Jolpica-F1 Public API Database (Ergast API Schema).</li>
              <li>Documentación y clasificaciones oficiales de la FIA.</li>
            </ol>
          </section>
        </div>

        {/* Right Column Infobox */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <WikiInfobox
            title={`Temporada ${year}`}
            subtitle="Campeonato Mundial FIA"
            accentColor="#FF1E00"
            sections={infoboxSections}
          />
        </div>
      </div>
    </article>
  );
};
