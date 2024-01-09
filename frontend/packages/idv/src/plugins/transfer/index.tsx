import React from 'react';

import checkIsSocialMediaBrowser from '../../utils/check-is-social-media-browser';
import { DesktopMachineProvider } from './components/desktop-machine-provider';
import { MobileMachineProvider } from './components/mobile-machine-provider';
import DesktopRouter from './pages/desktop/router';
import MobileRouter from './pages/mobile/router';
import type { TransferProps } from './types';

const AppWithMachine = ({ context, onDone }: TransferProps) => {
  const { device, authToken, customData } = context;
  const { config, missingRequirements = {}, idDocOutcome } = customData || {};
  const isMobile = device.type === 'mobile' || device.type === 'tablet';

  return isMobile ? (
    <MobileMachineProvider
      initialContext={{
        device,
        authToken,
        missingRequirements,
        config,
        idDocOutcome,
        scopedAuthToken: '',
        isSocialMediaBrowser: checkIsSocialMediaBrowser(),
      }}
    >
      <MobileRouter onDone={onDone} />
    </MobileMachineProvider>
  ) : (
    <DesktopMachineProvider
      initialContext={{
        authToken,
        device,
        config,
        missingRequirements,
        idDocOutcome,
        scopedAuthToken: '',
      }}
    >
      <DesktopRouter onDone={onDone} />
    </DesktopMachineProvider>
  );
};

export default AppWithMachine;
