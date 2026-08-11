import React from 'react';
import type { ResearchStrategy } from '../../types';
import Card from '../ui/Card';

interface StrategyCardProps {
  strategy: ResearchStrategy;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy }) => {
  const { marketMapping } = strategy;

  return (
    <Card className="text-left flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold text-primary">Market Mapping Methodology</h3>
        <p className="text-base text-secondary mt-1">
          {marketMapping.description}
        </p>
      </div>

      {/* Grid of Mapping Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-default py-6">
        {Object.entries(marketMapping.categories).map(([categoryName, items]) => (
          <div key={categoryName} className="flex flex-col gap-3">
            <h4 className="text-base font-bold text-primary uppercase tracking-wide">
              {categoryName}
            </h4>
            <div className="flex flex-wrap gap-2">
              {items.map(item => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-default rounded text-base font-semibold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Search Strategy Execution Steps */}
      <div className="flex flex-col gap-3">
        <h4 className="text-base font-bold text-primary uppercase tracking-wider">
          Search Strategy Rules
        </h4>
        <ul className="space-y-2 text-base text-secondary list-disc pl-5">
          {marketMapping.searchStrategy.map((step, idx) => (
            <li key={idx} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
export default StrategyCard;
