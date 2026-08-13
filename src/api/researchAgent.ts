// DEAL SOURCING - Research Agent Mock Service
// Conceptual layer to simulate chat conversation and mandate extraction.
// This structure will be easy to replace with a real Python backend API later.

export interface MandateCriteria {
  targetIndustry: string;
  primaryActivities: string;
  geography: string;
  revenueRange: string;
  companySize: string;
  ownershipProfile: string;
  successionPreference: string;
  exclusions: string;
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
  exclusions: 'Not specified'
};

const criteriaQuestions: Record<keyof MandateCriteria, { question: string; prompts: string[] }> = {
  targetIndustry: {
    question: "What type of business are you looking to acquire?",
    prompts: ["Plastics Manufacturing", "Packaging Companies", "Specialist Engineering"]
  },
  primaryActivities: {
    question: "Are there particular types of activities or business lines you're interested in?",
    prompts: ["Packaging & Industrial Moulding", "Custom Injection Moulding", "Extruder Lines"]
  },
  geography: {
    question: "What is your target geography or location?",
    prompts: ["Australia (East Coast Focus)", "Australia (All States)", "New Zealand", "International"]
  },
  revenueRange: {
    question: "What revenue range would you like to focus on?",
    prompts: ["$15M – $50M AUD", "$5M – $15M AUD", "$50M+ AUD"]
  },
  companySize: {
    question: "What company size would you prefer in terms of employee headcount?",
    prompts: ["50 – 150 employees", "20 – 50 employees", "150+ employees"]
  },
  ownershipProfile: {
    question: "Do you have any ownership or founder preferences?",
    prompts: ["Private, Founder-led", "Family Owned", "Private Equity Portfolio", "No preference"]
  },
  successionPreference: {
    question: "Are there any succession characteristics that matter to your mandate?",
    prompts: ["Founder succession opportunities", "Retiring owners", "No preference"]
  },
  exclusions: {
    question: "Are there any industries or activities you'd like us to exclude?",
    prompts: ["Commodity plastics, Recycling only", "Automotive applications", "No specific exclusions"]
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
    'exclusions'
  ];
  for (const f of fieldsOrder) {
    if (mandate[f] === 'Not specified') return f;
  }
  return null;
};

// Maps conversational matches to structured updates
const extractFieldData = (field: keyof MandateCriteria, text: string): string => {
  // Check if text exactly matches or closely matches one of our presets to populate summary nicely
  const presets = criteriaQuestions[field].prompts;
  const match = presets.find(p => text.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(text.toLowerCase()));
  if (match) return match;
  return text; // Fallback to raw text
};

export const researchAgentApi = {
  getInitialState: (): { messages: ChatMessage[]; mandate: MandateCriteria; quickPrompts: string[] } => {
    return {
      messages: [
        {
          id: 'msg-init',
          sender: 'agent',
          text: "Hello. I'm your Research Agent.\n\nTell me what kind of business you're looking to acquire. You can describe the industry, location, size, revenue, ownership preferences, or anything else that matters to you.",
          timestamp: '10:30 AM'
        }
      ],
      mandate: { ...initialCriteria },
      quickPrompts: ["Industry", "Location", "Revenue range", "Company size"]
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

    // 1. If we have an active field being answered
    if (currentActiveField) {
      updatedMandate[currentActiveField] = extractFieldData(currentActiveField, userMessage);
      nextActiveField = getNextUnfilledField(updatedMandate);
    } 
    // 2. If user clicks a top-level prompt to start a topic, e.g. "Revenue range"
    else {
      const msgLower = userMessage.toLowerCase();
      if (msgLower.includes('industry')) {
        nextActiveField = 'targetIndustry';
      } else if (msgLower.includes('location') || msgLower.includes('geography')) {
        nextActiveField = 'geography';
      } else if (msgLower.includes('revenue')) {
        nextActiveField = 'revenueRange';
      } else if (msgLower.includes('size') || msgLower.includes('employee')) {
        nextActiveField = 'companySize';
      } else if (msgLower.includes('ownership')) {
        nextActiveField = 'ownershipProfile';
      } else if (msgLower.includes('successions')) {
        nextActiveField = 'successionPreference';
      } else if (msgLower.includes('exclusion')) {
        nextActiveField = 'exclusions';
      } else {
        // Assume they are describing target industry/first criteria
        nextActiveField = 'targetIndustry';
        updatedMandate.targetIndustry = extractFieldData('targetIndustry', userMessage);
        // Trigger next field
        nextActiveField = getNextUnfilledField(updatedMandate);
      }
    }

    // 3. Compile agent response text and new prompt options
    if (nextActiveField) {
      responseText = criteriaQuestions[nextActiveField].question;
    } else {
      responseText = "Got it. Your mandate is ready to review.";
      isComplete = true;
    }

    return {
      message: responseText,
      updatedMandate,
      nextQuestion: nextActiveField ? criteriaQuestions[nextActiveField].question : '',
      isComplete,
      quickPrompts: nextActiveField ? criteriaQuestions[nextActiveField].prompts : [],
      activeField: nextActiveField
    };
  }
};
