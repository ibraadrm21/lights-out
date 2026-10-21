import React from 'react';
import { 
  Gauge, Wrench, Shield, Check, Bookmark, 
  ExternalLink, Layers 
} from 'lucide-react';
import { 
  CarProfile, getConstructorById, getDriversByTeam 
} from '../../../data/f1EncyclopediaData';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiInfobox, InfoboxSection } from './WikiInfobox';
import { WikiTableOfContents, TOCItem } from './WikiTableOfContents';
import { WikiLink } from './WikiLink';

interface CarWikiArticleProps {
  car: CarProfile;
}

export const CarWikiArticle: React.FC<CarWikiArticleProps> = ({ car }) => {
  const team = getConstructorById(car.teamId);
  const drivers = getDriversByTeam(car.teamId);

  const tocItems: TOCItem[] = [
    { id: 'concepto', label: 'Concepto y Filosofía de Diseño' },
    { id: 'unidad-potencia', label: 'Unidad de Potencia y Transmisión' },
    { id: 'especificaciones', label: 'Especificaciones Técnicas Verificadas' },
    { id: 'suspension', label: 'Geometría y Cinemática de Suspensión' },
    { id: 'aerodinamica', label: 'Innovaciones Aerodinámicas Confirmadas' },
    { id: 'reglamento', label: 'Reglamento Técnico FIA Aplicable' },
    { id: 'referencias', label: 'Referencias y Homologación' },
  ];

  const infoboxSections: InfoboxSection[] = [
    {
      title: 'Datos del Monoplaza',
      rows: [
        { label: 'Denominación oficial', value: car.name },
        { 
          label: 'Escudería', 
          value: team ? <WikiLink to={`/f1-real/escuderias/${team.id}`}>{car.teamName}</WikiLink> : car.teamName 
        },
        { label: 'Temporada', value: `Campeonato Mundial ${car.season}` },
        { 
          label: 'Pilotos titulares', 
          value: (
            <div className="space-y-1">
              {drivers.map(d => (
                <div key={d.id}>
                  <WikiLink to={`/f1-real/pilotos/${d.id}`}>
                    #{d.number} {d.fullName}
                  </WikiLink>
                </div>
              ))}
            </div>
          ) 
        },
      ],
    },
    {
      title: 'Chasis y Dimensiones',
      rows: [
        { label: 'Estructura monocasco', value: car.chassis.split('desarrollado')[0] },
        { label: 'Peso mínimo reglamentario', value: `${car.weightKg} kg (sin combustible)` },
        { label: 'Anchura máxima', value: `${car.dimensions.overallWidthMm} mm` },
        { label: 'Altura máxima', value: `${car.dimensions.overallHeightMm} mm` },
        { label: 'Batalla máxima', value: `${car.dimensions.wheelbaseMm} mm` },
        { label: 'Ruedas y llantas', value: '18" BBS magnesio forjado con tapacubos' },
        { label: 'Neumáticos', value: 'Pirelli P-Zero (C1 a C5, Inter, Wet)' },
      ],
    },
    {
      title: 'Planta Motriz y Mecánica',
      rows: [
        { label: 'Motor térmico', value: car.engineLayout },
        { label: 'Denominación motor', value: <span className="font-bold text-cyan-400">{car.powerUnit}</span> },
        { label: 'Suministrador motor', value: car.powerUnitSupplier },
        { label: 'Transmisión', value: car.transmission },
        { label: 'Suspensión delantera', value: car.suspension.front.split(' ')[0] },
        { label: 'Suspensión trasera', value: car.suspension.rear.split(' ')[0] },
      ],
    },
  ];

  return (
    <article className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs
        items={[
          { label: 'Monoplazas', to: '/f1-real/monoplazas' },
          { label: car.name },
        ]}
      />

      {/* Header */}
      <header className="border-b border-white/15 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold">
            ARTÍCULO TÉCNICO // MONOPLAZA OFICIAL
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50">
            Temporada {car.season} FIA
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight text-white">
          {car.name}
        </h1>

        <p className="text-xs font-mono text-white/60 mt-1">
          Monoplaza de Fórmula 1 diseñado y homologado para la escudería{' '}
          {team ? <WikiLink to={`/f1-real/escuderias/${team.id}`}>{car.teamName}</WikiLink> : car.teamName}.
        </p>
      </header>

      {/* 2-Column Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Text Content */}
        <div className="flex-1 space-y-8 w-full min-w-0">
          {/* Lead Paragraph */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm font-sans leading-relaxed text-white/80 border-b border-white/10 pb-6">
            <p>
              El <strong className="text-white font-bold">{car.name}</strong> es el monoplaza de carreras de Fórmula 1 con el que la escudería{' '}
              {team ? <WikiLink to={`/f1-real/escuderias/${team.id}`}>{car.teamName}</WikiLink> : car.teamName} disputa el Campeonato Mundial de Fórmula 1 {car.season}. El vehículo cumple con la normativa técnica de efecto suelo (*ground effect*) de la FIA y monta la unidad de potencia <strong className="text-cyan-400 font-bold">{car.powerUnit}</strong> suministrada por {car.powerUnitSupplier}.
            </p>
            <p className="mt-3">
              Ha sido pilotado a lo largo del año por{' '}
              {drivers.map((d, idx) => (
                <span key={d.id}>
                  {idx > 0 && ' y '}
                  <WikiLink to={`/f1-real/pilotos/${d.id}`}>{d.fullName} (#{d.number})</WikiLink>
                </span>
              ))}.
            </p>
          </div>

          {/* Table of Contents */}
          <WikiTableOfContents items={tocItems} />

          {/* Section 1: Concepto */}
          <section id="concepto" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              1. Concepto y Filosofía de Diseño
            </h2>
            <div className="text-xs font-mono text-white/70 space-y-2 leading-relaxed">
              <p>
                {car.chassis}. La arquitectura aerodinámica del vehículo se centra en maximizar el caudal de aire hacia los túneles Venturi inferiores manteniendo una plataforma mecánica rígida y estable frente a las variaciones de cabeceo (*pitch*) y balanceo (*roll*).
              </p>
            </div>
          </section>

          {/* Section 2: Unidad de Potencia */}
          <section id="unidad-potencia" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              2. Unidad de Potencia y Transmisión
            </h2>
            <div className="p-4 bg-[#1b1b26] border border-white/10 space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 uppercase block">PROPULSIÓN HÍBRIDA HOMOLOGADA</span>
                <span className="text-sm font-bold text-cyan-400">{car.powerUnit}</span>
                <span className="text-white/60 block text-[11px]">{car.engineLayout}</span>
              </div>
              <div className="pt-2 border-t border-white/10 space-y-1">
                <span className="text-[10px] text-white/40 uppercase block">CAJA DE CAMBIOS Y TRANSMISIÓN</span>
                <p className="text-white/70 text-[11px] leading-relaxed">{car.transmission}</p>
              </div>
            </div>
          </section>

          {/* Section 3: Especificaciones */}
          <section id="especificaciones" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              3. Especificaciones Técnicas Verificadas
            </h2>
            <div className="overflow-x-auto border border-white/15 bg-[#1b1b26]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="bg-[#242433] text-[10px] uppercase text-white/70 tracking-wider border-b border-white/15">
                  <tr>
                    <th className="py-2.5 px-3">Parámetro</th>
                    <th className="py-2.5 px-3">Valor Homologado</th>
                    <th className="py-2.5 px-3">Regulación FIA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white/80">
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Peso mínimo</td>
                    <td className="py-2 px-3 font-bold text-white">{car.weightKg} kg</td>
                    <td className="py-2 px-3 text-white/50">Límite absoluto sin carburante (Art. 4)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Anchura total</td>
                    <td className="py-2 px-3 font-bold text-white">{car.dimensions.overallWidthMm} mm</td>
                    <td className="py-2 px-3 text-white/50">Anchura máxima exterior</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Altura máxima</td>
                    <td className="py-2 px-3 font-bold text-white">{car.dimensions.overallHeightMm} mm</td>
                    <td className="py-2 px-3 text-white/50">Medida sobre el plano de referencia</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Distancia entre ejes</td>
                    <td className="py-2 px-3 font-bold text-white">{car.dimensions.wheelbaseMm} mm</td>
                    <td className="py-2 px-3 text-white/50">Batalla máxima reglamentaria</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 text-white/60">Carburante</td>
                    <td className="py-2 px-3 font-bold text-emerald-400">E10 Sostenible</td>
                    <td className="py-2 px-3 text-white/50">10% Bioetanol avanzado de 2ª generación</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Suspensión */}
          <section id="suspension" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              4. Geometría y Cinemática de Suspensión
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-[#1b1b26] border border-white/10 space-y-1.5">
                <span className="text-[10px] text-[#FF1E00] uppercase font-bold block">TREN DELANTERO</span>
                <p className="text-white/80 leading-relaxed">{car.suspension.front}</p>
              </div>
              <div className="p-4 bg-[#1b1b26] border border-white/10 space-y-1.5">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block">TREN TRASERO</span>
                <p className="text-white/80 leading-relaxed">{car.suspension.rear}</p>
              </div>
            </div>
          </section>

          {/* Section 5: Aerodinámica */}
          <section id="aerodinamica" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              5. Innovaciones Aerodinámicas Confirmadas
            </h2>
            <div className="p-4 bg-[#1b1b26] border border-white/10 space-y-3 text-xs font-mono">
              <p className="text-white/80 leading-relaxed">
                {car.aeroHighlights}
              </p>
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <span className="text-[10px] text-white/40 uppercase block font-bold">SOLUCIONES TÉCNICAS CONFIRMADAS:</span>
                <ul className="space-y-1.5">
                  {car.technicalInnovations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-white/70">
                      <span className="text-[#FF1E00] font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6: Reglamento */}
          <section id="reglamento" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              6. Reglamento Técnico FIA Aplicable
            </h2>
            <ul className="list-disc list-inside text-xs font-mono text-white/70 space-y-1">
              {car.verifiedRegulations.map((reg, idx) => (
                <li key={idx}>{reg}</li>
              ))}
            </ul>
          </section>

          {/* Section 7: Referencias */}
          <section id="referencias" className="space-y-3 pt-4 border-t border-white/10">
            <h2 className="text-sm font-bold font-syne uppercase tracking-wider text-white">
              7. Referencias y Homologación
            </h2>
            <ol className="list-decimal list-inside text-[11px] font-mono text-white/50 space-y-1">
              <li>{car.verificationSource}</li>
              <li>Fiche d'Homologation Technique FIA {car.name} ({car.season}).</li>
            </ol>
          </section>

          {/* Categories Bar */}
          <div className="p-3 bg-[#181822] border border-white/10 text-xs font-mono flex flex-wrap items-center gap-2">
            <span className="text-white/40 font-bold flex items-center gap-1 uppercase text-[10px]">
              <Bookmark size={11} className="text-[#FF1E00]" /> CATEGORÍAS:
            </span>
            <WikiLink to="/f1-real/monoplazas" className="text-white/70 hover:text-white">Monoplazas de Fórmula 1 de {car.season}</WikiLink>
            <span className="text-white/20">|</span>
            {team && (
              <>
                <WikiLink to={`/f1-real/escuderias/${team.id}`} className="text-white/70 hover:text-white">
                  Monoplazas de {team.shortName}
                </WikiLink>
                <span className="text-white/20">|</span>
              </>
            )}
            <span className="text-white/70">Coches de efecto suelo (Ground Effect)</span>
          </div>
        </div>

        {/* Infobox */}
        <WikiInfobox
          title={car.name}
          subtitle={`Temporada ${car.season}`}
          accentColor={team?.primaryColor || '#FF1E00'}
          badge="HOMOLOGADO FIA"
          sections={infoboxSections}
        />
      </div>
    </article>
  );
};
