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
  { number: 3, label: 'Discover Founders', description: 'Identify & enrich founder profiles', path: '/founders' },
  { number: 4, label: 'Review Results', description: 'Shortlist and compare deals', path: '/review' },
  { number: 5, label: 'Outreach', description: 'Create personalized messages for selected contacts', path: '/outreach' },
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
    <div className="w-full bg-[#EDEBE5] dark:bg-[#111B27] border-b border-[#D8D5CE] dark:border-[#263544] shadow-[0_1px_3px_rgba(32,42,46,0.04)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-3">
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
                      flex items-center gap-2.5 text-left focus-ring rounded-xl px-3.5 py-2 transition-all cursor-pointer
                      disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#F1EFEA] dark:hover:bg-[#233447] shrink-0
                      ${isActive ? 'bg-white dark:bg-[#1D2B3A] shadow-[0_1px_3px_rgba(32,42,46,0.08)] border border-[#D8D5CE] dark:border-[#756C36]' : ''}
                    `}
                  >
                    {/* Circle Indicator */}
                    <span
                      className={`
                        w-7.5 h-7.5 rounded-full flex items-center justify-center font-black text-xs md:text-[13px] border
                        transition-all duration-200 shrink-0
                        ${isCompleted
                          ? 'bg-[#E3ECE6] text-[#35624A] border-[#B7CCBC] dark:bg-[#173529] dark:text-[#8FBEA1] dark:border-[#39634D]'
                          : isActive
                            ? 'bg-[#A65F3F] text-white border-[#A65F3F] dark:bg-[#38351F] dark:text-[#D2C66D] dark:border-[#756C36] shadow-sm'
                            : 'bg-white text-[#626A6D] border-[#D8D5CE] dark:bg-[#182536] dark:text-[#91A0AF] dark:border-[#344657]'
                        }
                      `}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3px] text-[#35624A] dark:text-[#8FBEA1]" /> : `0${step.number}`}
                    </span>

                    {/* Step Label only — clear high contrast, larger font */}
                    <span className={`text-sm md:text-[15px] leading-tight whitespace-nowrap ${
                      isActive 
                        ? 'font-black text-[#A65F3F] dark:text-[#E0D77F]' 
                        : isCompleted
                          ? 'font-bold text-[#35624A] dark:text-[#9FC9AC]'
                          : 'font-bold text-[#626A6D] dark:text-[#91A0AF]'
                    }`}>
                      {step.label}
                    </span>
                  </button>
                  
                  {/* Connecting line */}
                  {idx !== STEPS.length - 1 && (
                    <div
                      className={`
                        flex-1 h-[2.5px] mx-2.5 rounded-full transition-colors duration-300
                        ${isCompleted 
                          ? 'bg-[#35624A] dark:bg-[#47705A]' 
                          : isStepUnlocked(step.number + 1) 
                            ? 'bg-[#A65F3F]/40 dark:bg-[#756C36]/50' 
                            : 'bg-[#D8D5CE] dark:bg-[#263544]'
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
              <span className="text-[11px] font-black uppercase tracking-wider text-[#A65F3F] dark:text-[#E0D77F]">
                Step {currentStep} of 5
              </span>
              <h2 className="text-base font-bold text-[#202A2E] dark:text-[#F1F5F9] tracking-tight">
                {STEPS[currentStep - 1]?.label}
              </h2>
            </div>
            
            {/* Simple Prev/Next Navigation Controls for Quick Stepper navigation on Mobile */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStepClick(STEPS[currentStep - 2])}
                disabled={currentStep === 1}
                className="px-2.5 py-1 text-xs font-bold rounded border border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#182536] text-[#202A2E] dark:text-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handleStepClick(STEPS[currentStep])}
                disabled={currentStep === 5 || !isStepUnlocked(currentStep + 1)}
                className="px-2.5 py-1 text-xs font-bold rounded border border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#182536] text-[#202A2E] dark:text-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          {/* Simple Visual Progress Bar Line for Mobile */}
          <div className="w-full bg-[#E5E2DC] dark:bg-[#293746] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#A65F3F] dark:bg-[#5F8F70] h-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default WorkflowStepper;
