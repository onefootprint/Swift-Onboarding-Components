import { isAlphanumeric } from '@onefootprint/core';
import type { SandboxOutcome } from '@onefootprint/footprint-js';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import merge from 'lodash/merge';
import { createContext, useEffect, useMemo, useState } from 'react';
import defaultTranslations from '../../constants/translations';
import getOnboardingConfigReq from '../../queries/get-onboarding-config';
import usePropsUpdated from './hooks/use-props-updated/use-props-updated';
import type { ContextData, ProviderProps, UpdateContext } from './provider.types';

const defaultContextData: ContextData = {
  didCallRequiresAuth: false,
  isReady: false,
  l10n: {
    language: 'en',
    locale: 'en-US',
    translations: defaultTranslations,
  },
  publicKey: '',
};

const Context = createContext<[ContextData, UpdateContext]>([defaultContextData, () => undefined]);

const Provider = ({
  appearance,
  authToken,
  children,
  publicKey,
  l10n: providedL10n = {},
  sandboxOutcome,
  sandboxId,
}: ProviderProps) => {
  const translations = useMemo(
    () => merge({}, defaultTranslations, providedL10n.customTranslations),
    [providedL10n.customTranslations],
  );
  const l10n = {
    language: providedL10n.language || 'en',
    locale: providedL10n.locale || 'en-US',
    translations,
  };
  const [context, setContext] = useState<ContextData>({
    ...defaultContextData,
    appearance,
    authToken,
    l10n,
    sandboxOutcome,
    sandboxId,
    publicKey,
  });

  usePropsUpdated({
    props: { appearance, authToken, l10n, sandboxOutcome, publicKey, sandboxId },
    onUpdate: updatedProps => setContext(prev => ({ ...prev, ...updatedProps })),
  });

  const value = useMemo<[ContextData, UpdateContext]>(() => [context, setContext], [context]);

  const getSandboxProps = (
    response: PublicOnboardingConfig,
  ): { sandboxId?: string; sandboxOutcome?: SandboxOutcome } => {
    if (response.isLive) {
      if (sandboxId) throw new Error('sandboxId is not allowed for live environments');
      if (sandboxOutcome) throw new Error('sandboxOutcome is not allowed for live environments');
      return {};
    }

    if (!response.requiresIdDoc && sandboxOutcome?.documentOutcome) {
      throw new Error('documentOutcome is not allowed for no-document verification flow');
    }

    const createRandomSandboxId = () => {
      return Math.random().toString(36).substring(2, 14);
    };

    const isValid = (value?: string) => {
      return !!value && isAlphanumeric(value);
    };

    return {
      sandboxId: isValid(sandboxId) ? sandboxId : createRandomSandboxId(),
      sandboxOutcome: {
        overallOutcome: sandboxOutcome?.overallOutcome ?? 'pass',
        documentOutcome: response.requiresIdDoc ? sandboxOutcome?.documentOutcome ?? 'pass' : undefined,
      },
    };
  };

  const getOnboardingConfig = async (pKey: string) => {
    try {
      const response = await getOnboardingConfigReq(pKey);
      if (response.kind !== 'kyc') throw new Error('Only kyc playbooks are supported');
      const { sandboxId, sandboxOutcome } = getSandboxProps(response);
      setContext(prev => ({
        ...prev,
        isReady: true,
        onboardingConfig: response,
        sandboxId,
        sandboxOutcome,
      }));
    } catch (error) {
      console.error('Failed to get onboarding config:', error);
    }
  };

  useEffect(() => {
    if (!publicKey) throw new Error('No publicKey found');
    getOnboardingConfig(publicKey);
  }, [publicKey]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default Provider;
export { Context };
