'use client';

import type { Variant } from '@/src/types';
import { FootprintPublicEvent } from '@onefootprint/footprint-js';
import { getLogger } from '@onefootprint/idv';

import { useConfirmationDialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { useFootprintProvider } from '../../provider-footprint';
import ClientLayout from '../client-layout';
import { useAuthIdentifyAppMachine } from './state';

type LayoutProps = {
  children: JSX.Element;
  variant?: Variant;
};

const { logTrack } = getLogger({ location: 'identify-app-layout' });

const Layout = ({ children, variant }: LayoutProps): JSX.Element | null => {
  const [state] = useAuthIdentifyAppMachine();
  const fpProvider = useFootprintProvider();
  const confirmationDialog = useConfirmationDialog();
  const { t } = useTranslation('common');
  const isSandbox = !state.context.config?.isLive;

  const handleClose = () => {
    if (!state.matches('identify') && !state.matches('passkeyProcessing')) {
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
          fpProvider.send(FootprintPublicEvent.canceled);
          fpProvider.send(FootprintPublicEvent.closed);
        },
      },
    });
  };

  return (
    <ClientLayout config={state.context.config} isSandbox={isSandbox} onClose={handleClose} variant={variant}>
      {children}
    </ClientLayout>
  );
};

export default Layout;
