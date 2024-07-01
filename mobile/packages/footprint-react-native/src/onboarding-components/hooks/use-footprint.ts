import { useContext } from 'react';

import { Context } from '../provider';
import browser, { OnboardingStep } from '../utils/browser';

const useFootprint = () => {
  const [context, setContext] = useContext(Context);

  const launchIdentify = (
    { email, phoneNumber }: { email?: string; phoneNumber?: string },
    {
      onAuthenticated,
      onError,
      onCancel,
    }: {
      onAuthenticated?: () => void;
      onError?: (error: unknown) => void;
      onCancel?: () => void;
    } = {},
  ) => {
    browser.open({
      appearance: context.appearance,
      publicKey: context.publicKey,
      userData: {
        'id.phone_number': phoneNumber,
        'id.email': email,
      },
      onAuthComplete: ({ authToken, vaultingToken }) => {
        setContext(prev => ({
          ...prev,
          authToken,
          vaultingToken,
          step: OnboardingStep.Onboard,
        }));
        onAuthenticated?.();
      },
      onError: (error: unknown) => {
        onError?.(error);
      },
      onCancel: () => {
        onCancel?.();
      },
      step: OnboardingStep.Auth,
    });
  };

  return {
    launchIdentify,
  };
};

export default useFootprint;
