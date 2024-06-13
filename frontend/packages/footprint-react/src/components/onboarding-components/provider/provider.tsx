import type { Component } from '@onefootprint/footprint-js/src/types/components';
import type { OnboardingRequirement, PublicOnboardingConfig, SignupChallengeResponse } from '@onefootprint/types';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useEffect, useMemo, useState } from 'react';

import type { Appearance, Di } from '../../../@types';
import getOnboardingConfigReq from '../queries/get-onboarding-config';

export type ContextData = {
  appearance?: Appearance;
  authToken?: string;
  fpInstance: Component | null;
  handoffCallbacks?: {
    onCancel?: () => void;
    onClose?: () => void;
    onComplete?: (validationToken: string) => void;
    onError?: (error: unknown) => void;
  };
  missingRequirements: OnboardingRequirement[];
  onboardingConfig: PublicOnboardingConfig | null;
  onCancel?: () => void;
  onClose?: () => void;
  onComplete?: (validationToken: string) => void;
  onError?: (error: unknown) => void;
  publicKey: string;
  sandboxId?: string;
  signupChallenge: SignupChallengeResponse | null;
};

type UpdateContext = Dispatch<SetStateAction<ContextData>>;

const Context = createContext<[ContextData, UpdateContext]>([
  {
    fpInstance: null,
    missingRequirements: [],
    onboardingConfig: null,
    publicKey: '',
    signupChallenge: null,
  },
  () => undefined,
]);

// These are the props users can set on the provider
export type ProviderProps = Pick<
  ContextData,
  'appearance' | 'authToken' | 'onCancel' | 'onClose' | 'onComplete' | 'onError' | 'publicKey' | 'sandboxId'
> & { children: React.ReactNode };

const Provider = ({
  appearance,
  authToken,
  children,
  onCancel,
  onClose,
  onComplete,
  onError,
  publicKey,
  sandboxId,
}: ProviderProps) => {
  const [context, setContext] = useState<ContextData>({
    appearance,
    authToken,
    fpInstance: null,
    missingRequirements: [],
    onboardingConfig: null,
    onCancel,
    onClose,
    onComplete,
    onError,
    publicKey,
    sandboxId,
    signupChallenge: null,
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
