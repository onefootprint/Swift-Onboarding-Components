import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import configureI18next from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';
import checkIsSocialMediaBrowser from '../../utils/check-is-social-media-browser';
import { DesktopMachineProvider } from './components/desktop-machine-provider';
import { MobileMachineProvider } from './components/mobile-machine-provider';
import DesktopRouter from './pages/desktop/router';
import MobileRouter from './pages/mobile/router';
import type { TransferProps } from './types';

const i18n = configureI18next();

const AppWithMachine = ({ context, onDone }: TransferProps) => {
  const { device, authToken, customData } = context;
  const { config, missingRequirements = {}, idDocOutcome } = customData || {};
  const isMobile = device.type === 'mobile' || device.type === 'tablet';

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        {isMobile ? (
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
        )}
      </QueryClientProvider>
    </I18nextProvider>
  );
};

export default AppWithMachine;
