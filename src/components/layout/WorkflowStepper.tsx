import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
  description: string;
  path: string;
}

const STEPS: Step[] = [
  { number: 1, label: 'Define Mandate', description: 'Describe what you want to acquire', path: '/mandate' },
  { number: 2, label: 'Discover Companies', description: 'Explore matching opportunities', path: '/discover' },
  { number: 3, label: 'Enrich Leads', description: 'Select & enrich one lead at a time', path: '/review' },
  { number: 4, label: 'Outreach', description: 'Create personalized messages for selected contacts', path: '/outreach' },
];

interface WorkflowStepperProps {
  mandateApproved: boolean;
  researchApproved?: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  mandateApproved
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current active step
  const currentStepIndex = STEPS.findIndex(step => location.pathname.startsWith(step.path));
  const currentStep = currentStepIndex !== -1 ? currentStepIndex + 1 : 1;

  // Determine which steps are unlocked
  const isStepUnlocked = (stepNum: number): boolean => {
    if (stepNum === 1) return true;
    if (stepNum >= 2) return mandateApproved;
    return false;
  };

  const handleStepClick = (step: Step) => {
    if (isStepUnlocked(step.number)) {
      navigate(step.path);
    }
  };

  return (
    <div className="w-full bg-[#FFFFFF] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155] shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-2.5">
        {/* Desktop and Tablet Stepper Layout */}
        <nav aria-label="Progress Stepper" className="hidden md:block">
          <ol className="flex items-center justify-between w-full">
            {STEPS.map((step, idx) => {
              const isCompleted = step.number < currentStep || (step.number === 1 && mandateApproved);
              const isActive = step.number === currentStep;
              const isUnlocked = isStepUnlocked(step.number);

              return (
                <li
                  key={step.number}
                  className={`flex items-center ${idx === STEPS.length - 1 ? 'flex-initial shrink-0' : 'flex-1'}`}
                >
                  <button
                    onClick={() => handleStepClick(step)}
                    disabled={!isUnlocked}
                    className={`
                      flex items-center gap-2.5 text-left focus-ring rounded-lg px-4 py-2 transition-all cursor-pointer shrink-0
                      disabled:cursor-not-allowed disabled:opacity-40
                      ${isActive 
                        ? 'bg-[#0F172A] text-white dark:bg-[#F8FAFC] dark:text-[#0F172A] shadow-md border border-[#0F172A] dark:border-white' 
                        : isCompleted
                          ? 'bg-[#F1F5F9] text-[#0F172A] dark:bg-[#1E293B] dark:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#475569] hover:bg-[#E2E8F0]'
                          : 'bg-transparent text-[#64748B] dark:text-[#94A3B8] border border-transparent hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
                      }
                    `}
                  >
                    {/* Circle Indicator */}
                    <span
                      className={`
                        w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border
                        transition-all duration-200 shrink-0
                        ${isActive
                          ? 'bg-white text-[#0F172A] border-white dark:bg-[#0F172A] dark:text-white dark:border-[#0F172A] font-black'
                          : isCompleted
                            ? 'bg-[#14532D] text-white border-[#14532D]'
                            : 'bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1] dark:bg-[#1E293B] dark:text-[#94A3B8] dark:border-[#475569]'
                        }
                      `}
                    >
                      {isCompleted && !isActive ? (
                        <Check className="h-4 w-4 stroke-[3px] text-white" />
                      ) : (
                        `0${step.number}`
                      )}
                    </span>

                    {/* Step Label only — high contrast and distinct */}
                    <span className={`text-sm leading-tight whitespace-nowrap ${
                      isActive 
                        ? 'font-black text-white dark:text-[#0F172A]' 
                        : isCompleted
                          ? 'font-bold text-[#0F172A] dark:text-[#F8FAFC]'
                          : 'font-semibold text-[#64748B] dark:text-[#94A3B8]'
                    }`}>
                      {step.label}
                    </span>
                  </button>
                  
                  {/* Connecting line */}
                  {idx !== STEPS.length - 1 && (
                    <div
                      className={`
                        flex-1 h-[2px] mx-3 rounded-full transition-colors duration-300
                        ${isCompleted 
                          ? 'bg-[#14532D] dark:bg-[#166534]' 
                          : isStepUnlocked(step.number + 1) 
                            ? 'bg-[#CBD5E1] dark:bg-[#475569]' 
                            : 'bg-[#E2E8F0] dark:bg-[#334155]'
                        }
                      `}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Mobile Stepper Layout */}
        <div className="block md:hidden">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#14532D] dark:text-[#4ADE80]">
                Step {currentStep} of 4
              </span>
              <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                {STEPS[currentStep - 1]?.label}
              </h2>
            </div>
            
            {/* Simple Prev/Next Navigation Controls for Quick Stepper navigation on Mobile */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStepClick(STEPS[currentStep - 2])}
                disabled={currentStep === 1}
                className="px-2.5 py-1 text-xs font-bold rounded border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handleStepClick(STEPS[currentStep])}
                disabled={currentStep === 4 || !isStepUnlocked(currentStep + 1)}
                className="px-2.5 py-1 text-xs font-bold rounded border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          {/* Simple Visual Progress Bar Line for Mobile */}
          <div className="w-full bg-[#E2E8F0] dark:bg-[#334155] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#14532D] dark:bg-[#166534] h-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStepper;
