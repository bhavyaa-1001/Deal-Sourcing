import { useState, useCallback } from 'react';
import { researchAgentApi } from '../api/researchAgent';
import type { ChatMessage, MandateCriteria } from '../api/researchAgent';

const mapStorageToCriteria = (storedMandate: any): MandateCriteria => {
  return {
    targetIndustry: storedMandate.targetIndustry || 'Not specified',
    primaryActivities: storedMandate.targetActivity || 'Not specified',
    geography: storedMandate.geography || 'Not specified',
    revenueRange: typeof storedMandate.revenueRange === 'object' 
      ? storedMandate.revenueRange.label 
      : storedMandate.revenueRange || 'Not specified',
    companySize: typeof storedMandate.employeeRange === 'object'
      ? storedMandate.employeeRange.label
      : storedMandate.employeeRange || 'Not specified',
    ownershipProfile: storedMandate.ownershipPreference || 'Not specified',
    successionPreference: storedMandate.successionPreference || 'Not specified',
    exclusions: Array.isArray(storedMandate.industryExclusions)
      ? storedMandate.industryExclusions.join(', ') || 'Not specified'
      : storedMandate.industryExclusions || 'Not specified'
  };
};

export const useResearchAgent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem('dealsourcing_mandate');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.messages && Array.isArray(parsed.messages)) {
          return parsed.messages;
        }
        if (parsed.status === 'Approved') {
          return [
            {
              id: 'msg-init-loaded',
              sender: 'agent',
              text: "Hello. I've loaded your defined acquisition mandate. You can review the criteria on the right, edit them directly using the edit icons, or continue to the next stage.",
              timestamp: '10:30 AM'
            }
          ];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return researchAgentApi.getInitialState().messages;
  });
  
  const [mandate, setMandate] = useState<MandateCriteria>(() => {
    const stored = localStorage.getItem('dealsourcing_mandate');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.targetIndustry || parsed.geography) {
          return mapStorageToCriteria(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return researchAgentApi.getInitialState().mandate;
  });

  const [quickPrompts, setQuickPrompts] = useState<string[]>(() => {
    const stored = localStorage.getItem('dealsourcing_mandate');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.quickPrompts && Array.isArray(parsed.quickPrompts)) {
          return parsed.quickPrompts;
        }
        if (parsed.status === 'Approved') {
          return [];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return researchAgentApi.getInitialState().quickPrompts;
  });

  const [activeField, setActiveField] = useState<keyof MandateCriteria | null>(() => {
    const stored = localStorage.getItem('dealsourcing_mandate');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.activeField !== undefined) {
          return parsed.activeField;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const [isComplete, setIsComplete] = useState<boolean>(() => {
    const stored = localStorage.getItem('dealsourcing_mandate');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.isComplete !== undefined) {
          return parsed.isComplete;
        }
        if (parsed.status === 'Approved') {
          return true;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  });

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Call mock Research Agent API
      const result = await researchAgentApi.sendMessage(text.trim(), mandate, activeField);
      
      // 3. Add Agent response message
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        text: result.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);
      setMandate(result.updatedMandate);
      setQuickPrompts(result.quickPrompts);
      setActiveField(result.activeField);
      setIsComplete(result.isComplete);
    } catch (error) {
      console.error("Failed to send message to Research Agent:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mandate, activeField, isLoading]);

  const resetConversation = useCallback(() => {
    const initialState = researchAgentApi.getInitialState();
    setMessages(initialState.messages);
    setMandate(initialState.mandate);
    setQuickPrompts(initialState.quickPrompts);
    setActiveField(null);
    setIsComplete(false);
    setIsLoading(false);
  }, []);

  const saveDraft = useCallback(() => {
    const stored = localStorage.getItem('dealsourcing_mandate');
    let currentStatus = 'Draft';
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        currentStatus = parsed.status || 'Draft';
      } catch (e) {
        console.error(e);
      }
    }

    const mandateObj = {
      id: 'mandate-101',
      title: 'Deal Sourcing Mandate',
      status: currentStatus,
      rawInput: `Plastics Manufacturing in Australia. Size: ${mandate.companySize}. Revenue: ${mandate.revenueRange}.`,
      objective: `Acquire target matching ${mandate.targetIndustry} in ${mandate.geography}`,
      geography: mandate.geography,
      targetIndustry: mandate.targetIndustry,
      targetActivity: mandate.primaryActivities,
      revenueRange: { min: 15000000, max: 50000000, label: mandate.revenueRange },
      employeeRange: { min: 50, max: 150, label: mandate.companySize },
      ownershipPreference: mandate.ownershipProfile,
      successionPreference: mandate.successionPreference,
      industryExclusions: mandate.exclusions !== 'Not specified' ? [mandate.exclusions] : [],
      otherRequirements: '',
      lastUpdated: new Date().toISOString(),

      // Session context fields
      messages,
      isComplete,
      activeField,
      quickPrompts
    };
    
    localStorage.setItem('dealsourcing_mandate', JSON.stringify(mandateObj));
  }, [mandate, messages, isComplete, activeField, quickPrompts]);

  const updateSummaryFieldDirectly = useCallback((field: keyof MandateCriteria, value: string) => {
    setMandate(prev => {
      const next = { ...prev, [field]: value };
      
      // Auto-save changes back to localStorage if mandate is already loaded
      const stored = localStorage.getItem('dealsourcing_mandate');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const mandateObj = {
            ...parsed,
            geography: next.geography,
            targetIndustry: next.targetIndustry,
            targetActivity: next.primaryActivities,
            revenueRange: { ...parsed.revenueRange, label: next.revenueRange },
            employeeRange: { ...parsed.employeeRange, label: next.companySize },
            ownershipPreference: next.ownershipProfile,
            successionPreference: next.successionPreference,
            industryExclusions: next.exclusions !== 'Not specified' ? [next.exclusions] : [],
            lastUpdated: new Date().toISOString()
          };
          localStorage.setItem('dealsourcing_mandate', JSON.stringify(mandateObj));
        } catch (e) {
          console.error("Failed to save edited mandate field to storage:", e);
        }
      }
      return next;
    });
  }, []);

  return {
    messages,
    mandate,
    quickPrompts,
    activeField,
    isLoading,
    isComplete,
    sendMessage,
    resetConversation,
    saveDraft,
    updateSummaryFieldDirectly
  };
};
export type UseResearchAgentReturn = ReturnType<typeof useResearchAgent>;
export default useResearchAgent;
