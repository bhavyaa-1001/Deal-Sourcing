/**
 * src/api/enrichment.ts
 *
 * Enrichment & Payment Service — currently frontend-only mock simulation.
 * Replace the function bodies with real API calls when the Python backend is ready.
 * All pricing is configured in ONE place: ENRICHMENT_PRICE_PER_COMPANY.
 */

import type { EnrichmentData } from '../types';

// ─── Pricing Configuration (single source of truth) ─────────────────────────
export const ENRICHMENT_PRICE_PER_COMPANY = 500; // ₹ INR per company

// ─── Mock enrichment data ────────────────────────────────────────────────────
const MOCK_ENRICHMENT_DATA: Record<string, EnrichmentData> = {
  'comp-101': {
    founderName: 'Robert "Bob" Miller',
    founderRole: 'Founder & Managing Director',
    managementTeam: 'Sarah Wilson (Operations Director), James Crawford (Sales Director)',
    contactPerson: 'Robert "Bob" Miller',
    email: 'bob.miller@acmeplastics.com.au',
    phone: '+61 3 9876 5432',
    linkedin: 'https://linkedin.com/in/robert-miller-acme',
    website: 'https://www.acmeplastics.com.au',
    bio: 'Started Acme Plastics in 1988 with a single injection moulding machine. Built it to a leading Dandenong packaging supplier over 35 years.',
    successionNote: 'Bob is looking to retire in the next 12 months. None of his children want to take over the family manufacturing business.',
  },
  'comp-102': {
    founderName: 'Douglas Vance',
    founderRole: 'Co-Founder & Chief Operations Officer',
    managementTeam: 'Helen Vance (Finance Director), Craig Muir (Production Manager)',
    contactPerson: 'Douglas Vance',
    email: 'd.vance@qldpoly.com.au',
    phone: '+61 7 3456 7890',
    linkedin: 'https://linkedin.com/in/doug-vance-poly',
    website: 'https://www.qldpoly.com.au',
    bio: 'Formed QLD Poly in 2004. Oversees all factory automation and machinery operations in Brisbane.',
    successionNote: 'Vance and his partner have alignment issues on expanding blowmoulding assets; seeking clean buyout or recapitalization.',
  },
  'comp-103': {
    founderName: 'Arthur Southern',
    founderRole: 'Managing Director & Principal Partner',
    managementTeam: 'Peter Morris (Operations Director), Linda Cheng (Finance Controller)',
    contactPerson: 'Arthur Southern',
    email: 'arthur.s@sxc-extrusions.com.au',
    phone: '+61 2 9234 5678',
    linkedin: 'https://linkedin.com/in/arthur-southern-sxc',
    website: 'https://www.sxc-extrusions.com.au',
    bio: 'An extrusion tooling engineer with 35 years of industrial experience. Co-founded Southern Cross Extrusions in Sydney.',
    successionNote: 'Three equal partners. Two ready to retire. Arthur is willing to stay on as Operations Director for a 2-year transition period.',
  },
  'comp-104': {
    founderName: 'Jonathan Mawson',
    founderRole: 'Founder & Head of R&D',
    managementTeam: 'Dr. Priya Nair (Quality Manager), Tom Breen (Production Lead)',
    contactPerson: 'Jonathan Mawson',
    email: 'j.mawson@precisionmouldings.com.au',
    phone: '+61 8 8345 6789',
    linkedin: 'https://linkedin.com/in/jon-mawson-precision',
    website: 'https://www.precisionmouldings.com.au',
    bio: 'Academic background in medical-grade polymers. Patented three connector designs used by SA Health.',
    successionNote: 'Wants to divest 80% majority equity to an active group who can fund Class 7 cleanroom growth, while staying as CTO.',
  },
  'comp-105': {
    founderName: 'Alastair Tasman',
    founderRole: 'Managing Director',
    managementTeam: 'Gary Fulton (Operations Manager), Tracy Fulton (Accounts)',
    contactPerson: 'Alastair Tasman',
    email: 'alastair@taspolyproducts.com.au',
    phone: '+61 3 6234 5678',
    linkedin: 'https://linkedin.com/in/alastair-tasman-taspoly',
    website: 'https://www.taspolyproducts.com.au',
    bio: 'A marine biology enthusiast. Designed rotational pens for the early salmon farming sector in Tasmania.',
    successionNote: 'Seeking full immediate retirement. Active talks with marine-grade competitors; succession is high priority.',
  },
  'comp-106': {
    founderName: 'Gareth Vance',
    founderRole: 'Private Equity Operating Partner',
    managementTeam: 'Melissa Ford (CEO), Derek Huang (CFO), Simon Park (COO)',
    contactPerson: 'Melissa Ford',
    email: 'g.vance@ozpacksol.com.au',
    phone: '+61 3 9567 8901',
    linkedin: 'https://linkedin.com/in/gareth-vance-ozpack',
    website: 'https://www.ozpacksol.com.au',
    bio: 'Venture Capital and PE operations background. Appointed as director of Oz Packaging Solutions in 2021.',
    successionNote: "Owned by mid-market Private Equity. Direct succession isn't standard — exit will likely be an auction process.",
  },
};

// ─── Service Functions ───────────────────────────────────────────────────────

/** Returns the per-company enrichment price in INR */
export const getEnrichmentPrice = (): number => ENRICHMENT_PRICE_PER_COMPANY;

/** Calculates the total enrichment cost for N companies */
export const calculateEnrichmentTotal = (count: number): number =>
  count * ENRICHMENT_PRICE_PER_COMPANY;

/**
 * Simulates creating an enrichment order.
 * Replace with: POST /api/enrichment/orders
 */
export const createEnrichmentOrder = async (
  companyIds: string[]
): Promise<{ orderId: string; total: number; companyIds: string[] }> => {
  await new Promise(r => setTimeout(r, 300));
  return {
    orderId: `order-${Date.now()}`,
    total: calculateEnrichmentTotal(companyIds.length),
    companyIds,
  };
};

/**
 * Simulates processing a payment and returning success.
 * Replace with: POST /api/enrichment/payments/:orderId
 */
export const processEnrichmentPayment = async (
  _orderId: string
): Promise<{ success: boolean; transactionId: string }> => {
  await new Promise(r => setTimeout(r, 1200)); // simulate payment gateway delay
  return {
    success: true,
    transactionId: `txn-${Date.now()}`,
  };
};

/**
 * Returns enrichment data for a company after successful payment.
 * Replace with: GET /api/enrichment/companies/:companyId
 */
export const getCompanyEnrichment = async (
  companyId: string
): Promise<EnrichmentData> => {
  await new Promise(r => setTimeout(r, 400));
  const data = MOCK_ENRICHMENT_DATA[companyId];
  if (!data) {
    // Return a generic placeholder for companies without specific mock data
    return {
      founderName: 'Contact information unavailable',
      founderRole: 'Details not available in enrichment sources',
      managementTeam: 'Information not available',
      contactPerson: 'Contact information unavailable',
      email: 'Not available from enrichment sources',
      phone: 'Not available from enrichment sources',
      linkedin: '',
      website: '',
      bio: 'Additional enrichment details are not available for this company.',
      successionNote: 'No succession information available from enrichment sources.',
    };
  }
  return data;
};
