import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import DeviceSignals from '../../components/device-signals';
import { L10nContextProvider } from '../../components/l10n-provider';
import configureI18next from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';
import OnboardingMachineProvider from './components/machine-provider';
import Router from './pages/router';
import type { OnboardingProps } from './types';

const Onboarding = ({ onDone, l10n, ...args }: OnboardingProps) => (
  <I18nextProvider i18n={configureI18next()}>
    <L10nContextProvider l10n={l10n}>
      <QueryClientProvider client={queryClient}>
        <OnboardingMachineProvider args={args} l10n={l10n}>
          <Router onDone={onDone} />
          <DeviceSignals fpAuthToken={args.authToken} />
        </OnboardingMachineProvider>
      </QueryClientProvider>
    </L10nContextProvider>
  </I18nextProvider>
);

export default Onboarding;
