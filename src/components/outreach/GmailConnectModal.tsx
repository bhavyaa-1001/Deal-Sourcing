import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Mail, CheckCircle2, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export interface ConnectedEmailAccount {
  email: string;
  senderName: string;
  provider: 'gmail' | 'google_workspace' | 'outlook' | 'smtp';
  connectedAt: string;
  dailyQuotaRemaining: number;
}

interface GmailConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (account: ConnectedEmailAccount) => void;
  currentAccount?: ConnectedEmailAccount | null;
  onDisconnect?: () => void;
}

export const GmailConnectModal: React.FC<GmailConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  currentAccount,
  onDisconnect,
}) => {
  const [email, setEmail] = useState(currentAccount?.email || 'bhavya.acquisitions@gmail.com');
  const [senderName, setSenderName] = useState(currentAccount?.senderName || 'Bhavya — M&A Partner');
  const [provider, setProvider] = useState<'gmail' | 'google_workspace' | 'outlook' | 'smtp'>('gmail');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleSimulateOAuth = () => {
    if (!email || !senderName) return;
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        onConnect({
          email,
          senderName,
          provider,
          connectedAt: new Date().toISOString(),
          dailyQuotaRemaining: 495,
        });
        setAuthSuccess(false);
        onClose();
      }, 900);
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentAccount ? 'Manage Connected Email Account' : 'Connect Gmail / Email for Direct Outreach'}
    >
      <div className="flex flex-col gap-5 text-left text-[#202A2E] dark:text-[#F1F5F9]">
        {currentAccount ? (
          <div className="p-4 rounded-xl bg-[#E3ECE6]/80 dark:bg-[#173529]/60 border border-[#B7CCBC] dark:border-[#39634D] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#35624A] text-white flex items-center justify-center">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#202A2E] dark:text-[#F1F5F9]">
                    {currentAccount.senderName}
                  </h4>
                  <p className="text-xs text-[#35624A] dark:text-[#8FBEA1] font-semibold">
                    {currentAccount.email} • {currentAccount.provider === 'gmail' ? 'Google Workspace / Gmail' : currentAccount.provider}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#35624A] text-white">
                CONNECTED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-white/70 dark:bg-[#141F2C]/70 p-2.5 rounded-lg border border-[#B7CCBC]/50 dark:border-[#39634D]">
              <div>
                <span className="text-[10px] font-bold text-[#626A6D] dark:text-[#9AA9B8] block uppercase">Daily Sending Quota</span>
                <span className="font-extrabold text-[#35624A] dark:text-[#8FBEA1] text-sm">{currentAccount.dailyQuotaRemaining} / 500 remaining</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#626A6D] dark:text-[#9AA9B8] block uppercase">Deliverability Score</span>
                <span className="font-extrabold text-[#35624A] dark:text-[#8FBEA1] text-sm">99.4% (SPF/DKIM/MX Active)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#B7CCBC]/60 dark:border-[#39634D]">
              <p className="text-[11px] text-[#626A6D] dark:text-[#9AA9B8]">
                Emails generated in MorseBridge will be dispatched directly through your Gmail inbox.
              </p>
              {onDisconnect && (
                <button
                  onClick={() => {
                    onDisconnect();
                    onClose();
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer ml-3 shrink-0"
                >
                  Disconnect Account
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="p-3.5 rounded-xl bg-[#F5EDDA] dark:bg-[#3A3520]/50 border border-[#E3D4B3] dark:border-[#625A2F] flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#9A7535] dark:text-[#D5C76E] shrink-0 mt-0.5" />
              <div className="text-xs text-[#626A6D] dark:text-[#E8E6DF] leading-relaxed">
                <strong className="text-[#202A2E] dark:text-white">Direct In-App Delivery:</strong> Connect your Gmail or corporate email to send personalized acquisition outreach directly from MorseBridge without copying or leaving the platform.
              </div>
            </div>

            {/* Provider selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
                Email Provider
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'gmail', label: 'Gmail' },
                  { id: 'google_workspace', label: 'Google Workspace' },
                  { id: 'outlook', label: 'Outlook / 365' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id as any)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      provider === p.id
                        ? 'border-[#202A2E] dark:border-[#C5B76A] bg-[#202A2E] text-white dark:bg-[#C5B76A] dark:text-[#182536]'
                        : 'border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#182536] text-[#626A6D] dark:text-[#9AA9B8] hover:bg-[#F1EFEA]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
                Your Sender Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. partner@acquisitions.com"
                className="w-full px-3.5 py-2.5 border border-[#D8D5CE] dark:border-[#344658] rounded-lg bg-white dark:bg-[#182536] text-sm font-semibold text-[#202A2E] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#202A2E]/30"
              />
            </div>

            {/* Sender Display Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
                Sender Display Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Bhavya — Managing Partner"
                className="w-full px-3.5 py-2.5 border border-[#D8D5CE] dark:border-[#344658] rounded-lg bg-white dark:bg-[#182536] text-sm font-semibold text-[#202A2E] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#202A2E]/30"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#F1EFEA]/80 dark:bg-[#141F2C] border border-[#D8D5CE] dark:border-[#2D4053] flex items-center gap-2.5 text-xs text-[#626A6D] dark:text-[#9AA9B8]">
              <ShieldCheck className="h-4 w-4 text-[#35624A] dark:text-[#8FBEA1] shrink-0" />
              <span>OAuth 2.0 Secure Authentication. MorseBridge never stores your email password.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8D5CE] dark:border-[#263544]">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSimulateOAuth}
                disabled={isAuthenticating || !email || !senderName}
                leftIcon={
                  isAuthenticating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : authSuccess ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )
                }
              >
                {isAuthenticating
                  ? 'Connecting with Google...'
                  : authSuccess
                  ? 'Connected!'
                  : 'Authorize & Connect Gmail'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default GmailConnectModal;
