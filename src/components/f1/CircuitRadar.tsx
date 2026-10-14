import React from 'react';
import { motion } from 'framer-motion';
import { DriverInRace } from '../../types/strategyMaster';
import { getCircuitProfile, CircuitVectorProfile } from '../../data/circuitProfiles';

interface CircuitRadarProps {
  drivers: DriverInRace[];
  scenarioId: string;
  trackName: string;
}

export const CircuitRadar: React.FC<CircuitRadarProps> = ({ drivers, scenarioId, trackName }) => {
  const profile: CircuitVectorProfile = getCircuitProfile(scenarioId);
  const pathRef = React.useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = React.useState<number>(0);

  React.useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [profile.pathD]);

  // Compute (x, y) coordinates for each driver along the continuous SVG path
  const getCoordinatesForProgress = (progress: number) => {
    if (!pathRef.current || pathLength === 0) {
      return { x: profile.startFinishPoint.x, y: profile.startFinishPoint.y };
    }
    const safeProgress = Math.max(0, Math.min(1, progress % 1));
    const point = pathRef.current.getPointAtLength(safeProgress * pathLength);
    return { x: point.x, y: point.y };
  };

  return (
    <div className="bg-[#0b0b0b] border border-white/10 rounded-sm p-4 relative overflow-hidden select-none">
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[9px] font-mono text-white/50 uppercase">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white font-bold tracking-widest">
            RADAR GPS REAL // {profile.name.toUpperCase()}
          </span>
          <span className="text-[8px] px-1.5 py-0.2 rounded-xs bg-white/10 text-white/70">
            {profile.turns} CURVAS · {profile.lengthKm} KM
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40"><strong className="text-yellow-400">S1</strong> 0-{Math.round(profile.sectors.s1End * 100)}%</span>
          <span className="text-white/40"><strong className="text-sky-400">S2</strong> {Math.round(profile.sectors.s1End * 100)}-{Math.round(profile.sectors.s2End * 100)}%</span>
          <span className="text-white/40"><strong className="text-red-400">S3</strong> {Math.round(profile.sectors.s2End * 100)}-100%</span>
        </div>
      </div>

      <div className="relative w-full aspect-[2.1/1] max-h-60">
        <svg 
          viewBox={profile.viewBox} 
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={`sectorGrad-${profile.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.45" />
              <stop offset={`${Math.round(profile.sectors.s1End * 100)}%`} stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset={`${Math.round(profile.sectors.s2End * 100)}%`} stopColor="#e10600" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="0.45" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track silhouette colored by sector */}
          <path
            ref={pathRef}
            d={profile.pathD}
            fill="none"
            stroke={`url(#sectorGrad-${profile.id})`}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-40"
          />

          {/* Main racing line track */}
          <path
            d={profile.pathD}
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeDasharray="5 2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />

          {/* Start/Finish gantry indicator */}
          <circle
            cx={profile.startFinishPoint.x}
            cy={profile.startFinishPoint.y}
            r="4"
            fill="#e10600"
          />
          <text 
            x={profile.startFinishPoint.textX} 
            y={profile.startFinishPoint.textY} 
            fill="#e10600" 
            fontSize="8" 
            fontFamily="monospace" 
            fontWeight="bold"
            textAnchor="middle"
          >
            S/F
          </text>

          {/* Key Corner Annotations */}
          {profile.keyCorners.slice(0, 3).map((corner) => {
            const pt = getCoordinatesForProgress(corner.progress);
            return (
              <g key={corner.name} className="opacity-40">
                <circle cx={pt.x} cy={pt.y} r="2" fill="white" />
                <text
                  x={pt.x}
                  y={pt.y + 11}
                  fill="white"
                  fontSize="6.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  T{corner.number}
                </text>
              </g>
            );
          })}

          {/* Driver blips on real track */}
          {drivers.map((d) => {
            const { x, y } = getCoordinatesForProgress(d.trackProgress);
            const isPlayer = d.isPlayer;

            return (
              <g key={d.id} className="transition-all duration-300">
                {/* Glow ring for player */}
                {isPlayer && (
                  <circle
                    cx={x}
                    cy={y}
                    r="9.5"
                    fill="none"
                    stroke="#e10600"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                )}

                {/* Car dot with DRS open indicator */}
                <circle
                  cx={x}
                  cy={y}
                  r={isPlayer ? "5.5" : "4"}
                  fill={isPlayer ? "#ffffff" : d.teamColor}
                  stroke={d.hasDrs ? "#22c55e" : isPlayer ? "#e10600" : "#000000"}
                  strokeWidth={d.hasDrs ? "2.5" : isPlayer ? "2" : "1"}
                  filter={isPlayer ? "url(#glow)" : undefined}
                />

                {/* DRS Badge if active */}
                {d.hasDrs && (
                  <circle
                    cx={x + 5}
                    cy={y - 5}
                    r="2.5"
                    fill="#22c55e"
                    className="animate-ping"
                  />
                )}

                {/* Number / Label */}
                <text
                  x={x}
                  y={y - 8}
                  fill={isPlayer ? "#ffffff" : "rgba(255,255,255,0.75)"}
                  fontSize="7"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {isPlayer ? `TÚ (P${d.position})` : `P${d.position}`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Track watermark & DRS info */}
        <div className="absolute bottom-2 right-2 text-right pointer-events-none flex flex-col items-end">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase">
              {profile.drsZones.length} ZONAS DRS DISPONIBLES
            </span>
          </div>
          <span className="text-[10px] font-f1 font-black text-white/30 uppercase tracking-widest block">
            {profile.officialName}
          </span>
        </div>
      </div>
    </div>
  );
};
