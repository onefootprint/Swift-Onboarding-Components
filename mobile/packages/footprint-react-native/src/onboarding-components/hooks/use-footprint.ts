import type { IdDI, InvestorProfileDI, VaultValue } from '@onefootprint/types';
import { useContext } from 'react';

import { Context } from '../provider';
import save from '../queries/save';
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

  const vaultData = async (
    data: Partial<Record<IdDI | InvestorProfileDI, VaultValue>>,
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
      throw new Error('No authToken found');
    }
    if (!onboardingConfig) {
      throw new Error('No onboardingConfig found');
    }
    if (onboardingConfig.kind !== 'kyc' && onboardingConfig.kind !== 'kyb') {
      throw new Error('Onboarding components only support kyc and kyb kind');
    }
    try {
      await save({ data, bootstrapDis: [], authToken: vaultingToken });
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
      throw new Error('No authToken found');
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
