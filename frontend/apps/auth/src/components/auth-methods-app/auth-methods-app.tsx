'use client';

import { FootprintPublicEvent } from '@onefootprint/footprint-js';
import { AuthMethods, getLogger, trackAction } from '@onefootprint/idv';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useConfirmationDialog } from '@onefootprint/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprintProvider } from '@/src/provider-footprint';
import useProps from '@/src/provider-footprint/hooks/use-props';
import type { Variant } from '@/src/types';

import Layout from '../client-layout';
import type { NotificationProps } from '../notification';
import Notification from '../notification';

// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
type VoidOr<T> = T | void | undefined | null;
type AuthContainerProps = { variant?: Variant | null; Loading: JSX.Element };

const EmptyConfig = {} as PublicOnboardingConfig;
const { canceled, closed, completed } = FootprintPublicEvent;

const { logError, logTrack } = getLogger({ location: 'auth-methods-app' });

const UserMethodsApp = ({ variant, Loading }: AuthContainerProps): JSX.Element | null => {
  const fpProvider = useFootprintProvider();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('common');
  const confirmationDialog = useConfirmationDialog();
  const [authToken, setAuthToken] = useState<string>('');
  const [notification, setNotification] = useState<VoidOr<NotificationProps>>();
  const adapterKind = fpProvider.getAdapterKind();
  const isWebviewWithoutRedirect = adapterKind === 'webview' && fpProvider.getRedirectUrl() === null;

  useProps<{ authToken: string }>(
    props => {
      const propAuthToken = props?.authToken;
      if (propAuthToken) {
        trackAction('update-auth-methods:started', { adapterKind });
        logTrack('Update auth methods started', { adapterKind });
        setAuthToken(propAuthToken);
      } else if (!propAuthToken && !authToken) {
        logError('No auth token provided');
        setNotification({
          title: t('notification.404-token-title'),
          subtitle: t('notification.404-token-description'),
        });
      }
    },
    (error: unknown) => {
      logError('Error fetching auth sdk args', error);
      setNotification({
        title: t('notification.invalid-config-title'),
        subtitle: t('notification.invalid-config-subtitle'),
      });
    },
  );

  const handleOnCloseClick = () => {
    confirmationDialog.open({
      description: t('confirm-close-description'),
      title: t('confirm-close-title'),
      secondaryButton: { label: t('no') },
      primaryButton: {
        label: t('yes'),
        onClick: () => {
          if (fpProvider.getLoadingStatus()) {
            trackAction('update-auth-methods:canceled');
            logTrack('Update auth methods cancelled');
            if (isWebviewWithoutRedirect) {
              return router.push('/user/closed');
            }

            fpProvider.send(canceled);
            fpProvider.send(closed);
          }
        },
      },
    });
  };

  const handleOnDoneClick = () => {
    if (fpProvider.getLoadingStatus()) {
      trackAction('update-auth-methods:completed');
      logTrack('Update auth methods completed');
      if (isWebviewWithoutRedirect) {
        return router.push('/user/done');
      }

      fpProvider.send(completed);
      fpProvider.send(closed);
    }
  };

  if (searchParams.has('done')) return null;

  return (
    <Layout config={EmptyConfig} onClose={handleOnCloseClick} variant={variant || undefined}>
      {notification ? <Notification title={notification.title} subtitle={notification.subtitle} /> : null}
      {authToken ? <AuthMethods authToken={authToken} onDone={handleOnDoneClick} /> : Loading}
    </Layout>
  );
};

export default UserMethodsApp;
