import type { PublicOnboardingConfiguration } from '@onefootprint/request-types';
import { useState } from 'react';
import IntroStep from './intro-step';
import WaitingConfirmation from './waiting-confirmation';

type RouterProps = {
  onboardingConfig: PublicOnboardingConfiguration;
};

const Router = ({ onboardingConfig }: RouterProps) => {
  const [state, setContext] = useState(() => getInitialState(onboardingConfig));

  return (
    <>
      {state.step === 'intro' && (
        <IntroStep
          onDone={data => {
            setContext(prev => ({
              ...prev,
              step: 'waiting-confirmation',
              data: { phoneNumber: data.phoneNumber, email: data.email },
              tokens: {
                challengeToken: data.challengeToken,
                authToken: data.token,
              },
            }));
          }}
        />
      )}
      {state.step === 'waiting-confirmation' && (
        <WaitingConfirmation
          tokens={state.tokens}
          onDone={authToken => {
            setContext(prev => ({
              ...prev,
              step: 'basic-data',
              tokens: {
                ...prev.tokens,
                authToken,
              },
            }));
          }}
          onCancel={() => {
            setContext(getInitialState(onboardingConfig));
          }}
        />
      )}
    </>
  );
};

const getInitialState = (onboardingConfig: PublicOnboardingConfiguration) => {
  return {
    step: 'intro',
    onboardingConfig,
    tokens: {
      challengeToken: '',
      authToken: '',
    },
    userData: {
      phoneNumber: '',
      email: '',
    },
  };
};

export default Router;
