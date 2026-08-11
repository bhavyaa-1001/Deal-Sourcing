import type { Mandate } from '../types';

export const mockMandate: Mandate = {
  id: 'mandate-101',
  title: 'Australian Plastics Manufacturing Mandate',
  status: 'Draft',
  rawInput: 'Australian-based plastics manufacturing companies focusing on packaging and industrial mouldings with founder succession issues.',
  objective: 'Acquire a profitable, succession-driven plastics manufacturing business in Australia to integrate into an industrial holding group.',
  geography: 'Australia (mainly East Coast: Victoria, New South Wales, Queensland)',
  targetIndustry: 'Plastics Manufacturing & Industrial Packaging',
  targetActivity: 'Custom injection moulding, blow moulding, rotational moulding, and extruder lines.',
  revenueRange: {
    min: 15000000,
    max: 50000000,
    label: '$15M – $50M AUD'
  },
  employeeRange: {
    min: 50,
    max: 150,
    label: '50 – 150 employees'
  },
  ownershipPreference: 'Private / Family-held (founder-owned)',
  successionPreference: 'Founder-era leadership seeking exit or retirement without a clear internal successor.',
  industryExclusions: [
    'Automotive-focused moulding (due to high volatility)',
    'Single-use consumer plastics (due to regulatory risks)'
  ],
  otherRequirements: 'Must own their manufacturing facility or hold a long-term lease. ISO 9001 certified.',
  lastUpdated: '2026-08-11T09:30:00Z'
};
