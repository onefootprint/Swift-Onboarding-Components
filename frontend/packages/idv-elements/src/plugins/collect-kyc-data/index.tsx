import { IdDI } from '@onefootprint/types';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import {
  MachineProvider,
  useCollectKycDataMachine,
} from './components/machine-provider';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import Router from './pages/router';
import { CollectKycDataProps } from './types';

const i18n = configureI18next();

const App = ({ context, onDone }: CollectKycDataProps) => {
  const [, send] = useCollectKycDataMachine();
  const { authToken, customData, device } = context;

  useEffectOnce(() => {
    if (!customData) {
      return;
    }
    const {
      config,
      userFound,
      sandboxSuffix,
      requirement: { missingAttributes },
      bootstrapData,
      fixedFields,
    } = customData;
    const email = bootstrapData?.[IdDI.email];
    send({
      type: 'receivedContext',
      payload: {
        device,
        authToken,
        missingAttributes,
        userFound,
        email,
        sandboxSuffix,
        config,
        fixedData:
          fixedFields && bootstrapData
            ? {
                [IdDI.firstName]: bootstrapData[IdDI.firstName],
                [IdDI.lastName]: bootstrapData[IdDI.lastName],
              }
            : undefined,
      },
    });
  });

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Router onDone={onDone} />
      </QueryClientProvider>
    </I18nextProvider>
  );
};

const AppWithMachine = ({ context, onDone }: CollectKycDataProps) => (
  <MachineProvider>
    <App context={context} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
