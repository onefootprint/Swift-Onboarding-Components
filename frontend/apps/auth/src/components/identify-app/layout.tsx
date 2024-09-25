'use client';

import type { Variant } from '@/src/types';
import { FootprintPublicEvent } from '@onefootprint/footprint-js';
import { getLogger, trackAction } from '@onefootprint/idv';

import { useConfirmationDialog } from '@onefootprint/ui';
import truncate from 'lodash/truncate';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFootprintProvider } from '../../provider-footprint';
import ClientLayout from '../client-layout';
import { useAuthIdentifyAppMachine } from './state';

type LayoutProps = {
  children: JSX.Element;
  variant?: Variant;
};

const { logTrack, logError } = getLogger({ location: 'identify-app-layout' });

const Layout = ({ children, variant }: LayoutProps): JSX.Element | null => {
  const [state] = useAuthIdentifyAppMachine();
  const { config, validationToken } = state.context;
  const fpProvider = useFootprintProvider();
  const confirmationDialog = useConfirmationDialog();
  const { t } = useTranslation('common');
  const isDone = state.matches('done');
  const shouldHideCloseButton = state.matches('passkeyOptionalRegistration');
  const isSandbox = config?.isLive === false;

  const handleCompleteWithValidationToken = (validationToken?: string): void => {
    if (validationToken) {
      logTrack(`Validation token sent: ${truncate(validationToken, { length: 20 })}`);
      fpProvider.send(FootprintPublicEvent.completed, validationToken);
    }
  };

  const handleClose = () => {
    if (!state.matches('identify') && !state.matches('passkeyProcessing')) {
      handleCompleteWithValidationToken(validationToken);
      fpProvider.send(FootprintPublicEvent.closed);
      return;
    }

    confirmationDialog.open({
      description: t('confirm-close-description'),
      title: t('confirm-close-title'),
      secondaryButton: { label: t('no') },
      primaryButton: {
        label: t('yes'),
        onClick: () => {
          logTrack('User clicked and confirmed close button');
          handleCompleteWithValidationToken(validationToken);
          fpProvider.send(FootprintPublicEvent.canceled);
          fpProvider.send(FootprintPublicEvent.closed);
        },
      },
    });
  };

  useEffect(() => {
    if (!isDone) return;
    if (!validationToken) return logError('Missing validation token');

    trackAction('auth:completed');
    handleCompleteWithValidationToken(validationToken);
    fpProvider.send(FootprintPublicEvent.closed);
  }, [validationToken, fpProvider, isDone]);

  return (
    <ClientLayout
      config={state.context.config}
      isSandbox={isSandbox}
      onClose={shouldHideCloseButton ? undefined : handleClose}
      variant={variant}
    >
      {children}
    </ClientLayout>
  );
};

export default Layout;
