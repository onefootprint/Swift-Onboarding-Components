import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import useMobileMachine from './hooks/mobile/use-mobile-machine';
import Router from './pages/mobile/router';
import type { TransferProps } from './types';

const i18n = configureI18next();

const MobileApp = ({ context, onDone }: TransferProps) => {
  const [, send] = useMobileMachine();
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
        idDocOutcome: context.customData?.idDocOutcome,
        config: customData.config,
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

export default MobileApp;
