import type { PublicOnboardingConfiguration } from '@onefootprint/request-types';
import { useState } from 'react';
import IntroStep from './intro-step';

type RouterProps = {
  onboardingConfig: PublicOnboardingConfiguration;
};

const Router = ({ onboardingConfig }: RouterProps) => {
  const [state, setContext] = useState(() => ({
    step: 'intro',
    onboardingConfig,
    userData: {
      phoneNumber: '',
      email: '',
    },
  }));

  return (
    <>
      {state.step === 'intro' && (
        <IntroStep
          onFillout={data => {
            setContext(prev => ({
              ...prev,
              step: 'onboarding',
              data: { phoneNumber: data.phoneNumber, email: data.email },
            }));
          }}
        />
      )}
    </>
  );
};

export default Router;
