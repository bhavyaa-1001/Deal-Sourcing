import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ChatMessage, MandateCriteria } from '../api/researchAgent';
import { initialCriteria } from '../api/researchAgent';

export interface HistoryMandate {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: 'Draft' | 'Confirmed' | 'Approved';
  conversation: ChatMessage[];
  criteria: MandateCriteria;
  confirmedCriteria: Record<keyof MandateCriteria, boolean>;
  currentWorkflowStep: number;
}

interface MandateHistoryContextType {
  mandates: HistoryMandate[];
  activeId: string;
  activeMandate: HistoryMandate | null;
  createNewMandate: () => void;
  selectMandate: (id: string) => void;
  updateActiveMandate: (updates: Partial<HistoryMandate>) => void;
  deleteMandate: (id: string) => void;
  resetActiveMandate: () => void;
  triggerRefresh: () => void;
  refreshTrigger: number;
}

const MandateHistoryContext = createContext<MandateHistoryContextType | undefined>(undefined);

const SEED_MANDATES: HistoryMandate[] = [
  {
    id: 'mandate-101',
    title: 'Australian Plastics Acquisition',
    createdAt: '2026-08-13T10:00:00.000Z',
    updatedAt: '2026-08-13T10:30:00.000Z',
    status: 'Approved',
    criteria: {
      targetIndustry: 'Plastics Manufacturing',
      primaryActivities: 'Packaging & Industrial Moulding',
      geography: 'Australia',
      revenueRange: '$15M – $50M AUD',
      companySize: '80 – 120 employees',
      ownershipProfile: 'Founder / Family Owned',
      successionPreference: 'Founder succession / retirement',
      exclusions: 'No public companies',
      additionalDetails: 'Long-term founder transition preferred'
    },
    confirmedCriteria: {
      targetIndustry: true,
      primaryActivities: true,
      geography: true,
      revenueRange: true,
      companySize: true,
      ownershipProfile: true,
      successionPreference: true,
      exclusions: true,
      additionalDetails: true
    },
    conversation: [
      {
        id: 'msg-seed-1',
        sender: 'agent',
        text: "Welcome. Let's work together to define your acquisition mandate. What industry are you targeting?",
        timestamp: '10:00 AM'
      },
      {
        id: 'msg-seed-2',
        sender: 'user',
        text: "I'm looking for a plastics manufacturing business in Australia.",
        timestamp: '10:05 AM'
      },
      {
        id: 'msg-seed-3',
        sender: 'agent',
        text: "Understood. Australian plastics manufacturing. Let's talk about the target company's size and financial profile. What is your preferred range for annual revenue?",
        timestamp: '10:06 AM'
      },
      {
        id: 'msg-seed-4',
        sender: 'user',
        text: "We want something middle-market, roughly $15M to $50M AUD.",
        timestamp: '10:10 AM'
      },
      {
        id: 'msg-seed-5',
        sender: 'agent',
        text: "Understood, middle-market plastics with $15M–$50M revenue. I have filled in these fields. Let's clarify what ownership structure is preferred. Is it founder-led?",
        timestamp: '10:12 AM'
      },
      {
        id: 'msg-seed-6',
        sender: 'user',
        text: "Yes, ideally founder or family-owned with succession issues.",
        timestamp: '10:15 AM'
      },
      {
        id: 'msg-seed-7',
        sender: 'agent',
        text: "Perfect. I have suggested Founder / Family Owned and Founder succession. Please review the mandate criteria on the right, click confirm for each, and we can proceed.",
        timestamp: '10:16 AM'
      }
    ],
    currentWorkflowStep: 4
  },
  {
    id: 'mandate-102',
    title: 'Industrial Packaging Search',
    createdAt: '2026-08-12T09:00:00.000Z',
    updatedAt: '2026-08-12T14:20:00.000Z',
    status: 'Draft',
    criteria: {
      targetIndustry: 'Industrial Packaging',
      primaryActivities: 'Cardboard & Carton manufacturing',
      geography: 'Victoria, Australia',
      revenueRange: '$10M – $25M AUD',
      companySize: '40 – 80 employees',
      ownershipProfile: 'Private Equity Backed',
      successionPreference: 'Not specified',
      exclusions: 'Not specified',
      additionalDetails: 'Not specified'
    },
    confirmedCriteria: {
      targetIndustry: true,
      primaryActivities: true,
      geography: true,
      revenueRange: false,
      companySize: false,
      ownershipProfile: false,
      successionPreference: false,
      exclusions: false,
      additionalDetails: false
    },
    conversation: [
      {
        id: 'msg-seed-b1',
        sender: 'agent',
        text: "Welcome. Let's work together to define your acquisition mandate. What industry are you targeting?",
        timestamp: '09:00 AM'
      },
      {
        id: 'msg-seed-b2',
        sender: 'user',
        text: "Industrial Packaging.",
        timestamp: '09:05 AM'
      },
      {
        id: 'msg-seed-b3',
        sender: 'agent',
        text: "Great. What primary activities should they perform?",
        timestamp: '09:06 AM'
      },
      {
        id: 'msg-seed-b4',
        sender: 'user',
        text: "Cardboard & Carton manufacturing in Victoria, Australia.",
        timestamp: '09:12 AM'
      },
      {
        id: 'msg-seed-b5',
        sender: 'agent',
        text: "Got it. Victoria, Australia. I've populated the geography and activity fields. What is your preferred size?",
        timestamp: '09:15 AM'
      }
    ],
    currentWorkflowStep: 1
  },
  {
    id: 'mandate-103',
    title: 'Healthcare Manufacturing',
    createdAt: '2026-08-10T11:00:00.000Z',
    updatedAt: '2026-08-10T12:00:00.000Z',
    status: 'Draft',
    criteria: {
      targetIndustry: 'Medical Devices',
      primaryActivities: 'Sterile packaging',
      geography: 'New South Wales',
      revenueRange: 'Not specified',
      companySize: 'Not specified',
      ownershipProfile: 'Not specified',
      successionPreference: 'Not specified',
      exclusions: 'Not specified',
      additionalDetails: 'Not specified'
    },
    confirmedCriteria: {
      targetIndustry: true,
      primaryActivities: true,
      geography: false,
      revenueRange: false,
      companySize: false,
      ownershipProfile: false,
      successionPreference: false,
      exclusions: false,
      additionalDetails: false
    },
    conversation: [
      {
        id: 'msg-seed-c1',
        sender: 'agent',
        text: "Welcome. Let's work together to define your acquisition mandate. What industry are you targeting?",
        timestamp: '11:00 AM'
      },
      {
        id: 'msg-seed-c2',
        sender: 'user',
        text: "Healthcare device manufacturing, sterile packaging, in New South Wales.",
        timestamp: '11:05 AM'
      }
    ],
    currentWorkflowStep: 1
  }
];

