import React, { createContext, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { UserData } from '../../@types';
import configureI18n from '../../config/initializers/i18next';

configureI18n();

export const Context = createContext<{
  authToken?: string;
  publicKey: string;
  sandboxId?: string;
  userData?: UserData;
}>({
  publicKey: '',
  userData: {},
});

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
  const methods = useForm<UserData>({
    // resolver: zodResolver(schema),
  });
  const [value] = useState({
    publicKey,
    userData,
    authToken,
    sandboxId,
  });

  return (
    <Context.Provider value={value}>
      <FormProvider {...methods}>
        <div>{children}</div>
      </FormProvider>
    </Context.Provider>
  );
};

export default FootprintProvider;
