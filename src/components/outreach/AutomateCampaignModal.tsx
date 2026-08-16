import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Company } from '../../types';
import type { ConnectedEmailAccount } from './GmailConnectModal';
import {
  Zap, Mail, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Check
} from 'lucide-react';

interface AutomateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  connectedAccount: ConnectedEmailAccount | null;
  onOpenConnectModal: () => void;
  onLaunchSuccess: (companyIds: string[]) => void;
}

export const AutomateCampaignModal: React.FC<AutomateCampaignModalProps> = ({
  isOpen,
  onClose,
  companies,
  connectedAccount,
  onOpenConnectModal,
  onLaunchSuccess,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(companies.map(c => c.id));
  const cadenceInterval = 3; // 3 days
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      setLaunchSuccess(true);
      setTimeout(() => {
        onLaunchSuccess(selectedIds);
        onClose();
      }, 1200);
    }, 1600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automate Multi-Touch Outreach Campaign"
    >
      <div className="flex flex-col gap-5 text-left text-[#202A2E] dark:text-[#F1F5F9]">
        {/* Account check banner */}
        {!connectedAccount ? (
          <div className="p-4 rounded-xl bg-[#F5EDDA] dark:bg-[#3A3520]/50 border border-[#E3D4B3] dark:border-[#625A2F] flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#9A7535] dark:text-[#D5C76E] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-[#202A2E] dark:text-white">
                  Connect Gmail to Automate
                </h4>
                <p className="text-xs text-[#626A6D] dark:text-[#E8E6DF] mt-0.5">
                  Automating multi-touch founder sequences requires a connected Gmail or Google Workspace inbox.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenConnectModal}
              leftIcon={<Mail className="h-4 w-4" />}
              className="self-start"
            >
              Connect Gmail Account
            </Button>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[#E3ECE6]/80 dark:bg-[#173529]/60 border border-[#B7CCBC] dark:border-[#39634D] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#35624A] animate-pulse" />
              <span className="font-bold text-[#35624A] dark:text-[#8FBEA1]">
                Sender: {connectedAccount.senderName} ({connectedAccount.email})
              </span>
            </div>
            <span className="text-[10px] font-black uppercase text-[#35624A] dark:text-[#8FBEA1]">
              Automated Throttle Active
            </span>
          </div>
        )}

        {/* Campaign Sequence Structure */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
            Automated 3-Touch Acquisition Sequence Cadence
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg border border-[#D8D5CE] dark:border-[#344658] bg-[#F1EFEA]/60 dark:bg-[#141F2C]/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#A65F3F] uppercase">Touchpoint 1 (Day 1)</span>
              <h5 className="font-bold text-xs text-[#202A2E] dark:text-[#F1F5F9]">Direct Introduction</h5>
              <p className="text-[10px] text-[#626A6D] dark:text-[#9AA9B8]">Strategic M&A acquisition interest tailored to founder tenure.</p>
            </div>
            <div className="p-3 rounded-lg border border-[#D8D5CE] dark:border-[#344658] bg-[#F1EFEA]/60 dark:bg-[#141F2C]/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#9A7535] uppercase">Touchpoint 2 (+{cadenceInterval} Days)</span>
              <h5 className="font-bold text-xs text-[#202A2E] dark:text-[#F1F5F9]">Succession Follow-up</h5>
              <p className="text-[10px] text-[#626A6D] dark:text-[#9AA9B8]">Highlights retirement timeline & clean equity transition value.</p>
            </div>
            <div className="p-3 rounded-lg border border-[#D8D5CE] dark:border-[#344658] bg-[#F1EFEA]/60 dark:bg-[#141F2C]/60 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#35624A] uppercase">Touchpoint 3 (+{cadenceInterval * 2} Days)</span>
              <h5 className="font-bold text-xs text-[#202A2E] dark:text-[#F1F5F9]">Direct Call Invite</h5>
              <p className="text-[10px] text-[#626A6D] dark:text-[#9AA9B8]">Direct PBX phone follow-up and confidential NDA discussion.</p>
            </div>
          </div>
        </div>

        {/* Candidate Target List */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
              Select Target Candidates ({selectedIds.length}/{companies.length})
            </label>
            <button
              type="button"
              onClick={() => setSelectedIds(selectedIds.length === companies.length ? [] : companies.map(c => c.id))}
              className="text-xs font-bold text-[#35624A] dark:text-[#8FBEA1] hover:underline cursor-pointer"
            >
              {selectedIds.length === companies.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#D8D5CE] dark:border-[#344658] p-2 rounded-lg bg-white dark:bg-[#182536] scrollbar-thin">
            {companies.map(c => {
              const isSelected = selectedIds.includes(c.id);
              const founder = c.enrichmentData?.founderName || c.enrichmentData?.contactPerson || 'Key Executive';
              const email = c.enrichmentData?.email || 'direct@company.com.au';

              return (
                <div
                  key={c.id}
                  onClick={() => toggleSelect(c.id)}
                  className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-[#35624A] bg-[#E3ECE6]/50 dark:bg-[#173529]/40 text-[#202A2E] dark:text-[#F1F5F9]'
                      : 'border-transparent text-[#626A6D] dark:text-[#9AA9B8] hover:bg-[#F1EFEA]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-[#35624A] border-[#35624A] text-white' : 'border-[#D8D5CE]'}`}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="font-bold truncate">{c.name}</span>
                    <span className="text-[#626A6D] dark:text-[#9AA9B8] truncate">• {founder}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#35624A] dark:text-[#8FBEA1] shrink-0 truncate ml-2">
                    {email}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#D8D5CE] dark:border-[#263544]">
          <div className="flex items-center gap-1 text-[11px] text-[#626A6D] dark:text-[#9AA9B8]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#35624A]" />
            <span>Sends with anti-spam random jitter (30-90s between emails)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLaunch}
              disabled={isLaunching || !connectedAccount || selectedIds.length === 0}
              leftIcon={
                isLaunching ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : launchSuccess ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Zap className="h-4 w-4" />
                )
              }
            >
              {isLaunching
                ? 'Launching Sequences...'
                : launchSuccess
                ? 'Sequences Active!'
                : `Automate Outreach for ${selectedIds.length} Targets`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AutomateCampaignModal;
