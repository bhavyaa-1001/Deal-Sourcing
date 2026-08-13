// DEAL SOURCING - Research Agent Mock Service
// Conceptual layer to simulate chat conversation and mandate extraction.

export interface MandateCriteria {
  targetIndustry: string;
  primaryActivities: string;
  geography: string;
  revenueRange: string;
  companySize: string;
  ownershipProfile: string;
  successionPreference: string;
  exclusions: string;
  additionalDetails: string;
}

export interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

export interface AgentResponse {
  message: string;
  updatedMandate: MandateCriteria;
  nextQuestion: string;
  isComplete: boolean;
  quickPrompts: string[];
  activeField: keyof MandateCriteria | null;
}

export const initialCriteria: MandateCriteria = {
  targetIndustry: 'Not specified',
  primaryActivities: 'Not specified',
  geography: 'Not specified',
  revenueRange: 'Not specified',
  companySize: 'Not specified',
  ownershipProfile: 'Not specified',
  successionPreference: 'Not specified',
  exclusions: 'Not specified',
  additionalDetails: 'Not specified'
};

const criteriaQuestions: Record<keyof MandateCriteria, { question: string }> = {
  targetIndustry: {
    question: "What type of business or target industry are you looking to acquire?"
  },
  primaryActivities: {
    question: "Are there particular types of activities or business lines you're interested in?"
  },
  geography: {
    question: "What is your target geography or location?"
  },
  revenueRange: {
    question: "What revenue range would you like to focus on?"
  },
  companySize: {
    question: "What company size would you prefer in terms of employee headcount?"
  },
  ownershipProfile: {
    question: "Do you have any ownership or founder preferences?"
  },
  successionPreference: {
    question: "Are there any succession characteristics that matter to your mandate?"
  },
  exclusions: {
    question: "Are there any industries or activities you'd like us to exclude?"
  },
  additionalDetails: {
    question: "Are there any other special requirements, certifications, or details for this acquisition?"
  }
};

const getNextUnfilledField = (mandate: MandateCriteria): keyof MandateCriteria | null => {
  const fieldsOrder: (keyof MandateCriteria)[] = [
    'targetIndustry',
    'primaryActivities',
    'geography',
    'revenueRange',
    'companySize',
    'ownershipProfile',
    'successionPreference',
    'exclusions',
    'additionalDetails'
  ];
  for (const f of fieldsOrder) {
    if (mandate[f] === 'Not specified') return f;
  }
  return null;
};