export const MandateHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mandates, setMandates] = useState<HistoryMandate[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initial Load & Seeding
  useEffect(() => {
    const storedHistory = localStorage.getItem('dealsourcing_mandates_history');
    const storedActiveId = localStorage.getItem('dealsourcing_mandates_active_id');

    let loadedMandates = SEED_MANDATES;
    if (storedHistory) {
      try {
        loadedMandates = JSON.parse(storedHistory);
      } catch (e) {
        console.error('Failed to parse history mandates:', e);
      }
    } else {
      localStorage.setItem('dealsourcing_mandates_history', JSON.stringify(SEED_MANDATES));
    }
    setMandates(loadedMandates);

    const initialActiveId = storedActiveId || 'mandate-101';
    setActiveId(initialActiveId);
    localStorage.setItem('dealsourcing_mandates_active_id', initialActiveId);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Sync Active Mandate values to active storage to ensure downstream pages function properly
  const syncToActiveMandate = useCallback((mandateObj: HistoryMandate) => {
    const mandateStorageFormat = {
      id: mandateObj.id,
      title: mandateObj.title,
      status: mandateObj.status === 'Approved' ? 'Approved' : 'Draft',
      rawInput: '',
      objective: 'Define the acquisition strategy based on inputs.',
      geography: mandateObj.criteria.geography,
      targetIndustry: mandateObj.criteria.targetIndustry,
      targetActivity: mandateObj.criteria.primaryActivities,
      revenueRange: { min: 0, max: 0, label: mandateObj.criteria.revenueRange },
      employeeRange: { min: 0, max: 0, label: mandateObj.criteria.companySize },
      ownershipPreference: mandateObj.criteria.ownershipProfile,
      successionPreference: mandateObj.criteria.successionPreference,
      industryExclusions: mandateObj.criteria.exclusions !== 'Not specified' ? [mandateObj.criteria.exclusions] : [],
      otherRequirements: '',
      lastUpdated: mandateObj.updatedAt
    };
    localStorage.setItem('dealsourcing_mandate', JSON.stringify(mandateStorageFormat));
  }, []);

  // Create a completely new mandate session
  const createNewMandate = useCallback(() => {
    const newId = `mandate-${Date.now()}`;
    const newMandateObj: HistoryMandate = {
      id: newId,
      title: `Mandate Search - ${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Draft',
      conversation: [
        {
          id: `msg-${Date.now()}-welcome`,
          sender: 'agent',
          text: "Welcome to your new acquisition mandate session. Please describe what industry or type of business you want to acquire to start.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      criteria: { ...initialCriteria },
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
      currentWorkflowStep: 1
    };

    const updated = [newMandateObj, ...mandates];
    setMandates(updated);
    setActiveId(newId);
    localStorage.setItem('dealsourcing_mandates_history', JSON.stringify(updated));
    localStorage.setItem('dealsourcing_mandates_active_id', newId);
    
    syncToActiveMandate(newMandateObj);
    triggerRefresh();
  }, [mandates, syncToActiveMandate, triggerRefresh]);

  // Select an existing mandate
  const selectMandate = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem('dealsourcing_mandates_active_id', id);
    
    const selected = mandates.find(m => m.id === id);
    if (selected) {
      syncToActiveMandate(selected);
    }
    triggerRefresh();
  }, [mandates, syncToActiveMandate, triggerRefresh]);

  // Update fields on the active mandate (auto-saves to storage)
  const updateActiveMandate = useCallback((updates: Partial<HistoryMandate>) => {
    if (!activeId) return;

    setMandates(prev => {
      const updatedList = prev.map(m => {
        if (m.id === activeId) {
          const merged = {
            ...m,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          syncToActiveMandate(merged);
          return merged;
        }
        return m;
      });
      localStorage.setItem('dealsourcing_mandates_history', JSON.stringify(updatedList));
      return updatedList;
    });
    triggerRefresh();
  }, [activeId, syncToActiveMandate, triggerRefresh]);

  const deleteMandate = useCallback((id: string) => {
    setMandates(prev => {
      const updatedList = prev.filter(m => m.id !== id);
      localStorage.setItem('dealsourcing_mandates_history', JSON.stringify(updatedList));
      
      if (activeId === id) {
        const nextActive = updatedList[0];
        if (nextActive) {
          setActiveId(nextActive.id);
          localStorage.setItem('dealsourcing_mandates_active_id', nextActive.id);
          syncToActiveMandate(nextActive);
        } else {
          // All mandates deleted — clear active id, leave list empty
          setActiveId('');
          localStorage.removeItem('dealsourcing_mandates_active_id');
          localStorage.removeItem('dealsourcing_mandate');
        }
      }
      return updatedList;
    });
    triggerRefresh();
  }, [activeId, syncToActiveMandate, triggerRefresh]);

  // Reset ONLY the currently active mandate back to a blank Draft, preserving all others
  const resetActiveMandate = useCallback(() => {
    if (!activeId) return;
    setMandates(prev => {
      const updatedList = prev.map(m => {
        if (m.id !== activeId) return m;
        const reset: HistoryMandate = {
          ...m,
          status: 'Draft',
          updatedAt: new Date().toISOString(),
          conversation: [
            {
              id: `msg-${Date.now()}-reset`,
              sender: 'agent',
              text: 'This mandate has been reset. Please describe the industry or type of business you want to acquire.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ],
          criteria: { ...initialCriteria },
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
          currentWorkflowStep: 1
        };
        syncToActiveMandate(reset);
        // Clear strategy data for this mandate so stepper locks
        localStorage.removeItem(`dealsourcing_strategy_${m.id}`);
        return reset;
      });
      localStorage.setItem('dealsourcing_mandates_history', JSON.stringify(updatedList));
      return updatedList;
    });
    triggerRefresh();
  }, [activeId, syncToActiveMandate, triggerRefresh]);

  const activeMandate = mandates.find(m => m.id === activeId) || null;

  return (
    <MandateHistoryContext.Provider
      value={{
        mandates,
        activeId,
        activeMandate,
        createNewMandate,
        selectMandate,
        updateActiveMandate,
        deleteMandate,
        resetActiveMandate,
        triggerRefresh,
        refreshTrigger
      }}
    >
      {children}
    </MandateHistoryContext.Provider>
  );
};

export const useMandateHistory = () => {
  const context = useContext(MandateHistoryContext);
  if (!context) {
    throw new Error('useMandateHistory must be used within MandateHistoryProvider');
  }
  return context;
};
