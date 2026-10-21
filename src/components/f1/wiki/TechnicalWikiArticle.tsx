import React, { useState } from 'react';
import { 
  Cpu, Wind, Zap, Gauge, Disc, Shield, 
  ExternalLink, Bookmark, CheckCircle2, Info, ArrowRight, Layers 
} from 'lucide-react';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiInfobox, InfoboxSection } from './WikiInfobox';
import { WikiTableOfContents, TOCItem } from './WikiTableOfContents';
import { WikiLink } from './WikiLink';

interface TechModule {
  id: string;
  title: string;
  category: 'aero' | 'powertrain' | 'chassis' | 'electronics' | 'safety';
  icon: any;
  summary: string;
  principles: string[];
  physicsExplanation: string;
  regulationsRef: string;
  carExamples: { carId: string; carName: string; implementation: string }[];
}

const TECH_MODULES: TechModule[] = [
  {
    id: 'ground-effect',
    title: 'Efecto Suelo y Túneles Venturi Inferiores',
    category: 'aero',
    icon: Wind,
    summary: 'Generación de carga aerodinámica mediante la aceleración del flujo de aire debajo del monoplaza.',
    principles: [
      'Principio de Bernoulli: a mayor velocidad del fluido en un estrechamiento (garganta Venturi), menor presión estática.',
      'Diferencial de presión que succiona el monoplaza hacia el asfalto (downforce sin resistencia inducida excesiva).',
      'Sellado de bordes de fondo mediante vórtices generados por bordes curvados y aletines laterales autorizados.',
      'Difusor posterior sobreelevado que desacelera gradualmente el flujo para restablecer la presión ambiente.',
    ],
    physicsExplanation: 'A diferencia de los alerones convencionales que generan sustentación negativa a costa de una alta estela turbulenta ("aire sucio"), el fondo de efecto suelo canaliza masa de aire limpia a alta velocidad. Esto permite a los monoplazas perseguirse de cerca en curva rápida perdiendo sólo un 20% de carga frente al 50% de las generaciones precedentes.',
    regulationsRef: 'FIA Technical Regulations Art. 3.5 & 3.6',
    carExamples: [
      { carId: 'redbull-rb20', carName: 'Red Bull RB20', implementation: 'Conductos de suelo de garganta extrema diseñados por Adrian Newey con sellado por vórtices múltiples.' },
      { carId: 'mclaren-mcl38', carName: 'McLaren MCL38', implementation: 'Fondo plano con transición suave del difusor que minimiza la sensibilidad al cambio de altura de rodaje.' },
    ],
  },
  {
    id: 'porpoising',
    title: 'Fenómeno de Marsopeo (Porpoising) y Control de Rebote',
    category: 'aero',
    icon: Layers,
    summary: 'Oscilación aerodinámica vertical cíclica causada por la pérdida y recuperación repentina de sustentación negativa.',
    principles: [
      'A velocidades superiores a 280 km/h, la succión aerodinámica empuja el fondo hacia el suelo hasta casi rozar.',
      'El estrechamiento extremo bloquea el flujo de aire (stall aerodinámico) y el diferencial de presión colapsa bruscamente.',
      'Al liberarse la succión, la rigidez elástica de la suspensión hace que el coche rebote violentamente hacia arriba.',
      'Al elevarse el fondo, el flujo vuelve a acelerarse y el ciclo se reinicia varias veces por segundo.',
    ],
    physicsExplanation: 'Es una inestabilidad aeroelástica acoplada entre la rigidez de los amortiguadores y la curva no lineal de carga del fondo plano. La FIA introdujo la Métrica de Oscilación Aerodinámica (AOM) obligatoria medida con acelerómetros en el sensor central para evitar daños espinales en los pilotos.',
    regulationsRef: 'FIA Technical Directive TD018 & Art. 3.15',
    carExamples: [
      { carId: 'mercedes-w15', carName: 'Mercedes W15', implementation: 'Arquitectura de suspensión y suelo rediseñada para eliminar completamente el rebote crónico del W13.' },
      { carId: 'ferrari-sf24', carName: 'Ferrari SF-24', implementation: 'Ajuste de rigidez torsional del chasis para ensanchar la ventana operativa de suspensión.' },
    ],
  },
  {
    id: 'hybrid-power-unit',
    title: 'Unidad de Potencia Híbrida Turbo V6 1.6L',
    category: 'powertrain',
    icon: Zap,
    summary: 'Sistema de propulsión de ultra alta eficiencia térmica (>50%) compuesto por motor de combustión y dos motores-generadores eléctricos.',
    principles: [
      'ICE (Internal Combustion Engine): V6 a 90° de 1.600 cc, inyección directa a 500 bar y régimen regulado a 15.000 rpm.',
      'MGU-K (Motor Generator Unit - Kinetic): Motor eléctrico de 120 kW (163 CV) acoplado al cigüeñal que regenera en frenada y entrega par en aceleración.',
      'MGU-H (Motor Generator Unit - Heat): Motor eléctrico acoplado al eje del turbocompresor que absorbe energía de los gases de escape sin límite de recuperación.',
      'ES (Energy Store): Batería de iones de litio de hasta 4 MJ por vuelta con gestión térmica mediante refrigerante dieléctrico.',
    ],
    physicsExplanation: 'Los motores convencionales de combustión raramente superan el 30% de eficiencia térmica. Las unidades de potencia de F1 superan el 52% gracias a la combustión en precámara de encendido por chorro turbulento (TJI) y la recuperación de calor residual de los gases de escape mediante el MGU-H que elimina por completo el retraso del turbo (turbo-lag).',
    regulationsRef: 'FIA Technical Regulations Art. 5 (Power Unit Specifications)',
    carExamples: [
      { carId: 'redbull-rb20', carName: 'Honda RBPT RBPTH002', implementation: 'Unidad compacta con refrigeración optimizada y alta durabilidad de rodamientos de MGU-H.' },
      { carId: 'ferrari-sf24', carName: 'Ferrari 066/12', implementation: 'Despliegue de par eléctrico progresivo y mapa de combustión enriquecido en marchas bajas.' },
    ],
  },
  {
    id: 'push-pull-suspension',
    title: 'Cinemática de Suspensión: Varilla de Empuje (Push-rod) vs Tracción (Pull-rod)',
    category: 'chassis',
    icon: Gauge,
    summary: 'Disposición mecánica de los brazos de control del chasis y su impacto en el centro de gravedad y flujo aerodinámico.',
    principles: [
      'Push-rod (Empuje): La varilla diagonal va desde el soporte inferior de la rueda hacia arriba en el monocasco, facilitando el acceso mecánico a los muelles.',
      'Pull-rod (Tracción): La varilla diagonal va desde la parte superior de la rueda hacia la base del monocasco, bajando el centro de gravedad.',
      'Impacto aerodinámico: La inclinación de las barras condiciona el flujo de aire que entra hacia los pontones y los túneles Venturi.',
      'Geometría Anti-Dive (Anti-hundimiento) y Anti-Squat (Anti-inclinación) para estabilizar la plataforma aerodinámica del suelo.',
    ],
    physicsExplanation: 'En los coches con efecto suelo, la altura de marcha debe mantenerse milimétricamente constante. Red Bull adoptó pull-rod delantero y push-rod trasero con un ángulo extremo de anti-dive de casi 45° en el triángulo superior delantero para evitar que el morro se hunda en frenadas intensas, manteniendo sellado el túnel inferior.',
    regulationsRef: 'FIA Technical Regulations Art. 10 (Suspension and Steering)',
    carExamples: [
      { carId: 'redbull-rb20', carName: 'Red Bull RB20', implementation: 'Pull-rod delantero y Push-rod trasero con un 45% de compensación geométrica anti-dive.' },
      { carId: 'mclaren-mcl38', carName: 'McLaren MCL38', implementation: 'Pull-rod delantero que limpia los canales aerodinámicos de entrada a los pontones.' },
    ],
  },
  {
    id: 'brakes-bbw',
    title: 'Sistema de Frenos Carbono-Carbono y Brake-by-Wire (BBW)',
    category: 'chassis',
    icon: Disc,
    summary: 'Frenos de fricción de composite de carbono capaces de soportar 1.200 °C con control electrónico del eje trasero.',
    principles: [
      'Discos de freno de fibra de carbono reforzada con matriz de carbono con más de 1.400 orificios de refrigeración radiales.',
      'Ventana de trabajo óptima: entre 400 °C y 1.000 °C (por debajo de 350 °C el coeficiente de fricción cae bruscamente).',
      'Eje delantero: frenado hidráulico directo accionado por el pie del piloto.',
      'Eje trasero (Brake-by-Wire): un sensor mide la presión del pedal y la centralita electrónica calcula la proporción entre frenado del disco hidráulico y retención regenerativa del motor eléctrico MGU-K.',
    ],
    physicsExplanation: 'El sistema BBW asegura que cuando el MGU-K regenera hasta 120 kW de potencia eléctrica en frenada, la fuerza total de retención trasera permanezca constante para no desestabilizar el reparto de frenada (brake bias) ni bloquear las ruedas traseras.',
    regulationsRef: 'FIA Technical Regulations Art. 11 (Brake System)',
    carExamples: [
      { carId: 'astonmartin-amr24', carName: 'Aston Martin AMR24', implementation: 'Pinzas monobloque Brembo mecanizadas en aluminio-litio con conductos de disipación interna.' },
      { carId: 'williams-fw46', carName: 'Williams FW46', implementation: 'Tambores de carbono sellados para transferir calor radiante a la llanta y calentar los neumáticos.' },
    ],
  },
  {
    id: 'survival-cell-halo',
    title: 'Monocasco de Seguridad de Fibra de Carbono y Halo de Titanio',
    category: 'safety',
    icon: Shield,
    summary: 'Estructura de protección pasiva del habitáculo diseñada para absorber impactos de más de 50G y soportar 12 toneladas.',
    principles: [
      'Célula de supervivencia construida en sándwich de fibra de carbono de alto módulo con núcleo alveolar de Nomex/aluminio.',
      'Estructuras de impacto frontal, lateral y posterior deformables que disipan la energía cinética en deceleración gradual.',
      'Halo de titanio Grado 5: arco de 9 kg capaz de soportar una carga estática vertical de 125 kN (equivalente a dos autobuses londinenses).',
      'Reposacabezas de espuma viscoelástica Confor y sistema HANS obligatorio anclado al casco del piloto.',
    ],
    physicsExplanation: 'El tiempo de deceleración durante un choque determina las fuerzas G soportadas por el cuerpo humano (F = m · a). Las estructuras de impacto sacrifican su integridad mediante delaminación progresiva de las fibras de carbono para alargar la duración del choque de milisegundos a decimas de segundo, reduciendo la aceleración máxima sobre la columna y el cerebro.',
    regulationsRef: 'FIA Technical Regulations Art. 12 & 13 (Safety Structures)',
    carExamples: [
      { carId: 'ferrari-sf24', carName: 'Ferrari SF-24', implementation: 'Halo con aletines aerodinámicos superiores homologados que dirigen el aire hacia la toma del motor (airbox).' },
      { carId: 'alpine-a524', carName: 'Alpine A524', implementation: 'Homologación en primera instancia tras superar las pruebas de aplastamiento dinámico de la FIA en Cranfield.' },
    ],
  },
];

