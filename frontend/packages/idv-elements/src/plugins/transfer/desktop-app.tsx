import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import { useDesktopMachine } from './components/desktop-machine-provider';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import Router from './pages/desktop/router';
import { TransferProps } from './types';

const i18n = configureI18next();

const DesktopApp = ({ context, onDone }: TransferProps) => {
  const [, send] = useDesktopMachine();
  const { authToken, device, customData } = context;

  useEffectOnce(() => {
    if (!customData) {
      return;
    }
    send({
      type: 'receivedContext',
      payload: {
        authToken,
        device,
        config: customData.config,
        missingRequirements: { ...customData.missingRequirements },
        idDocOutcome: customData.idDocOutcome,
      },
    });
  });

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Router onDone={onDone} />
      </QueryClientProvider>
    </I18nextProvider>
  );
};

export default DesktopApp;
