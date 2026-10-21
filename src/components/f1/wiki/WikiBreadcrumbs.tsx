import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Home, BookOpen } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface WikiBreadcrumbsProps {
  items: BreadcrumbItem[];
  showBack?: boolean;
}

export const WikiBreadcrumbs: React.FC<WikiBreadcrumbsProps> = ({
  items,
  showBack = true,
}) => {
  const navigate = useNavigate();

  return (
    <nav aria-label="Migas de pan" className="flex items-center justify-between text-xs font-mono text-white/50 border-b border-white/10 pb-3 mb-6">
      <div className="flex items-center flex-wrap gap-1.5">
        <Link
          to="/f1-real"
          className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
        >
          <BookOpen size={13} className="text-[#FF1E00]" />
          <span className="font-bold tracking-wider">ENCICLOPEDIA F1</span>
        </Link>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={idx}>
              <ChevronRight size={12} className="text-white/30 shrink-0" />
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="hover:text-white transition-colors capitalize"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`capitalize ${isLast ? 'text-white font-bold' : ''}`}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} />
          <span>Volver</span>
        </button>
      )}
    </nav>
  );
};
