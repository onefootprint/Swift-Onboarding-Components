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
  redirectUrl,
}: ProviderProps) => {
  const [context, setContext] = useState<ContextData>({
    appearance,
    authToken,
    locale,
    publicKey,
    sandboxId,
    sandboxOutcome,
    redirectUrl,
    step: authToken ? OnboardingStep.Onboard : OnboardingStep.Auth,
  });
  const value = useMemo<[ContextData, UpdateContext]>(() => [context, setContext], [context]);

  const getOnboardingConfig = async (pKey?: string) => {
    if (!pKey) {
      throw new Error('No publicKey found');
    }
    let response;

    try {
      response = await getOnboardingConfigReq(pKey);
    } catch (_e: unknown) {
      throw new Error(`Failed to fetch onboarding config: ${_e}`);
    }

    let newSandboxId = sandboxId;
    if (response.isLive && sandboxId) {
      throw new Error('sandboxId is not allowed for live environments');
    }
    if (!response.isLive) {
      if (sandboxId) {
        const regex = /^[A-Za-z0-9]+$/;
        if (!regex.test(sandboxId)) {
          throw new Error('sandboxId should only contain letters and numbers');
        }
      }
      if (!sandboxId) {
        // create a random sandboxId with both letters and numbers of lenth 12
        newSandboxId = Math.random().toString(36).substring(2, 14);
      }
    }
    setContext(prev => ({ ...prev, onboardingConfig: response, sandboxId: newSandboxId }));
  };

  useEffect(() => {
    getOnboardingConfig(publicKey);
  }, [publicKey]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default Provider;
export { Context };
