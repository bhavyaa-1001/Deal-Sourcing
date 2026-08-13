import { useState, useCallback, useEffect } from 'react';
import { researchAgentApi } from '../api/researchAgent';
import type { ChatMessage, MandateCriteria } from '../api/researchAgent';
import { useMandateHistory } from '../context/MandateHistoryContext';

export const useResearchAgent = () => {
  const { activeMandate, updateActiveMandate } = useMandateHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<keyof MandateCriteria | null>(null);

  // Extract from active mandate or fall back
  const messages = activeMandate?.conversation || [];
  const mandate: MandateCriteria = activeMandate?.criteria || {
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
  const confirmedCriteria: Record<keyof MandateCriteria, boolean> = activeMandate?.confirmedCriteria || {
    targetIndustry: false,
    primaryActivities: false,
    geography: false,
    revenueRange: false,
    companySize: false,
    ownershipProfile: false,
    successionPreference: false,
    exclusions: false,
    additionalDetails: false
  };

  // Sync initial welcome quick prompts when starting a new mandate
  useEffect(() => {
    if (messages.length === 1 && messages[0].id.includes('welcome')) {
      setQuickPrompts(researchAgentApi.getInitialState().quickPrompts);
      setActiveField(null);
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || !activeMandate) return;

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedConversation = [...messages, userMsg];
    updateActiveMandate({
      conversation: updatedConversation
    });
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

      // Determine new confirmed states: if a value was suggested/updated, ensure it remains unconfirmed
      const newConfirmed = { ...confirmedCriteria };
      (Object.keys(result.updatedMandate) as (keyof MandateCriteria)[]).forEach(k => {
        // If value changed from previous, or became filled, mark as unconfirmed (SUGGESTED)
        if (result.updatedMandate[k] !== mandate[k]) {
          newConfirmed[k] = false; 
        }
      });

      updateActiveMandate({
        conversation: [...updatedConversation, agentMsg],
        criteria: result.updatedMandate,
        confirmedCriteria: newConfirmed
      });

      setQuickPrompts(result.quickPrompts);
      setActiveField(result.activeField);
    } catch (error) {
      console.error("Failed to send message to Research Agent:", error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, mandate, activeField, confirmedCriteria, activeMandate, isLoading, updateActiveMandate]);

  const confirmField = useCallback((field: keyof MandateCriteria) => {
    if (!activeMandate) return;
    const updatedConfirmed = {
      ...confirmedCriteria,
      [field]: true
    };
    updateActiveMandate({
      confirmedCriteria: updatedConfirmed
    });
  }, [confirmedCriteria, activeMandate, updateActiveMandate]);

  const unconfirmField = useCallback((field: keyof MandateCriteria) => {
    if (!activeMandate) return;
    const updatedConfirmed = {
      ...confirmedCriteria,
      [field]: false
    };
    updateActiveMandate({
      confirmedCriteria: updatedConfirmed
    });
  }, [confirmedCriteria, activeMandate, updateActiveMandate]);

  const resetConversation = useCallback(() => {
    if (!activeMandate) return;
    const initialState = researchAgentApi.getInitialState();
    
    updateActiveMandate({
      conversation: initialState.messages,
      criteria: initialState.mandate,
      confirmedCriteria: {
        targetIndustry: false,
        primaryActivities: false,
        geography: false,
        revenueRange: false,
        companySize: false,
        ownershipProfile: false,
        successionPreference: false,
        exclusions: false,
        additionalDetails: false
      },
      status: 'Draft',
      currentWorkflowStep: 1
    });

    setQuickPrompts(initialState.quickPrompts);
    setActiveField(null);
    setIsLoading(false);
  }, [activeMandate, updateActiveMandate]);

  const updateSummaryFieldDirectly = useCallback((field: keyof MandateCriteria, value: string) => {
    if (!activeMandate) return;
    const nextCriteria = {
      ...mandate,
      [field]: value
    };
    const nextConfirmed = {
      ...confirmedCriteria,
      [field]: true // Manually edited/saved fields default to Confirmed
    };
    updateActiveMandate({
      criteria: nextCriteria,
      confirmedCriteria: nextConfirmed
    });
  }, [mandate, confirmedCriteria, activeMandate, updateActiveMandate]);

  return {
    messages,
    mandate: mandate as MandateCriteria,
    confirmedCriteria: confirmedCriteria as Record<keyof MandateCriteria, boolean>,
    quickPrompts,
    activeField,
    isLoading,
    sendMessage,
    confirmField,
    unconfirmField,
    resetConversation,
    updateSummaryFieldDirectly
  };
};
export type UseResearchAgentReturn = ReturnType<typeof useResearchAgent>;
export default useResearchAgent;
