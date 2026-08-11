import React from 'react';
import type { Mandate } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface MandateFormProps {
  mandate: Mandate;
  onChange: (fields: Partial<Mandate>) => void;
}

export const MandateForm: React.FC<MandateFormProps> = ({ mandate, onChange }) => {
  const handleInputChange = (field: keyof Mandate, value: any) => {
    onChange({ [field]: value });
  };

  const handleRevenueChange = (value: string) => {
    // mock range matching
    let min = 0, max = 0;
    if (value === '$15M – $50M AUD') {
      min = 15000000; max = 50000000;
    } else if (value === '$5M – $15M AUD') {
      min = 5000000; max = 15000000;
    } else if (value === '$50M+ AUD') {
      min = 50000000; max = 150000000;
    }
    onChange({
      revenueRange: { min, max, label: value }
    });
  };

  const handleEmployeeChange = (value: string) => {
    let min = 0, max = 0;
    if (value === '50 – 150 employees') {
      min = 50; max = 150;
    } else if (value === '20 – 50 employees') {
      min = 20; max = 50;
    } else if (value === '150+ employees') {
      min = 150; max = 500;
    }
    onChange({
      employeeRange: { min, max, label: value }
    });
  };

  const handleExclusionsChange = (val: string) => {
    // split comma separated items
    const exclusions = val.split('\n').filter(line => line.trim() !== '');
    onChange({ industryExclusions: exclusions });
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* 1. Conversational Input Box */}
      <div className="bg-card border border-default rounded-lg p-6 shadow-premium">
        <label
          htmlFor="raw-mandate-input"
          className="text-lg font-bold text-primary block mb-2"
        >
          What type of business are you looking to acquire?
        </label>
        <p className="text-base text-secondary mb-4">
          Describe your acquisition requirement in plain English. The platform structures these details automatically.
        </p>
        <textarea
          id="raw-mandate-input"
          rows={3}
          value={mandate.rawInput}
          onChange={(e) => handleInputChange('rawInput', e.target.value)}
          placeholder="Example: Australian-based plastics manufacturing companies focusing on packaging and industrial mouldings with founder succession issues."
          className="w-full px-4 py-3 text-base rounded border border-default bg-card text-primary focus-ring focus:border-brand-primary transition-all duration-200 min-h-[100px] placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      {/* 2. Structured Inputs Section */}
      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-bold text-primary border-b border-default pb-2">
          Structured Mandate Details
        </h3>

        {/* Section A: Target Market */}
        <div className="bg-card border border-default rounded-lg p-6 shadow-premium flex flex-col gap-5">
          <h4 className="text-base font-bold uppercase tracking-wider text-brand-primary">
            Target Market
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Acquisition Objective"
              value={mandate.objective}
              onChange={(e) => handleInputChange('objective', e.target.value)}
              helperText="E.g., Acquire profitable manufacturer to integrate into industrial group."
            />
            <Input
              label="Geography"
              value={mandate.geography}
              onChange={(e) => handleInputChange('geography', e.target.value)}
              helperText="E.g., Australia (mainly East Coast)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Target Industry"
              value={mandate.targetIndustry}
              onChange={(e) => handleInputChange('targetIndustry', e.target.value)}
              helperText="E.g., Plastics Manufacturing"
            />
            <Input
              label="Target Activity"
              value={mandate.targetActivity}
              onChange={(e) => handleInputChange('targetActivity', e.target.value)}
              helperText="E.g., Custom injection moulding, blow moulding"
            />
          </div>
        </div>

        {/* Section B: Company Profile */}
        <div className="bg-card border border-default rounded-lg p-6 shadow-premium flex flex-col gap-5">
          <h4 className="text-base font-bold uppercase tracking-wider text-brand-primary">
            Company Profile Limits
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Select
              label="Revenue Range"
              value={mandate.revenueRange.label}
              onChange={(e) => handleRevenueChange(e.target.value)}
              options={[
                { value: 'Not specified', label: 'Not specified' },
                { value: '$5M – $15M AUD', label: '$5M – $15M AUD' },
                { value: '$15M – $50M AUD', label: '$15M – $50M AUD' },
                { value: '$50M+ AUD', label: '$50M+ AUD' }
              ]}
            />
            <Select
              label="Company Size (Employees)"
              value={mandate.employeeRange.label}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              options={[
                { value: 'Not specified', label: 'Not specified' },
                { value: '20 – 50 employees', label: '20 – 50 employees' },
                { value: '50 – 150 employees', label: '50 – 150 employees' },
                { value: '150+ employees', label: '150+ employees' }
              ]}
            />
            <Select
              label="Ownership Preference"
              value={mandate.ownershipPreference}
              onChange={(e) => handleInputChange('ownershipPreference', e.target.value)}
              options={[
                { value: 'Not specified', label: 'Not specified' },
                { value: 'Private / Family-held (founder-owned)', label: 'Private / Family-held (founder-owned)' },
                { value: 'Private Equity Owned', label: 'Private Equity Owned' },
                { value: 'Publicly Traded', label: 'Publicly Traded' }
              ]}
            />
          </div>
        </div>

        {/* Section C: Acquisition Preferences & Exclusions */}
        <div className="bg-card border border-default rounded-lg p-6 shadow-premium flex flex-col gap-5">
          <h4 className="text-base font-bold uppercase tracking-wider text-brand-primary">
            Acquisition Preferences
          </h4>

          <Input
            label="Founder Succession Preference"
            value={mandate.successionPreference}
            onChange={(e) => handleInputChange('successionPreference', e.target.value)}
            helperText="E.g., Founder seeking retirement exit with no internal successor."
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="industry-exclusions" className="text-base font-semibold text-primary">
              Industry Exclusions
            </label>
            <p className="text-sm text-secondary">
              List industries or business activities you want to filter out (one exclusion per line).
            </p>
            <textarea
              id="industry-exclusions"
              rows={3}
              value={mandate.industryExclusions.join('\n')}
              onChange={(e) => handleExclusionsChange(e.target.value)}
              placeholder="E.g.&#10;Automotive-focused moulding&#10;Single-use plastics"
              className="w-full px-4 py-3 text-base rounded border border-default bg-card text-primary focus-ring focus:border-brand-primary transition-all duration-200 min-h-[80px]"
            />
          </div>

          <Input
            label="Other Facilities/Standards Requirements"
            value={mandate.otherRequirements}
            onChange={(e) => handleInputChange('otherRequirements', e.target.value)}
            helperText="E.g., ISO 9001 certified, facility ownership preferred."
          />
        </div>
      </div>
    </div>
  );
};
export default MandateForm;
