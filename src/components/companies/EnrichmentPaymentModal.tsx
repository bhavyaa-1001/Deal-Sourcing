import React, { useState } from 'react';
import type { Company } from '../../types';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Lock, CheckCircle, CreditCard, Sparkles, User, Mail, Phone, Users } from 'lucide-react';
import { ENRICHMENT_PRICE_PER_COMPANY, calculateEnrichmentTotal } from '../../api/enrichment';

type Step = 'confirm' | 'processing' | 'success';

interface EnrichmentPaymentModalProps {
  isOpen: boolean;
  companies: Company[];
  onClose: () => void;
  onConfirm: (companyIds: string[]) => Promise<void>;
}

export const EnrichmentPaymentModal: React.FC<EnrichmentPaymentModalProps> = ({
  isOpen,
  companies,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState<Step>('confirm');
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (step === 'processing') return; // don't allow close while processing
    setStep('confirm');
    setError(null);
    onClose();
  };

  const handlePay = async () => {
    setStep('processing');
    setError(null);
    try {
      await onConfirm(companies.map(c => c.id));
      setStep('success');
    } catch (err: any) {
      setError(err?.message ?? 'Payment failed. Please try again.');
      setStep('confirm');
    }
  };

  const total = calculateEnrichmentTotal(companies.length);

  const ENRICHMENT_BENEFITS = [
    { icon: <User className="h-4 w-4 text-brand-primary" />, label: 'Founder Name & Role' },
    { icon: <Users className="h-4 w-4 text-brand-primary" />, label: 'Full Management Team' },
    { icon: <Mail className="h-4 w-4 text-brand-primary" />, label: 'Direct Email Address' },
    { icon: <Phone className="h-4 w-4 text-brand-primary" />, label: 'Direct Phone Number' },
    { icon: <Sparkles className="h-4 w-4 text-brand-primary" />, label: 'LinkedIn Profile Link' },
  ];

  const footerActions = step === 'confirm' ? (
    <div className="flex justify-between items-center w-full">
      <Button variant="outline" onClick={handleClose}>Cancel</Button>
      <Button
        variant="primary"
        onClick={handlePay}
        leftIcon={<CreditCard className="h-4 w-4" />}
        id="enrich-pay-btn"
      >
        Pay ₹{total.toLocaleString('en-IN')} &amp; Enrich
      </Button>
    </div>
  ) : step === 'success' ? (
    <div className="flex justify-end w-full">
      <Button variant="success" onClick={handleClose} leftIcon={<CheckCircle className="h-4 w-4" />}>
        Done — View Enriched Data
      </Button>
    </div>
  ) : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enrich Selected Companies"
      size="md"
      footerActions={footerActions}
    >
      <div className="flex flex-col gap-5">

        {/* CONFIRM step */}
        {step === 'confirm' && (
          <>
            {/* What you unlock */}
            <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-default p-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-primary" /> What you unlock per company
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {ENRICHMENT_BENEFITS.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-semibold text-primary">
                    {b.icon}
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected companies list */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                Selected Companies ({companies.length})
              </h4>
              <div className="divide-y divide-default border border-default rounded-lg overflow-hidden">
                {companies.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-card">
                    <div>
                      <span className="text-sm font-bold text-primary">{c.name}</span>
                      <span className="text-xs text-secondary ml-2">{c.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.fitLevel === 'HIGH FIT' ? 'success' : c.fitLevel === 'MEDIUM FIT' ? 'warning' : 'danger'}>
                        {c.fitLevel.split(' ')[0]}
                      </Badge>
                      <span className="text-sm font-bold text-[#9A8056]">₹{ENRICHMENT_PRICE_PER_COMPANY.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price summary */}
            <div className="bg-card border border-default rounded-lg p-4 flex justify-between items-center">
              <div>
                <span className="text-base font-bold text-primary">{companies.length} {companies.length === 1 ? 'company' : 'companies'} × ₹{ENRICHMENT_PRICE_PER_COMPANY.toLocaleString('en-IN')}</span>
                <p className="text-xs text-secondary mt-0.5">One-time payment. Enrichment data persists in your session.</p>
              </div>
              <span className="text-2xl font-black text-brand-primary">₹{total.toLocaleString('en-IN')}</span>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>This is a demo simulation. No real payment is processed.</span>
            </div>
          </>
        )}

        {/* PROCESSING step */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800" />
              <div className="w-16 h-16 rounded-full border-4 border-brand-primary border-t-transparent absolute inset-0 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">Processing Payment...</p>
              <p className="text-sm text-secondary mt-1">Charging ₹{total.toLocaleString('en-IN')} • Please wait</p>
            </div>
            <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
              <div className="bg-brand-primary h-1.5 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* SUCCESS step */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-10 gap-5">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">Enrichment Complete!</p>
              <p className="text-base text-secondary mt-2">
                <span className="font-bold text-green-600 dark:text-green-400">{companies.length} {companies.length === 1 ? 'company' : 'companies'}</span> successfully enriched.
              </p>
              <p className="text-sm text-secondary mt-1">
                Founder, email, phone, LinkedIn, and management data are now unlocked.
              </p>
            </div>
            <div className="w-full bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-default p-3">
              {companies.map(c => (
                <div key={c.id} className="flex items-center gap-2 py-1.5 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="font-bold text-primary">{c.name}</span>
                  <Badge variant="success" className="ml-auto">ENRICHED</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EnrichmentPaymentModal;
