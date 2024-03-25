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
  publicKey: string;
  sandboxId?: string;
  userData?: UserData;
  signupChallenge: SignupChallengeResponse | null;
  missingRequirements: OnboardingRequirement[];
  onboardingConfig: PublicOnboardingConfig | null;
  scopedAuthToken: string | null;
};

type UpdateContext = Dispatch<SetStateAction<ContextData>>;

const Context = createContext<[ContextData, UpdateContext]>([
  {
    publicKey: '',
    userData: {},
    signupChallenge: null,
    missingRequirements: [],
    onboardingConfig: null,
    scopedAuthToken: null,
  },
  () => {},
]);

export type ProviderProps = {
  authToken?: string;
  children: React.ReactNode;
  publicKey: string;
  sandboxId?: string;
  userData?: UserData;
};

const FootprintProvider = ({
  authToken,
  children,
  publicKey,
  sandboxId,
  userData,
}: ProviderProps) => {
  const methods = useForm<FormData>();
  const [context, setContext] = useState<ContextData>({
    authToken,
    publicKey,
    sandboxId,
    userData,
    signupChallenge: null,
    missingRequirements: [],
    onboardingConfig: null,
    scopedAuthToken: null,
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
