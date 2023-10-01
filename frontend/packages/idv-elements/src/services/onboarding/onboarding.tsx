import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import OnboardingMachineProvider from './components/machine-provider';
import configureI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import Router from './pages/router';
import type { OnboardingProps } from './types';

const Onboarding = ({ onDone, ...args }: OnboardingProps) => (
  <I18nextProvider i18n={configureI18next()}>
    <QueryClientProvider client={queryClient}>
      <OnboardingMachineProvider args={args}>
        <Router onDone={onDone} />
      </OnboardingMachineProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default Onboarding;
