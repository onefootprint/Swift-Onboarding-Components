import type { FootprintComponent, SandboxOutcome } from '@onefootprint/footprint-js';
import type { PublicOnboardingConfig, SupportedLocale } from '@onefootprint/types';
import type { Dispatch, SetStateAction } from 'react';
import type React from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';

import type { FootprintAppearance } from '@onefootprint/footprint-js';
import getOnboardingConfigReq from '../queries/get-onboarding-config';
import usePropsUpdated from './hooks/use-props-updated/use-props-updated';

export type ContextData = {
  appearance?: FootprintAppearance;
  authToken?: string;
  vaultingToken?: string;
  fpInstance: FootprintComponent | null;
  handoffCallbacks?: {
    onCancel?: () => void;
    onClose?: () => void;
    onComplete?: (validationToken: string) => void;
    onError?: (error: unknown) => void;
  };
  onboardingConfig: PublicOnboardingConfig | null;
  sandboxOutcome?: SandboxOutcome;
  sandboxId?: string;
  publicKey: string;
  locale?: SupportedLocale;
};

type UpdateContext = Dispatch<SetStateAction<ContextData>>;

const Context = createContext<[ContextData, UpdateContext]>([
  {
    fpInstance: null,
    onboardingConfig: null,
    publicKey: '',
    locale: 'en-US',
  },
  () => undefined,
]);

// These are the props users can set on the provider
export type ProviderProps = Pick<
  ContextData,
  'appearance' | 'authToken' | 'publicKey' | 'locale' | 'sandboxOutcome' | 'sandboxId'
> & {
  children: React.ReactNode;
};

const Provider = ({
  appearance,
  authToken,
  children,
  publicKey,
  locale = 'en-US',
  sandboxOutcome,
  sandboxId,
}: ProviderProps) => {
  const [context, setContext] = useState<ContextData>({
    appearance,
    authToken,
    locale,
    fpInstance: null,
    onboardingConfig: null,
    sandboxOutcome,
    sandboxId,
    publicKey,
    // when calling handoff, we can listen to fp instance events
    handoffCallbacks: {
      onCancel: undefined,
      onComplete: undefined,
      onError: undefined,
      onClose: undefined,
    },
  });

  usePropsUpdated({
    props: { appearance, authToken, locale, sandboxOutcome, publicKey, sandboxId },
    onUpdate: updatedProps => {
      setContext(prev => ({ ...prev, ...updatedProps }));
    },
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
      throw new Error('Public key is invalid');
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
