import type { Component } from '@onefootprint/footprint-js/src/types/components';
import type { PublicOnboardingConfig, SupportedLocale } from '@onefootprint/types';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useEffect, useMemo, useState } from 'react';

import type { FootprintAppearance } from '@onefootprint/footprint-js';
import getOnboardingConfigReq from '../queries/get-onboarding-config';

export type ContextData = {
  appearance?: FootprintAppearance;
  authToken?: string;
  fpInstance: Component | null;
  handoffCallbacks?: {
    onCancel?: () => void;
    onClose?: () => void;
    onComplete?: (validationToken: string) => void;
    onError?: (error: unknown) => void;
  };
  onboardingConfig: PublicOnboardingConfig | null;
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
export type ProviderProps = Pick<ContextData, 'appearance' | 'authToken' | 'publicKey' | 'locale'> & {
  children: React.ReactNode;
};

const Provider = ({ appearance, authToken, children, publicKey, locale = 'en-US' }: ProviderProps) => {
  const [context, setContext] = useState<ContextData>({
    appearance,
    authToken,
    locale,
    fpInstance: null,
    onboardingConfig: null,
    publicKey,
    // when calling handoff, we can listen to fp instance events
    handoffCallbacks: {
      onCancel: undefined,
      onComplete: undefined,
      onError: undefined,
      onClose: undefined,
    },
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
      throw new Error('Public key is invalid');
    }
  };

  useEffect(() => {
    getOnboardingConfig(publicKey);
  }, [publicKey]);

  return (
    <Context.Provider value={value}>
      <div>{children}</div>
    </Context.Provider>
  );
};

export default Provider;
export { Context };
