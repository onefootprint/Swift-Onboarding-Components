import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import {
  MachineProvider,
  useIdDocMachine,
} from './components/machine-provider';
import MissingPermissionsSheetProvider from './components/missing-permissions-sheet/missing-permissions-sheet-provider';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import { IdDocProps } from './id-doc.types';
import Router from './pages/router';

const App = ({ context, onDone }: IdDocProps) => {
  const [, send] = useIdDocMachine();
  const { authToken, device, customData } = context;
  const { shouldCollectIdDoc, shouldCollectSelfie, shouldCollectConsent } =
    customData || {};

  useEffectOnce(() => {
    send({
      type: 'receivedContext',
      payload: {
        authToken,
        device,
        idDocRequired: !!shouldCollectIdDoc,
        selfieRequired: !!shouldCollectSelfie,
        consentRequired: !!shouldCollectConsent,
      },
    });
  });

  return (
    <I18nextProvider i18n={configureI18next()}>
      <QueryClientProvider client={queryClient}>
        <MissingPermissionsSheetProvider>
          <Router onDone={onDone} />
        </MissingPermissionsSheetProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

const AppWithMachine = ({ context, onDone }: IdDocProps) => (
  <MachineProvider>
    <App context={context} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
