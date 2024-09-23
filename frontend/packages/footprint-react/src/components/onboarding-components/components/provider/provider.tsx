import type { Dispatch, SetStateAction } from 'react';
import type React from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';

import { isAlphanumeric } from '@onefootprint/core';
import type { FootprintComponent, SandboxOutcome } from '@onefootprint/footprint-js';
import type { FootprintAppearance } from '@onefootprint/footprint-js';
import type { PublicOnboardingConfig, SupportedLocale } from '@onefootprint/types';
import type { ChallengeData } from '@onefootprint/types';

import type { FormValues } from '../../../../types';
import getOnboardingConfigReq from '../../queries/get-onboarding-config';
import type AuthTokenStatus from '../../types/auth-token-status';
import usePropsUpdated from './hooks/use-props-updated/use-props-updated';

export type ContextData = {
  appearance?: FootprintAppearance;
  authToken?: string;
  fpInstance?: FootprintComponent;
  handoffCallbacks?: {
    onCancel?: () => void;
    onClose?: () => void;
    onComplete?: (validationToken: string) => void;
    onError?: (error: unknown) => void;
  };
  onboardingConfig?: PublicOnboardingConfig;
  sandboxOutcome?: SandboxOutcome;
  sandboxId?: string;
  publicKey: string;
  locale?: SupportedLocale;

  authTokenStatus?: AuthTokenStatus;
  challengeData?: ChallengeData;
  didCallRequiresAuth: boolean;
  vaultData?: FormValues;
  vaultingToken?: string;
  verifiedAuthToken?: string;
};

export type UpdateContext = Dispatch<SetStateAction<ContextData>>;

const Context = createContext<[ContextData, UpdateContext]>([
  {
    didCallRequiresAuth: false,
    locale: 'en-US',
    publicKey: '',
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
    didCallRequiresAuth: false,
  });

  usePropsUpdated({
    props: { appearance, authToken, locale, sandboxOutcome, publicKey, sandboxId },
    onUpdate: updatedProps => {
      setContext(prev => ({ ...prev, ...updatedProps }));
    },
  });

  const value = useMemo<[ContextData, UpdateContext]>(() => [context, setContext], [context]);

  const getSandboxProps = (response: PublicOnboardingConfig) => {
    if (response.isLive && sandboxId) {
      throw new Error('sandboxId is not allowed for live environments');
    }
    if (response.isLive && sandboxOutcome) {
      throw new Error('sandboxOutcome is not allowed for live environments');
    }
    if (!response.requiresIdDoc && sandboxOutcome?.documentOutcome) {
      throw new Error('documentOutcome is not allowed for no-document verification flow');
    }

    let newSandboxId = sandboxId;
    let newSandboxOutcome = sandboxOutcome;
    if (!response.isLive) {
      if (sandboxId) {
        if (!isAlphanumeric(sandboxId)) {
          throw new Error('sandboxId should only contain letters and numbers');
        }
      }
      if (!sandboxId) {
        // create a random sandboxId with both letters and numbers of lenth 12
        newSandboxId = Math.random().toString(36).substring(2, 14);
      }

      const overallOutcome = sandboxOutcome?.overallOutcome ?? 'pass';
      const documentOutcome = response.requiresIdDoc ? sandboxOutcome?.documentOutcome ?? 'pass' : undefined;
      newSandboxOutcome = { overallOutcome, documentOutcome };
    }
    return { sandboxId: newSandboxId, sandboxOutcome: newSandboxOutcome };
  };

  const getOnboardingConfig = async (pKey?: string) => {
    if (!pKey) {
      throw new Error('No publicKey found');
    }
    const response = await getOnboardingConfigReq(pKey);
    const { sandboxId, sandboxOutcome } = getSandboxProps(response);
    setContext(prev => ({
      ...prev,
      onboardingConfig: response,
      sandboxId,
      sandboxOutcome,
    }));
  };

  useEffect(() => {
    getOnboardingConfig(publicKey);
  }, [publicKey]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default Provider;
export { Context };
