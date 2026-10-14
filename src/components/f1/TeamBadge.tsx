import React, { useState } from 'react';
import { getTeamMeta, TeamMeta } from '../../lib/teamData';

interface TeamBadgeProps {
  teamName: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  teamName,
  size = 'md',
  showName = false,
  className = '',
}) => {
  const meta: TeamMeta = getTeamMeta(teamName);
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6 p-0.5',
    md: 'w-9 h-9 p-1',
    lg: 'w-12 h-12 p-1.5',
  };

  const textClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo container with team-colored subtle border and backdrop */}
      <div
        className={`relative shrink-0 rounded-sm bg-[#111111] border flex items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 ${sizeClasses[size]}`}
        style={{
          borderColor: `${meta.color}40`,
          boxShadow: `0 0 10px ${meta.badgeGlow}`,
        }}
        title={meta.name}
      >
        {!imgError ? (
          <img
            src={meta.logoUrl}
            alt={meta.shortName}
            className="w-full h-full object-contain filter drop-shadow-sm"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-f1 font-black text-[9px] text-black rounded-xs"
            style={{ backgroundColor: meta.color }}
          >
            {meta.code}
          </div>
        )}
      </div>

      {showName && (
        <div className="flex flex-col">
          <span className={`font-f1 font-bold uppercase text-white ${textClasses[size]}`}>
            {meta.shortName}
          </span>
          <span className="text-[8px] font-mono text-white/40 uppercase">
            {meta.engine}
          </span>
        </div>
      )}
    </div>
  );
};
