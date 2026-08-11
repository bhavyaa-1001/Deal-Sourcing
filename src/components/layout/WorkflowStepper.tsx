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
  { number: 4, label: 'Review Results', description: 'Shortlist and compare deals', path: '/review' }
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
    if (stepNum === 4) return mandateApproved && researchApproved; // Shortlist review unlocked when discovery is unlocked
    return false;
  };

  const handleStepClick = (step: Step) => {
    if (isStepUnlocked(step.number)) {
      navigate(step.path);
    }
  };

  return (
    <div className="w-full bg-card border-b border-default sticky top-[72px] z-30 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
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
                  className="flex-1 flex items-center"
                >
                  <button
                    onClick={() => handleStepClick(step)}
                    disabled={!isUnlocked}
                    className={`
                      flex items-center gap-3 text-left focus-ring rounded p-2 transition-colors cursor-pointer
                      disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30
                    `}
                  >
                    {/* Circle Indicator */}
                    <span
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-base border-2
                        transition-all duration-200 shrink-0
                        ${isCompleted
                          ? 'bg-brand-success-light text-emerald-900 border-brand-success dark:bg-emerald-950/40 dark:text-emerald-400'
                          : isActive
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                            : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }
                      `}
                    >
                      {isCompleted ? <Check className="h-5 w-5 stroke-[3px]" /> : step.number}
                    </span>

                    {/* Step Label */}
                    <span className="flex flex-col pr-2 text-left">
                      <span className={`text-base font-bold leading-tight ${isActive ? 'text-brand-primary' : 'text-slate-800 dark:text-slate-200 font-semibold'}`}>
                        {step.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-none">
                        {step.description}
                      </span>
                    </span>
                  </button>
                  
                  {/* Premium connecting line between stages */}
                  {idx !== STEPS.length - 1 && (
                    <div
                      className={`
                        flex-1 h-[2px] mx-4 rounded-full transition-colors duration-300
                        ${isCompleted 
                          ? 'bg-brand-success' 
                          : isStepUnlocked(step.number + 1) 
                            ? 'bg-brand-primary/50' 
                            : 'bg-slate-200 dark:bg-slate-700'
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
                Step {currentStep} of 4
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
                disabled={currentStep === 4 || !isStepUnlocked(currentStep + 1)}
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
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default WorkflowStepper;