export const TechnicalWikiArticle: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'aero' | 'powertrain' | 'chassis' | 'safety'>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('ground-effect');

  const filteredModules = TECH_MODULES.filter(m => activeCategory === 'all' || m.category === activeCategory);
  const activeModule = TECH_MODULES.find(m => m.id === selectedModuleId) || TECH_MODULES[0];

  const tocItems: TOCItem[] = [
    { id: 'resumen-ingenieria', label: '1. Principios de Ingeniería en la Fórmula 1 Moderna' },
    { id: 'modulos-tecnicos', label: '2. Módulos de Tecnología y Física Aplicada' },
    { id: 'detalle-modulo', label: `3. Análisis Detallado: ${activeModule.title}` },
    { id: 'correlacion-monoplazas', label: '4. Correlación con Monoplazas Actuales' },
    { id: 'referencias-tecnicas', label: '5. Referencias de Publicaciones y Papers Técnicos' },
  ];

  const infoboxSections: InfoboxSection[] = [
    {
      title: 'Especificaciones Técnicas Clave',
      rows: [
        { label: 'Arquitectura Motor', value: '1.6L 90° V6 Turbo Híbrido' },
        { label: 'Potencia Estimada', value: '1.020 - 1.050 CV (ICE + ERS)' },
        { label: 'Eficiencia Térmica', value: '> 52% (Líder en automoción)' },
        { label: 'Régimen Máximo', value: '15.000 rpm (Flujo a 10.500 rpm)' },
        { label: 'Presión Inyección', value: '500 bar (Directa monopunto)' },
        { label: 'Flujo de Combustible', value: '100 kg/hora máximo' },
      ],
    },
    {
      title: 'Chasis y Dimensiones',
      rows: [
        { label: 'Peso Mínimo', value: '798 kg (sin carburante)' },
        { label: 'Distancia Ejes', value: '3.600 mm máximo' },
        { label: 'Anchura Total', value: '2.000 mm' },
        { label: 'Neumáticos', value: 'Pirelli 18" (305mm del / 405mm tras)' },
        { label: 'Material Chasis', value: 'Fibra de carbono composite' },
        { label: 'Estructura Halo', value: 'Titanio Grado 5 (125 kN carga)' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs 
        items={[
          { label: 'Portal Portada', to: '/f1-real' },
          { label: 'Enciclopedia Técnica e Ingeniería' },
        ]} 
      />

      {/* Main Title */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5">
            INGENIERÍA Y AERODINÁMICA DE COMPETICIÓN
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50 uppercase">
            REGLAMENTO FIA 2024 DE EFECTO SUELO
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-syne uppercase text-white tracking-tight">
          Tecnología y Física de Monoplazas de Fórmula 1
        </h1>
        <p className="text-xs sm:text-sm text-white/70 font-sans mt-2 max-w-4xl leading-relaxed">
          Tratado enciclopédico sobre los fundamentos de aerodinámica, termodinámica de unidades híbridas, 
          cinemática de suspensiones y ciencia de materiales que determinan el rendimiento de la actual generación de monoplazas de F1.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8 font-sans">
          
          {/* Table of Contents */}
          <WikiTableOfContents items={tocItems} />

          {/* Section 1: Overview */}
          <section id="resumen-ingenieria" className="space-y-3">
            <h2 className="text-xl font-bold font-syne uppercase text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Cpu size={18} className="text-[#FF1E00]" />
              <span>1. Principios de Ingeniería en la Fórmula 1 Moderna</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Un monoplaza de Fórmula 1 moderno representa el pináculo de la ingeniería aplicada del automóvil. 
              El rendimiento no surge de un componente aislado, sino de la interacción no lineal de cuatro sistemas:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#1b1b26] border border-white/10 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                  <Wind size={14} />
                  <span>Plataforma Aerodinámica</span>
                </div>
                <p className="text-xs text-white/60">
                  Control milimétrico del fondo de efecto suelo mediante cinemática de suspensión rígida para estabilizar la succión Venturi a más de 300 km/h.
                </p>
              </div>

              <div className="bg-[#1b1b26] border border-white/10 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                  <Zap size={14} />
                  <span>Propulsión Híbrida MGU-K / MGU-H</span>
                </div>
                <p className="text-xs text-white/60">
                  Recuperación de hasta 2 MJ por vuelta en frenada y sin límite en el turbocompresor, desplegando 160 CV continuos sin consumo de gasolina adicional.
                </p>
              </div>

              <div className="bg-[#1b1b26] border border-white/10 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                  <Disc size={14} />
                  <span>Dinámica de Neumáticos Pirelli</span>
                </div>
                <p className="text-xs text-white/60">
                  La ventana térmica de los compuestos (100°C - 110°C) dicta la estrategia de carrera, el ángulo de caída (camber) y la gestión del calentamiento de las llantas.
                </p>
              </div>

              <div className="bg-[#1b1b26] border border-white/10 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase">
                  <Shield size={14} />
                  <span>Seguridad Estructural</span>
                </div>
                <p className="text-xs text-white/60">
                  Habitáculo indeformable con halo de titanio y columnas laterales capaces de soportar impactos que disipan más de 50G sin comprometer al piloto.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Technical Module Selector */}
          <section id="modulos-tecnicos" className="space-y-4">
            <h2 className="text-xl font-bold font-syne uppercase text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#FF1E00]" />
                <span>2. Módulos Técnicos y Fundamentos Físicos</span>
              </div>
              <span className="text-[10px] font-mono text-white/50">{TECH_MODULES.length} Módulos</span>
            </h2>

            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#1b1b26] border border-white/10 p-1">
              {(['all', 'aero', 'powertrain', 'chassis', 'safety'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#FF1E00] text-white font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'Todos los Sistemas' : cat === 'aero' ? 'Aerodinámica' : cat === 'powertrain' ? 'Propulsión' : cat === 'chassis' ? 'Chasis y Frenos' : 'Seguridad'}
                </button>
              ))}
            </div>

            {/* Grid of interactive modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredModules.map((mod) => {
                const Icon = mod.icon;
                const isSelected = mod.id === selectedModuleId;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`text-left p-3.5 border transition-all ${
                      isSelected
                        ? 'bg-[#1e1e2d] border-[#FF1E00] shadow-lg ring-1 ring-[#FF1E00]'
                        : 'bg-[#1b1b26] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={isSelected ? 'text-[#FF1E00]' : 'text-white/60'} />
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-white/5 text-white/60 border border-white/10">
                          {mod.category.toUpperCase()}
                        </span>
                      </div>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FF1E00]" />}
                    </div>
                    <h3 className="text-xs font-bold font-syne text-white mb-1">{mod.title}</h3>
                    <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">{mod.summary}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3: Detailed Active Module View */}
          <section id="detalle-modulo" className="bg-[#1b1b26] border border-white/15 p-5 space-y-4">
            <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                  ANÁLISIS EN PROFUNDIDAD // {activeModule.category.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold font-syne uppercase text-white mt-0.5">
                  {activeModule.title}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-white/40 bg-black/40 px-2 py-1 border border-white/10">
                {activeModule.regulationsRef}
              </span>
            </div>

            {/* Scientific Explanation */}
            <div>
              <h4 className="text-xs font-bold font-syne text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Info size={13} className="text-[#FF1E00]" />
                <span>Mecanismo Físico y Fenomenología</span>
              </h4>
              <p className="text-xs text-white/80 leading-relaxed font-sans bg-black/30 p-3 border-l-2 border-[#FF1E00]">
                {activeModule.physicsExplanation}
              </p>
            </div>

            {/* Operating Principles */}
            <div>
              <h4 className="text-xs font-bold font-syne text-white uppercase tracking-wider mb-2">
                Principios Fundamentales de Funcionamiento:
              </h4>
              <ul className="space-y-1.5 text-xs text-white/70">
                {activeModule.principles.map((pr, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pr}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Examples on Actual Cars */}
            <div id="correlacion-monoplazas" className="pt-3 border-t border-white/10">
              <h4 className="text-xs font-bold font-syne text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>Implementación en Monoplazas 2024:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeModule.carExamples.map((ex) => (
                  <div key={ex.carId} className="bg-black/40 border border-white/10 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-syne text-[#FF1E00]">{ex.carName}</span>
                      <WikiLink to={`/f1-real/monoplazas/${ex.carId}`} className="text-[10px] font-mono text-white/50 hover:text-white flex items-center gap-0.5">
                        <span>Ver Ficha</span>
                        <ArrowRight size={10} />
                      </WikiLink>
                    </div>
                    <p className="text-[11px] text-white/70 leading-relaxed">{ex.implementation}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 5: References */}
          <section id="referencias-tecnicas" className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold font-syne uppercase text-white flex items-center gap-2">
              <Bookmark size={14} className="text-[#FF1E00]" />
              <span>5. Referencias y Publicaciones Técnicas Oficiales</span>
            </h3>
            <ul className="text-xs font-mono text-white/60 space-y-1 list-decimal list-inside">
              <li>
                <a href="https://www.fia.com/regulations/formula-1-regulations" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  FIA Formula One Technical Regulations (Issue 2024 - Sections 3, 4, 5, 10, 11, 12, 13)
                </a>
              </li>
              <li>
                <a href="https://www.sae.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  Society of Automotive Engineers (SAE International) — Motorsports Engineering Conference Papers
                </a>
              </li>
              <li>
                <span>Racecar Engineering Technical Archive — Aerodynamics and Ground Effect porpoising analysis (2022-2024).</span>
              </li>
            </ul>
          </section>

        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4">
          <WikiInfobox
            title="Especificación Técnica F1"
            subtitle="Reglamento Técnico FIA 2024"
            sections={infoboxSections}
          />
        </div>
      </div>
    </div>
  );
};
