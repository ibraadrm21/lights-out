import React, { useState } from 'react';
import { 
  GraduationCap, Award, Compass, Users, CheckCircle2, 
  ExternalLink, Bookmark, ArrowRight, Shield, Zap 
} from 'lucide-react';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiInfobox, InfoboxSection } from './WikiInfobox';
import { WikiTableOfContents, TOCItem } from './WikiTableOfContents';
import { WikiLink } from './WikiLink';
import { F1_DRIVERS_DATA } from '../../../data/f1EncyclopediaData';

interface AcademyProfile {
  id: string;
  name: string;
  team: string;
  established: number;
  director: string;
  notableGraduates: { driverId: string; name: string; championshipTitle: string }[];
  currentProspects: string[];
  superlicenceRecord: string;
}

const DRIVER_ACADEMIES: AcademyProfile[] = [
  {
    id: 'redbull-junior',
    name: 'Red Bull Junior Team',
    team: 'Red Bull Racing / RB',
    established: 2001,
    director: 'Dr. Helmut Marko',
    notableGraduates: [
      { driverId: 'max-verstappen', name: 'Max Verstappen', championshipTitle: '4x Campeón del Mundo F1' },
      { driverId: 'carlos-sainz', name: 'Carlos Sainz', championshipTitle: 'Ganador de Grandes Premios F1' },
      { driverId: 'yuki-tsunoda', name: 'Yuki Tsunoda', championshipTitle: '3º en F2 2020' },
      { driverId: 'liam-lawson', name: 'Liam Lawson', championshipTitle: 'Subcampeón Super Fórmula Japón' },
    ],
    currentProspects: ['Isack Hadjar (F2)', 'Arvid Lindblad (F3)', 'Ayumu Iwasa'],
    superlicenceRecord: 'El programa más prolífico de la historia moderna, habiendo llevado a más de 15 pilotos a la F1.',
  },
  {
    id: 'ferrari-driver-academy',
    name: 'Ferrari Driver Academy (FDA)',
    team: 'Scuderia Ferrari',
    established: 2009,
    director: 'Jock Clear',
    notableGraduates: [
      { driverId: 'charles-leclerc', name: 'Charles Leclerc', championshipTitle: 'Campeón GP3 2016 y F2 2017' },
      { driverId: 'oliver-bearman', name: 'Oliver Bearman', championshipTitle: 'Debut con puntos en F1 2024' },
    ],
    currentProspects: ['Oliver Bearman (F2/F1)', 'Dino Beganovic (F3)', 'Tuukka Taponen'],
    superlicenceRecord: 'Pilotos formados en Maranello con rigurosa preparación en simulador y test en Fiorano.',
  },
  {
    id: 'mercedes-junior-team',
    name: 'Mercedes Junior Team',
    team: 'Mercedes-AMG PETRONAS',
    established: 2016,
    director: 'Gwen Lagrue',
    notableGraduates: [
      { driverId: 'george-russell', name: 'George Russell', championshipTitle: 'Campeón GP3 2017 y F2 2018' },
      { driverId: 'kimi-antonelli', name: 'Andrea Kimi Antonelli', championshipTitle: 'Campeón FRECA, ascenso directo F1 2025' },
    ],
    currentProspects: ['Andrea Kimi Antonelli (F2)', 'Alex Powell', 'Kenzo Craigie'],
    superlicenceRecord: 'Especializado en transiciones rápidas y programas intensivos de test con monoplazas históricos.',
  },
  {
    id: 'alpine-academy',
    name: 'Alpine Academy',
    team: 'BWT Alpine F1 Team',
    established: 2002,
    director: 'Julian Rouse',
    notableGraduates: [
      { driverId: 'oscar-piastri', name: 'Oscar Piastri', championshipTitle: 'Campeón F3 2020 y F2 2021' },
      { driverId: 'esteban-ocon', name: 'Esteban Ocon', championshipTitle: 'Campeón GP3 2015' },
      { driverId: 'jack-doohan', name: 'Jack Doohan', championshipTitle: 'Subcampeón F2, piloto F1 2025' },
    ],
    currentProspects: ['Victor Martins (F2)', 'Jack Doohan (Reserva/F1)', 'Gabriele Minì (F3)'],
    superlicenceRecord: 'Histórico programa heredero del Renault Driver Development con múltiples títulos en categorías feeder.',
  },
  {
    id: 'mclaren-driver-dev',
    name: 'McLaren Driver Development Programme',
    team: 'McLaren Formula 1 Team',
    established: 1998,
    director: 'Alessandro Alunni Bravi / Emanuele Pirro',
    notableGraduates: [
      { driverId: 'lewis-hamilton', name: 'Lewis Hamilton', championshipTitle: '7x Campeón del Mundo F1' },
      { driverId: 'lando-norris', name: 'Lando Norris', championshipTitle: 'Campeón F3 Europea 2017' },
    ],
    currentProspects: ['Gabriel Bortoleto (Campeón F3 2023, F2)', 'Pato O\'Ward (IndyCar)', 'Bianca Bustamante (F1 Academy)'],
    superlicenceRecord: 'Pionero en la detección precoz de talento desde el karting infantil.',
  },
  {
    id: 'williams-racing-academy',
    name: 'Williams Racing Driver Academy',
    team: 'Williams Racing',
    established: 2019,
    director: 'Sven Smeets',
    notableGraduates: [
      { driverId: 'franco-colapinto', name: 'Franco Colapinto', championshipTitle: 'Puntos en F1 2024 en Monza/Bakú' },
      { driverId: 'logan-sargeant', name: 'Logan Sargeant', championshipTitle: '4º en F2 2022' },
    ],
    currentProspects: ['Franco Colapinto (F1)', 'Zak O\'Sullivan (F2)', 'Luke Browning (F3)'],
    superlicenceRecord: 'Enfoque integral en telemetría de carrera y desarrollo de ingeniería en Grove.',
  },
];

