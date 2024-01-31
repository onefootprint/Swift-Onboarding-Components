'use client';

import { FootprintPublicEvent } from '@onefootprint/footprint-js';
import type { CustomChildAPI } from '@onefootprint/idv';
import { getSdkArgsToken } from '@onefootprint/idv';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useConfirmationDialog } from '@onefootprint/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useEffectOnceStrict } from '@/src/hooks';
import { useFootprintProvider } from '@/src/provider-footprint';
import useProps from '@/src/provider-footprint/hooks/use-props';
import { UserMachineProvider } from '@/src/state';
import type { Variant } from '@/src/types';
import { getLogger, getWindowUrl, isEmbeddedInIframe } from '@/src/utils';

import Layout from '../layout';
import type { NotificationProps } from '../notification';
import Notification from '../notification';
import UserRouter from '../user-router';

type VoidOr<T> = T | void | undefined | null;
type AuthContainerProps = {
  variant?: Variant | null;
  Loading: JSX.Element;
};

const EmptyConfig = {} as PublicOnboardingConfig;
const { canceled, closed, completed } = FootprintPublicEvent;

const { logError } = getLogger('user-container');

const initAuthToken = (): string =>
  !isEmbeddedInIframe()
    ? getSdkArgsToken(getWindowUrl().split('#')[1]) ?? ''
    : '';

const UserContainer = ({
  variant,
  Loading,
}: AuthContainerProps): JSX.Element | null => {
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
        setAuthToken(validToken);
      }
    });
  });

  if (searchParams.has('done')) return null;

  return (
    <Layout
      config={EmptyConfig}
      onClose={handleOnCloseClick}
      variant={variant || undefined}
    >
      {notification ? (
        <Notification
          title={notification.title}
          subtitle={notification.subtitle}
        />
      ) : null}
      {authToken ? (
        <UserMachineProvider args={{ authToken }}>
          <UserRouter onDone={handleOnDoneClick} />
        </UserMachineProvider>
      ) : (
        Loading
      )}
    </Layout>
  );
};

export default UserContainer;
