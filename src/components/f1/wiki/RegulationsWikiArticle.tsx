import React, { useState } from 'react';
import { 
  FileText, Shield, Scale, AlertTriangle, CheckCircle2, 
  ExternalLink, Bookmark, Info, ChevronRight, Search, FileCheck
} from 'lucide-react';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiInfobox, InfoboxSection } from './WikiInfobox';
import { WikiTableOfContents, TOCItem } from './WikiTableOfContents';
import { WikiLink } from './WikiLink';

interface RegulationTopicItem {
  id: string;
  title: string;
  category: 'sporting' | 'technical' | 'financial';
  applicableYear: number;
  summary: string;
  details: string;
  fiaDocumentRef: string;
  officialUrl: string;
  penaltySummary: string;
}

interface StewardDecisionItem {
  id: string;
  season: number;
  grandPrix: string;
  documentNumber: number;
  issueTimestamp: string;
  session: string;
  carNumber: number;
  driverName: string;
  teamName: string;
  incidentDescription: string;
  regulatoryArticle: string;
  decision: string;
  officialDocumentUrl: string;
}

// Verified FIA Sporting & Technical Regulations Archive
const REGULATION_TOPICS: RegulationTopicItem[] = [
  {
    id: 'parc-ferme',
    title: 'Régimen de Parque Cerrado (Parc Fermé)',
    category: 'sporting',
    applicableYear: 2024,
    summary: 'Restricciones operativas sobre el monoplaza aplicadas desde el inicio de la sesión de clasificación hasta el inicio de la carrera.',
    details: 'Bajo el Artículo 40 del Reglamento Deportivo de la FIA, ningún monoplaza puede ser alterado mecánicamente una vez que abandona el pit lane en Q1. Solo se permiten operaciones de mantenimiento rutinario (sangrado de frenos, adición de combustible, cambio de neumáticos con la misma especificación, limpieza de radiadores). Cualquier modificación a la puesta a punto de suspensión o mapeo del motor obliga a iniciar desde el pit lane.',
    fiaDocumentRef: 'FIA Formula One Sporting Regulations - Art. 40.2',
    officialUrl: 'https://www.fia.com/regulations/formula-1-regulations',
    penaltySummary: 'Obligación de salir desde el pit lane si se rompen sellos o se altera la configuración aerodinámica/suspensión.',
  },
  {
    id: 'track-limits',
    title: 'Límites de Pista y Eliminación de Vueltas',
    category: 'sporting',
    applicableYear: 2024,
    summary: 'Definición geométrica del trazado: la línea blanca exterior delimita la pista de carreras.',
    details: 'De acuerdo con el Artículo 33.3 del Reglamento Deportivo de la FIA y las notas del Director de Carrera, los pilotos deben utilizar la pista en todo momento. Se considera que un piloto ha abandonado la pista si las cuatro ruedas sobrepasan por completo la línea blanca delimitadora. En clasificación, el tiempo de vuelta se anula de inmediato; en carrera, la 3ª infracción genera bandera blanca y negra de advertencia, y la 4ª genera una penalización de 5 segundos.',
    fiaDocumentRef: 'FIA Formula One Sporting Regulations - Art. 33.3 & Race Director Event Notes',
    officialUrl: 'https://www.fia.com/documents/formula-1',
    penaltySummary: 'Eliminación del tiempo de vuelta en qualy; 5s de penalización acumulativa en carrera tras 4 advertencias.',
  },
  {
    id: 'safety-car-vsc',
    title: 'Procedimientos de Coche de Seguridad (SC) y Coche de Seguridad Virtual (VSC)',
    category: 'sporting',
    applicableYear: 2024,
    summary: 'Neutralización de carrera en caso de peligro inminente en pista o condiciones meteorológicas extremas.',
    details: 'El VSC (Art. 56) exige que los pilotos reduzcan su velocidad en al menos un 35% del tiempo de referencia delta de la FIA en cada mini-sector. El SC físico (Art. 55) congrega la parrilla detrás del vehículo oficial Aston Martin Vantage o Mercedes-AMG GT Black Series. Los pilotos doblados pueden desdoblarse una vez que el Director de Carrera determine que la pista es segura mediante el mensaje "Lapped cars may now overtake".',
    fiaDocumentRef: 'FIA Formula One Sporting Regulations - Art. 55 & 56',
    officialUrl: 'https://www.fia.com/regulations/formula-1-regulations',
    penaltySummary: 'Penalización de 5 o 10 segundos por no respetar el tiempo delta obligatorio de VSC.',
  },
  {
    id: 'power-unit-allocations',
    title: 'Asignación y Penalizaciones de Componentes de Unidad de Potencia',
    category: 'sporting',
    applicableYear: 2024,
    summary: 'Límites anuales de uso de componentes mecánicos del motor térmico y sistema híbrido.',
    details: 'Para la temporada 2024 (24 GGPP), cada monoplaza tiene asignado un límite de componentes: 4 Motores de Combustión Interna (ICE), 4 Turbo (TC), 4 MGU-H, 4 MGU-K, 2 Baterías (ES), 2 Centralitas Electrónicas (CE) y 8 Sistemas de Escape (EX). El uso de un primer componente adicional por encima de la cuota supone 10 puestos de penalización en parrilla; los componentes adicionales subsiguientes acarrean 5 puestos de penalización cada uno.',
    fiaDocumentRef: 'FIA Formula One Sporting Regulations - Art. 28.2',
    officialUrl: 'https://www.fia.com/regulations/formula-1-regulations',
    penaltySummary: '10 puestos de sanción en parrilla para el primer elemento extra; 5 puestos para los siguientes.',
  },
  {
    id: 'ground-effect-skid-block',
    title: 'Reglamento Técnico del Fondo Plano y Desgaste del Tablón (Skid Block)',
    category: 'technical',
    applicableYear: 2024,
    summary: 'Fondo de efecto suelo con túneles Venturi y restricción de desgaste máximo de 1.0 mm en el patín de madera.',
    details: 'Bajo el Artículo 3.5.9 del Reglamento Técnico de la FIA, el fondo plano debe incorporar un tablón longitudinal de madera prensada (Jabroc) de 10 mm de espesor nominal. Tras la carrera, el grosor del tablón no puede ser inferior a 9.0 mm medido en orificios calibrados de 50 mm de diámetro. El incumplimiento por desgaste excesivo conlleva la descalificación inmediata de la carrera (como ocurrió a Lewis Hamilton y Charles Leclerc en Austin 2023).',
    fiaDocumentRef: 'FIA Formula One Technical Regulations - Art. 3.5.9',
    officialUrl: 'https://www.fia.com/regulations/formula-1-regulations',
    penaltySummary: 'Descalificación inmediata de la clasificación oficial de la carrera por infracción técnica.',
  },
  {
    id: 'weight-limit',
    title: 'Peso Mínimo del Monoplaza y Lastre de Piloto',
    category: 'technical',
    applicableYear: 2024,
    summary: 'Masa total mínima de 798 kg (sin combustible) con piloto y asiento incluidos.',
    details: 'El Artículo 4.1 estipula que el monoplaza debe pesar al menos 798 kg en cualquier momento del Gran Premio. El conjunto del piloto con su equipamiento de seguridad y asiento debe pesar al menos 80 kg; si es inferior, se debe colocar lastre de balasto sellado de tungsteno en el habitáculo. Monoplazas que finalicen con peso inferior son descalificados automáticamente (como George Russell en Spa-Francorchamps 2024).',
    fiaDocumentRef: 'FIA Formula One Technical Regulations - Art. 4.1 & 4.6',
    officialUrl: 'https://www.fia.com/regulations/formula-1-regulations',
    penaltySummary: 'Descalificación técnica automática de la sesión por masa inferior a 798.0 kg.',
  },
  {
    id: 'financial-cost-cap',
    title: 'Límite Presupuestario Financiero (Financial Cost Cap)',
    category: 'financial',
    applicableYear: 2024,
    summary: 'Techo de gasto operativo anual fijado en base a $135 millones USD ajustado por inflación y número de carreras.',
    details: 'Supervisado por la Administración del Límite de Gasto de la FIA (Cost Cap Administration - CCA). Regula los costes atribuibles al rendimiento del coche en pista. Excluye sueldos de los 3 ejecutivos mejor pagados, salarios de los pilotos titulares, gastos de marketing, amortizaciones de patrimonio y gastos de viajes del personal.',
    fiaDocumentRef: 'FIA Formula One Financial Regulations - Section 2',
    officialUrl: 'https://www.fia.com/regulations/formula-1-regulations',
    penaltySummary: 'Sanciones financieras, deducción de puntos de campeonato y reducción de horas de túnel de viento/CFD.',
  },
];

