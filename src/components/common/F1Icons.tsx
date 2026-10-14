import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * F1 Monoposto Car Silhouette SVG Icon
 */
export const F1CarIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block ${className}`}
    {...props}
  >
    {/* Rear wing */}
    <path d="M2 10V7h2v3" />
    <path d="M1 8h4" />
    {/* Body chassis streamline */}
    <path d="M4 11l4-1h3l3 2h5l3 1v2l-3 1h-2" />
    {/* Cockpit halo */}
    <path d="M11 10c0-1.5 1-2.5 2.5-2.5h1" />
    {/* Rear wheel */}
    <rect x="4" y="12" width="3" height="5" rx="1" fill="currentColor" stroke="none" />
    {/* Front wheel */}
    <rect x="17" y="12" width="3" height="5" rx="1" fill="currentColor" stroke="none" />
    {/* Front wing */}
    <path d="M20 13h3v2h-3" />
    {/* Ground clearance line */}
    <line x1="7" y1="15" x2="17" y2="15" />
  </svg>
);

/**
 * Chequered Racing Finish Flag SVG Icon
 */
export const ChequeredFlagIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block ${className}`}
    {...props}
  >
    {/* Pole */}
    <path d="M4 2v20h2V2H4z" fill="currentColor" opacity="0.6" />
    {/* Chequered Pattern */}
    <path d="M6 3h3.5v3.5H6z" />
    <path d="M13 3h3.5v3.5H13z" />
    <path d="M9.5 6.5H13V10H9.5z" />
    <path d="M16.5 6.5H20V10h-3.5z" />
    <path d="M6 10h3.5v3.5H6z" />
    <path d="M13 10h3.5v3.5H13z" />
    {/* Outlines of white squares */}
    <rect x="9.5" y="3" width="3.5" height="3.5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <rect x="16.5" y="3" width="3.5" height="3.5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <rect x="6" y="6.5" width="3.5" height="3.5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <rect x="13" y="6.5" width="3.5" height="3.5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
  </svg>
);

/**
 * PitCoin Token Currency SVG Icon
 */
export const PitCoinIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block ${className}`}
    {...props}
  >
    <defs>
      <linearGradient id="pitcoin-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#pitcoin-grad)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
    <circle cx="12" cy="12" r="7.5" fill="none" stroke="#78350f" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.6" />
    {/* Stylized 'F' or 'P' mark */}
    <path
      d="M10 7.5h4.2c1.2 0 2 .8 2 1.8 0 1-.8 1.8-2 1.8H12v2.2h2.5c.3 0 .5.2.5.5s-.2.5-.5.5H12V16.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5V8c0-.3.2-.5.5-.5zm2 2.6h2c.6 0 1-.4 1-.9s-.4-.9-1-.9H12v1.8z"
      fill="#78350f"
    />
  </svg>
);

/**
 * Clean SVG Country Flags
 */
export const CountryFlagSvg: React.FC<{ code: string; className?: string; width?: number; height?: number }> = ({
  code,
  className = '',
  width = 18,
  height = 12,
}) => {
  const norm = code?.toUpperCase().trim();
  switch (norm) {
    case 'NL':
    case '🇳🇱':
      return (
        <svg width={width} height={height} viewBox="0 0 9 6" className={`inline-block rounded-[1px] ${className}`}>
          <rect fill="#AE1C28" width="9" height="2" />
          <rect fill="#FFFFFF" y="2" width="9" height="2" />
          <rect fill="#21468B" y="4" width="9" height="2" />
        </svg>
      );
    case 'GB':
    case '🇬🇧':
      return (
        <svg width={width} height={height} viewBox="0 0 60 30" className={`inline-block rounded-[1px] ${className}`}>
          <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
          <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
          <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
          </g>
        </svg>
      );
    case 'ES':
    case '🇪🇸':
      return (
        <svg width={width} height={height} viewBox="0 0 750 500" className={`inline-block rounded-[1px] ${className}`}>
          <rect width="750" height="500" fill="#c60b1e" />
          <rect width="750" height="250" y="125" fill="#ffc400" />
        </svg>
      );
    case 'MC':
    case '🇲🇨':
      return (
        <svg width={width} height={height} viewBox="0 0 5 4" className={`inline-block rounded-[1px] ${className}`}>
          <rect width="5" height="2" fill="#ce1126" />
          <rect width="5" height="2" y="2" fill="#ffffff" />
        </svg>
      );
    case 'AU':
    case '🇦🇺':
      return (
        <svg width={width} height={height} viewBox="0 0 120 60" className={`inline-block rounded-[1px] ${className}`}>
          <rect width="120" height="60" fill="#00008b" />
          {/* Union Jack in Canton */}
          <g>
            <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
          </g>
          {/* Commonwealth Star & Crux */}
          <circle cx="30" cy="45" r="5" fill="#fff" />
          <circle cx="90" cy="15" r="2.5" fill="#fff" />
          <circle cx="102" cy="24" r="2.5" fill="#fff" />
          <circle cx="90" cy="42" r="2.5" fill="#fff" />
          <circle cx="78" cy="27" r="2.5" fill="#fff" />
        </svg>
      );
    default:
      return null;
  }
};