export const JuniorCategoryArticle: React.FC = () => {
  const [selectedAcademy, setSelectedAcademy] = useState<string>('redbull-junior');
  const activeAcademy = DRIVER_ACADEMIES.find(a => a.id === selectedAcademy) || DRIVER_ACADEMIES[0];

  const tocItems: TOCItem[] = [
    { id: 'piramide-feeder', label: '1. La Pirámide de Promoción de la FIA' },
    { id: 'formula-2', label: '2. Campeonato de Fórmula 2 de la FIA' },
    { id: 'formula-3', label: '3. Campeonato de Fórmula 3 de la FIA' },
    { id: 'superlicencia', label: '4. Sistema de Puntos de Superlicencia FIA' },
    { id: 'academias-f1', label: '5. Academias de Desarrollo de Jóvenes Pilotos' },
    { id: 'referencias', label: '6. Referencias y Reglamentos Oficiales' },
  ];

  const infoboxSections: InfoboxSection[] = [
    {
      title: 'Campeonato FIA Formula 2',
      rows: [
        { label: 'Chasis Único', value: 'Dallara F2 2024 Monocasco Carbono' },
        { label: 'Motor Oficial', value: 'Mecachrome 3.4L V6 Turbo (620 CV)' },
        { label: 'Neumáticos', value: 'Pirelli 18" (3 compuestos secos)' },
        { label: 'Formato GP', value: 'Sprint (10-1 pts) + Feature Race (25-1)' },
        { label: 'Superlicencia', value: '40 Pts (Top 3 otorga pase directo F1)' },
      ],
    },
    {
      title: 'Campeonato FIA Formula 3',
      rows: [
        { label: 'Chasis Único', value: 'Dallara F3 Monocasco Carbono' },
        { label: 'Motor Oficial', value: 'Mecachrome 3.4L V6 Atmosférico (380 CV)' },
        { label: 'Parrilla', value: '30 pilotos (10 equipos de 3 coches)' },
        { label: 'Superlicencia', value: '30 Pts para el Campeón' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs 
        items={[
          { label: 'Portal Portada', to: '/f1-real' },
          { label: 'Categorías Junior y Desarrollo' },
        ]} 
      />

      {/* Main Title */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5">
            PROGRAMA DE DESARROLLO DE PILOTOS FIA
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50 uppercase">
            FEEDER SERIES: F2, F3 & DRIVER ACADEMIES
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-syne uppercase text-white tracking-tight">
          La Vía de Acceso a la Fórmula 1: F2, F3 y Academias
        </h1>
        <p className="text-xs sm:text-sm text-white/70 font-sans mt-2 max-w-4xl leading-relaxed">
          Estructura oficial del automovilismo de monoplazas hacia la Fórmula 1. Requisitos de superlicencia, 
          campeonatos teloneros oficiales y programas de formación técnica de las escuderías.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8 font-sans">
          
          {/* Table of Contents */}
          <WikiTableOfContents items={tocItems} />

          {/* Section 1: Overview */}
          <section id="piramide-feeder" className="space-y-3">
            <h2 className="text-xl font-bold font-syne uppercase text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Compass size={18} className="text-[#FF1E00]" />
              <span>1. La Pirámide de Promoción de la FIA</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              La FIA estableció una escalera deportiva unificada y meritocrática para asegurar que sólo los talentos con preparación 
              técnica, física y mental contrastada alcancen la parrilla de Fórmula 1. 
              La progresión canónica se articula en cuatro escalones:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="bg-[#1b1b26] border border-white/10 p-3 text-center">
                <span className="text-[10px] font-mono text-white/50 uppercase block">Escalón 1</span>
                <span className="text-xs font-bold text-white block mt-1">Karting Internacional</span>
                <span className="text-[10px] text-white/60">CIK-FIA OK / KZ</span>
              </div>
              <div className="bg-[#1b1b26] border border-white/10 p-3 text-center">
                <span className="text-[10px] font-mono text-white/50 uppercase block">Escalón 2</span>
                <span className="text-xs font-bold text-white block mt-1">Fórmula 4 / FRECA</span>
                <span className="text-[10px] text-white/60">Monoplazas Nacionales</span>
              </div>
              <div className="bg-[#1b1b26] border border-white/10 p-3 text-center">
                <span className="text-[10px] font-mono text-cyan-400 uppercase block">Escalón 3</span>
                <span className="text-xs font-bold text-white block mt-1">FIA Fórmula 3</span>
                <span className="text-[10px] text-white/60">Telonero Oficial F1</span>
              </div>
              <div className="bg-[#1b1b26] border border-[#FF1E00]/30 p-3 text-center bg-[#FF1E00]/5">
                <span className="text-[10px] font-mono text-[#FF1E00] uppercase block font-bold">Escalón 4</span>
                <span className="text-xs font-bold text-white block mt-1">FIA Fórmula 2</span>
                <span className="text-[10px] text-[#FF1E00]">Antisala Directa F1</span>
              </div>
            </div>
          </section>

          {/* Section 2: Formula 2 Specification */}
          <section id="formula-2" className="space-y-3">
            <h2 className="text-xl font-bold font-syne uppercase text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Zap size={18} className="text-[#FF1E00]" />
              <span>2. Campeonato de Fórmula 2 de la FIA</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              La F2 es la categoría soporte prioritaria. Utiliza chasis idénticos Dallara diseñados bajo los mismos principios 
              aerodinámicos de efecto suelo de la F1.
            </p>
            <div className="bg-[#1b1b26] border border-white/10 p-4 space-y-3 text-xs text-white/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-syne font-bold text-white uppercase text-xs mb-1">Formato de Fin de Semana</h4>
                  <ul className="space-y-1 text-white/70">
                    <li>• <strong>Viernes:</strong> 45 min Entrenamientos Libres + 30 min Clasificación.</li>
                    <li>• <strong>Sábado:</strong> Sprint Race (Parrilla invertida para el Top 10 de clasificación).</li>
                    <li>• <strong>Domingo:</strong> Feature Race con parada obligatoria en boxes (estrategia de neumáticos).</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-syne font-bold text-white uppercase text-xs mb-1">Desafíos Técnicos</h4>
                  <ul className="space-y-1 text-white/70">
                    <li>• <strong>Sin Dirección Asistida:</strong> Los pilotos deben gestionar fuerzas físicas extremas en el tren delantero.</li>
                    <li>• <strong>Neumáticos Pirelli de Alta Degradación:</strong> Enseña la gestión térmica idéntica a la F1.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Superlicence Points System */}
          <section id="superlicencia" className="space-y-3">
            <h2 className="text-xl font-bold font-syne uppercase text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Award size={18} className="text-[#FF1E00]" />
              <span>4. Sistema de Puntos de Superlicencia FIA (Apéndice L)</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Para debutar en una sesión oficial de Gran Premio, un piloto debe ser mayor de 18 años y acumular 
              <strong> 40 puntos de Superlicencia</strong> en los tres años inmediatamente anteriores en competiciones certificadas:
            </p>
            <div className="overflow-x-auto border border-white/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1b1b26] border-b border-white/10 text-white/60">
                  <tr>
                    <th className="p-2.5">Campeonato Certificado</th>
                    <th className="p-2.5 text-center">1º</th>
                    <th className="p-2.5 text-center">2º</th>
                    <th className="p-2.5 text-center">3º</th>
                    <th className="p-2.5 text-center">4º</th>
                    <th className="p-2.5 text-center">5º</th>
                    <th className="p-2.5 text-center">Puntos Directos F1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black/20 text-white/80">
                  <tr className="hover:bg-white/5">
                    <td className="p-2.5 font-bold text-[#FF1E00]">FIA Fórmula 2</td>
                    <td className="p-2.5 text-center font-bold text-emerald-400">40</td>
                    <td className="p-2.5 text-center font-bold text-emerald-400">40</td>
                    <td className="p-2.5 text-center font-bold text-emerald-400">40</td>
                    <td className="p-2.5 text-center">30</td>
                    <td className="p-2.5 text-center">20</td>
                    <td className="p-2.5 text-center text-emerald-400">Pase Directo (Top 3)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="p-2.5 font-bold text-cyan-400">IndyCar Series</td>
                    <td className="p-2.5 text-center font-bold text-emerald-400">40</td>
                    <td className="p-2.5 text-center">30</td>
                    <td className="p-2.5 text-center">20</td>
                    <td className="p-2.5 text-center">10</td>
                    <td className="p-2.5 text-center">8</td>
                    <td className="p-2.5 text-center text-emerald-400">Pase Directo (Campeón)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="p-2.5 font-bold text-amber-400">FIA Fórmula 3</td>
                    <td className="p-2.5 text-center">30</td>
                    <td className="p-2.5 text-center">25</td>
                    <td className="p-2.5 text-center">20</td>
                    <td className="p-2.5 text-center">15</td>
                    <td className="p-2.5 text-center">12</td>
                    <td className="p-2.5 text-center text-white/50">Requiere F2</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="p-2.5 font-bold text-white/70">FIA WEC (Hypercar)</td>
                    <td className="p-2.5 text-center">30</td>
                    <td className="p-2.5 text-center">25</td>
                    <td className="p-2.5 text-center">20</td>
                    <td className="p-2.5 text-center">15</td>
                    <td className="p-2.5 text-center">10</td>
                    <td className="p-2.5 text-center text-white/50">Requiere F2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Driver Academies */}
          <section id="academias-f1" className="space-y-4">
            <h2 className="text-xl font-bold font-syne uppercase text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#FF1E00]" />
                <span>5. Programas y Academias de Pilotos de F1</span>
              </div>
              <span className="text-[10px] font-mono text-white/50">{DRIVER_ACADEMIES.length} Academias</span>
            </h2>

            {/* Academy selector pills */}
            <div className="flex flex-wrap gap-1.5">
              {DRIVER_ACADEMIES.map((acad) => (
                <button
                  key={acad.id}
                  onClick={() => setSelectedAcademy(acad.id)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase transition-colors border ${
                    selectedAcademy === acad.id
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-[#1b1b26] text-white/70 hover:text-white border-white/10'
                  }`}
                >
                  {acad.name}
                </button>
              ))}
            </div>

            {/* Active Academy Card */}
            <div className="bg-[#1b1b26] border border-white/15 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-lg font-bold font-syne uppercase text-white">{activeAcademy.name}</h3>
                  <span className="text-xs font-mono text-[#FF1E00]">{activeAcademy.team} • Fundada en {activeAcademy.established}</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono text-white/40 block">DIRECTOR DE PROGRAMA</span>
                  <span className="text-xs font-bold text-white">{activeAcademy.director}</span>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed font-sans">{activeAcademy.superlicenceRecord}</p>

              <div>
                <h4 className="text-xs font-bold font-syne text-white uppercase tracking-wider mb-2">
                  Graduados Destacados en la Parrilla:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeAcademy.notableGraduates.map((grad) => (
                    <div key={grad.driverId} className="bg-black/30 border border-white/10 p-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white font-syne">{grad.name}</div>
                        <div className="text-[10px] font-mono text-white/50">{grad.championshipTitle}</div>
                      </div>
                      <WikiLink to={`/f1-real/pilotos/${grad.driverId}`} className="text-[10px] font-mono text-[#FF1E00] flex items-center gap-0.5">
                        <span>Perfil</span>
                        <ArrowRight size={10} />
                      </WikiLink>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-white/60">
                <span className="text-white/40 font-bold">Jóvenes Talentos en Desarrollo (2024): </span>
                <span>{activeAcademy.currentProspects.join(' • ')}</span>
              </div>
            </div>
          </section>

          {/* Section 6: References */}
          <section id="referencias" className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold font-syne uppercase text-white flex items-center gap-2">
              <Bookmark size={14} className="text-[#FF1E00]" />
              <span>6. Referencias Oficiales y Reglamentos de Feeder Series</span>
            </h3>
            <ul className="text-xs font-mono text-white/60 space-y-1 list-decimal list-inside">
              <li>
                <a href="https://www.fiaformula2.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  FIA Formula 2 Championship Official Regulations and Technical Bulletin
                </a>
              </li>
              <li>
                <a href="https://www.fiaformula3.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  FIA Formula 3 Championship Sporting and Technical Regulations
                </a>
              </li>
              <li>
                <a href="https://www.fia.com/international-sporting-code-and-its-appendices" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  FIA International Sporting Code (ISC) Appendix L — Qualification and Conditions for the Issue of the Super Licence
                </a>
              </li>
            </ul>
          </section>

        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4">
          <WikiInfobox
            title="Estructura Feeder FIA"
            subtitle="Formula 2 & Formula 3"
            sections={infoboxSections}
          />
        </div>
      </div>
    </div>
  );
};