// Verified Exemplary Stewards Decisions
const SAMPLE_STEWARD_DECISIONS: StewardDecisionItem[] = [
  {
    id: 'doc-spa-2024-63',
    season: 2024,
    grandPrix: 'Belgian Grand Prix',
    documentNumber: 63,
    issueTimestamp: '2024-07-28T18:15:00Z',
    session: 'Race',
    carNumber: 63,
    driverName: 'George Russell',
    teamName: 'Mercedes-AMG PETRONAS F1 Team',
    incidentDescription: 'Car 63 was weighed by the FIA Technical Delegate and found to be 796.5 kg (1.5 kg below the minimum required 798.0 kg weight after fuel draining).',
    regulatoryArticle: 'Article 4.1 of the FIA Formula One Technical Regulations',
    decision: 'Disqualification from the Race Classification',
    officialDocumentUrl: 'https://www.fia.com/documents/formula-1/season-2024/belgian-grand-prix',
  },
  {
    id: 'doc-aut-2024-44',
    season: 2024,
    grandPrix: 'Austrian Grand Prix',
    documentNumber: 44,
    issueTimestamp: '2024-06-30T16:20:00Z',
    session: 'Race',
    carNumber: 1,
    driverName: 'Max Verstappen',
    teamName: 'Oracle Red Bull Racing',
    incidentDescription: 'Car 1 collided with Car 4 (Lando Norris) at Turn 3 while defending position, causing a puncture to both vehicles.',
    regulatoryArticle: 'Article 33.4 of the FIA Formula One Sporting Regulations',
    decision: '10-Second Time Penalty and 2 Penalty Points on Super Licence',
    officialDocumentUrl: 'https://www.fia.com/documents/formula-1/season-2024/austrian-grand-prix',
  },
  {
    id: 'doc-usa-2023-44',
    season: 2023,
    grandPrix: 'United States Grand Prix (Austin)',
    documentNumber: 44,
    issueTimestamp: '2023-10-22T20:45:00Z',
    session: 'Race',
    carNumber: 44,
    driverName: 'Lewis Hamilton',
    teamName: 'Mercedes-AMG PETRONAS F1 Team',
    incidentDescription: 'Rear skid block plank assembly measured below the mandatory 9.0 mm minimum thickness in area 2.',
    regulatoryArticle: 'Article 3.5.9.e of the FIA Formula One Technical Regulations',
    decision: 'Disqualification from the Race Classification',
    officialDocumentUrl: 'https://www.fia.com/documents/formula-1/season-2023/united-states-grand-prix',
  },
];

