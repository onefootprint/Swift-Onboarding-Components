import type {
  OnboardingRequirement,
  PublicOnboardingConfig,
  SignupChallengeResponse,
} from '@onefootprint/types';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { FormData, UserData } from '../../@types';
import configureI18n from '../../config/initializers/i18next';

configureI18n();

type ContextData = {
  authToken?: string;
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
    missingRequirements: [],
    onboardingConfig: null,
    publicKey: '',
    signupChallenge: null,
    userData: {},
  },
  () => {},
]);

export type ProviderProps = {
  authToken?: string;
  children: React.ReactNode;
  onCancel?: () => void;
  onComplete?: (validationToken: string) => void;
  onError?: (error: unknown) => void;
  publicKey: string;
  sandboxId?: string;
  userData?: UserData;
};

const FootprintProvider = ({
  authToken,
  children,
  onCancel,
  onComplete,
  onError,
  publicKey,
  sandboxId,
  userData,
}: ProviderProps) => {
  const methods = useForm<FormData>();
  const [context, setContext] = useState<ContextData>({
    authToken,
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

export default FootprintProvider;
export { Context };
