'use client';

import { useTranslation } from '@onefootprint/hooks';
import { getSdkArgsToken } from '@onefootprint/idv';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useConfirmationDialog } from '@onefootprint/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback } from 'react';

import { UserMachineProvider } from '@/src/state';
import type { Variant } from '@/src/types';
import { getWindowUrl } from '@/src/utils';

import Layout from '../layout';
import Notification from '../notification';
import UserRouter from '../user-router';

type AuthContainerProps = { variant?: Variant | null };

const EmptyConfig = {} as PublicOnboardingConfig;

const UserContainer = ({ variant }: AuthContainerProps): JSX.Element | null => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const windowUrl = getWindowUrl();
  const authToken = getSdkArgsToken(windowUrl.split('#')[1]) ?? '';
  const { t } = useTranslation('auth');
  const confirmationDialog = useConfirmationDialog();
  const notification = !authToken
    ? {
        title: t('notification.404-token-title'),
        subtitle: t('notification.404-token-description'),
      }
    : undefined;

  const confirmClose = useCallback(
    () => {
      confirmationDialog.open({
        description: t('confirm-close-description'),
        title: t('confirm-close-title'),
        secondaryButton: { label: t('no') },
        primaryButton: {
          label: t('yes'),
          onClick: () => router.push('/user/closed'),
        },
      });
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (searchParams.has('done')) return null;

  return (
    <Layout
      config={EmptyConfig}
      onClose={confirmClose}
      variant={variant || undefined}
    >
      {notification ? (
        <Notification
          title={notification.title}
          subtitle={notification.subtitle}
        />
      ) : (
        <UserMachineProvider args={{ authToken }}>
          <UserRouter onDone={() => router.push('/user/done')} />
        </UserMachineProvider>
      )}
    </Layout>
  );
};

export default UserContainer;
