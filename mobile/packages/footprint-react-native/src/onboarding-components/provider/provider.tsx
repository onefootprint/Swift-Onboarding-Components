import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useMemo, useState } from 'react';
import type { FootprintAppearance } from 'src/footprint.types';

import { OnboardingStep } from '../utils/browser';

export type ContextData = {
  appearance?: FootprintAppearance;
  authToken?: string;
  vaultToken?: string;
  step: OnboardingStep;
  publicKey: string;
};

type UpdateContext = Dispatch<SetStateAction<ContextData>>;

const Context = createContext<[ContextData, UpdateContext]>([
  {
    publicKey: '',
    step: OnboardingStep.Auth,
  },
  () => undefined,
]);

export type ProviderProps = {
  appearance?: FootprintAppearance;
  authToken?: string;
  children: React.ReactNode;
  publicKey: string;
};

const Provider = ({
  appearance,
  authToken,
  children,
  publicKey,
}: ProviderProps) => {
  const [context, setContext] = useState<ContextData>({
    appearance,
    authToken,
    step: authToken ? OnboardingStep.Onboard : OnboardingStep.Auth,
    publicKey,
  });
  const value = useMemo<[ContextData, UpdateContext]>(
    () => [context, setContext],
    [context],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default Provider;
export { Context };
