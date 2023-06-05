import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { MachineProvider } from './components/machine-provider';
import { MissingPermissionsSheetProvider } from './components/missing-permissions-sheet';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import { ImageTypes } from './constants/image-types';
import { IdDocProps } from './types';
import Router from './pages/router';
import { MachineContext } from './utils/state-machine';

const App = ({ context, onDone }: IdDocProps) => {
  const { authToken, device, customData } = context;
  if (!customData) {
    return null;
  }

  const initialContext: MachineContext = {
    authToken,
    device,
    currSide: ImageTypes.front,
    requirement: customData.requirement,
    idDoc: {},
  };

  return (
    <MachineProvider args={initialContext}>
      <I18nextProvider i18n={configureI18next()}>
        <QueryClientProvider client={queryClient}>
          <MissingPermissionsSheetProvider>
            <Router onDone={onDone} />
          </MissingPermissionsSheetProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </MachineProvider>
  );
};

export default App;
