import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ExternalLink, Trophy, Flag, Shield, User, Wrench, 
  Gauge, Calendar, MapPin, Activity, ArrowRight, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { 
  DriverProfile, ConstructorProfile, CarProfile, TechnicalStaffProfile, CircuitProfile,
  getDriverById, getConstructorById, getCarById, getTechnicalStaffById, getCircuitById,
  F1_DRIVERS_DATA, F1_CONSTRUCTORS_DATA, F1_CARS_DATA, F1_TECHNICAL_STAFF_DATA, F1_CIRCUITS_DATA
} from '../../../data/f1EncyclopediaData';
import { getDriverWikipediaPhoto, getCircuitVectorMap, getCircuitPhotosFromF1Fansite } from '../../../services/f1PhotoService';

export type SelectedEntity = 
  | { type: 'driver'; data: DriverProfile }
  | { type: 'team'; data: ConstructorProfile }
  | { type: 'car'; data: CarProfile }
  | { type: 'staff'; data: TechnicalStaffProfile }
  | { type: 'circuit'; data: CircuitProfile };

interface EntityDetailModalProps {
  entity: SelectedEntity | null;
  onClose: () => void;
  onSelectEntity: (entity: SelectedEntity) => void;
}

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  entity,
  onClose,
  onSelectEntity,
}) => {
  if (!entity) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0d0d0d] border border-white/15 rounded-none shadow-2xl text-white scrollbar-thin scrollbar-thumb-white/20"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#121212]/95 backdrop-blur-md border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#e10600] font-bold">
                LIGHTS OUT // FICHA OFICIAL FIA
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">
                {entity.type.toUpperCase()}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {entity.type === 'driver' && (
              <DriverDetailView 
                driver={entity.data} 
                onSelectEntity={onSelectEntity} 
              />
            )}
            {entity.type === 'team' && (
              <TeamDetailView 
                team={entity.data} 
                onSelectEntity={onSelectEntity} 
              />
            )}
            {entity.type === 'car' && (
              <CarDetailView 
                car={entity.data} 
                onSelectEntity={onSelectEntity} 
              />
            )}
            {entity.type === 'staff' && (
              <StaffDetailView 
                staff={entity.data} 
                onSelectEntity={onSelectEntity} 
              />
            )}
            {entity.type === 'circuit' && (
              <CircuitDetailView 
                circuit={entity.data} 
                onSelectEntity={onSelectEntity} 
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* -------------------------------------------------------------
   DRIVER DETAIL VIEW
   ------------------------------------------------------------- */
const DriverDetailView: React.FC<{
  driver: DriverProfile;
  onSelectEntity: (entity: SelectedEntity) => void;
}> = ({ driver, onSelectEntity }) => {
  const team = getConstructorById(driver.teamId);
  const teammate = getDriverById(driver.teammateId);
  const car = getCarById(driver.carId);
  const raceEngineer = getTechnicalStaffById(driver.raceEngineerId);

  return (
    <div className="space-y-8">
      {/* Top Profile Hero */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/10 pb-8">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
          <img
            src={getDriverWikipediaPhoto(driver.id) || driver.headshotUrl}
            alt={driver.fullName}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = driver.headshotUrl;
            }}
          />
          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-white/20 text-xs font-mono font-black text-[#e10600]">
            #{driver.number}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xl">{driver.flag}</span>
            <span className="text-xs font-mono tracking-widest text-white/50 uppercase">
              {driver.country} ({driver.countryCode}) • {driver.age} AÑOS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black font-syne uppercase tracking-tight">
            {driver.fullName}
          </h2>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
            {team && (
              <button
                onClick={() => onSelectEntity({ type: 'team', data: team })}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono font-bold text-white transition-colors"
                style={{ borderColor: driver.teamColour }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: driver.teamColour }} />
                <span>{driver.teamName}</span>
                <ChevronRight size={12} className="text-white/40" />
              </button>
            )}
            <span className="text-xs font-mono px-2.5 py-1 bg-[#e10600]/10 border border-[#e10600]/30 text-[#e10600] font-bold">
              P{driver.championshipPosition} MUNDIAL • {driver.points} PTS
            </span>
          </div>

          <p className="text-xs text-white/50 font-mono">
            Nacimiento: {driver.birthDate} ({driver.birthPlace}) • Debut: {driver.careerSummary.firstEntryYear}
          </p>
        </div>
      </div>

      {/* Season 2024 Key Telemetry */}
      <div>
        <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-white/40 mb-4 flex items-center gap-2">
          <Activity size={14} className="text-[#e10600]" />
          ESTADÍSTICAS OFICIALES TEMPORADA 2024
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">VICTORIAS</span>
            <span className="text-2xl font-black font-syne text-[#e10600]">{driver.seasonStats.wins}</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">PODIOS</span>
            <span className="text-2xl font-black font-syne text-white">{driver.seasonStats.podiums}</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">POLE POSITIONS</span>
            <span className="text-2xl font-black font-syne text-amber-400">{driver.seasonStats.poles}</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">VUELTAS RÁPIDAS</span>
            <span className="text-2xl font-black font-syne text-cyan-400">{driver.seasonStats.fastestLaps}</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">MEJOR RESULTADO</span>
            <span className="text-sm font-bold font-mono text-white">{driver.seasonStats.bestFinish}</span>
            <span className="text-[9px] font-mono text-white/40 block truncate">{driver.seasonStats.bestFinishRace}</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">CARRERAS EN PUNTOS</span>
            <span className="text-2xl font-black font-syne text-emerald-400">{driver.seasonStats.pointsFinishes}</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">ABANDONOS (DNF)</span>
            <span className="text-2xl font-black font-syne text-red-400">{driver.seasonStats.dnfs}</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">VUELTAS EN CABEZA</span>
            <span className="text-2xl font-black font-syne text-white">{driver.seasonStats.lapsLed}</span>
          </div>
        </div>
      </div>

      {/* Relaciones & Cross-links */}
      <div>
        <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-white/40 mb-4 flex items-center gap-2">
          <Shield size={14} className="text-[#e10600]" />
          RELACIONES Y ENLACES DIRECTOS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {teammate && (
            <button
              onClick={() => onSelectEntity({ type: 'driver', data: teammate })}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase block">COMPAÑERO DE EQUIPO</span>
                <span className="text-xs font-bold font-syne text-white">{teammate.fullName} #{teammate.number}</span>
              </div>
              <ChevronRight size={14} className="text-white/40 group-hover:text-white transition-colors" />
            </button>
          )}

          {car && (
            <button
              onClick={() => onSelectEntity({ type: 'car', data: car })}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase block">MONOPLAZA 2024</span>
                <span className="text-xs font-bold font-syne text-white">{car.name}</span>
              </div>
              <ChevronRight size={14} className="text-white/40 group-hover:text-white transition-colors" />
            </button>
          )}

          {raceEngineer && (
            <button
              onClick={() => onSelectEntity({ type: 'staff', data: raceEngineer })}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase block">INGENIERO DE CARRERA</span>
                <span className="text-xs font-bold font-syne text-white">{raceEngineer.name}</span>
              </div>
              <ChevronRight size={14} className="text-white/40 group-hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Historial de GPs 2024 */}
      {driver.grandPrixHistory.length > 0 && (
        <div>
          <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-white/40 mb-4 flex items-center gap-2">
            <Flag size={14} className="text-[#e10600]" />
            HISTORIAL DESTACADO EN GRANDES PREMIOS 2024
          </h3>
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-white/5 text-[10px] text-white/50 uppercase tracking-widest border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Ronda</th>
                  <th className="py-2.5 px-3">Gran Premio</th>
                  <th className="py-2.5 px-3">Parrilla</th>
                  <th className="py-2.5 px-3">Resultado</th>
                  <th className="py-2.5 px-3">Puntos</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {driver.grandPrixHistory.map((gp) => (
                  <tr key={gp.round} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 text-white/40">R{gp.round}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{gp.gpName}</td>
                    <td className="py-2.5 px-3 text-white/60">P{gp.grid}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold ${
                        gp.finish === 1 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : gp.finish === 'DNF' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-white/10 text-white'
                      }`}>
                        {gp.finish === 'DNF' ? 'DNF' : `P${gp.finish}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#e10600]">+{gp.points} PTS</td>
                    <td className="py-2.5 px-3 text-[10px] text-white/50">{gp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification footer */}
      <div className="p-3 bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] font-mono text-white/40 gap-2">
        <span>FUENTE: {driver.verificationSource}</span>
        <span>VERIFICACIÓN: {driver.verifiedDate}</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   TEAM / CONSTRUCTOR DETAIL VIEW
   ------------------------------------------------------------- */
const TeamDetailView: React.FC<{
  team: ConstructorProfile;
  onSelectEntity: (entity: SelectedEntity) => void;
}> = ({ team, onSelectEntity }) => {
  const drivers = team.driverIds.map(id => getDriverById(id)).filter(Boolean) as DriverProfile[];
  const car = getCarById(team.carId);
  const teamPrincipal = getTechnicalStaffById(team.teamPrincipalId);
  const technicalDirector = getTechnicalStaffById(team.technicalDirectorId);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/10 pb-8">
        <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 p-4 bg-white/5 border border-white/10 flex items-center justify-center">
          <img
            src={team.logoUrl}
            alt={team.officialName}
            className="max-h-full max-w-full object-contain filter drop-shadow"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logos/mercedes.png';
            }}
          />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-white/50 uppercase">
            <span>{team.flag}</span>
            <span>{team.country} ({team.code}) • Debut: {team.firstEntryYear}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black font-syne uppercase tracking-tight">
            {team.officialName}
          </h2>

          <p className="text-xs text-white/60 font-mono">
            Sede: {team.headquarters}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
            <span className="text-xs font-mono px-3 py-1 bg-[#e10600]/10 border border-[#e10600]/30 text-[#e10600] font-bold">
              P{team.championshipPosition} CONSTRUCTORES • {team.points} PTS
            </span>
            <span className="text-xs font-mono px-2.5 py-1 bg-white/5 border border-white/15 text-white/70">
              {team.seasonStats.wins} VICTORIAS • {team.seasonStats.podiums} PODIOS (2024)
            </span>
          </div>
        </div>
      </div>

      {/* Powertrain & Technical Specifications */}
      <div>
        <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-white/40 mb-4 flex items-center gap-2">
          <Wrench size={14} className="text-[#e10600]" />
          UNIDAD DE POTENCIA Y ESPECIFICACIÓN TÉCNICA
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">FABRICANTE MOTOR</span>
            <span className="text-sm font-bold font-mono text-white">{team.powerUnitManufacturer}</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">DENOMINACIÓN MOTOR</span>
            <span className="text-sm font-bold font-mono text-cyan-400">{team.powerUnitDesignation}</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block">PROVEEDOR TÉCNICO</span>
            <span className="text-sm font-bold font-mono text-white">{team.powerUnitSupplier}</span>
          </div>
        </div>
      </div>

      {/* Drivers in this team */}
      <div>
        <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-white/40 mb-4 flex items-center gap-2">
          <User size={14} className="text-[#e10600]" />
          PILOTOS TITULARES DE LA TEMPORADA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {drivers.map(d => (
            <button
              key={d.id}
              onClick={() => onSelectEntity({ type: 'driver', data: d })}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex items-center gap-4 group"
            >
              <img
                src={d.headshotUrl}
                alt={d.fullName}
                className="w-14 h-14 object-cover object-top border border-white/10 bg-black/40"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-white/40 block">PILOTO TITULAR #{d.number}</span>
                <span className="text-base font-bold font-syne text-white block truncate">{d.fullName}</span>
                <span className="text-xs font-mono text-[#e10600] font-bold">P{d.championshipPosition} • {d.points} PTS</span>
              </div>
              <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Leadership & Staff */}
      <div>
        <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-white/40 mb-4 flex items-center gap-2">
          <Shield size={14} className="text-[#e10600]" />
          LIDERAZGO Y DIRECCIÓN TÉCNICA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teamPrincipal && (
            <button
              onClick={() => onSelectEntity({ type: 'staff', data: teamPrincipal })}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase block">TEAM PRINCIPAL</span>
                <span className="text-sm font-bold font-syne text-white">{teamPrincipal.name}</span>
                <span className="text-[10px] font-mono text-white/50 block">{teamPrincipal.roleTitle}</span>
              </div>
              <ChevronRight size={14} className="text-white/40 group-hover:text-white transition-colors" />
            </button>
          )}

          {technicalDirector && (
            <button
              onClick={() => onSelectEntity({ type: 'staff', data: technicalDirector })}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase block">DIRECCIÓN TÉCNICA</span>
                <span className="text-sm font-bold font-syne text-white">{technicalDirector.name}</span>
                <span className="text-[10px] font-mono text-white/50 block">{technicalDirector.roleTitle}</span>
              </div>
              <ChevronRight size={14} className="text-white/40 group-hover:text-white transition-colors" />
            </button>
          )}

          {car && (
            <button
              onClick={() => onSelectEntity({ type: 'car', data: car })}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors flex items-center justify-between group sm:col-span-2"
            >
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase block">MONOPLAZA 2024 ASOCIADO</span>
                <span className="text-sm font-bold font-syne text-white">{car.name}</span>
                <span className="text-[10px] font-mono text-white/50 block">{car.chassis}</span>
              </div>
              <ChevronRight size={14} className="text-white/40 group-hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Main Partners & Sponsors */}
      <div>
        <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-white/40 mb-3">
          PATROCINADORES Y SOCIOS PRINCIPALES (PÚBLICOS)
        </h3>
        <div className="flex flex-wrap gap-2">
          {team.mainSponsors.map((sponsor, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-white/5 border border-white/10 text-xs font-mono text-white/70"
            >
              {sponsor}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] font-mono text-white/40 gap-2">
        <span>FUENTE: {team.verificationSource}</span>
        <span>VERIFICACIÓN: {team.verifiedDate}</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   CAR DETAIL VIEW
   ------------------------------------------------------------- */
const CarDetailView: React.FC<{
  car: CarProfile;
  onSelectEntity: (entity: SelectedEntity) => void;
}> = ({ car, onSelectEntity }) => {
  const team = getConstructorById(car.teamId);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <span className="text-xs font-mono tracking-widest text-[#e10600] uppercase font-bold">
          TEMPORADA {car.season} // ESPECIFICACIÓN HOMOLOGADA FIA
        </span>
        <h2 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight">
          {car.name}
        </h2>
        {team && (
          <button
            onClick={() => onSelectEntity({ type: 'team', data: team })}
            className="text-xs font-mono text-white/60 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Escudería: {car.teamName}</span>
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Chassis & Power Unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-white/40 uppercase block">CHASIS Y MONOCASCO</span>
          <p className="text-xs font-mono text-white leading-relaxed">{car.chassis}</p>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-white/40 uppercase block">UNIDAD DE POTENCIA</span>
          <p className="text-xs font-mono text-cyan-400 font-bold leading-relaxed">{car.powerUnit}</p>
          <span className="text-[10px] font-mono text-white/50 block">Proveedor: {car.powerUnitSupplier}</span>
        </div>
      </div>

      {/* Regulatory Dimensions & Weight */}
      <div>
        <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-white/40 mb-4 flex items-center gap-2">
          <Gauge size={14} className="text-[#e10600]" />
          DIMENSIONES Y LÍMITES REGLAMENTARIOS FIA
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white/5 border border-white/10">
            <span className="text-[9px] font-mono text-white/40 uppercase block">PESO MÍNIMO (SIN COMBUSTIBLE)</span>
            <span className="text-xl font-black font-syne text-white">{car.weightKg} KG</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10">
            <span className="text-[9px] font-mono text-white/40 uppercase block">ANCHURA MÁXIMA</span>
            <span className="text-xl font-black font-syne text-white">{car.dimensions.overallWidthMm} MM</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10">
            <span className="text-[9px] font-mono text-white/40 uppercase block">ALTURA MÁXIMA</span>
            <span className="text-xl font-black font-syne text-white">{car.dimensions.overallHeightMm} MM</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10">
            <span className="text-[9px] font-mono text-white/40 uppercase block">BATALLA (WHEELBASE) MÁX</span>
            <span className="text-xl font-black font-syne text-white">{car.dimensions.wheelbaseMm} MM</span>
          </div>
        </div>
      </div>

      {/* Suspension Setup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-white/40 uppercase block">SUSPENSIÓN DELANTERA</span>
          <p className="text-xs font-mono text-white font-bold">{car.suspension.front}</p>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-white/40 uppercase block">SUSPENSIÓN TRASERA</span>
          <p className="text-xs font-mono text-white font-bold">{car.suspension.rear}</p>
        </div>
      </div>

      {/* Aero Concept & Verified Innovations */}
      <div className="space-y-4">
        <div className="p-4 bg-white/5 border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-white/40 uppercase block">CONCEPTO AERODINÁMICO DESTACADO</span>
          <p className="text-xs font-mono text-white/80 leading-relaxed">{car.aeroHighlights}</p>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-white/40 uppercase block">INNOVACIONES Y SOLUCIONES TÉCNICAS CONFIRMADAS</span>
          <ul className="space-y-2 text-xs font-mono text-white/80">
            {car.technicalInnovations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#e10600]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] font-mono text-white/40 gap-2">
        <span>FUENTE: {car.verificationSource}</span>
        <span>VERIFICACIÓN: {car.verifiedDate}</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   STAFF DETAIL VIEW
   ------------------------------------------------------------- */
const StaffDetailView: React.FC<{
  staff: TechnicalStaffProfile;
  onSelectEntity: (entity: SelectedEntity) => void;
}> = ({ staff, onSelectEntity }) => {
  const team = getConstructorById(staff.teamId);
  const assignedDriver = staff.assignedDriverId ? getDriverById(staff.assignedDriverId) : null;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase">
          <span>{staff.flag}</span>
          <span>{staff.nationality} • {staff.roleCategory.replace('_', ' ')}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight">
          {staff.name}
        </h2>
        <span className="text-sm font-mono text-[#e10600] font-bold block">
          {staff.roleTitle}
        </span>
        {team && (
          <button
            onClick={() => onSelectEntity({ type: 'team', data: team })}
            className="text-xs font-mono text-white/60 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Escudería: {staff.teamName}</span>
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Driver Association (Crucial for Race Engineers) */}
      {assignedDriver && (
        <div className="p-4 bg-white/5 border border-white/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase block">PILOTO ASIGNADO EN RADIO</span>
            <span className="text-base font-bold font-syne text-white">{assignedDriver.fullName} #{assignedDriver.number}</span>
          </div>
          <button
            onClick={() => onSelectEntity({ type: 'driver', data: assignedDriver })}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white transition-colors flex items-center gap-1"
          >
            <span>Ver Piloto</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Responsibilities */}
      <div className="p-4 bg-white/5 border border-white/10 space-y-2">
        <span className="text-[10px] font-mono text-white/40 uppercase block">RESPONSABILIDADES PÚBLICAS Y DEPORTIVAS</span>
        <p className="text-xs font-mono text-white/80 leading-relaxed">{staff.publicResponsibilities}</p>
      </div>

      {/* Career Path */}
      <div className="p-4 bg-white/5 border border-white/10 space-y-3">
        <span className="text-[10px] font-mono text-white/40 uppercase block">TRAYECTORIA PROFESIONAL VERIFICADA</span>
        <ul className="space-y-2 text-xs font-mono text-white/80">
          {staff.careerPath.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-3 bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] font-mono text-white/40 gap-2">
        <span>FUENTE: {staff.verificationSource}</span>
        <span>VERIFICACIÓN: {staff.verifiedDate}</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   CIRCUIT DETAIL VIEW
   ------------------------------------------------------------- */
const CircuitDetailView: React.FC<{
  circuit: CircuitProfile;
  onSelectEntity: (entity: SelectedEntity) => void;
}> = ({ circuit }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase">
          <span>{circuit.flag}</span>
          <span>RONDA {circuit.round} • {circuit.country} ({circuit.countryCode})</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight">
          {circuit.circuitName}
        </h2>
        <span className="text-xs font-mono text-white/50 block">
          Nombre oficial: {circuit.officialName} ({circuit.city})
        </span>
      </div>

      {/* Track Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white/5 border border-white/10">
          <span className="text-[10px] font-mono text-white/40 uppercase block">LONGITUD</span>
          <span className="text-xl font-black font-syne text-white">{circuit.lengthKm} KM</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/10">
          <span className="text-[10px] font-mono text-white/40 uppercase block">VUELTAS DE CARRERA</span>
          <span className="text-xl font-black font-syne text-[#e10600]">{circuit.raceLaps}</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/10">
          <span className="text-[10px] font-mono text-white/40 uppercase block">DISTANCIA TOTAL</span>
          <span className="text-xl font-black font-syne text-white">{circuit.totalDistanceKm} KM</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/10">
          <span className="text-[10px] font-mono text-white/40 uppercase block">CURVAS</span>
          <span className="text-xl font-black font-syne text-white">{circuit.turnsCount}</span>
          <span className="text-[9px] font-mono text-white/40 block">({circuit.leftTurns} Izq / {circuit.rightTurns} Der)</span>
        </div>
      </div>

      {/* Wikipedia Vector Map & F1-Fansite Gallery */}
      <div className="space-y-4">
        <div className="bg-black/50 border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/50">
            <span className="uppercase text-[#e10600] font-bold">Mapa Vectorial del Trazado (Wikipedia)</span>
            <span>{circuit.circuitName} ({circuit.lengthKm} km)</span>
          </div>
          <div className="w-full max-h-56 bg-black/40 flex items-center justify-center p-3 border border-white/5">
            <img
              src={getCircuitVectorMap(circuit.id)}
              alt={`Mapa vectorial oficial de ${circuit.circuitName} de Wikipedia`}
              className="max-h-48 w-auto object-contain filter contrast-125"
            />
          </div>
        </div>

        {/* F1-Fansite Track Gallery */}
        <div className="bg-white/5 border border-white/10 p-4 space-y-2">
          <span className="text-[10px] font-mono text-white/50 uppercase block font-bold">
            Fotografías en Pista (F1-Fansite)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {getCircuitPhotosFromF1Fansite(circuit.id, 4).map((imgUrl, i) => (
              <div key={i} className="aspect-video bg-black/50 overflow-hidden border border-white/10">
                <img
                  src={imgUrl}
                  alt={`${circuit.circuitName} F1-Fansite foto ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Lap Record vs Qualifying Record */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-[#e10600] uppercase font-bold block">
            RÉCORD OFICIAL DE VUELTA EN CARRERA
          </span>
          <span className="text-2xl font-black font-mono text-white">{circuit.lapRecord.time}</span>
          <p className="text-xs font-mono text-white/60">
            {circuit.lapRecord.driver} ({circuit.lapRecord.year}) • {circuit.lapRecord.car}
          </p>
        </div>

        {circuit.qualifyingRecord && (
          <div className="p-4 bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
              MEJOR VUELTA EN CLASIFICACIÓN
            </span>
            <span className="text-2xl font-black font-mono text-white">{circuit.qualifyingRecord.time}</span>
            <p className="text-xs font-mono text-white/60">
              {circuit.qualifyingRecord.driver} ({circuit.qualifyingRecord.year})
            </p>
          </div>
        )}
      </div>

      {/* DRS Zones */}
      <div className="p-4 bg-white/5 border border-white/10 space-y-2">
        <span className="text-[10px] font-mono text-white/40 uppercase block">
          ZONAS DE DRS ACTIVAS ({circuit.drsZonesCount})
        </span>
        <ul className="space-y-1 text-xs font-mono text-white/80">
          {circuit.drsZonesLocations.map((loc, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">DRS #{idx + 1}:</span>
              <span>{loc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2024 Session Results if completed */}
      {circuit.sessionResults2024 && (
        <div className="p-4 bg-white/5 border border-white/15 space-y-3">
          <span className="text-[10px] font-mono text-[#e10600] uppercase font-bold block">
            RESULTADOS OFICIALES GRAN PREMIO 2024
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-white/40 block text-[9px]">GANADOR:</span>
              <span className="font-bold text-white">{circuit.sessionResults2024.winnerDriver}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[9px]">POLE POSITION:</span>
              <span className="font-bold text-amber-400">{circuit.sessionResults2024.poleDriver}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[9px]">VUELTA RÁPIDA:</span>
              <span className="font-bold text-cyan-400">{circuit.sessionResults2024.fastestLapDriver}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
