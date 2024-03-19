import React from 'react';

import { checkIsInIframe } from '../../utils';
import checkIsSocialMediaBrowser from '../../utils/check-is-social-media-browser';
import { TransferMachineProvider } from './components/machine-provider.tsx';
import Router from './pages/router';
import type { TransferProps } from './types';

const AppWithMachine = ({ context, onDone }: TransferProps) => {
  const { device, authToken, customData } = context;
  const { config, missingRequirements = {}, idDocOutcome } = customData || {};

  return (
    <TransferMachineProvider
      initialContext={{
        device,
        authToken,
        missingRequirements,
        config,
        idDocOutcome,
        scopedAuthToken: '',
        isSocialMediaBrowser: checkIsSocialMediaBrowser(),
        isInIframe: checkIsInIframe(),
      }}
    >
      <Router onDone={onDone} />
    </TransferMachineProvider>
  );
};

export default AppWithMachine;
