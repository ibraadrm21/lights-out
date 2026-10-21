import React from 'react';
import { 
  MapPin, Flag, Trophy, Gauge, Activity, 
  RotateCw, Timer, CheckCircle2, Bookmark, Compass
} from 'lucide-react';
import { CircuitProfile, F1_DRIVERS_DATA, F1_CONSTRUCTORS_DATA } from '../../../data/f1EncyclopediaData';
import { CIRCUIT_VECTOR_PROFILES } from '../../../data/circuitProfiles';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiInfobox, InfoboxSection } from './WikiInfobox';
import { WikiTableOfContents, TOCItem } from './WikiTableOfContents';
import { WikiLink } from './WikiLink';
import { getCircuitVectorMap, getCircuitPhotosFromF1Fansite } from '../../../services/f1PhotoService';

interface CircuitWikiArticleProps {
  circuit: CircuitProfile;
}

export const CircuitWikiArticle: React.FC<CircuitWikiArticleProps> = ({ circuit }) => {
  const vectorProfile = circuit.vectorKey ? CIRCUIT_VECTOR_PROFILES[circuit.vectorKey] : null;
  const wikipediaVectorMap = getCircuitVectorMap(circuit.id);
  const f1FansitePhotos = getCircuitPhotosFromF1Fansite(circuit.id, 4);

  // Find linked winner driver & team if 2024 results are present
  const winnerDriverObj = circuit.sessionResults2024
    ? F1_DRIVERS_DATA.find(d => circuit.sessionResults2024?.winnerDriver.toLowerCase().includes(d.lastName.toLowerCase()))
    : undefined;
  
  const winnerTeamObj = circuit.sessionResults2024
    ? F1_CONSTRUCTORS_DATA.find(c => circuit.sessionResults2024?.winnerTeam.toLowerCase().includes(c.shortName.toLowerCase()))
    : undefined;

  const poleDriverObj = circuit.sessionResults2024
    ? F1_DRIVERS_DATA.find(d => circuit.sessionResults2024?.poleDriver.toLowerCase().includes(d.lastName.toLowerCase()))
    : undefined;

  const fastestLapDriverObj = circuit.sessionResults2024
    ? F1_DRIVERS_DATA.find(d => circuit.sessionResults2024?.fastestLapDriver.toLowerCase().includes(d.lastName.toLowerCase()))
    : undefined;

  const tocItems: TOCItem[] = [
    { id: 'perfil', label: '1. Ficha del Trazado y Localización' },
    { id: 'trazado', label: '2. Trazado y Geometría del Circuito (Wikipedia)' },
    { id: 'galeria-f1fansite', label: '3. Galería Fotográfica en Pista (F1-Fansite)' },
    { id: 'drs', label: '4. Zonas de Activación DRS' },
    { id: 'records', label: '5. Récords de Vuelta y Clasificación' },
    { id: 'exigencias', label: '6. Exigencias Técnicas del Monoplaza' },
    { id: 'resultados-2024', label: '7. Resultados del Gran Premio 2024' },
    { id: 'referencias', label: '8. Referencias y Fuentes Oficiales' },
  ];

  const infoboxSections: InfoboxSection[] = [
    {
      title: 'Datos del Circuito',
      rows: [
        { label: 'Nombre oficial', value: circuit.officialName },
        { label: 'Ubicación', value: `${circuit.city}, ${circuit.country} ${circuit.flag}` },
        { label: 'Ronda 2024', value: <span className="font-bold text-[#FF1E00]">Ronda {circuit.round} de 24</span> },
        { label: 'Longitud de pista', value: `${circuit.lengthKm} km` },
        { label: 'Vueltas de carrera', value: `${circuit.raceLaps} vueltas` },
        { label: 'Distancia de carrera', value: `${circuit.totalDistanceKm} km` },
        { label: 'Curvas totales', value: `${circuit.turnsCount} (${circuit.leftTurns} izq. / ${circuit.rightTurns} der.)` },
        { label: 'Sentido de giro', value: circuit.direction },
        { label: 'Zonas DRS', value: `${circuit.drsZonesCount} zonas reglamentarias` },
      ],
    },
    {
      title: 'Récord de Vuelta en Carrera',
      rows: [
        { label: 'Tiempo récord', value: <span className="font-mono font-bold text-amber-400">{circuit.lapRecord.time}</span> },
        { label: 'Piloto titular', value: circuit.lapRecord.driver },
        { label: 'Temporada / Coche', value: `${circuit.lapRecord.year} (${circuit.lapRecord.car})` },
      ],
    },
    ...(circuit.sessionResults2024 ? [{
      title: 'Resultados Gran Premio 2024',
      rows: [
        { 
          label: 'Vencedor', 
          value: winnerDriverObj ? (
            <WikiLink to={`/f1-real/pilotos/${winnerDriverObj.id}`}>{circuit.sessionResults2024.winnerDriver}</WikiLink>
          ) : circuit.sessionResults2024.winnerDriver,
        },
        { 
          label: 'Escudería ganadora', 
          value: winnerTeamObj ? (
            <WikiLink to={`/f1-real/escuderias/${winnerTeamObj.id}`}>{circuit.sessionResults2024.winnerTeam}</WikiLink>
          ) : circuit.sessionResults2024.winnerTeam,
        },
        { 
          label: 'Pole position', 
          value: poleDriverObj ? (
            <WikiLink to={`/f1-real/pilotos/${poleDriverObj.id}`}>{circuit.sessionResults2024.poleDriver}</WikiLink>
          ) : circuit.sessionResults2024.poleDriver,
        },
        { 
          label: 'Vuelta rápida', 
          value: fastestLapDriverObj ? (
            <WikiLink to={`/f1-real/pilotos/${fastestLapDriverObj.id}`}>{circuit.sessionResults2024.fastestLapDriver}</WikiLink>
          ) : circuit.sessionResults2024.fastestLapDriver,
        },
        { label: 'Margen al 2º', value: circuit.sessionResults2024.gapToSecond },
      ],
    }] : []),
  ];

  return (
    <article className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs
        items={[
          { label: 'Circuitos', to: '/f1-real/circuitos' },
          { label: circuit.circuitName },
        ]}
      />

      {/* Article Header */}
      <header className="border-b border-white/15 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold">
            ARTÍCULO ENCICLOPÉDICO // CIRCUITO DE FÓRMULA 1
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50">
            RONDA #{circuit.round} DEL CAMPEONATO MUNDIAL
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50">
            {circuit.country.toUpperCase()} {circuit.flag}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight text-white">
          {circuit.circuitName}
        </h1>

        <p className="text-xs font-mono text-white/60 mt-1">
          {circuit.officialName}. Sede del Gran Premio de {circuit.country} en {circuit.city}.
        </p>
      </header>

      {/* Main 2-Column Editorial Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Article Text & Tables */}
        <div className="flex-1 space-y-8 w-full min-w-0">
          {/* Lead Paragraph */}
          <section className="bg-white/[0.02] border-l-2 border-[#FF1E00] p-4 text-sm text-white/80 leading-relaxed font-sans">
            <p>
              El <strong className="text-white font-semibold">{circuit.circuitName}</strong>, denominado formalmente{' '}
              <strong className="text-white">{circuit.officialName}</strong>, es un autódromo internacional de carreras situado en{' '}
              <strong className="text-white">{circuit.city} ({circuit.country})</strong>. Constituye la ronda número <strong className="text-[#FF1E00]">#{circuit.round}</strong> del Campeonato Mundial de Fórmula 1 de la FIA.
              El trazado principal posee una cuerda oficial de <strong className="text-white">{circuit.lengthKm} kilómetros</strong>, disputándose a un total de <strong className="text-white">{circuit.raceLaps} vueltas</strong> para una distancia completa de Gran Premio de <strong className="text-white">{circuit.totalDistanceKm} km</strong>.
              El récord oficial de vuelta rápida en carrera pertenece a <strong className="text-white">{circuit.lapRecord.driver}</strong> con un crono de <strong className="text-white font-mono">{circuit.lapRecord.time}</strong> establecido en {circuit.lapRecord.year}.
            </p>
          </section>

          {/* Table of Contents */}
          <WikiTableOfContents items={tocItems} />

          {/* Section 1: Ficha del Trazado y Localización */}
          <section id="perfil" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <MapPin size={18} className="text-[#FF1E00]" />
              1. Ficha del Trazado y Localización
            </h2>
            <div className="text-sm text-white/70 space-y-2 leading-relaxed">
              <p>
                Localizado geográficamente en <strong className="text-white">{circuit.city}</strong>, el trazado alberga una de las citas destacadas del calendario de la Fórmula 1. 
                Su configuración técnica exige un compromiso riguroso entre la velocidad punta en rectas y la adherencia en curvas lentas y medias.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">Longitud</span>
                  <span className="text-sm font-semibold text-white">{circuit.lengthKm} km</span>
                </div>
                <div className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">Vueltas GP</span>
                  <span className="text-sm font-semibold text-white">{circuit.raceLaps}</span>
                </div>
                <div className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">Curvas</span>
                  <span className="text-sm font-semibold text-white">{circuit.turnsCount}</span>
                </div>
                <div className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">Zonas DRS</span>
                  <span className="text-sm font-semibold text-[#FF1E00]">{circuit.drsZonesCount}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Trazado y Geometría */}
          <section id="trazado" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Compass size={18} className="text-[#FF1E00]" />
              2. Trazado y Geometría del Circuito (Wikipedia)
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              La pista cuenta con un balance de <strong className="text-white">{circuit.leftTurns} giros a la izquierda</strong> y <strong className="text-white">{circuit.rightTurns} giros a la derecha</strong>, discurriendo {circuit.direction.toLowerCase()}.
            </p>

            {/* Official Wikipedia Vector Map */}
            <div className="bg-[#1b1b26] border border-white/10 p-4 rounded-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-white/60">
                <span className="uppercase text-[#FF1E00] font-bold">Mapa Vectorial Oficial (Wikipedia / Wikimedia Commons)</span>
                <span>{circuit.circuitName} ({circuit.lengthKm} km)</span>
              </div>
              <div className="w-full max-w-xl mx-auto bg-black/50 p-4 rounded-sm border border-white/10 flex items-center justify-center min-h-[220px]">
                <img
                  src={wikipediaVectorMap}
                  alt={`Trazado vectorial oficial de ${circuit.circuitName} de Wikipedia`}
                  className="max-h-72 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,30,0,0.3)] filter contrast-125"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] font-mono text-white/50 text-center">
                Trazado cartográfico vectorial oficial de Wikipedia / Wikimedia Commons.
              </p>
            </div>
          </section>

          {/* Section 3: Galería Fotográfica en Pista (F1-Fansite) */}
          <section id="galeria-f1fansite" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Activity size={18} className="text-[#FF1E00]" />
              3. Galería Fotográfica en Pista (F1-Fansite)
            </h2>
            <p className="text-sm text-white/70">
              Imágenes en directo y cobertura fotográfica de las sesiones disputadas en este circuito procedentes de la base de datos de <strong className="text-white">F1-Fansite</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {f1FansitePhotos.map((photoUrl, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 overflow-hidden group">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={photoUrl}
                      alt={`${circuit.circuitName} - F1-Fansite imagen ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-mono uppercase bg-black/70 px-2 py-0.5 text-white/80 border border-white/10">
                      F1-Fansite // Foto #{idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Zonas DRS */}
          <section id="drs" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Activity size={18} className="text-[#FF1E00]" />
              3. Zonas de Activación DRS
            </h2>
            <p className="text-sm text-white/70">
              Para favorecer las maniobras de adelantamiento, la FIA ha homologado un total de <strong className="text-white font-mono">{circuit.drsZonesCount} zonas de DRS</strong> en este trazado:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {circuit.drsZonesLocations.map((zone, idx) => (
                <div key={idx} className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm flex items-start gap-3">
                  <div className="bg-[#FF1E00]/15 border border-[#FF1E00]/30 text-[#FF1E00] font-mono font-bold text-xs px-2 py-0.5 mt-0.5">
                    DRS {idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">{zone}</span>
                    <span className="text-[10px] font-mono text-white/50">Activación reglamentaria con alerón trasero móvil</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Récords de Vuelta y Clasificación */}
          <section id="records" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Timer size={18} className="text-[#FF1E00]" />
              4. Récords Oficiales del Circuito
            </h2>
            <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-white/60">
                  <tr>
                    <th className="p-3">Categoría de Récord</th>
                    <th className="p-3">Tiempo</th>
                    <th className="p-3">Piloto</th>
                    <th className="p-3">Año / Monoplaza</th>
                    <th className="p-3">Contexto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-white">Récord de Carrera (Oficial)</td>
                    <td className="p-3 font-mono font-bold text-amber-400">{circuit.lapRecord.time}</td>
                    <td className="p-3">{circuit.lapRecord.driver}</td>
                    <td className="p-3 font-mono text-[11px]">{circuit.lapRecord.year} ({circuit.lapRecord.car})</td>
                    <td className="p-3 text-white/60 text-[11px]">{circuit.lapRecord.context}</td>
                  </tr>
                  {circuit.qualifyingRecord && (
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3 font-semibold text-white">Récord Absoluto / Clasificación</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{circuit.qualifyingRecord.time}</td>
                      <td className="p-3">{circuit.qualifyingRecord.driver}</td>
                      <td className="p-3 font-mono text-[11px]">{circuit.qualifyingRecord.year}</td>
                      <td className="p-3 text-white/60 text-[11px]">Vuelta de Pole Position en configuración de clasificación</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Exigencias Técnicas del Monoplaza */}
          <section id="exigencias" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Gauge size={18} className="text-[#FF1E00]" />
              5. Exigencias Técnicas del Monoplaza
            </h2>
            <p className="text-sm text-white/70">
              Evaluación técnica de parámetros clave calculados por los ingenieros para la configuración aerodinámica y mecánica:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm">
                <span className="text-[10px] font-mono uppercase text-white/50 block">Carga Aerodinámica</span>
                <span className="text-sm font-semibold text-white">{circuit.technicalCharacteristics.downforce}</span>
              </div>
              <div className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm">
                <span className="text-[10px] font-mono uppercase text-white/50 block">Estrés de Neumáticos</span>
                <span className="text-sm font-semibold text-white">{circuit.technicalCharacteristics.tireStress}</span>
              </div>
              <div className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm">
                <span className="text-[10px] font-mono uppercase text-white/50 block">Tracción Mecánica</span>
                <span className="text-sm font-semibold text-white">{circuit.technicalCharacteristics.traction}</span>
              </div>
              <div className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm">
                <span className="text-[10px] font-mono uppercase text-white/50 block">Severidad de Frenos</span>
                <span className="text-sm font-semibold text-white">{circuit.technicalCharacteristics.braking}</span>
              </div>
            </div>
          </section>

          {/* Section 6: Resultados Gran Premio 2024 */}
          <section id="resultados-2024" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Trophy size={18} className="text-[#FF1E00]" />
              6. Resultados del Gran Premio 2024
            </h2>
            {circuit.sessionResults2024 ? (
              <div className="bg-[#1b1b26] border border-white/10 p-4 rounded-sm space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-mono uppercase text-white/50">Estado de la Prueba:</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40">
                    DISPUTADO Y FINALIZADO
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-white/40 block font-mono text-[10px] uppercase">Vencedor de la Carrera</span>
                    <span className="font-semibold text-white text-sm">
                      {winnerDriverObj ? (
                        <WikiLink to={`/f1-real/pilotos/${winnerDriverObj.id}`}>{circuit.sessionResults2024.winnerDriver}</WikiLink>
                      ) : circuit.sessionResults2024.winnerDriver}
                    </span>
                    <span className="text-[10px] text-white/50 block font-mono">
                      {winnerTeamObj ? (
                        <WikiLink to={`/f1-real/escuderias/${winnerTeamObj.id}`}>{circuit.sessionResults2024.winnerTeam}</WikiLink>
                      ) : circuit.sessionResults2024.winnerTeam}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block font-mono text-[10px] uppercase">Pole Position</span>
                    <span className="font-semibold text-white text-sm">
                      {poleDriverObj ? (
                        <WikiLink to={`/f1-real/pilotos/${poleDriverObj.id}`}>{circuit.sessionResults2024.poleDriver}</WikiLink>
                      ) : circuit.sessionResults2024.poleDriver}
                    </span>
                    <span className="text-[10px] text-white/50 block font-mono">Clasificación sábado</span>
                  </div>
                  <div>
                    <span className="text-white/40 block font-mono text-[10px] uppercase">Vuelta Rápida</span>
                    <span className="font-semibold text-white text-sm">
                      {fastestLapDriverObj ? (
                        <WikiLink to={`/f1-real/pilotos/${fastestLapDriverObj.id}`}>{circuit.sessionResults2024.fastestLapDriver}</WikiLink>
                      ) : circuit.sessionResults2024.fastestLapDriver}
                    </span>
                    <span className="text-[10px] text-white/50 block font-mono">Punto extra reglamentario</span>
                  </div>
                  <div>
                    <span className="text-white/40 block font-mono text-[10px] uppercase">Margen de Victoria</span>
                    <span className="font-semibold text-white text-sm font-mono text-[#FF1E00]">
                      {circuit.sessionResults2024.gapToSecond}
                    </span>
                    <span className="text-[10px] text-white/50 block font-mono">Frente al 2º clasificado</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1b1b26] border border-white/10 p-4 rounded-sm text-xs text-white/60 font-mono">
                La sesión de carrera aún no ha comenzado o se encuentra programada dentro del calendario de la temporada 2024.
              </div>
            )}
          </section>

          {/* Section 7: Referencias */}
          <section id="referencias" className="scroll-mt-6 space-y-3 pt-4 border-t border-white/15">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Bookmark size={14} className="text-[#FF1E00]" />
              Referencias y Fuentes Oficiales
            </h2>
            <ol className="list-decimal list-inside text-xs font-mono text-white/60 space-y-1.5">
              <li>
                FIA Formula One Sporting Regulations & Circuit Grade 1 Homologation Documents 2024.
              </li>
              <li>
                Formula 1 Official Media Information & Event Timing Data ({circuit.country} Grand Prix).
              </li>
              <li>
                Pirelli Motorsport Technical Event Previews & Compound Selection Guidelines 2024.
              </li>
            </ol>
          </section>

          {/* Categories Footer */}
          <footer className="border-t border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-white/40 uppercase">Categorías:</span>
              <WikiLink to="/f1-real/circuitos">Circuitos de Fórmula 1</WikiLink>
              <span className="text-white/20">•</span>
              <span className="text-white/60">Grandes Premios 2024</span>
              <span className="text-white/20">•</span>
              <span className="text-white/60">Circuitos Grado 1 FIA</span>
              <span className="text-white/20">•</span>
              <span className="text-white/60">{circuit.country}</span>
            </div>
          </footer>
        </div>

        {/* Right Column: Encylopedia Infobox */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <WikiInfobox
            title={circuit.circuitName}
            subtitle={circuit.officialName}
            accentColor="#FF1E00"
            badge={`RONDA #${circuit.round}`}
            image={{
              src: wikipediaVectorMap,
              alt: `Trazado vectorial oficial de ${circuit.circuitName}`,
              caption: `Mapa vectorial del trazado (Wikipedia / Wikimedia Commons)`,
              attribution: 'Wikipedia / FIA Official',
            }}
            sections={infoboxSections}
          />
        </div>
      </div>
    </article>
  );
};
