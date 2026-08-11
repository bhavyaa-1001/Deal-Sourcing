import React from 'react';
import type { ResearchSource } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Link2, AlertCircle } from 'lucide-react';

interface SourceManifestProps {
  sources: ResearchSource[];
}

export const SourceManifest: React.FC<SourceManifestProps> = ({ sources }) => {
  const getStatusBadge = (status: ResearchSource['status']) => {
    switch (status) {
      case 'VALIDATED':
        return <Badge variant="success">VALIDATED</Badge>;
      case 'NEEDS REVIEW':
        return <Badge variant="warning">NEEDS REVIEW</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h3 className="text-xl font-bold text-primary">Research Sources Manifest</h3>
        <p className="text-base text-secondary mt-1">
          Authorized directories, websites, and indices used to compile acquisition targets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map(source => (
          <Card key={source.id} className="flex flex-col gap-4 border border-default">
            {/* Title & Status */}
            <div className="flex justify-between items-start gap-4 border-b border-default pb-3.5">
              <div>
                <h4 className="text-lg font-bold text-primary leading-tight">
                  {source.name}
                </h4>
                <span className="text-sm font-semibold text-secondary mt-1.5 block">
                  {source.type}
                </span>
              </div>
              {getStatusBadge(source.status)}
            </div>

            {/* URL Link */}
            {source.url && (
              <div className="flex items-center gap-1.5 text-base text-brand-primary">
                <Link2 className="h-5 w-5 shrink-0" />
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold break-all hover:underline"
                >
                  {source.url}
                </a>
              </div>
            )}

            {/* Metrics block for validated sources */}
            {source.status === 'VALIDATED' && (
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded border border-default">
                <div>
                  <span className="text-xs font-semibold text-secondary uppercase block">Found</span>
                  <span className="text-lg font-bold text-primary block mt-0.5">
                    {source.companiesFound} companies
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-secondary uppercase block">Quality</span>
                  <span className="text-lg font-bold text-primary block mt-0.5">
                    {Math.round(source.qualityScore * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-secondary uppercase block">Duplication</span>
                  <span className="text-lg font-bold text-primary block mt-0.5">
                    {source.duplicatePercentage}%
                  </span>
                </div>
              </div>
            )}

            {/* Rejected reason warning */}
            {source.status === 'REJECTED' && source.rejectedReason && (
              <div className="flex gap-2.5 bg-red-50 dark:bg-red-950/20 text-brand-danger border border-red-200 dark:border-red-900/50 p-4 rounded-md">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold uppercase tracking-wider block">Reason for Rejection</span>
                  <span className="text-base mt-1 block leading-relaxed font-semibold">
                    {source.rejectedReason}
                  </span>
                </div>
              </div>
            )}

            {/* Notes / Descriptions */}
            {source.notes && (
              <p className="text-base text-secondary leading-relaxed">
                {source.notes}
              </p>
            )}

            {/* Samples */}
            {source.sampleCompanies && source.sampleCompanies.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="font-bold text-primary">Sample hits:</span>
                {source.sampleCompanies.map((comp, idx) => (
                  <span
                    key={comp}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-800 dark:text-slate-300"
                  >
                    {comp}
                    {idx < source.sampleCompanies!.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
export default SourceManifest;
