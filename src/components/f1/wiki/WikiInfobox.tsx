import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export interface InfoboxRow {
  label: string;
  value: React.ReactNode;
  isHeader?: boolean;
}

export interface InfoboxSection {
  title?: string;
  rows: InfoboxRow[];
}

interface WikiInfoboxProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  badge?: string;
  image?: {
    src: string;
    alt: string;
    caption?: string;
    attribution?: string;
  };
  sections: InfoboxSection[];
}

export const WikiInfobox: React.FC<WikiInfoboxProps> = ({
  title,
  subtitle,
  accentColor = '#FF1E00',
  badge,
  image,
  sections,
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);

  return (
    <aside
      aria-label={`Ficha informativa de ${title}`}
      className="w-full lg:w-80 shrink-0 bg-[#1b1b26] border border-white/15 rounded-none text-white text-xs font-mono shadow-xl overflow-hidden self-start"
    >
      {/* Infobox Header */}
      <div
        className="p-3 text-center border-b border-white/15 relative"
        style={{ borderTop: `4px solid ${accentColor}` }}
      >
        {badge && (
          <span
            className="inline-block text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 mb-1 text-black font-mono"
            style={{ backgroundColor: accentColor }}
          >
            {badge}
          </span>
        )}
        <h2 className="text-base font-black font-syne uppercase tracking-tight text-white leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-white/60 font-mono mt-0.5">
            {subtitle}
          </p>
        )}

        {/* Mobile toggle button */}
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="lg:hidden absolute right-3 top-3 p-1 text-white/50 hover:text-white"
        >
          {isMobileExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isMobileExpanded && (
        <div className="space-y-0">
          {/* Hero Image / Logo */}
          {image && (
            <div className="p-3 bg-black/30 border-b border-white/10 flex flex-col items-center">
              <div className="w-full max-h-56 overflow-hidden flex items-center justify-center bg-black/40 border border-white/5">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="max-h-52 w-auto object-contain object-top"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://media.formula1.com/d_driver_fallback_image.png';
                  }}
                />
              </div>
              {image.caption && (
                <p className="text-[10px] text-white/50 text-center mt-2 leading-tight">
                  {image.caption}
                </p>
              )}
              {image.attribution && (
                <span className="text-[8px] text-white/30 text-center block mt-0.5">
                  Foto: {image.attribution}
                </span>
              )}
            </div>
          )}

          {/* Sections & Rows */}
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="border-b border-white/10 last:border-b-0">
              {section.title && (
                <div className="bg-[#242433] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 border-b border-white/10 text-center">
                  {section.title}
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <tbody>
                  {section.rows.map((row, rIdx) => {
                    if (row.isHeader) {
                      return (
                        <tr key={rIdx} className="bg-[#20202e] border-b border-white/5">
                          <th colSpan={2} className="px-3 py-1.5 text-[10px] font-bold text-center text-[#FF1E00] uppercase tracking-wider">
                            {row.label}
                          </th>
                        </tr>
                      );
                    }
                    return (
                      <tr key={rIdx} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                        <th className="py-2 px-3 text-[11px] font-normal text-white/50 w-2/5 align-top">
                          {row.label}
                        </th>
                        <td className="py-2 px-3 text-xs text-white w-3/5 font-medium align-top">
                          {row.value}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
