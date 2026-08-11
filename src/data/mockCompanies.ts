import type { Company } from '../types';

export const mockCompanies: Company[] = [
  {
    id: 'comp-101',
    name: 'Acme Plastics Pty Ltd',
    logoText: 'AP',
    location: 'Melbourne, Victoria',
    industry: 'Plastics Manufacturing',
    revenueRange: '$25M – $50M',
    employeeRange: '80 – 120',
    ownership: 'Private (Founder Owned)',
    founded: 1988,
    fitLevel: 'HIGH FIT',
    confidenceScore: 94,
    whyItMatches: 'Strong industry, geography, and size alignment. The current owner is looking for succession options due to retirement.',
    website: 'https://www.acmeplastics.com.au',
    sourceName: 'Australian Plastics Industry Association',
    description: 'Acme Plastics is a leading custom injection moulding business specializing in packaging, crates, and custom industrial enclosures. It operates a state-of-the-art facility in Melbourne with 24 injection moulding machines running automated production lines.',
    businessProfile: {
      keyProducts: ['Food-grade plastic packaging containers', 'Logistics crates and pallets', 'Electronic enclosures', 'Custom automotive brackets (secondary line)'],
      mainCustomers: ['Coles Group (Packaging)', 'Visy Logistics', 'Techtronic Industries'],
      facilities: '12,000 sqm owned facility in Dandenong, VIC. Upgraded solar panel array and modern electric machines.'
    },
    acquisitionFit: {
      alignmentReason: '100% match on geography and revenue. Focuses on industrial mouldings which is a preferred category.',
      successionRisk: 'High risk of exit without a successor. Founder (age 63) seeking complete exit with a 6-month transition period.',
      financialHealth: 'Consistent 18% EBITDA margins over the last 4 years. Low debt profile.'
    },
    evidence: {
      sourcesUsed: ['Plastics Industry Association Directory', 'ASIC Company Extract', 'LinkedIn Employee Analysis'],
      verificationStatus: 'VERIFIED',
      lastVerifiedDate: '2026-08-01'
    }
  },
  {
    id: 'comp-102',
    name: 'Queensland Poly Blowmoulders',
    logoText: 'QP',
    location: 'Brisbane, Queensland',
    industry: 'Plastics Manufacturing',
    revenueRange: '$15M – $25M',
    employeeRange: '50 – 75',
    ownership: 'Family Owned',
    founded: 1995,
    fitLevel: 'HIGH FIT',
    confidenceScore: 89,
    whyItMatches: 'Perfect fit for blow-moulding capabilities in Queensland. Second-generation family owners with conflicting transition goals.',
    website: 'https://www.qldpoly.com.au',
    sourceName: 'Association of Rotational Moulders',
    description: 'Queensland Poly Blowmoulders is a specialist manufacturer of high-density polyethylene (HDPE) bottles, drums, and agricultural tanks. They supply major fertilizer, chemical, and beverage packaging industries across Queensland and northern NSW.',
    businessProfile: {
      keyProducts: ['Agricultural storage tanks (1,000L - 10,000L)', 'Chemical-grade drums (20L - 200L)', 'Custom blowmoulded bottles'],
      mainCustomers: ['Nufarm Australia', 'Incitec Pivot', 'Queensland Agriculture Supply'],
      facilities: '8,500 sqm leased facility in Yatala, QLD. Lease runs until 2032 with extension options.'
    },
    acquisitionFit: {
      alignmentReason: 'Fills a geographical and technical gap (blow moulding capability) in the portfolio.',
      successionRisk: 'Moderate risk. Family board members want to sell to institutional capital to pursue separate ventures.',
      financialHealth: '14% EBITDA margins. Capital expenditure needed in the next 18 months for machine upgrades.'
    },
    evidence: {
      sourcesUsed: ['Rotational Moulders Association', 'Google Places Reviews', 'Land Title Registry'],
      verificationStatus: 'VERIFIED',
      lastVerifiedDate: '2026-07-28'
    }
  },
  {
    id: 'comp-103',
    name: 'Southern Cross Extrusions',
    logoText: 'SC',
    location: 'Sydney, New South Wales',
    industry: 'Plastics Manufacturing',
    revenueRange: '$30M – $40M',
    employeeRange: '85 – 110',
    ownership: 'Private Partnership',
    founded: 2002,
    fitLevel: 'HIGH FIT',
    confidenceScore: 91,
    whyItMatches: 'Matches revenue and employee targets. High-quality production lines with strong alignment in construction materials.',
    website: 'https://www.sxc-extrusions.com.au',
    sourceName: 'Plastics Industry Pipe Association Members',
    description: 'Southern Cross Extrusions specializes in high-precision plastic profile extrusions for the construction, medical, and refrigeration industries. They operate 14 extruder lines in Sydney.',
    businessProfile: {
      keyProducts: ['uPVC window profiles', 'Electrical conduits and ducting', 'Medical-grade tubing', 'Custom seals and gaskets'],
      mainCustomers: ['Boral Limited', 'Rexel Australia', 'ResMed (Tubing supplier)'],
      facilities: '10,000 sqm leased facility in Wetherill Park, NSW. Rent indexation is standard.'
    },
    acquisitionFit: {
      alignmentReason: 'Extrusion capabilities expand product range. Very strong relationships with national distributors.',
      successionRisk: 'Three equal partners. Two ready to retire, one willing to rollover equity and stay as Operations Director.',
      financialHealth: 'Robust financials. 20% EBITDA margin. Clean balance sheet with zero term debt.'
    },
    evidence: {
      sourcesUsed: ['PIPA Directory', 'ABN Lookup', 'Company Financial Summary'],
      verificationStatus: 'VERIFIED',
      lastVerifiedDate: '2026-08-05'
    }
  },
  {
    id: 'comp-104',
    name: 'Precision Mouldings Ltd',
    logoText: 'PM',
    location: 'Adelaide, South Australia',
    industry: 'Plastics Manufacturing',
    revenueRange: '$10M – $15M',
    employeeRange: '40 – 60',
    ownership: 'Private (Founder Owned)',
    founded: 2010,
    fitLevel: 'MEDIUM FIT',
    confidenceScore: 78,
    whyItMatches: 'Slightly below target revenue range ($10M vs target $15M+), but has excellent high-precision tooling capabilities and a medical-grade cleanroom.',
    website: 'https://www.precisionmouldings.com.au',
    sourceName: 'Australian Plastics Industry Association',
    description: 'Precision Mouldings manufactures high-tolerance plastic components for medical devices, defence applications, and scientific instruments. Houses a Class 7 certified cleanroom.',
    businessProfile: {
      keyProducts: ['Medical syringe parts', 'Cleanroom-assembled devices', 'Defence aerospace seals', 'Micro-moulded connectors'],
      mainCustomers: ['Ansell Healthcare', 'BAE Systems Australia', 'SA Health'],
      facilities: '5,000 sqm owned facility in Mawson Lakes, SA. Cleanroom occupies 800 sqm.'
    },
    acquisitionFit: {
      alignmentReason: 'Highly advanced tech capabilities. Adds higher-margin medical and defence sectors.',
      successionRisk: 'Founder wants to stay on as CTO but sell majority equity (80%) to fund expansion.',
      financialHealth: 'High EBITDA margin (28%) but lower revenue. High capital expenditure profile.'
    },
    evidence: {
      sourcesUsed: ['Plastics Industry Association Directory', 'ASIC search'],
      verificationStatus: 'VERIFIED',
      lastVerifiedDate: '2026-08-02'
    }
  },
  {
    id: 'comp-105',
    name: 'Tasmanian Poly Products',
    logoText: 'TP',
    location: 'Launceston, Tasmania',
    industry: 'Plastics Manufacturing',
    revenueRange: '$5M – $10M',
    employeeRange: '20 – 35',
    ownership: 'Family Owned',
    founded: 1984,
    fitLevel: 'LOW FIT',
    confidenceScore: 54,
    whyItMatches: 'Significantly below revenue target and located in Tasmania (outside main target East Coast geography). However, has a niche in marine-grade plastics.',
    website: 'https://www.taspolyproducts.com.au',
    sourceName: 'Association of Rotational Moulders',
    description: 'Tasmanian Poly Products produces rotational moulded buoys, aquaculture cages, and marine accessories for the salmon farming industry.',
    businessProfile: {
      keyProducts: ['Salmon farming pens', 'Marine navigation buoys', 'Pontoon float modules'],
      mainCustomers: ['Tassal Group', 'Huon Aquaculture', 'Tasmanian Ports Authority'],
      facilities: '3,000 sqm facility in Devonport. Lease ends in 2028.'
    },
    acquisitionFit: {
      alignmentReason: 'Strong niche in aquaculture but lacks size and geographical synergy.',
      successionRisk: 'Owner is seeking full retirement. No succession plan.',
      financialHealth: 'Vulnerable to local Tasmanian aquaculture industry health. EBITDA margin 10%.'
    },
    evidence: {
      sourcesUsed: ['Rotational Moulders Association'],
      verificationStatus: 'UNVERIFIED',
      lastVerifiedDate: '2026-06-15'
    }
  },
  {
    id: 'comp-106',
    name: 'Oz Packaging Solutions',
    logoText: 'OP',
    location: 'Melbourne, Victoria',
    industry: 'Packaging Industry',
    revenueRange: '$40M – $60M',
    employeeRange: '110 – 140',
    ownership: 'Private Equity Owned',
    founded: 2012,
    fitLevel: 'MEDIUM FIT',
    confidenceScore: 76,
    whyItMatches: 'Perfect revenue and employee fit, but ownership is Private Equity. Low probability of acquiring through founder-succession pathways.',
    website: 'https://www.ozpacksol.com.au',
    sourceName: 'Australian Plastics Industry Association',
    description: 'Oz Packaging Solutions is a large-scale manufacturer of thin-wall packaging container products for FMCG and dairy brands. They operate 20 high-speed thermoforming and injection lines.',
    businessProfile: {
      keyProducts: ['Yogurt tubs and lids', 'Takeaway containers', 'PET bottles'],
      mainCustomers: ['Bega Cheese', 'Chobani Australia', 'Woolworths Group'],
      facilities: '15,000 sqm leased facility in Broadmeadows, VIC. Modern equipment with high automation.'
    },
    acquisitionFit: {
      alignmentReason: 'High volume and strong customer base. Immediate market consolidation benefits.',
      successionRisk: 'Owned by a mid-market private equity firm. Exit will likely be via a competitive auction process.',
      financialHealth: 'EBITDA margin of 12%. High leverage due to debt-funded acquisitions.'
    },
    evidence: {
      sourcesUsed: ['Plastics Association', 'PE Hub Australia', 'ASIC database'],
      verificationStatus: 'VERIFIED',
      lastVerifiedDate: '2026-08-08'
    }
  }
];
