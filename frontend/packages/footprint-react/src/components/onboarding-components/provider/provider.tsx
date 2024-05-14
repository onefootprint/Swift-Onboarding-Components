import type { Component } from '@onefootprint/footprint-js/src/types/components';
import type {
  OnboardingRequirement,
  PublicOnboardingConfig,
  SignupChallengeResponse,
} from '@onefootprint/types';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { Appearance, UserData } from '../../../@types';
import configureI18n from '../../../config/initializers/i18next';

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
  userData?: UserData;
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
  userData?: UserData;
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
  const methods = useForm<UserData>({
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
