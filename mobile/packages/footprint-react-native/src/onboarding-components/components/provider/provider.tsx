import type { ChallengeData, PublicOnboardingConfig } from '@onefootprint/types';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useEffect, useMemo, useState } from 'react';

import type { Appearance, SandboxOutcome, SupportedLocale } from '../../../types';
import { OverallOutcome, IdDocOutcome } from '../../../types';
import getOnboardingConfigReq from '../../queries/get-onboarding-config';
import usePropsUpdated from './hooks/use-props-updated';
import isAlphanumeric from 'src/onboarding-components/utils/is-alphanumeric';
import type { AuthTokenStatus } from 'src/types/footprint';

export type ContextData = {
  appearance?: Appearance;
  authToken?: string;
  locale?: SupportedLocale;
  onboardingConfig?: PublicOnboardingConfig;
  publicKey: string;
  redirectUrl: string;
  sandboxId?: string;
  sandboxOutcome?: SandboxOutcome;

  vaultingToken?: string;
  verifiedAuthToken?: string;
  authTokenStatus?: AuthTokenStatus;
  challengeData: ChallengeData | null;
  didCallRequiresAuth: boolean;
};

export type ProviderProps = Pick<
  ContextData,
  'appearance' | 'authToken' | 'publicKey' | 'locale' | 'sandboxId' | 'redirectUrl' | 'sandboxOutcome'
> & {
  children?: React.ReactNode;
};

export type UpdateContext = Dispatch<SetStateAction<ContextData>>;

const Context = createContext<[ContextData, UpdateContext]>([
  {
    publicKey: '',
    redirectUrl: '',
    didCallRequiresAuth: false,
    challengeData: null,
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
  sandboxOutcome,
  redirectUrl = '',
}: ProviderProps) => {
  const [context, setContext] = useState<ContextData>({
    appearance,
    authToken,
    locale,
    publicKey,
    sandboxId,
    sandboxOutcome,
    redirectUrl,
    challengeData: null,
    didCallRequiresAuth: false,
  });
  usePropsUpdated({
    props: { appearance, authToken, locale, sandboxOutcome, publicKey, sandboxId, redirectUrl },
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

    if (sandboxId && !isAlphanumeric(sandboxId)) {
      throw new Error('sandboxId should only contain letters and numbers');
    }

    if (response.isLive) {
      return { sandboxId, sandboxOutcome };
    }

    const overallOutcome = sandboxOutcome?.overallOutcome ?? OverallOutcome.success;
    const documentOutcome = response.requiresIdDoc
      ? sandboxOutcome?.documentOutcome ?? IdDocOutcome.success
      : undefined;

    return {
      sandboxId: sandboxId ?? Math.random().toString(36).substring(2, 14),
      sandboxOutcome: { overallOutcome, documentOutcome },
    };
  };

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