const extractMultiFields = (text: string, current: MandateCriteria): { updated: MandateCriteria; extracted: string[] } => {
  const updated = { ...current };
  const extracted: string[] = [];
  const textLower = text.toLowerCase();

  // 1. Geography — comprehensive world geography lookup (countries + Australian states + regions)
  // Order matters: longer/more-specific terms first to avoid false partial matches
  const GEO_MAP: Array<{ keywords: string[]; label: string }> = [
    // Australian states & territories (most-specific first)
    { keywords: ['new south wales', 'nsw'], label: 'New South Wales, Australia' },
    { keywords: ['western australia'], label: 'Western Australia' },
    { keywords: ['south australia'], label: 'South Australia' },
    { keywords: ['australian capital territory', 'act'], label: 'Australian Capital Territory' },
    { keywords: ['northern territory', ' nt '], label: 'Northern Territory, Australia' },
    { keywords: ['victoria', ' vic '], label: 'Victoria, Australia' },
    { keywords: ['queensland', ' qld '], label: 'Queensland, Australia' },
    { keywords: ['tasmania', ' tas '], label: 'Tasmania, Australia' },
    { keywords: ['australia'], label: 'Australia' },
    // Asia
    { keywords: ['pakistan'], label: 'Pakistan' },
    { keywords: ['india'], label: 'India' },
    { keywords: ['china'], label: 'China' },
    { keywords: ['japan'], label: 'Japan' },
    { keywords: ['south korea', 'korea'], label: 'South Korea' },
    { keywords: ['indonesia'], label: 'Indonesia' },
    { keywords: ['malaysia'], label: 'Malaysia' },
    { keywords: ['singapore'], label: 'Singapore' },
    { keywords: ['thailand'], label: 'Thailand' },
    { keywords: ['vietnam'], label: 'Vietnam' },
    { keywords: ['philippines'], label: 'Philippines' },
    { keywords: ['bangladesh'], label: 'Bangladesh' },
    { keywords: ['sri lanka'], label: 'Sri Lanka' },
    { keywords: ['nepal'], label: 'Nepal' },
    { keywords: ['myanmar', 'burma'], label: 'Myanmar' },
    { keywords: ['cambodia'], label: 'Cambodia' },
    { keywords: ['taiwan'], label: 'Taiwan' },
    { keywords: ['hong kong'], label: 'Hong Kong' },
    { keywords: ['macau'], label: 'Macau' },
    { keywords: ['mongolia'], label: 'Mongolia' },
    { keywords: ['kazakhstan'], label: 'Kazakhstan' },
    { keywords: ['uzbekistan'], label: 'Uzbekistan' },
    { keywords: ['azerbaijan'], label: 'Azerbaijan' },
    { keywords: ['georgia'], label: 'Georgia' },
    // Middle East
    { keywords: ['united arab emirates', 'uae', 'dubai', 'abu dhabi'], label: 'UAE' },
    { keywords: ['saudi arabia', 'ksa'], label: 'Saudi Arabia' },
    { keywords: ['qatar'], label: 'Qatar' },
    { keywords: ['kuwait'], label: 'Kuwait' },
    { keywords: ['bahrain'], label: 'Bahrain' },
    { keywords: ['oman'], label: 'Oman' },
    { keywords: ['israel'], label: 'Israel' },
    { keywords: ['turkey', 'türkiye'], label: 'Turkey' },
    { keywords: ['iran'], label: 'Iran' },
    { keywords: ['iraq'], label: 'Iraq' },
    { keywords: ['jordan'], label: 'Jordan' },
    { keywords: ['lebanon'], label: 'Lebanon' },
    // Europe
    { keywords: ['united kingdom', 'uk', 'britain', 'england', 'scotland', 'wales'], label: 'United Kingdom' },
    { keywords: ['germany'], label: 'Germany' },
    { keywords: ['france'], label: 'France' },
    { keywords: ['italy'], label: 'Italy' },
    { keywords: ['spain'], label: 'Spain' },
    { keywords: ['netherlands', 'holland'], label: 'Netherlands' },
    { keywords: ['belgium'], label: 'Belgium' },
    { keywords: ['switzerland'], label: 'Switzerland' },
    { keywords: ['austria'], label: 'Austria' },
    { keywords: ['sweden'], label: 'Sweden' },
    { keywords: ['norway'], label: 'Norway' },
    { keywords: ['denmark'], label: 'Denmark' },
    { keywords: ['finland'], label: 'Finland' },
    { keywords: ['poland'], label: 'Poland' },
    { keywords: ['portugal'], label: 'Portugal' },
    { keywords: ['ireland'], label: 'Ireland' },
    { keywords: ['czech republic', 'czechia'], label: 'Czech Republic' },
    { keywords: ['romania'], label: 'Romania' },
    { keywords: ['hungary'], label: 'Hungary' },
    { keywords: ['greece'], label: 'Greece' },
    { keywords: ['ukraine'], label: 'Ukraine' },
    { keywords: ['russia'], label: 'Russia' },
    // Americas
    { keywords: ['united states', 'usa', 'u.s.', 'america'], label: 'United States' },
    { keywords: ['canada'], label: 'Canada' },
    { keywords: ['mexico'], label: 'Mexico' },
    { keywords: ['brazil'], label: 'Brazil' },
    { keywords: ['argentina'], label: 'Argentina' },
    { keywords: ['colombia'], label: 'Colombia' },
    { keywords: ['chile'], label: 'Chile' },
    { keywords: ['peru'], label: 'Peru' },
    // Africa
    { keywords: ['south africa'], label: 'South Africa' },
    { keywords: ['nigeria'], label: 'Nigeria' },
    { keywords: ['kenya'], label: 'Kenya' },
    { keywords: ['ghana'], label: 'Ghana' },
    { keywords: ['ethiopia'], label: 'Ethiopia' },
    { keywords: ['egypt'], label: 'Egypt' },
    { keywords: ['morocco'], label: 'Morocco' },
    // Pacific / Oceania
    { keywords: ['new zealand', 'nz'], label: 'New Zealand' },
    // Multi-country regions
    { keywords: ['south east asia', 'southeast asia', 'asean'], label: 'South East Asia' },
    { keywords: ['eastern europe'], label: 'Eastern Europe' },
    { keywords: ['western europe'], label: 'Western Europe' },
    { keywords: ['latin america', 'south america'], label: 'Latin America' },
    { keywords: ['middle east', 'mena'], label: 'Middle East' },
    { keywords: ['africa'], label: 'Africa' },
    { keywords: ['europe'], label: 'Europe' },
    { keywords: ['asia'], label: 'Asia' },
    { keywords: ['global', 'worldwide', 'international'], label: 'Global' },
  ];

  if (current.geography === 'Not specified') {
    let geoVal = '';
    for (const entry of GEO_MAP) {
      if (entry.keywords.some(kw => textLower.includes(kw))) {
        geoVal = entry.label;
        break;
      }
    }
    if (geoVal) {
      updated.geography = geoVal;
      extracted.push(`Geography: ${geoVal}`);
    }
  }


  // 2. Revenue Range — regex-first approach to capture actual numbers from input
  if (current.revenueRange === 'Not specified') {
    // Match patterns like "$5-10M", "$5M-$10M", "5 to 10 million", "5m to 10m" etc.
    const revRegex = /\$?\s*(\d+(?:\.\d+)?)\s*(?:m|million)?\s*[-–to]+\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:m|million)/i;
    const revMatch = text.match(revRegex);
    if (revMatch) {
      const lo = parseFloat(revMatch[1]);
      const hi = parseFloat(revMatch[2]);
      const revVal = `$${lo}M – $${hi}M AUD`;
      updated.revenueRange = revVal;
      extracted.push(`Revenue Range: ${revVal}`);
    } else {
      // Fallback: explicit keyword patterns
      let revVal = '';
      if (textLower.includes('50m') || textLower.includes('50 million') || (textLower.includes('50') && textLower.includes('revenue'))) {
        revVal = '$50M+ AUD';
      } else if (textLower.includes('40m') || textLower.includes('40 million')) {
        revVal = '$15M – $40M AUD';
      } else if (textLower.includes('25m') || textLower.includes('25 million')) {
        revVal = '$25M – $50M AUD';
      } else if (textLower.includes('15m') || textLower.includes('15 million')) {
        revVal = '$15M – $30M AUD';
      } else if (textLower.includes('10m') || textLower.includes('10 million')) {
        revVal = '$10M – $20M AUD';
      }
      if (revVal) {
        updated.revenueRange = revVal;
        extracted.push(`Revenue Range: ${revVal}`);
      }
    }
  }

  // 3. Company Size — regex-first to capture "15-20 staff", "50 employees", "100-150 people" etc.
  if (current.companySize === 'Not specified') {
    const sizeRegex = /(\d+)\s*[-–to]+\s*(\d+)\s*(?:staff|employee|employees|people|headcount|fte)/i;
    const sizeMatch = text.match(sizeRegex);
    if (sizeMatch) {
      const lo = parseInt(sizeMatch[1], 10);
      const hi = parseInt(sizeMatch[2], 10);
      const sizeVal = `${lo} – ${hi} employees`;
      updated.companySize = sizeVal;
      extracted.push(`Company Size: ${sizeVal}`);
    } else {
      // Single number with staff/employee keyword — e.g. "around 50 staff"
      const singleRegex = /(?:around|approx|approximately|about|~)?\s*(\d+)\s*(?:staff|employee|employees|people|headcount|fte)/i;
      const singleMatch = text.match(singleRegex);
      if (singleMatch) {
        const n = parseInt(singleMatch[1], 10);
        const sizeVal = `~${n} employees`;
        updated.companySize = sizeVal;
        extracted.push(`Company Size: ${sizeVal}`);
      }
    }
  }

  // 4. Industry — only set targetIndustry; DO NOT auto-infer primaryActivities from industry keywords alone.
  //    primaryActivities is only set when the user explicitly mentions activity keywords.
  let indVal = '';
  let actVal = '';

  if (textLower.includes('plastic')) {
    indVal = 'Plastics Manufacturing';
    // Only set activities if user explicitly mentioned an activity type
    if (textLower.includes('injection') || textLower.includes('moulding') || textLower.includes('molding')) {
      actVal = 'Custom Injection Moulding';
    } else if (textLower.includes('extrusion') || textLower.includes('extruder')) {
      actVal = 'Extruder Lines';
    } else if (textLower.includes('packaging')) {
      actVal = 'Plastic Packaging';
    }
    // No actVal if user only said "plastic manufacturer" — that's just the industry
  } else if (textLower.includes('packaging')) {
    indVal = 'Industrial Packaging';
    if (textLower.includes('cardboard') || textLower.includes('carton')) {
      actVal = 'Cardboard & Carton Manufacturing';
    } else if (textLower.includes('box')) {
      actVal = 'Industrial Box Lines';
    }
    // Generic "packaging" alone only sets industry, not activities
  } else if (textLower.includes('device') || textLower.includes('medical')) {
    indVal = 'Medical Devices';
    if (textLower.includes('sterile')) {
      actVal = 'Sterile Packaging';
    } else if (textLower.includes('manufactur')) {
      actVal = 'Device Manufacturing';
    }
  } else if (textLower.includes('engineering')) {
    indVal = 'Specialist Engineering';
    if (textLower.includes('precision') || textLower.includes('machining') || textLower.includes('metal')) {
      actVal = 'Precision Metal Machining';
    }
  } else if (textLower.includes('software') || textLower.includes('saas')) {
    indVal = 'Software Development';
    if (textLower.includes('enterprise') || textLower.includes('saas')) {
      actVal = 'Enterprise SaaS';
    }
  } else if (textLower.includes('healthcare') || textLower.includes('health')) {
    indVal = 'Healthcare';
    if (textLower.includes('device') || textLower.includes('manufactur')) {
      actVal = 'Device Manufacturing';
    }
  } else if (textLower.includes('manufactur')) {
    indVal = 'Manufacturing';
    // Only infer General Manufacturing activity if user explicitly used "general manufacturing"
    if (textLower.includes('general manufacturing')) {
      actVal = 'General Manufacturing';
    }
  }

  if (indVal && current.targetIndustry === 'Not specified') {
    updated.targetIndustry = indVal;
    extracted.push(`Target Industry: ${indVal}`);
  }
  // Only update primaryActivities when an explicit activity was identified from the text
  if (actVal && current.primaryActivities === 'Not specified') {
    updated.primaryActivities = actVal;
    extracted.push(`Primary Activities: ${actVal}`);
  }

  // 5. Ownership Profile
  let ownVal = '';
  if (textLower.includes('founder') || textLower.includes('family')) {
    ownVal = 'Founder / Family Owned';
  } else if (textLower.includes('private equity') || textLower.includes('pe-backed') || textLower.includes('pe backed')) {
    ownVal = 'Private Equity Backed';
  } else if (textLower.includes('corporate') || textLower.includes('spin-off') || textLower.includes('spin off')) {
    ownVal = 'Corporate Spin-off';
  }
  if (ownVal && current.ownershipProfile === 'Not specified') {
    updated.ownershipProfile = ownVal;
    extracted.push(`Ownership Profile: ${ownVal}`);
  }

  // 6. Succession
  let succVal = '';
  if (textLower.includes('succession') || textLower.includes('retirement') || textLower.includes('retire') || textLower.includes('transition')) {
    succVal = 'Founder succession / retirement';
  } else if (textLower.includes('stay on') || textLower.includes('management buy')) {
    succVal = 'Management buy-in';
  }
  if (succVal && current.successionPreference === 'Not specified') {
    updated.successionPreference = succVal;
    extracted.push(`Succession: ${succVal}`);
  }

  // 7. Exclusions
  let exclVal = '';
  if (textLower.includes('no public') || textLower.includes('exclude public') || textLower.includes('private only')) {
    exclVal = 'No public companies';
  } else if (textLower.includes('no pre-revenue') || textLower.includes('exclude startup') || textLower.includes('no startup')) {
    exclVal = 'No pre-revenue startups';
  }
  if (exclVal && current.exclusions === 'Not specified') {
    updated.exclusions = exclVal;
    extracted.push(`Exclusions: ${exclVal}`);
  }

  // 8. Additional Details — only set when user provides genuinely specific extra context
  let addVal = '';
  if (textLower.includes('concentration') && (textLower.includes('customer') || textLower.includes('client'))) {
    addVal = text.trim(); // capture the user's own words verbatim
  } else if (textLower.includes('certification') || textLower.includes('iso ') || textLower.includes('accreditat')) {
    addVal = text.trim();
  }
  if (addVal && current.additionalDetails === 'Not specified') {
    updated.additionalDetails = addVal;
    extracted.push(`Additional Details: ${addVal}`);
  }

  return { updated, extracted };
};

