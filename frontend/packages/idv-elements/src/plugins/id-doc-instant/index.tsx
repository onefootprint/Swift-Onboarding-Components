import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { MachineProvider } from './components/machine-provider';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import { IdDocProps } from './id-doc.types';
import Router from './pages/router';

const App = ({ context, onDone }: IdDocProps) => {
  const { authToken, device, customData } = context;
  if (!customData) {
    return null;
  }

  const initialContext = {
    authToken,
    device,
    requirement: customData.requirement,
  };

  return (
    <MachineProvider args={initialContext}>
      <I18nextProvider i18n={configureI18next()}>
        <QueryClientProvider client={queryClient}>
          <Router onDone={onDone} />
        </QueryClientProvider>
      </I18nextProvider>
    </MachineProvider>
  );
};

export default App;
