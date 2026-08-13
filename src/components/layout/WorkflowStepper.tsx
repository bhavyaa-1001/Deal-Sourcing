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
  { number: 2, label: 'Research Strategy', description: 'See how we will find deals', path: '/research' },
  { number: 3, label: 'Discover Companies', description: 'Explore matching opportunities', path: '/discover' },
  { number: 4, label: 'Review Results', description: 'Shortlist and compare deals', path: '/review' },
  { number: 5, label: 'Outreach', description: 'Create personalized messages for selected contacts', path: '/outreach' },
];

interface WorkflowStepperProps {
  mandateApproved: boolean;
  researchApproved: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  mandateApproved,
  researchApproved
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current active step
  const currentStepIndex = STEPS.findIndex(step => location.pathname.startsWith(step.path));
  const currentStep = currentStepIndex !== -1 ? currentStepIndex + 1 : 1;

  // Determine which steps are unlocked
  const isStepUnlocked = (stepNum: number): boolean => {
    if (stepNum === 1) return true;
    if (stepNum === 2) return mandateApproved;
    if (stepNum === 3) return mandateApproved && researchApproved;
    if (stepNum === 4) return mandateApproved && researchApproved;
    if (stepNum === 5) return mandateApproved && researchApproved;
    return false;
  };

  const handleStepClick = (step: Step) => {
    if (isStepUnlocked(step.number)) {
      navigate(step.path);
    }
  };

  return (
    <div className="w-full bg-card border-b border-default sticky top-[72px] z-30 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-6 py-2.5">
        {/* Desktop and Tablet Stepper Layout */}
        <nav aria-label="Progress Stepper" className="hidden md:block">
          <ol className="flex items-center justify-between w-full">
            {STEPS.map((step, idx) => {
              const isCompleted = step.number < currentStep || (step.number === 1 && mandateApproved) || (step.number === 2 && researchApproved);
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
                      flex items-center gap-2 text-left focus-ring rounded px-2 py-1.5 transition-colors cursor-pointer
                      disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 shrink-0
                    `}
                  >
                    {/* Circle Indicator */}
                    <span
                      className={`
                        w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border
                        transition-all duration-200 shrink-0
                        ${isCompleted
                          ? 'bg-brand-success-light text-brand-success border-brand-success dark:bg-emerald-950/20 dark:text-brand-success'
                          : isActive
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                            : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800'
                        }
                      `}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3px]" /> : `0${step.number}`}
                    </span>

                    {/* Step Label only — no description to keep it airy */}
                    <span className={`text-sm font-semibold leading-tight whitespace-nowrap ${isActive ? 'text-brand-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                      {step.label}
                    </span>
                  </button>
                  
                  {/* Connecting line */}
                  {idx !== STEPS.length - 1 && (
                    <div
                      className={`
                        flex-1 h-[1.5px] mx-1.5 rounded-full transition-colors duration-300
                        ${isCompleted 
                          ? 'bg-brand-success' 
                          : isStepUnlocked(step.number + 1) 
                            ? 'bg-brand-primary/40' 
                            : 'bg-slate-200 dark:bg-slate-800'
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
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Step {currentStep} of 5
              </span>
              <h2 className="text-lg font-bold text-primary tracking-tight">
                {STEPS[currentStep - 1]?.label}
              </h2>
            </div>
            
            {/* Simple Prev/Next Navigation Controls for Quick Stepper navigation on Mobile */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStepClick(STEPS[currentStep - 2])}
                disabled={currentStep === 1}
                className="px-3 py-1.5 text-sm font-semibold rounded border border-default bg-card text-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handleStepClick(STEPS[currentStep])}
                disabled={currentStep === 5 || !isStepUnlocked(currentStep + 1)}
                className="px-3 py-1.5 text-sm font-semibold rounded border border-default bg-card text-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          {/* Simple Visual Progress Bar Line for Mobile */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-primary h-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default WorkflowStepper;
