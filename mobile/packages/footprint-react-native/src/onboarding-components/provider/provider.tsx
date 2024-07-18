import type { PublicOnboardingConfig, SupportedLocale } from '@onefootprint/types';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useEffect, useMemo, useState } from 'react';

import { type Appearance, OnboardingStep } from '../../types';
import getOnboardingConfigReq from '../queries/get-onboarding-config';

export type ContextData = {
  appearance?: Appearance;
  authToken?: string;
  vaultingToken?: string;
  step: OnboardingStep;
  publicKey: string;
  onboardingConfig?: PublicOnboardingConfig;
  locale?: SupportedLocale;
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
  appearance?: Appearance;
  authToken?: string;
  children: React.ReactNode;
  publicKey: string;
  locale?: SupportedLocale;
};

const Provider = ({ appearance, authToken, children, publicKey, locale = 'en-US' }: ProviderProps) => {
  const [context, setContext] = useState<ContextData>({
    appearance,
    authToken,
    step: authToken ? OnboardingStep.Onboard : OnboardingStep.Auth,
    publicKey,
    locale,
  });
  const value = useMemo<[ContextData, UpdateContext]>(() => [context, setContext], [context]);

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
