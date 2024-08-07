import type { PublicOnboardingConfig, SupportedLocale } from '@onefootprint/types';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useEffect, useMemo, useState } from 'react';

import { type Appearance, OnboardingStep, type SandboxOutcome } from '../../../types';
import getOnboardingConfigReq from '../../queries/get-onboarding-config';

export type ContextData = {
  appearance?: Appearance;
  authToken?: string;
  locale?: SupportedLocale;
  onboardingConfig?: PublicOnboardingConfig;
  publicKey: string;
  redirectUrl?: string;
  sandboxId?: string;
  sandboxOutcome: SandboxOutcome;
  step: OnboardingStep;
  vaultingToken?: string;
};

export type ProviderProps = Pick<
  ContextData,
  'appearance' | 'authToken' | 'publicKey' | 'locale' | 'sandboxId' | 'redirectUrl'
> & {
  children?: React.ReactNode;
  sandboxOutcome?: SandboxOutcome;
};

type UpdateContext = Dispatch<SetStateAction<ContextData>>;

const Context = createContext<[ContextData, UpdateContext]>([
  {
    publicKey: '',
    step: OnboardingStep.Auth,
    sandboxOutcome: 'pass',
  },
  () => undefined,
]);

const Provider = ({
  appearance,
  authToken,
  children,
  locale = 'en-US',
  publicKey,
  sandboxId,
  sandboxOutcome = 'pass',
}: ProviderProps) => {
  const [context, setContext] = useState<ContextData>({
    appearance,
    authToken,
    locale,
    publicKey,
    sandboxId,
    sandboxOutcome,
    step: authToken ? OnboardingStep.Onboard : OnboardingStep.Auth,
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
