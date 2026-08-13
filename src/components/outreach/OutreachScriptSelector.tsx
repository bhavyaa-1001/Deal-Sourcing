import React from 'react';
import type { OutreachScript, OutreachScriptType } from '../../types';

interface Props {
  scripts: OutreachScript[];
  activeType: OutreachScriptType;
  onSelect: (type: OutreachScriptType) => void;
}

const DESCRIPTIONS: Record<OutreachScriptType, string> = {
  professional: 'Formal corporate acquisition introduction',
  founder: 'Personal message directed toward the founder or owner',
  direct: 'Short first-contact message — suitable for LinkedIn or brief email',
};

const OutreachScriptSelector: React.FC<Props> = ({ scripts, activeType, onSelect }) => {
  return (
    <div className="text-left">
      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-3">
        Select Script Style
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scripts.map((script) => {
          const isActive = script.type === activeType;
          return (
            <button
              key={script.type}
              onClick={() => onSelect(script.type)}
              className={`
                text-left p-4 rounded-lg border transition-all duration-150 cursor-pointer
                ${isActive
                  ? 'border-brand-primary bg-brand-primary-light dark:bg-blue-950/30 shadow-sm'
                  : 'border-default bg-card hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }
              `}
              aria-pressed={isActive}
            >
              <div className={`text-sm font-bold mb-1 ${isActive ? 'text-brand-primary' : 'text-primary'}`}>
                {script.label}
              </div>
              <div className="text-xs text-secondary leading-snug">
                {DESCRIPTIONS[script.type]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OutreachScriptSelector;
