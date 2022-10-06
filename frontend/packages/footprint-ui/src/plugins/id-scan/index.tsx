import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import {
  MachineProvider,
  useIdScanMachine,
} from './components/machine-provider';
import configureReactI18next from './config/initializers/react-i18next';
import { IdScanProps } from './id-scan.types';
import Router from './pages/router';
import { Events } from './utils/state-machine/types';

const App = ({ context, onDone }: IdScanProps) => {
  const [, send] = useIdScanMachine();
  const { authToken, device, tenant } = context;

  useEffectOnce(() => {
    send({
      type: Events.receivedContext,
      payload: {
        authToken,
        device,
        tenant,
      },
    });
  });

  return (
    <I18nextProvider i18n={configureReactI18next()}>
      <MachineProvider>
        <Router onDone={onDone} />
      </MachineProvider>
    </I18nextProvider>
  );
};

const AppWithMachine = ({ context, metadata, onDone }: IdScanProps) => (
  <MachineProvider>
    <App context={context} metadata={metadata} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
