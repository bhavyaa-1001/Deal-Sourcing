import type { ResearchStrategy } from '../types';

export const mockResearchStrategy: ResearchStrategy = {
  mandateId: 'mandate-101',
  status: 'Draft',
  metrics: {
    researchQuestionsCompleted: 6,
    researchQuestionsTotal: 6,
    coveragePercentage: 80,
    validatedSourcesCount: 10,
    openGapsCount: 2
  },
  marketMapping: {
    description: 'Mimir maps where Australian plastics manufacturers gather – member directories, exhibitor lists, and process-specific Places searches – then scores each source by yield, duplication, and demonstrated coverage.',
    categories: {
      'Manufacturing Process': ['Injection moulding', 'Blow moulding', 'Rotational moulding', 'Extrusion', 'Extrusion and pipe manufacture', 'Thermoforming', 'Fabrication', 'Compounding', 'Recycling'],
      'Material Family': ['Polyolefins (PE / PP)', 'PVC and vinyl', 'Bioplastics'],
      'Product Capability': ['Packaging products', 'Construction products', 'Medical components'],
      'End Market': ['Specialist medical moulders', 'Construction', 'Agriculture']
    },
    searchStrategy: [
      'For each process category, query state and national manufacturing directories.',
      'Run a Google Places text search for plastics manufacturing across all Australian states.',
      'Corroborate every company across at least two independent source classes.',
      'Check shortlisted companies against the ABN register before prefiltering.'
    ]
  },
  sources: [
    {
      id: 'source-1',
      name: 'Plastics Industry Pipe Association Members',
      type: 'Industry Directory',
      companiesFound: 31,
      status: 'VALIDATED',
      url: 'https://pipa.com.au/members/',
      qualityScore: 0.88,
      duplicatePercentage: 18,
      notes: 'Contains key manufacturers of HDPE, PVC, and PP piping products. Cross-referenced with water utilities suppliers.',
      sampleCompanies: ['Iplex Pipelines', 'GF Piping Systems', 'Vinidex Pty Ltd']
    },
    {
      id: 'source-2',
      name: 'Vinyl Council of Australia Members',
      type: 'Industry Directory',
      companiesFound: 21,
      status: 'VALIDATED',
      url: 'https://www.vinyl.org.au/about-us/list-of-members',
      qualityScore: 0.75,
      duplicatePercentage: 12,
      notes: 'Covers major vinyl and PVC compounders and products manufacturers in Australia.',
      sampleCompanies: ['Vinidex Pty Ltd', 'Australian Vinyls Corp']
    },
    {
      id: 'source-3',
      name: 'Association of Rotational Moulders Australasia',
      type: 'Industry Directory',
      companiesFound: 15,
      status: 'VALIDATED',
      url: 'https://www.rotationalmoulding.com/business-directory',
      qualityScore: 0.70,
      duplicatePercentage: 13,
      notes: 'Key directory for manufacturers of hollow plastic products (tanks, bins, marine products).',
      sampleCompanies: ['Hills Plastic', 'Poly Pipe']
    },
    {
      id: 'source-4',
      name: 'Australian Plastics Industry Association',
      type: 'Industry Association',
      companiesFound: 42,
      status: 'VALIDATED',
      url: 'https://www.plastics.org.au/directory',
      qualityScore: 0.92,
      duplicatePercentage: 15,
      notes: 'Most comprehensive listing of Australian plastics manufacturers, compounders, and service providers.',
      sampleCompanies: ['Acme Plastics Pty Ltd', 'AusMould Ltd', 'Sydney Plastics']
    },
    {
      id: 'source-5',
      name: 'PIMA Trade Directory',
      type: 'Trade Directory',
      companiesFound: 0,
      status: 'REJECTED',
      url: 'https://www.pima.asn.au/8-plastics',
      qualityScore: 0,
      duplicatePercentage: 0,
      notes: 'PIMA trade directory page returns no member list (HTTP 403); directory link unavailable.',
      rejectedReason: 'Directory link unavailable (returns HTTP 403 Forbidden error).'
    },
    {
      id: 'source-6',
      name: 'Australian Manufacturing Directory',
      type: 'General Directory',
      companiesFound: 12,
      status: 'REJECTED',
      url: 'https://www.australianmanufacturing.com.au/business-directory/',
      qualityScore: 0.40,
      duplicatePercentage: 58,
      notes: 'Broad directory mixes machinery suppliers with manufacturers; precision is below the required threshold.',
      rejectedReason: 'Broad directory mixes machinery suppliers with manufacturers; precision is below the acceptable 60% threshold.'
    }
  ],
  gaps: [
    {
      id: 'gap-1',
      description: 'Specialist medical moulders — no dedicated directory was validated; discovery relies on broader manufacturing sources.',
      acknowledged: false
    },
    {
      id: 'gap-2',
      description: 'Privately held compounders — no dedicated directory was validated; discovery relies on broader sources and Places search.',
      acknowledged: false
    }
  ],
  activities: [
    'Defining market taxonomy and boundary conditions.',
    'Mapping process and geography partitions.',
    'Identifying authoritative source classes and directories.',
    'Verifying API integration and rate limits for Places searches.',
    'Running initial web crawler on PIPA and Vinyl Council directories.'
  ]
};
