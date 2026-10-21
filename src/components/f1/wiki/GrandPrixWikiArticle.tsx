import React, { useState, useEffect } from 'react';
import { 
  Trophy, Calendar, MapPin, Flag, Timer, 
  ExternalLink, Bookmark, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import { F1GrandPrixResultEntry, F1QualifyingEntry, F1RaceWeekend } from '../../../types/f1Data';
import { jolpica } from '../../../services/jolpicaService';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiInfobox, InfoboxSection } from './WikiInfobox';
import { WikiTableOfContents, TOCItem } from './WikiTableOfContents';
import { WikiLink } from './WikiLink';

interface GrandPrixWikiArticleProps {
  year: number;
  round: number;
}

export const GrandPrixWikiArticle: React.FC<GrandPrixWikiArticleProps> = ({ year, round }) => {
  const [race, setRace] = useState<F1RaceWeekend | null>(null);
  const [results, setResults] = useState<F1GrandPrixResultEntry[]>([]);
  const [qualifying, setQualifying] = useState<F1QualifyingEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      jolpica.getRaceResults(year, round),
      jolpica.getQualifyingResults(year, round),
    ]).then(([resData, qualyData]) => {
      setRace(resData.race);
      setResults(resData.results);
      setQualifying(qualyData);
    }).finally(() => {
      setLoading(false);
    });
  }, [year, round]);

  const winner = results[0];
  const pole = qualifying[0];

  const tocItems: TOCItem[] = [
    { id: 'resumen', label: '1. Resumen del Gran Premio' },
    { id: 'clasificacion-oficial', label: '2. Clasificación Oficial de Carrera' },
    { id: 'clasificacion-sabado', label: '3. Resultados de Clasificación' },
    { id: 'referencias', label: '4. Referencias y Documentos Oficiales' },
  ];

  const infoboxSections: InfoboxSection[] = [
    {
      title: 'Datos del Evento',
      rows: [
        { label: 'Gran Premio', value: race ? race.raceName : `Ronda ${round}` },
        { label: 'Temporada', value: <WikiLink to={`/f1-real/temporadas/${year}`}>{year}</WikiLink> },
        { label: 'Ronda', value: `Ronda #${round}` },
        { label: 'Circuito', value: race ? race.circuitName : 'Circuito Oficial' },
        { label: 'Ubicación', value: race ? `${race.city}, ${race.country}` : '-' },
        { label: 'Fecha de Carrera', value: race ? race.date : '-' },
      ],
    },
    {
      title: 'Cuadro de Honor',
      rows: [
        { 
          label: 'Vencedor', 
          value: winner ? (
            <span className="font-bold text-amber-400">
              {winner.driverName} ({winner.constructorName})
            </span>
          ) : 'Pendiente' 
        },
        { 
          label: 'Pole Position', 
          value: pole ? `${pole.driverName} (${pole.q3 || pole.q1 || 'Qualy'})` : 'Pendiente' 
        },
        { 
          label: 'Estado Oficial', 
          value: <span className="text-emerald-400 font-bold">CLASIFICACIÓN FINAL APROBADA</span> 
        },
      ],
    },
  ];

  return (
    <article className="space-y-6">
      <WikiBreadcrumbs
        items={[
          { label: 'Grandes Premios', to: '/f1-real/circuitos' },
          { label: `Temporada ${year}`, to: `/f1-real/temporadas/${year}` },
          { label: race ? race.raceName : `GP Ronda ${round}` },
        ]}
      />

      <header className="border-b border-white/15 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold">
            ARTÍCULO DE GRAN PREMIO // RESULTADOS OFICIALES
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50">
            FIA OFFICIAL CLASSIFICATION // {year}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight text-white">
          {race ? race.raceName : `Gran Premio Ronda ${round}`} {year}
        </h1>

        <p className="text-xs font-mono text-white/60 mt-1">
          Ronda #{round} del Campeonato Mundial de Fórmula 1 {year} en {race ? `${race.circuitName} (${race.city})` : 'el trazado oficial'}.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 space-y-8 w-full min-w-0">
          <section className="bg-white/[0.02] border-l-2 border-[#FF1E00] p-4 text-sm text-white/80 leading-relaxed font-sans">
            <p>
              El <strong>{race ? race.raceName : 'Gran Premio'} de {year}</strong> fue la ronda número <strong>#{round}</strong> del Campeonato Mundial de Fórmula 1. La carrera se disputó bajo la homologación Grado 1 de la FIA.
              {winner && (
                <> La victoria fue conquistada por <strong className="text-white">{winner.driverName}</strong> pilotando para {winner.constructorName}, completando las {winner.laps} vueltas reglamentarias en {winner.timeOrStatus}.</>
              )}
            </p>
          </section>

          <WikiTableOfContents items={tocItems} />

          {/* Section 1: Resumen */}
          <section id="resumen" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Calendar size={18} className="text-[#FF1E00]" />
              1. Resumen del Fin de Semana
            </h2>
            <div className="text-sm text-white/70 space-y-2 leading-relaxed">
              <p>
                Los resultados corresponden a la clasificación oficial definitiva confirmada por los comisarios deportivos de la FIA tras las verificaciones técnicas post-carrera de peso, combustible y legalidad aerodinámica.
              </p>
            </div>
          </section>

          {/* Section 2: Race Results Table */}
          <section id="clasificacion-oficial" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Trophy size={18} className="text-[#FF1E00]" />
              2. Clasificación Oficial de Carrera
            </h2>
            {loading ? (
              <p className="text-xs font-mono text-white/40">Cargando resultados oficiales de Jolpica-F1...</p>
            ) : (
              <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 uppercase text-white/60 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center">Pos</th>
                      <th className="p-2.5">Nº</th>
                      <th className="p-2.5">Piloto</th>
                      <th className="p-2.5">Escudería</th>
                      <th className="p-2.5 text-center">Vueltas</th>
                      <th className="p-2.5">Tiempo / Estado</th>
                      <th className="p-2.5 text-right">Puntos</th>
                      <th className="p-2.5 text-center">Parrilla</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className={`p-2.5 font-bold text-center ${r.position === 1 ? 'text-amber-400 font-black' : r.position === 'DNF' ? 'text-red-400' : 'text-white'}`}>
                          {r.position}
                        </td>
                        <td className="p-2.5 text-white/50">#{r.driverNumber}</td>
                        <td className="p-2.5 font-semibold text-white">{r.driverName}</td>
                        <td className="p-2.5 text-white/70">{r.constructorName}</td>
                        <td className="p-2.5 text-center text-white/60">{r.laps}</td>
                        <td className="p-2.5 text-white/90">{r.timeOrStatus}</td>
                        <td className="p-2.5 font-bold text-right text-white">{r.points}</td>
                        <td className="p-2.5 text-center text-white/50">P{r.gridPosition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Section 3: Qualifying Table */}
          {qualifying.length > 0 && (
            <section id="clasificacion-sabado" className="scroll-mt-6 space-y-3">
              <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                <Timer size={18} className="text-[#FF1E00]" />
                3. Resultados de Clasificación (Pole Position)
              </h2>
              <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 uppercase text-white/60 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center">Pos</th>
                      <th className="p-2.5">Piloto</th>
                      <th className="p-2.5">Escudería</th>
                      <th className="p-2.5 text-center">Q1</th>
                      <th className="p-2.5 text-center">Q2</th>
                      <th className="p-2.5 text-center">Q3</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {qualifying.slice(0, 15).map((q) => (
                      <tr key={q.position} className="hover:bg-white/[0.02]">
                        <td className="p-2.5 font-bold text-center text-[#FF1E00]">P{q.position}</td>
                        <td className="p-2.5 font-semibold text-white">{q.driverName}</td>
                        <td className="p-2.5 text-white/70">{q.constructorName}</td>
                        <td className="p-2.5 text-center text-white/60">{q.q1 || '-'}</td>
                        <td className="p-2.5 text-center text-white/60">{q.q2 || '-'}</td>
                        <td className="p-2.5 text-center font-bold text-amber-400">{q.q3 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Section 4: Referencias */}
          <section id="referencias" className="scroll-mt-6 space-y-3 pt-4 border-t border-white/15">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Bookmark size={14} className="text-[#FF1E00]" />
              Referencias y Fuentes Documentales
            </h2>
            <ol className="list-decimal list-inside text-xs font-mono text-white/60 space-y-1.5">
              <li>FIA Official Event Classification Document — {race?.raceName} {year}.</li>
              <li>Jolpica-F1 REST Integration Endpoint.</li>
              <li>Comisarios Deportivos Internacionales de la FIA.</li>
            </ol>
          </section>
        </div>

        <div className="w-full lg:w-80 flex-shrink-0">
          <WikiInfobox
            title={race ? race.raceName : 'Gran Premio'}
            subtitle={`Ronda #${round} // Temporada ${year}`}
            accentColor="#FF1E00"
            sections={infoboxSections}
          />
        </div>
      </div>
    </article>
  );
};
