import React from 'react';
import { 
  Trophy, Flag, Shield, Wrench, User, Calendar, 
  ExternalLink, ArrowLeftRight, CheckCircle2, Bookmark 
} from 'lucide-react';
import { 
  DriverProfile, getConstructorById, getCarById, 
  getTechnicalStaffById, getDriverById, F1_TEAMMATE_DUELS 
} from '../../../data/f1EncyclopediaData';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiInfobox, InfoboxSection } from './WikiInfobox';
import { WikiTableOfContents, TOCItem } from './WikiTableOfContents';
import { WikiLink } from './WikiLink';
import { getDriverWikipediaPhoto } from '../../../services/f1PhotoService';

interface DriverWikiArticleProps {
  driver: DriverProfile;
}

export const DriverWikiArticle: React.FC<DriverWikiArticleProps> = ({ driver }) => {
  const team = getConstructorById(driver.teamId);
  const teammate = getDriverById(driver.teammateId);
  const car = getCarById(driver.carId);
  const raceEngineer = getTechnicalStaffById(driver.raceEngineerId);
  const duel = F1_TEAMMATE_DUELS.find(d => d.teamId === driver.teamId);
  const wikipediaPhoto = getDriverWikipediaPhoto(driver.id) || driver.headshotUrl;

  const tocItems: TOCItem[] = [
    { id: 'perfil', label: 'Perfil y Datos Biográficos' },
    { id: 'temporada-2024', label: 'Temporada Actual (2024)' },
    { id: 'estadisticas', label: 'Estadísticas Oficiales' },
    { id: 'resultados-gp', label: 'Historial en Grandes Premios 2024' },
    { id: 'companero-equipo', label: 'Compañero de Equipo y Duelo Interno' },
    { id: 'relacionados', label: 'Monoplaza y Personal Asociado' },
    { id: 'referencias', label: 'Referencias y Fuentes Oficiales' },
  ];

  const infoboxSections: InfoboxSection[] = [
    {
      title: 'Datos Personales',
      rows: [
        { label: 'Nombre completo', value: driver.fullName },
        { label: 'Nacimiento', value: `${driver.birthDate} (${driver.age} años)` },
        { label: 'Lugar de nacimiento', value: driver.birthPlace },
        { label: 'Nacionalidad', value: `${driver.flag} ${driver.country}` },
      ],
    },
    {
      title: 'Carrera en Fórmula 1',
      rows: [
        { label: 'Dorsal de competición', value: <span className="text-[#FF1E00] font-black text-sm">#{driver.number}</span> },
        { label: 'Acrónimo oficial', value: <span className="bg-white/10 px-1.5 py-0.5 font-bold">{driver.acronym}</span> },
        { 
          label: 'Escudería actual', 
          value: team ? <WikiLink to={`/f1-real/escuderias/${team.id}`}>{driver.teamName}</WikiLink> : driver.teamName 
        },
        { 
          label: 'Monoplaza 2024', 
          value: car ? <WikiLink to={`/f1-real/monoplazas/${car.id}`}>{car.name}</WikiLink> : 'No documentado' 
        },
        { 
          label: 'Ingeniero de carrera', 
          value: raceEngineer ? (
            <WikiLink to={`/f1-real/personal/${raceEngineer.id}`}>{driver.raceEngineerName}</WikiLink>
          ) : driver.raceEngineerName 
        },
        { 
          label: 'Compañero de equipo', 
          value: teammate ? <WikiLink to={`/f1-real/pilotos/${teammate.id}`}>{teammate.fullName} #{teammate.number}</WikiLink> : 'N/A' 
        },
        { label: 'Debut en F1', value: `Temporada ${driver.careerSummary.firstEntryYear}` },
      ],
    },
    {
      title: 'Campeonato Mundial 2024',
      rows: [
        { 
          label: 'Posición mundial', 
          value: <span className="font-bold text-[#FF1E00]">P{driver.championshipPosition} ({driver.points} pts)</span> 
        },
        { label: 'Victorias 2024', value: driver.seasonStats.wins },
        { label: 'Podios 2024', value: driver.seasonStats.podiums },
        { label: 'Pole positions', value: driver.seasonStats.poles },
        { label: 'Vueltas rápidas', value: driver.seasonStats.fastestLaps },
        { label: 'Mejor resultado', value: `${driver.seasonStats.bestFinish} (${driver.seasonStats.bestFinishRace})` },
      ],
    },
    {
      title: 'Palmarés Histórico',
      rows: [
        { 
          label: 'Títulos Mundiales', 
          value: driver.careerSummary.worldChampionships > 0 ? (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Trophy size={12} /> {driver.careerSummary.worldChampionships} ({driver.careerSummary.worldChampionships === 1 ? 'Campeón' : 'Campeonatos'})
            </span>
          ) : '0' 
        },
        { label: 'Victorias totales', value: driver.careerSummary.careerWins },
        { label: 'Podios totales', value: driver.careerSummary.careerPodiums },
        { label: 'Poles totales', value: driver.careerSummary.careerPoles },
      ],
    },
  ];

  return (
    <article className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs
        items={[
          { label: 'Pilotos', to: '/f1-real/pilotos' },
          { label: driver.fullName },
        ]}
      />

      {/* Article Title Header */}
      <header className="border-b border-white/15 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold">
            ARTÍCULO ENCICLOPÉDICO // TEMPORADA ACTUAL
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50">
            Última revisión: {driver.verifiedDate}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight text-white">
          {driver.fullName}
        </h1>

        <p className="text-xs font-mono text-white/60 mt-1">
          Piloto oficial de Fórmula 1 de la escudería {team ? (
            <WikiLink to={`/f1-real/escuderias/${team.id}`}>{driver.teamName}</WikiLink>
          ) : driver.teamName} con el dorsal #{driver.number}.
        </p>
      </header>

      {/* Main 2-Column Editorial Grid (Wikipedia Article + Infobox) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Article Text & Tables */}
        <div className="flex-1 space-y-8 w-full min-w-0">
          {/* Lead Paragraph (Wikipedia Style) */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm font-sans leading-relaxed text-white/80 border-b border-white/10 pb-6">
            <p>
              <strong className="text-white font-bold">{driver.fullName}</strong> ({driver.birthPlace}, {driver.birthDate}) es un piloto de carreras automovilísticas {driver.country === 'España' ? 'español' : driver.country === 'México' ? 'mexicano' : driver.country === 'Argentina' ? 'argentino' : driver.country === 'Mónaco' ? 'monegasco' : driver.country === 'Reino Unido' ? 'británico' : `de nacionalidad ${driver.country.toLowerCase()}`} que compite en el Campeonato Mundial de Fórmula 1 de la FIA con la escudería{' '}
              {team ? <WikiLink to={`/f1-real/escuderias/${team.id}`}>{driver.teamName}</WikiLink> : driver.teamName}, pilotando el monoplaza{' '}
              {car ? <WikiLink to={`/f1-real/monoplazas/${car.id}`}>{car.name}</WikiLink> : 'de la temporada 2024'}. Lleva el dorsal oficial <strong className="text-white">#{driver.number}</strong> y su ingeniero de carrera verificado por radio es{' '}
              {raceEngineer ? <WikiLink to={`/f1-real/personal/${raceEngineer.id}`}>{driver.raceEngineerName}</WikiLink> : driver.raceEngineerName}.
            </p>
            <p className="mt-3">
              En la temporada actual ocupa la <strong className="text-white">posición {driver.championshipPosition}ª</strong> del Mundial de Pilotos con un balance acumulado de <strong className="text-white">{driver.points} puntos</strong>, habiendo sumado {driver.seasonStats.wins} victoria{driver.seasonStats.wins === 1 ? '' : 's'} y {driver.seasonStats.podiums} podio{driver.seasonStats.podiums === 1 ? '' : 's'}. Su compañero de garaje en el equipo es {teammate ? <WikiLink to={`/f1-real/pilotos/${teammate.id}`}>{teammate.fullName}</WikiLink> : 'N/A'}.
            </p>
          </div>

          {/* Table of Contents */}
          <WikiTableOfContents items={tocItems} />

          {/* Section 1: Perfil */}
          <section id="perfil" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1 flex items-center justify-between">
              <span>1. Perfil y Datos Biográficos</span>
              <span className="text-[10px] font-mono font-normal text-white/40">DORSAL #{driver.number}</span>
            </h2>
            <div className="text-xs font-mono text-white/70 space-y-2 leading-relaxed">
              <p>
                Nacido el {driver.birthDate} en {driver.birthPlace}, compite bajo bandera de {driver.country} ({driver.countryCode}). Realizó su debut oficial en la categoría en el año {driver.careerSummary.firstEntryYear}. A lo largo de su trayectoria acumula {driver.careerSummary.careerWins} victorias en Grandes Premios, {driver.careerSummary.careerPodiums} podios y {driver.careerSummary.careerPoles} pole positions, con {driver.careerSummary.worldChampionships} campeonato{driver.careerSummary.worldChampionships === 1 ? '' : 's'} del mundo.
              </p>
            </div>
          </section>

          {/* Section 2: Temporada 2024 */}
          <section id="temporada-2024" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1 flex items-center justify-between">
              <span>2. Temporada Actual (2024)</span>
              <span className="text-[10px] font-mono font-normal text-[#FF1E00]">P{driver.championshipPosition} • {driver.points} PTS</span>
            </h2>
            <p className="text-xs font-mono text-white/70 leading-relaxed">
              Durante el presente campeonato de 24 citas mundiales, {driver.fullName} ha participado a bordo del {car?.name || 'monoplaza de la escudería'}, logrando como mejor resultado de carrera un {driver.seasonStats.bestFinish} en el {driver.seasonStats.bestFinishRace}. Ha completado un total de {driver.seasonStats.lapsLed} vueltas en cabeza de carrera y ha puntuado en {driver.seasonStats.pointsFinishes} Grandes Premios.
            </p>
          </section>

          {/* Section 3: Estadísticas Oficiales */}
          <section id="estadisticas" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              3. Estadísticas Oficiales
            </h2>

            {/* Wikipedia-styled statistics table */}
            <div className="overflow-x-auto border border-white/15 bg-[#1b1b26]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="bg-[#242433] text-[10px] uppercase text-white/70 tracking-wider border-b border-white/15">
                  <tr>
                    <th className="py-2.5 px-3">Métrica</th>
                    <th className="py-2.5 px-3 text-center">Temporada 2024</th>
                    <th className="py-2.5 px-3 text-center">Total Carrera F1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white/80">
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Victorias en Grandes Premios</td>
                    <td className="py-2 px-3 text-center font-bold text-[#FF1E00]">{driver.seasonStats.wins}</td>
                    <td className="py-2 px-3 text-center font-bold">{driver.careerSummary.careerWins}</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Podios obtenidos</td>
                    <td className="py-2 px-3 text-center font-bold text-white">{driver.seasonStats.podiums}</td>
                    <td className="py-2 px-3 text-center font-bold">{driver.careerSummary.careerPodiums}</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Pole Positions</td>
                    <td className="py-2 px-3 text-center font-bold text-amber-400">{driver.seasonStats.poles}</td>
                    <td className="py-2 px-3 text-center font-bold">{driver.careerSummary.careerPoles}</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Vueltas Rápidas</td>
                    <td className="py-2 px-3 text-center text-cyan-400 font-bold">{driver.seasonStats.fastestLaps}</td>
                    <td className="py-2 px-3 text-center text-white/60">-</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Grandes Premios en zona de puntos</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-400">{driver.seasonStats.pointsFinishes}</td>
                    <td className="py-2 px-3 text-center text-white/60">-</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Abandonos (DNF)</td>
                    <td className="py-2 px-3 text-center font-bold text-red-400">{driver.seasonStats.dnfs}</td>
                    <td className="py-2 px-3 text-center text-white/60">-</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Títulos de Campeón del Mundo</td>
                    <td className="py-2 px-3 text-center text-white/60">-</td>
                    <td className="py-2 px-3 text-center font-black text-amber-400">{driver.careerSummary.worldChampionships}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Historial en Grandes Premios 2024 */}
          <section id="resultados-gp" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              4. Historial en Grandes Premios 2024
            </h2>

            {driver.grandPrixHistory.length > 0 ? (
              <div className="overflow-x-auto border border-white/15 bg-[#1b1b26]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead className="bg-[#242433] text-[10px] uppercase text-white/70 tracking-wider border-b border-white/15">
                    <tr>
                      <th className="py-2 px-3">Rnd</th>
                      <th className="py-2 px-3">Gran Premio</th>
                      <th className="py-2 px-3">Circuito</th>
                      <th className="py-2 px-3 text-center">Parrilla</th>
                      <th className="py-2 px-3 text-center">Carrera</th>
                      <th className="py-2 px-3 text-right">Puntos</th>
                      <th className="py-2 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-white/80">
                    {driver.grandPrixHistory.map((gp) => (
                      <tr key={gp.round} className="hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3 text-white/50">{gp.round}</td>
                        <td className="py-2 px-3 font-bold text-white">{gp.gpName}</td>
                        <td className="py-2 px-3 text-white/60">{gp.circuit}</td>
                        <td className="py-2 px-3 text-center text-white/70">P{gp.grid}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold ${
                            gp.finish === 1 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : gp.finish === 'DNF' 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-white/10 text-white'
                          }`}>
                            {gp.finish === 'DNF' ? 'Ret' : `P${gp.finish}`}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#FF1E00]">
                          +{gp.points}
                        </td>
                        <td className="py-2 px-3 text-center text-[10px] text-white/50">
                          {gp.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs font-mono text-white/50 italic">
                No hay resultados desglosados adicionales documentados para esta ficha.
              </p>
            )}
          </section>

          {/* Section 5: Compañero de Equipo */}
          <section id="companero-equipo" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              5. Compañero de Equipo y Duelo Interno
            </h2>

            {teammate && (
              <div className="p-4 bg-[#1b1b26] border border-white/10 space-y-3 text-xs font-mono">
                <p className="text-white/80 leading-relaxed">
                  En la estructura de {team?.shortName || driver.teamName}, el compañero de equipo titular es{' '}
                  <WikiLink to={`/f1-real/pilotos/${teammate.id}`}>
                    {teammate.fullName} (#{teammate.number})
                  </WikiLink>.
                </p>

                {duel && (
                  <div className="p-3 bg-black/40 border border-white/10 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-white/50 block">
                      BALANCE DE CLASIFICACIÓN Y CARRERA 2024:
                    </span>
                    <p className="text-white/70 text-[11px] leading-relaxed">
                      {duel.analysis}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Section 6: Monoplaza y Personal */}
          <section id="relacionados" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              6. Monoplaza y Personal Asociado
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {car && (
                <div className="p-3 bg-[#1b1b26] border border-white/10">
                  <span className="text-[10px] text-white/40 uppercase block">MONOPLAZA HOMOLOGADO</span>
                  <WikiLink to={`/f1-real/monoplazas/${car.id}`} className="font-bold text-sm block mt-0.5">
                    {car.name}
                  </WikiLink>
                  <span className="text-[10px] text-white/50 block mt-1">{car.powerUnit}</span>
                </div>
              )}

              {raceEngineer && (
                <div className="p-3 bg-[#1b1b26] border border-white/10">
                  <span className="text-[10px] text-white/40 uppercase block">INGENIERO DE PISTA / RADIO</span>
                  <WikiLink to={`/f1-real/personal/${raceEngineer.id}`} className="font-bold text-sm block mt-0.5">
                    {raceEngineer.name}
                  </WikiLink>
                  <span className="text-[10px] text-white/50 block mt-1">{raceEngineer.roleTitle}</span>
                </div>
              )}
            </div>
          </section>

          {/* Section 7: Referencias y Fuentes */}
          <section id="referencias" className="space-y-3 pt-4 border-t border-white/10">
            <h2 className="text-sm font-bold font-syne uppercase tracking-wider text-white">
              7. Referencias y Fuentes Oficiales
            </h2>
            <ol className="list-decimal list-inside text-[11px] font-mono text-white/50 space-y-1">
              <li>
                FIA Formula One World Championship 2024 Official Driver Standings. Fédération Internationale de l'Automobile.
              </li>
              <li>
                OpenF1 Real-time Telemetry Service & Drivers Registry. Consultado: {driver.verifiedDate}.
              </li>
              <li>
                Dossier técnico y alineación oficial de {driver.teamName}.
              </li>
            </ol>
          </section>

          {/* Category Footer Bar (Wikipedia Style) */}
          <div className="p-3 bg-[#181822] border border-white/10 text-xs font-mono flex flex-wrap items-center gap-2">
            <span className="text-white/40 font-bold flex items-center gap-1 uppercase text-[10px]">
              <Bookmark size={11} className="text-[#FF1E00]" /> CATEGORÍAS:
            </span>
            <WikiLink to="/f1-real/pilotos" className="text-white/70 hover:text-white">Pilotos de Fórmula 1 en activo</WikiLink>
            <span className="text-white/20">|</span>
            {team && (
              <>
                <WikiLink to={`/f1-real/escuderias/${team.id}`} className="text-white/70 hover:text-white">
                  Pilotos de {team.shortName}
                </WikiLink>
                <span className="text-white/20">|</span>
              </>
            )}
            <span className="text-white/70">Temporada 2024 de Fórmula 1</span>
            {driver.careerSummary.worldChampionships > 0 && (
              <>
                <span className="text-white/20">|</span>
                <span className="text-amber-400">Campeones del Mundo de F1</span>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Wikipedia / Fandom Infobox */}
        <WikiInfobox
          title={driver.fullName}
          subtitle={`#${driver.number} • ${driver.acronym}`}
          accentColor={driver.teamColour}
          badge={`P${driver.championshipPosition} MUNDIAL`}
          image={{
            src: wikipediaPhoto,
            alt: `Fotografía oficial enciclopédica de ${driver.fullName}`,
            caption: `${driver.fullName} — Perfil oficial en Wikipedia`,
            attribution: 'Wikipedia / Wikimedia Commons',
          }}
          sections={infoboxSections}
        />
      </div>
    </article>
  );
};
