import type { PublicOnboardingConfiguration } from '@onefootprint/request-types';
import { useState } from 'react';
import IntroStep from './intro-step';
import WaitingConfirmation from './waiting-confirmation';

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
          onDone={data => {
            setContext(prev => ({
              ...prev,
              step: 'waiting-confirmation',
              data: { phoneNumber: data.phoneNumber, email: data.email },
            }));
          }}
        />
      )}
      {state.step === 'waiting-confirmation' && <WaitingConfirmation />}
    </>
  );
};

export default Router;
