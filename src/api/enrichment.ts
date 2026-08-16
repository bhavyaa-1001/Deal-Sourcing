/**
 * src/api/enrichment.ts
 *
 * Enrichment Service — currently uses mock data.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  BACKEND INTEGRATION POINT                                      │
 * │  When the backend AI model is ready, replace the body of        │
 * │  `getCompanyEnrichment()` with a real API call:                 │
 * │                                                                 │
 * │    POST /api/enrichment/generate                                │
 * │    Body: { companyId: string }                                  │
 * │    Returns: EnrichmentData                                      │
 * │                                                                 │
 * │  The rest of the frontend (useCompanies → companiesApi) will    │
 * │  work automatically — no other changes needed.                  │
 * └─────────────────────────────────────────────────────────────────┘
 */

import type { EnrichmentData } from '../types';

// ─── Mock enrichment data (used until backend model is ready) ─────────────────
export const MOCK_ENRICHMENT_DATA: Record<string, EnrichmentData> = {
  'comp-101': {
    founderName: 'Robert "Bob" Miller',
    founderRole: 'Founder & Managing Director',
    managementTeam: 'Sarah Wilson (Operations Director), James Crawford (Sales Director)',
    contactPerson: 'Robert "Bob" Miller',
    email: 'bob.miller@acmeplastics.com.au',
    emailProof: 'Corporate MX DNS & Australian Packaging Association Verified Direct Routing',
    phone: '+61 3 9876 5432',
    phoneProof: 'Dandenong Chamber of Commerce Direct Line & Telco Business Record',
    linkedin: 'https://linkedin.com/in/robert-miller-acme',
    website: 'https://www.acmeplastics.com.au',
    bio: 'Started Acme Plastics in 1988 with a single injection moulding machine. Built it to a leading Dandenong packaging supplier over 35 years.',
    successionNote: 'Bob is looking to retire in the next 12 months. None of his children want to take over the family manufacturing business.',
    age: 63,
    ageProof: 'ASIC Director Filing #2024-VIC & 1988 Corporate Inception Certificate',
    gender: 'Male',
    genderProof: 'Public Executive Registry',
    industryExperience: '35+ Years in Industrial Plastics',
    experienceProof: 'Australian Plastics Industry Association Continuous Membership (1989-2025)',
    ownershipStake: '100% Sole Equity (Founder Owned)',
    ownershipProof: 'ASIC Shareholder Registry (100% Ordinary Voting Shares)',
    education: 'B.Eng (Mechanical), RMIT University',
    educationProof: 'RMIT University Alumni Verification Database',
    priorExits: 'First venture; built organically from greenfield inception',
    exitsProof: 'Historical Corporate Gazette',
    additionalRequirementMatch: {
      requirement: 'Founder age & retirement readiness timeline',
      extractedValue: 'Age 63 (Targeting full exit within 12 months)',
      proofSource: 'ASIC Director Age Extract & Victorian Manufacturing Advisory Notice',
    },
  },
  'comp-102': {
    founderName: 'Douglas Vance',
    founderRole: 'Co-Founder & Chief Operations Officer',
    managementTeam: 'Helen Vance (Finance Director), Craig Muir (Production Manager)',
    contactPerson: 'Douglas Vance',
    email: 'd.vance@qldpoly.com.au',
    emailProof: 'Enterprise Exchange SMTP Handshake & QLD Chamber of Commerce Directory',
    phone: '+61 7 3456 7890',
    phoneProof: 'Yatala Industrial Park Direct PBX Listing',
    linkedin: 'https://linkedin.com/in/doug-vance-poly',
    website: 'https://www.qldpoly.com.au',
    bio: 'Formed QLD Poly in 2004. Oversees all factory automation and machinery operations in Brisbane.',
    successionNote: 'Vance and his partner have alignment issues on expanding blowmoulding assets; seeking clean buyout or recapitalization.',
    age: 54,
    ageProof: 'QLD Business Registry Director Extract & LinkedIn Biographical History',
    gender: 'Male',
    genderProof: 'Public Executive Registry',
    industryExperience: '22+ Years in Blowmoulding & Polymers',
    experienceProof: 'Association of Rotational Moulders Executive Log',
    ownershipStake: '50% Co-Founder Partner Equity',
    ownershipProof: 'ASIC QLD Shareholding Extract (50/50 Partner Allocation)',
    education: 'B.App.Sc (Polymer Chemistry), QUT Brisbane',
    educationProof: 'QUT Alumni Records',
    priorExits: 'Former Plant Manager at Pioneer Polymers Queensland',
    exitsProof: 'Pioneer Polymers Annual Report (2003)',
    additionalRequirementMatch: {
      requirement: 'Founder age & ownership division alignment',
      extractedValue: 'Age 54 (Seeking clean buyout of partner stake)',
      proofSource: 'QLD Land Title & Director Share Registry',
    },
  },
  'comp-103': {
    founderName: 'Arthur Southern',
    founderRole: 'Managing Director & Principal Partner',
    managementTeam: 'Peter Morris (Operations Director), Linda Cheng (Finance Controller)',
    contactPerson: 'Arthur Southern',
    email: 'arthur.s@sxc-extrusions.com.au',
    emailProof: 'Telstra Business MX Record & Sydney Manufacturing Ledger',
    phone: '+61 2 9234 5678',
    phoneProof: 'Wetherill Park Industrial Directory',
    linkedin: 'https://linkedin.com/in/arthur-southern-sxc',
    website: 'https://www.sxc-extrusions.com.au',
    bio: 'An extrusion tooling engineer with 35 years of industrial experience. Co-founded Southern Cross Extrusions in Sydney.',
    successionNote: 'Three equal partners. Two ready to retire. Arthur is willing to stay on as Operations Director for a 2-year transition period.',
    age: 66,
    ageProof: 'NSW Principal Register & 1991 Founding Charter Documents',
    gender: 'Male',
    genderProof: 'Public Executive Registry',
    industryExperience: '38+ Years in Tooling & Industrial Extrusions',
    experienceProof: 'Extrusion Engineers Society Historical Archive',
    ownershipStake: '33.3% Principal Partner',
    ownershipProof: 'NSW Corporate Filing (33.3% Partner Equity Split)',
    education: 'Tool & Die Specialist, Sydney TAFE',
    educationProof: 'Sydney TAFE Historical Apprentice Registry',
    priorExits: 'Co-founded Southern Cross in 1991',
    exitsProof: 'NSW Business Gazette Filing',
    additionalRequirementMatch: {
      requirement: 'Founder age & willingness to stay during transition',
      extractedValue: 'Age 66 (Willing to stay 2 years post-acquisition)',
      proofSource: 'NSW Partner Agreement Filing & M&A Memorandum',
    },
  },
  'comp-104': {
    founderName: 'Jonathan Mawson',
    founderRole: 'Founder & Head of R&D',
    managementTeam: 'Dr. Priya Nair (Quality Manager), Tom Breen (Production Lead)',
    contactPerson: 'Jonathan Mawson',
    email: 'j.mawson@precisionmouldings.com.au',
    emailProof: 'Medical Devices Industry Association Verified Directory',
    phone: '+61 8 8345 6789',
    phoneProof: 'SA Health Supplier Directory Listing',
    linkedin: 'https://linkedin.com/in/jon-mawson-precision',
    website: 'https://www.precisionmouldings.com.au',
    bio: 'Academic background in medical-grade polymers. Patented three connector designs used by SA Health.',
    successionNote: 'Wants to divest 80% majority equity to an active group who can fund Class 7 cleanroom growth, while staying as CTO.',
    age: 48,
    ageProof: 'University of South Australia Academic Registry & Patent Filing Records',
    gender: 'Male',
    genderProof: 'Public Executive Registry',
    industryExperience: '20+ Years in Medical Polymer Engineering',
    experienceProof: 'Australian Patent Office Inventor Registry',
    ownershipStake: '80% Founder Majority Stake',
    ownershipProof: 'ASIC Share Registry (80% Class A Shares)',
    education: 'Ph.D. in Materials Engineering, University of South Australia',
    educationProof: 'UniSA Doctoral Graduation Archive',
    priorExits: 'Holds 3 patented connector designs used in state hospitals',
    exitsProof: 'IP Australia Patent Gazette',
    additionalRequirementMatch: {
      requirement: 'Technical founder age & minority equity retention',
      extractedValue: 'Age 48 (Retaining 20% equity as CTO)',
      proofSource: 'SA MedTech Investor Briefing & Patent Registry',
    },
  },
  'comp-105': {
    founderName: 'Alastair Tasman',
    founderRole: 'Managing Director',
    managementTeam: 'Gary Fulton (Operations Manager), Tracy Fulton (Accounts)',
    contactPerson: 'Alastair Tasman',
    email: 'alastair@taspolyproducts.com.au',
    emailProof: 'Hobart Marine Commercial Directory & Corporate Domain MX Records',
    phone: '+61 3 6234 5678',
    phoneProof: 'Tasmanian Telco Business Direct Registry',
    linkedin: 'https://linkedin.com/in/alastair-tasman-taspoly',
    website: 'https://www.taspolyproducts.com.au',
    bio: 'A marine biology enthusiast. Designed rotational pens for the early salmon farming sector in Tasmania.',
    successionNote: 'Seeking full immediate retirement. Active talks with marine-grade competitors; succession is high priority.',
    age: 67,
    ageProof: 'Tasmanian Corporate Registry & Aquaculture Industry Association Archive',
    gender: 'Male',
    genderProof: 'Public Executive Registry',
    industryExperience: '32+ Years in Rotational Marine Polymers',
    experienceProof: 'Tasmanian Salmon Growers Association Founding Executive Record',
    ownershipStake: '100% Private Family Trust',
    ownershipProof: 'Tasman Family Trust Deed Extract (Tasmanian Land Title)',
    education: 'B.Sc (Marine Biology), UTAS Hobart',
    educationProof: 'University of Tasmania Alumni Database',
    priorExits: 'Pioneered custom aquaculture containment in Tasmania',
    exitsProof: 'Tasmanian Aquaculture Historical Review',
    additionalRequirementMatch: {
      requirement: 'Founder age & immediate retirement urgency',
      extractedValue: 'Age 67 (Immediate exit due to retirement)',
      proofSource: 'Tasmanian Commerce Registry & Director Age Extract',
    },
  },
  'comp-106': {
    founderName: 'Melissa Ford',
    founderRole: 'Chief Executive Officer',
    managementTeam: 'Derek Huang (CFO), Simon Park (COO), Gareth Vance (PE Operating Partner)',
    contactPerson: 'Melissa Ford',
    email: 'm.ford@ozpacksol.com.au',
    emailProof: 'Enterprise Exchange Online Verified Corporate MX Record',
    phone: '+61 3 9567 8901',
    phoneProof: 'National Packaging Covenant Industry Directory',
    linkedin: 'https://linkedin.com/in/melissa-ford-ozpack',
    website: 'https://www.ozpacksol.com.au',
    bio: 'Venture Capital and PE operations background. Appointed as Chief Executive Officer of Oz Packaging Solutions in 2021.',
    successionNote: "Owned by mid-market Private Equity. Direct succession isn't standard — exit will likely be a structured auction process.",
    age: 46,
    ageProof: 'AICD Director Registry & Melbourne Business School Alumni Record',
    gender: 'Female',
    genderProof: 'Public Executive Registry',
    industryExperience: '18+ Years in Packaging Corporate Operations',
    experienceProof: 'Amcor Packaging Corporate Filings (2014-2021)',
    ownershipStake: 'Management Incentive Plan (PE Backed)',
    ownershipProof: 'ASIC Capital Table (PE Majority & MIP Allocation)',
    education: 'MBA, Melbourne Business School',
    educationProof: 'Melbourne Business School Registry',
    priorExits: 'Former Divisional GM at Amcor Packaging',
    exitsProof: 'ASX Disclosures & Corporate Press Releases',
    additionalRequirementMatch: {
      requirement: 'Executive leadership age & corporate pedigree',
      extractedValue: 'Age 46 (Former Amcor GM / PE Operator)',
      proofSource: 'AICD Registry & PE Board Filing',
    },
  },
};

// ─── Enrichment API ───────────────────────────────────────────────────────────

/**
 * Fetches enrichment data for a single company.
 *
 * ⚡ BACKEND SWAP POINT:
 * Replace the mock lookup below with your actual API call, e.g.:
 *
 *   const response = await fetch(`/api/enrichment/generate`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ companyId }),
 *   });
 *   if (!response.ok) throw new Error('Enrichment generation failed');
 *   return response.json() as Promise<EnrichmentData>;
 *
 * The calling code in useCompanies.ts runs this for each selected company
 * in parallel (Promise.all), then persists results to localStorage and
 * updates the React state — all automatically.
 */
export const getCompanyEnrichment = async (
  companyId: string
): Promise<EnrichmentData> => {
  // TODO: Replace with real backend call → POST /api/enrichment/generate
  await new Promise(r => setTimeout(r, 800)); // simulate model inference time

  const data = MOCK_ENRICHMENT_DATA[companyId];
  if (!data) {
    // Fallback for companies not in mock data — backend will always return real data
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
