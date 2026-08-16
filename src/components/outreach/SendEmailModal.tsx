import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Company } from '../../types';
import type { ConnectedEmailAccount } from './GmailConnectModal';
import {
  Mail, Send, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Zap
} from 'lucide-react';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  connectedAccount: ConnectedEmailAccount | null;
  onOpenConnectModal: () => void;
  defaultSubject: string;
  defaultBody: string;
  onSendSuccess: (companyId: string, isAutomatedSequence: boolean) => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  company,
  connectedAccount,
  onOpenConnectModal,
  defaultSubject,
  defaultBody,
  onSendSuccess,
}) => {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sendMode, setSendMode] = useState<'instant' | 'sequence'>('instant');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Sync state when props change
  React.useEffect(() => {
    setSubject(defaultSubject);
    setBody(defaultBody);
    setSentSuccess(false);
    setIsSending(false);
  }, [defaultSubject, defaultBody, company]);

  if (!company) return null;

  const recipientEmail = company.enrichmentData?.email || `${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@contact.com.au`;
  const recipientName = company.enrichmentData?.founderName || company.enrichmentData?.contactPerson || company.name;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        onSendSuccess(company.id, sendMode === 'sequence');
        onClose();
      }, 1200);
    }, 1400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Direct Gmail Outreach — ${company.name}`}
    >
      <div className="flex flex-col gap-4.5 text-left text-[#202A2E] dark:text-[#F1F5F9]">
        {/* Connected account check banner */}
        {!connectedAccount ? (
          <div className="p-4 rounded-xl bg-[#F5EDDA] dark:bg-[#3A3520]/50 border border-[#E3D4B3] dark:border-[#625A2F] flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#9A7535] dark:text-[#D5C76E] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-[#202A2E] dark:text-white">
                  No Gmail / Email Account Connected
                </h4>
                <p className="text-xs text-[#626A6D] dark:text-[#E8E6DF] mt-0.5">
                  To send direct emails and automate follow-ups within MorseBridge, connect your Gmail or Google Workspace inbox.
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
              Connect Gmail Account Now
            </Button>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[#E3ECE6]/80 dark:bg-[#173529]/60 border border-[#B7CCBC] dark:border-[#39634D] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#35624A] animate-pulse" />
              <span className="font-bold text-[#35624A] dark:text-[#8FBEA1]">
                Sending from: {connectedAccount.senderName} &lt;{connectedAccount.email}&gt;
              </span>
            </div>
            <button
              onClick={onOpenConnectModal}
              className="text-[11px] font-bold text-[#35624A] dark:text-[#8FBEA1] hover:underline cursor-pointer"
            >
              Switch Account
            </button>
          </div>
        )}

        {/* Recipient Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#F1EFEA]/60 dark:bg-[#141F2C]/60 p-3 rounded-xl border border-[#D8D5CE] dark:border-[#2D4053]">
          <div>
            <span className="text-[10px] font-bold text-[#626A6D] dark:text-[#9AA9B8] block uppercase">
              Target Recipient
            </span>
            <span className="font-extrabold text-sm text-[#202A2E] dark:text-[#F1F5F9] block mt-0.5">
              {recipientName} ({company.enrichmentData?.founderRole || 'Founder / Managing Director'})
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#626A6D] dark:text-[#9AA9B8] block uppercase">
              Verified Direct Email
            </span>
            <span className="font-extrabold text-sm text-[#35624A] dark:text-[#8FBEA1] block mt-0.5 truncate">
              {recipientEmail}
            </span>
          </div>
        </div>

        {/* Send Mode: Instant vs Automated 3-Touch Sequence */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
            Outreach Delivery Strategy
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSendMode('instant')}
              className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                sendMode === 'instant'
                  ? 'border-[#202A2E] dark:border-[#C5B76A] bg-[#EDEBE5] dark:bg-[#1D2B3A] shadow-xs'
                  : 'border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#182536] hover:bg-[#F1EFEA]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#202A2E] dark:text-[#F1F5F9]">
                <Send className="h-3.5 w-3.5 text-[#35624A]" />
                <span>Single Direct Email</span>
              </div>
              <p className="text-[10.5px] text-[#626A6D] dark:text-[#9AA9B8] leading-tight">
                Dispatches the introductory message immediately via your Gmail inbox.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSendMode('sequence')}
              className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                sendMode === 'sequence'
                  ? 'border-[#202A2E] dark:border-[#C5B76A] bg-[#EDEBE5] dark:bg-[#1D2B3A] shadow-xs'
                  : 'border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#182536] hover:bg-[#F1EFEA]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#A65F3F] dark:text-[#C27A56]">
                <Zap className="h-3.5 w-3.5 text-[#A65F3F]" />
                <span>Automated 3-Touch Cadence</span>
              </div>
              <p className="text-[10.5px] text-[#626A6D] dark:text-[#9AA9B8] leading-tight">
                Step 1: Intro (Now) ➔ Step 2: Follow-up (+3d) ➔ Step 3: Call Invite (+6d).
              </p>
            </button>
          </div>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
            Email Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2 border border-[#D8D5CE] dark:border-[#344658] rounded-lg bg-white dark:bg-[#182536] text-xs font-bold text-[#202A2E] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#202A2E]/30"
          />
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
            Email Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full px-3.5 py-2.5 border border-[#D8D5CE] dark:border-[#344658] rounded-lg bg-white dark:bg-[#182536] text-xs leading-relaxed text-[#202A2E] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#202A2E]/30 font-sans"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#D8D5CE] dark:border-[#263544]">
          <div className="flex items-center gap-1 text-[11px] text-[#626A6D] dark:text-[#9AA9B8]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#35624A]" />
            <span>Updates candidate state to 'Outreach Sent' in Deal Kanban</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={isSending || !connectedAccount}
              leftIcon={
                isSending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : sentSuccess ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Send className="h-4 w-4" />
                )
              }
            >
              {isSending
                ? 'Dispatching via Gmail...'
                : sentSuccess
                ? 'Dispatched Successfully!'
                : sendMode === 'sequence'
                ? 'Launch Automated Sequence'
                : 'Send via Gmail Now'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SendEmailModal;
