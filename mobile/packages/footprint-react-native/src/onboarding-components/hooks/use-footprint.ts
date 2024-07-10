import { useContext } from 'react';

import { Context } from '../provider';
import save from '../queries/save';
import type { Di } from '../types/dis';
import browser, { OnboardingStep } from '../utils/browser';
import { formatBeforeSave } from '../utils/save-utils';

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

  const vaultData = async (
    data: Di,
    {
      onSuccess,
      onError,
    }: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    } = {},
  ) => {
    const { vaultingToken, onboardingConfig } = context;
    if (!vaultingToken) {
      onError?.(new Error('No authToken found. Please authenticate first'));
      return;
    }
    if (!onboardingConfig) {
      onError?.(
        new Error(
          'No onboardingConfig found. Please make sure that the publicKey is correct',
        ),
      );
      return;
    }
    if (onboardingConfig.kind !== 'kyc' && onboardingConfig.kind !== 'kyb') {
      onError?.(new Error('Unsupported onboardingConfig kind'));
      return;
    }
    try {
      await save({
        data: formatBeforeSave(data, context.locale ?? 'en-US'),
        bootstrapDis: [],
        authToken: vaultingToken,
      });
      onSuccess?.();
    } catch (error: unknown) {
      onError?.(error);
    }
  };

  const handoff = ({
    onComplete,
    onError,
    onCancel,
  }: {
    onComplete?: (validationToken: string) => void;
    onError?: (error: unknown) => void;
    onCancel?: () => void;
  } = {}) => {
    const { authToken, appearance } = context;
    if (!authToken) {
      onError?.(new Error('No authToken found. Please authenticate first'));
      return;
    }
    browser.open({
      appearance,
      authToken,
      onComplete: (validationToken: string) => {
        onComplete?.(validationToken);
      },
      onError: (error: unknown) => {
        onError?.(error);
      },
      onCancel: () => {
        onCancel?.();
      },
      step: OnboardingStep.Onboard,
    });
  };

  return {
    launchIdentify,
    save: vaultData,
    handoff,
  };
};

export default useFootprint;
