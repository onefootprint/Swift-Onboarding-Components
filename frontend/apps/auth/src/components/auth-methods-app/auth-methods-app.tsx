'use client';

import { getWindowUrl } from '@onefootprint/core';
import { FootprintPublicEvent } from '@onefootprint/footprint-js';
import type { CustomChildAPI } from '@onefootprint/idv';
import { AuthMethods, getLogger, getSdkArgsToken } from '@onefootprint/idv';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useConfirmationDialog } from '@onefootprint/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useEffectOnceStrict } from '@/src/hooks';
import { useFootprintProvider } from '@/src/provider-footprint';
import useProps from '@/src/provider-footprint/hooks/use-props';
import type { Variant } from '@/src/types';
import { isEmbeddedInIframe } from '@/src/utils';

import Layout from '../client-layout';
import type { NotificationProps } from '../notification';
import Notification from '../notification';

// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
type VoidOr<T> = T | void | undefined | null;
type AuthContainerProps = { variant?: Variant | null; Loading: JSX.Element };

const EmptyConfig = {} as PublicOnboardingConfig;
const { canceled, closed, completed } = FootprintPublicEvent;

const { logError, logTrack } = getLogger({ location: 'auth-methods-app' });
const initAuthToken = (): string => (!isEmbeddedInIframe() ? getSdkArgsToken(getWindowUrl().split('#')[1]) ?? '' : '');

const UserMethodsApp = ({ variant, Loading }: AuthContainerProps): JSX.Element | null => {
  const isFpProvidedDone = useRef(false);
  const fpProvider = useFootprintProvider();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('common');
  const confirmationDialog = useConfirmationDialog();
  const [authToken, setAuthToken] = useState<string>(initAuthToken);
  const [notification, setNotification] = useState<VoidOr<NotificationProps>>();

  useProps<{ authToken: string }>(
    props => {
      const propAuthToken = props?.authToken;
      if (propAuthToken && propAuthToken !== authToken) {
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

  const handleOnCloseClick = useCallback(
    () => {
      confirmationDialog.open({
        description: t('confirm-close-description'),
        title: t('confirm-close-title'),
        secondaryButton: { label: t('no') },
        primaryButton: {
          label: t('yes'),
          onClick: () => {
            if (isFpProvidedDone.current) {
              fpProvider.send(closed);
              fpProvider.send(canceled);
              return;
            }
            logTrack('auth methods app closed');
            router.push('/user/closed');
          },
        },
      });
    },
    [isFpProvidedDone.current], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleOnDoneClick = useCallback(
    () => {
      if (isFpProvidedDone.current) {
        fpProvider.send(completed);
        fpProvider.send(closed);
        return;
      }
      logTrack('auth methods app done');
      router.push('/user/done');
    },
    [isFpProvidedDone.current], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffectOnceStrict(() => {
    fpProvider.load().then((data: VoidOr<CustomChildAPI>) => {
      isFpProvidedDone.current = true;
      const modelToken = data?.model?.authToken;
      const validToken = modelToken ? getSdkArgsToken(modelToken) : undefined;
      if (validToken) {
        logTrack('auth token received from provider');
        setAuthToken(validToken);
      }
    });
  });

  if (searchParams.has('done')) return null;

  return (
    <Layout config={EmptyConfig} onClose={handleOnCloseClick} variant={variant || undefined}>
      {notification ? <Notification title={notification.title} subtitle={notification.subtitle} /> : null}
      {authToken ? <AuthMethods authToken={authToken} onDone={handleOnDoneClick} /> : Loading}
    </Layout>
  );
};

export default UserMethodsApp;