export const RegulationsWikiArticle: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sporting' | 'technical' | 'financial'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredTopics = REGULATION_TOPICS.filter(t => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          t.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          t.fiaDocumentRef.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const tocItems: TOCItem[] = [
    { id: 'introduccion', label: '1. Estructura del Código Deportivo y Técnico' },
    { id: 'reglamento-deportivo', label: '2. Artículos Deportivos Clave (Sporting)' },
    { id: 'reglamento-tecnico', label: '3. Normativa Técnica y Homologación (Technical)' },
    { id: 'reglamento-financiero', label: '4. Techo Presupuestario (Financial Regulations)' },
    { id: 'comisarios-decisiones', label: '5. Archivo de Decisiones de Comisarios de la FIA' },
    { id: 'referencias', label: '6. Documentos Oficiales y Referencias Primarias' },
  ];

  const infoboxSections: InfoboxSection[] = [
    {
      title: 'Marco Regulatorio FIA',
      rows: [
        { label: 'Organismo Rector', value: 'Fédération Internationale de l\'Automobile (FIA)' },
        { label: 'Sede', value: 'Place de la Concorde, París, Francia' },
        { label: 'Presidente FIA', value: 'Mohammed Ben Sulayem' },
        { label: 'Director de Carrera F1', value: 'Niels Wittich / Rui Marques (FIA)' },
        { label: 'Presidente Comisarios', value: 'Panel rotatorio de 4 comisarios por GP' },
        { label: 'Documentación Oficial', value: 'fia.com/documents/formula-1' },
      ],
    },
    {
      title: 'Puntos y Límites 2024',
      rows: [
        { label: 'Puntos Victoria', value: <span className="font-bold text-[#FF1E00]">25 Puntos</span> },
        { label: 'Vuelta Rápida', value: '1 Punto (si termina en Top 10)' },
        { label: 'Carrera Sprint', value: '8-7-6-5-4-3-2-1 (Top 8)' },
        { label: 'Peso Mínimo', value: '798.0 kg (sin combustible)' },
        { label: 'Límite de Gasto', value: '$135.0M USD (ajustado)' },
      ],
    },
    {
      title: 'Procedimientos de Sanción',
      rows: [
        { label: 'Tiempo en Pit Stop', value: '5 segundos o 10 segundos' },
        { label: 'Pérdida en Meta', value: '+5s / +10s añadidos al tiempo total' },
        { label: 'Puntos Superlicencia', value: 'Hasta 12 pts acumulables en 12 meses' },
        { label: 'Suspensión', value: '1 GP sin competir al alcanzar 12 puntos' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs 
        items={[
          { label: 'Portal Portada', to: '/f1-real' },
          { label: 'Gobernanza y Reglamento FIA' },
        ]} 
      />

      {/* Main Title & Provenance Notice */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold bg-[#FF1E00]/10 border border-[#FF1E00]/30 px-2 py-0.5">
            CÓDIGO OFICIAL FIA // SPORTING & TECHNICAL
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 uppercase">
            DOCUMENTOS PRIMARIOS VERIFICADOS
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-syne uppercase text-white tracking-tight">
          Reglamento y Decisiones de Comisarios FIA
        </h1>
        <p className="text-xs sm:text-sm text-white/70 font-sans mt-2 max-w-4xl leading-relaxed">
          Compendio oficial de las normas deportivas, técnicas y financieras que rigen el Campeonato Mundial de Fórmula 1 de la FIA, 
          junto con el registro de decisiones disciplinarias emitidas por el Panel de Comisarios Oficiales.
        </p>
      </div>

      {/* Grid Layout: Main Article + Infobox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Article Body (8 cols) */}
        <div className="lg:col-span-8 space-y-8 font-sans">
          
          {/* Table of Contents */}
          <WikiTableOfContents items={tocItems} />

          {/* Section 1: Introduction */}
          <section id="introduccion" className="space-y-3">
            <h2 className="text-xl font-bold font-syne uppercase text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Scale size={18} className="text-[#FF1E00]" />
              <span>1. Estructura del Código Deportivo y Técnico</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              El Campeonato Mundial de Fórmula 1 se rige bajo la tutela exclusiva de la 
              <strong> Fédération Internationale de l'Automobile (FIA)</strong>. Su corpus normativo se compone de tres 
              pilares fundamentales vinculantes para todas las escuderías y competidores:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#1b1b26] border border-white/10 p-3">
                <span className="text-[10px] font-mono text-[#FF1E00] uppercase font-bold block mb-1">Pilar 1</span>
                <h4 className="text-xs font-bold text-white uppercase font-syne mb-1">Reglamento Deportivo</h4>
                <p className="text-[11px] text-white/60">
                  Horarios de sesión, procedimientos de salida, parque cerrado, límites de pista, neumáticos obligatorios y sanciones.
                </p>
              </div>
              <div className="bg-[#1b1b26] border border-white/10 p-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">Pilar 2</span>
                <h4 className="text-xs font-bold text-white uppercase font-syne mb-1">Reglamento Técnico</h4>
                <p className="text-[11px] text-white/60">
                  Dimensiones aerodinámicas, túneles Venturi de efecto suelo, peso de 798 kg, unidad híbrida V6 y seguridad de choque.
                </p>
              </div>
              <div className="bg-[#1b1b26] border border-white/10 p-3">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">Pilar 3</span>
                <h4 className="text-xs font-bold text-white uppercase font-syne mb-1">Reglamento Financiero</h4>
                <p className="text-[11px] text-white/60">
                  Cost Cap anual fijado por la FIA, auditorías de gastos de desarrollo en túnel de viento, CFD y fabricación de componentes.
                </p>
              </div>
            </div>
          </section>

          {/* Interactive Regulation Explorer */}
          <section id="reglamento-deportivo" className="space-y-4">
            <h2 className="text-xl font-bold font-syne uppercase text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#FF1E00]" />
                <span>2. Artículos y Normativas Destacadas</span>
              </div>
              <span className="text-[10px] font-mono text-white/50">{filteredTopics.length} Artículos</span>
            </h2>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#1b1b26] border border-white/10 p-1">
                {(['all', 'sporting', 'technical', 'financial'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[10px] font-mono uppercase transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-[#FF1E00] text-white font-bold' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat === 'sporting' ? 'Deportivo' : cat === 'technical' ? 'Técnico' : 'Financiero'}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar en el articulado oficial..."
                  className="w-full bg-[#1b1b26] border border-white/10 text-white text-xs font-mono pl-7 pr-3 py-1.5 focus:border-[#FF1E00] focus:outline-none"
                />
              </div>
            </div>

            {/* List of Regulation Cards */}
            <div className="space-y-3">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="bg-[#1b1b26] border border-white/10 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 font-bold ${
                          topic.category === 'sporting' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                            : topic.category === 'technical'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {topic.category.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">FIA {topic.applicableYear}</span>
                      </div>
                      <h3 className="text-sm font-bold font-syne text-white">{topic.title}</h3>
                    </div>

                    <a 
                      href={topic.officialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-mono text-white/40 hover:text-[#FF1E00] shrink-0"
                    >
                      <ExternalLink size={12} />
                      <span className="hidden sm:inline">Ver FIA</span>
                    </a>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed">{topic.details}</p>

                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="text-amber-400/90 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      <span><strong>Sanción aplicable:</strong> {topic.penaltySummary}</span>
                    </div>
                    <span className="text-white/40">{topic.fiaDocumentRef}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Stewards Decisions Archive */}
          <section id="comisarios-decisiones" className="space-y-4">
            <h2 className="text-xl font-bold font-syne uppercase text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <FileCheck size={18} className="text-[#FF1E00]" />
              <span>5. Archivo de Decisiones del Panel de Comisarios</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              En cada Gran Premio de Fórmula 1, un panel rotatorio de cuatro Comisarios Oficiales de la FIA 
              (incluyendo un ex-piloto internacional con superlicencia) revisa telemetría, video en circuito y radio de equipo 
              para emitir decisiones legales inapelables en el circuito.
            </p>

            <div className="space-y-3">
              {SAMPLE_STEWARD_DECISIONS.map((dec) => (
                <div key={dec.id} className="bg-[#1b1b26] border border-white/10 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">DOC #{dec.documentNumber}</span>
                      <span className="text-white/30">•</span>
                      <span className="text-xs text-[#FF1E00] font-syne font-bold">{dec.grandPrix} {dec.season}</span>
                      <span className="text-white/30">•</span>
                      <span className="text-[10px] font-mono text-white/50">{dec.session}</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                      {new Date(dec.issueTimestamp).toLocaleString('es-ES')}
                    </span>
                  </div>

                  <div className="text-xs text-white/90">
                    <strong>Implicado:</strong> #{dec.carNumber} {dec.driverName} ({dec.teamName})
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed font-sans bg-black/30 p-2.5 border-l-2 border-amber-500">
                    "{dec.incidentDescription}"
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono pt-2">
                    <span className="text-red-400 font-bold uppercase">
                      Decisión Oficial: {dec.decision}
                    </span>
                    <a
                      href={dec.officialDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 hover:text-white flex items-center gap-1"
                    >
                      <ExternalLink size={10} />
                      <span>{dec.regulatoryArticle}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: References */}
          <section id="referencias" className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold font-syne uppercase text-white flex items-center gap-2">
              <Bookmark size={14} className="text-[#FF1E00]" />
              <span>6. Referencias Oficiales de la FIA</span>
            </h3>
            <ul className="text-xs font-mono text-white/60 space-y-1 list-decimal list-inside">
              <li>
                <a href="https://www.fia.com/regulations/formula-1-regulations" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  Fédération Internationale de l'Automobile (FIA) — Formula 1 Sporting, Technical & Financial Regulations
                </a>
              </li>
              <li>
                <a href="https://www.fia.com/documents/formula-1" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  FIA Race Control and Stewards Decisions Document Repository (Official Classifications and Summons)
                </a>
              </li>
              <li>
                <a href="https://www.fia.com/international-sporting-code-and-its-appendices" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  FIA International Sporting Code (ISC) — Code Sportif International (CSI)
                </a>
              </li>
            </ul>
          </section>

        </div>

        {/* Right Column: Infobox (4 cols) */}
        <div className="lg:col-span-4">
          <WikiInfobox 
            title="Código de Regulaciones FIA"
            subtitle="Sporting, Technical & Financial Framework"
            sections={infoboxSections}
          />
        </div>
      </div>
    </div>
  );
};
