import type { PublicOnboardingConfig } from '@onefootprint/types';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import type { FootprintAppearance } from 'src/footprint.types';

import getOnboardingConfigReq from '../queries/get-onboarding-config-req';
import { OnboardingStep } from '../utils/browser';

export type ContextData = {
  appearance?: FootprintAppearance;
  authToken?: string;
  vaultingToken?: string;
  step: OnboardingStep;
  publicKey: string;
  onboardingConfig?: PublicOnboardingConfig;
};

type UpdateContext = Dispatch<SetStateAction<ContextData>>;

const Context = createContext<[ContextData, UpdateContext]>([
  {
    publicKey: '',
    step: OnboardingStep.Auth,
  },
  () => undefined,
]);

export type ProviderProps = {
  appearance?: FootprintAppearance;
  authToken?: string;
  children: React.ReactNode;
  publicKey: string;
};

const Provider = ({
  appearance,
  authToken,
  children,
  publicKey,
}: ProviderProps) => {
  const [context, setContext] = useState<ContextData>({
    appearance,
    authToken,
    step: authToken ? OnboardingStep.Onboard : OnboardingStep.Auth,
    publicKey,
  });
  const value = useMemo<[ContextData, UpdateContext]>(
    () => [context, setContext],
    [context],
  );

  const getOnboardingConfig = async (pKey?: string) => {
    if (!pKey) {
      throw new Error('No publicKey found');
    }

    try {
      const response = await getOnboardingConfigReq(pKey);
      setContext(prev => ({ ...prev, onboardingConfig: response }));
    } catch (_e: unknown) {
      throw new Error(`Failed to fetch onboarding config: ${_e}`);
    }
  };

  useEffect(() => {
    getOnboardingConfig(publicKey);
  }, [publicKey]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default Provider;
export { Context };
