import React, { useState } from 'react';
import { ListFilter, ChevronDown, ChevronUp } from 'lucide-react';

export interface TOCItem {
  id: string;
  label: string;
  subItems?: { id: string; label: string }[];
}

interface WikiTableOfContentsProps {
  items: TOCItem[];
}

export const WikiTableOfContents: React.FC<WikiTableOfContentsProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="my-6 p-4 bg-[#1b1b26] border border-white/10 rounded-none max-w-md text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <ListFilter size={14} className="text-[#FF1E00]" />
          <span className="font-bold tracking-wider text-white uppercase text-[11px]">
            Índice de contenidos
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] text-white/50 hover:text-white transition-colors"
        >
          [{isOpen ? 'ocultar' : 'mostrar'}]
        </button>
      </div>

      {/* List */}
      {isOpen && (
        <ol className="space-y-1.5 text-white/70">
          {items.map((item, idx) => (
            <li key={item.id} className="leading-relaxed">
              <button
                onClick={() => scrollTo(item.id)}
                className="hover:text-[#FF1E00] hover:underline transition-colors text-left font-mono"
              >
                <span className="text-white/40 mr-1.5">{idx + 1}.</span>
                <span>{item.label}</span>
              </button>

              {item.subItems && item.subItems.length > 0 && (
                <ol className="pl-4 mt-1 space-y-1 text-white/60">
                  {item.subItems.map((sub, subIdx) => (
                    <li key={sub.id}>
                      <button
                        onClick={() => scrollTo(sub.id)}
                        className="hover:text-[#FF1E00] hover:underline transition-colors text-left"
                      >
                        <span className="text-white/30 mr-1.5">{idx + 1}.{subIdx + 1}</span>
                        <span>{sub.label}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
