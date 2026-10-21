import React from 'react';
import { Link } from 'react-router-dom';

interface WikiLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const WikiLink: React.FC<WikiLinkProps> = ({
  to,
  children,
  className = '',
  title,
}) => {
  return (
    <Link
      to={to}
      title={title}
      className={`text-[#FF1E00] hover:text-[#ff4a33] underline decoration-[#FF1E00]/40 hover:decoration-[#FF1E00] underline-offset-2 transition-colors font-medium ${className}`}
    >
      {children}
    </Link>
  );
};
