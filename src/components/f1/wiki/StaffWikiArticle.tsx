import React from 'react';
import { 
  Wrench, Shield, User, Briefcase, Award, 
  ExternalLink, Layers, CheckCircle2, Bookmark, Car
} from 'lucide-react';
import { 
  TechnicalStaffProfile, getConstructorById, getDriverById, 
  getCarById, getStaffByTeam 
} from '../../../data/f1EncyclopediaData';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiInfobox, InfoboxSection } from './WikiInfobox';
import { WikiTableOfContents, TOCItem } from './WikiTableOfContents';
import { WikiLink } from './WikiLink';

interface StaffWikiArticleProps {
  staff: TechnicalStaffProfile;
}

export const StaffWikiArticle: React.FC<StaffWikiArticleProps> = ({ staff }) => {
  const team = getConstructorById(staff.teamId);
  const assignedDriver = staff.assignedDriverId ? getDriverById(staff.assignedDriverId) : undefined;
  const car = team ? getCarById(team.carId) : undefined;
  const teamStaff = team ? getStaffByTeam(team.id).filter(s => s.id !== staff.id) : [];

  const roleCategoryLabels: Record<TechnicalStaffProfile['roleCategory'], string> = {
    TEAM_PRINCIPAL: 'Director de Equipo (Team Principal)',
    TECHNICAL_DIRECTOR: 'Director Técnico',
    RACE_ENGINEER: 'Ingeniero de Carrera',
    STRATEGY_DIRECTOR: 'Director de Estrategia',
    CHIEF_DESIGNER: 'Jefe de Diseño Aerodinámico',
  };

  const tocItems: TOCItem[] = [
    { id: 'perfil', label: 'Perfil y Datos Biográficos' },
    { id: 'responsabilidades', label: 'Responsabilidades y Funciones Técnicas' },
    { id: 'trayectoria', label: 'Trayectoria Profesional Documentada' },
    { id: 'relaciones', label: 'Relación con Pilotos y Monoplazas' },
    { id: 'equipo-tecnico', label: `Estructura Técnica de ${team ? team.shortName : 'Equipo'}` },
    { id: 'referencias', label: 'Referencias y Fuentes Oficiales' },
  ];

  const infoboxSections: InfoboxSection[] = [
    {
      title: 'Datos Profesionales',
      rows: [
        { label: 'Nombre completo', value: staff.name },
        { label: 'Nacionalidad', value: `${staff.flag} ${staff.nationality}` },
        { label: 'Cargo actual', value: staff.roleTitle },
        { label: 'Área técnica', value: roleCategoryLabels[staff.roleCategory] },
        { 
          label: 'Escudería actual', 
          value: team ? <WikiLink to={`/f1-real/escuderias/${team.id}`}>{staff.teamName}</WikiLink> : staff.teamName 
        },
      ],
    },
    {
      title: 'Asignaciones Deportivas',
      rows: [
        ...(assignedDriver ? [{
          label: 'Piloto asignado',
          value: <WikiLink to={`/f1-real/pilotos/${assignedDriver.id}`}>{assignedDriver.fullName} #{assignedDriver.number}</WikiLink>,
        }] : []),
        ...(car ? [{
          label: 'Monoplaza',
          value: <WikiLink to={`/f1-real/monoplazas/${car.id}`}>{car.name}</WikiLink>,
        }] : []),
        ...(team ? [{
          label: 'Sede operativa',
          value: team.headquarters,
        }] : []),
      ],
    },
    {
      title: 'Auditoría Oficial',
      rows: [
        { label: 'Verificación', value: 'Personal F1 2024 Confirmado' },
        { label: 'Fuente', value: staff.verificationSource },
        { label: 'Última revisión', value: staff.verifiedDate },
      ],
    },
  ];

  return (
    <article className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs
        items={[
          { label: 'Personal Técnico', to: '/f1-real/personal' },
          { label: staff.name },
        ]}
      />

      {/* Article Header */}
      <header className="border-b border-white/15 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold">
            ARTÍCULO TÉCNICO // FÓRMULA 1
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50">
            {roleCategoryLabels[staff.roleCategory]}
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50">
            Revisión: {staff.verifiedDate}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight text-white">
          {staff.name}
        </h1>

        <p className="text-xs font-mono text-white/60 mt-1">
          {staff.roleTitle} en {team ? (
            <WikiLink to={`/f1-real/escuderias/${team.id}`}>{staff.teamName}</WikiLink>
          ) : staff.teamName}.
          {assignedDriver && (
            <> Responsable en pista del monoplaza de <WikiLink to={`/f1-real/pilotos/${assignedDriver.id}`}>{assignedDriver.fullName}</WikiLink> (#{assignedDriver.number}).</>
          )}
        </p>
      </header>

      {/* Main 2-Column Editorial Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Article Text & Tables */}
        <div className="flex-1 space-y-8 w-full min-w-0">
          {/* Lead Paragraph */}
          <section className="bg-white/[0.02] border-l-2 border-[#FF1E00] p-4 text-sm text-white/80 leading-relaxed font-sans">
            <p>
              <strong className="text-white font-semibold">{staff.name}</strong> ({staff.nationality}, {staff.flag}) es un profesional técnico de Fórmula 1 en activo que actualmente se desempeña como{' '}
              <strong className="text-white">{staff.roleTitle}</strong> para la escudería{' '}
              {team ? <WikiLink to={`/f1-real/escuderias/${team.id}`}>{staff.teamName}</WikiLink> : staff.teamName}.
              {assignedDriver ? (
                <> Dentro de la operativa del equipo durante los fines de semana de Gran Premio, ejerce de enlace directo por radio y estratega en tiempo real para el piloto <WikiLink to={`/f1-real/pilotos/${assignedDriver.id}`}>{assignedDriver.fullName}</WikiLink>.</>
              ) : (
                <> Lidera las decisiones operativas, técnicas y estratégicas del equipo dentro del paddock de la Fórmula 1.</>
              )}
            </p>
          </section>

          {/* Table of Contents */}
          <WikiTableOfContents items={tocItems} />

          {/* Section 1: Perfil y Datos Biográficos */}
          <section id="perfil" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <User size={18} className="text-[#FF1E00]" />
              1. Perfil y Datos Biográficos
            </h2>
            <div className="text-sm text-white/70 space-y-2 leading-relaxed">
              <p>
                {staff.name} representa una de las piezas clave en el engranaje de{' '}
                {team ? <WikiLink to={`/f1-real/escuderias/${team.id}`}>{staff.teamName}</WikiLink> : staff.teamName}.
                Con nacionalidad {staff.nationality}, su trabajo vertebra la comunicación entre la fábrica en {team?.headquarters || 'sede del equipo'} y las operaciones en pista en cada cita del calendario.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">Rol Oficial</span>
                  <span className="text-sm font-semibold text-white">{staff.roleTitle}</span>
                </div>
                <div className="bg-[#1b1b26] border border-white/10 p-3 rounded-sm">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">Nacionalidad</span>
                  <span className="text-sm font-semibold text-white">{staff.flag} {staff.nationality} ({staff.countryCode})</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Responsabilidades y Funciones Técnicas */}
          <section id="responsabilidades" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Briefcase size={18} className="text-[#FF1E00]" />
              2. Responsabilidades y Funciones Técnicas
            </h2>
            <div className="bg-[#1b1b26] border border-white/10 p-4 rounded-sm text-sm text-white/80 space-y-3">
              <p className="leading-relaxed">
                {staff.publicResponsibilities}
              </p>
              <div className="pt-2 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-white/40 block font-mono text-[10px] uppercase">Disciplina</span>
                  <span className="font-semibold text-white">{roleCategoryLabels[staff.roleCategory]}</span>
                </div>
                <div>
                  <span className="text-white/40 block font-mono text-[10px] uppercase">Ámbito de decisión</span>
                  <span className="font-semibold text-white">{staff.roleCategory === 'RACE_ENGINEER' ? 'Telemetría de monoplaza y radio' : 'Dirección general y desarrollo'}</span>
                </div>
                <div>
                  <span className="text-white/40 block font-mono text-[10px] uppercase">Sede de trabajo</span>
                  <span className="font-semibold text-white">{team?.headquarters || 'Base de operaciones'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Trayectoria Profesional Documentada */}
          <section id="trayectoria" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Award size={18} className="text-[#FF1E00]" />
              3. Trayectoria Profesional Documentada
            </h2>
            <p className="text-xs text-white/60">
              Hitos verificados y etapas en el automovilismo internacional y la Fórmula 1:
            </p>
            <div className="space-y-2 border-l-2 border-white/15 ml-2 pl-4 py-1">
              {staff.careerPath.map((stage, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#FF1E00] ring-4 ring-[#15151E]" />
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
                    {stage}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Relación con Pilotos y Monoplazas */}
          <section id="relaciones" className="scroll-mt-6 space-y-3">
            <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Car size={18} className="text-[#FF1E00]" />
              4. Relación con Pilotos y Monoplazas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assignedDriver ? (
                <div className="bg-[#1b1b26] border border-white/10 p-4 rounded-sm space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#FF1E00] font-bold block">
                    Piloto en Pista
                  </span>
                  <div className="flex items-center gap-3">
                    <img 
                      src={assignedDriver.headshotUrl} 
                      alt={assignedDriver.fullName} 
                      className="w-12 h-12 rounded-full object-cover border border-white/20 bg-black/40"
                    />
                    <div>
                      <h4 className="font-syne font-bold text-white text-sm">
                        <WikiLink to={`/f1-real/pilotos/${assignedDriver.id}`}>
                          {assignedDriver.fullName}
                        </WikiLink>
                      </h4>
                      <p className="text-xs font-mono text-white/60">
                        Dorsal #{assignedDriver.number} • {assignedDriver.country}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-white/70 pt-2 border-t border-white/10">
                    Interlocución en carrera durante todas las sesiones (FP1, FP2, FP3, Qualy, Sprint y Carrera), ajuste de diferencial, mapas de motor y balance de frenada.
                  </p>
                </div>
              ) : (
                <div className="bg-[#1b1b26] border border-white/10 p-4 rounded-sm space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#FF1E00] font-bold block">
                    Alineación de Pilotos
                  </span>
                  <p className="text-xs text-white/80">
                    Supervisa la alineación oficial de {staff.teamName} compuesta por los pilotos titulares:
                  </p>
                  <ul className="text-xs space-y-1 font-mono text-white/90">
                    {team?.driverIds.map(dId => {
                      const d = getDriverById(dId);
                      return d ? (
                        <li key={dId} className="flex items-center gap-1.5">
                          <span>•</span>
                          <WikiLink to={`/f1-real/pilotos/${d.id}`}>{d.fullName} #{d.number}</WikiLink>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}

              {car && (
                <div className="bg-[#1b1b26] border border-white/10 p-4 rounded-sm space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#FF1E00] font-bold block">
                    Monoplaza Asignado
                  </span>
                  <h4 className="font-syne font-bold text-white text-sm">
                    <WikiLink to={`/f1-real/monoplazas/${car.id}`}>{car.name}</WikiLink>
                  </h4>
                  <p className="text-xs text-white/60 font-mono">
                    Chasis: {car.chassis} • {car.powerUnit}
                  </p>
                  <p className="text-xs text-white/70 pt-2 border-t border-white/10">
                    Monoplaza de efecto suelo conforme a la reglamentación técnica de la FIA 2024 con {car.weightKg} kg de peso reglamentario mínimo.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Section 5: Estructura Técnica de la Escudería */}
          {teamStaff.length > 0 && (
            <section id="equipo-tecnico" className="scroll-mt-6 space-y-3">
              <h2 className="text-xl font-bold font-syne text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                <Layers size={18} className="text-[#FF1E00]" />
                5. Estructura Técnica de {team ? team.shortName : 'Equipo'}
              </h2>
              <p className="text-xs text-white/60">
                Otros cargos y compañeros técnicos documentados en el organigrama oficial:
              </p>
              <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 font-mono uppercase text-white/60">
                    <tr>
                      <th className="p-2.5">Nombre</th>
                      <th className="p-2.5">Cargo Oficial</th>
                      <th className="p-2.5">Nacionalidad</th>
                      <th className="p-2.5">Asignación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {teamStaff.map(member => (
                      <tr key={member.id} className="hover:bg-white/[0.02]">
                        <td className="p-2.5 font-semibold text-white">
                          <WikiLink to={`/f1-real/personal/${member.id}`}>{member.name}</WikiLink>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-white/70">{member.roleTitle}</td>
                        <td className="p-2.5 font-mono text-[11px]">{member.flag} {member.nationality}</td>
                        <td className="p-2.5 font-mono text-[11px] text-[#FF1E00]">
                          {member.assignedDriverName || 'Fábrica y Equipo General'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Section 6: Referencias */}
          <section id="referencias" className="scroll-mt-6 space-y-3 pt-4 border-t border-white/15">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Bookmark size={14} className="text-[#FF1E00]" />
              Referencias y Fuentes Documentales
            </h2>
            <ol className="list-decimal list-inside text-xs font-mono text-white/60 space-y-1.5">
              <li>
                FIA Formula One World Championship Entry List & Technical Passes Oficiales 2024.
              </li>
              <li>
                {staff.verificationSource}. Consultado y contrastado el {staff.verifiedDate}.
              </li>
              <li>
                Comunicaciones de radiotelemetría pública oficial de Fórmula 1 / FOM TV Feed 2024.
              </li>
            </ol>
          </section>

          {/* Categories Footer */}
          <footer className="border-t border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-white/40 uppercase">Categorías:</span>
              <WikiLink to="/f1-real/personal">Personal Técnico de Fórmula 1</WikiLink>
              <span className="text-white/20">•</span>
              <span className="text-white/60">{roleCategoryLabels[staff.roleCategory]}</span>
              <span className="text-white/20">•</span>
              {team && (
                <WikiLink to={`/f1-real/escuderias/${team.id}`}>{team.officialName}</WikiLink>
              )}
            </div>
          </footer>
        </div>

        {/* Right Column: Encylopedia Infobox */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <WikiInfobox
            title={staff.name}
            subtitle={staff.roleTitle}
            accentColor={team?.primaryColor || '#FF1E00'}
            sections={infoboxSections}
          />
        </div>
      </div>
    </article>
  );
};
