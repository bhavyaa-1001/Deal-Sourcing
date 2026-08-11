import React from 'react';
import type { ResearchStrategy } from '../../types';
import { HelpCircle, Database, CheckSquare, Layers } from 'lucide-react';
import Card from '../ui/Card';

interface ResearchSummaryProps {
  strategy: ResearchStrategy;
}

export const ResearchSummary: React.FC<ResearchSummaryProps> = ({ strategy }) => {
  const { metrics } = strategy;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
      {/* Metric 1 */}
      <Card className="flex items-center gap-4 border-l-4 border-l-brand-primary">
        <div className="p-3 bg-brand-primary-light rounded-full text-brand-primary-dark">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
            Research Questions
          </span>
          <span className="text-2xl font-black text-primary block mt-0.5">
            {metrics.researchQuestionsCompleted} / {metrics.researchQuestionsTotal} Completed
          </span>
        </div>
      </Card>

      {/* Metric 2 */}
      <Card className="flex items-center gap-4 border-l-4 border-l-indigo-500">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-full text-indigo-500">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
            Market Coverage
          </span>
          <span className="text-2xl font-black text-primary block mt-0.5">
            {metrics.coveragePercentage}% Mapping Yield
          </span>
        </div>
      </Card>

      {/* Metric 3 */}
      <Card className="flex items-center gap-4 border-l-4 border-l-brand-success">
        <div className="p-3 bg-brand-success-light rounded-full text-brand-success">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
            Validated Sources
          </span>
          <span className="text-2xl font-black text-primary block mt-0.5">
            {metrics.validatedSourcesCount} Active Sources
          </span>
        </div>
      </Card>

      {/* Metric 4 */}
      <Card className={`flex items-center gap-4 border-l-4 ${metrics.openGapsCount > 0 ? 'border-l-brand-warning' : 'border-l-brand-success'}`}>
        <div className={`p-3 rounded-full ${metrics.openGapsCount > 0 ? 'bg-brand-warning-light text-brand-warning' : 'bg-brand-success-light text-brand-success'}`}>
          <CheckSquare className="h-6 w-6" />
        </div>
        <div>
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
            Open Research Gaps
          </span>
          <span className="text-2xl font-black text-primary block mt-0.5">
            {metrics.openGapsCount} to Acknowledge
          </span>
        </div>
      </Card>
    </div>
  );
};
export default ResearchSummary;
