/**
 * src/api/outreach.ts
 *
 * Outreach Script Generation Service — frontend-only mock.
 * Replace function bodies with real AI API calls when the Python backend is ready.
 */

import type { Company, Mandate, OutreachScript, OutreachScriptType, OutreachChannel } from '../types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const firstName = (fullName: string): string => {
  if (!fullName || fullName.toLowerCase().includes('unavailable') || fullName.toLowerCase().includes('not available')) return '';
  return fullName.split(' ')[0];
};

const cityFromLocation = (location: string): string =>
  location?.split(',')[0]?.trim() || location || '';

const generateProfessional = (
  company: Company,
  mandate: Mandate,
  _channel: OutreachChannel
): OutreachScript => {
  const ed = company.enrichmentData;
  const contact = ed?.contactPerson || ed?.founderName || 'Partner';
  const fName = firstName(contact) || 'there';
  const city = cityFromLocation(company.location);

  const industryText = company.industry.toLowerCase();

  return {
    type: 'professional',
    label: 'Email',
    subject: `${mandate.targetIndustry || 'Industrial'} mandate fit — ${company.name}`,
    body: `Hi ${fName},\n\nYour recent work in ${industryText} at ${company.name}, particularly your established facility in ${city}, suggests a highly-established operation with strong foundations.\n\nI'm reaching out from Apex Horizon Ventures. We're raising a new early-stage industrial holding fund focused on ${mandate.targetIndustry?.toLowerCase() || 'manufacturing'} companies across Australia. The fit I see is straightforward: we sit in the part of the market where family-held businesses with transition objectives can secure a stable, long-term exit.\n\nOur edge comes from operating depth. We work with a network of industry veterans who help us support and transition companies seamlessly.\n\nWorth a 20-minute intro call in the next two weeks?\n\nBest,\nApex Horizon Ventures`,
  };
};

const generateFounderFocused = (
  company: Company,
  _mandate: Mandate,
  _channel: OutreachChannel
): OutreachScript => {
  const ed = company.enrichmentData;
  const contact = ed?.contactPerson || ed?.founderName || 'Partner';
  const fName = firstName(contact) || 'there';
  const city = cityFromLocation(company.location);
  const industryText = company.industry.toLowerCase();

  return {
    type: 'founder',
    label: 'Follow-up Email',
    subject: `Confidential follow-up — ${company.name}`,
    body: `Hi ${fName},\n\nFollowing my note last week, one other reason I thought Apex Horizon could be relevant is geography and succession alignment. We focus heavily on ${city} businesses in the ${industryText} space where the founders are considering retirement.\n\nIf you or your management team are reviewing venture transition options this vintage, I'd be glad to send a short introductory summary for an initial look.\n\nBest,\nApex Horizon Ventures`,
  };
};

const generateDirect = (
  company: Company,
  _mandate: Mandate,
  _channel: OutreachChannel
): OutreachScript => {
  const ed = company.enrichmentData;
  const contact = ed?.contactPerson || ed?.founderName || 'Partner';
  const fName = firstName(contact) || 'there';
  const city = cityFromLocation(company.location);
  const industryText = company.industry.toLowerCase();

  return {
    type: 'direct',
    label: 'LinkedIn Message',
    subject: '',
    body: `Hi ${fName} — saw ${company.name}'s recent work in ${city} and your focus on ${industryText}. We are exploring acquisition opportunities in this space. Would you be open to a brief conversation?\n\nThanks,\n[Your Name]`,
  };
};

export type GenerationStep = 'researching' | 'reviewing' | 'drafting' | 'done';

/**
 * Generate all three outreach scripts for a company.
 * Replace with: POST /api/outreach/generate
 */
export const generateOutreachScripts = async (
  company: Company,
  mandate: Mandate,
  channel: OutreachChannel,
  onStep?: (step: GenerationStep) => void
): Promise<OutreachScript[]> => {
  onStep?.('researching');
  await delay(900);
  onStep?.('reviewing');
  await delay(700);
  onStep?.('drafting');
  await delay(800);
  const scripts: OutreachScript[] = [
    generateProfessional(company, mandate, channel),
    generateFounderFocused(company, mandate, channel),
    generateDirect(company, mandate, channel),
  ];
  onStep?.('done');
  return scripts;
};

/**
 * Synchronous generation of all three scripts (for instant loading).
 */
export const generateOutreachScriptsSync = (
  company: Company,
  mandate: Mandate,
  channel: OutreachChannel = 'email'
): OutreachScript[] => {
  return [
    generateProfessional(company, mandate, channel),
    generateFounderFocused(company, mandate, channel),
    generateDirect(company, mandate, channel),
  ];
};

/**
 * Regenerate a single outreach script.
 * Replace with: POST /api/outreach/regenerate
 */
export const regenerateOutreachMessage = async (
  company: Company,
  mandate: Mandate,
  scriptType: OutreachScriptType,
  channel: OutreachChannel
): Promise<OutreachScript> => {
  await delay(900);
  if (scriptType === 'professional') return generateProfessional(company, mandate, channel);
  if (scriptType === 'founder') return generateFounderFocused(company, mandate, channel);
  return generateDirect(company, mandate, channel);
};
