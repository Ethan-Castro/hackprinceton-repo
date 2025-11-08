'use client';

import { useEffect, useState } from 'react';
import { WelcomeDialog } from './WelcomeDialog';
import { OnboardingFlow } from './OnboardingFlow';

type OnboardingState = 'idle' | 'welcome' | 'flow' | 'complete';

export function OnboardingManager() {
  const [state, setState] = useState<OnboardingState>('idle');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check if onboarding has been completed
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      setState('welcome');
    }
  }, []);

  if (!isClient) {
    return null;
  }

  const handleWelcomeStart = () => {
    setState('flow');
  };

  const handleWelcomeSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setState('complete');
  };

  const handleFlowComplete = () => {
    setState('complete');
  };

  return (
    <>
      <WelcomeDialog
        open={state === 'welcome'}
        onStart={handleWelcomeStart}
        onSkip={handleWelcomeSkip}
      />
      <OnboardingFlow
        open={state === 'flow'}
        onComplete={handleFlowComplete}
      />
    </>
  );
}
