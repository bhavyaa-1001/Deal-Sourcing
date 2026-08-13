import React from 'react';
import type { OutreachChannel } from '../../types';
import type { Company } from '../../types';
import { Mail, ExternalLink } from 'lucide-react';

interface Props {
  channel: OutreachChannel;
  onChange: (channel: OutreachChannel) => void;
  company: Company;
}

const OutreachChannelSelector: React.FC<Props> = ({ channel, onChange, company }) => {
  const ed = company.enrichmentData;

  const recipientEmail = ed?.email && !ed.email.toLowerCase().includes('not available') ? ed.email : null;
  const recipientName = ed?.contactPerson || ed?.founderName || null;
  const linkedinUrl = ed?.linkedin && ed.linkedin.trim().length > 0 ? ed.linkedin : null;

  return (
    <div className="border border-default rounded-lg p-5 bg-card text-left">
      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-3">
        Outreach Channel
      </span>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onChange('email')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-bold transition-all cursor-pointer
            ${channel === 'email'
              ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
              : 'border-default bg-card text-secondary hover:bg-slate-50 dark:hover:bg-slate-800'
            }
          `}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          onClick={() => onChange('linkedin')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-bold transition-all cursor-pointer
            ${channel === 'linkedin'
              ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
              : 'border-default bg-card text-secondary hover:bg-slate-50 dark:hover:bg-slate-800'
            }
          `}
        >
          <ExternalLink className="h-4 w-4" />
          LinkedIn
        </button>
      </div>

      <div className="space-y-2 text-sm">
        {channel === 'email' && (
          <>
            {recipientName && (
              <div className="flex gap-3 items-start">
                <span className="text-secondary font-semibold w-20 shrink-0">To</span>
                <span className="text-primary font-medium">{recipientName}</span>
              </div>
            )}
            {recipientEmail ? (
              <div className="flex gap-3 items-start">
                <span className="text-secondary font-semibold w-20 shrink-0">Email</span>
                <a href={`mailto:${recipientEmail}`} className="text-brand-primary font-medium hover:underline break-all">
                  {recipientEmail}
                </a>
              </div>
            ) : (
              <div className="flex gap-3 items-start">
                <span className="text-secondary font-semibold w-20 shrink-0">Email</span>
                <span className="text-slate-400 italic text-sm">Not available</span>
              </div>
            )}
          </>
        )}
        {channel === 'linkedin' && (
          <>
            {recipientName && (
              <div className="flex gap-3 items-start">
                <span className="text-secondary font-semibold w-20 shrink-0">Contact</span>
                <span className="text-primary font-medium">{recipientName}</span>
              </div>
            )}
            {linkedinUrl ? (
              <div className="flex gap-3 items-start">
                <span className="text-secondary font-semibold w-20 shrink-0">LinkedIn</span>
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary font-medium hover:underline">
                  View Profile ↗
                </a>
              </div>
            ) : (
              <div className="flex gap-3 items-start">
                <span className="text-secondary font-semibold w-20 shrink-0">LinkedIn</span>
                <span className="text-slate-400 italic text-sm">Not available</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OutreachChannelSelector;