export const researchAgentApi = {
  getInitialState: (): { messages: ChatMessage[]; mandate: MandateCriteria; quickPrompts: string[] } => {
    return {
      messages: [
        {
          id: 'msg-init',
          sender: 'agent',
          text: "Hello. I'm your Research Agent.\n\nTell me what kind of business you're looking to acquire. You can describe the industry, location, size, revenue, ownership preferences, or any other special requirements.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      mandate: { ...initialCriteria },
      quickPrompts: [] // Pre-defined prompt buttons removed per specifications
    };
  },

  // Simulates processing a message from the user
  sendMessage: async (
    userMessage: string,
    currentMandate: MandateCriteria,
    currentActiveField: keyof MandateCriteria | null
  ): Promise<AgentResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const updatedMandate = { ...currentMandate };
    let responseText = "";
    let nextActiveField = currentActiveField;
    let isComplete = false;

    // Run multi-field extraction
    const { updated: multiUpdated, extracted } = extractMultiFields(userMessage, currentMandate);

    if (extracted.length > 0) {
      Object.assign(updatedMandate, multiUpdated);
      nextActiveField = getNextUnfilledField(updatedMandate);

      responseText = `Thanks. I've picked up several acquisition criteria from that:\n\n` +
        extracted.map(item => `• ${item}`).join('\n') + 
        `\n\nI've added these to the mandate for your review. Please confirm or edit them in the Acquisition Mandate panel.`;

      if (nextActiveField) {
        responseText += `\n\nNext: ${criteriaQuestions[nextActiveField].question}`;
      } else {
        responseText += `\n\nAll criteria dimensions have suggested values. You can now confirm them to finalize your mandate.`;
        isComplete = true;
      }
    } else {
      // Fallback: update active field or next unfilled field
      const fieldToUpdate = currentActiveField || getNextUnfilledField(currentMandate) || 'targetIndustry';
      updatedMandate[fieldToUpdate] = userMessage;
      nextActiveField = getNextUnfilledField(updatedMandate);

      responseText = `Understood. I have recorded your input for ${fieldToUpdate}.\n\n`;
      if (nextActiveField) {
        responseText += `Next: ${criteriaQuestions[nextActiveField].question}`;
      } else {
        responseText += `All criteria dimensions have suggested values. You can now confirm them to finalize your mandate.`;
        isComplete = true;
      }
    }

    return {
      message: responseText,
      updatedMandate,
      nextQuestion: nextActiveField ? criteriaQuestions[nextActiveField].question : '',
      isComplete,
      quickPrompts: [],
      activeField: nextActiveField
    };
  }
};
