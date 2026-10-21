import React from 'react';
import { 
  Shield, Wrench, Trophy, User, Bookmark, 
  MapPin, Flag, ExternalLink, ChevronRight 
} from 'lucide-react';
import { 
  ConstructorProfile, getDriverById, getCarById, 
  getTechnicalStaffById, getStaffByTeam 
} from '../../../data/f1EncyclopediaData';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiInfobox, InfoboxSection } from './WikiInfobox';
import { WikiTableOfContents, TOCItem } from './WikiTableOfContents';
import { WikiLink } from './WikiLink';

interface TeamWikiArticleProps {
  team: ConstructorProfile;
}

export const TeamWikiArticle: React.FC<TeamWikiArticleProps> = ({ team }) => {
  const drivers = team.driverIds.map(id => getDriverById(id)).filter(Boolean);
  const car = getCarById(team.carId);
  const teamPrincipal = getTechnicalStaffById(team.teamPrincipalId);
  const technicalDirector = getTechnicalStaffById(team.technicalDirectorId);
  const allTeamStaff = getStaffByTeam(team.id);

  const tocItems: TOCItem[] = [
    { id: 'identidad', label: 'Estructura e Identidad' },
    { id: 'unidad-potencia', label: 'Unidad de Potencia y Motorización' },
    { id: 'temporada-2024', label: 'Temporada Actual (2024)' },
    { id: 'pilotos', label: 'Alineación de Pilotos Titulares' },
    { id: 'personal-tecnico', label: 'Dirección Técnica y Personal' },
    { id: 'patrocinadores', label: 'Patrocinadores Principales' },
    { id: 'referencias', label: 'Referencias y Fuentes Oficiales' },
  ];

  const infoboxSections: InfoboxSection[] = [
    {
      title: 'Datos de la Escudería',
      rows: [
        { label: 'Nombre oficial', value: team.officialName },
        { label: 'Nombre de competición', value: team.competitionName },
        { label: 'Sede pública', value: team.headquarters },
        { label: 'Nacionalidad', value: `${team.flag} ${team.country}` },
        { label: 'Debut en F1', value: `Año ${team.firstEntryYear}` },
      ],
    },
    {
      title: 'Estructura Técnica y Deportiva',
      rows: [
        { 
          label: 'Team Principal', 
          value: teamPrincipal ? (
            <WikiLink to={`/f1-real/personal/${teamPrincipal.id}`}>{team.teamPrincipal}</WikiLink>
          ) : team.teamPrincipal 
        },
        { 
          label: 'Director Técnico', 
          value: technicalDirector ? (
            <WikiLink to={`/f1-real/personal/${technicalDirector.id}`}>{team.technicalDirector}</WikiLink>
          ) : team.technicalDirector 
        },
        { 
          label: 'Fabricante de motor', 
          value: team.powerUnitManufacturer 
        },
        { 
          label: 'Denominación motor', 
          value: <span className="font-bold text-cyan-400">{team.powerUnitDesignation}</span> 
        },
        { 
          label: 'Monoplaza 2024', 
          value: car ? <WikiLink to={`/f1-real/monoplazas/${car.id}`}>{team.chassisName}</WikiLink> : team.chassisName 
        },
        { 
          label: 'Pilotos titulares', 
          value: (
            <div className="space-y-1">
              {drivers.map(d => d && (
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
      title: 'Campeonato Mundial 2024',
      rows: [
        { 
          label: 'Posición actual', 
          value: <span className="font-black text-[#FF1E00] text-sm">P{team.championshipPosition} ({team.points} pts)</span> 
        },
        { label: 'Victorias 2024', value: team.seasonStats.wins },
        { label: 'Podios 2024', value: team.seasonStats.podiums },
        { label: 'Poles 2024', value: team.seasonStats.poles },
        { label: 'Vueltas rápidas', value: team.seasonStats.fastestLaps },
        { label: 'Grandes Premios', value: team.seasonStats.gpsContested },
      ],
    },
  ];

  return (
    <article className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs
        items={[
          { label: 'Escuderías', to: '/f1-real/escuderias' },
          { label: team.shortName },
        ]}
      />

      {/* Header */}
      <header className="border-b border-white/15 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-[#FF1E00] uppercase font-bold">
            ARTÍCULO ENCICLOPÉDICO // CONSTRUCTOR OFICIAL FIA
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50">
            Última revisión: {team.verifiedDate}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight text-white">
          {team.officialName}
        </h1>

        <p className="text-xs font-mono text-white/60 mt-1">
          Constructor de Fórmula 1 con sede en {team.headquarters}. Compite en la temporada actual con el monoplaza{' '}
          {car ? <WikiLink to={`/f1-real/monoplazas/${car.id}`}>{team.chassisName}</WikiLink> : team.chassisName}.
        </p>
      </header>

      {/* 2-Column Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Text Content */}
        <div className="flex-1 space-y-8 w-full min-w-0">
          {/* Lead Paragraph */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm font-sans leading-relaxed text-white/80 border-b border-white/10 pb-6">
            <p>
              <strong className="text-white font-bold">{team.officialName}</strong> (nombre de competición:{' '}
              <strong className="text-white">{team.competitionName}</strong>, código FIA:{' '}
              <strong className="text-white">{team.code}</strong>) es una escudería y constructor de automovilismo de velocidad que participa en el Campeonato Mundial de Fórmula 1 de la FIA. Su sede operativa principal se encuentra en {team.headquarters}. En la temporada actual, el equipo está liderado deportivamente por el Team Principal{' '}
              {teamPrincipal ? <WikiLink to={`/f1-real/personal/${teamPrincipal.id}`}>{team.teamPrincipal}</WikiLink> : team.teamPrincipal} y la dirección técnica está a cargo de {technicalDirector ? <WikiLink to={`/f1-real/personal/${technicalDirector.id}`}>{team.technicalDirector}</WikiLink> : team.technicalDirector}.
            </p>
            <p className="mt-3">
              Su alineación titular para la temporada está compuesta por{' '}
              {drivers.map((d, idx) => (
                <span key={d?.id || idx}>
                  {idx > 0 && ' y '}
                  {d ? <WikiLink to={`/f1-real/pilotos/${d.id}`}>{d.fullName} (#{d.number})</WikiLink> : ''}
                </span>
              ))}. En la clasificación de constructores ocupa la <strong className="text-white">posición {team.championshipPosition}ª</strong> habiendo sumado un total de <strong className="text-white">{team.points} puntos</strong>.
            </p>
          </div>

          {/* Table of Contents */}
          <WikiTableOfContents items={tocItems} />

          {/* Section 1: Identidad */}
          <section id="identidad" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              1. Estructura e Identidad
            </h2>
            <div className="text-xs font-mono text-white/70 space-y-2 leading-relaxed">
              <p>
                La escudería compite con licencia deportiva de {team.country} ({team.flag}). Habiendo debutado en la categoría en el año {team.firstEntryYear}, la entidad opera bajo la denominación comercial {team.officialName}. Su centro de operaciones en {team.headquarters} aloja los departamentos de diseño computacional de fluidos (CFD), ingeniería de materiales compuestos y montaje del chasis {team.chassisName}.
              </p>
            </div>
          </section>

          {/* Section 2: Unidad de Potencia */}
          <section id="unidad-potencia" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              2. Unidad de Potencia y Motorización
            </h2>
            <div className="p-4 bg-[#1b1b26] border border-white/10 space-y-3 text-xs font-mono">
              <p className="text-white/80 leading-relaxed">
                El monoplaza monta la unidad de potencia híbrida de especificación <strong className="text-cyan-400 font-bold">{team.powerUnitDesignation}</strong> desarrollada por {team.powerUnitManufacturer}. El sistema incorpora un propulsor térmico V6 de 1.6 litros con turbocompresor e inyección directa a 500 bares de presión, junto a los módulos eléctricos de recuperación de energía cinético (MGU-K) y térmico (MGU-H).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">FABRICANTE Y ENSAMBLAJE</span>
                  <span className="text-white font-bold">{team.powerUnitManufacturer}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">SUMINISTRADOR TÉCNICO</span>
                  <span className="text-white font-bold">{team.powerUnitSupplier}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Temporada 2024 */}
          <section id="temporada-2024" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1 flex items-center justify-between">
              <span>3. Temporada Actual (2024)</span>
              <span className="text-[10px] font-mono text-[#FF1E00] font-bold">P{team.championshipPosition} • {team.points} PTS</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
              <div className="p-3 bg-[#1b1b26] border border-white/10">
                <span className="text-[9px] text-white/40 uppercase block">VICTORIAS</span>
                <span className="text-xl font-black font-syne text-[#FF1E00]">{team.seasonStats.wins}</span>
              </div>
              <div className="p-3 bg-[#1b1b26] border border-white/10">
                <span className="text-[9px] text-white/40 uppercase block">PODIOS</span>
                <span className="text-xl font-black font-syne text-white">{team.seasonStats.podiums}</span>
              </div>
              <div className="p-3 bg-[#1b1b26] border border-white/10">
                <span className="text-[9px] text-white/40 uppercase block">POLE POSITIONS</span>
                <span className="text-xl font-black font-syne text-amber-400">{team.seasonStats.poles}</span>
              </div>
              <div className="p-3 bg-[#1b1b26] border border-white/10">
                <span className="text-[9px] text-white/40 uppercase block">GPS DISPUTADOS</span>
                <span className="text-xl font-black font-syne text-white">{team.seasonStats.gpsContested}</span>
              </div>
            </div>
          </section>

          {/* Section 4: Pilotos */}
          <section id="pilotos" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              4. Alineación de Pilotos Titulares
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {drivers.map(d => d && (
                <div key={d.id} className="p-4 bg-[#1b1b26] border border-white/10 flex items-center gap-4">
                  <img
                    src={d.headshotUrl}
                    alt={d.fullName}
                    className="w-14 h-14 object-cover object-top border border-white/10 bg-black/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-[#FF1E00] font-bold">DORSAL #{d.number}</span>
                    <WikiLink to={`/f1-real/pilotos/${d.id}`} className="font-bold text-sm block truncate">
                      {d.fullName}
                    </WikiLink>
                    <span className="text-[10px] font-mono text-white/50 block">
                      P{d.championshipPosition} Mundial • {d.points} puntos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Personal Técnico */}
          <section id="personal-tecnico" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              5. Dirección Técnica y Personal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {allTeamStaff.map(s => (
                <div key={s.id} className="p-3 bg-[#1b1b26] border border-white/10">
                  <span className="text-[9px] text-[#FF1E00] uppercase font-bold block">{s.roleCategory.replace('_', ' ')}</span>
                  <WikiLink to={`/f1-real/personal/${s.id}`} className="font-bold text-sm block mt-0.5">
                    {s.name}
                  </WikiLink>
                  <span className="text-[10px] text-white/50 block mt-0.5">{s.roleTitle}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: Patrocinadores */}
          <section id="patrocinadores" className="space-y-3 pt-2">
            <h2 className="text-lg font-bold font-syne uppercase tracking-wider text-white border-b border-white/15 pb-1">
              6. Patrocinadores Principales (Públicos)
            </h2>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {team.mainSponsors.map((sp, idx) => (
                <span key={idx} className="px-3 py-1 bg-[#1b1b26] border border-white/10 text-white/70">
                  {sp}
                </span>
              ))}
            </div>
          </section>

          {/* Section 7: Referencias */}
          <section id="referencias" className="space-y-3 pt-4 border-t border-white/10">
            <h2 className="text-sm font-bold font-syne uppercase tracking-wider text-white">
              7. Referencias y Fuentes Oficiales
            </h2>
            <ol className="list-decimal list-inside text-[11px] font-mono text-white/50 space-y-1">
              <li>FIA Formula One World Constructors Championship 2024 Standings.</li>
              <li>FOM Media Entry List & Technical Regulations 2024.</li>
              <li>Comunicados oficiales de fábrica de {team.officialName}.</li>
            </ol>
          </section>

          {/* Categories Bar */}
          <div className="p-3 bg-[#181822] border border-white/10 text-xs font-mono flex flex-wrap items-center gap-2">
            <span className="text-white/40 font-bold flex items-center gap-1 uppercase text-[10px]">
              <Bookmark size={11} className="text-[#FF1E00]" /> CATEGORÍAS:
            </span>
            <WikiLink to="/f1-real/escuderias" className="text-white/70 hover:text-white">Escuderías de Fórmula 1 en activo</WikiLink>
            <span className="text-white/20">|</span>
            <span className="text-white/70">Constructores de F1 con sede en {team.country}</span>
            <span className="text-white/20">|</span>
            <span className="text-white/70">Temporada 2024 de Fórmula 1</span>
          </div>
        </div>

        {/* Infobox */}
        <WikiInfobox
          title={team.officialName}
          subtitle={`Código FIA: ${team.code}`}
          accentColor={team.primaryColor}
          badge={`P${team.championshipPosition} CONSTRUCTORES`}
          image={{
            src: team.logoUrl,
            alt: `Logotipo oficial de ${team.officialName}`,
            caption: `Emblema oficial de ${team.shortName}`,
            attribution: 'Formula One Management / Escudería oficial',
          }}
          sections={infoboxSections}
        />
      </div>
    </article>
  );
};
