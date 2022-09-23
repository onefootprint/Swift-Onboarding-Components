import React from 'react';
import { I18nextProvider } from 'react-i18next';

import IdScanFlow from './components/id-scan-flow';
import { MachineProvider } from './components/machine-provider';
import configureReactI18next from './config/initializers/react-i18next';
import { IdScanProps } from './id-scan.types';

const IdScan = ({ context, onDone }: IdScanProps) => (
  <I18nextProvider i18n={configureReactI18next()}>
    <MachineProvider>
      <IdScanFlow context={context} onDone={onDone} />
    </MachineProvider>
  </I18nextProvider>
);

export default IdScan;
