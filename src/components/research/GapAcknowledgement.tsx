import React from 'react';
import type { ResearchGap } from '../../types';
import Card from '../ui/Card';
import { ShieldAlert, CheckSquare, Square } from 'lucide-react';

interface GapAcknowledgementProps {
  gaps: ResearchGap[];
  onToggleGap: (id: string) => void;
}

export const GapAcknowledgement: React.FC<GapAcknowledgementProps> = ({
  gaps,
  onToggleGap
}) => {
  return (
    <Card className="text-left border border-brand-warning-light bg-amber-50/20 dark:bg-amber-950/10 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-brand-warning-light text-brand-warning rounded-full">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-primary">Acknowledge Open Research Gaps</h3>
          <p className="text-sm text-secondary mt-0.5">
            You must acknowledge the following gaps in directory coverage before approving the search strategy.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {gaps.map(gap => (
          <button
            key={gap.id}
            onClick={() => onToggleGap(gap.id)}
            className={`
              w-full flex items-start gap-4 p-4 rounded-md border text-left cursor-pointer transition-all duration-150 focus-ring
              ${gap.acknowledged
                ? 'bg-brand-success-light/20 border-brand-success text-primary'
                : 'bg-card border-default hover:bg-slate-50 dark:hover:bg-slate-800 text-primary'
              }
            `}
            role="checkbox"
            aria-checked={gap.acknowledged}
          >
            <div className="mt-0.5 shrink-0">
              {gap.acknowledged ? (
                <CheckSquare className="h-6 w-6 text-brand-success" />
              ) : (
                <Square className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <span className="text-base font-semibold leading-relaxed">
              {gap.description}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};
export default GapAcknowledgement;
