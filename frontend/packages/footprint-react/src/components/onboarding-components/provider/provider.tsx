import type { FootprintUserData } from '@onefootprint/footprint-js';
import type { Component } from '@onefootprint/footprint-js/src/types/components';
import type {
  OnboardingRequirement,
  PublicOnboardingConfig,
  SignupChallengeResponse,
} from '@onefootprint/types';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { Appearance } from '../../../@types';
import configureI18n from '../../../config/initializers/i18next';
import getOnboardingConfigReq from '../../../queries/get-onboarding-config';

configureI18n();

export type ContextData = {
  appearance?: Appearance;
  authToken?: string;
  fpInstance: Component | null;
  missingRequirements: OnboardingRequirement[];
  onboardingConfig: PublicOnboardingConfig | null;
  onCancel?: () => void;
  onComplete?: (validationToken: string) => void;
  onError?: (error: unknown) => void;
  publicKey: string;
  sandboxId?: string;
  signupChallenge: SignupChallengeResponse | null;
  userData?: FootprintUserData;
};

type UpdateContext = Dispatch<SetStateAction<ContextData>>;

const Context = createContext<[ContextData, UpdateContext]>([
  {
    fpInstance: null,
    missingRequirements: [],
    onboardingConfig: null,
    publicKey: '',
    signupChallenge: null,
    userData: {},
  },
  () => {},
]);

export type ProviderProps = {
  appearance?: Appearance;
  authToken?: string;
  children: React.ReactNode;
  onCancel?: () => void;
  onComplete?: (validationToken: string) => void;
  onError?: (error: unknown) => void;
  publicKey: string;
  sandboxId?: string;
  userData?: FootprintUserData;
};

const Provider = ({
  appearance,
  authToken,
  children,
  onCancel,
  onComplete,
  onError,
  publicKey,
  sandboxId,
  userData = {},
}: ProviderProps) => {
  const methods = useForm<FootprintUserData>({
    defaultValues: userData,
  });
  const [context, setContext] = useState<ContextData>({
    appearance,
    authToken,
    fpInstance: null,
    missingRequirements: [],
    onboardingConfig: null,
    onCancel,
    onComplete,
    onError,
    publicKey,
    sandboxId,
    signupChallenge: null,
    userData,
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
    } catch (error: unknown) {
      throw new Error('Public key is invalid');
    }
  };

  useEffect(() => {
    getOnboardingConfig(publicKey);
  }, [publicKey]);

  return (
    <Context.Provider value={value}>
      <FormProvider {...methods}>
        <div>{children}</div>
      </FormProvider>
    </Context.Provider>
  );
};

export default Provider;
export { Context };
